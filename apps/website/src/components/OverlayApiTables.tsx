function ApiTable({ rows }: { rows: string[][] }) {
  return <div className="table-scroll"><table><thead><tr><th>属性</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead><tbody>{rows.map(row => <tr key={row[0]}>{row.map((cell, index) => <td key={index}>{index < 3 ? <code>{cell}</code> : cell}</td>)}</tr>)}</tbody></table></div>;
}
const popupRows = [
  ['open / defaultOpen', 'boolean', '— / false', '受控 / 初始显示状态'],
  ['onOpenChange', '(open: boolean) => void', '—', '显示状态变化通知'],
  ['placement', 'PopoverPlacement', 'top', '上下左右及对齐变体，共 12 个位置'],
  ['mouseEnterDelay / mouseLeaveDelay', 'number', '0.1', '鼠标移入 / 移出延迟，单位秒'],
  ['destroyOnHidden', 'boolean', 'false', '退出结束后卸载；默认保留已打开的内容'],
  ['getPopupContainer', '(triggerNode: HTMLElement) => HTMLElement', '自动', '默认 body；Modal / Drawer 内使用对应 dialog'],
  ['autoAdjustOverflow', 'boolean', 'true', '尝试翻转并限制在视口内'],
  ['color / zIndex', 'string / number', '— / 1200', '浮层背景色与层级'],
  ['className / style', 'string / CSSProperties', '—', '用于浮层，兼容 overlayClassName / overlayStyle'],
];
export function PopoverApiTable() {
  return <ApiTable rows={[
    ['title / content', 'ReactNode | (() => ReactNode)', '—', '浮层标题与内容；两者均为空时不显示'],
    ['children', 'ReactNode', '—', '触发元素'],
    ['trigger', 'hover | focus | click | Array', 'hover', '可组合触发方式，hover 也支持键盘聚焦'],
    ...popupRows,
  ]} />;
}
export function PopconfirmApiTable() {
  return <ApiTable rows={[
    ['title / description', 'ReactNode | (() => ReactNode)', '—', '确认标题（必填）与补充说明'],
    ['children', 'ReactNode', '—', '触发元素'],
    ['trigger', 'hover | focus | click | Array', 'click', '继承 Popover，默认点击触发'],
    ['onConfirm', '(event: MouseEvent<HTMLElement>) => void | Promise<unknown>', '—', '完成后请求关闭；异步期间加载，拒绝时保留浮层'],
    ['onCancel', '(event: MouseEvent<HTMLElement>) => void', '—', '取消按钮回调；preventDefault 可阻止关闭'],
    ['onPopupClick', '(event: MouseEvent<HTMLDivElement>) => void', '—', '确认内容区域点击回调'],
    ['disabled / showCancel', 'boolean', 'false / true', '禁用确认框 / 是否显示取消按钮'],
    ['icon', 'ReactNode', '警告 SVG', '自定义提示图标，null 隐藏'],
    ['okText / cancelText', 'ReactNode', '确定 / 取消', '确认与取消按钮内容'],
    ['okType', 'ButtonProps["type"]', 'primary', '确认按钮类型'],
    ['okButtonProps / cancelButtonProps', 'ButtonProps', '—', '按钮属性；异步确认期间取消按钮禁用'],
    ...popupRows,
  ]} />;
}
export function DropdownApiTable() {
  return <><ApiTable rows={[
    ['children', 'ReactNode', '—', '菜单触发元素'],
    ['menu.items', 'DropdownMenuItem[]', '[]', '菜单项，字段见下表'],
    ['menu.onClick', '(info: DropdownMenuClickInfo) => void', '—', 'info 包含 key、keyPath、domEvent；preventDefault 阻止选择与关闭'],
    ['menu.selectable', 'boolean', 'false', '开启单项选择'],
    ['menu.selectedKeys / menu.defaultSelectedKeys', 'string[]', '— / []', '受控 / 初始选择 key'],
    ['menu.onSelect', '(info & { selectedKeys: string[] }) => void', '—', '选择通知，selectedKeys 为当前单项 key'],
    ['trigger', 'Array<hover | click>', '[hover]', '鼠标移入或点击触发'],
    ['placement', 'top | topLeft | topRight | bottom | bottomLeft | bottomRight', 'bottomLeft', '菜单相对触发元素的位置'],
    ['open / defaultOpen / disabled', 'boolean', '— / false / false', '受控显示、初始显示、禁用'],
    ['onOpenChange', '(open, { source: trigger | menu }) => void', '—', '区分触发交互和菜单选择来源'],
    ['autoFocus', 'boolean', 'false', '打开后聚焦首个可用菜单项'],
    ['popupRender', '(menus: ReactNode) => ReactNode', '—', '自定义浮层内容，保留传入菜单可继续使用键盘导航'],
    ['getPopupContainer', '(trigger: HTMLElement) => HTMLElement', '自动', '默认 body；Modal / Drawer 内使用对应 dialog'],
    ['destroyOnHidden', 'boolean', 'false', '退出结束后卸载菜单'],
    ['className / style', 'string / CSSProperties', '—', '触发元素外层样式'],
    ['overlayClassName / overlayStyle', 'string / CSSProperties', '—', '菜单浮层样式'],
  ]} /><h3>菜单项</h3><ApiTable rows={[
    ['key / label / icon', 'string / ReactNode / ReactNode', '索引 / — / —', '稳定标识、内容、图标；建议显式设置 key'],
    ['disabled / danger', 'boolean', 'false', '禁用或危险操作样式'],
    ['type', 'divider | group', '普通项', '分隔线或分组'],
    ['children', 'DropdownMenuItem[]', '—', '仅 group 支持子项，普通项不支持子菜单'],
  ]} /></>;
}
export function DrawerApiTable() {
  return <ApiTable rows={[
    ['open', 'boolean', 'false', '受控显示，不提供 defaultOpen'],
    ['onClose', '(event: MouseEvent<HTMLElement> | KeyboardEvent) => void', '—', '关闭按钮、遮罩或 Esc 请求关闭；业务更新 open'],
    ['title / extra / footer', 'ReactNode', '—', '标题、标题右侧与底部内容'],
    ['placement', 'left | right | top | bottom', 'right', '面板打开方向'],
    ['size', 'default | large', 'default', '默认尺寸 378；large 为 736'],
    ['width / height', 'number | string', '按 size', '左右方向设置 width，上下方向设置 height'],
    ['mask / maskClosable', 'boolean', 'true', '显示遮罩 / 点击遮罩请求关闭'],
    ['keyboard / closable', 'boolean', 'true', 'Esc 请求关闭 / 显示关闭按钮'],
    ['destroyOnHidden / forceRender', 'boolean', 'false', '关闭后卸载内容 / 首次打开前预渲染'],
    ['getContainer', 'HTMLElement | (() => HTMLElement) | string | false', 'document.body', '指定挂载位置；false 留在当前 DOM'],
    ['zIndex', 'number', '1000', '面板层级；嵌套时自动高于前一层'],
    ['afterOpenChange', '(open: boolean) => void', '—', '滑入 / 滑出结束后通知'],
    ['className / style / rootClassName', 'string / CSSProperties / string', '—', '面板类名、面板样式与根容器类名'],
    ['HTMLAttributes<HTMLDivElement>', '原生属性与事件', '—', '透传到面板，支持 aria-*、data-* 等'],
  ]} />;
}
export function BreadcrumbApiTable() {
  return <><ApiTable rows={[
    ['items', 'BreadcrumbItem[]', '[]', '按顺序显示导航项，字段见下表'],
    ['separator', 'ReactNode', '/', '默认分隔符'],
    ['itemRender', '(item, params, items, paths) => ReactNode', '—', '自定义项内容；paths 为当前项及之前非空 href'],
    ['params', 'unknown', '—', '传给 itemRender 的业务参数'],
    ['className / style', 'string / CSSProperties', '—', '导航容器样式'],
    ['HTMLAttributes<HTMLElement> / ref', '原生属性与事件 / Ref<HTMLElement>', '—', '作用于 nav；默认 aria-label 为面包屑'],
  ]} /><h3>导航项</h3><ApiTable rows={[
    ['key / title', 'string | number / ReactNode', '索引 / —', '稳定标识与项内容'],
    ['href / onClick', 'string / MouseEventHandler<HTMLElement>', '—', '有 href 时渲染链接；只有 onClick 时渲染按钮'],
    ['className', 'string', '—', '当前 li 的类名'],
    ['separator', 'ReactNode', '继承 separator', '覆盖当前项之后的分隔符'],
    ['type', 'separator', '普通项', '单独渲染分隔项，使用 separator 字段指定内容'],
  ]} /></>;
}
