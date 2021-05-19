import voice from './voice';
import { Effector } from './effector';
import { Store, } from '../store';

export default {
  effector: null as any as Effector,
  async init(store: Store, videlElement: HTMLVideoElement, canvasMain: HTMLCanvasElement) {
    this.effector = new Effector(canvasMain);
  },

  start() {

  },

  stop() {

  }
}
