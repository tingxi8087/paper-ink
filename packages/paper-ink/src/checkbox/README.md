# Checkbox

API names follow [Ant Design Checkbox](https://ant.design/components/checkbox/). Supports `checked/defaultChecked`, `disabled`, `indeterminate`, native input attributes, `className/style`, and `onChange(event)` with `event.target.checked/value`. The ref exposes `focus`, `blur`, and `nativeElement` (the actual input).

`Checkbox.Group` supports `value/defaultValue`, `options` (primitive string/number/boolean or `{label,value,disabled,title,className,style}`), `children`, `name`, `disabled`, and `onChange(values)`. Values retain child registration order. Inputs participate in native forms; values are serialized to strings. Uncontrolled values return to their defaults on form reset; controlled values stay controlled. A group inside a form uses that ancestor form for reset; an externally associated form via input `form` does not reset group state.

`className/style` style the label (or group root); other native input attributes reach the input. Does not implement semantic `classNames/styles`, `skipGroup`, ConfigProvider component defaults, or Form integration. `nativeElement` points to the input, rather than antd's wrapper.

选中背景、边框及标记使用 120ms 轻量过渡。所有新增动效遵循 prefers-reduced-motion；减少动态效果时直接切换。
