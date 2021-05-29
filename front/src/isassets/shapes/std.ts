import { Is } from '../../is/index';

export class ShapeText extends Is.Shape {
  size: Is.Size;
  text: string;
  animating?: {
    type: 'dancing';
    period: number;
    begin: number;
  };
  constructor(name: string, text: string, rect: Is.Rect, styles?: Is.CanvasStyles) {
    super(name, { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }, styles);
    this.text = text;
    this.size = { width: rect.width, height: rect.height };
  }
  render(ctx: CanvasRenderingContext2D, delta: number, now: number) {
    if (this.animating) {
    }
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.text, 0, 0);
    return Is.RenderResult.none;
  }
  setText(text: string) {
    this.text = text;
  }
  dance(period: number) {
    this.animating = {
      type: 'dancing',
      begin: Date.now(),
      period
    };
  }
}
