# Tabs

API names follow [Ant Design Tabs](https://ant.design/components/tabs/). Supports `items` with `key/label/children/disabled/forceRender/destroyOnHidden`, `activeKey/defaultActiveKey`, `onChange`, `destroyOnHidden`, `type` (`line/card`), `size`, `centered`, `tabBarExtraContent`, `tabBarStyle`, native div attributes, `className/style`, and an HTMLDivElement ref.

Default selection is the first enabled item. Panels mount on first selection, remain mounted when hidden by default, and unmount with `destroyOnHidden`. `forceRender` mounts an unvisited panel unless destruction is enabled. Tab/panel IDs and ARIA references are paired. Arrow keys skip disabled tabs and move focus; Home/End focus the first/last enabled tab. Enter/Space activate the focused tab. Tabs use one tab stop and horizontal scrolling on narrow screens.

Does not implement editable cards, `TabPane`, vertical positioning, animations, overflow dropdown, draggable tabs, closable tabs, or semantic `classNames/styles`. Specify controlled `activeKey` to own selection.
