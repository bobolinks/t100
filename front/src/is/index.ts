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
    name?: string;
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
    matchers?: string | RegExp | Matcher | Array<string | RegExp | Matcher>;
    /** implementation, this === ScriptContext */
    code: string;
  }
  export type Script = Record<string, Command>;

  /** patterns */
  export type Pattern = { description?: string, matchers: Array<Matcher> };
  export type Patterns = Record<string, Pattern>;
  export function matchers(command: Command): Array<Matcher> {
    const matchers: Array<Matcher> = [];
    if (command.matchers) {
      if (Array.isArray(command.matchers)) {
        matchers.push(...command.matchers.map(e => {
          if (isRegexp(e)) {
            return { exp: ensureStartMatch(command.matchers as RegExp) };
          } else if (typeof e !== 'string') {
            return {
              name: (e as Matcher).name,
              exp: ensureStartMatch((e as Matcher).exp)
            };
          }
          return { exp: new RegExp(`^${e}$`) };
        }));
      } else if (isRegexp(command.matchers)) {
        matchers.push({ exp: ensureStartMatch(command.matchers as RegExp) });
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
        mats.push({ exp: new RegExp(`^${key}$`) });
      }
      pats[key] = { description: sco.description, matchers: mats };
    }
    return pats;
  }
  export function stringifyPatterns(patterns: Patterns): string {
    return JSON.stringify(patterns, function (key, value) {
      if (key === 'matchers' && Array.isArray(value)) {
        return value.map(e => {
          const ma = e as Matcher;
          return `[!e-${ma.name || ''}-${ma.exp.flags}]${ma.exp.source}`;
        })
      }
      return value;
    });
  }
  export function parsePatterns(str: string): Patterns {
    return JSON.parse(str, function (key, value) {
      if (key === 'matchers' && Array.isArray(value)) {
        return value.map(e => {
          const [, name, flags, source] = /^\[!e-([^-]*)-([^\]]*)\](.+)$/.exec(e) || [];
          return {
            name,
            exp: new RegExp(source, flags),
          };
        })
      }
      return value;
    });
  }

  /**
   *******************************
   */
  type CharCode = number;
  export type FnCommit = (name: string, args: any[]) => any;
  type InputResult = {
    action: 'clear' | 'default';
    sugesstions?: Array<string>;
  };

  export class Ternimator {
    private line: Array<CharCode>;
    private patterns: Patterns;
    private commit: FnCommit;
    constructor(patterns: Patterns, commit: FnCommit) {
      this.line = [];
      this.patterns = patterns;
      this.commit = commit;
    }
    input(char: CharCode): InputResult {
      const rs: InputResult = {
        action: 'default',
        sugesstions: [],
      };
      if (char === 13) {
        // is \r
      } else if (char === 8) {
        // is \b
        if (this.line.length) {
          this.line.pop();
        }
      } else {
        this.line.push(char);
      }
      const line = this.line.map(e => String.fromCharCode(e)).join('');

      let fullMatched: any = {
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
        if (!failed) {
          rs.sugesstions?.push(vars.join(''));
          if (!fullMatched.name && processed === it.matchers.length && !token) {
            fullMatched.name = name;
            fullMatched.vars = vars;
          }
        }
      }

      if (char === 13) {
        this.line = [];
        // excute
        if (fullMatched.name) {
          rs.action = 'clear';
          this.commit(fullMatched.name, fullMatched.vars);
        }
      }

      return rs;
    }
  }

  /**
   *******************************
   */
  export type Point = {
    x: number;
    y: number;
  };

  export type Size = {
    width: number;
    height: number;
  };

  export type Rect = {
    left: number | string;
    top: number | string;
    width: number | string;
    height: number | string;
  };

  export enum RenderResult {
    none = 0,
    disappear = 1,
    clone = 2,
  };

  export type Styles = Partial<CSSStyleDeclaration>;

  export class Element<T extends HTMLElement = HTMLElement> {
    element: T;
    constructor(tag: string, name: string, rect: Rect, style?: Styles) {
      this.element = document.createElement(tag) as any as T;
      for (const [k, v] of Object.entries(style || {})) {
        (this.element.style as any)[k] = v;
      }
      this.element.style.position = 'absolute';
      this.element.style.left = typeof rect.left === 'number' ? `${rect.left}px` : rect.left;
      this.element.style.top = typeof rect.top === 'number' ? `${rect.top}px` : rect.top;
      this.element.style.width = typeof rect.width === 'number' ? `${rect.width}px` : rect.width;
      this.element.style.height = typeof rect.height === 'number' ? `${rect.height}px` : rect.height;
      this.element.setAttribute('id', name);
    }
  }

  export namespace Shapes {
    export class Rectangle extends Element<HTMLDivElement> {
      constructor(name: string, rect: Rect, style?: Styles) {
        super('div', name, rect, style);
      }
      setColor(value: string) {
        this.element.style.backgroundColor = value;
      }
    }

    export class Text extends Element<HTMLLabelElement> {
      constructor(name: string, text: string, rect: Rect, style?: Styles) {
        super('label', name, rect, style);
        this.element.innerText = text;
      }
      setColor(value: string) {
        this.element.style.color = value;
      }
      setText(text: string) {
        this.element.innerText = text;
      }
    }

    export class Image extends Element<HTMLImageElement> {
      constructor(name: string, src: string, rect: Rect, style?: Styles) {
        super('img', name, rect, style);
        this.element.setAttribute('src', src);
      }
      setImage(src: string) {
        this.element.setAttribute('src', src);
      }
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
    getShape(name: string): Element | undefined {
      return this.context[name];
    }
    activeShape(name: string) {
      const e = this.getShape(name);
      if (!e) {
        return;
      }
      this.actived = e;
    }
    addShape(shape: Element, removeIfAniDone?: boolean) {
      if (removeIfAniDone) {
        shape.element.onanimationend = () => {
          this.removeShape(shape);
        };
      }
      const id = shape.element.getAttribute('id');
      if (!id) {
        throw '';
      }
      this.context[id] = shape;
      this.body.appendChild(shape.element);
    }
    removeShape(shape: Element) {
      const id = shape.element.getAttribute('id');
      if (!id) {
        throw '';
      }
      this.body.removeChild(shape.element);
      delete this.context[id];
    }
    cleanup() {
      this.body.childNodes.forEach(e => this.body.removeChild(e));
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
    constructor(script: Script, screen: Screen) {
      this.screen = screen;
      this.script = {};
      for (const [name, it] of Object.entries(script)) {
        const args = matchers(it).filter(e => e.name).map(e => e.name);
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
    }
    execute(name: string, args: any[]): any {
      const node = this.script[name];
      if (!node) {
        throw `Command[${name}] not found!`;
      }
      return node.implementation.call(this.screen.context, args);
    }
    patterns() {
      return toPatterns(this.script as any);
    }
  }
};

function isRegexp(obj: any) {
  return Object.prototype.toString.call(obj) === '[object RegExp]';
}

function ensureStartMatch(exp: RegExp) {
  if (/^\^.*\$$/.test(exp.source)) {
    return exp;
  } else {
    const src = exp.source.replace(/^([^^])/, '^$1').replace(/([^$])$/, '$1$');
    return new RegExp(src, exp.flags);
  }
}

function matcherToString(matcher: string | RegExp | Is.Matcher) {
  if (typeof matcher === 'string') {
    return matcher;
  } else if (isRegexp(matcher)) {
    return (matcher as RegExp).source;
  } else {
    return `\${${(matcher as Is.Matcher).name}=${(matcher as Is.Matcher).exp.source}}`;
  }
}

customElements.define('is-screen', Is.Screen, { extends: 'div' });
