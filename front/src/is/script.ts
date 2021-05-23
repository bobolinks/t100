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
