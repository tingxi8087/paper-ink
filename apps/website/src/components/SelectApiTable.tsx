const rows = [
  ['options', 'SelectOption[]', '[]', 'value、label、disabled、title；无分组'],
  ['value / defaultValue', 'string | number | (string | number)[]', '—', '受控值 / 初始值'],
  ['mode', 'multiple | tags', '单选', '多选 / 可创建新标签'],
  ['onChange', '(value, option) => void', '—', '单选清空 undefined；多选返回值与 option 数组'],
  ['onSelect / onDeselect', '(value, option) => void', '—', '逐项选择 / 取消'],
  ['showSearch', 'boolean', '单选 false / 多选 true', '是否可以输入搜索文字'],
  ['filterOption', 'boolean | (input, option) => boolean', 'true', '本地过滤；false 用于调用方自行过滤'],
  ['optionFilterProp', 'value | label', 'value', '默认过滤字段'],
  ['searchValue / onSearch', 'string / (value) => void', '—', '受控搜索文字 / 输入回调'],
  ['allowClear / onClear', 'boolean | { clearIcon } / () => void', 'false', '清空选择'],
  ['open / defaultOpen / onOpenChange', 'boolean / boolean / (open) => void', 'false', '展开状态与回调'],
  ['disabled / loading', 'boolean', 'false', '禁用 / 加载提示'],
  ['size / status', 'small | middle | large / error | warning', 'middle / —', '尺寸与校验外观'],
  ['placeholder / notFoundContent', 'ReactNode', '— / 暂无数据', '占位与空结果'],
  ['getPopupContainer', '(trigger) => HTMLElement', 'document.body', 'Portal 容器；保留当前主题'],
  ['className / rootClassName / style', 'string / string / CSSProperties', '—', '根节点样式'],
  ['name / form', 'string', '—', '隐藏字段参与原生表单提交；多选重复同名字段'],
  ['ref', 'SelectRef', '—', 'nativeElement、focus(options?)、blur()'],
];
export function SelectApiTable() {
  return <div className="table-scroll"><table><thead><tr><th>属性</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead><tbody>{rows.map(row => <tr key={row[0]}>{row.map((cell, index) => <td key={index}>{index < 3 ? <code>{cell}</code> : cell}</td>)}</tr>)}</tbody></table></div>;
}
