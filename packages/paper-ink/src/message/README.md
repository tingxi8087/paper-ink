# Message

支持 message.success/error/info/warning/loading(content, duration?, onClose?)、message.open(config)、message.destroy(key?)、message.config(config)。类型方法的首个参数也可使用配置对象；第二个参数也可直接传 onClose 回调。

每次显示返回可调用且 thenable 的 handle：handle() 手动关闭，handle.then(callback) 或 await handle 等待关闭，完成值为 true。duration 单位秒，默认3；0保持显示。同 key 更新内容、类型和计时器，相关 handle 都在该条最终关闭时完成；onClose 使用最后一次更新的回调。

全局配置支持 duration、maxCount、top、getContainer。超过 maxCount 淘汰最旧消息，并触发关闭回调。未设置 maxCount 时不限制数量。静态方法使用默认主题、独立 React root，不继承业务 React Context。

推荐 const [api, contextHolder] = message.useMessage()；也可直接导入 useMessage。将 contextHolder 挂载到 ConfigProvider 内，提示继承该位置的主题和 React Context。useMessage(config) 接受实例初始配置，后续配置变化不会重置实例。实例 api.destroy 仅管理自身提示，静态 message.destroy 仅管理静态提示。

自动关闭、手动销毁、数量淘汰和 holder 卸载都会清理计时器并完成 handle。SSR 静态调用为空操作且 handle 立即完成，hook holder 不生成 DOM。实现使用 React createRoot / Portal / useSyncExternalStore，无第三方通知运行时。

暂不支持 rtl、prefixCls、动态切换 hook 配置。自定义 icon 的视觉布局由调用方控制。

参考：https://ant.design/components/message/

消息使用 180ms 轻微滑入、淡出及高度收起，使其他消息平顺补位；onClose 和 thenable 在退出结束后完成。同 key 更新不会重新挂载，更新正在退出的消息会取消退出。maxCount 超限淘汰及 holder 卸载即时清理。所有新增动效遵循 prefers-reduced-motion；减少动态效果时直接切换。
