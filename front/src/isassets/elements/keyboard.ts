import { Is } from '../../is/index';
import { ShapeKey } from '../shapes/keyboard';

const keysLayout = [
  [['`', '~'], ['1', '!'], ['2', '@'], ['3', '#'], ['4', '$'], ['5', '%'], ['6', '^'], ['7', '&'], ['8', '*'], ['9', '('], ['0', ')'], ['_', '-'], ['=', '+'], ['delete']],
  [['tab'], ['Q'], ['W'], ['E'], ['R'], ['T'], ['Y'], ['U'], ['I'], ['O'], ['P'], ['[', '{'], [']', '}'], ['\\', '|']],
  [['caps lock'], ['A'], ['S'], ['D'], ['F'], ['G'], ['H'], ['J'], ['K'], ['L'], [';', ':'], ['\'', '"'], ['return', 'enter']],
  [['shift'], ['Z'], ['X'], ['C'], ['V'], ['B'], ['N'], ['M'], [',', '<'], ['.', '>'], ['/', '?'], ['shift']],
  [['fn'], ['control', '^'], ['option', '⎇'], ['command', '⌘'], [' '], ['command', '⌘'], ['option', '⎇'], ['←'], ['↓'], ['→']],
];
const keyValuesUp = ['↑'];
const keysWidths: any = {
  delete: 'auto',
  tab: 'auto',
  'caps lock': 'auto',
  return: 'auto',
  shift: 'auto',
  command: 1.6,
  ' ': 'auto',
};

export class ElementKeyboard extends Is.Elements.Canvas {
  keys: Record<string, ShapeKey>;
  constructor(name: string, size: Is.Size, style?: Is.Styles, scale?: number, canvasStyles?: Is.CanvasStyles) {
    super(name, size, style, undefined, scale);
    this.keys = {};

    const cxt = this.dom.getContext('2d');
    if (cxt && canvasStyles) {
      for (const [k, v] of Object.entries(canvasStyles)) {
        (cxt as any)[k] = v;
      }
    }

    const padding = 8;
    const gapping = 12;
    const width = size.width - padding * 2;
    const height = size.height - padding * 2;
    const itWidth = (width - (gapping * 13)) / 14.5;
    let y = padding + (height - (itWidth * 5) - (gapping * 4)) / 2;
    for (const row of keysLayout) {
      let leftWidth = width - (gapping * (row.length - 1));
      const widths = Array<any>(row.length);
      const autoWidthIds = [];
      for (let i = 0; i < row.length; i++) {
        const values = row[i];
        const widthHint = keysWidths[values[0]];
        if (typeof widthHint === 'number') {
          widths[i] = widthHint * itWidth;
        } else if (typeof widthHint === 'undefined') {
          widths[i] = itWidth;
        } else {
          autoWidthIds.push(i);
          continue;
        }
        leftWidth -= widths[i];
      }
      autoWidthIds.forEach(e => {
        widths[e] = leftWidth / autoWidthIds.length;
      });
      let x = padding;
      for (let i = 0; i < row.length; i++) {
        const values = row[i];
        const arrowIndex = '←↓→'.indexOf(values[0]);
        let yy = y;
        if (arrowIndex !== -1) {
          yy = y + 4 + itWidth / 2;
        }

        const key = new ShapeKey(values as any,
          i < row.length / 2 ? 'left' : 'right',
          {
            left: x,
            top: yy,
            width: widths[i],
            height: arrowIndex !== -1 ? (-4 + itWidth / 2) : itWidth,
          },
        );

        this.add(key);
        values.forEach(k => {
          this.keys[k] = key;
        });

        // add up key
        if (arrowIndex === 1) {
          const up = new ShapeKey(keyValuesUp as any,
            'right',
            {
              left: x,
              top: y,
              width: widths[i],
              height: (-2 + itWidth / 2),
            },
          );
          this.add(up);
          keyValuesUp.forEach(k => {
            this.keys[k] = key;
          });
        }
        x += widths[i] + gapping;
      }
      y += itWidth + gapping;
    }
  }
  shine(key: string) {
    const k = this.keys[key] || this.keys[key.toUpperCase()];
    k?.shine(1000);
  }
  zoom(key: string) {
    const k = this.keys[key] || this.keys[key.toUpperCase()];
    k?.zoom(3000, { x: this.size.width / 2, y: this.size.height / 2 }, 4);
  }
}
