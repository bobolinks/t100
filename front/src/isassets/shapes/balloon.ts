import { Is } from '../../is/index';

const rad = (Math.PI / 180);
const kappa = 0.5522847498;

function createBalloonPath(radius: number): Path2D {
  var or = radius * kappa; // offset
  const R = 1.4 * radius;

  var p1 = {
    x: 0 - radius,
    y: 0
  }
  var pc11 = {
    x: p1.x,
    y: p1.y + or
  }
  var pc12 = {
    x: p1.x,
    y: p1.y - or
  }

  var p2 = {
    x: 0,
    y: 0 - radius
  }
  var pc21 = {
    x: 0 - or,
    y: p2.y
  }
  var pc22 = {
    x: 0 + or,
    y: p2.y
  }

  var p3 = {
    x: 0 + radius,
    y: 0
  }
  var pc31 = {
    x: p3.x,
    y: p3.y - or
  }
  var pc32 = {
    x: p3.x,
    y: p3.y + or
  }

  var p4 = {
    x: 0,
    y: 0 + R
  };
  var pc41 = {
    x: p4.x + or,
    y: p4.y
  }
  var pc42 = {
    x: p4.x - or,
    y: p4.y
  }

  const t1 = {
    x: p4.x + .2 * radius * Math.cos(70 * rad),
    y: p4.y + .2 * radius * Math.sin(70 * rad)
  }
  const t2 = {
    x: p4.x + .2 * radius * Math.cos(110 * rad),
    y: p4.y + .2 * radius * Math.sin(110 * rad)
  }

  return new Path2D([
    `M${p4.x} ${p4.y}`,
    `C${pc42.x} ${pc42.y} ${pc11.x} ${pc11.y} ${p1.x} ${p1.y}`,
    `C${pc12.x} ${pc12.y} ${pc21.x} ${pc21.y} ${p2.x} ${p2.y}`,
    `C${pc22.x} ${pc22.y} ${pc31.x} ${pc31.y} ${p3.x} ${p3.y}`,
    `C${pc32.x} ${pc32.y} ${pc41.x} ${pc41.y} ${p4.x} ${p4.y}`,
    `L${t1.x} ${t1.y}`,
    `L${t2.x} ${t2.y}`,
  ].join(' '));
}

function createFillStyle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, hue: number) {
  const grd = ctx.createRadialGradient(x - .5 * r, y - 1.7 * r, 0, x - .5 * r, y - 1.7 * r, r);
  grd.addColorStop(0, 'hsla(' + hue + ',100%,65%,.95)');
  grd.addColorStop(0.4, 'hsla(' + hue + ',100%,45%,.85)');
  grd.addColorStop(1, 'hsla(' + hue + ',100%,25%,.80)');
  return grd;
}

export class ShapeBalloon extends Is.Shape {
  radius: number;
  hue: number;
  path: Path2D;
  constructor(name: string, radius: number, hue: number, point: Is.Vector) {
    super(name, point, undefined, {
      force: new Is.Vector(0, -0.1),
      quality: 0.01,
      velocity: new Is.Vector(),
    });
    this.radius = radius;
    this.path = createBalloonPath(radius);
    this.hue = hue;
  }
  render(ctx: CanvasRenderingContext2D, delta: number, now: number) {
    if (this.position.y >= ctx.canvas.height || this.position.y < 0) {
      return Is.RenderResult.disappear;
    }
    ctx.fillStyle = createFillStyle(ctx, this.position.x, this.position.y, this.radius, this.hue);
    ctx.fill(this.path);
    return Is.RenderResult.none;
  }
}
