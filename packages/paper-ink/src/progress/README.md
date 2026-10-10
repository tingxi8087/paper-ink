# Progress 进度条

线性、环形、仪表盘与分段进度。

## API

percent、type、status、showInfo、format(percent, successPercent)、strokeColor、trailColor、strokeWidth、strokeLinecap、size、steps、success、gapDegree、gapPosition。

## 支持边界

strokeColor 仅支持颜色字符串；steps 仅支持线形数值步数，未提供渐变、环形分段和语义样式对象。百分比限制在 0–100。

所有组件支持 className、style；默认采用 ConfigProvider 主题。
