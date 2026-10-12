# Util

纯 TypeScript 工具类型：`GetProps<T>` 提取组件 props、Context value 或透传已有属性对象；`GetProp<T, K>` 提取非空属性，第三参数 `'Return'` 提取可调用成员的返回类型；`GetRef<T>` 提取组件或原生元素的 ref 目标类型。

```ts
import type { GetProp, GetProps, GetRef } from 'paper-ink/util';
import { Input, Select } from 'paper-ink';
type Options = GetProp<typeof Select, 'options'>;
type Props = GetProps<typeof Input>;
type Ref = GetRef<typeof Input>;
```

CLI：`paper-ink add util`。没有运行时函数、CSS 或额外依赖。泛型组件推荐先实例化泛型或传入公开 props 接口，以保留准确类型；不尝试恢复已被 TypeScript 擦除的泛型信息。GetProps 不接受原生元素名称（原生属性使用 React.ComponentProps）；GetRef 允许原生元素名称。
