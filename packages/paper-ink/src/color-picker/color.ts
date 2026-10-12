import { inputToRGB, rgbToHsv, hsvToRgb, rgbToHex, rgbaToHex } from '@ctrl/tinycolor';
export interface HsbColor { h: number; s: number; b: number; a?: number }
export interface RgbColor { r: number; g: number; b: number; a?: number }
export type ColorValue = string | Color | HsbColor | RgbColor | null;
export type ColorFormat = 'hex' | 'rgb' | 'hsb';
const bounded = (value: number, min: number, max: number) => Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : min;
const rounded = (value: number) => Number(value.toFixed(3));

/** Immutable HSB state. Display conversion never becomes the source of truth. */
export class Color {
  readonly h: number; readonly s: number; readonly b: number; readonly a: number;
  readonly cleared: boolean; readonly isValid: boolean;
  constructor(input: ColorValue = null, previous?: Color) {
    let hsb: HsbColor | undefined;
    const cleared = input == null || input === '' || input instanceof Color && input.cleared;
    let valid = true;
    if (input instanceof Color) { hsb = input.toHsb(); valid = input.isValid; }
    else if (input && typeof input === 'object' && 'h' in input) {
      valid = [input.h, input.s, input.b, input.a ?? 1].every(Number.isFinite);
      hsb = input;
    } else if (!cleared && typeof input === 'string' && /^hsba?\(/i.test(input.trim())) {
      const number = '([+-]?(?:\\d+(?:\\.\\d*)?|\\.\\d+))';
      const match = input.trim().match(new RegExp(`^hsb(a?)\\(\\s*${number}\\s*,\\s*${number}(%?)\\s*,\\s*${number}(%?)\\s*(?:,\\s*${number}\\s*)?\\)$`, 'i'));
      valid = !!match && (match[1].toLowerCase() === 'a' ? match[7] !== undefined : match[7] === undefined);
      if (valid && match) hsb = { h:Number(match[2]), s:Number(match[3])/(match[4]?100:1), b:Number(match[5])/(match[6]?100:1), a:match[7] === undefined ? 1 : Number(match[7]) };
    } else if (!cleared) {
      // HSB text is a display format; CSS uses RGB/HEX. Parse it as HSV.
      const text = typeof input === 'string' ? input.trim().replace(/^hsb(a?)\(/i, 'hsv$1(') : input;
      const parsed = inputToRGB(text as string | RgbColor);
      valid = parsed.ok && [parsed.r, parsed.g, parsed.b, parsed.a].every(Number.isFinite);
      if (valid) {
        const hsv = rgbToHsv(parsed.r, parsed.g, parsed.b);
        hsb = { h: hsv.s === 0 || hsv.v === 0 ? previous?.h ?? hsv.h*360 : hsv.h*360, s: hsv.v === 0 ? previous?.s ?? hsv.s : hsv.s, b: hsv.v, a: parsed.a };
      }
    }
    hsb ??= previous?.toHsb() ?? { h: 0, s: 0, b: 0, a: 1 };
    this.h = bounded(hsb.h, 0, 360); this.s = bounded(hsb.s, 0, 1); this.b = bounded(hsb.b, 0, 1); this.a = bounded(hsb.a ?? 1, 0, 1);
    this.cleared = cleared; this.isValid = valid;
    Object.freeze(this);
  }
  with(change: Partial<HsbColor>): Color { return new Color({ ...this.toHsb(), ...change }); }
  toHsb(): Required<HsbColor> { return { h: this.h, s: this.s, b: this.b, a: this.a }; }
  private rgb() { return hsvToRgb(this.h, `${this.s*100}%`, `${this.b*100}%`); }
  toRgb(): Required<RgbColor> { const {r,g,b}=this.rgb();return {r:Math.round(r),g:Math.round(g),b:Math.round(b),a:this.a}; }
  toHex(): string { const {r,g,b}=this.rgb();return rgbToHex(r,g,b,false); }
  toHexString(): string { return '#'+this.toHex(); }
  toHex8String(): string { const {r,g,b}=this.rgb();return '#'+rgbaToHex(r,g,b,this.a,false); }
  toRgbString(): string { const {r,g,b}=this.toRgb(); return this.a === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${rounded(this.a)})`; }
  toHsbString(): string { return `${this.a === 1 ? 'hsb' : 'hsba'}(${rounded(this.h)}, ${rounded(this.s * 100)}%, ${rounded(this.b * 100)}%${this.a === 1 ? '' : `, ${rounded(this.a)}`})`; }
  toCssString(): string { return this.cleared ? '' : this.a === 1 ? this.toHexString() : this.toRgbString(); }
  format(format: ColorFormat): string { return this.cleared ? '' : format === 'hsb' ? this.toHsbString() : format === 'rgb' ? this.toRgbString() : this.a === 1 ? this.toHexString() : this.toHex8String(); }
}
export function sameColor(left: Color, right: Color): boolean { return left.h === right.h && left.s === right.s && left.b === right.b && left.a === right.a && left.cleared === right.cleared; }
