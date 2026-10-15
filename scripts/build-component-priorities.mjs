import { readFile, writeFile } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const source = await readFile(new URL('doc/component-priorities.md', root), 'utf8');
const path = new URL('doc/component-priorities.html', root);
const batchNames = ['第一批', '第二批', '第三批'].map(label => {
  const line = source.split('\n').find(row => row.startsWith(`| ${label} |`));
  if (!line) throw new Error(`Missing suggested batch: ${label}`);
  return line.split('|')[2].trim().split('、').map(name => name.trim());
});
const slugs = { FloatButton: 'float-button', AutoComplete: 'auto-complete', ColorPicker: 'color-picker', DatePicker: 'date-picker', InputNumber: 'input-number', TimePicker: 'time-picker', TreeSelect: 'tree-select', QRCode: 'qr-code', ConfigProvider: 'config-provider', BorderBeam: 'border-beam', Util: '_util' };
const items = [];
let category;
for (const line of source.split('\n')) {
  const heading = line.match(/^## (通用|布局|导航|数据录入|数据展示|反馈|其他|Pro Components 扩展生态|Paper Ink 独立组件)（\d+）/);
  if (heading) category = heading[1] === 'Pro Components 扩展生态' ? 'Pro 扩展' : heading[1];
  else if (line.startsWith('## ')) category = undefined;
  if (!category || !line.startsWith('| ') || !/\| [1-5]\/5 \|/.test(line)) continue;
  const [label, rating, cost, reason] = line.slice(1, -1).split('|').map(cell => cell.trim());
  const name = label.split(' ')[0];
  const status = label.includes('（已有）') ? 'done' : label.includes('（独立方案）') ? 'independent' : label.includes('（暂不实现）') ? 'deferred' : 'pending';
  const batchIndex = batchNames.findIndex(names => names.includes(name));
  const scope = category === 'Paper Ink 独立组件' ? 'own' : category === 'Pro 扩展' ? 'pro' : 'core';
  const displayCategory = scope === 'own' ? (name === 'TablerIcons' ? '通用' : name === 'Form' || name === 'Upload' ? '数据录入' : name === 'Table' ? '数据展示' : name.startsWith('use') ? '其他' : '布局') : category;
  items.push({ name, cn: label.slice(name.length).replace(/（(?:已有|独立方案|暂不实现)）/g, '').trim(), category: displayCategory, scope, score: Number(rating[0]), cost, status, reason, batch: status === 'done' ? 'done' : status === 'independent' || status === 'deferred' ? status : batchIndex < 0 ? 'later' : String(batchIndex + 1), order: items.length, url: scope === 'own' ? (name === 'TablerIcons' ? 'icons.md' : name === 'Upload' || name === 'useUpload' ? 'upload-design.md' : name === 'useRefState' || name === 'useLocalstorageState' ? 'hooks.md' : name === 'Form' ? 'form-design.md' : name === 'Table' || name.startsWith('use') ? 'table-design.md' : 'layout-components.md') : scope === 'core' ? `https://ant.design/components/${slugs[name] ?? name.toLowerCase()}/` : 'https://procomponents.ant.design/' });
}
if (items.filter(item => item.scope === 'core').length !== 73 || items.filter(item => item.scope === 'pro').length !== 6) throw new Error('Component count changed; review and update the catalog count before generating.');
const html = await readFile(path, 'utf8');
const marker = /(<script id="catalog" type="application\/json">)[\s\S]*?(<\/script>)/;
if (!marker.test(html)) throw new Error('Catalog marker missing.');
const json = JSON.stringify(items).replaceAll('<', '\\u003c');
await writeFile(path, html.replace(marker, (_, start, end) => start + json + end));
console.log(`Generated component planning catalog: ${items.length} entries from Markdown.`);
