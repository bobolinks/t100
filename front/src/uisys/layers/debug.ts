import { Effector, EffectionPressline, RenderResult, Effection, Point, } from '../effector';

class EffectionFPS implements Effection {
  position: Point;
  frames: number;
  constructor(position?: Point) {
    this.position = position || {x: 0, y: 0};
    this.frames = 0;

    // fps test
    const loop = () => {
      this.frames++;
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }
  render(ctx: CanvasRenderingContext2D, delta: number, now: number) {
    const fps = ( this.frames * 1000 ) / ( delta );
    this.frames = 0;
    ctx.textAlign = 'left';
    ctx.fillText(`FPS: ${Math.floor(fps)}`, 0, 0);
    return RenderResult.none;
  }
};

export class LayerDebug extends Effector {
  effectionHappy: EffectionPressline;
  effectionClarity: EffectionPressline;
  constructor(convas: HTMLCanvasElement) {
    super(convas);

    const size = {
      width: this.canvas.width,
      height: this.canvas.height,
    };
    // mask
    this.addEffection({
      position: {
        x: 0, y: 0,
      },
      render(ctx: CanvasRenderingContext2D, now: number) {
        ctx.fillStyle = 'rgba(0.5, 1, 0.5, 0.3)';
        ctx.fillRect(0, 0, size.width, size.height);
        return RenderResult.none;
      }
    });

    this.effectionHappy = new EffectionPressline(
      'Happy', 0, 1,
      { width: this.canvas.width/2, height: 4},
      ['white', 'green', 'red'],
      { x: 10, y: 16},
      'left-right',
      true,
    );
    this.addEffection(this.effectionHappy);
    this.effectionClarity = new EffectionPressline(
      'Clarity', 0, 1,
      { width: this.canvas.width/2, height: 4},
      ['white', 'green', 'red'],
      { x: 10, y: 36},
      'left-right',
      true,
    );
    this.addEffection(this.effectionClarity);
    this.addEffection(new EffectionFPS({x: 10, y: 56}));
  }
  setHappyScore(value: number) {
    this.effectionHappy.setValue(value);
  }
  setClarityScore(value: number) {
    this.effectionClarity.setValue(value);
  }
}
