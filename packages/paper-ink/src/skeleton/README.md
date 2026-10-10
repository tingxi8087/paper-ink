# Skeleton 骨架屏

内容占位、加载切换和独立占位元素。

## API

loading、active、avatar（size / shape）、title（width）、paragraph（rows / width）、round、children；Skeleton.Avatar / Button / Input / Image / Node。

## 支持边界

Skeleton.Avatar 支持 size / shape / active；其他独立元素支持 size / block / shape / active / className / style。独立元素仅用于占位，不提供点击交互；没有语义样式对象。

所有组件支持 className、style；默认采用 ConfigProvider 主题。
