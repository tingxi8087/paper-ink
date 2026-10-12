type Row = [string, string, string, string];
function Table({ rows }: { rows: Row[] }) { return <div className="table-scroll"><table><thead><tr><th>属性</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead><tbody>{rows.map(row => <tr key={row[0]}>{row.map((cell, i) => <td key={i}>{i < 3 ? <code>{cell}</code> : cell}</td>)}</tr>)}</tbody></table></div>; }
export function MenuApiTable() { return <Table rows={[
 ['items', 'readonly MenuItem[]', '必填', '唯一数据入口；节点 key 在整个树中唯一'],
 ['mode', 'inline | horizontal', 'inline', '侧边原位展开 / 顶部点击下拉'],
 ['selectedKeys / defaultSelectedKeys', 'readonly string[]', '[]', '受控选中 / 初始选中，最多一个叶子项；不自动展开祖先'],
 ['onClick', '(info: MenuClickInfo) => void', '—', '叶子激活通知；已选中项也触发，preventDefault 可取消默认选择和链接跳转'],
 ['onSelect', '(info: MenuSelectInfo) => void', '—', '有效选中变化时通知；包含 key、keyPath、domEvent 和 selectedKeys'],
 ['openKeys / defaultOpenKeys', 'readonly string[]', '[]', '受控展开 / 初始展开；收起父项保留后代展开记录'],
 ['onOpenChange', '(keys: string[]) => void', '—', '一次用户操作只通知一次最终 keys，数据变化不触发'],
 ['inlineCollapsed', 'boolean', 'false', '侧边图标模式；折叠父项弹层是展示状态，不写入 openKeys'],
 ['inlineIndent', 'number', '16', '纵向结构每层缩进的非负像素值'],
 ['accordion', 'boolean', 'false', '同层手风琴；顶部始终最多一个根下拉'],
 ['selectable', 'boolean', 'true', 'false 时保留激活和显式选中展示，不产生新选中'],
 ['expandIcon', 'ReactNode', 'SVG 箭头', '替换展开图标'],
 ['className / style', 'string / CSSProperties', '—', '导航根样式；宽度由外部容器控制'],
 ['aria-label / aria-labelledby', 'string', '—', '导航区域名称，多个导航应使用不同名称'],
 ['ref', 'HTMLElement', '—', '原生导航根元素，不提供菜单控制实例'],
 ]} />; }
export function MenuItemApiTable() { return <Table rows={[
 ['key', 'string', '必填', '全树唯一的稳定标识，包括分组与分隔线'],
 ['label', 'ReactNode', '普通项必填', '展示文字，不嵌套链接或按钮'],
 ['icon', 'ReactNode', '—', '叶子和父项自定义图标；无图标折叠显示文字缩写'],
 ['children', 'readonly MenuItem[]', '—', '普通父项递归；group 只接受叶子项'],
 ['type', 'group | divider', '省略', '分组标题不可选中；分隔线无交互'],
 ['disabled', 'boolean', 'false', '禁用当前项，父项禁用整棵子树'],
 ['extra', 'ReactNode', '—', '徽标、数量等非交互内容，折叠时隐藏'],
 ['href / target', 'string', '—', '仅叶子；原生链接保留修饰键和新标签能力'],
 ['title', 'string', '纯文本 label', '折叠提示和可访问名称，复杂 label 应显式提供'],
 ['className / style', 'string / CSSProperties', '—', '当前节点容器样式'],
 ]} />; }
