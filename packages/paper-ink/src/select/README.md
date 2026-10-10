# Select 支持范围

常规调用参考 [Ant Design Select](https://ant.design/components/select/)，主要对齐 antd 5 的常用 API；antd 6 将部分搜索属性合并进 `showSearch` 对象，目前只接受布尔值。

支持 `options` 的 `value: string | number`、`label: ReactNode`、`disabled`、`title`；单选、`multiple`、`tags`；受控/非受控值与展开状态；搜索、布尔/函数过滤、`optionFilterProp`、`onSearch`、`searchValue`；清空、状态、尺寸、占位、加载、空内容；选择和取消回调；类名、样式、focus/blur ref、`getPopupContainer`。

`onChange(value, option)`：单选清空为 `undefined`，多选清空为 `[]`；多选的 option 同步返回数组。`onSelect/onDeselect` 用于逐项操作，整体清空只触发 `onChange/onClear`。tags 输入新内容后按回车或点击新选项创建标签。搜索默认过滤 value；标签文字搜索可设置 `optionFilterProp="label"`。输入法组合过程中不处理回车。

组件使用 combobox/listbox 和 active-descendant，支持上下键、回车、Esc、Tab、外部点击。Portal 保留主题变量；滚动、尺寸、移动可视视口变化时重新定位。`name/form` 生成隐藏表单字段，多选按同名字段重复提交；非受控值支持原生表单重置。这是额外提供的表单集成，非原生 select。

不支持 JSX `Select.Option/OptGroup`、分组选项、`labelInValue`、`fieldNames`、虚拟滚动、远程请求管理、自动分词、`maxCount/maxTagCount`、自定义 tag/label/option/popup render、语义 `classNames/styles`、placement、variant、prefix/suffixIcon。没有虚拟化，适合普通数量的选项；大型列表另行设计。

下拉面板使用 180ms 淡入淡出，关闭立即更新 expanded 状态，退出结束后卸载面板。所有新增动效遵循 prefers-reduced-motion；减少动态效果时直接切换。
