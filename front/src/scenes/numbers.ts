import { Is } from '../is/index';
import { rpc } from '../rpc';
import ShowBase from './ishow_base';
import { ElementNumber } from '../isassets/elements/number';
import { options } from '../store';

export default class Numbers extends ShowBase {
  constructor(screen: Is.Screen) {
    super({
      num: {
        matchers: [
          'set number to ',
          {
            name: 'value',
            label: '数字',
            exp: /\d/,
          }],
        code: `num.setValue(value);`
      },
    }, screen);
    screen.addElement(new ElementNumber('num', 0, {
      left: '0',
      top: `${(options.screen.height / 2) - 150}px`,
      height: `300px`,
      width: `${options.screen.width / 2}px`,
      fontSize: '300px',
      textAlign: 'center',
      lineHeight: '1em',
      letterSpacing: '0.2em',
    }))
  }
};
