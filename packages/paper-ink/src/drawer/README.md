# Drawer 抽屉

从边缘打开详情面板，支持四个方向、嵌套焦点栈、滚动锁和焦点恢复。

支持 title、extra、footer、mask/maskClosable、keyboard、closable、size、forceRender、destroyOnHidden、getContainer、zIndex、afterOpenChange。className/style 用于面板，rootClassName 用于根容器。首期不支持 push、loading、rootStyle、语义样式、自定义 closeIcon、autoFocus 和 ref。四个方向均支持 260ms 滑入/滑出与遮罩淡入/淡出；afterOpenChange 在动画结束后调用，关闭动画结束后再销毁内容、恢复焦点和滚动。遵循 prefers-reduced-motion，减少动态效果时立即完成。getContainer=false 保留在当前 DOM 但仍固定于视口。

依赖的子组件样式由组件子路径 style.css 包含。

API 参考：[Ant Design drawer](https://ant.design/components/drawer/)。
