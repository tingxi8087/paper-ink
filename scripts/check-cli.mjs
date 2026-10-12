import { mkdtemp, writeFile, readFile, readdir, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
const root = process.cwd();
const consumerReactVersion = process.env.PAPER_INK_REACT_VERSION ?? '19.3.0';
const consumerReactTypes = consumerReactVersion.startsWith('18.') ? '^18.3.0' : '^19.0.0';
const temp = await mkdtemp(join(tmpdir(), 'paper-ink-cli-consumer-'));
const consumer = join(temp, 'app');
const run = (cmd, args, cwd = consumer) => execFileSync(cmd, args, { cwd, stdio: 'inherit', timeout: 120000 });
let server;
let browser;
try {
  for (const pkg of ['paper-ink', 'cli']) run('pnpm', ['--dir', `packages/${pkg}`, 'pack', '--pack-destination', temp], root);
  const archives = await readdir(temp);
  const libArchive = archives.find(name => /^paper-ink-\d/.test(name) && name.endsWith('.tgz'));
  const cliArchive = archives.find(name => /cli.*\.tgz$/.test(name));
  assert.ok(libArchive && cliArchive);
  await mkdir(join(consumer, 'src'), { recursive: true });
  await writeFile(join(consumer, 'package.json'), JSON.stringify({ private: true, type: 'module', dependencies: { 'paper-ink': `file:${join(temp, libArchive)}`, '@paper-ink/cli': `file:${join(temp, cliArchive)}`, react: consumerReactVersion, 'react-dom': consumerReactVersion, dayjs: '^1.11.23' }, devDependencies: { vite: '7.3.7', typescript: '5.9.3', '@types/react': consumerReactTypes, '@types/react-dom': consumerReactTypes } }));
  await writeFile(join(consumer, 'tsconfig.json'), JSON.stringify({ compilerOptions: { target: 'ES2022', lib: ['ES2022', 'DOM'], module: 'ESNext', moduleResolution: 'Bundler', jsx: 'react-jsx', strict: true, skipLibCheck: true, noEmit: true }, include: ['src'] }));
  run('pnpm', ['install', '--offline', '--ignore-scripts']);
  run('pnpm', ['exec', 'paper-ink', '--version']);
  run('pnpm', ['exec', 'paper-ink', 'init']);
  run('pnpm', ['exec', 'paper-ink', 'add', 'button', 'input', 'modal', 'stack', 'inline', 'simple-grid', 'checkbox', 'radio', 'switch', 'tabs', 'select', 'tooltip', 'message', 'tag', 'alert', 'spin', 'empty', 'typography', 'divider', 'avatar', 'badge', 'card', 'descriptions', 'dropdown', 'popover', 'popconfirm', 'drawer', 'breadcrumb', 'pagination', 'collapse', 'segmented', 'progress', 'skeleton', 'input-number', 'app', 'rate', 'timeline', 'result', 'form', 'table', 'table-hooks', 'use-ref-state', 'hooks', 'use-localstorage-state', 'date-picker', 'time-picker', 'menu', 'statistic', 'util', 'layout', 'splitter', 'steps', 'auto-complete', 'slider', 'notification', 'image', '--dry-run']);
  assert.equal((await readdir(join(consumer, 'src'))).length, 0);
  run('pnpm', ['exec', 'paper-ink', 'add', 'button', 'input', 'modal', 'stack', 'inline', 'simple-grid', 'checkbox', 'radio', 'switch', 'tabs', 'select', 'tooltip', 'message', 'tag', 'alert', 'spin', 'empty', 'typography', 'divider', 'avatar', 'badge', 'card', 'descriptions', 'dropdown', 'popover', 'popconfirm', 'drawer', 'breadcrumb', 'pagination', 'collapse', 'segmented', 'progress', 'skeleton', 'input-number', 'app', 'rate', 'timeline', 'result', 'form', 'table', 'table-hooks', 'use-ref-state', 'hooks', 'use-localstorage-state', 'date-picker', 'time-picker', 'menu', 'statistic', 'util', 'layout', 'splitter', 'steps', 'auto-complete', 'slider', 'notification', 'image']);
  run('pnpm', ['exec', 'paper-ink', 'add', 'button', 'input', 'modal', 'stack', 'inline', 'simple-grid', 'checkbox', 'radio', 'switch', 'tabs', 'select', 'tooltip', 'message', 'tag', 'alert', 'spin', 'empty', 'typography', 'divider', 'avatar', 'badge', 'card', 'descriptions', 'dropdown', 'popover', 'popconfirm', 'drawer', 'breadcrumb', 'pagination', 'collapse', 'segmented', 'progress', 'skeleton', 'input-number', 'app', 'rate', 'timeline', 'result', 'form', 'table', 'table-hooks', 'use-ref-state', 'hooks', 'use-localstorage-state', 'date-picker', 'time-picker', 'menu', 'statistic', 'util', 'layout', 'splitter', 'steps', 'auto-complete', 'slider', 'notification', 'image']);
  await writeFile(join(consumer, 'index.html'), '<!doctype html><html><head><meta charset="utf-8" /></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>');
  await writeFile(join(consumer, 'src/main.tsx'), `import { useState } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { createRoot } from 'react-dom/client';
import type { GetProp as LocalGetProp, GetRef as LocalGetRef } from './components/paper-ink/util';
import type { GetProp as NpmGetProp } from 'paper-ink/util';
type LocalOptions = LocalGetProp<{options?: string[]},'options'>;
const typedOptions:LocalOptions=['ok'];
const typedNumber:NpmGetProp<{value?:number},'value'>=1;
void typedOptions;void typedNumber;
import * as LocalComponents from './components/paper-ink/index';
import * as NpmComponents from 'paper-ink';
import * as Npm from 'paper-ink';
import * as Local from './components/paper-ink';
import { Button as NpmButton, Input as NpmInput, Modal as NpmModal, ConfigProvider as NpmProvider, Stack as NpmStack, Inline as NpmInline, SimpleGrid as NpmGrid } from 'paper-ink';
import { Button as LocalButton, Input as LocalInput, Modal as LocalModal, ConfigProvider as LocalProvider, Stack as LocalStack, Inline as LocalInline, SimpleGrid as LocalGrid } from './components/paper-ink';
import 'paper-ink/style.css';
import './components/paper-ink/style.css';
function FormFeatures({ source }: { source: 'Local' | 'Npm' }) {
 const C = source === 'Local' ? LocalComponents : NpmComponents;
 const form = C.useForm({ defaultValues: { name: '', on: false } });
 const [saved, setSaved] = useState('');
 return <C.Form form={form} onSubmit={values => setSaved(JSON.stringify(values))}><C.Form.Field name="name" required><C.Input aria-label={source + ' form name'} /></C.Form.Field><C.Form.Field name="on"><C.Switch aria-label={source + ' form switch'} /></C.Form.Field><C.Button htmlType="submit">{source} form submit</C.Button><output aria-label={source + ' form saved'}>{saved}</output></C.Form>;
}
function DateFeatures({ source }: { source: 'Local' | 'Npm' }) {
 const C = source === 'Local' ? LocalComponents : NpmComponents;
 const [date,setDate] = useState<Dayjs | null>(dayjs('2026-10-12'));
 const [time,setTime] = useState<Dayjs | null>(dayjs('2026-10-12T09:00:00'));
 const [rangeText,setRangeText] = useState('');
 return <div aria-label={source+' date features'}><C.DatePicker aria-label={source+' date'} value={date} onChange={setDate} /><output aria-label={source+' date saved'}>{date?.format('YYYY-MM-DD') ?? 'empty'}</output><C.DatePicker.RangePicker placeholder={[source+' range start',source+' range end']} onChange={(_,texts)=>setRangeText(texts.join('/'))} /><output aria-label={source+' range saved'}>{rangeText}</output><C.TimePicker aria-label={source+' time'} format="HH:mm" value={time} onChange={setTime} /><output aria-label={source+' time saved'}>{time?.format('HH:mm') ?? 'empty'}</output></div>;
}
function NewFeatures({ source }: { source: 'Local' | 'Npm' }) {
 const C=source==='Local'?LocalComponents:NpmComponents;
 const [api,holder]=C.useNotification({duration:0});
 return <div aria-label={source+' additions'}>{holder}<C.Statistic title={source+' total'} value="12345678901234567890.125" precision={2} />
 <C.Layout><C.Layout.Sider collapsible width={120}>{source+' sidebar'}</C.Layout.Sider><C.Layout.Content>{source+' content'}</C.Layout.Content></C.Layout>
 <C.Splitter style={{height:100,width:300}}><C.Splitter.Panel defaultSize={120} min={60}>A</C.Splitter.Panel><C.Splitter.Panel>B</C.Splitter.Panel></C.Splitter>
 <C.Steps items={[{title:source+' first'},{title:source+' second'}]} />
 <C.AutoComplete aria-label={source+' suggestions'} options={[{value:source+' choice'}]} />
 <C.Slider ariaLabelForHandle={source+' adjustment'} defaultValue={30} tooltip={{formatter:null}} />
 <C.Button onClick={()=>api.success({message:source+' notice'})}>{source+' notify'}</C.Button>
 <C.Image src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='60'%3E%3Crect width='100' height='60' fill='black'/%3E%3C/svg%3E" alt={source+' picture'} width={100} />
 </div>;
}
function MenuFeatures({ source }: { source: 'Local' | 'Npm' }) {
 const C=source==='Local'?LocalComponents:NpmComponents;
 const [selected,setSelected]=useState<string[]>([]), [opened,setOpened]=useState<string[]>(['branch']);
 return <div aria-label={source+' menu features'}>
  <C.Menu aria-label={source+' side menu'} selectedKeys={selected} openKeys={opened} onOpenChange={setOpened} onSelect={info=>setSelected(info.selectedKeys)} items={[{key:'branch',label:source+' side branch',children:[{key:'leaf',label:source+' side leaf'}]},{key:'disabled',label:source+' disabled navigation',disabled:true}]} />
  <output aria-label={source+' menu selected'}>{selected.join(',')}</output>
  <C.Menu mode="horizontal" aria-label={source+' top menu'} items={[{key:'top',label:source+' top root',children:[{key:'top-leaf',label:source+' top leaf'}]}]} />
  <C.Menu inlineCollapsed aria-label={source+' collapsed menu'} items={[{key:'collapsed',label:source+' collapsed root',children:[{key:'collapsed-leaf',label:source+' collapsed leaf'}]}]} />
 </div>;
}
function TableFeatures({ source }: { source: 'Local' | 'Npm' }) {
 const C = source === 'Local' ? LocalComponents : NpmComponents;
 const table = C.useBasePageTable<{id:number;name:string;_checked?:boolean}, {term?:string}>({defaultPageSize:2,debounceTime:0,getTableData:async (query,signal) => { if(signal.aborted) throw new Error('Cancelled'); return {data:[{id:query.pageNum*10+1,name:source+' table row '+query.pageNum},{id:query.pageNum*10+2,name:'Second row'}],total:6}; }});
 const selection = C.useTableChecked({tableData:table.tableData,setTableData:table.setTableData,idName:'id'});
 const [count,setCount,countRef] = C.useRefState(0);
 const [expandedIds,setExpandedIds] = useState<(string|number)[]>([]);
 const [stored,setStored] = C.useLocalstorageState(0,source+'-consumer-count');
 return <div aria-label={source+' table features'}><C.Table rowKey="id" source={table} selection={selection} expansion={{expandedIds,setExpandedIds,render:row=><span>{source+' detail '+row.id}</span>}} columns={[{title:'Name',dataIndex:'name',ellipsis:true,onCell:(_row,index)=>({rowSpan:index===0?2:0}),onHeaderCell:()=>({colSpan:2})},{title:'ID',dataIndex:'id'}]} /><output aria-label={source+' table selected'}>{selection.checkedCount}</output><C.Button onClick={()=>{setCount(n=>n+1);setCount(n=>n+1);}}>{source+' refstate '+count}</C.Button><output aria-label={source+' ref latest'}>{countRef.current}</output><C.Button onClick={()=>setStored(n=>n+1)}>{source+' stored '+stored}</C.Button></div>;
}
function ModernFeatures({ source }: { source: 'Local' | 'Npm' }) {
 const C = source === 'Local' ? LocalComponents : NpmComponents;
 const [drawer, setDrawer] = useState(false); const [searchResult, setSearchResult] = useState('');
 function Actions() { const app = C.App.useApp(); return <C.Button onClick={() => app.modal.confirm({ title: source + ' modern confirm', content: 'Ready' })}>{source} context confirm</C.Button>; }
 return <><C.Breadcrumb items={[{ title: 'Home' }, { title: 'Settings' }]} /><C.Typography.Title level={3}>Modern components</C.Typography.Title><C.Divider />
 <C.Card title="Profile"><C.Badge count={3}><C.Avatar>PI</C.Avatar></C.Badge><C.Descriptions items={[{ key: 'name', label: 'Name', children: 'Paper Ink' }]} /></C.Card>
 <C.Input.Search aria-label={source + ' search input'} enterButton="Search" allowClear onSearch={(value,event,info) => setSearchResult((info?.source ?? 'input') + ':' + value)} /><output aria-label={source + ' search result'}>{searchResult}</output><C.Input.Password aria-label={source + ' password input'} defaultValue="secret" /><C.InputNumber aria-label={source + ' precise number'} stringMode defaultValue="0.000000000000000001" step="0.000000000000000001" />
 <C.Segmented options={['List', 'Grid']} /><C.Progress percent={50} /><C.Skeleton loading={false}>Loaded</C.Skeleton>
 <C.Collapse items={[{key:'details',label:source+' Details',children:'Visible details'}]} />
 <C.Pagination total={40} /><C.Dropdown trigger={['click']} menu={{items:[{key:'copy',label:source+' Copy'}]}}><C.Button>{source} menu</C.Button></C.Dropdown>
 <C.Popover trigger="click" content={<C.Input placeholder="Popup input" />}><C.Button>{source} card popup</C.Button></C.Popover>
 <C.Popconfirm title="Delete?" onConfirm={() => Promise.resolve()}><C.Button>{source} delete</C.Button></C.Popconfirm>
 <C.Button onClick={() => setDrawer(true)}>{source} drawer</C.Button><C.Drawer title={source+' Drawer'} open={drawer} onClose={() => setDrawer(false)}>Drawer content</C.Drawer>
 <C.Rate aria-label={source + ' rating'} defaultValue={2.5} allowHalf /><C.Timeline items={[{title:'09:00',content:source + ' timeline entry'}]} /><C.Result status="success" title={source + ' ready'} extra={<C.Button>{source} result action</C.Button>} />
 <C.App><Actions /></C.App></>;
}
function FeatureSet({ source }: { source: 'Local' | 'Npm' }) {
 const ui = source === 'Local' ? Local : Npm;
 const [api, holder] = ui.message.useMessage();
 return <>{holder}<form><ui.Checkbox name={source+'-check'} defaultChecked>{source} checkbox</ui.Checkbox><ui.Radio.Group name={source+'-radio'} defaultValue="a" options={[{value:'a',label:source+' radio A'},{value:'b',label:source+' radio B'}]} /><ui.Switch aria-label={source+' switch'} /><ui.Select aria-label={source+' select'} name={source+'-select'} options={[{value:'a',label:source+' option A'},{value:'b',label:source+' option B'}]} allowClear /><ui.Tabs items={[{key:'a',label:source+' tab A',children:source+' panel A'},{key:'b',label:source+' tab B',children:source+' panel B'}]} /><ui.Tag closable>{source} tag</ui.Tag><ui.Alert title={source+' alert'} closable /><ui.Spin spinning={false}><span>{source} content</span></ui.Spin><ui.Empty description={source+' empty'} /><ui.Tooltip title={source+' hint'}><ui.Button>{source} tooltip</ui.Button></ui.Tooltip><ui.Button onClick={()=>api.success(source+' message',0)}>{source} message</ui.Button><ui.Button onClick={()=>api.destroy()}>{source} close message</ui.Button></form></>;
}
function Demo() {
 const [local, setLocal] = useState(0); const [npm, setNpm] = useState(0);
 const [localOpen, setLocalOpen] = useState(false); const [npmOpen, setNpmOpen] = useState(false);
 const theme = { token: { color: { primary: { solid: '#1677ff' } }, radius: { control: 12 } } };
 return <><h1>Paper Ink dual distribution</h1>
 <section aria-label="CLI source"><LocalProvider theme={theme}><FeatureSet source="Local" /><ModernFeatures source="Local" /><FormFeatures source="Local" /><TableFeatures source="Local" /><DateFeatures source="Local" /><MenuFeatures source="Local" /><NewFeatures source="Local" /><LocalStack aria-label="Local stack"><LocalInline><span>One</span><span>Two</span></LocalInline><LocalGrid columns={2}><span>First</span><LocalGrid.Item span="full">Full</LocalGrid.Item></LocalGrid></LocalStack><LocalButton type="primary" size="large" onClick={() => setLocal(local + 1)}>Local {local}</LocalButton><LocalButton disabled>Local disabled</LocalButton><LocalInput aria-label="Local input" defaultValue="Source" allowClear /><LocalInput.TextArea aria-label="Local textarea" autoSize={{ minRows: 2, maxRows: 4 }} /><LocalButton onClick={() => setLocalOpen(true)}>Local modal</LocalButton><LocalModal title="Local dialog" open={localOpen} onOk={() => setLocalOpen(false)} onCancel={() => setLocalOpen(false)}><LocalInput placeholder="Portal input" /></LocalModal></LocalProvider></section>
 <section aria-label="npm package"><NpmProvider theme={theme}><FeatureSet source="Npm" /><ModernFeatures source="Npm" /><FormFeatures source="Npm" /><TableFeatures source="Npm" /><DateFeatures source="Npm" /><MenuFeatures source="Npm" /><NewFeatures source="Npm" /><NpmStack aria-label="Npm stack"><NpmInline><span>One</span><span>Two</span></NpmInline><NpmGrid columns={2}><span>First</span><NpmGrid.Item span="full">Full</NpmGrid.Item></NpmGrid></NpmStack><NpmButton type="primary" size="large" onClick={() => setNpm(npm + 1)}>Npm {npm}</NpmButton><NpmButton disabled>Npm disabled</NpmButton><NpmInput aria-label="Npm input" defaultValue="Package" allowClear /><NpmInput.TextArea aria-label="Npm textarea" autoSize={{ minRows: 2, maxRows: 4 }} /><NpmButton onClick={() => setNpmOpen(true)}>Npm modal</NpmButton><NpmModal title="Npm dialog" open={npmOpen} onOk={() => setNpmOpen(false)} onCancel={() => setNpmOpen(false)}><NpmInput placeholder="Portal input" /></NpmModal></NpmProvider></section></>;
}
createRoot(document.getElementById('root')!).render(<Demo />);`);
  run('pnpm', ['exec', 'tsc', '--noEmit']);
  run('pnpm', ['exec', 'vite', 'build']);
  const require = createRequire(join(consumer, 'package.json'));
  const { preview } = await import(require.resolve('vite'));
  server = await preview({ root: consumer, preview: { host: '127.0.0.1', port: 0, strictPort: false } });
  const address = server.httpServer.address();
  browser = await chromium.launch({ ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}) });
  const page = await browser.newPage(); const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`http://127.0.0.1:${address.port}`);

  for (const [region, label] of [['CLI source', 'Local'], ['npm package', 'Npm']]) {
    const group = page.getByRole('region', { name: region });
    const additions=group.getByLabel(label+' additions');
    assert.equal(await additions.getByText('12,345,678,901,234,567,890.13',{exact:true}).count(),1);
    await additions.getByRole('button',{name:'折叠侧栏',exact:true}).click();
    await additions.getByRole('button',{name:'展开侧栏',exact:true}).waitFor();
    const separator=additions.getByRole('separator');await separator.focus();await separator.press('ArrowRight');
    assert.equal(await separator.getAttribute('aria-valuenow'),'130');
    const suggestions=additions.getByRole('combobox',{name:label+' suggestions'});await suggestions.fill(label);await suggestions.press('ArrowDown');await suggestions.press('Enter');assert.equal(await suggestions.inputValue(),label+' choice');
    const adjustment=additions.getByRole('slider',{name:label+' adjustment'});await adjustment.focus();await adjustment.press('ArrowRight');assert.equal(await adjustment.getAttribute('aria-valuenow'),'31');
    await additions.getByRole('button',{name:label+' notify'}).click();const notice=page.locator('.pi-notification').filter({hasText:label+' notice'});await notice.waitFor();await notice.getByRole('button',{name:'关闭通知'}).click();await notice.waitFor({state:'detached'});
    await additions.getByRole('button',{name:'预览 '+label+' picture'}).click();const imageDialog=page.getByRole('dialog',{name:'图片预览'});await imageDialog.waitFor();await imageDialog.getByRole('button',{name:'放大图片'}).click();await page.keyboard.press('Escape');await imageDialog.waitFor({state:'detached'});
    await group.getByRole('spinbutton', { name: label + ' precise number' }).waitFor();
    const menuFeature=group.getByLabel(label+' menu features');
    await menuFeature.getByRole('button',{name:label+' side leaf',exact:true}).click();
    assert.equal(await menuFeature.getByLabel(label+' menu selected').textContent(),'leaf');
    assert.equal(await menuFeature.getByRole('button',{name:label+' disabled navigation',exact:true}).isDisabled(),true);
    await menuFeature.getByRole('button',{name:label+' side branch',exact:true}).click();
    await menuFeature.getByRole('button',{name:label+' side leaf',exact:true}).waitFor({state:'hidden'});
    await menuFeature.getByRole('button',{name:label+' top root',exact:true}).click();
    await page.getByRole('button',{name:label+' top leaf',exact:true}).waitFor();
    await page.getByRole('button',{name:label+' top leaf',exact:true}).click();
    await page.getByRole('button',{name:label+' top leaf',exact:true}).waitFor({state:'hidden'});
    await menuFeature.getByRole('button',{name:label+' collapsed root',exact:true}).click();
    await page.getByRole('button',{name:label+' collapsed leaf',exact:true}).waitFor();
    await page.keyboard.press('Escape');
    await page.getByRole('button',{name:label+' collapsed leaf',exact:true}).waitFor({state:'hidden'});
    const dateFeature = group.getByLabel(label+' date features');
    const dateInput = dateFeature.getByRole('combobox',{name:label+' date',exact:true});
    await dateInput.fill('2026-10-20'); await dateInput.press('Enter');
    assert.equal(await dateFeature.getByLabel(label+' date saved').textContent(),'2026-10-20');
    await dateInput.press('Escape');
    const timeInput = dateFeature.getByRole('combobox',{name:label+' time',exact:true});
    await timeInput.fill('10:15'); await timeInput.press('Enter');
    assert.equal(await dateFeature.getByLabel(label+' time saved').textContent(),'09:00');
    await page.getByRole('dialog',{name:'时间选择',exact:true}).getByRole('button',{name:'确定',exact:true}).click();
    assert.equal(await dateFeature.getByLabel(label+' time saved').textContent(),'10:15');
    await dateFeature.getByPlaceholder(label+' range start',{exact:true}).fill('2026-10-01');
    await dateFeature.getByPlaceholder(label+' range start',{exact:true}).press('Enter');
    await dateFeature.getByPlaceholder(label+' range end',{exact:true}).fill('2026-10-20');
    await dateFeature.getByPlaceholder(label+' range end',{exact:true}).press('Enter');
    assert.equal(await dateFeature.getByLabel(label+' range saved').textContent(),'2026-10-01/2026-10-20');
    const tableFeature = group.getByLabel(label+' table features');
    await tableFeature.getByText(label+' table row 1',{exact:true}).waitFor();
    assert.equal(await tableFeature.locator('tbody tr').first().locator('td[rowspan="2"]').count(),1);
    assert.equal(await tableFeature.locator('thead th[colspan="2"]').count(),1);
    await tableFeature.getByRole('button',{name:'展开详情',exact:true}).first().click();
    await tableFeature.getByText(label+' detail 11',{exact:true}).waitFor();
    await tableFeature.getByRole('button',{name:'收起详情',exact:true}).first().click();
    assert.equal(await tableFeature.getByText(label+' detail 11',{exact:true}).count(),0);
    await tableFeature.getByRole('checkbox').first().click();
    assert.equal(await tableFeature.getByLabel(label+' table selected').textContent(),'2');
    await tableFeature.locator('.pi-pagination').getByRole('button',{name:'第 2 页',exact:true}).click();
    await tableFeature.getByText(label+' table row 2',{exact:true}).waitFor();
    assert.equal(await tableFeature.getByLabel(label+' table selected').textContent(),'0');
    await tableFeature.getByRole('button',{name:label+' refstate 0',exact:true}).click();
    assert.equal(await tableFeature.getByLabel(label+' ref latest').textContent(),'2');
    await tableFeature.getByRole('button',{name:label+' stored 0',exact:true}).click();
    await page.waitForFunction(label=>localStorage.getItem(label+'-consumer-count')==='1',label);
    assert.equal(await tableFeature.getByRole('button',{name:label+' stored 1',exact:true}).count(),1);

    await group.getByRole('textbox', { name: label + ' form name' }).fill('Verified'); await group.getByRole('switch', { name: label + ' form switch' }).click(); await group.getByRole('button', { name: label + ' form submit' }).click(); await page.waitForFunction(({label}) => document.querySelector('output[aria-label="'+label+' form saved"]')?.textContent?.includes('Verified'), {label}); assert.equal(await group.getByLabel(label + ' form saved').textContent(), JSON.stringify({name:'Verified',on:true}));
    const rating = group.getByRole('slider',{name:label+' rating'}); await rating.focus();await rating.press('ArrowRight');assert.equal(await rating.getAttribute('aria-valuenow'),'3');assert.equal(await group.getByText(label+' timeline entry',{exact:true}).count(),1);assert.equal(await group.getByText(label+' ready',{exact:true}).count(),1);
    const search = group.getByRole('searchbox', {name:label+' search input'}); await search.fill('design'); await search.press('Enter');
    assert.equal(await group.getByLabel(label+' search result').textContent(),'input:design');
    await group.locator('.pi-input-search').getByRole('button',{name:'清空内容'}).click();
    assert.equal(await group.getByLabel(label+' search result').textContent(),'clear:');
    const password = group.locator('input[aria-label="'+label+' password input"]'); assert.equal(await password.getAttribute('type'),'password');
    await group.getByRole('button',{name:'显示密码',exact:true}).click();assert.equal(await password.getAttribute('type'),'text');
    await group.getByRole('button',{name:'隐藏密码',exact:true}).click();assert.equal(await password.getAttribute('type'),'password');

    await group.getByRole('button', { name: '增加', exact: true }).click();
    assert.equal(await group.getByRole('spinbutton', { name: label + ' precise number' }).inputValue(), '0.000000000000000002');
    await group.getByRole('button', { name: label + ' menu', exact: true }).click();
    await page.getByRole('menuitem', { name: label + ' Copy' }).click();
    await group.getByRole('button', { name: label + ' drawer', exact: true }).click();
    const drawer = page.getByRole('dialog', { name: label + ' Drawer' }); await drawer.waitFor();
    await drawer.getByRole('button', { name: '关闭', exact: true }).click(); await drawer.waitFor({ state: 'hidden' });
    await group.getByRole('button', { name: label + ' context confirm', exact: true }).click();
    const confirm = page.getByRole('dialog', { name: label + ' modern confirm' }); await confirm.waitFor();
    await confirm.getByRole('button', { name: '确定', exact: true }).click(); await confirm.waitFor({ state: 'hidden' });
  }
  for (const [region, label] of [['CLI source', 'Local'], ['npm package', 'Npm']]) {
    const button = page.getByRole('region', { name: region }).getByRole('button', { name: `${label} 0`, exact: true });
    await button.waitFor({ state: 'visible' });
    const visual = await button.evaluate(el => { const s = getComputedStyle(el); return { background: s.backgroundColor, radius: s.borderRadius, height: s.height }; });
    assert.deepEqual(visual, { background: 'rgb(22, 119, 255)', radius: '12px', height: '40px' });
    await button.click();
    await page.getByRole('button', { name: `${label} 1`, exact: true }).waitFor();
    assert.equal(await page.getByRole('button', { name: `${label} disabled`, exact: true }).isDisabled(), true);
  }
  for (const [region, label] of [['CLI source', 'Local'], ['npm package', 'Npm']]) {
    const group = page.getByRole('region', { name: region });
    assert.equal(await group.locator('.pi-stack').evaluate(el => getComputedStyle(el).gap), '8px');
    assert.equal(await group.locator('.pi-inline').evaluate(el => getComputedStyle(el).display), 'flex');
    assert.equal(await group.locator('.pi-simple-grid-item').evaluate(el => getComputedStyle(el).gridColumn), '1 / -1');
    const input = group.getByRole('textbox', { name: `${label} input` });
    await group.getByRole('button', { name: '清空内容' }).click();
    assert.equal(await input.inputValue(), '');
    await input.fill('Installed successfully');
    assert.equal(await input.inputValue(), 'Installed successfully');
    const textarea = group.getByRole('textbox', { name: `${label} textarea` });
    const initial = await textarea.evaluate(el => el.getBoundingClientRect().height);
    await textarea.fill('one\ntwo\nthree\nfour');
    assert.ok(await textarea.evaluate(el => el.getBoundingClientRect().height) > initial);
    await group.getByRole('button', { name: `${label} modal`, exact: true }).click();
    const dialog = page.getByRole('dialog', { name: `${label} dialog` });
    await dialog.waitFor({ state: 'visible' });
    assert.equal(await dialog.getByRole('button', { name: '确定', exact: true }).evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(22, 119, 255)');
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'hidden' });
  }
  for (const [region, label] of [['CLI source', 'Local'], ['npm package', 'Npm']]) {
    const group=page.getByRole('region',{name:region});
    const check=group.getByRole('checkbox',{name:label+' checkbox',exact:true});await check.uncheck();assert.equal(await check.isChecked(),false);
    await group.getByRole('radio',{name:label+' radio B',exact:true}).check();
    await group.getByRole('switch',{name:label+' switch',exact:true}).click();assert.equal(await group.getByRole('switch',{name:label+' switch',exact:true}).getAttribute('aria-checked'),'true');
    await group.getByRole('combobox',{name:label+' select',exact:true}).click();await page.getByRole('option',{name:label+' option B',exact:true}).click();
    assert.equal(await group.locator('input[type="hidden"][name="'+label+'-select"]').inputValue(),'b');
    await group.getByRole('tab',{name:label+' tab B',exact:true}).click();assert.equal(await group.getByRole('tabpanel').innerText(),label+' panel B');
    await group.getByRole('button',{name:'关闭标签',exact:true}).click();assert.equal(await group.getByText(label+' tag',{exact:true}).count(),0);
    await group.getByRole('button',{name:'关闭提示',exact:true}).click();assert.equal(await group.getByRole('alert').count(),0);
    assert.equal(await group.getByText(label+' empty',{exact:true}).count(),1);
    await group.getByRole('button',{name:label+' tooltip',exact:true}).hover();await page.getByRole('tooltip',{name:label+' hint',exact:true}).waitFor();await page.keyboard.press('Escape');
    const hiddenTooltip=page.locator('.pi-tooltip').filter({hasText:label+' hint'});await page.waitForFunction(label=>Array.from(document.querySelectorAll('.pi-tooltip')).some(node=>node.textContent===label+' hint'&&node.getAttribute('aria-hidden')==='true'&&node.hasAttribute('inert')),label);assert.equal(await hiddenTooltip.getAttribute('inert'),'');
    await group.getByRole('button',{name:label+' message',exact:true}).click();await page.getByRole('status').filter({hasText:label+' message'}).waitFor();
    await group.getByRole('button',{name:label+' close message',exact:true}).click();
  }
  assert.deepEqual(errors, []);
  await page.screenshot({ path: join(root, '.artifacts/dual-distribution.png') });
  console.log('Packed CLI binary + local TSX + npm package: typecheck, Vite production build, browser behavior for all components and portal themes passed.');
} finally {
  await browser?.close();
  await new Promise(resolve => { if (server) server.httpServer.close(resolve); else resolve(); });
  await rm(temp, { recursive: true, force: true });
}
