# Switch

API names follow [Ant Design Switch](https://ant.design/components/switch/). Supports `checked/defaultChecked`, aliases `value/defaultValue` (checked takes precedence), `loading/disabled`, `checkedChildren/unCheckedChildren`, `size`, `onChange(checked,event)`, `onClick(checked,event)`, native button attributes, `className/style`, and an HTMLButtonElement ref.

Uses a non-submitting button with `role="switch"` and `aria-checked`. Enter/Space toggle through native activation, Left/Right select off/on. Loading and disabled block interaction. This is a button, not a native form field: it does not submit or reset a checked value. Use controlled state when coordinating it with a form.

Does not implement semantic `classNames/styles`, Form integration, or ConfigProvider component defaults.
