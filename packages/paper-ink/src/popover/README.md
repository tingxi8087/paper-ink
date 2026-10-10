# Popover 气泡卡片

可交互浮层，支持 12 种位置、hover / focus / click、受控显示、延迟和容器定位。

定位和主题继承与 Tooltip 保持一致。首期不支持箭头、contextMenu、fresh 和语义样式函数。className/style 用于浮层，兼容 overlayClassName/overlayStyle。

依赖的子组件样式由组件子路径 style.css 包含。

API 参考：[Ant Design popover](https://ant.design/components/popover/)。

默认浮层挂载到 body；触发器在 Modal/Drawer 内时自动挂载到对应 dialog，以保持焦点约束。显式 getPopupContainer 优先。

默认 180ms 淡入淡出与 4px 位移；Dropdown、Popconfirm 复用该动画。关闭期间内容保留但不可交互，destroyOnHidden 在退出结束后生效。所有新增动效遵循 prefers-reduced-motion；减少动态效果时直接切换。
