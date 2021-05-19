import { Store, options } from '../store';
import { Module } from './types';

export default {
  store: null as unknown as Store,
  element: null as unknown as HTMLVideoElement,
  fps: 30,
  paused: false,
  loopLocked: false,
  modules: [] as Array<Module>,

  async init(store: Store, videlElement: HTMLVideoElement) {
    this.store = store;
    this.element = videlElement;

    // prepare env
    this.store.sysinfo.devices = (await navigator.mediaDevices.enumerateDevices()).filter(e => e.kind === 'videoinput') as any;
    this.fps = options.fps;

    const resl = store.sysinfo.resolutions[options.resolution];

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
    if (this.paused) {
      return;
    }
    this.modules.forEach(e => e.tick(tick));
    // schedule the next one.
    const delay = 1000 / this.fps - (Date.now() - tick);
    setTimeout(() => {
      this.runloop().finally(() => {
        this.loopLocked = false;
      });
    }, delay);
  },

  addModule(module: Module) {
    this.modules.push(module);
  }
};
