# Notification 通知提醒

```tsx
const [api, holder] = notification.useNotification({ placement: 'topRight' });
return <>{holder}<Button onClick={() => api.success({ message: '导出完成', description: '可以下载最新报表。' })}>导出</Button></>;
```

提供 open/success/info/warning/error/destroy；open 接收 message（或 title）、description、key、duration、placement、icon、btn、closeIcon、onClose、onClick、className、style、role。duration 单位秒，默认 4.5，0 保持显示。destroy(key) 关闭指定通知，省略 key 关闭全部。相同 key 更新内容并重置计时，取消尚未结束的退出。onClose 在真正移除时触发；maxCount 淘汰和 holder 卸载立即清理。

useNotification 的配置在第一次渲染时确定，holder 必须渲染在目标 ConfigProvider 中。静态 notification.config/useNotification 与 App.useApp().notification 均可用，静态 API 不继承局部上下文。支持四角位置、top/bottom 偏移、getContainer、maxCount；自定义容器中仍按视口固定定位。

180ms 无弹性淡入淡出，遵循减少动态效果设置。不提供堆叠折叠、拖拽、进度条、暂停计时、复杂 semantic styles。
