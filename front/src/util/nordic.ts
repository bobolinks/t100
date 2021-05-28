type TyEndodeOptions = {
  exclude?: Array<string>;
};

type TyDecodeFunction = () => any;
type TyDecodeFunctions = {
  [key: string]: TyDecodeFunction;
};

export default {
  encode(object: any, options: TyEndodeOptions = {}): string {
    let src = '';
    const type = typeof object;
    if (type === 'symbol') return '';
    src += {
      undefined: () => 'u',
      boolean: (value: boolean) => `b${value ? 1 : 0}`,
      number: (value: number) => `i${value}e`,
      bigint: (value: bigint) => `I${value}e`,
      string: (value: string) => `s${value.length}:${value}`,
      function: (value: any) => {
        const s = value.toString();
        const m = /^function[\s\t]+([a-zA-Z]+)\(\)[\s]*{[\s\t\n]+\[native[\s]code\][\s\t\n]*}/.exec(s);
        const fs = m ? m[1] : s;
        return `f${fs.length}:${fs}`
      },
      object: (value: object) => {
        if (value === null) {
          return 'n';
        } else if (Array.isArray(value)) {
          let s = `a${value.length}:`;
          for (const item of object) {
            s += this.encode(item, options);
          }
          return s;
        } else if (typeof (value as RegExp).test === 'function' && value.constructor.name === 'RegExp') {
          const s = (value as RegExp).source;
          const flags = (value as RegExp).flags;
          return `rs${s.length}:${s}s${flags.length}:${flags}`;
        } else {
          const keys = Object.keys(value).filter(e => !options.exclude || options.exclude.indexOf(e) === -1);
          let s = `d${keys.length}:`;
          for (const key of keys) {
            s += this.encode(key, options);
            // @ts-ignore
            const item = value[key];
            s += this.encode(item, options);
          }
          return s;
        }
      }
      // @ts-ignore
    }[type](object);
    return src;
  },

  decode(str: string, cxt = { pos: 0 }): any {
    const t = str[cxt.pos++];
    const f = ({
      a: () => {
        const pose = str.indexOf(':', cxt.pos);
        const size = parseInt(str.substring(cxt.pos, pose));
        /**skip `${size}:` */
        cxt.pos = pose + 1;
        const r = [];
        for (let i = 0; i < size; i++) {
          r.push(this.decode(str, cxt));
        }
        return r;
      },
      b: () => {
        return str[cxt.pos++] === '1';
      },
      d: () => {
        const pose = str.indexOf(':', cxt.pos);
        const size = parseInt(str.substring(cxt.pos, pose));
        /**skip `${size}:` */
        cxt.pos = pose + 1;
        const r: any = {};
        for (let i = 0; i < size; i++) {
          r[this.decode(str, cxt)] = this.decode(str, cxt);
        }
        return r;
      },
      f: () => {
        const pose = str.indexOf(':', cxt.pos);
        const length = parseInt(str.substring(cxt.pos, pose));
        const pos = pose + 1;
        /**skip `${length}:.[length]` */
        cxt.pos = pose + length + 1;
        return eval(`(${str.substring(pos, pos + length)})`);
      },
      i: () => {
        const pose = str.indexOf('e', cxt.pos);
        const pos = cxt.pos;
        cxt.pos = pose + 1;
        return parseFloat(str.substring(pos, pose));
      },
      I: () => {
        const pose = str.indexOf('e', cxt.pos);
        const pos = cxt.pos;
        cxt.pos = pose + 1;
        return BigInt(str.substring(pos, pose));
      },
      n: () => {
        return null;
      },
      r: () => {
        const source = this.decode(str, cxt);
        const flags = this.decode(str, cxt);
        return new RegExp(source, flags);
      },
      s: () => {
        const pose = str.indexOf(':', cxt.pos);
        const length = parseInt(str.substring(cxt.pos, pose));
        const pos = pose + 1;
        /**skip `${length}:.[length]` */
        cxt.pos = pose + length + 1;
        return str.substring(pos, pos + length);
      },
      u: () => undefined,
    } as TyDecodeFunctions)[t];
    if (!f) {
      throw 'unkonwn encoding!';
    }
    return f();
  },
};
