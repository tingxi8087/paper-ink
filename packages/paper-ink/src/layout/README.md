# Layout 页面布局

通过语义区域组合页面外壳，尺寸和路由交给业务。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `Layout.hasSider` | `boolean` | `自动识别直接 Sider 子节点` | 显式设置横向侧栏布局，包装组件需要手动指定 |
| `Layout.Header / Content / Footer` | `HTMLAttributes` | `—` | 语义 header / main / footer，支持原生属性与 ref |
| `Sider.width / collapsedWidth` | `number \| string` | `200 / 64` | 展开和收起宽度，数字为像素 |
| `Sider.collapsible` | `boolean` | `false` | 显示折叠按钮 |
| `Sider.collapsed / defaultCollapsed` | `boolean` | `false` | 受控 / 初始折叠状态 |
| `Sider.onCollapse` | `(collapsed, type) => void` | `—` | type 为 clickTrigger 或 responsive |
| `Sider.trigger` | `ReactNode \| null` | `SVG箭头` | 自定义触发内容；null 隐藏按钮 |
| `Sider.reverseArrow` | `boolean` | `false` | 反向箭头，供右侧侧栏使用 |
| `Sider.theme` | `light \| dark` | `light` | 侧栏明暗配色 |
| `Sider.breakpoint` | `xs \| sm \| md \| lg \| xl \| xxl` | `—` | 480/576/768/992/1200/1600px 以下触发响应式折叠 |
| `Sider.onBreakpoint` | `(broken: boolean) => void` | `—` | 断点初次匹配与变更通知 |
| `className / style / ref` | `原生属性` | `—` | 各区域均支持 |

## 支持边界

- 支持嵌套布局、左右侧栏、受控折叠、零宽折叠、响应式断点和自定义按钮内容。Header / Footer 默认内边距 16px；尺寸可由 style 覆盖。
- 自动识别仅检查直接 Sider 子节点；包装后通过 hasSider 指定。Content 使用 main，同一页面的多个区域请避免同时显示多个主内容地标。
- 断点只控制折叠状态，不内置抽屉、固定定位、滚动容器、路由或权限；受控模式由 onCollapse 的调用方回写。Menu 的 inlineCollapsed 由业务同步。

从 `paper-ink` 或 `paper-ink/layout` 导入；样式导入 `paper-ink/style.css` 或 `paper-ink/layout/style.css`。CLI：`paper-ink add layout`。
