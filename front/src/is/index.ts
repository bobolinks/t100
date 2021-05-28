const H5Image = Image;

/** interative script */
export namespace Is {
  export enum Role {
    Student = 0,
    Master = 1,
  };

  /** expr matcher */
  export interface Matcher {
    exp: RegExp;
    name: string;
    label: string;
  }

  /** runtime context */
  export interface ScriptContext {
    [key: string]: any;
  }

  /** script command */
  export interface Command {
    /** default is null */
    description?: string;
    /** default is key of Recore<key, Command> */
    matchers?: string | Matcher | Array<string | Matcher>;
    /** implementation, this === ScriptContext */
    code: string;
  }
  export type Script = Record<string, Command>;

  /** patterns */
  export type Pattern = { description?: string, matchers: Array<string | Matcher> };
  export type Patterns = Record<string, Pattern>;
  export function matchers(command: Command): Array<string | Matcher> {
    const matchers: Array<string | Matcher> = [];
    if (command.matchers) {
      if (Array.isArray(command.matchers)) {
        matchers.push(...command.matchers.map(e => {
          if (typeof e !== 'string') {
            return {
              name: (e as Matcher).name,
              label: (e as Matcher).label,
              exp: ensureStartMatch((e as Matcher).exp)
            };
          }
          return e;
        }));
      } else {
        matchers.push(command.matchers as Matcher);
      }
    }
    return matchers;
  }
  /** converts script to patterns*/
  export function toPatterns(script: Script): Patterns {
    const pats: Is.Patterns = {};
    for (const [key, sco] of Object.entries(script)) {
      const mats = matchers(sco);
      if (sco.matchers) {
      } else {
        mats.push(key);
      }
      pats[key] = { description: sco.description, matchers: mats };
    }
    return pats;
  }

  /**
   *******************************
   */
  export type FnCommit = (name: string, args: any[]) => any;
  type InputResult = {
    sugesstions?: Array<string>;
    matched?: {
      name: string;
      vars: Array<any>;
    };
  };

  export class Ternimator {
    private patterns: Patterns;
    private commit: FnCommit;
    constructor(patterns: Patterns, commit: FnCommit) {
      this.patterns = patterns;
      this.commit = commit;
    }
    input(line: string): InputResult {
      const rs: InputResult = {
        sugesstions: [],
      };

      let matched: any = {
        name: null,
        vars: []
      };
      for (const [name, it] of Object.entries(this.patterns)) {
        let token = line;
        let failed = false;
        const vars = [];
        let processed = 0;
        for (; processed < it.matchers.length; processed++) {
          const matcher = it.matchers[processed];
          if (!token) {
            if (failed) {
              break;
            }
            continue;
          }
          if (typeof matcher === 'string') {
            if (matcher.startsWith(token)) {
              token = '';
            } else if (token.startsWith(matcher)) {
              token = token.substring(matcher.length);
            } else {
              failed = true;
              break;
            }
          } else {
            const mr = matcher.exp.exec(token);
            if (mr) {
              token = token.substring(mr[0].length);
              if (matcher.name) {
                vars.push(mr[0]);
              }
            } else {
              failed = true;
              break;
            }
          }
        }
        if (!failed) {
          rs.sugesstions?.push(it.matchers.map(e => matcherToString(e)).join(''));
          if (!matched.name && processed === it.matchers.length && !token) {
            matched.name = name;
            matched.vars = vars;
          }
        }
      }

      if (matched.name) {
        rs.matched = matched;
      }

      return rs;
    }
    excute(line: string): boolean {
      const rs = this.input(line);
      if (!rs.matched) {
        return false;
      }
      this.commit(rs.matched.name, rs.matched.vars);
      return true;
    }
  }

  /**
   *******************************
   */
  export type Point = {
    x: number;
    y: number;
    z?: number;
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

  export type Styles = Partial<CSSStyleDeclaration>;

  export class Element<T extends HTMLElement = HTMLElement> {
    dom: T;
    constructor(tag: string, name: string, style?: Styles, ns?: string) {
      this.dom = (ns ? document.createElementNS(ns, name) : document.createElement(tag)) as any as T;
      for (const [k, v] of Object.entries(style || {})) {
        (this.dom.style as any)[k] = v;
      }
      this.dom.style.position = 'absolute';
      this.dom.setAttribute('id', name);
    }
  }

  export interface CanvasStyles extends Partial<CanvasTextDrawingStyles>, Partial<CanvasShadowStyles> {
    fillStyle?: string | CanvasGradient | CanvasPattern;
    strokeStyle?: string | CanvasGradient | CanvasPattern;
  }

  export class Shape {
    name: string;
    position: Point;
    quality?: boolean;
    velocity?: Point;
    styles?: CanvasStyles;
    constructor(name: string, position: Point, styles?: CanvasStyles, quality?: boolean, velocity?: Point) {
      this.name = name;
      this.position = position;
      this.styles = styles;
      this.quality = quality;
      this.velocity = velocity;
    }
    render(ctx: CanvasRenderingContext2D, delta: number, now?: number): RenderResult {
      return RenderResult.none;
    }
    clone?(): Shape;
    destroyed?(): void;
  }

  export namespace Elements {
    export class Rectangle extends Element<HTMLDivElement> {
      constructor(name: string, style?: Styles) {
        super('div', name, style);
      }
      setColor(value: string) {
        this.dom.style.backgroundColor = value;
      }
    }

    export class Text extends Element<HTMLLabelElement> {
      constructor(name: string, text: string, style?: Styles) {
        super('label', name, style);
        this.dom.innerText = text;
      }
      setColor(value: string) {
        this.dom.style.color = value;
      }
      setText(text: string) {
        this.dom.innerText = text;
      }
    }

    export class Image extends Element<HTMLImageElement> {
      constructor(name: string, src: string, style?: Styles) {
        super('img', name, style);
        this.dom.setAttribute('src', src);
      }
      setImage(src: string) {
        this.dom.setAttribute('src', src);
      }
    }

    interface CanvasContext extends ScriptContext {
      [key: string]: Shape | Array<Shape>;
    };
    export class Canvas extends Element<HTMLCanvasElement> {
      ticks: {
        begin: number;
        last: number;
      };
      context: CanvasContext;
      acceleration: Point;
      scale: number;
      size: Size;
      constructor(name: string, size: Size, style?: Styles, acceleration?: Point, scale?: number) {
        super('canvas', name, style);
        this.size = size;
        this.dom.setAttribute('width', size.width.toString());
        this.dom.setAttribute('height', size.height.toString());

        const now = Date.now();
        this.ticks = {
          begin: now,
          last: now,
        };
        this.acceleration = acceleration || { y: -9.8, x: 0 };
        this.context = {};
        this.scale = scale || 1;
      }
      add(shape: Shape) {
        if (!this.context[shape.name]) {
          this.context[shape.name] = shape;
        } else if (Array.isArray(this.context[shape.name])) {
          (this.context[shape.name] as any).push(shape);
        } else {
          this.context[shape.name] = [this.context[shape.name] as Shape, shape];
        }
      }
      remove(name: string, shape?: Shape) {
        if (Array.isArray(this.context[name])) {
          const arr = this.context[name] as Array<Shape>;
          if (arr.length < 1 || !shape) {
            delete this.context[name];
          } else {
            const index = arr.indexOf(shape);
            if (index !== -1) {
              if (arr.length === 1) {
                delete this.context[name];
              } else {
                arr.splice(index, 1);
              }
            }
          }
        } else {
          delete this.context[name];
        }
      }
      redraw() {
        const now = Date.now();
        const delta = now - this.ticks.last;

        if (delta <= 0) {
          return;
        }

        const ctx = this.dom.getContext('2d');
        if (!ctx) {
          return;
        }
        const width = this.dom.width;
        const height = this.dom.height;

        // reset current transformation matrix to the identity matrix
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        // clear background
        ctx.clearRect(0, 0, width, height);

        // draw elements
        const disappears: Array<Shape> = [];
        const clones: Array<Shape> = [];
        const each = (it: Shape) => {
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
          for (const [key, value] of Object.entries(it.styles || {})) {
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
        const its = [];
        for (const it of Object.values(this.context)) {
          if (Array.isArray(it)) {
            for (const item of it) {
              its.push(item);
            }
          } else {
            its.push(it);
          }
        }
        its.sort((a, b) => (a.position.z || 0) - (b.position.z || 0));
        its.forEach(e => each(e));
        disappears.forEach(e => {
          delete this.context[e.name];
          e.destroyed?.call(e);
        });
        clones.forEach(e => this.add(e));

        this.ticks.last = now;
      }
      /**
       * Draws a rounded rectangle using the current state of the canvas.
       * If you omit the last three params, it will draw a rectangle
       * outline with a 5 pixel border radius
       * @param {Number} x The top left x coordinate
       * @param {Number} y The top left y coordinate
       * @param {Number} width The width of the rectangle
       * @param {Number} height The height of the rectangle
       * @param {Object} radius All corner radii. Defaults to 0,0,0,0;
       * @param {Boolean} fill Whether to fill the rectangle. Defaults to false.
       * @param {Boolean} stroke Whether to stroke the rectangle. Defaults to true.
       */
      static roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number, fill?: boolean, stroke?: boolean) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        if (stroke) {
          ctx.stroke();
        }
        if (fill) {
          ctx.fill();
        }
      }
    };
  };

  export type AnimationFunction = (currentTime: number, startValue: number, changeValue: number, duration: number) => number;

  export const AnimationFunctions = {
    linear(currentTime: number, startValue: number, changeValue: number, duration: number) {
      return changeValue * currentTime / duration + startValue;
    },
    easeInQuad(currentTime: number, startValue: number, changeValue: number, duration: number) {
      currentTime /= duration;
      return changeValue * currentTime * currentTime + startValue;
    },
    easeOutQuad(currentTime: number, startValue: number, changeValue: number, duration: number) {
      currentTime /= duration;
      return -changeValue * currentTime * (currentTime - 2) + startValue;
    },
    easeInOutQuad(currentTime: number, startValue: number, changeValue: number, duration: number) {
      currentTime /= duration / 2;
      if (currentTime < 1) return changeValue / 2 * currentTime * currentTime + startValue;
      currentTime--;
      return -changeValue / 2 * (currentTime * (currentTime - 2) - 1) + startValue;
    },
    easeInOuth3h(currentTime: number, startValue: number, targetValue: number, duration: number) {
      const h = duration / 8;
      const d = targetValue - startValue;
      if (currentTime <= h) {
        return startValue + (d * currentTime / h);
      } if (currentTime >= duration) {
        return startValue;
      } if (currentTime >= 7 * h) {
        return startValue + (d * (duration - currentTime) / h);
      }
      return targetValue;
    }
  };

  interface ScreenContext extends ScriptContext {
    [key: string]: Element;
  };
  export class Screen extends HTMLDivElement {
    shadow: ShadowRoot;
    context: ScreenContext;
    body: HTMLBodyElement;
    actived: Element | undefined;
    expectedSize: Size | undefined;
    constructor() {
      super();
      this.shadow = this.attachShadow({ mode: 'open' });
      this.context = {};
      this.body = document.createElement('body');
      this.shadow.appendChild(this.body);
      new ResizeObserver(() => {
        this.resize();
      }).observe(this);
      this.style.overflow = 'hidden';
      this.style.boxSizing = 'border-box';
      this.body.style.transformOrigin = '0 0';
      this.body.style.position = 'absolute';
      this.body.style.left = '0px';
      this.body.style.top = '0px';
      this.body.style.margin = '0px';
      this.body.style.padding = '0px';
    }
    private resize() {
      const scaleX = this.offsetWidth / (this.expectedSize?.width || this.offsetWidth);
      const scaleY = this.offsetHeight / (this.expectedSize?.height || this.offsetHeight);
      this.body.style.transform = `scale(${scaleX}, ${scaleY})`;
    }
    setupExpectedSize(size: Size | undefined) {
      this.expectedSize = size;
      this.body.style.width = size ? `${size.width}px` : '';
      this.body.style.height = size ? `${size.height}px` : '';
      this.resize();
    }
    addElement(shape: Element, removeIfAniDone?: boolean) {
      if (removeIfAniDone) {
        shape.dom.onanimationend = () => {
          this.removeElement(shape);
        };
      }
      const id = shape.dom.getAttribute('id');
      if (!id) {
        throw '';
      }
      this.context[id] = shape;
      this.body.appendChild(shape.dom);
    }
    removeElement(shape: Element) {
      const id = shape.dom.getAttribute('id');
      if (!id) {
        throw '';
      }
      this.body.removeChild(shape.dom);
      delete this.context[id];
    }
    cleanup() {
      this.body.childNodes.forEach(e => this.body.removeChild(e));
      this.context = {};
    }
  };

  /**
   *******************************
   */
  export class Program {
    script: Record<string, Omit<Command, 'code'> & {
      implementation(...args: any[]): any;
    }>;
    screen: Screen;
    rendering: boolean;
    context: ScriptContext;
    constructor(script: Script, screen: Screen, context?: ScriptContext) {
      this.screen = screen;
      this.script = {};
      this.rendering = false;
      this.context = context || screen.context;
      for (const [name, it] of Object.entries(script)) {
        const args = matchers(it).filter(e => typeof e !== 'string').map(e => (e as Matcher).name);
        this.script[name] = Object.assign({}, it, {
          implementation: new Function(args as any, `with(this) { ${it.code} }`),
        }) as any;
      }
    }
    launch(css: string) {
      let style = document.getElementById('screen-style');
      if (!style) {
        style = document.createElement('style');
        style.setAttribute('id', 'screen-style');
        this.screen?.shadow.appendChild(style);
      }
      style.innerHTML = css;

      if (this.updateFrame) {
        this.rendering = true;
        const fps = 30;
        const fpsInterval = 1000 / fps;
        let then: number | undefined = undefined;
        const step = (timestamp: number) => {
          if (!this.updateFrame || !this.rendering) {
            return;
          }
          window.requestAnimationFrame(step);
          if (then === undefined) {
            then = timestamp;
          }
          const elapsed = timestamp - then;
          // if enough time has elapsed, draw the next frame
          if (elapsed > fpsInterval) {
            then = timestamp;
            this.updateFrame(timestamp);
          }
        }
        window.requestAnimationFrame(step);
      }
    }
    execute(name: string, args: any[]): any {
      const node = this.script[name];
      if (!node) {
        throw `Command[${name}] not found!`;
      }
      return node.implementation.call(this.context, ...args);
    }
    patterns() {
      return toPatterns(this.script as any);
    }
    dispose() {
      this.rendering = false;
      this.screen.cleanup();
    }
    updateFrame?(timestamp: number): void;
  }
};

function ensureStartMatch(exp: RegExp) {
  if (/^\^.*\$$/.test(exp.source)) {
    return exp;
  } else {
    const src = exp.source.replace(/^([^^])/, '^$1').replace(/([^$])$/, '$1$');
    return new RegExp(src, exp.flags);
  }
}

function matcherToString(matcher: string | Is.Matcher) {
  if (typeof matcher === 'string') {
    return matcher;
  } else {
    return `\${${(matcher as Is.Matcher).name}=${(matcher as Is.Matcher).label}}`;
  }
}

customElements.define('is-screen', Is.Screen, { extends: 'div' });
