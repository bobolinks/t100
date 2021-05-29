import { Is } from '../is/index';
import { rpc } from '../rpc';
import { options } from '../store';
import { ElementKeyboard } from '../isassets/elements/keyboard';;
import Sounds from '../isassets/sounds';

const inputLines = [
  'I am lanwan.',
  'I am smilling.',
  'It is a fine day today.',
];

export default class SceneKeyboard extends Is.Program {
  keyboard: ElementKeyboard;
  title: Is.Elements.Text;
  text: Is.Elements.Text;
  game: {
    line: number;
    offset: number;
  };
  constructor(screen: Is.Screen) {
    super('魔法键盘', {
      char: {
        matchers: [
          {
            name: 'char',
            label: '一个字符',
            exp: /./,
          }],
        code: `if (app.check(char)) { keyboard.zoom(char); app.step(); } else { app.error(char); }`
      },
      word: {
        matchers: [
          {
            name: 'word',
            label: '一个单词',
            exp: /\w+/,
          }],
        code: `app.sound(word)`
      },
    }, screen);
    screen.setupExpectedSize(options.screen);

    const width = options.screen.width * 0.8;
    const height = width / 2;
    const scale = width / 1600;

    this.title = new Is.Elements.Text('title', '要用魔法键盘拼写一个单词，会有惊喜哦', {
      left: `0px`,
      top: `20px`,
      height: `60px`,
      lineHeight: `60px`,
      width: `100%`,
      textAlign: 'center',
      fontSize: '60px',
    });
    screen.addElement(this.title);

    const kbBottom = height + (options.screen.height / 2 - height / 2);

    this.text = new Is.Elements.Text('text', '', {
      left: `0px`,
      top: `${kbBottom + 10}px`,
      height: `60px`,
      lineHeight: `60px`,
      width: `100%`,
      textAlign: 'center',
      fontSize: '60px',
    });
    screen.addElement(this.text);

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

    // game init
    this.game = {
      line: 0,
      offset: 0,
    };
  }
  launch(css: string) {
    super.launch(css);
  }
  input(charCode: number, line: string): any {
    const char = String.fromCharCode(charCode);
    this.keyboard.shine(char);
    this.text.setText(line);
    Sounds.paly('click');
  }
  execute(name: string, args: any[]): any {
    this.text.setText('');
    Sounds.paly('enter');
    return super.execute(name, args);
  }
  check(value: string) {
    const tar = inputLines[this.game.line].charAt(this.game.offset);
    return value === tar || value.toUpperCase() === tar;
  }
  step() {
    const line = inputLines[this.game.line];
    if (this.game.offset === (line.length - 1)) {
      if (this.game.line === (inputLines.length - 1)) {
        this.game.line = 0;
      } else {
        this.game.line++;
      }
    } else {
      this.game.offset++;
    }
  }
  error(value: string) {
    Sounds.paly('en');
    this.keyboard.shine(inputLines[this.game.line].charAt(this.game.offset));
  }
  sound(name: string) {
    Sounds.paly(name);
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
