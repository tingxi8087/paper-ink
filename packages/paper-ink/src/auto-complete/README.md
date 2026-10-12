# AutoComplete

自由文本补全。value/onChange 使用字符串，options 使用 `{ value, label?, disabled? }`，API 详情与案例见文档站 `#/auto-complete`。

```tsx
import { AutoComplete } from 'paper-ink/auto-complete';
import 'paper-ink/auto-complete/style.css';
<AutoComplete allowClear filterOption options={[{ value: 'React' }, { value: 'Vue' }]} />
```

默认不过滤，便于服务端搜索。onSearch 只在输入/清空触发，onSelect 在建议选择触发；支持键盘与 Form.Field 绑定。弹层局部挂载，可能受 overflow 裁剪。不支持多选、分组、虚拟列表或自定义输入组件。
