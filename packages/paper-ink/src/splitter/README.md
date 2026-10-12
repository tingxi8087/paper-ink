# Splitter 分隔面板

拖动或使用键盘调整相邻面板，支持受控尺寸和嵌套分栏。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `layout` | `horizontal \| vertical` | `horizontal` | 水平左右 / 垂直上下分栏 |
| `children` | `Splitter.Panel` | `—` | 只接受直接 Panel 子节点 |
| `onResizeStart / onResize / onResizeEnd` | `(sizes: number[]) => void` | `—` | 开始 / 变化 / 结束，返回每个面板像素尺寸 |
| `Panel.size / defaultSize` | `number \| 百分比字符串` | `均分剩余空间` | 受控 / 初始尺寸，数字为像素 |
| `Panel.min / max` | `number \| 百分比字符串` | `0 / 无上限` | 拖动和键盘的尺寸边界 |
| `Panel.resizable` | `boolean` | `true` | 任一相邻面板 false 时禁用该分隔线 |
| `Panel.collapsible` | `boolean \| { start?: boolean; end?: boolean }` | `false` | 允许面板靠起始或末尾的分隔线提供折叠按钮 |
| `className / style / ref` | `原生 div 属性` | `—` | 容器支持 ref，各面板支持原生 div 属性 |

## 支持边界

- 支持多面板、横纵分栏、鼠标/触摸 Pointer 拖动、键盘方向键、Shift 加速、Home/End、受控尺寸、相邻约束、折叠恢复、嵌套和 ResizeObserver。
- 回调返回像素；百分比以容器可分配空间计算（扣除每条 8px 分隔线）。方向键每次 10px，Shift 为 40px。至少为纵向容器提供明确高度。
- 受控模式通过 onResize 回写各 Panel.size。尺寸总和与可用空间、min/max 必须由业务配置为可满足；不强制修正矛盾的受控值。容器变化按比例调整已拖动的非受控面板，不额外发 onResize。
- 折叠允许绕过面板 min 至 0；恢复使用上次尺寸并保留相邻 max 约束。面板数量/顺序改变时建议重新挂载 Splitter；不支持延迟拖动、展开悬浮预览、自动持久化或语义样式函数。

从 `paper-ink` 或 `paper-ink/splitter` 导入；样式导入 `paper-ink/style.css` 或 `paper-ink/splitter/style.css`。CLI：`paper-ink add splitter`。
