# Dropdown 下拉菜单

紧凑操作菜单，支持禁用、危险操作、分隔线、分组和单项选择。

支持 ArrowUp/Down、Home/End、Esc 和 Tab。首期不支持子菜单、多选、contextMenu、Dropdown.Button。分组使用 type="group"，普通项不支持 children 子菜单。

依赖的子组件样式由组件子路径 style.css 包含。

API 参考：[Ant Design dropdown](https://ant.design/components/dropdown/)。

默认浮层挂载到 body；触发器在 Modal/Drawer 内时自动挂载到对应 dialog，以保持焦点约束。显式 getPopupContainer 优先。

菜单使用 Popover 的 180ms 淡入淡出与 4px 位移，键盘聚焦不会滚动容器。所有新增动效遵循 prefers-reduced-motion；减少动态效果时直接切换。
