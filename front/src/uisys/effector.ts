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

interface Colors extends Array<string> {
  0: string;
  1: string;
  2: string;
};

export type TextAlign = 'left-top' | 'left-bottom' | 'right-top' | 'right-bottom';
export enum RenderResult {
  none = 0,
  disappear = 1,
  clone = 2,
};

declare type CvMat = any;

const defaultFontSize = 32;
const padding = 16;
const fontColor = '#fff';

export interface EffectionStyles extends Partial<CanvasTextDrawingStyles>, Partial<CanvasShadowStyles> {
  fillStyle?: string | CanvasGradient | CanvasPattern;
  strokeStyle?: string | CanvasGradient | CanvasPattern;
}

export interface Effection {
  position: Point;
  quality?: boolean;
  velocity?: Point;
  styles?: EffectionStyles;
  render(ctx: CanvasRenderingContext2D, delta: number, now?: number): RenderResult;
  clone?(): Effection;
  destroyed?(): void;
}

function substringWithWidth(text: string, ctx: CanvasRenderingContext2D, width: number) {
  let metrics = ctx.measureText(text);
  if (metrics.width <= width) {
    return text;
  } else {
    // cut down
    let pos = 0;
    let widthSum = 0;
    for( ; pos < text.length; pos++) {
      metrics = ctx.measureText(text[pos]);
      widthSum += metrics.width;
      if (widthSum >= width) {
        break;
      }
    }
    return text.substring(0, pos);
  }
}

export class EffectionRectangle implements Effection {
  position: Point;
  size: Size;
  styles: EffectionStyles;
  constructor(rect: Rect, options?: EffectionStyles) {
    this.position = { x: rect.left + rect.width/2, y: rect.top + rect.height/2 };
    this.size = {width: rect.width, height: rect.height};
    this.styles = options || {};
  }
  render(ctx: CanvasRenderingContext2D, delta: number, now: number) {
    ctx.fillRect(-this.size.width/2, -this.size.height/2, this.size.width, this.size.height);
    return RenderResult.none;
  }
}

export class EffectionText implements Effection {
  position: Point;
  size: Size;
  lineHeight: number;
  text: string;
  styles: EffectionStyles;
  constructor(text: string, rect: Rect, lineHeight?: number, options?: EffectionStyles) {
    this.position = { x: rect.left + rect.width/2, y: rect.top + rect.height/2 };
    this.size = {width: rect.width, height: rect.height};
    this.text = text;
    this.lineHeight = lineHeight || 1;
    this.styles = options || {};
  }
  render(ctx: CanvasRenderingContext2D, delta: number, now: number) {
    const fontSize = ctx.measureText('M');
    const lineHeight = (fontSize.fontBoundingBoxAscent + fontSize.fontBoundingBoxDescent) * this.lineHeight;
    const lines = [];
    // only work for ch-zn
    const blocks = this.text.split('\n');
    for (const it of blocks) {
      const metrics = ctx.measureText(it);
      if (metrics.width <= this.size.width) {
        lines.push(it);
      } else {
        let textLeft = it;
        while(textLeft.length) {
          const line = substringWithWidth(textLeft, ctx, this.size.width);
          lines.push(line);
          textLeft = textLeft.substring(line.length);
        }
      }
    }

    if (lines.length === 1) {
      if (this.styles.textAlign === 'center') {
        ctx.fillText(this.text, 0, 0);
      } else if (this.styles.textAlign === 'left') {
        ctx.fillText(this.text, -this.size.width/2, 0);
      } else if (this.styles.textAlign === 'right') {
        ctx.fillText(this.text, this.size.width/2, 0);
      } else {
        // we don't care it anymore
        ctx.fillText(this.text, 0, 0);
      }
    } else {
      let x = -this.size.width/2;
      let y = -this.size.height/2;
      if (this.styles.textBaseline === 'middle') {
        y += lineHeight/2;
      }
      for (const line of lines) {
        ctx.fillText(line, x, y);
        y += lineHeight;
      }
    }
    return RenderResult.none;
  }
  setText(text: string) {
    this.text = text;
  }
}

export class EffectionImage implements Effection {
  position: Point;
  size: Size;
  image: CanvasImageSource | undefined;
  constructor(image: CanvasImageSource | undefined, rect: Rect) {
    this.position = { x: rect.left + rect.width/2, y: rect.top + rect.height/2 };
    this.size = {width: rect.width, height: rect.height};
    this.image = image;
  }
  render(ctx: CanvasRenderingContext2D, delta: number, now: number) {
    if (this.image) {
      ctx.drawImage(this.image, -this.size.width/2, -this.size.height/2);
    }
    return RenderResult.none;
  }
  setImage(image: CanvasImageSource | undefined) {
    this.image = image;
  }
}

export class EffectionImageWithAni implements Effection {
  position: Point;
  size: Size;
  from: Point;
  expired: number;
  miliseconds: number;
  image: HTMLImageElement;
  constructor(image: HTMLImageElement, rect: Rect, from: Point, duration: number) {
    this.position = { x: rect.left + rect.width/2, y: rect.top + rect.height/2 };
    this.size = {width: rect.width, height: rect.height};
    this.from = from;
    this.miliseconds = duration;
    this.expired = Date.now() + duration;
    this.image = image;
  }
  render(ctx: CanvasRenderingContext2D, delta: number, now: number) {
    const diff = now - this.expired;
    if (diff >= 0) {
      ctx.drawImage(this.image, -this.size.width/2, -this.size.height/2)
    } else {
      const percent = -diff / this.miliseconds;
      const offsetX = (this.from.x - this.position.x) * percent;
      const offsetY = (this.from.y - this.position.y) * percent;
      ctx.drawImage(this.image, -this.size.width/2 + offsetX, -this.size.height/2 + offsetY);
    }
    return RenderResult.none;
  }
  resetTime(expired?: number) {
    this.expired = expired || (Date.now() + this.miliseconds);
  }
}

export class EffectionGif implements Effection {
  position: Point;
  size: Size;
  imgCount: number;
  begin: number;
  miliseconds: number;
  image: HTMLImageElement;
  repeated: boolean;
  from?: Point;
  constructor(image: HTMLImageElement, rect: Rect, imgCount: number, duration: number, repeated?: boolean, from?: Point) {
    this.position = { x: rect.left + rect.width/2, y: rect.top + rect.height/2 };
    this.size = {width: rect.width, height: rect.height};
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
      ctx.drawImage(this.image, index * imgWidth, 0, imgWidth, this.image.height, -this.size.width/2, -this.size.height/2, this.size.width, this.size.height);
    } else {
      // ctx.drawImage(this.image, this.image.width - imgWidth, 0, imgWidth, this.image.height, -this.size.width/2, -this.size.height/2, this.size.width, this.size.height);
      const offsetX = this.from?(this.from.x - this.position.x) * (1-percent) : 0;
      const offsetY = this.from?(this.from.y - this.position.y) * (1-percent) : 0;
      ctx.drawImage(this.image, index * imgWidth, 0, imgWidth, this.image.height, -this.size.width/2 + offsetX, -this.size.height/2 + offsetY, this.size.width, this.size.height);
    }
    return RenderResult.none;
  }
  resetTime() {
    this.begin = Date.now();
  }
}

export class EffectionCountDown implements Effection {
  position: Point;
  fontSize: number;
  fontColor?: string;
  expired: number;
  seconds: number;
  animate: boolean;
  constructor(seconds: number, fontSize?: number, position?: Point, fontColor?: string, animate?: boolean) {
    this.position = position || { x: 0, y: 0 };
    this.expired = Date.now() + seconds * 1000;
    this.seconds = seconds;
    this.fontSize = fontSize || defaultFontSize;
    this.fontColor = fontColor;
    this.animate = typeof animate === 'undefined' ? true : animate;
  }
  render(ctx: CanvasRenderingContext2D, delta: number, now: number) {
    const left = this.expired - now;
    if (left <= 0) {
      return RenderResult.disappear;
    }
    const leftSeconds = left/1000;
    const leftSecondsInt = Math.ceil(leftSeconds);
    const leftMisc = left % 1000;
    const leftMiscPercent = this.animate ? (leftMisc >= 700 ? 1 : (leftMisc / 700)) : 1;
    const scale = (1 + leftMiscPercent) * (this.fontSize / defaultFontSize);
    ctx.scale(scale, scale);
    ctx.fillStyle = this.fontColor || 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // ctx.fillText(leftSecondsInt >= 1 ? leftSecondsInt.toString() : leftSeconds.toFixed(1), 0, 0);
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

export type Direction = 'left-right' | 'right-left' | 'top-bottom' | 'bottom-top';

export class EffectionPressline implements Effection {
  position: Point;
  quality: boolean;
  velocity: Point;
  name: string;
  max: number;
  limit: number;
  value: number;
  size: Size;
  colors: Colors;
  lastUpdate: number;
  gradient?: CanvasGradient;
  direction: Direction;
  showLabel: boolean;
  constructor(name: string, value: number, max: number, size: Size, colors: Colors, position?: Point, direction?: Direction, showLabel?: boolean) {
    this.position = position || { x: 0, y: 0 };
    this.quality = false;
    this.velocity = { x: 0, y: 0};
    this.name = name;
    this.value = value;
    this.max = Math.max(value, 0);
    this.limit = max;
    this.colors = colors;
    this.size = size;
    this.direction = direction || 'left-right';
    this.showLabel = showLabel || false;
    this.lastUpdate = 0;
  }
  render(ctx: CanvasRenderingContext2D, delta: number, now: number) {
    if(!this.gradient) {
      if (this.direction === 'bottom-top') {
        this.gradient = ctx.createLinearGradient(0, this.size.height, 0, 0);
      } else if (this.direction === 'top-bottom') {
        this.gradient = ctx.createLinearGradient(0, 0, 0, this.size.height);
      } else if (this.direction === 'left-right') {
        this.gradient = ctx.createLinearGradient(0, 0, this.size.width, 0);
      } else {
        this.gradient = ctx.createLinearGradient(this.size.width, 0, 0, 0);
      }
      this.gradient.addColorStop(0, this.colors[1]);
      this.gradient.addColorStop(1, this.colors[2]);
    }
    const exeeds = now - this.lastUpdate;
    const value = (exeeds >= 1000) ? 0 : (this.value * exeeds / 1000);
    const valueRatio = value/this.limit;
    ctx.fillStyle = this.gradient;
    ctx.strokeStyle = this.colors[0];
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (this.direction === 'bottom-top') {
      ctx.moveTo(0, this.size.height);
      ctx.lineTo(0, this.size.height * (1 - this.max/this.limit));
      ctx.fillRect(0, this.size.height * (1 - valueRatio), this.size.width, this.size.height * valueRatio);
      if (this.showLabel) {
        ctx.fillStyle = fontColor;
        ctx.textAlign = 'left';
        ctx.rotate(-90 * Math.PI / 180);
        ctx.fillText(`${this.name}: ${this.value.toFixed(3)}/${this.max.toFixed(3)}`, 0, 0);
      }
    } else if (this.direction === 'top-bottom') {
      ctx.moveTo(0, 0);
      ctx.lineTo(0, this.size.height * this.max/this.limit);
      ctx.fillRect(0, 0, this.size.width, this.size.height * valueRatio);
      if (this.showLabel) {
        ctx.fillStyle = fontColor;
        ctx.textAlign = 'left';
        ctx.rotate(90 * Math.PI / 180);
        ctx.fillText(`${this.name}: ${this.value.toFixed(3)}/${this.max.toFixed(3)}`, 0, 0);
      }
    } else if (this.direction === 'left-right') {
      ctx.moveTo(0, 0);
      ctx.lineTo(this.size.width * this.max/this.limit, 0);
      ctx.fillRect(0, 0, this.size.width * valueRatio, this.size.height);
      if (this.showLabel) {
        ctx.fillStyle = fontColor;
        ctx.textAlign = 'left';
        ctx.fillText(`${this.name}: ${this.value.toFixed(3)}/${this.max.toFixed(3)}`, 0, -1);
      }
    } else {
      ctx.moveTo(this.size.width, 0);
      ctx.lineTo(this.size.width * (1 - this.max/this.limit), 0);
      ctx.fillRect(this.size.width * ( 1 - valueRatio), 0, this.size.width * valueRatio, this.size.height);
      if (this.showLabel) {
        ctx.fillStyle = fontColor;
        ctx.textAlign = 'right';
        ctx.fillText(`${this.value.toFixed(3)}/${this.max.toFixed(3)} : ${this.name}`, this.size.width - padding, padding - 1);
      }
    }
    ctx.stroke();
    return RenderResult.none;
  }
  setValue(value: number) {
    this.value = value;
    if (value > this.max) {
      this.max = value;
    }
    if (value > this.limit) {
      this.limit = value;
    }
    this.lastUpdate = Date.now();
  }
}

export class Effector {
  ticks: {
    begin: number;
    last: number;
  };
  canvas: HTMLCanvasElement;
  textAlign: TextAlign;
  texts: Record<string, string>;
  effections: Array<Effection>;
  background?: CvMat;
  acceleration: Point;
  scale: number;
  constructor(canvas: HTMLCanvasElement, textAlign?: TextAlign, acceleration?: Point, scale?: number) {
    const now = Date.now();
    this.ticks = {
      begin: now,
      last: now,
    };
    this.canvas = canvas;
    this.textAlign = textAlign || 'left-top';
    this.acceleration = acceleration || { y: -9.8, x: 0 };
    this.texts = {};
    this.effections = [];
    this.scale = scale || 1;
  }
  setText(name: string, content: string) {
    this.texts[name] = content;
  }
  clearText(name?: string) {
    if (name) {
      delete this.texts[name];
    } else {
      this.texts = {};
    }
  }
  setBackground(value?: CvMat) {
    this.background = value;
  }
  addEffection(effection: Effection) {
    this.effections.push(effection);
  }
  removeEffection(effection: Effection) {
    const index = this.effections.indexOf(effection);
    if (index !== -1) {
      this.effections.splice(index, 1);
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

    // draw background if exists
    if (this.background) {
      ctx.drawImage(this.background, 0, 0, width, height);
    }

    // draw elements
    const disappears: Array<Effection> = [];
    const clones: Array<Effection> = [];
    for (const it of this.effections) {
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
      ctx.fillStyle = fontColor;
      for(const [key,value] of Object.entries(it.styles || {})) {
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
      this.effections.splice(this.effections.indexOf(e), 1);
      e.destroyed?.call(e);
    });
    clones.forEach(e => this.effections.push(e));

    //draw text
    ctx.setTransform(0, 0, 0, 0, 0, 0);

    ctx.font = `300 ${defaultFontSize}px`;
    ctx.fillStyle = fontColor;
    const [yStep, yStart] = /-bottom/.test(this.textAlign) ? [-defaultFontSize, height - defaultFontSize - padding] : [defaultFontSize, padding];
    let xPos = padding;
    if (/right-/.test(this.textAlign)) {
      ctx.textAlign = 'right';
      xPos = width - padding;
    } else {
      ctx.textAlign = 'left';
    }
    let yPos = yStart;
    for (const it of Object.values(this.texts)) {
      ctx.fillText(it, xPos, yPos);
      yPos += yStep;
    }

    this.ticks.last = now;
  }
};
