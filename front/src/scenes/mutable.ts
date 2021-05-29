import { Is } from '../is/index';
import { rpc } from '../rpc';

export default class MulTable extends Is.Program {
  constructor(screen: Is.Screen) {
    super('乘法表', {
    }, screen);
  }
};
