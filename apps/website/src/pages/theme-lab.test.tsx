import { describe, expect, it } from 'vitest';
import { contrast, freshConfig, generateTone, restoreConfig, validColor } from './theme-lab';
describe('theme laboratory configuration', () => {
  it('uses independent defaults with stable spacing', () => {
    const first = freshConfig(), second = freshConfig();
    first.token.color.primary.solid = '#ffffff';
    expect(second.token.color.primary.solid).toBe('#171717');
    expect(first.token.spacing).toEqual({ small: 4, medium: 8, large: 16 });
  });
  it('calculates actual contrast and rejects invalid or transparent colors', () => {
    expect(contrast('#000000', '#ffffff')).toBe(21);
    expect(contrast('#ffffff', '#ffffff')).toBe(1);
    expect(contrast('#00000080', '#ffffff')).toBeUndefined();
    expect(validColor('red')).toBe(false);
    expect(validColor('#123456')).toBe(true);
  });
  it('only generates tones explicitly with readable foregrounds', () => {
    for (const color of ['#000000','#ffffff','#1677ff','#faad14','#747474','#ffff00']) {
      const tone = generateTone(color);
      expect(tone.solid).toBe(color);
      expect(contrast(tone.onSolid, tone.solid)).toBeGreaterThanOrEqual(4.5);
      expect(Object.values(tone).every(validColor)).toBe(true);
      expect(contrast(tone.onSubtle, tone.subtle)).toBeGreaterThanOrEqual(4.5);
    }
    expect(() => generateTone('transparent')).toThrow();
  });
  it('restores complete themes and component switches', () => {
    const config = freshConfig(); config.token.color.primary.solid = '#123456';
    config.components.Input = {radius:12,paddingInline:9}; delete config.components.Button;
    expect(restoreConfig(JSON.stringify(config))).toEqual(config);
  });
  it('recovers corrupt storage while rejecting unsafe fields', () => {
    expect(restoreConfig('{')).toEqual(freshConfig());
    const config = restoreConfig(JSON.stringify({token:{color:{primary:{solid:'#ffffff80'}},radius:{control:-3},font:{size:0,family:"hacked"},spacing:{small:100},motion:{duration:0},control:{height:{middle:0}}},components:{Input:{radius:12,paddingInline:'evil'},Button:null}}));
    expect(config.token.color.primary.solid).toBe('#171717');
    expect(config.token.radius.control).toBe(6);
    expect(config.token.font.size).toBe(14);
    expect(config.token.control.height.middle).toBe(32);
    expect(config.token.spacing).toEqual({small:4,medium:8,large:16});
    expect(config.token.motion.duration).toBe(140);
    expect(config.components.Input).toEqual({radius:12});
    expect(config.components.Button).toBeUndefined();
  });
});
