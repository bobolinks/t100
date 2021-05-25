import { Is } from '../is/index';
import { rpc } from '../rpc';
import { options } from '../store';

export default class extends Is.Program {
  constructor(script: Is.Scope, screen?: Is.Screen) {
    super(script, screen);
    screen?.setupExpectedSize(options.screen);
    screen?.addShape(new Is.Shapes.Rectangle("show",
      {
        left: 0,
        top: 0,
        height: options.screen.height,
        width: options.screen.width / 2
      },
      {
        borderRight: '1px solid #f2f2f2',
      }
    ),
    );
    screen?.addShape(new Is.Shapes.Rectangle("ani",
      {
        left: options.screen.width / 2,
        top: 0,
        height: options.screen.height,
        width: options.screen.width / 2
      },
    ),
    );
  }
  onExecute(keypath: Is.Keypath, node: Is.Scope, args: any[]) {
    return rpc.request('relay.input', [keypath, keypath, ...args]);
  }
  dispose() {
    rpc.undescribe(this);
  }
};
