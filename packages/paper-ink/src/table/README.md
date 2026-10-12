# Table

独立设计的轻量表格。通过 `source + selection + columns` 接入业务 Hook，分页内置，静态数据使用 `data`。不自动请求、排序、过滤或切页。

```tsx
import { Table, useBasePageTable, useTableChecked, type TableColumn } from 'paper-ink';
import 'paper-ink/style.css';

const table = useBasePageTable<User, SearchParams>({ getTableData });
const selection = useTableChecked({
  tableData: table.tableData,
  setTableData: table.setTableData,
  idName: 'id',
});
const columns: TableColumn<User>[] = [
  { dataIndex: 'name', title: '姓名', width: 160, ellipsis: true },
  { dataIndex: 'amount', title: '金额', align: 'right', sorter: true },
  { key: 'actions', title: '操作', render: (_, row) => <button onClick={() => edit(row)}>编辑</button> },
];
<Table rowKey="id" source={table} selection={selection} columns={columns} />;
```

- `data` 与 `source` 二选一；source 模式读取数据、加载、页码、页容量和总数，禁止重复覆盖。
- `pagination={false}` 隐藏；`pagination={{ position: 'top', showQuickJumper: true }}` 调整位置和操作项。
- `sort` / `onSortChange` 为受控排序；实际排序由请求或外部计算处理。`sortDirections` 声明循环。
- `selection` 接受 `{ checkedIds, setCheckedIds }`；全选保留非当前可选行的 keys。禁选行保留状态；radio 仅保留新选择。
- `rowKey` 必填，只使用稳定 string/number；字符串与数字 key 分开处理。操作列必须显式提供 `key`。
- `ellipsis` 实际溢出时复用 Tooltip，提供键盘入口；可关闭或提供内容函数。交互元素不自动截断。主动设置 title 时自动 Tooltip 关闭。
- 固定列使用数字 width；左固定列集中在左侧，右固定列集中在右侧。实际布局宽度测量后累加偏移，选择列随左固定列固定。
- `summary` 按有效列 key 返回一行汇总，只接收当前展示数据。`scroll.y` 限定滚动高度并默认固定表头。
- 换页仅重置内部纵向滚动，保留横向位置和焦点；`scrollToFirstRowOnChange={false}` 可关闭。
- `hidden`、`minWidth`、`showHeader`、`rowHoverable`、`bordered`、`size` 与 `locale` 控制展示。
- `onRow`、`onHeaderRow`、`onCell`、`onHeaderCell` 开放原生属性。排序事件先调用调用方表头事件，可 preventDefault 取消内部排序。

完整设计与边界见 `doc/table-design.md`。不支持树形、多级表头、虚拟滚动、拖拽或内置编辑。该组件不等同于完整 antd Table。

按组件导入使用 `paper-ink/table` 与 `paper-ink/table/style.css`；CLI：`paper-ink add table`。


## 展开详情与单元格合并

```tsx
<Table
  rowKey="id"
  data={rows}
  columns={[
    { dataIndex: 'group', title: '分组', onCell: (_, index) => ({ rowSpan: index === 0 ? 2 : 1 }) },
    { dataIndex: 'name', title: '姓名' },
  ]}
  expansion={{
    expandedIds,
    setExpandedIds,
    render: (row) => <Detail row={row} />,
    rowExpandable: (row) => row.hasDetail,
  }}
/>
```

- expansion 受控，保留页外 keys；render 只在当前展示且允许展开的行展开时调用。按钮不触发行点击或选择，可覆盖 SVG 图标和 locale.expandRow/collapseRow 文案。
- 详情区域关闭即卸载；外部关闭时，如果焦点原本在区域内并落到 document.body，会恢复到父行展开按钮。不会抢走其他控件已有焦点。
- 展开列放在选择列之前，遇到左固定列时同步固定；数字 columnWidth 默认 40。详情行跨所有当前可见列与工具列。
- onCell 支持 rowSpan/colSpan，onHeaderCell 只支持 colSpan；0 表示隐藏该格，正整数表示跨度。覆盖的单元格自动跳过，无需为每个被覆盖格重复写 0；被覆盖格不执行 render。
- 合并不会跨页、跨隐藏后可见列范围或跨固定方向边界；选择列和展开列不参与合并。非法跨度回退为 1。
- 存在纵向合并时，详情放在该行所属的连续合并组末尾，同组详情按父行顺序展示，避免原生 rowspan 穿过详情行破坏布局。汇总行单独显示，不参与数据合并。
- aria-label、aria-labelledby 和 aria-describedby 应用于原生 table，便于区分嵌套表格；其他容器属性保持原行为。
