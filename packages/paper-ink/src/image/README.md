# Image 图片

```tsx
<Image src="/photo.jpg" alt="山水" width={240} fallback="/fallback.jpg" />
<Image.PreviewGroup><Image src="/a.jpg" /><Image src="/b.jpg" /></Image.PreviewGroup>
```

支持原生 img 属性、width/height、fallback、placeholder、preview、rootClassName/rootStyle。className/style 作用于 img，root 参数作用于包裹元素。加载失败只尝试 fallback 一次；src 改变后重新加载，不会无限重试。placeholder 在图片加载完成前显示，可传自定义内容。

preview 默认 true，false 禁用。对象支持 open/defaultOpen/onOpenChange、src、mask、scaleStep（默认 .5）、minScale（默认 1）、maxScale（默认 5）。预览支持工具栏和滚轮缩放、90°旋转、重置、Escape、空白区域关闭、焦点约束与返回。图片按视口适配，极大缩放会裁剪；不提供拖拽平移、下载、镜像或自定义工具栏。

PreviewGroup 自动收集子 Image，或传 items 字符串/对象数组。对象 preview 额外支持 current/defaultCurrent/onChange(current, previous)；左右箭头和按钮切换，首尾循环。动态子项以当前数字索引管理。受控 open/current 必须由调用方更新；未提供兼容 visible/onVisibleChange 旧 API。preview.src 和原图可不同。

所有图标 SVG，轻微过渡没有弹性。依赖 Modal 的焦点和滚动锁能力，需要包含 modal/style.css（npm/CLI 按组件样式入口自动包含依赖）。
