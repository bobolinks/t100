const H5Image = Image;

/** interative script */
export namespace Is {
  export type Point = {
    x: number;
    y: number;
  };

  export type Size = {
    width: number;
    height: number;
  };

  export type Rect = {
    left: number;
    top: number;
    width: number;
    height: number;
  };

  export enum RenderResult {
    none = 0,
    disappear = 1,
    clone = 2,
  };

  export interface Styles extends Partial<CanvasTextDrawingStyles>, Partial<CanvasShadowStyles> {
    fillStyle?: string | CanvasGradient | CanvasPattern;
    strokeStyle?: string | CanvasGradient | CanvasPattern;
  }

  export interface Any {
    position: Point;
    quality?: boolean;
    velocity?: Point;
    style?: Styles;
    render(ctx: CanvasRenderingContext2D, delta: number, now?: number): RenderResult;
    clone?(): Any;
    destroyed?(): void;
  }

  namespace Shapes {
    export class Rectangle implements Any {
      position: Point;
      size: Size;
      style: Styles;
      constructor(rect: Rect, options?: Styles) {
        this.position = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        this.size = { width: rect.width, height: rect.height };
        this.style = options || {};
      }
      render(ctx: CanvasRenderingContext2D, delta: number, now: number) {
        ctx.fillRect(-this.size.width / 2, -this.size.height / 2, this.size.width, this.size.height);
        return RenderResult.none;
      }
    }

    export class Text implements Any {
      position: Point;
      size: Size;
      text: string;
      style: Styles;
      constructor(text: string, rect: Rect, style?: Styles) {
        this.position = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        this.size = { width: rect.width, height: rect.height };
        this.text = text;
        this.style = style || {};
      }
      render(ctx: CanvasRenderingContext2D, delta: number, now: number) {
        if (this.style.textAlign === 'center') {
          ctx.fillText(this.text, 0, 0);
        } else if (this.style.textAlign === 'left') {
          ctx.fillText(this.text, -this.size.width / 2, 0);
        } else if (this.style.textAlign === 'right') {
          ctx.fillText(this.text, this.size.width / 2, 0);
        } else {
          // we don't care it anymore
          ctx.fillText(this.text, 0, 0);
        }
        return RenderResult.none;
      }
      setText(text: string) {
        this.text = text;
      }
    }

    export class Image implements Any {
      position: Point;
      size: Size;
      image: CanvasImageSource | undefined;
      constructor(image: CanvasImageSource | undefined, rect: Rect) {
        this.position = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        this.size = { width: rect.width, height: rect.height };
        this.image = image;
      }
      render(ctx: CanvasRenderingContext2D, delta: number, now: number) {
        if (this.image) {
          ctx.drawImage(this.image, -this.size.width / 2, -this.size.height / 2);
        }
        return RenderResult.none;
      }
      setImage(image: CanvasImageSource | undefined) {
        this.image = image;
      }
    }

    export class ImageAni implements Any {
      position: Point;
      size: Size;
      from: Point;
      expired: number;
      miliseconds: number;
      image: HTMLImageElement;
      constructor(image: HTMLImageElement, rect: Rect, from: Point, duration: number) {
        this.position = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        this.size = { width: rect.width, height: rect.height };
        this.from = from;
        this.miliseconds = duration;
        this.expired = Date.now() + duration;
        this.image = image;
      }
      render(ctx: CanvasRenderingContext2D, delta: number, now: number) {
        const diff = now - this.expired;
        if (diff >= 0) {
          ctx.drawImage(this.image, -this.size.width / 2, -this.size.height / 2)
        } else {
          const percent = -diff / this.miliseconds;
          const offsetX = (this.from.x - this.position.x) * percent;
          const offsetY = (this.from.y - this.position.y) * percent;
          ctx.drawImage(this.image, -this.size.width / 2 + offsetX, -this.size.height / 2 + offsetY);
        }
        return RenderResult.none;
      }
      resetTime(expired?: number) {
        this.expired = expired || (Date.now() + this.miliseconds);
      }
    }

    export class Gif implements Any {
      position: Point;
      size: Size;
      imgCount: number;
      begin: number;
      miliseconds: number;
      image: HTMLImageElement;
      repeated: boolean;
      from?: Point;
      constructor(image: HTMLImageElement, rect: Rect, imgCount: number, duration: number, repeated?: boolean, from?: Point) {
        this.position = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        this.size = { width: rect.width, height: rect.height };
        this.imgCount = imgCount;
        this.miliseconds = duration;
        this.begin = Date.now();
        this.image = image;
        this.repeated = typeof repeated === 'undefined' ? true : repeated;
        this.from = from;
      }
      render(ctx: CanvasRenderingContext2D, delta: number, now: number) {
        const imgWidth = this.image.width / this.imgCount;
        const diff = now - this.begin;
        const percent = (diff % this.miliseconds) / this.miliseconds;
        const index = Math.floor(this.imgCount * percent);
        if (!this.repeated && diff >= this.miliseconds) {
          ctx.drawImage(this.image, index * imgWidth, 0, imgWidth, this.image.height, -this.size.width / 2, -this.size.height / 2, this.size.width, this.size.height);
        } else {
          // ctx.drawImage(this.image, this.image.width - imgWidth, 0, imgWidth, this.image.height, -this.size.width/2, -this.size.height/2, this.size.width, this.size.height);
          const offsetX = this.from ? (this.from.x - this.position.x) * (1 - percent) : 0;
          const offsetY = this.from ? (this.from.y - this.position.y) * (1 - percent) : 0;
          ctx.drawImage(this.image, index * imgWidth, 0, imgWidth, this.image.height, -this.size.width / 2 + offsetX, -this.size.height / 2 + offsetY, this.size.width, this.size.height);
        }
        return RenderResult.none;
      }
      resetTime() {
        this.begin = Date.now();
      }
    }

    export class CountDown implements Any {
      position: Point;
      expired: number;
      seconds: number;
      animate: boolean;
      style: Styles;
      constructor(seconds: number, position?: Point, animate?: boolean, style?: Styles) {
        this.position = position || { x: 0, y: 0 };
        this.expired = Date.now() + seconds * 1000;
        this.seconds = seconds;
        this.style = style || {};
        this.animate = typeof animate === 'undefined' ? true : animate;
      }
      render(ctx: CanvasRenderingContext2D, delta: number, now: number) {
        const left = this.expired - now;
        if (left <= 0) {
          return RenderResult.disappear;
        }
        const leftSeconds = left / 1000;
        const leftSecondsInt = Math.ceil(leftSeconds);
        const leftMisc = left % 1000;
        const leftMiscPercent = this.animate ? (leftMisc >= 700 ? 1 : (leftMisc / 700)) : 1;
        const scale = (1 + leftMiscPercent);
        ctx.scale(scale, scale);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(leftSecondsInt.toString(), 0, 0);
        return RenderResult.none;
      }
      resetTime() {
        this.expired = Date.now() + this.seconds * 1000;
      }
      setTimeout(seconds: number) {
        this.seconds = seconds;
        this.expired = Date.now() + this.seconds * 1000;
      }
      setAnimate(value: boolean) {
        this.animate = value;
      }
    }
  };

  export class Screen {
    ticks: {
      begin: number;
      last: number;
    };
    canvas: HTMLCanvasElement;
    shapes: Array<Any>;
    acceleration: Point;
    scale: number;
    constructor(canvas: HTMLCanvasElement, acceleration?: Point, scale?: number) {
      const now = Date.now();
      this.ticks = {
        begin: now,
        last: now,
      };
      this.canvas = canvas;
      this.shapes = [];
      this.acceleration = acceleration || { y: -9.8, x: 0 };
      this.scale = scale || 1;
    }
    addShape(shape: Any) {
      this.shapes.push(shape);
    }
    removeShape(shape: Any) {
      const index = this.shapes.indexOf(shape);
      if (index !== -1) {
        this.shapes.splice(index, 1);
      }
    }
    redraw() {
      const now = Date.now();
      const delta = now - this.ticks.last;

      if (delta <= 0) {
        return;
      }

      const ctx = this.canvas.getContext('2d');
      if (!ctx) {
        return;
      }
      const width = this.canvas.width;
      const height = this.canvas.height;

      // reset current transformation matrix to the identity matrix
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      // clear background
      ctx.clearRect(0, 0, width, height);

      // draw elements
      const disappears: Array<Any> = [];
      const clones: Array<Any> = [];
      for (const it of this.shapes) {
        if (it.quality && it.velocity) {
          const deltaX = it.velocity.x * delta + this.acceleration.x * Math.pow(delta, 2) / 2;
          const deltaY = it.velocity.y * delta + this.acceleration.y * Math.pow(delta, 2) / 2;
          it.velocity.x += this.acceleration.x * delta;
          it.velocity.y += this.acceleration.y * delta;
          it.position.x += deltaX;
          it.position.y += deltaY;
        }
        // reset matrix with user's scale value and position
        ctx.setTransform(this.scale, 0, 0, this.scale, it.position.x, it.position.y);
        ctx.save();
        for (const [key, value] of Object.entries(it.style || {})) {
          (ctx as any)[key] = value;
        }
        const rs = it.render.call(it, ctx, delta, now);
        ctx.restore();
        if (rs === RenderResult.disappear) {
          disappears.push(it);
        } else if (rs === RenderResult.clone) {
          if (!it.clone) {
            throw 'clone undefined';
          }
          clones.push(it.clone());
        }
      }
      disappears.forEach(e => {
        this.shapes.splice(this.shapes.indexOf(e), 1);
        e.destroyed?.call(e);
      });
      clones.forEach(e => this.shapes.push(e));

      this.ticks.last = now;
    }
  };
}
