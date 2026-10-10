# Popconfirm 气泡确认框

用于操作前的轻量确认，Promise 完成后关闭，拒绝时保持打开以便重试。

支持 icon、showCancel、okText/cancelText、okType、按钮 props、onCancel/onPopupClick 以及 Popover 定位和显示 API。首期不支持箭头、contextMenu。异步失败由业务显示反馈，组件保留内容；受控 open 由业务更新。

依赖的子组件样式由组件子路径 style.css 包含。

API 参考：[Ant Design popconfirm](https://ant.design/components/popconfirm/)。

默认浮层挂载到 body；触发器在 Modal/Drawer 内时自动挂载到对应 dialog，以保持焦点约束。显式 getPopupContainer 优先。

确认浮层沿用 Popover 的 180ms 淡入淡出与 4px 位移，不改变异步确认行为。所有新增动效遵循 prefers-reduced-motion；减少动态效果时直接切换。
