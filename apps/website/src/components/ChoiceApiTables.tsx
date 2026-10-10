type Row = [string, string, string, string];
function Table({ rows }: { rows: Row[] }) { return <div className="table-scroll"><table><thead><tr><th>属性</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead><tbody>{rows.map(row => <tr key={row[0]}>{row.map((cell, index) => <td key={index}>{index < 3 ? <code>{cell}</code> : cell}</td>)}</tr>)}</tbody></table></div>; }
const common: Row[] = [['className / style', 'string / CSSProperties', '—', '根元素样式；原生输入属性传入内部 input']];
export function CheckboxApiTable() { return <Table rows={[
  ['checked / defaultChecked', 'boolean', 'false', '受控值 / 初始值'], ['indeterminate', 'boolean', 'false', '半选状态，不改变表单提交值'], ['disabled', 'boolean', 'false', '禁用交互'], ['value', 'string | number | boolean', '—', '分组选项值 / 表单值'], ['onChange', '(event: CheckboxChangeEvent) => void', '—', 'event.target.checked / value'], ['ref', 'CheckboxRef', '—', 'focus / blur / nativeElement'], ...common,
]} />; }
export function CheckboxGroupApiTable() { return <Table rows={[
  ['value / defaultValue', 'CheckboxValue[]', '[]', '受控选中值 / 初始选中值'], ['options', '(CheckboxValue | CheckboxOption)[]', '—', '或使用 Checkbox 子元素'], ['name / disabled', 'string / boolean', '— / false', '统一设置输入名称 / 禁用'], ['onChange', '(values: CheckboxValue[]) => void', '—', '按选项注册顺序返回值'], ['ref', 'HTMLDivElement', '—', '访问分组根元素'], ['className / style', 'string / CSSProperties', '—', '分组根元素样式'],
]} />; }
export function RadioApiTable() { return <Table rows={[
  ['checked / defaultChecked', 'boolean', 'false', '单独使用时控制选择'], ['value', 'string | number | boolean', '—', '选项值'], ['disabled', 'boolean', 'false', '禁用交互'], ['onChange', '(event: RadioChangeEvent) => void', '—', 'event.target.checked / value'], ['ref', 'RadioRef', '—', 'focus / blur / nativeElement'], ...common,
]} />; }
export function RadioGroupApiTable() { return <Table rows={[
  ['value / defaultValue', 'RadioValue', '—', '受控值 / 初始值'], ['options', '(RadioValue | RadioOption)[]', '—', '或使用 Radio / Radio.Button 子元素'], ['optionType', "'default' | 'button'", 'default', 'options 渲染方式'], ['buttonStyle', "'outline' | 'solid'", 'outline', '按钮式单选外观'], ['size', "'small' | 'middle' | 'large'", 'middle', '按钮式单选尺寸'], ['name / disabled', 'string / boolean', '自动生成 / false', '原生表单名称 / 整组禁用'], ['onChange', '(event: RadioChangeEvent) => void', '—', '选中值变化'], ['ref', 'HTMLDivElement', '—', '访问分组根元素'], ['className / style', 'string / CSSProperties', '—', '分组根元素样式'],
]} />; }
export function SwitchApiTable() { return <Table rows={[
  ['checked / defaultChecked', 'boolean', 'false', '受控值 / 初始值'], ['value / defaultValue', 'boolean', 'false', 'checked / defaultChecked 的别名'], ['loading / disabled', 'boolean', 'false', '加载 / 禁用；阻止操作'], ['checkedChildren / unCheckedChildren', 'ReactNode', '—', '开启 / 关闭内容'], ['size', "'default' | 'small'", 'default', '开关尺寸'], ['onChange / onClick', '(checked, event) => void', '—', '状态变化 / 点击回调'], ['ref', 'HTMLButtonElement', '—', '访问原生按钮'], ['className / style', 'string / CSSProperties', '—', '根元素样式；支持原生按钮属性'],
]} />; }
export function TabsApiTable() { return <Table rows={[
  ['items', 'TabItem[]', '[]', 'key / label / children / disabled / forceRender / destroyOnHidden'], ['activeKey / defaultActiveKey', 'string', '首个可用标签', '受控值 / 初始值'], ['onChange', '(key: string) => void', '—', '切换回调'], ['destroyOnHidden', 'boolean', 'false', '离开标签时卸载内容'], ['type', "'line' | 'card'", 'line', '标签外观'], ['size', "'small' | 'middle' | 'large'", 'middle', '标签尺寸'], ['centered', 'boolean', 'false', '居中排列'], ['tabBarExtraContent', 'ReactNode | { left?, right? }', '—', '标签栏额外内容'], ['tabBarStyle', 'CSSProperties', '—', '标签栏内联样式'], ['ref', 'HTMLDivElement', '—', '访问根元素'], ['className / style', 'string / CSSProperties', '—', '根元素样式；支持原生 div 属性'],
]} />; }
