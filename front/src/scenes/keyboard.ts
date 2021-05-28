import { Is } from '../is/index';
import { rpc } from '../rpc';
import { options } from '../store';
import { ElementKeyboard } from '../isassets/elements/keyboard';

export default class Numbers extends Is.Program {
  keyboard: ElementKeyboard;
  constructor(screen: Is.Screen) {
    super({
      num: {
        matchers: [
          {
            name: 'char',
            label: '一个字符',
            exp: /./,
          }],
        code: `keyboard.zoom(char);`
      },
    }, screen);
    screen.setupExpectedSize(options.screen);

    const width = options.screen.width * 0.8;
    const height = width / 2;
    const scale = width / 1600;

    this.keyboard = new ElementKeyboard('keyboard', {
      width: 1600,
      height: 800,
    }, {
      left: `${options.screen.width * 0.1}px`,
      top: `${options.screen.height / 2 - height / 2}px`,
      height: `${height}px`,
      width: `${width}px`,
    }, scale, {
      font: '200 20px sans-serif',
    });

    screen.addElement(this.keyboard);
  }
  updateFrame(timestamp: number) {
    this.keyboard.redraw();
  }
  dispose() {
    rpc.undescribe(this);
    rpc.undescribe(this.screen);
    super.dispose();
  }
};
