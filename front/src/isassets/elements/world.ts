import { Is } from '../../is/index';
import { ShapeRain } from '../shapes/rain';

export class ElementWorld extends Is.Elements.Canvas {
  rain: ShapeRain;
  constructor(name: string, size: Is.Size, scale?: number, style?: Is.Styles, canvasStyles?: Is.CanvasStyles) {
    super(name, size, scale, style, canvasStyles);
    this.rain = new ShapeRain('rain', this);
    this.add(this.rain);
  }
}
