# Segmented 分段控制器

通过原生 radio 选择视图，支持方向键、Home / End。

## API

options（字符串、数字或 value / label / icon / disabled / title / className 对象）、value / defaultValue、onChange(value)、disabled、size、block、vertical、name。

## 支持边界

不支持语义样式对象和自定义 thumb 动画。当前值需要对应有效选项；name 支持原生表单提交，未实现表单 reset。

所有组件支持 className、style；默认采用 ConfigProvider 主题。

选中背景、文字及阴影使用 120ms 轻量过渡，不增加滑块位移。所有新增动效遵循 prefers-reduced-motion；减少动态效果时直接切换。
