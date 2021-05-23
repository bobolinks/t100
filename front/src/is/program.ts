import * as Script from './script';
import * as Screen from './screen';

/** interative script */
export namespace Is {
  export class Program {
    script: Script.Is.Script;
    screen: Screen.Is.Screen;
    constructor(script: Script.Is.Scope, canvas: HTMLCanvasElement) {
      this.script = new Script.Is.Script(script, this.onExecute.bind(this));
      this.screen = new Screen.Is.Screen(canvas);
    }
    onExecute(keypath: Script.Is.Keypath, node: Script.Is.Scope, args: any[]) {
      return {};
    }
  }
}
