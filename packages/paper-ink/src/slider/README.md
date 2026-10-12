# Slider

单值或双柄范围调节，value/onChange 为 number 或二元数组。API 详情和案例见 `#/slider`。

```tsx
import { Slider } from 'paper-ink/slider';
import 'paper-ink/slider/style.css';
<Slider range defaultValue={[20, 80]} step={5} onChangeComplete={console.log} />
```

支持 pointer/触摸拖动、方向键、Home/End、PageUp/PageDown，decimal step、marks、step=null 刻度选择、vertical、reverse、disabled、Tooltip 和 Form.Field。双柄不交叉，无整体范围拖动或动态手柄。数值采用 JS number，常见小数步长清理浮点尾数，不提供任意精度运算。
