type Row = [string, string, string, string];
function Table({ rows }: { rows: Row[] }) {
  return <div className="table-scroll"><table><thead><tr><th>属性</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead><tbody>{rows.map(row => <tr key={row[0]}>{row.map((cell, index) => <td key={index}>{index < 3 ? <code>{cell}</code> : cell}</td>)}</tr>)}</tbody></table></div>;
}
const common: Row[] = [
  ['className / style', 'string / CSSProperties', '—', '根元素类名与内联样式；支持原生 div 属性'],
  ['ref', 'HTMLDivElement', '—', '访问根元素'],
];
export function SegmentedApiTable() { return <Table rows={[
  ['options', '(T | SegmentedOption<T>)[]', '必填', 'T 为 string 或 number；选项值应唯一'],
  ['value / defaultValue', 'T', '首个选项值', '受控值 / 初始值；初始值不会自动跳过禁用选项'],
  ['onChange', '(value: T) => void', '—', '选择不同值时触发'],
  ['disabled', 'boolean', 'false', '禁用整组交互'],
  ['size', "'small' | 'middle' | 'large'", 'middle', '控件尺寸'],
  ['block', 'boolean', 'false', '占满容器宽度'],
  ['vertical', 'boolean', 'false', '垂直排列'],
  ['name', 'string', '自动生成', '内部 radio 的原生表单名称'],
  ...common,
]} />; }
export function SegmentedOptionApiTable() { return <Table rows={[
  ['value', 'T', '必填', '选项值，T 为 string 或 number'],
  ['label', 'ReactNode', 'value', '选项显示内容'],
  ['icon', 'ReactNode', '—', '显示在文字前的自定义图标'],
  ['disabled', 'boolean', 'false', '禁用当前选项'],
  ['className', 'string', '—', '当前选项 label 元素的类名'],
  ['title', 'string', '—', '原生 title 提示'],
]} />; }
export function CollapseApiTable() { return <Table rows={[
  ['items', 'CollapseItem[]', '[]', '面板列表，字段见下表'],
  ['activeKey / defaultActiveKey', 'string | number | (string | number)[]', '[]', '受控展开项 / 初始展开项'],
  ['onChange', '(keys: string[]) => void', '—', '展开变化；数字 key 会转换为字符串'],
  ['accordion', 'boolean', 'false', '仅展开一项；传入多个展开 key 时使用第一项'],
  ['bordered / ghost', 'boolean', 'true / false', '边框 / 透明无边框外观'],
  ['size', "'small' | 'middle' | 'large'", 'middle', '面板尺寸'],
  ['collapsible', "'header' | 'icon' | 'disabled'", 'header', '整组的触发方式，单项设置优先'],
  ['destroyOnHidden', 'boolean', 'false', '收起后卸载内容，优先于 forceRender'],
  ['expandIcon', '(props: { isActive: boolean }) => ReactNode', 'SVG 箭头', '自定义展开图标'],
  ['expandIconPosition', "'start' | 'end'", 'start', '展开图标位置'],
  ...common,
]} />; }
export function CollapseItemApiTable() { return <Table rows={[
  ['key', 'string | number', '必填', '面板唯一标识'],
  ['label / children / extra', 'ReactNode', '—', '标题 / 内容 / 标题旁附加内容'],
  ['showArrow', 'boolean', 'true', '显示展开图标；隐藏时 icon 触发回退为 header'],
  ['collapsible', "'header' | 'icon' | 'disabled'", '继承整组', '当前面板的触发方式'],
  ['forceRender', 'boolean', 'false', '未首次展开时也渲染内容；destroyOnHidden 开启时无效'],
  ['className / style', 'string / CSSProperties', '—', '当前面板 section 元素的样式'],
]} />; }
export function ProgressApiTable() { return <Table rows={[
  ['percent', 'number', '0', '进度；限制在 0–100，非有限数值按 0 处理'],
  ['type', "'line' | 'circle' | 'dashboard'", 'line', '线形 / 环形 / 仪表盘'],
  ['status', "'normal' | 'active' | 'success' | 'exception'", '自动判断', '未指定时，100% 为 success，其余为 normal'],
  ['showInfo', 'boolean', 'true', '显示百分比或状态图标'],
  ['format', '(percent?: number, successPercent?: number) => ReactNode', '—', '自定义显示内容，收到限制范围后的百分比'],
  ['strokeColor / trailColor', 'string', '主题色', '进度颜色 / 轨道颜色'],
  ['strokeWidth', 'number', '线形 8 / 环形 6', '线形高度（px）；环形为 SVG viewBox 线宽'],
  ['strokeLinecap', "'round' | 'butt' | 'square'", 'round', '线条端点样式'],
  ['size', "'small' | 'default' | number | [number, number]", 'default', '尺寸；数字为宽度，元组为 [宽度, 高度]'],
  ['steps', 'number', '—', '线形分段数，取整后限制为 1–1000'],
  ['success', '{ percent?: number; strokeColor?: string }', '—', '成功进度及颜色；可见成功段不超过总进度'],
  ['gapDegree', 'number', '环形 0 / 仪表盘 75', '缺口角度，限制为 0–295 度'],
  ['gapPosition', "'top' | 'bottom' | 'left' | 'right'", 'bottom', '环形或仪表盘的缺口位置'],
  ...common,
]} />; }
export function SkeletonApiTable() { return <Table rows={[
  ['loading', 'boolean', 'true', '开启时显示占位；关闭时直接渲染 children'],
  ['active', 'boolean', 'false', '开启轻量加载动效'],
  ['avatar', "boolean | { size?: 'small' | 'default' | 'large' | number; shape?: 'circle' | 'square' }", 'false', '头像占位；对象配置尺寸与形状'],
  ['title', 'boolean | { width?: number | string }', 'true', '标题占位，默认宽度 38%'],
  ['paragraph', 'boolean | { rows?: number; width?: number | string | (number | string)[] }', 'true', '默认 3 行，最后一行宽度 61%；行数限制为 0–100'],
  ['round', 'boolean', 'false', '标题与段落使用圆角占位'],
  ['children', 'ReactNode', '—', '加载完成后的实际内容'],
  ...common,
]} />; }
export function SkeletonAvatarApiTable() { return <Table rows={[
  ['active', 'boolean', 'false', '开启加载动效'],
  ['size', "'small' | 'default' | 'large' | number", 'default', '预设尺寸为 24 / 32 / 40px，也支持数字尺寸'],
  ['shape', "'circle' | 'square'", 'circle', '占位形状'],
  ...common,
]} />; }
export function SkeletonElementApiTable() { return <Table rows={[
  ['active', 'boolean', 'false', '开启加载动效'],
  ['size', "'small' | 'default' | 'large'", 'default', 'Button / Input 高度为 24 / 32 / 40px；Image / Node 高度固定 96px'],
  ['block', 'boolean', 'false', '占满容器宽度；默认 Button 80px、Input 160px、Image / Node 96px'],
  ['shape', "'default' | 'round' | 'circle'", 'default', '主题圆角 / 胶囊 / 圆形'],
  ['children', 'ReactNode', '—', '占位元素内部的自定义内容'],
  ...common,
]} />; }
