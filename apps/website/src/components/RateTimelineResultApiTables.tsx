import { PropsTable } from './ComponentApiTables';
export function RateApiTable() { return <PropsTable rows={[
 ['value / defaultValue','number','— / 0','受控评分 / 初始评分，限制在 0 到 count 之间'],
 ['count','number','5','评分符号数量'],['allowHalf','boolean','false','允许鼠标和键盘选择半分'],['allowClear','boolean','true','再次点击当前分数清空为 0'],
 ['disabled','boolean','false','只读展示，禁用指针及键盘操作'],['keyboard','boolean','true','方向键调整；Home / End 选择最低 / 最高分'],
 ['size','small / medium / large','medium','符号尺寸'],['character','ReactNode | (props & { index }) => ReactNode','SVG 星形','自定义评分符号，index 从 0 开始'],
 ['tooltips','string[]','—','每个符号的原生 title 提示'],['onChange','(value: number) => void','—','评分变化回调'],['onHoverChange','(value: number) => void','—','指针预览分数，退出或选择后回到 0'],
 ['onFocus / onBlur / onKeyDown','React 事件回调','—','原生焦点 / 键盘事件；preventDefault 可取消内置键盘操作'],
 ['className / style','string / CSSProperties','—','根容器样式，选中颜色默认主色'],['ref','RateRef','—','focus、blur 与 nativeElement；支持 aria-label'],
 ]} />; }
export function TimelineApiTable() { return <PropsTable rows={[
 ['items','TimelineItemType[]','[]','时间轴节点数组'],['mode','start / end / alternate / left / right','start','内容位于轴的起始、结束侧或交错排列；兼容旧 left / right'],
 ['reverse','boolean','false','反转显示顺序，不修改输入数组'],['variant','outlined / filled','outlined','默认节点圆点样式'],
 ['pending / pendingDot','ReactNode','false / SVG 加载图标','兼容末尾等待节点；推荐 items.loading / icon'],
 ['items.title / label','ReactNode','—','节点另一侧的标题 / 旧版标签'],['items.content / children','ReactNode','—','内容 / 旧版内容，content 优先'],
 ['items.icon / dot','ReactNode','SVG 圆点','自定义节点图标 / 旧版 dot，icon 优先'],['items.loading','boolean','false','加载状态与 SVG 旋转图标；自定义图标优先'],
 ['items.color','string','主色','blue、red、green、gray 或自定义 CSS 颜色'],['items.placement / position','start / end；position 兼容 left / right','跟随 mode','单独指定内容所在侧'],
 ['items.key / className / style','React.Key / string / CSSProperties','—','稳定节点标识与样式；支持适用的原生 li 属性'],
 ['className / style / ref','string / CSSProperties / Ref<HTMLOListElement>','—','根有序列表的样式和原生引用'],
 ]} />; }
export function ResultApiTable() { return <PropsTable rows={[
 ['status','success / error / info / warning / 403 / 404 / 500','info','语义状态；异常代码接受数字或字符串'],['title / subTitle','ReactNode','—','标题与补充说明'],
 ['icon','ReactNode','状态对应 SVG','自定义所有状态的图标；null / false 隐藏图标'],['extra','ReactNode','—','操作区域，支持按钮或自定义内容'],['children','ReactNode','—','附加详情，在浅底内容区展示'],
 ['classNames / styles','对象','—','root、icon、title、subTitle、extra、body 的语义类名 / 样式'],
 ['className / rootClassName / style','string / string / CSSProperties','—','根容器样式，支持适用的原生 HTML 属性'],['ref','Ref<HTMLDivElement>','—','原生根元素引用'],
 ]} />; }
