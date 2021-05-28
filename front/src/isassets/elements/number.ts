import { Is } from '../../is/index';

const colors = [
  'red',
  'forestgreen',
  'sandybrown',
  'coral',
  'chocolate',
  'brown',
  'purple',
  'blueviolet',
  'royalblue',
  'blue'
];

export class ElementNumber extends Is.Element<HTMLDivElement> {
  constructor(name: string, value: number, style?: Is.Styles) {
    super('div', name, style);
    this.setValue(value);
  }
  setValue(value: number) {
    this.dom.innerHTML = [...value.toString()].map(e => `<span style='color:${colors[parseInt(e)]};'>${e}</span>`).join('');
  }
}
