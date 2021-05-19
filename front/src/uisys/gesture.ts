import GestureEstimator from './handgesture/GestureEstimator';
import * as Gestures from './handgesture/gestures/index';

declare const handpose: any;

type GestureName = 'thumbs-up' | 'victory' | 'five' | 'fist' | 'none';

// configure gesture estimator
// add "✌🏻" and "👍" as sample gestures
const knownGestures = {
  'thumbs-up': {
    symbol: '👍',
    descriptor: Gestures.ThumbsUpGesture,
  },
  victory: {
    symbol: '✌🏻',
    descriptor: Gestures.VictoryGesture,
  },
  five: {
    symbol: '🖐',
    descriptor: Gestures.FiveGesture,
  },
  fist: {
    symbol: '✊',
    descriptor: Gestures.FistGesture,
  },
};

const landmarkColors = {
  thumb: 'red',
  indexFinger: 'blue',
  middleFinger: 'yellow',
  ringFinger: 'green',
  pinky: 'pink',
  palmBase: 'white'
};

export type Point = {
  x: number;
  y: number;
};

export type GestureResult = {
  score: number;
  center: Point;
  name: GestureName;
  action?: 'swipe-left' | 'swipe-right' | 'reset' | 'ok' | 'standby',
};

export default {
  element: null as unknown as HTMLVideoElement,
  canvas: null as unknown as HTMLCanvasElement,
  model: null as any,
  estimator: null as unknown as GestureEstimator,
  tracker: null as unknown as GestureResult,
  async init(videlElement: HTMLVideoElement, canvas: HTMLCanvasElement) {
    this.element = videlElement;
    this.canvas = canvas;
    this.model = await handpose.load();
    this.estimator = new GestureEstimator(Object.values(knownGestures));
  },
  async tick(now: number) {
    // get hand landmarks from video
    // Note: Handpose currently only detects one hand at a time
    // Therefore the maximum number of predictions is 1
    const predictions = await this.model.estimateHands(this.element, true);

    const ctx = this.canvas.getContext("2d");

    if (!ctx) {
      throw 'invalid context';
    }
    // clear canvas effect
    ctx.clearRect(0, 0, this.element.width, this.element.height);

    const rs: GestureResult = { score: -1, name: 'none', center: { x: 0, y: 0 } };
    for (let i = 0; i < predictions.length; i++) {
      const pt = { x: 0, y: 0 };
      let ptCount = 0;

      // draw colored dots at each predicted joint position
      for (let part in predictions[i].annotations) {
        for (let point of predictions[i].annotations[part]) {
          pt.x += point[0];
          pt.y += point[1];
          ptCount++;
        }
      }
      if (ptCount) {
        pt.x = pt.x / ptCount;
        pt.y = pt.y / ptCount;
      }

      // now estimate gestures based on landmarks
      // using a minimum confidence of 7.5 (out of 10)
      const est = this.estimator.estimate(predictions[i].landmarks, 7.5);

      if (est.gestures.length > 0) {
        // find gesture with highest confidence
        let result = est.gestures.reduce((p, c) => {
          return (p.confidence > c.confidence) ? p : c;
        });
        if (result.confidence > rs.score) {
          rs.score = result.confidence;
          rs.name = result.name;
          rs.center = pt;
        }
      }
    }
    if (this.tracker) {
      if (rs.name === 'five') {
        const delta = rs.center.x - this.tracker.center.x;
        const limit = this.element.width / 4;
        if (delta <= -limit) {
          rs.action = 'swipe-left';
          this.tracker = null as unknown as GestureResult;
        } else if (delta >= -limit) {
          rs.action = 'swipe-right';
          this.tracker = null as unknown as GestureResult;
        }
      } else if (rs.name === 'fist') {
        rs.action = 'reset';
        this.tracker = null as unknown as GestureResult;
      }
    } else {
      if (rs.name === 'five') {
        rs.action = 'standby';
        this.tracker = rs;
      } else if (rs.name === 'thumbs-up') {
        rs.action = 'ok';
        this.tracker = null as unknown as GestureResult;
      }
    }
    return rs;
  }
}
