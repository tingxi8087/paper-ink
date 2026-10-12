# Steps 步骤条

用紧凑节点展示流程位置、完成和错误状态。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `items` | `StepItem[]` | `[]` | 步骤数据，稳定 key 可选 |
| `current / initial` | `number` | `0 / 0` | 当前绝对索引和起始索引 |
| `status` | `wait \| process \| finish \| error` | `process` | 当前步骤状态 |
| `direction` | `horizontal \| vertical` | `horizontal` | 水平或垂直排列 |
| `size` | `default \| small` | `default` | 默认或紧凑尺寸 |
| `labelPlacement` | `horizontal \| vertical` | `horizontal` | 水平排列中的标签位置 |
| `onChange` | `(current: number) => void` | `—` | 提供时将步骤变为可点击原生按钮 |
| `StepItem.title / subTitle / description` | `ReactNode` | `—` | 标题、副标题和说明 |
| `StepItem.icon / status / disabled` | `ReactNode / StepStatus / boolean` | `—` | 自定义图标、覆盖状态、禁用点击 |
| `className / style / ref` | `原生 ol 属性` | `—` | 容器扩展 |

## 支持边界

- 支持水平/垂直、四种状态、紧凑尺寸、自定义 SVG 图标、上下标签及受控步骤点击。current 与 onChange 都使用 initial 偏移后的绝对索引。
- 不负责表单校验、页面切换或异步请求；不给 onChange 时为展示列表，提供时为可键盘激活的按钮，禁用步骤不能点击。
- 窄屏水平步骤在容器内横向滚动；暂不提供 progressDot、percent、navigation/inline 类型、自动响应式转垂直、Steps.Step 或语义样式函数。

从 `paper-ink` 或 `paper-ink/steps` 导入；样式导入 `paper-ink/style.css` 或 `paper-ink/steps/style.css`。CLI：`paper-ink add steps`。
