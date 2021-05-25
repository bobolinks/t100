import { Is } from '../is/index';

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

export default class extends Is.Element<HTMLDivElement> {
  constructor(name: string, value: number, rect: Is.Rect, style?: Is.Styles) {
    super('div', name, rect, style);
    this.setValue(value);
  }
  setValue(value: number) {
    this.element.innerHTML = [...value.toString()].map(e => `<span style='color:${colors[parseInt(e)]};'>${e}</span>`).join('');
  }
}
