import { mkdtemp, writeFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
const root = process.cwd();
const temp = await mkdtemp(join(tmpdir(), 'paper-ink-consumer-'));
const run = (cmd, args, cwd) => execFileSync(cmd, args, { cwd, stdio: 'inherit', timeout: 120000 });
try {
 run('pnpm', ['--dir', 'packages/paper-ink', 'pack', '--pack-destination', temp], root);
 const archive = (await readdir(temp)).find(f => f.endsWith('.tgz'));
 for (const version of ['18.3.1', '19.3.0']) {
  const cwd = join(temp, `react-${version}`);
  await import('node:fs/promises').then(fs => fs.mkdir(cwd));
  await writeFile(join(cwd, 'package.json'), JSON.stringify({ private: true, type: 'module', dependencies: { 'paper-ink': `file:${join(temp, archive)}`, react: version, 'react-dom': version, '@types/react': version.startsWith('18') ? '^18.3.0' : '^19.0.0', '@types/react-dom': version.startsWith('18') ? '^18.3.0' : '^19.0.0' } }));
  run('pnpm', ['install', '--registry=https://registry.npmjs.org', '--ignore-scripts'], cwd);
  await writeFile(join(cwd, 'smoke.mjs'), `import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Button, Input, TextArea, Modal, ConfigProvider, Checkbox, Radio, Switch, Tabs, Select, Tooltip, message, Tag, Alert, Spin, Empty, Typography, Divider, Avatar, Badge, Card, Descriptions, Dropdown, Popover, Popconfirm, Drawer, Breadcrumb, Pagination, Collapse, Segmented, Progress, Skeleton, InputNumber, App, Rate, Timeline, Result } from 'paper-ink';
import { Button as SubpathButton } from 'paper-ink/button';
import { Input as SubpathInput } from 'paper-ink/input';
import { Modal as SubpathModal } from 'paper-ink/modal';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
assert.equal(Button, SubpathButton); assert.equal(Input, SubpathInput); assert.equal(Modal, SubpathModal); assert.equal(Input.TextArea, TextArea);
assert.match(renderToStaticMarkup(React.createElement(Input, { defaultValue: 'Hello', showCount: true })), /value="Hello"/);
assert.match(renderToStaticMarkup(React.createElement(Input.Search, {defaultValue:'Find',enterButton:'Search'})), /value="Find"/);
assert.match(renderToStaticMarkup(React.createElement(Input.Password, {defaultValue:'Secret'})), /type="password"/);
assert.match(renderToStaticMarkup(React.createElement(TextArea, { defaultValue: 'Notes', autoSize: true })), /Notes/);
assert.equal(renderToStaticMarkup(React.createElement(Modal, { open: true, title: 'SSR' })), '');
const html = renderToStaticMarkup(React.createElement(ConfigProvider, { theme: { token: { radius: { control: 12 } } } }, React.createElement(Button, { type: 'primary', htmlType: 'submit' }, 'Save')));
assert.match(html, /type="submit"/); assert.match(html, /--pi-radius-control:12px/);
assert.match(readFileSync(import.meta.resolve('paper-ink/button/style.css').replace('file://', ''), 'utf8'), /pi-button--variant-solid/);
assert.match(readFileSync(import.meta.resolve('paper-ink/style.css').replace('file://', ''), 'utf8'), /pi-theme/);
assert.match(readFileSync(import.meta.resolve('paper-ink/modal/style.css').replace('file://', ''), 'utf8'), /pi-button--variant-solid/);
assert.match(readFileSync(import.meta.resolve('paper-ink/input/style.css').replace('file://', ''), 'utf8'), /pi-textarea/);
for (const [name, component, exported] of [['checkbox',Checkbox,'Checkbox'],['radio',Radio,'Radio'],['switch',Switch,'Switch'],['tabs',Tabs,'Tabs'],['select',Select,'Select'],['tooltip',Tooltip,'Tooltip'],['message',message,'message'],['tag',Tag,'Tag'],['alert',Alert,'Alert'],['spin',Spin,'Spin'],['empty',Empty,'Empty'],['typography',Typography,'Typography'],['divider',Divider,'Divider'],['avatar',Avatar,'Avatar'],['badge',Badge,'Badge'],['card',Card,'Card'],['descriptions',Descriptions,'Descriptions'],['dropdown',Dropdown,'Dropdown'],['popover',Popover,'Popover'],['popconfirm',Popconfirm,'Popconfirm'],['drawer',Drawer,'Drawer'],['breadcrumb',Breadcrumb,'Breadcrumb'],['pagination',Pagination,'Pagination'],['collapse',Collapse,'Collapse'],['segmented',Segmented,'Segmented'],['progress',Progress,'Progress'],['skeleton',Skeleton,'Skeleton'],['input-number',InputNumber,'InputNumber'],['app',App,'App'],['rate',Rate,'Rate'],['timeline',Timeline,'Timeline'],['result',Result,'Result']]) {
 const mod=await import('paper-ink/'+name);assert.equal(mod[exported],component);
 assert.ok(readFileSync(import.meta.resolve('paper-ink/'+name+'/style.css').replace('file://',''),'utf8').includes('pi-'+name));
}
const core=renderToStaticMarkup(React.createElement(React.Fragment,null,React.createElement(Checkbox,{defaultChecked:true},'Check'),React.createElement(Radio.Group,{options:['one','two'],defaultValue:'one'}),React.createElement(Switch,{defaultChecked:true}),React.createElement(Tabs,{items:[{key:'one',label:'One',children:'Panel'}]}),React.createElement(Select,{options:[{value:'one',label:'One'}],defaultValue:'one'}),React.createElement(Tooltip,{title:'Hint'},React.createElement(Button,null,'Hover')),React.createElement(Tag,null,'Tag'),React.createElement(Alert,{title:'Alert'}),React.createElement(Spin,{spinning:false},'Ready'),React.createElement(Empty)));
assert.match(core,/Panel/);assert.match(core,/aria-checked="true"/);assert.match(core,/Ready/);await message.success('Server');
function AppConsumer() {
 const api = App.useApp();
 assert.equal(typeof api.message.success, 'function');
 assert.equal(typeof api.modal.confirm, 'function');
 return React.createElement('span', null, 'Scoped app API');
}
const additions = renderToStaticMarkup(React.createElement(React.Fragment,null,
 React.createElement(Typography.Title,{level:4},'New heading'),
 React.createElement(Typography.Text,{copyable:true},'Copy text'),
 React.createElement(Divider,{titlePlacement:'start'},'Divider label'),
 React.createElement(Avatar.Group,{size:'large'},React.createElement(Avatar,null,'PI')),
 React.createElement(Badge,{count:120},React.createElement(Avatar,null,'Inbox')),
 React.createElement(Card,{title:'Card heading'},React.createElement(Card.Meta,{title:'Meta title',description:'Meta description'})),
 React.createElement(Descriptions,{column:2,items:[{key:'one',label:'Owner',children:'Alice'},{key:'two',label:'Scope',children:'Open source'}]}),
 React.createElement(Dropdown,{menu:{items:[{key:'edit',label:'Edit'}]}},React.createElement(Button,null,'Menu trigger')),
 React.createElement(Popover,{title:'Popover',content:'Details'},React.createElement(Button,null,'Popover trigger')),
 React.createElement(Popconfirm,{title:'Confirm',onConfirm:()=>{}},React.createElement(Button,null,'Confirm trigger')),
 React.createElement(Drawer,{open:true,title:'SSR drawer'},'Drawer content'),
 React.createElement(Breadcrumb,{items:[{title:'Home'},{title:'Details'}]}),
 React.createElement(Pagination,{total:100,current:2}),
 React.createElement(Collapse,{defaultActiveKey:['one'],items:[{key:'one',label:'Section',children:'Expanded content'}]}),
 React.createElement(Segmented,{options:['Light','Dark'],defaultValue:'Light'}),
 React.createElement(Progress,{percent:65}),
 React.createElement(Skeleton,{loading:true,avatar:true}),
 React.createElement(InputNumber,{stringMode:true,defaultValue:'0.1000000000000000001',step:'0.0000000000000000001'}),
 React.createElement(Rate,{defaultValue:2.5,allowHalf:true}),
 React.createElement(Timeline,{items:[{title:'09:00',content:'New event',loading:true}]}),
 React.createElement(Result,{status:404,title:'New result'}),
 React.createElement(App,null,React.createElement(AppConsumer))
));
assert.match(additions,/New heading/);assert.match(additions,/Meta title/);assert.match(additions,/Alice/);
assert.match(additions,/Menu trigger/);assert.match(additions,/Popover trigger/);assert.match(additions,/Confirm trigger/);
assert.match(additions,/Expanded content/);assert.match(additions,/Scoped app API/);
assert.match(additions,/value="0.1000000000000000001"/);
assert.match(additions,/99\+/);
assert.match(additions,/aria-valuenow="2.5"/); assert.match(additions,/New event/); assert.match(additions,/New result/);
assert.equal(renderToStaticMarkup(React.createElement(Drawer,{open:true},'Portal content')), '');
console.log('Packed package runtime + styles: React ${version} passed');`);
  run('node', ['smoke.mjs'], cwd);
  await writeFile(join(cwd, 'check.tsx'), `import { createRef } from 'react';\nimport { Button, Input, TextArea, Modal, ConfigProvider, type InputRef, type ModalProps, type ButtonProps, Checkbox, Radio, Switch, Tabs, Select, Tooltip, message, Tag, Alert, Spin, Empty, Typography, Divider, Avatar, Badge, Card, Descriptions, Dropdown, Popover, Popconfirm, Drawer, Breadcrumb, Pagination, Collapse, Segmented, Progress, Skeleton, InputNumber, App, Rate, Timeline, Result } from 'paper-ink';\nimport { Typography as SubpathTypography } from 'paper-ink/typography';\nimport { Divider as SubpathDivider } from 'paper-ink/divider';\nimport { Avatar as SubpathAvatar } from 'paper-ink/avatar';\nimport { Badge as SubpathBadge } from 'paper-ink/badge';\nimport { Card as SubpathCard } from 'paper-ink/card';\nimport { Descriptions as SubpathDescriptions } from 'paper-ink/descriptions';\nimport { Dropdown as SubpathDropdown } from 'paper-ink/dropdown';\nimport { Popover as SubpathPopover } from 'paper-ink/popover';\nimport { Popconfirm as SubpathPopconfirm } from 'paper-ink/popconfirm';\nimport { Drawer as SubpathDrawer } from 'paper-ink/drawer';\nimport { Breadcrumb as SubpathBreadcrumb } from 'paper-ink/breadcrumb';\nimport { Pagination as SubpathPagination } from 'paper-ink/pagination';\nimport { Collapse as SubpathCollapse } from 'paper-ink/collapse';\nimport { Segmented as SubpathSegmented } from 'paper-ink/segmented';\nimport { Progress as SubpathProgress } from 'paper-ink/progress';\nimport { Skeleton as SubpathSkeleton } from 'paper-ink/skeleton';\nimport { InputNumber as SubpathInputNumber } from 'paper-ink/input-number';\nimport { App as SubpathApp } from 'paper-ink/app';\nconst props: ButtonProps = { type: 'primary', loading: { delay: 100 }, iconPosition: 'end' };\nconst ref = createRef<HTMLButtonElement>();\nconst inputRef = createRef<InputRef>();\nconst modalProps: ModalProps = { open: true, title: 'Edit', footer: null };\nconst controls = <><Input ref={inputRef} allowClear showCount /><Input.Search ref={inputRef} enterButton onSearch={(value,event,info) => { void value; void event; void info?.source; }} /><Input.Password ref={inputRef} visibilityToggle={{visible:true,onVisibleChange:visible=>{void visible;}}} /><TextArea autoSize={{ minRows: 2, maxRows: 4 }} /><Modal {...modalProps} /></>;\nconst features = <><Checkbox defaultChecked /><Radio.Group options={[1, 2]} /><Switch defaultChecked /><Tabs items={[{key: 'a', label: 'A'}]} /><Select options={[{value: 'a', label: 'A'}]} /><Tooltip title="Hint"><Button>Hover</Button></Tooltip><Tag /><Alert title="Alert" /><Spin /><Empty /></>;\nconst additions = <><Typography.Title level={4}>Heading</Typography.Title><Typography.Text copyable={{text: async () => 'copy'}}>Copy</Typography.Text><Divider orientation="vertical" /><Avatar.Group size="large"><Avatar>PI</Avatar></Avatar.Group><Badge count={120} /><Card title="Title" actions={[<Button key="edit">Edit</Button>]}><Card.Meta title="Meta" /></Card><Descriptions items={[{key:'owner',label:'Owner',children:'Alice',span:'filled'}]} /><Dropdown menu={{items:[{key:'a',label:'A'}]}}><Button>Menu</Button></Dropdown><Popover content="Details"><Button>Details</Button></Popover><Popconfirm title="Confirm" onConfirm={async () => {}}><Button>Confirm</Button></Popconfirm><Drawer open title="Drawer" /><Breadcrumb items={[{title:'Home'}]} /><Pagination total={100} onChange={(page,size) => { void page; void size; }} /><Collapse items={[{key:'a',label:'A',children:'Panel'}]} /><Segmented options={['A','B']} /><Progress percent={65} /><Skeleton avatar title={{width:'40%'}} paragraph={{rows:2}} /><InputNumber stringMode defaultValue="0.1000000000000000001" step="0.0000000000000000001" onChange={value => { if (value !== null) { const typed: string | number = value; void typed; } }} /><App><AppConsumer /></App></>;\nfunction AppConsumer() { const api=App.useApp(); return <Button onClick={async () => { await api.message.success('Saved'); const confirmed:boolean = await api.modal.confirm({title:'Confirm',content:'Details',onOk:async () => {}}); void confirmed; }}>Scoped API</Button>; }\nconst three = <><Rate allowHalf defaultValue={2.5} character={({index}) => index + 1} onChange={value => { const numberValue: number = value; void numberValue; }} /><Timeline mode="alternate" items={[{title:"09:00",content:"Event",loading:true},{label:"10:00",children:"Legacy",placement:"end"}]} /><Result status={404} styles={{body:{padding:12}}} title="Result" /></>;\nconst example = <ConfigProvider theme={{ token: { radius: { control: 8 } } }}><Button {...props} ref={ref} /></ConfigProvider>;\n`);
  run('node', [resolve(root, 'node_modules/typescript/bin/tsc'), '--noEmit', '--strict', '--skipLibCheck', '--jsx', 'react-jsx', '--module', 'NodeNext', '--moduleResolution', 'NodeNext', '--lib', 'ES2022,DOM', 'check.tsx'], cwd);
  console.log(`Packed declarations: React ${version} passed`);
 }
} finally { await rm(temp, { recursive: true, force: true }); }
