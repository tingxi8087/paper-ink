export function PropsTable({ rows }: { rows: string[][] }) {
  return <div className="table-scroll"><table><thead><tr>{['属性', '类型', '默认值', '说明'].map(label => <th key={label}>{label}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row[0]}>{row.map((cell, i) => <td key={i}>{i < 3 ? <code>{cell}</code> : cell}</td>)}</tr>)}</tbody></table></div>;
}
export function InputApiTable() { return <PropsTable rows={[
 ["value / defaultValue", "string", "—", "受控值 / 初始值"], ["onChange", "(event) => void", "—", "读取 event.target.value"], ["size", "small / middle / large", "middle", "控件尺寸"], ["disabled / readOnly", "boolean", "false", "禁用 / 只读"], ["status", "error / warning", "—", "校验外观，不执行校验"], ["allowClear", "boolean / { clearIcon }", "false", "显示清空按钮"], ["onClear", "() => void", "—", "清空回调"], ["onPressEnter", "(event) => void", "—", "非输入法组合状态的回车"], ["showCount", "boolean / formatter 配置", "false", "字数统计"], ["maxLength", "number", "—", "原生长度限制；受控值不会被强行截断"], ["prefix / suffix", "ReactNode", "—", "Input 前后缀"], ["rows", "number", "3", "TextArea 行数"], ["autoSize", "boolean / { minRows, maxRows }", "false", "TextArea 随内容和宽度调整高度"],
 ["Search.enterButton", "ReactNode", "false", "默认搜索图标；true 主色按钮；字符串或自定义 Button / button"],
 ["Search.loading / searchIcon", "boolean / ReactNode", "false / SVG", "加载阻止回车和按钮提交；自定义默认搜索图标"],
 ["Search.onSearch", "(value, event, info) => void", "—", "回车、按钮与清空触发；info.source 为 input / clear"],
 ["Password.visibilityToggle", "boolean / { visible, onVisibleChange, tabIndex }", "true", "隐藏切换按钮或受控密码可见性"],
 ["Password.iconRender", "(visible) => ReactNode", "Eye / EyeOff SVG", "自定义显示 / 隐藏图标"],
 ["className / style / rootClassName / ref", "原生属性与 InputRef", "—", "Search 使用外层根容器，其余作用于输入控件根容器"],
 ]} />; }
export function ModalApiTable() { return <PropsTable rows={[["open", "boolean", "false", "受控显示状态"], ["title", "ReactNode", "—", "标题与可访问名称"], ["onOk / onCancel", "(event) => void", "—", "操作回调，由调用方关闭；Esc 传入原生 KeyboardEvent"], ["confirmLoading", "boolean", "false", "确认按钮加载"], ["footer", "ReactNode / null", "默认操作栏", "null 隐藏页脚"], ["width", "number / string", "520", "弹窗宽度，受视口限制"], ["centered", "boolean", "false", "垂直居中"], ["mask / maskClosable", "boolean", "true", "遮罩 / 点击遮罩触发取消"], ["keyboard / closable", "boolean", "true", "Esc / 关闭按钮"], ["okText / cancelText", "ReactNode", "确定 / 取消", "操作文字"], ["okButtonProps / cancelButtonProps", "ButtonProps", "—", "操作按钮扩展"], ["destroyOnHidden", "boolean", "false", "关闭后卸载内容"], ["forceRender", "boolean", "false", "首次打开前挂载内容"], ["afterClose", "() => void", "—", "关闭完成后回调"], ["getContainer", "HTMLElement / () => HTMLElement / string / false", "document.body", "Portal 容器；false 原地渲染"], ["className / style / rootClassName", "样式与类名", "—", "内容容器 / 弹层根节点"]]} />; }

export function PaginationApiTable() {
  return <PropsTable rows={[
    ['total', 'number', '0', '数据总条数'],
    ['current / defaultCurrent', 'number', '— / 1', '受控当前页 / 非受控初始页；页码从 1 开始'],
    ['pageSize / defaultPageSize', 'number', '— / 10', '受控每页条数 / 非受控初始条数'],
    ['onChange', '(page: number, pageSize: number) => void', '—', '页码或每页条数变化时触发'],
    ['onShowSizeChange', '(current: number, size: number) => void', '—', '每页条数变化时触发；current 为调整后的有效页码'],
    ['showSizeChanger', 'boolean', 'total > 50', '显示每页条数选择器，使用组件库 Select'],
    ['pageSizeOptions', '(number | string)[]', '[10, 20, 50, 100]', '条数选项；自动加入当前条数、去重并升序排列'],
    ['showQuickJumper', 'boolean | { goButton: ReactNode }', 'false', '显示跳页输入框；配置 goButton 时使用按钮确认，true 显示“确定”'],
    ['simple', 'boolean | { readOnly?: boolean }', 'false', '简洁分页；readOnly 隐藏当前页编辑输入框'],
    ['showLessItems', 'boolean', 'false', '减少当前页两侧显示的页码数量'],
    ['showTotal', '(total: number, range: [number, number]) => ReactNode', '—', '自定义总数与当前数据范围显示；空数据范围为 [0, 0]'],
    ['showTitle', 'boolean', 'true', '为页码及上一页、下一页按钮设置 title 提示'],
    ['itemRender', '(page: number, type: "page" | "prev" | "next", originalElement: ReactNode) => ReactNode', '—', '自定义按钮内的显示内容；保留分页按钮行为'],
    ['size', '"small" | "default" | "middle" | "medium" | "large"', '"middle"', '控件尺寸；default、middle、medium 使用标准尺寸'],
    ['align', '"start" | "center" | "end"', '"start"', '分页整体的水平对齐方式'],
    ['disabled', 'boolean', 'false', '禁用翻页、条数选择和跳页操作'],
    ['hideOnSinglePage', 'boolean', 'false', '仅一页时隐藏整个分页，包括空数据'],
    ['className / style', 'string / CSSProperties', '—', '根 nav 容器的类名与样式'],
    ['ref', 'Ref<HTMLElement>', '—', '指向根 nav 元素；同时支持适用的原生 HTML 属性'],
  ]} />;
}
