import { PropsTable } from './ComponentApiTables';
export function TableApiTables() { return <>
<h3>Table</h3><PropsTable rows={[
 ['data / source', 'readonly T[] / TableSource<T>', '二选一，必填', '静态数据或分页 Hook；只展示传入行，不再次切页、排序或筛选'],
 ['columns / rowKey', 'TableColumn<T>[] / 字段名 | (row) => string | number', '必填', '唯一列声明与稳定业务身份，不使用数组下标'],
 ['expansion', 'TableExpansion<T>', '—', '受控详情展开；不提供树形数据或整行点击展开'],
 ['selection / rowSelectable', 'TableSelection / (row) => boolean', '— / 全部可选', '受控选择；禁选不主动清除既有 keys'],
 ['sort / onSortChange', 'TableSort | null / (next) => void', 'null / —', '单列受控排序，回调通知一次，实际数据处理由外部完成'],
 ['sortDirections', '(ascend | descend | null)[]', '升序、降序、取消', '非空不重复，至少包含一个排序方向'],
 ['pagination', 'false | TablePaginationOptions', '底部分页', '仅 source 模式；展示配置不覆盖 source 状态'],
 ['loading / empty', 'boolean / ReactNode', 'false / Empty', 'loading 仅 data 模式可传；加载保留旧数据，初次加载不叠加空提示'],
 ['size / bordered', 'small | middle | large / boolean', 'middle / false', '行内边距与垂直边框'],
 ['showHeader / rowHoverable', 'boolean', 'true', '隐藏表头或关闭行悬停'],
 ['scroll / stickyHeader', '{ x?: number | string; y?: number | string } / boolean', '— / 设置 y 时开启', '内部滚动容器与固定表头，数字按 px'],
 ['scrollToFirstRowOnChange', 'boolean', 'true', 'source 页码、页容量变化时内部回顶，保留横向位置与焦点'],
 ['summary', '(rows) => Record<列 key, ReactNode>', '—', '当前展示行的一行汇总，业务计算合计'],
 ['rowClassName / onRow / onHeaderRow', 'class / 原生行属性回调', '—', '样式和事件合并，不替换内部 key 或语义'],
 ['locale', 'Partial<TableLocale<T>>', '中文', '选择、排序与 expandRow/collapseRow 文案'],
 ['className / style / ref / 原生 div 属性', '容器属性 / HTMLDivElement', '—', 'ref 指向外层容器；表格名称 aria-label/aria-labelledby 与描述 aria-describedby 转发原生 table'],
]} />
<h3>列配置</h3><PropsTable rows={[
 ['key / dataIndex', 'string / 顶层字段名', 'key 默认取 dataIndex', '操作列必须给 key；不解析嵌套路径'],
 ['title / render', 'ReactNode / (value, row, index) => ReactNode', '—', 'value 按字段类型推导；无 dataIndex 时为 undefined'],
 ['width / minWidth / align', 'number | string / number / left | center | right', '— / — / left', '最小列宽 px；对齐作用于表头与数据'],
 ['fixed / hidden', 'left | right / boolean', '— / false', '固定列要求数字 width 且连续；隐藏列不参与偏移'],
 ['ellipsis', 'boolean | { tooltip?: false | (row) => ReactNode }', 'false', '实际溢出的文字自动提示；复杂元素显式给提示内容'],
 ['sorter', 'boolean', 'false', '只启用排序交互，不接受比较函数'],
 ['className / onCell / onHeaderCell', 'class / 原生单元格属性回调', '—', '属性合并；onCell 支持 rowSpan/colSpan，onHeaderCell 支持 colSpan'],
]} />
<h3>展开与单元格合并</h3><PropsTable rows={[
 ['expansion.expandedIds / setExpandedIds', 'readonly (string | number)[] / (ids) => void', '必填', '唯一展开状态；点击图标只通知一次，不自动选择或触发行点击'],
 ['expansion.render', '(row, index) => ReactNode', '必填', '仅展开时挂载详情；收起卸载，可组合嵌套 Table 或自定义控件'],
 ['expansion.rowExpandable / columnWidth / expandIcon', '(row) => boolean / number | string / (expanded, row) => ReactNode', '全部可展开 / 40 / SVG', '自定义图标只替换内容，保留按钮、键盘与无障碍语义'],
 ['locale.expandRow / collapseRow', '(row) => string', '中文', '展开与收起按钮的可访问名称'],
 ['onCell 返回 rowSpan / colSpan', 'number', '1', '正整数合并，0 隐藏；已占用格自动跳过；仅当前展示行与可见业务列'],
 ['onHeaderCell 返回 colSpan', 'number', '1', '单行表头横向合并；不提供多级表头或表头纵向合并'],
 ['固定区域边界与详情顺序', '自动约束', '—', '合并不跨选择/展开列或左右固定区域；跨行合并组的详情在组末按父行顺序展示'],
]} />
<h3>source、selection 与分页</h3><PropsTable rows={[
 ['source.tableData / loading', 'readonly T[] / boolean', '必填', '直接传 useBasePageTable 返回值'],
 ['source.pageNum / pageSize / total / setPagination', 'number / (page, size) => void', '必填', '一次分页操作一次原子更新'],
 ['selection.checkedIds / setCheckedIds', 'readonly (string | number)[] / (ids) => void', '必填', '直接传 useTableChecked 返回值，也可独立维护跨页 keys'],
 ['selection.type / columnWidth', 'checkbox | radio / number | string', 'checkbox / 40', '存在左固定列时选择列也固定，要求数字宽度'],
 ['selection.hideSelectAll / columnTitle', 'boolean / ReactNode', 'false / —', '可隐藏全选或补充选择列表头'],
 ['pagination.position / align / simple', 'top | bottom / start | center | end / boolean', 'bottom / 沿用 Pagination', '单处分页，位于横向滚动区域之外'],
 ['pagination.pageSizeOptions / showSizeChanger / showQuickJumper', '沿用 Pagination 属性类型', '沿用 Pagination', '页容量与快速跳转'],
 ['pagination.showTotal / hideOnSinglePage', '沿用 Pagination 属性类型', '沿用 Pagination', '总数渲染与单页隐藏'],
]} />
<h3>useBasePageTable</h3><PropsTable rows={[
 ['getTableData', '(query, signal) => Promise<{ data, total, pageNum?, pageSize?, render?, meta? }>', '必填', 'query 为 pageNum/pageSize/searchParams；调用方转换接口结果'],
 ['defaultPageSize / defaultSearchParams', 'number / SearchParams', '20 / {}', '非受控模式初始化查询'],
 ['query / onQueryChange', 'TableQuery<S> / (next) => void', '—', '成对提供进入受控模式，由父组件回传查询'],
 ['debounceTime / deps / subscribe', 'number / readonly unknown[] / (reload) => unsubscribe', '200 / — / —', '查询等待、额外请求依赖、外部刷新订阅'],
 ['cachePageSizeKey', 'string', '—', '可选 localStorage 页容量缓存，失败不阻断请求'],
 ['pageNum / pageSize / searchParams', '当前查询状态', '—', '与 TableSource 直接兼容'],
 ['setPageNum / setPageSize / setPagination', '查询更新方法', '—', '容量变化回第一页，setPagination 一次更新页码和容量'],
 ['setSearchParams', '值或函数更新', '—', '更新筛选并回到第一页；排序可放在业务 searchParams 中'],
 ['tableData / setTableData / total / setTotal', '本地展示状态与 setter', '—', '不触发请求，不自动推算本地增删后的总数'],
 ['data / loading / setLoading / error / reloadTable', '请求结果与状态', '—', '刷新保留查询；AbortSignal 与请求序号共同隔离旧结果'],
]} />
<h3>useTableChecked</h3><PropsTable rows={[
 ['useTableChecked({ tableData, setTableData, idName })', '选择 Hook', '—', '读写行内 _checked；idName 与 rowKey 对应'],
 ['checkedIds / checkedItems / checkedCount', '当前行派生的选择结果', '—', '新请求替换行后根据新 _checked 派生，不缓存跨页记录'],
 ['toggleChecked / changeChecked / handleSelectAll', '单行切换 / 批量勾选 / 全选切换', '—', '保留原 Hook 名称，直接操作 _checked'],
 ['setCheckedIds(ids)', '最终 keys 写回', '—', '一次更新当前行，保持未变化对象引用'],
]} />
<h3>本地行辅助 Hook</h3><PropsTable rows={[
 ['useReloadDataById({ getTableDataById, setTableData, idName })', '(ids) => Promise<void>', '—', '按 ID 获取局部字段并合并，不替换其他行'],
 ['useGetIndexById({ tableData, idName })', '(id) => number', '—', '读取最新数据中的下标，不存在返回 -1'],
 ['useCopyDataByIds(tableData, setTableData, idName)', '(ids) => void', '—', '深复制当前行并生成新字符串 ID；清除 _checked，业务复杂对象自行处理'],
 ['useAddRowAtStart / useAddRowAtEnd', '(setTableData, idName, defaults?) => (len?, values?) => void', 'len=1', '前后插入，生成字符串 ID；defaults 由业务提供'],
 ['useDeleteDataByIds(setTableData, idName)', '(ids) => void', '—', '仅删除本地行，业务决定请求和总数更新'],
]} />
</>; }
