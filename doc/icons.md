# Tabler Icons 图标

发布版本：组件包与 CLI 0.2.0，Tabler Icons 3.49.0。

Paper Ink 使用 Tabler Icons 作为公开图标库，MIT 许可，来源：https://tabler.io/icons 。图标依赖放在组件包 dependencies 内，安装 paper-ink 时自动安装，用户不需要额外执行安装命令。

```tsx
import { IconSearch, IconPlus } from 'paper-ink/icons';
import { Button } from 'paper-ink';

<IconSearch size={20} stroke={2} />;
<Button icon={<IconPlus size={16} />}>新建</Button>;
```

保留官方组件名称与属性：size 默认 24，color 默认 currentColor，stroke 默认 2，支持 ref、className、style 和 SVG 属性。图标直接渲染 SVG，无额外 DOM 包装，无图标 CSS。入口独立于组件库根入口，支持 tree shaking；避免以名称动态查找的全量图标对象进入业务包。

文档 Icons 页面列出此入口的所有图标组件，按英文导出名排序，支持常用中文关键词、线框/填充筛选、分页、大小和线宽预览、居中辅助线、选中及复制导入代码。整套图标的浏览数据仅在图标文档页按需加载，普通文档页不引入全量图标。

统一 24×24 画布不等于所有不对称图形的视觉重心完全一致。图标槽负责布局居中，辅助线可检查图形位置；不运行 getBBox 或自动缩放裁切来改变原图比例。填充图标不随 stroke 改变实心轮廓。

CLI：`npx @tingxi8087/paper-ink-cli add tabler-icons` 自动安装该依赖并添加本地图标入口，使用 `./components/paper-ink/icons`；原有 internal/icons.tsx 保持兼容。

此能力不表示实现了 antd 的 Icon、createFromIconfontCN 或双色 API，不将对应条目标记为完成。
