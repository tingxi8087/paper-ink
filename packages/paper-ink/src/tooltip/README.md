# Tooltip

支持 antd 常规 title、placement（12方向）、trigger（hover/focus/click 或数组）、mouseEnterDelay / mouseLeaveDelay（秒，默认0.1）、open / defaultOpen / onOpenChange、destroyOnHidden、color、getPopupContainer、autoAdjustOverflow。

触发元素包在 inline-flex span 内，子组件事件和 ref 保留，aria-describedby 与提示关联。禁用按钮由 wrapper 接收鼠标事件，子按钮设置 pointer-events:none。布局有严格要求时需考虑这个 wrapper；暂不提供 asChild。

默认 hover 也响应键盘聚焦。Esc、窗口失焦、外部点击和触发元素 blur 请求关闭，受控 open 最终由调用方更新。鼠标移到提示浮层时取消延迟关闭，允许阅读与选择文本；不建议放表单、按钮等交互内容。

浮层默认 Portal 到 body；根节点携带主题变量。自定义 getPopupContainer 使用浮层实际 offsetParent 换算定位，容器需避免裁剪浮层。显示时监听 resize、所有祖先 scroll 和 ResizeObserver。autoAdjustOverflow 尝试换到相反方向，然后限制在视口8px内，暂不支持容器边界碰撞、箭头、跟随鼠标及语义样式 API。

当前 className/style 用于浮层，区别于 antd 中触发元素的同名属性；触发元素样式直接传给 children。关闭默认保留 DOM，内容始终更新（未实现 antd 的 fresh 缓存策略）。SSR 不生成浮层，客户端挂载后定位。

参考：https://ant.design/components/tooltip/

默认 120ms 淡入淡出。关闭后立即取消可访问关联，退出结束后隐藏或销毁。所有新增动效遵循 prefers-reduced-motion；减少动态效果时直接切换。
