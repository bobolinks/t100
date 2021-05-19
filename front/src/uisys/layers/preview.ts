import { Effector, RenderResult, Effection, EffectionImage } from '../effector';

export class LayerPreview extends Effector {
  images: Record<string, HTMLImageElement>;
  constructor(convas: HTMLCanvasElement) {
    super(convas);
    // prepare images, preload in pages/index.vue, sotre in assets/images/
    this.images = {};
    const images = document.querySelectorAll('#images img');
    images.forEach(img => {
      const rs = (img as HTMLImageElement).src.match(/assets\/images\/([^/]+)\.(webp|png|jpeg|gif|bmp|svg)/);
      if (!rs) {
        return;
      }
      this.images[rs[1]] = img as HTMLImageElement;
    });
    this.addEffection( new EffectionImage(this.images.bg, {left: 0, top: 0, width: this.canvas.width, height: this.canvas.height}) );
  }
}
