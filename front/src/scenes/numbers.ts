import { Is } from '../is/index';
import { rpc } from '../rpc';
import ShowBase from './ishow_base';
import ColorNumber from '../shapes/Number';
import { options } from '../store';

export default class Numbers extends ShowBase {
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
    screen?.addShape(new ColorNumber('num', 0, {
      left: 0,
      top: (options.screen.height / 2) - 150,
      height: 300,
      width: options.screen.width / 2
    }, {
      fontSize: '300px',
      textAlign: 'center',
      lineHeight: '1em',
      letterSpacing: '0.2em',
    }))
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
    (this.screen?.getShape('num') as ColorNumber).setValue(0);
  }
  setNum(value: string) {
    (this.screen?.getShape('num') as ColorNumber).setValue(parseInt(value));
  }
};