# Statistic

数值、金额与指标展示。支持 title、value（number/string）、precision、decimalSeparator、groupSeparator、formatter、prefix、suffix、loading、valueStyle、classNames/styles 对象、原生属性和 DOM ref。

```tsx
import { Statistic } from 'paper-ink/statistic';
import 'paper-ink/statistic/style.css';
<Statistic title="余额" value="12345678901234567890.125" precision={2} prefix="¥" />
```

CLI：`paper-ink add statistic`。使用 mini-decimal 规范化与舍入数值字符串，避免把大数转换为 Number；precision 限制在 0–100。字符串中已有的 Number 精度损失无法恢复。非数值字符串原样展示。formatter 优先于默认分组/精度逻辑。loading 隐藏旧值，无额外动画或请求功能。不提供 Timer/Countdown、数值滚动动画或函数形式语义样式。
