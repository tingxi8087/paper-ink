import { defaultToken, type ThemeConfig, type ThemeToken, type Tone } from 'paper-ink';
export const STORAGE_KEY = 'paper-ink.theme-lab.v1';
export type LabConfig = { token: ThemeToken; components: NonNullable<ThemeConfig['components']> };
export const toneFields = ['solid', 'solidHover', 'solidActive', 'onSolid', 'subtle', 'onSubtle', 'border'] as const;
export const presets = [{ name: '墨黑', tone: defaultToken.color.primary }, { name: '信息蓝', tone: defaultToken.color.info }, { name: '草木绿', tone: defaultToken.color.success }];
export const freshConfig = (): LabConfig => ({ token: structuredClone(defaultToken), components: { Button: { paddingInline: 15 } } });
export const validColor = (color: unknown): color is string => typeof color === 'string' && /^#[\da-f]{6}$/i.test(color);
const rgb = (color: string) => [1, 3, 5].map(start => parseInt(color.slice(start, start + 2), 16));
export function contrast(foreground: string, background: string): number | undefined {
  if (!validColor(foreground) || !validColor(background)) return undefined;
  const light = (color: string) => rgb(color).map(channel => { const value = channel / 255; return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4; }).reduce((sum, value, index) => sum + value * [.2126, .7152, .0722][index], 0);
  const a = light(foreground), b = light(background); return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
}
function blend(color: string, target: number, amount: number) { return '#' + rgb(color).map(channel => Math.round(channel + (target - channel) * amount).toString(16).padStart(2, '0')).join(''); }
export function generateTone(solid: string): Tone {
  if (!validColor(solid)) throw new Error('请输入六位不透明 HEX 颜色');
  const onSolid = contrast('#ffffff', solid)! >= contrast('#000000', solid)! ? '#ffffff' : '#000000';
  const subtle = blend(solid, 255, .93);
  let onSubtle = blend(solid, 0, .45);
  for (let amount = .5; contrast(onSubtle, subtle)! < 4.5 && amount <= 1; amount += .05) onSubtle = blend(solid, 0, Math.min(1, amount));
  return { solid, solidHover: blend(solid, 255, .16), solidActive: blend(solid, 0, .18), onSolid, subtle, onSubtle, border: blend(solid, 255, .6) };
}
// Validate stored values against the known shape. Unknown fields never enter the theme.
export function restoreConfig(raw: string | null): LabConfig {
  const fallback = freshConfig(); if (!raw) return fallback;
  try {
    const saved = JSON.parse(raw);
    const ranges: Record<string, [number, number]> = { 'radius.control':[0,24], 'font.size':[12,20], 'control.height.small':[20,36], 'control.height.middle':[24,48], 'control.height.large':[32,56] };
    const walk = (base: any, value: any, path = ''): any => Object.fromEntries(Object.entries(base).map(([key, current]) => {
      const next = path ? `${path}.${key}` : key;
      if (typeof current === 'object') return [key, walk(current, value?.[key], next)];
      if (typeof current === 'number') { const range = ranges[next], candidate = value?.[key]; return [key, range && typeof candidate === 'number' && Number.isFinite(candidate) && candidate >= range[0] && candidate <= range[1] ? candidate : current]; }
      return [key, key === 'family' ? current : validColor(value?.[key]) ? value[key] : current];
    }));
    fallback.token = walk(fallback.token, saved?.token);
    for (const component of ['Button', 'Input', 'Modal'] as const) {
      const fields = component === 'Modal' ? ['radius', 'padding'] : ['radius', 'paddingInline'];
      if (!saved?.components?.[component]) { delete fallback.components[component]; continue; }
      const values: Record<string, number> = {};
      for (const key of fields) { const value = saved.components[component][key]; if (typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= (key === 'radius' ? 24 : 40)) values[key] = value; }
      fallback.components[component] = values;
    }
    return fallback;
  } catch { return fallback; }
}
