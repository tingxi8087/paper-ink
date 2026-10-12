import { LiveDemo } from './LiveDemo';
const tree = `const items = [
    { key: 'overview', label: '概览' },
    { key: 'workspace', label: '工作空间', children: [
      { key: 'members', label: '成员' }, { key: 'settings', label: '设置' },
      { key: 'advanced', label: '高级', children: [{ key: 'audit', label: '审计' }, { key: 'tokens', label: '访问令牌' }] }
    ] },
    { key: 'reports', label: '报表', children: [{ key: 'daily', label: '日报' }, { key: 'monthly', label: '月报' }] }
  ];`;
const icon = `const Icon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M4 10h16M10 10v10"/></svg>;`;
export function MenuDemos() { return <div className="demo-list">
<LiveDemo title="基础侧边导航" code={`function Demo() {
  ${tree}
  return <Menu aria-label="基础侧边导航菜单" items={items} defaultSelectedKeys={['overview']} style={{ width: 240 }} />;
}`} />
<LiveDemo title="多级展开与祖先强调" code={`function Demo() {
  ${tree}
  return <Menu aria-label="多级展开与祖先强调菜单" items={items} defaultSelectedKeys={['audit']} defaultOpenKeys={['workspace', 'advanced']} style={{ width: 260 }} />;
}`} />
<LiveDemo title="分组徽标与分隔线" code={`function Demo() {
  return <Menu aria-label="分组徽标与分隔线菜单" style={{ width: 240 }} items={[
    { key: 'team', type: 'group', label: '团队', children: [{ key: 'inbox', label: '消息', extra: <Badge count={3} /> }, { key: 'tasks', label: '待办', extra: <Tag>12</Tag> }] },
    { key: 'separator', type: 'divider' },
    { key: 'tools', type: 'group', label: '工具', children: [{ key: 'logs', label: '操作记录' }, { key: 'help', label: '帮助' }] }
  ]} />;
}`} />
<LiveDemo title="受控选中与事件" code={`function Demo() {
  ${tree}
  const [selected, setSelected] = useState(['overview']);
  const [event, setEvent] = useState('尚未激活');
  const [count, setCount] = useState(0);
  return <Stack><Menu aria-label="受控选中与事件菜单" items={items} selectedKeys={selected} defaultOpenKeys={['workspace']} onClick={info => setEvent(info.keyPath.join(' ← '))} onSelect={info => { setSelected(info.selectedKeys); setCount(n => n + 1); }} style={{ width: 240 }} /><span role="status">当前：{selected.join(', ')}；选中变化 {count} 次；点击路径：{event}</span><Button onClick={() => setSelected(['audit'])}>外部选中审计</Button><span>外部选中不会自动展开高级节点。</span></Stack>;
}`} />
<LiveDemo title="同层手风琴" code={`function Demo() {
  ${tree}
  const [open, setOpen] = useState(['workspace', 'advanced']);
  return <Stack><Menu aria-label="同层手风琴菜单" accordion items={items} openKeys={open} onOpenChange={setOpen} style={{ width: 260 }} /><span role="status">展开记录：{open.join(', ') || '空'}</span><span>打开报表会收起工作空间，但保留高级的展开记录。</span></Stack>;
}`} />
<LiveDemo title="图标折叠与状态保留" code={`function Demo() {
  ${tree}
  ${icon}
  const [collapsed, setCollapsed] = useState(false);
  return <Stack><Button onClick={() => setCollapsed(v => !v)}>{collapsed ? '恢复侧栏' : '折叠侧栏'}</Button><Menu aria-label="图标折叠与状态保留菜单" items={items.map(item => ({ ...item, icon: <Icon /> }))} inlineCollapsed={collapsed} defaultOpenKeys={['workspace', 'advanced']} defaultSelectedKeys={['audit']} style={{ width: collapsed ? 56 : 260 }} /><span>折叠后点击工作空间，在单个弹层内访问多级内容。</span></Stack>;
}`} />
<LiveDemo title="无图标折叠" code={`function Demo() {
  ${tree}
  return <Inline align="start"><Menu aria-label="无图标折叠菜单" inlineCollapsed items={items} style={{ width: 56 }} /><span>没有图标时使用名称缩写，悬停或聚焦显示完整名称。</span></Inline>;
}`} />
<LiveDemo title="禁用整棵子树" code={`function Demo() {
  return <Menu aria-label="禁用整棵子树菜单" style={{ width: 260 }} defaultOpenKeys={['locked']} items={[
    { key: 'normal', label: '可用页面' },
    { key: 'locked', label: '停用工作空间', disabled: true, children: [{ key: 'restricted', label: '受限页面', href: '#/menu' }] },
    { key: 'disabled', label: '禁用链接', href: '#/menu', disabled: true },
    { key: 'last', label: '另一个可用页面' }
  ]} />;
}`} />
<LiveDemo title="动态权限过滤" code={`function Demo() {
  const [admin, setAdmin] = useState(true);
  const [selected, setSelected] = useState(['users']);
  const items = [{ key: 'home', label: '首页' }, ...(admin ? [{ key: 'admin', label: '管理', children: [{ key: 'users', label: '用户管理' }] }] : [])];
  return <Stack><Switch checked={admin} onChange={setAdmin} checkedChildren="管理员" unCheckedChildren="普通成员" /><Menu aria-label="动态权限过滤菜单" items={items} selectedKeys={selected} onSelect={info => setSelected(info.selectedKeys)} defaultOpenKeys={['admin']} style={{ width: 240 }} /><span role="status">业务选中记录：{selected.join(', ')}；过滤不会替业务切换页面。</span></Stack>;
}`} />
<LiveDemo title="顶部基础导航" code={`function Demo() {
  ${icon}
  return <Menu aria-label="顶部基础导航菜单" mode="horizontal" defaultSelectedKeys={['overview']} items={[{ key: 'overview', label: '概览', icon: <Icon /> }, { key: 'products', label: '产品' }, { key: 'divider', type: 'divider' }, { key: 'resources', type: 'group', label: '资源', children: [{ key: 'docs', label: '文档' }, { key: 'support', label: '支持' }] }]} />;
}`} />
<LiveDemo title="顶部下拉与多级内容" code={`function Demo() {
  ${tree}
  return <Stack><Menu aria-label="顶部下拉与多级内容菜单" mode="horizontal" items={items} defaultSelectedKeys={['audit']} /><span>点击工作空间，再展开高级；只使用一个下拉层。</span></Stack>;
}`} />
<LiveDemo title="顶部受控开合" code={`function Demo() {
  ${tree}
  const [open, setOpen] = useState([]);
  const [count, setCount] = useState(0);
  return <Stack><Menu aria-label="顶部受控开合菜单" mode="horizontal" items={items} openKeys={open} onOpenChange={keys => { setOpen(keys); setCount(n => n + 1); }} /><span role="status">展开：{open.join(', ') || '空'}；通知 {count} 次</span><Inline><Button onClick={() => setOpen(['workspace', 'advanced'])}>外部打开工作空间</Button><Button onClick={() => setOpen([])}>外部关闭</Button></Inline></Stack>;
}`} />
<LiveDemo title="顶部溢出滚动" code={`function Demo() {
  return <div style={{ width: '100%', maxWidth: 320 }}><Menu aria-label="顶部溢出滚动菜单" mode="horizontal" items={Array.from({ length: 10 }, (_, i) => ({ key: 'page-' + i, label: '栏目 ' + (i + 1), ...(i === 8 ? { children: [{ key: 'last-child', label: '末端下拉内容' }] } : {}) }))} /><p>左右键可移动焦点，菜单自行横向滚动；末端下拉不会被滚动容器裁切。</p></div>;
}`} />
<LiveDemo title="顶部与侧边切换" code={`function Demo() {
  ${tree}
  const [horizontal, setHorizontal] = useState(false);
  const [open, setOpen] = useState(['workspace', 'advanced']);
  const [selected, setSelected] = useState(['audit']);
  return <Stack><Switch checked={horizontal} onChange={setHorizontal} checkedChildren="顶部" unCheckedChildren="侧边" /><Menu aria-label="顶部与侧边切换菜单" mode={horizontal ? 'horizontal' : 'inline'} items={items} openKeys={open} onOpenChange={setOpen} selectedKeys={selected} onSelect={info => setSelected(info.selectedKeys)} style={{ width: horizontal ? '100%' : 260 }} /><span role="status">当前：{selected.join(', ')}；展开：{open.join(', ')}</span></Stack>;
}`} />
<LiveDemo title="原生链接与取消选择" code={`function Demo() {
  const [selected, setSelected] = useState(['current']);
  const [event, setEvent] = useState('尚未点击');
  return <Stack><Menu aria-label="原生链接与取消选择菜单" selectedKeys={selected} onSelect={info => setSelected(info.selectedKeys)} onClick={info => { setEvent(info.key); if (info.key === 'cancel') info.domEvent.preventDefault(); }} items={[{ key: 'current', label: '当前页面' }, { key: 'external', label: '新标签打开文档', href: '#/menu', target: '_blank' }, { key: 'cancel', label: '取消默认选中与跳转', href: '#/menu' }]} style={{ width: 260 }} /><span role="status">当前：{selected.join(', ')}；点击：{event}</span><span>新标签链接不改变当前选中；取消默认行为也不提交选中。</span></Stack>;
}`} />
<LiveDemo title="局部主题" code={`function Demo() {
  ${tree}
  return <ConfigProvider theme={{ token: { color: { text: { primary: '#eeeeec', secondary: '#aaaaa7' }, surface: { container: '#242423', elevated: '#242423', muted: '#343432' }, border: { default: '#525250' }, primary: { solid: '#eeeeec', onSolid: '#161616' } } } }}><Menu aria-label="局部主题菜单" mode="horizontal" items={items} defaultSelectedKeys={['overview']} /></ConfigProvider>;
}`} dark />
<LiveDemo title="键盘与窄容器" code={`function Demo() {
  ${tree}
  return <Stack style={{ width: '100%', maxWidth: 200 }}><Menu aria-label="键盘与窄容器菜单" items={items} inlineIndent={12} /><span>Tab 逐项访问；上下键移动，右键展开，左键返回，Home/End 到首尾。浮层中 Escape 关闭并返回触发项。</span></Stack>;
}`} />
<LiveDemo title="只激活不选中" code={`function Demo() {
  const [count, setCount] = useState(0);
  return <Stack><Menu aria-label="只激活不选中菜单" selectable={false} selectedKeys={['current']} items={[{ key: 'current', label: '当前页面' }, { key: 'action', label: '触发业务动作' }]} onClick={() => setCount(n => n + 1)} style={{ width: 240 }} /><span role="status">激活 {count} 次；显式当前页面持续显示。</span></Stack>;
}`} />
<LiveDemo title="复杂标签与自定义箭头" code={`function Demo() {
  const [collapsed, setCollapsed] = useState(false);
  const arrow = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m8 4 8 8-8 8" /></svg>;
  return <Stack><Button onClick={() => setCollapsed(v => !v)}>切换文字缩写</Button><Menu aria-label="复杂标签与自定义箭头菜单" inlineCollapsed={collapsed} expandIcon={arrow} style={{ width: collapsed ? 56 : 260 }} items={[{ key: 'team', title: '设计团队', label: <span>设计团队 <Tag>Pro</Tag></span>, children: [{ key: 'files', label: '团队文件' }] }, { key: 'personal', title: '个人空间', label: <strong>个人空间</strong> }]} /></Stack>;
}`} />
</div>; }
