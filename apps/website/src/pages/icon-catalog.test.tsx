import { describe, expect, it } from 'vitest';
import { findIcons, iconCatalog } from './icon-catalog';
describe('Tabler icon catalog',()=>{
  it('lists actual icon components with unique names',()=>{
    expect(iconCatalog.length).toBeGreaterThan(1000);
    expect(new Set(iconCatalog.map(icon=>icon.name)).size).toBe(iconCatalog.length);
    expect(iconCatalog.some(icon=>icon.name==='IconSearch')).toBe(true);
  });
  it('filters by English names, common Chinese keywords and style',()=>{
    expect(findIcons('搜索','all').some(icon=>icon.name==='IconSearch')).toBe(true);
    expect(findIcons('IconSearch','outline').every(icon=>!icon.filled)).toBe(true);
    expect(findIcons('Heart','filled').some(icon=>icon.name==='IconHeartFilled')).toBe(true);
    expect(findIcons('不会存在的图标','all')).toEqual([]);
  });
});
