type Row = [string, string, string, string];
function Table({ rows }: { rows: Row[] }) { return <div className="table-scroll"><table><thead><tr><th>属性</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead><tbody>{rows.map(row => <tr key={row[0]}>{row.map((cell, i) => <td key={i}>{i < 3 ? <code>{cell}</code> : cell}</td>)}</tr>)}</tbody></table></div>; }
const common: Row[] = [
 ['value / defaultValue', 'Dayjs | null', 'null', '受控值 / 非受控初始值；不接收字符串、Date 或时间戳'],
 ['onChange', '(value, text) => void', '—', '只通知有效提交或清空；相同值不重复通知'],
 ['format', 'string', '按选择模式', '显示与严格输入解析格式，业务自行转换接口值'],
 ['placeholder', 'string', 'locale 文案', '输入提示'],
 ['size / status', 'small | middle | large / error | warning', 'middle / —', '控件尺寸与表单状态'],
 ['disabled / allowClear / inputReadOnly', 'boolean', 'false / true / false', '禁用、清空、仅允许面板选择'],
 ['className / style', 'string / CSSProperties', '—', '外层样式'],
 ['prefix / suffixIcon', 'ReactNode', '— / SVG 图标', '前缀和自定义后缀'],
 ['id / aria-* / onFocus / onBlur', '原生输入属性', '—', '传递到输入，与标签和表单帮助关联'],
 ['open / defaultOpen / onOpenChange', 'boolean / boolean / (open) => void', '— / false / —', '控制弹层；关闭放弃未提交草稿'],
 ['placement', 'bottomLeft | bottomRight | topLeft | topRight', 'bottomLeft', '弹层对齐，溢出时自动调整'],
 ['getPopupContainer', '(trigger) => HTMLElement', 'body', '自定义容器，继承当前主题'],
 ['locale', 'PickerLocale', 'zhCN', '局部文案、月份、星期及起始日；导出 zhCN / enUS'],
 ['needConfirm', 'boolean', '时间 true，日期 false', '确认模式只在确定时提交，清空立即提交'],
 ['onOk', '(value) => void', '—', '有效确认时触发；相同值仍可确认'],
 ['renderExtraFooter', '() => ReactNode', '—', '面板底部扩展'],
 ['ref', 'PickerRef', '—', 'focus(options?) / blur()'],
];
export function DatePickerApiTable() { return <Table rows={[...common,
 ['picker', 'date | month | year', 'date', '最终选择粒度，月份为月初、年份为年初'],
 ['showTime', 'boolean | TimeOptions', 'false', '仅 date 模式；时间列 format、hourStep、minuteStep、secondStep'],
 ['minDate / maxDate', 'Dayjs', '—', '限制日期及面板导航，不是时间戳边界'],
 ['disabledDate', '(date, { type, from? }) => boolean', '—', '禁用日期；范围第二端可读取第一端'],
 ['disabledTime', '(date) => DisabledTime', '—', 'showTime 时禁用时分秒'],
 ['presets', '{ label, value: Dayjs | (() => Dayjs) }[]', '—', '动态值在点击时求值，确认模式仍需确定'],
 ]} />; }
export function RangePickerApiTable() { return <Table rows={[
 ['value / defaultValue', '[Dayjs | null, Dayjs | null] | null', 'null', '范围整体管理；完整清空为 null'],
 ['onChange', '(values, [startText, endText]) => void', '—', '有效完整范围或允许为空的范围提交一次'],
 ['placeholder / disabled', '[string, string] / boolean | [boolean, boolean]', 'locale / false', '两端提示；支持单端禁用'],
 ['allowEmpty', '[boolean, boolean]', '[false, false]', '允许起始 / 结束端为空'],
 ['onCalendarChange', '(values, texts, { range }) => void', '—', '有效草稿通知，range 为 start / end，不提前写入 Form'],
 ['disabledTime', '(date, partial, { from? }) => DisabledTime', '—', 'partial 为 start / end；from 为第一端上下文'],
 ['presets', '{ label, value: [Dayjs, Dayjs] | (() => [Dayjs, Dayjs]) }[]', '—', '范围快捷项'],
 ['其余属性', '与 DatePicker 相同', '同单值', 'picker、showTime、格式、限制、弹层、样式、ref 等'],
 ]} />; }
export function TimePickerApiTable() { return <Table rows={[...common.map(row => row[0] === 'format' ? ['format', 'HH:mm | HH:mm:ss', 'HH:mm:ss', '24 小时制；HH:mm 隐藏并清零秒'] as Row : row),
 ['hourStep / minuteStep / secondStep', 'number', '1 / 1 / 1', '小时 1–24、分秒 1–60 的正整数；面板与输入同一校验'],
 ['disabledTime', '(current) => DisabledTime', '—', '禁用函数返回 disabledHours、disabledMinutes、disabledSeconds'],
 ]} />; }
