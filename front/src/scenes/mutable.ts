import { Is } from '../is/index';
import { rpc } from '../rpc';

export default class MulTable extends Is.Program {
  constructor(screen?: Is.Screen) {
    super({
      command: 'sc.num.start',
      instructions: {
        num: {
          matchers: /\d/,
          command: 'sc.num.set',
        },
      },
    }, screen);
    rpc.describe('sc.num.start', this.start, this);
    rpc.describe('sc.num.set', this.setNum, this);
  }
  onExecute(keypath: Is.Keypath, node: Is.Scope, args: any[]) {
    return rpc.request('relay.input', [keypath, keypath, ...args]);
  }
  dispose() {
    rpc.undescribe(this);
  }
  start() {

  }
  setNum(value: string) {

  }
};
