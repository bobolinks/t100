import { markRaw } from 'vue';
import * as face from 'face-api.js';
import { State, Store, options, Snapshot, filters } from '../store';
// import gesture from './handgesture/index';
import { LayerMain } from './layers/main';
import { LayerDebug } from './layers/debug';
import { ImageUtils } from '../util/image';
import { rpc } from '../rpc';

const log = function (...args: any[]) {
  return console.log.apply(
      console,
      ['['+new Date().toISOString().slice(11,-5)+']'].concat(
          Array.prototype.slice.call(arguments)
      )
  );
};

declare const cv: any;

// tiny_face_detector options
const inputSize = 512;
const scoreThreshold = 0.5;

type Result = face.WithFaceExpressions<{
  detection: face.FaceDetection;
}>;

interface StateAction {
  tick: number;
  timer: NodeJS.Timeout | undefined;
  start(action: StateAction): void;
  excute(action: StateAction, tick: number): void;
}

interface StateActionWaiting extends StateAction {
  tickMatch: number;
  tickMatchFirst: number;
  faceMatcher: face.FaceMatcher | undefined,
}

interface StateActionTracking extends StateActionWaiting {
  tickSnapshot: number;
  bestScore: number;
}

export default {
  store: null as unknown as Store,
  element: null as unknown as HTMLVideoElement,
  snapshotCanvas: null as unknown as HTMLCanvasElement,
  layers: {
    main: null as unknown as LayerMain,
    debug: null as unknown as LayerDebug,
  },
  options: {} as unknown as face.ITinyYolov2Options,
  paused: false,
  currentAction: null as unknown as StateAction,
  actions: {} as Record<State, StateAction>,
  capture: null as any,
  vframe: null as any,
  fps: 30,
  loopLocked: false,
  snapshot: '',
  analizeTick: 0,

  async init(store: Store, videlElement: HTMLVideoElement, canvasMain: HTMLCanvasElement, canvasPrint: HTMLCanvasElement, canvasDebug: HTMLCanvasElement) {
    this.store = store;
    this.element = videlElement;
    this.snapshotCanvas = document.createElement('canvas');
    this.snapshotCanvas.width = this.element.width;
    this.snapshotCanvas.height = this.element.height;

    // prepare internal logic
    for (const iterator of ['detecting', 'waiting', 'tracking', 'printing']) {
      const name = iterator.replace(/^(.)/, ($0) => $0.toLocaleUpperCase());
      (this.actions as any)[iterator] = {
        tick: 0,
        start: (this as any)[`start${name}`],
        excute: (this as any)[`on${name}`],
      };
    }

    // prepare env
    this.store.sysinfo.devices = (await navigator.mediaDevices.enumerateDevices()).filter(e => e.kind === 'videoinput') as any;
    this.capture = new cv.VideoCapture(videlElement);
    this.fps = options.fps;
    const resl = store.sysinfo.resolutions[options.resolution];
    this.vframe = new cv.Mat(resl.height, resl.width, cv.CV_8UC4);

    // prepare ai models
    await face.loadFaceRecognitionModel('/models/weights');
    await face.loadTinyFaceDetectorModel('/models/weights');
    await face.loadFaceExpressionModel('/models/weights');
    await face.nets.tinyFaceDetector.load('/models/weights');
    this.options = new face.TinyFaceDetectorOptions({ inputSize, scoreThreshold });

    // try {
    //   await gesture.init(videlElement, effectLayer);
    // } catch(e) {
    //   console.error(e);
    // }

    // prepare effections
    this.layers.main = new LayerMain(canvasMain, options.thresholds.snapshoted);
    this.layers.debug = new LayerDebug(canvasDebug);

    // now start camera
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: store.profile.device,
        aspectRatio: {
          exact: resl.width / resl.height
        },
        height: {
          ideal: resl.height,
        }
      }
    });
    videlElement.srcObject = stream;
  },

  async restart() {
    this.startAction('detecting');
    this.paused = false;
    this.runloop().finally(() => {
      this.loopLocked = false;
    });
  },

  async pause() {
    this.paused = true;
  },

  async runloop() {
    if (this.loopLocked) {
      return;
    }
    this.loopLocked = true;
    const tick = Date.now();
    if ((tick - this.analizeTick) >= options.thresholds.analizeInterval) {
      this.analizeTick = tick;
      try {
        await this.currentAction.excute.call(this, this.currentAction, tick);
      } catch(e) {
        console.error(e);
        return;
      }
    }
    Object.values(this.layers).forEach(e => e.redraw());
    if (this.paused) {
      return;
    }
    // schedule the next one.
    const delay = 1000 / this.fps - (Date.now() - tick);
    setTimeout(() => {
      this.runloop().finally(()=> {
        this.loopLocked = false;
      });
    }, delay);
  },

  startAction(state: State) {
    if (this.currentAction?.timer) {
      clearTimeout(this.currentAction.timer);
      this.currentAction.timer = undefined as any;
    }
    log('startAction', state);
    this.store.state = state;
    this.currentAction = this.actions[state];
    this.currentAction.start.call(this, this.currentAction);
  },

  startDetecting(action: StateAction) {
    action.tick = Date.now();
    this.layers.main.startDetecting();
    (new Audio("assets/audio/scan.mp3")).play();
  },
  async onDetecting(action: StateAction, tick: number) {
    const result = await face.detectSingleFace(this.element, this.options as any).withFaceExpressions();
    if (!result) {
      return;
    }

    const recScore = result.detection.score || 0;
    if (recScore < options.thresholds.face) {
      return;
    }
    (new Audio("assets/audio/done.mp3")).play();
    this.startAction('waiting');
  },

  startWaiting(action: StateActionWaiting) {
    action.tick = Date.now();
    action.tickMatch = 0;
    action.tickMatchFirst = 0;
    action.faceMatcher = undefined;
    this.layers.main.startWaiting();
    action.timer = setTimeout( () => {
      action.timer = undefined;
      if (action.faceMatcher) {
        this.startAction('tracking');
      } else {
        this.startAction('detecting');
      }
    }, 3000);
  },
  async onWaiting(action: StateActionWaiting, tick: number) {
    const result = await face.detectSingleFace(this.element, this.options as any).withFaceExpressions();
    if (!result) {
      return;
    }

    let matchScore = 0.0;
    const descriptor = await face.computeFaceDescriptor(this.element);
    if (!action.faceMatcher) {
      action.faceMatcher = new face.FaceMatcher(descriptor);
      // move to tail of the code block
      action.tickMatch = tick;
      action.tickMatchFirst = tick;
      matchScore = 1.0;
    } else {
      const bestMatch = action.faceMatcher.matchDescriptor(descriptor as any);
      matchScore = bestMatch.distance;
    }
    const tickDeltaMatch = tick - action.tickMatch;
    if (matchScore < options.thresholds.match) {
      if (tickDeltaMatch >= options.thresholds.matchLost) {
        // reset state
        this.startAction('detecting');
      }
      return;
    }
  },

  startTracking(action: StateActionTracking) {
    action.tick = Date.now();
    action.tickSnapshot = 0;
    action.tickMatch = (this.actions.waiting as StateActionWaiting).tickMatch;
    action.tickMatchFirst = (this.actions.waiting as StateActionWaiting).tickMatchFirst;
    action.bestScore = 0.0;
    action.faceMatcher = (this.actions.waiting as StateActionWaiting).faceMatcher;
    if (this.store.bestSnapshot) {
      this.store.bestSnapshot.image.delete();
      this.store.bestSnapshot = null as unknown as Snapshot;
    }
    this.layers.main.startTracking();
    (new Audio("assets/audio/kaka.mp3")).play();
    // setTimeout( () => {
    // }, 500);
     action.timer = setTimeout( () => {
      action.timer = undefined;
      if (this.store.bestSnapshot) {
        // (new Audio("assets/audio/shot.mp3")).play();
        this.startAction('printing');
      } else {
        // (new Audio("assets/audio/fail.mp3")).play();
        this.layers.main.startRestart();
        action.timer = setTimeout( () => {
          action.timer = undefined;
          this.startAction('detecting');
        }, 5000);
      }
    }, options.thresholds.snapshoted);
  },
  async onTracking(action: StateActionTracking, tick: number) {
    const tickDelta = tick - action.tickSnapshot;
    if (tickDelta < options.thresholds.snapshotDelay) {
      return;
    }

    const result = await face.detectSingleFace(this.element, this.options as any).withFaceExpressions();
    if (!result) {
      return;
    }

    const recScore = result.detection.score || 0;
    // this.effector.setText('class', `${recScore.toFixed(2)} : class`);
    if (recScore < options.thresholds.faceShoting) {
      return;
    }
    let expScore = result.expressions.happy || 0;
    // this.effector.setText('happy', `${expScore.toFixed(2)} : happy`);
    this.layers.debug.setHappyScore(expScore);
    if (expScore < options.thresholds.happy) {
      return;
    }
    this.capture.read(this.vframe);
    // cv.flip(frame, frame, +1);
    const clarity = ImageUtils.calcClarity(this.vframe);
    // this.effector.setText('clarity', `${clarity.toFixed(2)} : clarity`);
    this.layers.debug.setClarityScore(clarity);
    if (clarity < options.thresholds.clarity) {
      return;
    }

    let matchScore = 0.0;
    const descriptor = await face.computeFaceDescriptor(this.element);
    if (!action.faceMatcher) {
      action.faceMatcher = new face.FaceMatcher(descriptor);
      // move to tail of the code block
      // action.tickMatch = tick;
      // action.tickMatchFirst = tick;
      matchScore = 1.0;
    } else {
      const bestMatch = action.faceMatcher.matchDescriptor(descriptor as any);
      matchScore = bestMatch.distance;
    }
    if (matchScore < options.thresholds.match) {
      return;
    }

    // const mat = this.faceBeautify(this.vframe, 3, 2);
    const mat = new cv.Mat(this.vframe);

    // update tick again
    tick = Date.now();

    action.tickMatch = tick;
    action.tickSnapshot = tick;
    if (expScore > action.bestScore) {
      const snapshot: Snapshot = {
        clarity,
        score: expScore,
        match: matchScore,
        image: markRaw(mat),
      };

      action.bestScore = expScore;
      if (this.store.bestSnapshot) {
        this.store.bestSnapshot.image.delete();
      } else {
        action.tickMatch = tick;
        action.tickMatchFirst = tick;
      }
      this.store.bestSnapshot = snapshot;
      // (new Audio("assets/audio/ding.mp3")).play();
    }
  },

  startPrinting(action: StateAction) {
    const image = ImageUtils.imageBeautify(this.store.bestSnapshot.image, filters.beautify.props);
    cv.flip(image, image, 1);
    this.store.bestSnapshot.image.delete();
    this.store.bestSnapshot.image = markRaw(image);
    cv.imshow(this.snapshotCanvas, image);
    const oriScore = Math.min(this.store.bestSnapshot.score, 1);
    const oriClarity = this.store.bestSnapshot.clarity;
    const scoreHead = Math.floor(oriScore * 100.0);
    const scoreTail = oriScore * 100.0 - scoreHead;

    let score = 0;
    if (scoreHead >= 50) {
      score = 70 + Math.round((scoreHead - 50) / 50 * 15);
    } else {
      score = 70;
    }
    score += Math.ceil(scoreTail * 10) + Math.min(Math.round(oriClarity), 3) + Math.round(Math.random() * 3);
    // 总共101分，多出1分上限给随机数，这样可以多一点满分
    score = Math.min(score, 100);
    console.log(`oriScore:${oriScore},head:${scoreHead},tail:${scoreTail},score:${score}`);
    const section = Math.floor((score - 70)/10.01);
    const tips = options.tips[section];
    const tip = tips[score % tips.length];
    const imageData = this.layers.main.startPrinting(this.snapshotCanvas, score, tip, options.framePadding);
    this.snapshot = imageData;
    rpc.request('album.print', imageData).then(e => {
      console.log(e);
    });
    action.tick = Date.now();
    action.timer = setTimeout( () => {
      action.timer = undefined;
      this.startAction('detecting');
    }, 20000);
  },
  async onPrinting(action: StateAction, tick: number) {
    return;
    /*
    const result = await this.gesture.detect();
    if (result) {
      if (result.name === 'five') {
        const tickDelta = tick - action.tickAct;
        if (tickDelta < options.thresholds.actionDelay) {
          return;
        }
        action.tickAct = tick;
        this.startAction('detecting');
      }
      log(result);
    }
    */
  },
};
