# ColorPicker

纯色调色板、透明度、HEX/RGB/HSB 展示与输入、分组预设、键盘、清空、禁用和受控状态。使用小型 MIT 库 @ctrl/tinycolor 进行颜色转换，内部保留不可变高精度 HSB，避免黑色和灰色丢失色相。

```tsx
import { ColorPicker, Color } from 'paper-ink/color-picker';
import 'paper-ink/color-picker/style.css';
const [value, setValue] = useState(new Color('#1677ff'));
<ColorPicker value={value} onChange={setValue} showText allowClear />
```

CLI：`paper-ink add color-picker`。依赖 Popover、Input、Select、SVG 图标及字段绑定协议；独立 CSS 自动包含依赖样式。

value/defaultValue 支持 string、Color、{h,s,b,a?}、{r,g,b,a?}、null；HSB 的 s/b 与 alpha 使用 0–1，h 使用度数。默认值 #171717。显式 null/undefined/空串为清空。onChange(color,css) 连续通知；onChangeComplete(color) 在指针松开、单次键盘操作、输入确认、预设或清空后触发；pointercancel 不通知完成。受控调用方须回写 value，单独用 onChangeComplete 控制 value 时显示保持受控旧值直到完成。

format/defaultFormat 为 hex/rgb/hsb，只改变展示；onFormatChange 通知格式请求。disabledAlpha 隐藏 alpha 并显示不透明颜色；disabledFormat 禁止格式切换。open/defaultOpen/onOpenChange 控制展开；Popover 承担定位、Portal、主题继承与退出动效，不使用弹性动画。

文本输入保存编辑草稿，Enter/失焦提交；非法文本保留并报错。Escape 关闭弹层并丢弃未提交输入；已经生效的颜色不回滚。格式下拉支持独立 Escape。数值规范化到合法区间。Color.cleared 与透明色不同；清空的 css 为空串。非法受控值保持上次合法值。Color 的 toCssString 用于业务 CSS，HSB 字符串仅用于展示，RGB 通道和展示文本取整不覆盖内部状态。

Form 自动保存 css 或 null，并转发禁用、校验、标签和 blur；需要保存 Color 时使用显式 render 绑定。自定义 children 需透传事件和 aria 属性；ref 仅指向默认按钮，自定义触发器保留自身 ref。className/style/原生 button 属性作用于触发器。

不提供渐变、屏幕取色、拖拽色标、panelRender、自动对比度推荐、CSS 变量/现代色域解析。完整 API、8组案例与支持边界见网站文档。
