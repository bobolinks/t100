import { Is } from '../is/index';
import { rpc } from '../rpc';
import { options } from '../store';

export default class extends Is.Program {
  constructor(script: Is.Script, screen: Is.Screen) {
    super(script, screen);
    screen.setupExpectedSize(options.screen);
    screen.addElement(new Is.Elements.Rectangle("show",
      {
        left: '0',
        top: '0',
        height: `${options.screen.height}px`,
        width: `${options.screen.width / 2}px`,
        borderRight: '1px solid #f2f2f2',
      }
    ),
    );
    screen.addElement(new Is.Elements.Rectangle("ani",
      {
        left: `${options.screen.width / 2}px`,
        top: '0',
        height: `${options.screen.height}px`,
        width: `${options.screen.width / 2}px`
      },
    ),
    );
  }
  dispose() {
    rpc.undescribe(this);
    super.dispose();
  }
};
