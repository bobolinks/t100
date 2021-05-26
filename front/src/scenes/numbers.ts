import { Is } from '../is/index';
import { rpc } from '../rpc';
import ShowBase from './ishow_base';
import ColorNumber from '../shapes/Number';
import { options } from '../store';

export default class Numbers extends ShowBase {
  constructor(screen: Is.Screen) {
    super({
      num: {
        matchers: {
          name: 'value',
          exp: /\d/,
        },
        code: `num.setValue(value);`
      },
    }, screen);
    screen.addShape(new ColorNumber('num', 0, {
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
  }
};
