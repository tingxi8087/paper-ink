import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { documentation, documentationGroups, searchDocumentation } from './documentation';

describe('documentation search', () => {
 it('keeps every navigation route unique and searchable', () => {
   expect(new Set(documentation.map(entry => entry.route)).size).toBe(documentation.length);
   expect(documentationGroups.reduce((count, group) => count + group.items.length, 0)).toBe(documentation.length);
   for (const entry of documentation) expect(searchDocumentation(entry.route).some(result => result.route === entry.route)).toBe(true);
 });
 it('covers every routed documentation page in main', () => {
   const main = readFileSync('apps/website/src/main.tsx', 'utf8');
   const pages = main.slice(main.indexOf('const pages:'), main.indexOf('return <DocLayout'));
   const routes = [...pages.matchAll(/(?:'([^']*)'|\b([a-z][a-z-]*)):\s*</g)].map(match => match[1] ?? match[2]).filter(Boolean);
   expect([...new Set(routes)].sort()).toEqual(documentation.map(entry => entry.route).sort());
 });
 it.each([
   ['输入框', 'input'], ['INPUT', 'input'], ['Password', 'input'], ['TextArea', 'input'],
   ['弹窗', 'modal'], ['日期范围', 'date-picker'], ['useUpload', 'upload'],
   ['useRefState', 'hooks'], ['useLocalstorageState', 'hooks'], ['useTableHooks', 'table'],
   ['useBasePageTable', 'table'], ['useTableChecked', 'table'], ['useWatch', 'form'], ['useFieldState', 'form'], ['useFormState', 'form'],
   ['SimpleGrid', 'arrangement'], ['主题变量', 'theme'],
 ])('resolves %s to %s', (query, route) => expect(searchDocumentation(query)[0].route).toBe(route));
 it('ranks names before aliases and descriptions, and preserves stable ties', () => {
   const make = (route: string, label: string, aliases: string[], description: string) => ({ route, label, aliases, description, group:'test' });
   const entries = [make('description','Example',[],'Input element'), make('alias','Other',['Input'],''), make('input','Input',[],''), make('input-other','Input Other',[], '')];
   expect(searchDocumentation('input',entries).map(entry => entry.route)).toEqual(['input','input-other','alias','description']);
 });
 it('supports multiword searches and empty / unmatched input', () => {
   expect(searchDocumentation(' input 密码 ').map(entry => entry.route)).toEqual(['input']);
   expect(searchDocumentation('   ')).toEqual(documentation);
   expect(searchDocumentation('不存在的组件')).toEqual([]);
   expect(searchDocumentation('date_picker')[0].route).toBe('date-picker');
 });
});
