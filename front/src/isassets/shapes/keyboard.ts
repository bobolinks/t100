import { Is } from '../../is/index';

export class ShapeKey extends Is.Shape {
  size: Is.Size;
  values: [string, string?];
  side: 'left' | 'right';
  animating: 'shining' | 'zooming' | undefined;
  animatingPeriod?: number;
  animatingBegin?: number;
  animatingTarget?: Is.Point;
  animatingScale?: number;
  constructor(values: [string, string?], side: 'left' | 'right', rect: Is.Rect, styles?: Is.CanvasStyles) {
    super(values[0], { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }, styles);
    this.values = values;
    this.size = { width: rect.width, height: rect.height };
    this.side = side;
  }
  render(ctx: CanvasRenderingContext2D, delta: number, now: number) {
    // Shadow
    ctx.shadowColor = 'gray';
    ctx.shadowBlur = 4;

    if (this.animating) {
      this.position.z = 1;
      const eslapsed = now - (this.animatingBegin || now);
      const left = (this.animatingPeriod || 0) - eslapsed;
      if (left > 0) {
        if (this.animating === 'shining') {
          const percent = Is.AnimationFunctions.easeInOutQuad(eslapsed, 0, 1, this.animatingPeriod || 0);
          // Shadow
          ctx.shadowColor = 'red';
          ctx.shadowBlur = 4 * percent;
        } else {
          const x = Is.AnimationFunctions.easeInOuth3h(eslapsed, this.position.x, this.animatingTarget?.x || this.position.x, this.animatingPeriod || 0);
          const y = Is.AnimationFunctions.easeInOuth3h(eslapsed, this.position.y, this.animatingTarget?.y || this.position.y, this.animatingPeriod || 0);
          ctx.translate(x - this.position.x, y - this.position.y);
          const scale = Is.AnimationFunctions.easeInOuth3h(eslapsed, 1, this.animatingScale || 1, this.animatingPeriod || 0);
          ctx.scale(scale, scale);
        }
      } else {
        this.position.z = 0;
        this.animating = undefined;
      }
    }

    ctx.fillStyle = '#f8f8f8';
    ctx.strokeStyle = '#e2e2e2';
    ctx.lineWidth = 1;
    Is.Elements.Canvas.roundRect(ctx, -this.size.width / 2, -this.size.height / 2, this.size.width, this.size.height, this.size.height * 0.1, true, true);

    ctx.shadowBlur = 0;
    ctx.fillStyle = this.styles?.fillStyle || 'black';
    if (this.values.length === 1) {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.values[0], 0, 0);
    } else if (this.values.join('').length === 2) {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.values[0], 0, this.size.height / 4);
      ctx.fillText(this.values[1] || '', 0, -this.size.height / 4);
    } else if (this.side === 'left') {
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText(this.values[0], -(this.size.width * 4.5 / 10), (this.size.height * 4.5 / 10));
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(this.values[1] || '', -(this.size.width * 4.5 / 10), -(this.size.height * 4.5 / 10));
    } else {
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText(this.values[0], (this.size.width * 4.5 / 10), (this.size.height * 4.5 / 10));
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      ctx.fillText(this.values[1] || '', (this.size.width * 4.5 / 10), -(this.size.height * 4.5 / 10));
    }

    return Is.RenderResult.none;
  }
  shine(period: number) {
    this.animating = 'shining';
    this.animatingBegin = Date.now();
    this.animatingPeriod = period;
  }
  zoom(period: number, point: Is.Point, scale: number) {
    this.animating = 'zooming';
    this.animatingBegin = Date.now();
    this.animatingPeriod = period;
    this.animatingTarget = point;
    this.animatingScale = scale;
  }
}

