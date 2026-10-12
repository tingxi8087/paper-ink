# DatePicker

Dayjs 值的轻量日期输入，默认中文，提供单日期、月份、年份和 `DatePicker.RangePicker`。导入 `paper-ink/date-picker/style.css` 或完整样式。

```tsx
import dayjs from 'dayjs';
import { DatePicker, enUS } from 'paper-ink/date-picker';
<DatePicker defaultValue={dayjs('2024-02-29')} />
<DatePicker.RangePicker showTime presets={[{ label: '最近七天', value: () => [dayjs().subtract(6, 'day'), dayjs()] }]} />
<DatePicker picker="month" locale={enUS} />
```

通用属性：value/defaultValue、onChange、format、placeholder、size、disabled、status、allowClear、inputReadOnly、className/style、prefix/suffixIcon、id/aria 属性、onFocus/onBlur、open/defaultOpen/onOpenChange、placement/getPopupContainer、locale、needConfirm、onOk、renderExtraFooter。ref 支持 focus(options)、blur()。

日期属性：picker（date/month/year）、showTime（boolean 或时间 format/步长配置）、minDate/maxDate、disabledDate、disabledTime、presets。范围额外支持 allowEmpty、端点 disabled 元组、onCalendarChange；清空返回 null，范围整体更新一次，反向范围自动排序并再次校验。

日期默认立即提交；带时间默认确认提交，关闭取消草稿。输入严格按 format 解析；错误文本保留，Escape 恢复提交值。日期/月/年选择归零至对应粒度；日期时间按可见时间精度归零，不自动转换时区。minDate/maxDate 只限制日期粒度，时间限制使用 disabledTime。

Form 通过统一 value/onChange 协议自动绑定，不需要控件特判。value 明确传入 undefined 仍视为受控空值。locale 局部配置不修改 Dayjs 全局语言。

边界：无 week/quarter/multiple、字符串 value、valueFormat、12 小时制、时区选择、自定义单元格、受控面板导航或面板替换。Calendar 和时间范围不包含在本组件。API 类型与完整交互约定见 `doc/date-time-design.md`。
