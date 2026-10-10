# Card

提供标题、封面、操作区、加载占位和 Meta 摘要。

支持 API 与示例见 [组件文档](../../../../apps/website/src/content/components/card/index.mdx)。

不支持 Grid、内置 tabList 与 tabs 配置。可组合 Tabs 实现切换。styles/classNames 仅接受对象，不接受函数。loading 使用静态占位并隐藏内容，保留封面、标题和操作区。

内置图标使用 SVG，组件通过 useTheme 和 themeVariables 继承主题。
