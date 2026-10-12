# TimePicker

Dayjs 单时间输入，24 小时制，默认需要确认。使用 `paper-ink/time-picker/style.css` 或完整样式。

```tsx
import { TimePicker } from 'paper-ink/time-picker';
<TimePicker format="HH:mm" minuteStep={5} />
<TimePicker disabledTime={() => ({ disabledHours: () => [0, 1, 2] })} />
```

支持日期组件通用外观、输入、清空、弹层、确认、locale、ref 属性，以及 hourStep/minuteStep/secondStep、disabledTime。format 首期为 HH:mm 或 HH:mm:ss；隐藏秒列时提交秒和毫秒归零。步长必须为合法正整数（小时不超过24，分钟秒不超过60），无效配置回退1。既有值不会静默舍入，提交必须满足当前步长与禁用规则。

手动输入严格解析，非空值保留日期部分；从空值选择以当天承载时间。业务只读取时间字段。关闭放弃未确认草稿，清空立即提交 null；同值不重复通知 onChange，明确确认仍通知 onOk。

不支持日期范围规则、时间范围、AM/PM、毫秒和时区 token。使用 Form 时遵循 value/onChange，统一错误状态和焦点协议。
