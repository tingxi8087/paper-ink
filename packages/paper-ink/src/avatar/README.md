# Avatar

提供图片、字母、自定义图标、自动缩放和头像组。

支持 API 与示例见 [组件文档](../../../../apps/website/src/content/components/avatar/index.mdx)。

不支持响应式 size 对象、Group.max/maxCount 与溢出弹层。图片失败回退不向调用方传递原生错误事件，与 antd onError 签名一致。

内置图标使用 SVG，组件通过 useTheme 和 themeVariables 继承主题。
