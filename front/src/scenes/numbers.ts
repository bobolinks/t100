import { Is } from '../is/script';
import { rpc } from '../rpc';

export const Numbers: Is.Scope = {
  command: 'sc.num.start',
  instructions: {
    num: {
      matchers: /\d/,
      command: 'sc.num.set',
    },
  },
};
