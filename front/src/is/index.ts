const H5Image = Image;

/** interative script */
export namespace Is {
  /** key path[from root to selected] */
  export type Keypath = string;
  /** expr matcher */
  export interface Matcher {
    exp: RegExp;
    name: string;
  }
  /** patterns */
  export type Pattern = { path: Keypath, matchers: Array<string | RegExp | Matcher>, value: Is.Scope };
  export type Patterns = Array<Pattern>;
  export type Result = { code?: number, error?: string };
  /** script scope */
  export interface Scope {
    /** default is public */
    type?: 'public' | 'private';
    /** target */
    target?: 'none' | 'self';
    /** default is key of Recore<key, Scope> */
    name?: string;
    /** default is null */
    description?: string;
    /** default is key of Recore<key, Scope> */
    matchers?: string | RegExp | Matcher | Array<string | RegExp | Matcher>;
    /** instruction list in this scoped area */
    instructions?: Scopes;
    /** command */
    command: string;
  }
  /** scope list */
  export type Scopes = Record<string, Scope>;
  /** scope path from keypath */
  export function scopes(scope: Scope, keypath?: Keypath): Array<{ path: Keypath, name: string, value: Is.Scope }> {
    const ls: Array<{ path: Keypath, name: string, value: Is.Scope }> = [{ path: keypath || '', name: '', value: scope }];
    if (!keypath) {
      return ls;
    }
    const keys = [];
    const names = keypath.split('.');
    let node = scope;
    for (const name of names) {
      node = (node.instructions || {})[name];
      if (!node) {
        throw `scope[${keypath}] not found`;
      }
      keys.push(name);
      ls.push({ path: keys.join('.'), name, value: node });
    }
    return ls;
  }
  /** list all patterns from keypath */
  export function patterns(scope: Scope, keypath?: Keypath): Patterns {
    const scopes = Is.scopes(scope, keypath);
    const pats: Is.Patterns = [];
    const its = [...scopes].reverse();
    for (const it of its) {
      if (!it.value.instructions) continue;
      for (const [key, sco] of Object.entries(it.value.instructions)) {
        const matchers: Array<string | RegExp | Matcher> = [];
        if (sco.matchers) {
          if (Array.isArray(sco.matchers)) {
            matchers.push(...sco.matchers.map(e => {
              if (isRegexp(e)) {
                return ensureStartMatch(sco.matchers as RegExp);
              } else if (typeof e !== 'string') {
                return {
                  name: (e as Matcher).name,
                  exp: ensureStartMatch((e as Matcher).exp)
                };
              }
              return e;
            }));
          } else if (isRegexp(sco.matchers)) {
            matchers.push(ensureStartMatch(sco.matchers as RegExp));
          } else {
            matchers.push(sco.matchers);
          }
        } else {
          matchers.push(key);
        }
        pats.push({ path: `${it.path}.${key}`, matchers, value: sco });
      }
      if (it.value.type === 'private') {
        break;
      }
    }
    return pats;
  }

  type CharCode = number;
  type PatternWithResult = {
    pattern: Pattern | null;
    vars: Array<string>;
  };

  export type Executor = (keypath: Keypath, node: Scope, args: any[]) => Result | Promise<Result>;
  /** script */
  export class Script {
    private root: Scope;
    private stack: Array<{ path: Keypath, name: string, value: Is.Scope }>;
    private line: Array<CharCode>;
    private patterns: Patterns;
    private executor: Executor;
    constructor(root: Scope, executor: Executor) {
      this.root = root;
      this.stack = scopes(this.root);
      this.line = [];
      this.patterns = patterns(root);
      this.executor = executor;
    }
    reshape() {
      this.patterns = patterns(this.stack[this.stack.length - 1].value);
    }
    pop() {
      if (this.stack.length > 1) {
        this.stack.pop();
      }
    }
    input(char: CharCode): Array<string> {
      if (char === 10) {
        // is \n
      } else if (char === 8) {
        // is \b
        if (this.line.length) {
          this.line.pop();
        }
      } else {
        this.line.push(char);
      }
      const line = this.line.map(e => String.fromCharCode(e)).join('');

      const ls = [];
      let fullMatched: PatternWithResult = {
        pattern: null,
        vars: []
      };
      for (const it of this.patterns) {
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
            vars.push(matcherToString(matcher));
            continue;
          }
          if (typeof matcher === 'string') {
            if (matcher.startsWith(token)) {
              vars.push(matcher);
              if (matcher.length !== token.length) {
                // touch the end
                token = '';
                break;
              }
              // touch the end
              token = '';
            } else if (token.startsWith(matcher)) {
              token = token.substring(matcher.length);
              vars.push(matcher);
            } else {
              failed = true;
              break;
            }
          } else if (isRegexp(matcher)) {
            const mr = (matcher as RegExp).exec(token);
            if (mr) {
              token = token.substring(mr[0].length);
              vars.push(mr[0]);
            } else {
              failed = true;
              break;
            }
          } else {
            const mr = (matcher as Matcher).exp.exec(token);
            if (mr) {
              token = token.substring(mr[0].length);
              vars.push(mr[0]);
            } else {
              failed = true;
              break;
            }
          }
        }
        if (!failed) {
          ls.push(vars.join(''));
          if (!fullMatched.pattern && processed === it.matchers.length && !token) {
            fullMatched.pattern = it;
            fullMatched.vars = vars;
          }
        }
      }

      if (char === 10) {
        // excute
        if (fullMatched.pattern) {
          this.executor(fullMatched.pattern.path, fullMatched.pattern.value, fullMatched.vars);
          if (fullMatched.pattern.value.target === 'self') {
            this.stack = scopes(this.root, fullMatched.pattern.path);
            this.reshape();
            return [];
          }
        }
      }

      return ls;
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
      this.element.setAttribute('name', name);
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

  export class Screen extends HTMLDivElement {
    shadow: ShadowRoot;
    shapes: Array<Element>;
    body: HTMLBodyElement;
    actived: Element | undefined;
    expectedSize: Size | undefined;
    constructor() {
      super();
      this.shadow = this.attachShadow({ mode: 'open' });
      this.shapes = [];
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
      const e = this.shadow.ownerDocument.getElementsByName(name);
      if (e.length !== 1) {
        throw '';
      }
      return this.shapes.find(shape => shape.element === e[0]);
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
      this.shapes.push(shape);
      this.body.appendChild(shape.element);
    }
    removeShape(shape: Element) {
      this.body.removeChild(shape.element);
      const index = this.shapes.indexOf(shape);
      if (index !== -1) {
        this.shapes.splice(index, 1);
      }
    }
    cleanup() {
      this.body.childNodes.forEach(e => this.body.removeChild(e));
    }
  };

  /**
   *******************************
   */
  export class Program {
    script: Script;
    screen: Screen | undefined;
    constructor(script: Scope, screen?: Screen) {
      this.script = new Script(script, this.onExecute.bind(this));
      this.screen = screen;
    }
    onExecute(keypath: Keypath, node: Scope, args: any[]) {
      return {};
    }
    setupStyle(css: string) {
      let style = document.getElementById('screen-style');
      if (!style) {
        style = document.createElement('style');
        style.setAttribute('id', 'screen-style');
        this.screen?.shadow.appendChild(style);
      }
      style.innerHTML = css;
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
