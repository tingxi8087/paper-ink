# Radio

API names follow [Ant Design Radio](https://ant.design/components/radio/). `Radio` and `Radio.Button` support `checked/defaultChecked`, `value`, `disabled`, native input attributes, `className/style`, and `onChange(event)`. Ref exposes `focus/blur/nativeElement` (input).

`Radio.Group` supports `value/defaultValue`, primitive/object `options`, `children`, `name`, `disabled`, `optionType`, `buttonStyle`, `size`, and `onChange(event)`. `event.target.value` retains the original primitive type. A name is generated if absent. Arrow keys skip disabled options and wrap. Native form submission uses string values. Uncontrolled ancestor-form reset restores defaults; controlled values remain controlled.

`className/style` style the label (or group root). Does not implement semantic `classNames/styles`, vertical/block layout flags, Form integration, ConfigProvider component defaults, or external form association for group reset. `nativeElement` points to the input rather than the wrapper.

选中边框、标记及按钮式选项颜色使用 120ms 轻量过渡。所有新增动效遵循 prefers-reduced-motion；减少动态效果时直接切换。
