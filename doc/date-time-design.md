# 轻量日期时间组件设计

状态：2026-10-12 首期已实现 DatePicker、DatePicker.RangePicker、TimePicker，含日期附带时间、月/年模式与范围。本文保留设计约定及后续计划；当前 API 与边界以组件源码、README 与文档站为准。

## 设计原则

- 常规属性名称、类型和回调尽量接近 antd，只实现明确的常用子集，不承诺完整兼容。
- 日期处理使用 Day.js；不引入完整 picker 引擎，不自写日期运算，不开放多日期库适配器。
- 统一使用 Dayjs 值，空值为 null；显示格式、面板草稿和业务提交数据各自负责自己的状态。
- 控件负责选择与输入，业务负责请求、查询、提交转换和时区策略。
- 日期、月份、年份和时间复用内部基础；不把所有能力集中到一个公开组件配置对象里。
- 共用已有主题、弹层定位、Form 绑定和 SVG 图标；紧凑黑白外观，仅使用平缓淡入淡出，无弹性动画。
- 轻量以实际增量产物体积和交互性能为依据，不先承诺固定 KB 数。

## 功能范围

| 功能 | 阶段 | 计划支持 |
| --- | --- | --- |
| DatePicker | 首期 | 单日期，日历选择、手动输入、清空、今天 |
| DatePicker.RangePicker | 首期 | 日期范围、两个输入、范围预览、自动排序、允许单端为空 |
| TimePicker | 首期 | 单时间，时分秒列、手动输入、步长、此刻 |
| 日期附带时间 | 首期 | DatePicker 和 RangePicker 的 showTime，复用时间面板 |
| 月份、年份选择 | 首期 | DatePicker / RangePicker 的 picker="month" 或 "year" |
| 禁用与限制 | 首期 | 整体禁用、范围单端禁用、最小最大日期、禁用日期与时间 |
| 快捷选择 | 首期 | presets，静态值或点击时执行的函数 |
| 受控与非受控 | 首期 | 值、弹层分别控制；组件内部管理面板导航和未提交草稿 |
| 表单接入 | 首期 | 统一 value/onChange 协议、错误状态、禁用状态和无障碍属性 |
| 键盘与焦点 | 首期 | 日历方向键、Enter、Escape、Tab、焦点恢复 |
| 本地化 | 首期 | 中文与英文文案、星期起始日；组件局部 locale |
| TimePicker.RangePicker | 第二批 | 时间范围；跨午夜规则确定后再公开 API |
| 周、季度、多日期选择 | 后续按需 | 不预留占位属性 |
| Calendar | 单独设计 | 日历展示、内容渲染和排期需求，不纳入本次输入选择器 |
| 12 小时制 | 后续按需 | 首期只支持 24 小时制 |
| 时区选择、UTC 模式 | 不内置 | 由调用方在数据边界明确转换 |

首期的月份和年份 RangePicker 选择的是月份/年份范围；showTime 只允许与 picker="date" 组合。Calendar、时间范围和后续能力仍保持待实现状态。

## 值与格式协议

```ts
import type { Dayjs } from 'dayjs';

type DateValue = Dayjs | null;
type RangeValue = [Dayjs | null, Dayjs | null] | null;
type RangeTexts = [string, string];
```

| 场景 | 值 | 默认显示格式 |
| --- | --- | --- |
| 日期 | Dayjs 或 null | YYYY-MM-DD |
| 日期 + 时间 | Dayjs 或 null | YYYY-MM-DD HH:mm:ss |
| 月份 | Dayjs 或 null | YYYY-MM |
| 年份 | Dayjs 或 null | YYYY |
| 时间 | Dayjs 或 null | HH:mm:ss |
| 范围 | 两端元组或 null | 每个端点使用同一个 format |

- 不接受字符串、原生 Date、时间戳作为 value，不增加 valueFormat；业务显式解析和序列化。
- format 只影响显示与手动输入解析，不决定接口存储格式。首期为单个格式字符串，不支持格式数组、格式函数或输入掩码对象。
- 日期选择按本地日比较，面板选中值规范到当天零点；月份规范到月初零点，年份规范到年初零点。受控传入值不会被静默重写，仅在用户提交选择时规范化。
- 日期时间按本地墙上时间选择；不自动换算到 UTC，不生成带 Z 的字符串。组件不定义跨时区调度或夏令时歧义的业务规则。
- TimePicker 的日期部分不属于其业务含义。非空值保留其日期部分；从空值开始选择使用当日作为载体，业务只读取时间字段。
- 清空单值为 null，第二参数为空字符串；清空整个范围为 null，第二参数为 ['', '']。不输出 [null, null] 作为已提交值。
- allowEmpty 允许的单端范围提交为 [start, null] 或 [null, end]；未完成且不允许为空的范围仅存在于面板草稿中。
- 不自动把日期范围末端变成当天 23:59:59，也不替业务生成包含端点或排除端点的查询条件。
- Dayjs 按不可变值使用，不启用修改实例的插件；Form 集成需验证值比较、dirty、reset 和变化快照。

## 通用属性

以下属性计划用于 DatePicker、DatePicker.RangePicker 和 TimePicker。范围组件的值、placeholder 和 disabled 类型另见范围 API。

| 属性 | 计划类型 | 默认 / 行为 |
| --- | --- | --- |
| value | Dayjs 或 null | 受控已提交值；范围为 RangeValue |
| defaultValue | 与 value 相同 | 非受控初始值；后续变化不覆盖当前值 |
| onChange | 单值：(value, text) => void；范围：(values, texts) => void | 仅有效值提交或清空时通知；相同有效值不重复通知 |
| format | string | 使用对应模式的默认格式，严格解析输入 |
| placeholder | string；范围为 [string, string] | 默认使用 locale 对应文案 |
| size | 'small' / 'middle' / 'large' | 跟现有输入控件尺寸一致；不复用布局间距枚举 |
| disabled | boolean；范围还支持 [boolean, boolean] | 默认 false |
| status | 'error' / 'warning' | 支持 Form 传入；内部解析错误也显示错误状态 |
| allowClear | boolean | 默认 true；首期不提供自定义清除按钮对象 |
| inputReadOnly | boolean | 默认 false；禁止手动输入，仍允许面板选择 |
| className / style | string / CSSProperties | 外层控件样式 |
| prefix / suffixIcon | ReactNode | 前缀内容与自定义后缀图标；内置图标使用 SVG |
| id | string | 关联标签；范围 id 关联起始输入，末端生成派生 id |
| aria-* | 对应无障碍属性 | 传递到输入；范围两端均关联帮助与错误说明 |
| onFocus / onBlur | 输入焦点事件回调 | 原生输入级别事件；组合弹层提交与关闭不依赖单个 input 的 blur |
| open / defaultOpen | boolean | 弹层受控状态 / 初始状态，默认关闭 |
| onOpenChange | (open: boolean) => void | 通知打开或关闭请求；受控时由外部更新 open |
| placement | 'bottomLeft' / 'bottomRight' / 'topLeft' / 'topRight' | 默认 bottomLeft，溢出时复用定位逻辑调整 |
| getPopupContainer | (trigger: HTMLElement) => HTMLElement | 默认 body；弹层继承当前主题 |
| locale | PickerLocale | 默认中文；提供独立中文/英文配置，局部覆盖，不修改 Day.js 全局 locale |
| needConfirm | boolean | 纯日期/月/年默认 false；时间或 showTime 默认 true |
| onOk | 单值：(value: Dayjs) => void；范围：(values: 非空 RangeValue) => void | 有效确认按钮点击时触发；无效或不完整草稿不可确认 |
| renderExtraFooter | () => ReactNode | 面板底部扩展；不替换内部面板 |

“非空 RangeValue”指排除最外层 null 的元组，端点是否允许 null 由 allowEmpty 决定。首期不提供语义 DOM classNames/styles、弹层样式别名或内部面板替换接口；稳定样式扩展需求后续单独设计。

## DatePicker 属性

| 属性 | 计划类型 | 默认 / 行为 |
| --- | --- | --- |
| picker | 'date' / 'month' / 'year' | 默认 date；同一控件只使用一种最终选择模式 |
| showTime | boolean 或 TimeOptions | 默认 false，仅 date 模式支持 |
| minDate / maxDate | Dayjs | 限制可选日期和面板导航；按日期/月/年对应粒度比较 |
| disabledDate | (current: Dayjs, info: { type: Picker; from?: Dayjs }) => boolean | 禁用规则；单值无 from，范围选择第二端时提供起点 |
| disabledTime | (date: Dayjs) => DisabledTime | 仅 showTime 使用；禁用该日期内的时分秒 |
| presets | { label: ReactNode; value: Dayjs 或 (() => Dayjs) }[] | 点击时解析函数值，按同一有效性规则提交 |

```ts
type Picker = 'date' | 'month' | 'year';

type TimeOptions = {
  format?: string;
  hourStep?: number;
  minuteStep?: number;
  secondStep?: number;
};

type DisabledTime = {
  disabledHours?: () => number[];
  disabledMinutes?: (hour: number) => number[];
  disabledSeconds?: (hour: number, minute: number) => number[];
};
```

showTime 的 format 控制时间面板可见列；组件 format 控制输入整体显示。默认均显示时分秒。如果只需要分钟精度，应同时使用整体 format="YYYY-MM-DD HH:mm" 和 showTime={{ format: 'HH:mm' }}；避免在隐藏的时间列中保留无法编辑的精度。

minDate/maxDate 不作为日期时间的完整时间戳边界；例如“今天只能选当前时间以后”需组合 disabledTime。时间步长必须为合法正整数，小时 1–24、分钟和秒 1–60；配置检查不得造成空选项或无限循环。

## DatePicker.RangePicker 属性

继承通用属性及 picker、showTime、minDate/maxDate、disabledDate、renderExtraFooter；以下替换对应单值定义或补充范围能力。

| 属性 | 计划类型 | 默认 / 行为 |
| --- | --- | --- |
| value / defaultValue | RangeValue | 清空为 null；完整范围为 [start, end] |
| onChange | (values: RangeValue, texts: RangeTexts) => void | 有效范围整体提交时通知一次 |
| placeholder | [string, string] | 起始、结束输入提示 |
| disabled | boolean 或 [boolean, boolean] | 可独立禁用端点，提交保留被禁用端点已有值 |
| allowEmpty | [boolean, boolean] | 默认 [false, false]，允许单端为空 |
| onCalendarChange | (values: [Dayjs 或 null, Dayjs 或 null], texts: RangeTexts, info: { range: 'start' 或 'end' }) => void | 通知有效草稿端点选择或输入；不把中间结果写入 Form |
| disabledTime | (date: Dayjs, partial: 'start' 或 'end', info: { from?: Dayjs }) => DisabledTime | 日期时间范围的时间限制；第二端提供当前第一端上下文 |
| presets | { label: ReactNode; value: [Dayjs, Dayjs] 或 (() => [Dayjs, Dayjs]) }[] | 如最近七天；点击时求值、校验、整体更新草稿或提交 |

- 默认按先后排序，不公开 order 参数；同一日期/时间允许作为两个端点。
- 自动排序后重新验证两端的禁用规则，规则不满足则保留草稿且禁止提交。
- 若排序需要修改被禁用端点，则不交换、不提交，提示用户调整可编辑端点。
- 日期范围使用双月面板；窄空间退为单月切换，仍保留两个输入。月/年范围使用对应粒度面板。
- 允许单端为空且启用确认时，可直接确认有效单端草稿；即时模式下，需明确完成端点输入或选择，不因打开面板就提交空端点。
- 首期不提供自定义 separator、受控 activePicker 或独立控制两个面板导航状态。

## TimePicker 属性

| 属性 | 计划类型 | 默认 / 行为 |
| --- | --- | --- |
| format | string | 默认 HH:mm:ss；首期支持 HH:mm 或 HH:mm:ss 的 24 小时制 |
| hourStep / minuteStep / secondStep | number | 默认 1；决定面板列选项及输入可接受步长 |
| disabledTime | (current: Dayjs) => DisabledTime | 禁用指定时分秒；空值面板以当前日期的草稿为上下文 |

format="HH:mm" 隐藏秒列，提交值的秒和毫秒规范到 0；HH:mm:ss 将毫秒规范到 0。日期时间组合采用同样的精度规则。既有值不落在步长选项内时不静默修改；下一次提交必须满足当前步长和禁用条件，不自动舍入。

TimePicker 不使用 minDate/maxDate、disabledDate、picker、showTime，也不内置跨午夜范围。时间格式首期不支持 AM/PM、毫秒、时区 token 或自定义任意列。

## 方法与表单接入

| ref 方法 | 行为 |
| --- | --- |
| focus(options?: FocusOptions) | 聚焦输入；范围默认聚焦起始输入；支持 preventScroll |
| blur() | 移除输入焦点；不承担提交无效草稿或强制关闭受控弹层的职责 |

三个组件在各自模块声明统一字段绑定协议，不在 Form 内添加组件身份判断。转发 id、status、disabled、onBlur、aria 属性及 focus ref；范围作为一个顶层字段整体管理。

```tsx
import dayjs, { type Dayjs } from 'dayjs';
import { DatePicker, TimePicker, Form, useForm } from 'paper-ink';

type Values = {
  birthday: Dayjs | null;
  period: [Dayjs | null, Dayjs | null] | null;
  runAt: Dayjs | null;
};

const form = useForm<Values>({
  defaultValues: { birthday: null, period: null, runAt: dayjs() },
});

<Form form={form}>
  <Form.Field name="birthday" label="生日">
    <DatePicker />
  </Form.Field>
  <Form.Field name="period" label="查询时间">
    <DatePicker.RangePicker showTime />
  </Form.Field>
  <Form.Field name="runAt" label="执行时间">
    <TimePicker format="HH:mm" minuteStep={5} />
  </Form.Field>
</Form>;
```

库内 Form.Field 接管 value，不同时传控件 defaultValue。提交时由业务转换：生日使用 format('YYYY-MM-DD')，时间使用 format('HH:mm')；日期时间根据接口约定选择本地字符串或明确的时区转换。仅有日期的值不要经 toISOString() 绕行 UTC 后再截取日期。

## 草稿、提交与输入规则

| 操作 | 计划行为 |
| --- | --- |
| 打开 | 从最新已提交值建立草稿；空值使用当天定位，打开本身不触发 onChange |
| 纯日期/月/年选择 | 默认有效选择即提交；范围必须完整或满足 allowEmpty |
| 时间 / 日期时间选择 | 默认更新草稿，点确定才提交；needConfirm=false 时有效完整选择即时提交 |
| 点击快捷项 / 今天 / 此刻 | 走与面板相同的校验与提交策略；needConfirm=true 时仍需确认 |
| 确认 | 校验草稿；先在值变化时 onChange，再 onOk，再请求关闭；值相同仍允许 onOk |
| 清空 | 独立明确操作，立即提交 null，无需二次确认；受控值未更新前不假装已清空 |
| 手动输入 | 严格按 format 解析；有效输入在 Enter 或离开整个控件及弹层后完成解析；确认模式只更新草稿，仍需确定 |
| 无效输入 | 保留编辑文本、标记错误，不触发 onChange/onCalendarChange；不自动纠正不存在的日期 |
| Escape / 外部点击 | 放弃尚未提交的草稿并请求关闭；无效文本离开后仍保留供修改，再次打开沿用；Escape 明确还原已提交值 |
| 受控值外部变化 | 以外部值为准，重置草稿和输入文本；切月或鼠标悬停不覆盖已提交值 |
| 限制条件变化 | 重新判断草稿可提交性；不静默清空外部 value，不自动调用 onChange |
| 输入到面板的焦点移动 | 不视为离开整个控件，不提前提交或丢弃草稿 |

内部解析错误和 Form.status 分开管理；修正文本只清除内部解析错误，不清除业务校验错误。不额外提供 onDraftChange/onSelect 等相近事件；范围中间联动使用 onCalendarChange。

## 本地化、依赖与分发

- 新增 Day.js 运行时依赖，仅日期时间入口直接引用；Input、Button 等单组件入口不导入它。
- 严格输入解析使用 CustomParseFormat；月份、年份运算采用现成日期能力。日期组件不全量导入插件与 locale。
- 首期 locale 控制文案、月份/星期标题与 weekStartsOn（0–6）；提供中文（周一起始）和英文（周日起始）配置，不改变 Day.js 全局配置。首期格式为数字格式，不支持月份名称等语言敏感输入。
- 当前 ConfigProvider 仅管理主题；首期不默认承诺全局 locale 扩展，统一语言可由业务薄封装传入。
- 计划 npm 根入口及 paper-ink/date-picker、paper-ink/time-picker 独立入口，提供完整样式与组件样式；RangePicker 随 DatePicker 导出。
- CLI 计划支持 add date-picker / add time-picker；安装对应源码、共享内部文件并声明 Day.js 依赖。单独添加日期组件不要求安装 Form。
- 内部共享日期解析/运算、日历与时间面板、输入与提交控制。共享模块是实现细节，不作为公共 date-utils 或配置工厂导出。

## 首期边界

- 不支持字符串值、Date 值、时间戳值、valueFormat、多日期库泛型和自行替换日期运算引擎。
- 不支持 week/quarter、multiple、12 小时制、毫秒、输入掩码、多格式解析和自动猜测日期格式。
- 不支持时区选择、UTC 模式、跨时区调度、农历、节假日数据和非公历系统。
- 不支持受控 mode/pickerValue、替换内部面板组件、panelRender 和自定义每个日期单元格；先提供 presets 和 renderExtraFooter。
- 不提供 Calendar 排期、时间范围和移动端独立滚轮面板；桌面面板需可在窄屏内操作。
- 不追求完整 antd API，也不提供同义旧属性；具体不兼容项在实现后的组件 README 单独列出。
- 不承诺 SSR；无障碍与键盘操作属于首期必需能力。

## 实施顺序与验收

1. 日期运算、严格解析、值比较与单日期面板；接入 DatePicker、Form、npm 与 CLI。
2. 日期范围、单端为空、动态禁用、快捷范围与双月/窄屏面板。
3. 时间面板、步长与禁用、TimePicker、showTime、确认草稿。
4. 月/年模式及范围，本地化，补齐演示与交互测试，验证产物体积。

| 检查类别 | 必需覆盖 |
| --- | --- |
| 日期计算 | 闰年、不存在的日期、月末切换、跨年、月/年粒度限制、星期起始日 |
| 值与控制 | 受控/非受控、清空 null、外部更新、限制变化、同值不重复通知 |
| 范围 | 正反顺序、同一天、单端为空、单端禁用、动态 disabledDate、排序后再校验 |
| 时间 | 分钟/秒精度、步长输入与面板一致、禁用组合、跨日日期时间、非法配置 |
| 输入与提交 | 严格解析、粘贴、无效文本保留、Escape 还原、草稿取消、确认事件顺序 |
| 表单 | 自动绑定、range 整体字段、dirty/reset、Dayjs 快照、错误与焦点关联 |
| 弹层与键盘 | Portal 主题继承、容器定位、遮挡边界、方向键、Enter/Escape/Tab、焦点恢复 |
| 外观 | 紧凑黑白、SVG 图标、无弹性动画、窄屏无页面横向溢出 |
| 分发与体积 | npm/CLI 实际使用、React 18/19、DatePicker/TimePicker 入口增量及其他组件按需体积 |

演示至少包含：基础日期、月份/年份、受控与清空、手动输入、日期限制、快捷范围、单端为空、日期时间范围、时间步长/禁用、Form 查询与编辑、中文/英文、窄屏布局。

完成各阶段后更新优先级 Markdown，运行 node scripts/build-component-priorities.mjs，检查状态筛选和统计。DatePicker、TimePicker 已标为已有基础实现；Calendar、时间范围及其他后续能力仍未实现。

## 实现与验证记录

- 文档站提供 DatePicker 14 个、TimePicker 6 个可编辑案例，包含表单、限制、范围、严格输入、时间草稿、局部英文与主题。
- 新增运算/面板、控件状态、Form 绑定与公开类型测试；浏览器检查真实 Portal、键盘、输入、范围和窄屏。最终回归：278 项单元测试、9 项 CLI 测试、94 项浏览器测试通过；全仓 typecheck/build 通过，npm 打包及 CLI 源码消费已验证 React 18.3.1 / 19.3.0。
- Form 对不可变标量值类使用相同原型与 valueOf() 数字/字符串比较，不依赖 Day.js；日期修改后选回基准值可恢复 clean，reset 保留原基准。
- 增量测量（gzip，React 外置，包含 Day.js）：DatePicker JS 约 13.8 KB、TimePicker JS 约 13.8 KB、各独立入口 CSS 约 1.7 KB。两者共用内部引擎，组合使用不需重复加载该引擎；其他独立组件入口无 Day.js。具体字节以 check:size 当前输出为准。

## 参考

- [Ant Design DatePicker](https://ant.design/components/date-picker/)：常规属性、范围与日期时间入口的命名参考。
- [Ant Design TimePicker](https://ant.design/components/time-picker/)：时间步长、禁用规则与确认交互参考。
- [Day.js 严格格式解析](https://day.js.org/docs/en/parse/string-format)：CustomParseFormat 与严格输入解析。
