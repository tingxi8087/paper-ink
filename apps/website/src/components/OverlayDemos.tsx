import { LiveDemo } from './LiveDemo';
export function PopoverDemos() { return <div className="demo-list"><LiveDemo title="悬停卡片" code={`<Popover title="项目概览" content={<Button onClick={() => message.info('查看项目')}>查看项目</Button>}><Button>悬停查看</Button></Popover>`} /><LiveDemo title="可交互内容" code={`<Popover title="项目设置" trigger="click" content={<div><Input placeholder="项目名称" /><Button style={{ marginTop: 8 }}>保存</Button></div>}><Button>打开设置</Button></Popover>`} /><LiveDemo title="位置与受控显示" code={`function Demo() {
 const [open, setOpen] = useState(false);
 return <Popover title="操作提示" content="浮层可由外部状态控制" placement="bottomLeft" trigger="click" open={open} onOpenChange={setOpen}><Button>切换浮层</Button></Popover>;
}`} /></div>; }
export function DropdownDemos() { return <div className="demo-list"><LiveDemo title="操作菜单" code={`<Dropdown trigger={['click']} menu={{ items: [
 { key: 'edit', label: '编辑' }, { key: 'copy', label: '复制' },
 { type: 'divider', key: 'line' }, { key: 'delete', label: '删除', danger: true },
 { key: 'disabled', label: '暂不可用', disabled: true }
], onClick: ({ key }) => message.info('操作：' + key) }}><Button>更多操作</Button></Dropdown>`} /><LiveDemo title="可选菜单" code={`<Dropdown trigger={['click']} menu={{ selectable: true, defaultSelectedKeys: ['light'], items: [{ key: 'light', label: '浅色主题' }, { key: 'dark', label: '深色主题' }] }}><Button>选择主题</Button></Dropdown>`} /></div>; }
export function PopconfirmDemos() { return <div className="demo-list"><LiveDemo title="确认操作" code={`<Popconfirm title="删除这个项目？" description="此操作无法撤销。" onConfirm={() => message.success('已删除')}><Button danger>删除项目</Button></Popconfirm>`} /><LiveDemo title="异步确认" code={`<Popconfirm title="保存当前修改？" description="确认按钮会等待异步操作完成。" onConfirm={() => new Promise(resolve => setTimeout(resolve, 1200))}><Button>异步保存</Button></Popconfirm>`} /></div>; }
export function DrawerDemos() { return <div className="demo-list"><LiveDemo title="侧边详情" code={`function Demo() {
 const [open, setOpen] = useState(false);
 return <><Button onClick={() => setOpen(true)}>查看详情</Button><Drawer title="编辑项目" open={open} onClose={() => setOpen(false)} footer={<Button type="primary" onClick={() => setOpen(false)}>完成</Button>}><Input placeholder="项目名称" /><Input.TextArea placeholder="项目说明" style={{ marginTop: 12 }} /></Drawer></>;
}`} /><LiveDemo title="底部抽屉" code={`function Demo() {
 const [open, setOpen] = useState(false);
 return <><Button onClick={() => setOpen(true)}>底部打开</Button><Drawer title="快捷操作" placement="bottom" height={260} open={open} onClose={() => setOpen(false)}><p>支持四个方向，焦点约束、Esc 关闭和滚动锁。</p><Button onClick={() => setOpen(false)}>关闭</Button></Drawer></>;
}`} /></div>; }
