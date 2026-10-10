# Modal 实现边界

受控基础弹窗。`open` 默认 `false`，`onOk` 和 `onCancel` 只通知调用方，不会隐式关闭弹窗；返回 Promise 不会自动开启 loading，提交状态通过 `confirmLoading` 控制。

支持：`title`、`children`、`footer`、`width`（默认 520）、`centered`、`mask`、`maskClosable`、`keyboard`、`closable`、`okText`、`cancelText`、`okButtonProps`、`cancelButtonProps`、`afterClose`、`destroyOnHidden`、`forceRender`、`getContainer`、`className`、`rootClassName`、`style`、`zIndex`、`focusTriggerAfterClose`，以及 dialog 元素的原生属性。

- `className` / `style` 应用于 dialog 卡片，`rootClassName` 应用于覆盖视口的根元素。
- 默认 Portal 到 `document.body`，支持 DOM 元素、返回 DOM 元素的函数、选择器及 `false` 原地渲染。选择器无匹配时回退到 body。Portal 根节点携带当前主题变量。
- `footer={null}` 隐藏页脚，自定义 ReactNode 替换页脚。默认确定/取消按钮继承 Button 能力。按钮自身 `onClick` 调用 `preventDefault()` 可以阻止 Modal 对应回调。
- 内容首次打开时挂载；关闭后默认保留状态。`destroyOnHidden` 每次关闭卸载内容，`forceRender` 优先，始终预渲染内容。
- 180ms 淡入淡出与轻微缩放；`afterClose` 在退出动画结束、内容隐藏或卸载后调用一次，组件直接卸载不会调用。
- `mask={false}` 仅隐藏遮罩，背景允许指针操作；焦点限制和滚动锁定仍保留。需非模态浮层的场景应使用未来的其他组件。
- 支持 Esc、焦点循环、阻止焦点逃逸、关闭后焦点恢复、多个弹窗共用滚动锁定；只有最上层弹窗响应 Esc / 遮罩。默认 zIndex 1000，多个打开弹窗至少高于前一层。
- 有 title 时自动关联 dialog 名称；也可提供 aria-label / aria-labelledby。无标题默认 aria-label 为“对话框”，建议业务场景提供具体名称。
- `onCancel` 参数来自关闭按钮、取消按钮、遮罩的 React MouseEvent，或 Esc 的原生 KeyboardEvent；这属于当前版本与 antd 类型的少量差异。
- 暂不提供静态 `Modal.confirm` / `Modal.useModal`，也不包含响应式 width 对象、语义 classNames/styles、拖动及自定义 modalRender。业务 `ref.open(config)` 由业务组件组合实现。

默认 180ms 淡入淡出与轻微缩放，遮罩同步渐变。退出结束后再恢复焦点、滚动及调用 afterClose；Drawer 使用自己的动画时不会叠加。所有新增动效遵循 prefers-reduced-motion；减少动态效果时直接切换。
