# Typography

提供标题、文字、段落和链接，以及语义样式、复制和 CSS 省略。

支持 API 与示例见 [组件文档](../../../../apps/website/src/content/components/typography/index.mdx)。

不支持 editable、actions、语义样式对象及 ellipsis 展开、后缀或 tooltip 配置。复制通过 Clipboard API，只在写入成功后调用 onCopy；环境不支持或拒绝访问时显示失败提示。copyable 仅支持 text/onCopy/icon/tooltips/tabIndex，tooltips 中的字符串作为原生 title。

内置图标使用 SVG，组件通过 useTheme 和 themeVariables 继承主题。
