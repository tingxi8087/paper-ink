# 轻量 Table 设计草案

状态：2026-10-12 已实现独立 Table、表格 Hook 与公共 useRefState；第二批补充展开行与合并单元格。本文记录确定的 API、实现边界和后续计划；实际导出以源码、组件 README 与文档站 API 为准。独立 Table 不代表 antd Table API 已完成。

采用 `source + selection + columns` 的独立设计，优先让业务 Hook 的返回值能够直接传给 Table。Table 内部组合现有 Pagination；静态列表使用 data。列声明保留易理解的 columns、rowKey 和 render，不要求遵循 antd Table API。

## 职责与原则

- Table 负责数据展示、内置分页、选择交互、排序交互、加载与空状态、滚动布局。
- 业务 Hook 负责数据、加载、页码、页容量和总数；业务负责请求、实际排序、筛选、编辑、保存和错误处理。
- 传入什么行就展示什么行，不自动切页、排序或过滤，不根据 total 猜测数据模式。
- 同一种状态只提供一个控制入口；source 管数据与分页，selection 管选择，sort 管排序。不提供统管分页、筛选和排序的总 onChange。
- source 与 selection 是结构类型协议，不依赖特定业务 Hook，不读取协议以外的业务字段，也不需要再增加一个适配 Hook。
- 自定义单元格使用 React 组件。对象字段、编辑控件、操作菜单由业务组合，不内置编辑引擎。
- 使用原生 table 语义，保持紧凑的黑白外观；内置图标复用 SVG 系统。
- 轻量化需验证产物体积与实际交互，不只以 API 数量作为依据。

## 功能范围

| 功能 | 计划阶段 | 支持范围 |
| --- | --- | --- |
| 数据与列渲染 | 首版 | 泛型数据、顶层字段、自定义单元格、稳定 rowKey |
| 列宽与对齐 | 首版 | width、align；未指定宽度的列自然分配空间 |
| 单元格省略与 Tooltip | 首版 | 单行省略，文本实际溢出时自动提示；可关闭或自定义提示 |
| 加载与空状态 | 首版 | 复用 Spin、Empty，支持替换空内容 |
| 行选择 | 首版 | 受控多选、单选、禁选、当前展示行全选 |
| 排序交互 | 首版 | 单列受控排序；实际排序由外部处理 |
| 横向滚动 | 首版 | 容器溢出滚动，可指定表格宽度 |
| 固定表头 | 首版 | 限制滚动区域高度时固定表头 |
| 行样式与事件 | 首版 | rowClassName、onRow、容器 className/style |
| 分页 | 首版内置 | source 模式默认显示底部分页，复用现有 Pagination，支持关闭及展示配置 |
| 筛选 | 首版组合能力 | 外部 Input、Select 等控制查询条件 |
| 自定义编辑 | 首版组合能力 | render 返回编辑组件，外部更新数据 |
| 固定列 | 首版 | 左右固定列，支持与固定表头、选择列组合 |
| 汇总行 | 首版 | 按列 key 提供汇总内容，业务负责计算 |
| 单元格与表头属性 | 首版 | onCell、onHeaderCell、onHeaderRow |
| 最小列宽、隐藏列 | 首版 | minWidth、hidden |
| 简单展示配置 | 首版 | 隐藏表头、关闭悬停、隐藏全选、选择列标题 |
| 排序周期、分页位置、常用文案 | 首版 | 明确周期、顶部或底部分页、局部文字覆盖 |
| 换页回顶 | 首版 | 仅内部数据滚动区回顶，可关闭 |
| 展开行 | 第二批实现 | expansion 受控 keys、详情渲染、禁用展开、自定义 SVG 图标与键盘操作 |
| 列内筛选菜单 | 后续按需 | 有实际业务案例后设计，不先暴露占位 API |
| 单元格合并 | 第二批实现 | onCell 的 rowSpan/colSpan、onHeaderCell 的 colSpan，支持隐藏覆盖单元格 |
| 树形数据、多级表头 | 暂缓 | 首版不支持 |
| 多列排序、拖拽、虚拟滚动 | 暂缓 | 首版不支持 |
| 内置编辑与请求系统 | 不纳入基础 Table | 业务组件组合；重复需求可另行设计薄封装 |

第二批与暂缓项不是已承诺 API。组合能力不等于内置能力，也不代表对应 antd API 已实现。

## Table 属性

以下为已实现的首版 API。

| 属性 | 计划类型 | 默认 / 行为 |
| --- | --- | --- |
| `source` | `TableSource<T>` | Hook 驱动的分页列表，与 data 二选一 |
| `data` | `readonly T[]` | 静态或本地列表，与 source 二选一，直接展示传入顺序 |
| `columns` | `readonly TableColumn<T>[]` | 必填，唯一的列声明入口 |
| `rowKey` | 顶层字段名或 `(record: T) => string \| number` | 必填，不自动使用行下标 |
| `loading` | `boolean` | 仅 data 模式可传，默认 false；source 模式读取 source.loading |
| `pagination` | `false \| TablePaginationOptions` | 仅 source 模式可传；默认显示底部分页，false 隐藏 |
| `empty` | `ReactNode` | 默认 Empty；可传 null 隐藏 |
| `size` | `'small' \| 'middle' \| 'large'` | middle，影响行内边距 |
| `bordered` | `boolean` | false，默认只显示水平分隔线 |
| `showHeader` | `boolean` | true，false 隐藏表头 |
| `rowHoverable` | `boolean` | true，false 关闭行悬停背景 |
| `summary` | `(rows: readonly T[]) => Partial<Record<string, ReactNode>>` | 按列有效 key 返回一行汇总内容；仅传入当前展示行 |
| `locale` | `Partial<TableLocale<T>>` | 覆盖选择与排序的常用文案 |
| `sort` | `TableSort \| null` | 不传表示没有排序状态 |
| `onSortChange` | `(next: TableSort \| null) => void` | 排序操作通知，状态由外部回传 |
| `sortDirections` | `readonly ('ascend' \| 'descend' \| null)[]` | 默认升序、降序、无排序，循环顺序 |
| `selection` | `TableSelection` | 直接传选择 Hook 的返回值；不传不显示选择列 |
| `expansion` | `TableExpansion<T>` | 受控展开详情；不传不显示展开列 |
| `rowSelectable` | `(record: T) => boolean` | 默认全部可选；false 禁止该行选择 |
| `scroll` | `{ x?: number \| string; y?: number \| string }` | x 为表格宽度，y 为数据滚动区域最大高度；数字按 px |
| `stickyHeader` | `boolean` | 设置 scroll.y 时默认 true，否则 false；可显式关闭 |
| `scrollToFirstRowOnChange` | `boolean` | true；source 页码或页容量变化时内部数据区回顶 |
| `rowClassName` | `string \| ((record: T, index: number) => string)` | 自定义行 class |
| `onRow` | `(record: T, index: number) => 行原生属性` | 行事件、title、data-*、aria-* 等 |
| `onHeaderRow` | `(visibleColumns: readonly TableColumn<T>[]) => 行原生属性` | 单行表头属性；隐藏表头时不调用 |
| `className / style` | 容器样式属性 | 应用于最外层容器 |
| `aria-label / aria-labelledby / aria-describedby` | 原生无障碍属性 | 标注真实 table，仅传递一次，方便区分嵌套表格 |
| `ref` | `HTMLDivElement` 引用 | 指向最外层容器，不提供业务命令式实例 |

data 与 source 通过类型联合约束，必须提供且只能提供一个。source 模式不允许顶层 loading 或分页状态覆盖；data 模式不提供内置分页，需要分页时提供 source。

容器保留合理的原生 div 属性；具体类型冲突在实现时处理。`onRow` 不接管行 key 或内部 ref；与 rowClassName 的 class 合并。首版不开放内部 DOM 替换、语义节点样式对象和命令式 scrollTo。

scroll.x 支持 CSS 宽度，例如 `960`、`'100%'`、`'max-content'`；未设置时也允许容器自然溢出滚动。stickyHeader 首版定位在 Table 自己的滚动容器内，不负责整页顶部导航的偏移。

## 列配置 TableColumn

| 属性 | 计划类型 | 行为 |
| --- | --- | --- |
| `key` | `string` | 列的稳定标识；未设置时取 dataIndex |
| `title` | `ReactNode` | 表头内容 |
| `dataIndex` | `keyof T` 中的字符串键 | 只读取顶层字段，不解析点路径或数组路径 |
| `render` | `(value, record: T, index: number) => ReactNode` | 返回单元格内容；value 随 dataIndex 推导类型 |
| `width` | `number \| string` | 列宽，数字按 px；实际宽度受表格布局约束 |
| `minWidth` | `number` | 最小列宽，单位 px，列布局需遵守此约束 |
| `fixed` | `'left' \| 'right'` | 固定列；首版要求明确的数字 width |
| `hidden` | `boolean` | 默认 false，隐藏列不参与展示、宽度、跨列及固定偏移计算 |
| `align` | `'left' \| 'center' \| 'right'` | 默认 left，同时作用于表头与内容 |
| `ellipsis` | `boolean \| { tooltip?: false \| ((record: T) => ReactNode) }` | 默认 false；true 启用省略和溢出 Tooltip |
| `sorter` | `boolean` | 默认 false，仅启用排序交互，不接受本地比较函数 |
| `className` | `string` | 应用于该列的数据单元格 |
| `onCell` | `(record: T, index: number) => 单元格原生属性` | 数据单元格事件、样式与无障碍属性 |
| `onHeaderCell` | `(column: TableColumn<T>) => 表头原生属性` | 表头事件、样式与无障碍属性 |

- 每列必须有唯一的有效 key。操作列没有 dataIndex 时必须显式提供 key；开发环境提示重复或缺失标识。
- 不提供 `Table.Column / ColumnGroup`、列级 sortOrder/defaultSortOrder、嵌套 children 列配置。
- 没有 dataIndex 时，render 的 value 为 undefined，通过 record 读取数据。
- index 为本次展示顺序的行下标，不作为业务身份，也不是跨页全局序号。
- ellipsis 的默认 Tooltip 和复杂内容规则见下节；不同时添加自动原生 title。
- onCell/onHeaderCell 的 class 与样式合并，调用方事件与内部交互串联；不能覆盖内部 key/ref、排序语义或固定定位。数据单元格已支持 rowSpan/colSpan；单层表头只支持 colSpan，表头 rowSpan 不开放。合并不能跨越功能列或固定区域边界。
- 复杂对象不自动序列化；对象、数组等内容应显式提供 render。

```tsx
type User = { id: string; name: string; age: number; profile: { city: string } };

const columns: TableColumn<User>[] = [
  { title: '姓名', dataIndex: 'name', width: 160, ellipsis: true },
  { title: '年龄', dataIndex: 'age', sorter: true, align: 'right' },
  { key: 'city', title: '城市', render: (_, record) => record.profile.city },
  {
    key: 'actions',
    title: '操作',
    render: (_, record) => <Button onClick={() => editUser(record)}>编辑</Button>,
  },
];

<Table rowKey="id" columns={columns} data={users} loading={loading} />;
```

## 省略与 Tooltip

```tsx
// 普通文本实际溢出时才提示。
{ dataIndex: 'name', ellipsis: true }

// 仅省略，不自动显示 Tooltip。
{ dataIndex: 'name', ellipsis: { tooltip: false } }

// 显式提供复杂内容的提示。
{
  key: 'address',
  render: (_, row) => formatAddress(row),
  ellipsis: { tooltip: (row) => row.fullAddress },
}
```

- ellipsis: true 或 ellipsis: {} 启用单行省略。最终内容为字符串或数字时，默认使用完整内容作为 Tooltip。
- render 返回字符串或数字，同样支持自动提示。返回复杂 React 元素时，不猜测提示内容，需要显式提供 tooltip 函数或由 render 自行组合 Tooltip。
- 自动 Tooltip 只在实际水平溢出时启用；自定义 tooltip 也遵守该条件，返回 null/undefined 时不提示。
- 复用现有 Tooltip，支持鼠标悬停与键盘聚焦；仅需要提示的非交互文本补充合适的聚焦入口，避免给未溢出单元格增加无用焦点。
- 不自动叠加原生 title；调用方通过 onCell 主动添加 title 时应关闭自动 Tooltip，避免重复提示。
- 列宽、容器尺寸、文字及字体变化后重新判断溢出；只对开启 ellipsis 的单元格检测，避免给所有单元格无条件注册独立监听器。
- 包含按钮或输入框的复杂内容不因为省略而自动包裹提示、替换焦点或截断交互区域；此类单元格由 render 负责内部布局。

## 固定列与汇总行

- 首版固定列使用 fixed: 'left' / 'right'；左固定列集中在可见列左侧，右固定列集中在右侧，开发环境提示不连续配置。
- 固定列必须有明确数字 width，宽度不小于 minWidth；不支持百分比固定列宽、堆叠固定列或拖动调整宽度。
- 多个固定列按实际展示宽度累加偏移；左固定列存在时选择列同步固定在最左侧，columnWidth 此时也要求数字。
- 固定单元格、表头、汇总行需正确处理层级与背景；隐藏列不占固定偏移。
- summary 返回按列 key 对应的一行内容，未指定列保持空白，选择列留空。业务自己决定合计标签放在哪一列。
- summary 接收当前展示行，不代表全部筛选数据。跨页总计从业务 source 的额外数据读取并在闭包中提供，Table 不自动求和。
- 汇总行使用 tfoot，与可见列、宽度、固定列对齐；首版不支持汇总行吸底、多行汇总或汇总单元格合并。

```tsx
<Table
  source={table}
  rowKey="id"
  columns={columns}
  summary={(rows) => ({
    name: '本页合计',
    amount: rows.reduce((sum, row) => sum + row.amount, 0),
  })}
/>
```

## 排序

```ts
type TableSort = {
  key: string; // 列的有效 key，不一定是接口字段名
  order: 'ascend' | 'descend';
};
```

- 默认点击周期：无排序 → ascend → descend → 无排序。
- sortDirections 明确声明循环状态，例如 ['ascend', null] 只支持升序与取消，['ascend', 'descend'] 不通过点击进入无排序。
- 周期必须非空、无重复且至少含一个排序方向；无效配置在开发环境提示并回退默认周期。
- 只支持一列；切换列或当前状态不在周期中时，从周期中的第一个排序方向开始；外部仍可以设置 sort=null。
- 点击只调用一次 onSortChange，Table 不改变传入行的顺序，也不自行修改页码。
- sort 为唯一状态来源；不提供 defaultSort 或本地比较器入口。
- 服务端模式在回调里更新查询参数并重置页码；列 key 与接口字段的映射由业务负责。
- 本地模式在外部用 useMemo 生成新数组，不对原始数组调用原地 sort。
- sort 指向不存在或未开启 sorter 的列时不显示激活态，开发环境提示；不在渲染期间触发回调修正外部状态。

## 展开行 TableExpansion

采用与 selection 类似的受控协议，不增加第二套内部展开状态：

```tsx
const [expandedIds, setExpandedIds] = useState<(string | number)[]>([]);

<Table
  rowKey="id"
  source={table}
  columns={columns}
  expansion={{
    expandedIds,
    setExpandedIds,
    render: (row) => <UserDetail user={row} />,
    rowExpandable: (row) => !row.locked,
  }}
/>;
```

| 属性 | 类型 / 默认行为 |
| --- | --- |
| expandedIds | readonly (string / number)[]，唯一的展开状态来源 |
| setExpandedIds | (ids) => void，每次操作只通知一次最终 keys |
| render | (record, index) => ReactNode，必填，渲染详情内容 |
| rowExpandable | (record) => boolean，默认 true；false 不展示该行详情，也不允许用户展开 |
| columnWidth | number / string，默认 40px；随左固定区固定时需要数字 |
| expandIcon | (expanded, record) => ReactNode，可选，默认使用统一 SVG 箭头 |

- 展开列位于选择列之前；存在左固定数据列时，展开列与选择列一起固定，并参与宽度与偏移计算。
- 点击展开按钮只修改展开 keys，不触发行点击或选择；支持 Enter、Space，提供 aria-expanded 与 aria-controls。
- 默认展开/收起文案通过 locale.expandRow(record)、locale.collapseRow(record) 覆盖。
- 不使用行下标识别详情，不自动删除非当前页 keys。当前页没出现的行不渲染详情，回到该页时按传入状态恢复。
- rowExpandable 为 false 时，即使 key 仍在 expandedIds 中也不渲染详情，不主动回调清理外部状态。
- 未展开的详情不挂载；收起后卸载。内部组件状态如需保留，应提升到业务状态，不增加默认缓存机制。
- 详情中的输入、按钮和嵌套 Table 独立工作；程序收起仍存在的父行详情时，必要时将详情内焦点归还该行展开按钮。
- 详情整行跨过展开、选择和可见数据列。默认紧凑容器，不加入复杂高度动画，不将普通展开转换为树形数据。

## 合并单元格

```tsx
const columns: TableColumn<User>[] = [
  {
    title: '部门', dataIndex: 'department',
    onCell: (_, index) => ({ rowSpan: index === 0 ? 2 : index === 1 ? 0 : 1 }),
  },
  { title: '姓名', dataIndex: 'name' },
];
```

- onCell 支持 rowSpan、colSpan；未提供时为 1。0 表示该单元格不渲染，正整数表示合并范围。
- 合并范围按当前展示行和过滤 hidden 后的可见数据列计算，不使用接口 total，也不跨页。
- 已被前一个合并矩形覆盖的单元格自动跳过，无须给每个覆盖位置再写 0；已有显式 0 的常见写法仍然支持。
- onCell 对每个可见数据位置计算一次，covered 单元格不调用 render 或创建 Tooltip。回调保持纯函数。
- 非法跨度回退普通单元格并提示；超出当前行列范围的跨度截断。0 应与覆盖区域配合使用，任意隐藏单元格不负责自动填补空洞。
- 横向合并仅覆盖数据列，不覆盖展开/选择功能列；也不能跨 left、普通、right 固定区域边界，超过边界的跨度截断。
- 与既有覆盖矩形相交时缩小到可用范围，不覆盖已有合并单元格；调用方应避免重叠配置。
- 单层表头通过 onHeaderCell 返回 colSpan，同样支持 0 和自动覆盖跳过；不提供多级表头或表头 rowSpan。
- 隐藏列、分页、排序或数据替换后重新计算。分组数据的跨度由业务按当前顺序生成，不自动按字段值合并。
- 汇总行仍按列 key 一列一个单元格，不在 summary 中开放合并。

### 跨行合并与展开同时使用

原生 rowSpan 按实际 DOM 行计数。如果在合并区域中间插入全宽详情行，会让跨行单元格与详情相互挤占。因此：

- 没有跨行合并时，详情紧跟对应数据行。
- 有跨行合并时，所有相连的跨行区间形成一个行组，详情统一插入该组末尾，按父数据行顺序展示。
- 展开状态仍绑定父行 key，详情通过稳定 ID 与其按钮关联；不会因为插入详情而改变 rowSpan 数值、数据行下标或选择范围。
- 固定列偏移测量使用真实 colgroup 列宽，不读取合并后的单元格宽度，保持表头、数据和汇总对齐。

## 数据协议 TableSource

```ts
type TableSource<T> = {
  tableData: readonly T[];
  loading: boolean;
  pageNum: number;
  pageSize: number;
  total: number;
  setPagination: (pageNum: number, pageSize: number) => void;
};
```

- Table 仅读取上述字段，直接展示 tableData，不执行第二次 slice。
- 分页 current、pageSize、total 分别来自 pageNum、pageSize、total；一次操作调用一次 setPagination。
- Table 不在内部维护另一份页码、加载或数据状态。
- source 可以包含 reloadTable、setTableData、error 等额外字段；这些由页面使用，Table 不调用或解析。
- 页面可以继续组合 Alert 和重试按钮处理 source.error，Table 不根据错误自动发起请求。
- 页码超范围的纠正和请求结果回写由 Hook 管理，Table 不在渲染期间回调修正状态。

## 内置分页

source 模式默认在表格底部显示 Pagination，可通过 pagination.position 改到顶部，`pagination={false}` 隐藏分页，但不改变 source 数据或查询。分页位于表格滚动容器之外，不随数据区域横向滚动。

| TablePaginationOptions 属性 | 计划用途 |
| --- | --- |
| `pageSizeOptions` | 页容量选项，沿用现有 Pagination 类型 |
| `showSizeChanger` | 是否显示页容量切换 |
| `showQuickJumper` | 是否显示页码跳转 |
| `showTotal` | 总数文字渲染 |
| `hideOnSinglePage` | 只有一页时隐藏 |
| `simple` | 简洁分页 |
| `align` | 分页对齐 |
| `position` | 'top' 或 'bottom'，默认 bottom |

未配置的选项沿用现有 Pagination 默认行为。此配置不提供 current、defaultCurrent、pageSize、defaultPageSize、total、onChange 或 onShowSizeChange，避免重复状态与回调。首版只支持单处顶部或底部分页，不支持上下双分页；position 为 Table 的布局配置，不传给 Pagination。

```tsx
<Table
  rowKey="id"
  columns={columns}
  source={table}
  pagination={{ pageSizeOptions: [10, 20, 50], showQuickJumper: true }}
/>
```

## 选择协议 TableSelection

```ts
type TableSelection = {
  checkedIds: readonly (string | number)[];
  setCheckedIds: (ids: (string | number)[]) => void;
  type?: 'checkbox' | 'radio'; // 默认 checkbox
  columnWidth?: number | string; // 默认 40px
  hideSelectAll?: boolean; // 默认 false
  columnTitle?: ReactNode; // 可选选择列标题
};
```

选择 Hook 返回值可直接作为 selection；type、columnWidth、hideSelectAll 和 columnTitle 是可选展示配置，需要时用对象展开补充，不另设一份选择状态。

- rowKey 应在整个业务数据集合中唯一且稳定；string 与 number 类型的 key 不混同。
- 每次选择操作只调用一次 setCheckedIds，传递最终 keys，不调用多个选择回调。
- 点击选择控件才改变选择状态，整行点击由 onRow 自行处理。
- rowSelectable 只决定是否允许交互，不修改业务数据或主动清除已有选择。
- checkbox 表头全选只影响当前展示的可选行，保留当前页之外已有的 keys；禁选行保持原有选择状态。
- 表头半选按当前展示的可选行计算；没有可选行时全选禁用。
- radio 不提供表头全选；选中另一行后仅保留新选中的一个 key。
- hideSelectAll 隐藏表头全选框，不影响逐行选择；columnTitle 有值时作为表头内容，与未隐藏的全选框一起显示，不替代全选功能。
- Table 不自动清空 checkedIds 或缓存跨页记录。是否跨页保留由传入的选择协议实现决定。
- 不返回可能缺失跨页数据的 selectedRows；需要完整记录时由业务的数据源管理。
- 不提供 rowSelection、defaultSelectedRowKeys、onSelect/onSelectAll 或树形级联选择。

## 换页回顶与常用文案

- scrollToFirstRowOnChange 默认 true：source.pageNum 或 source.pageSize 实际变化后，只将内部数据滚动区 scrollTop 设为 0，保留横向位置，不滚动整页。
- 初次挂载、勾选、编辑、局部刷新以及同一页的数据替换不触发回顶；排序或筛选只有导致 source 页码变化时才触发。data 模式不自动猜测分页变化。
- 回顶不使用明显动画，也不主动移动键盘焦点；可显式关闭。

```ts
type TableLocale<T> = {
  selectAll: string;
  selectRow: (record: T) => string;
  sortAscending: string;
  sortDescending: string;
  cancelSort: string;
  expandRow: (record: T) => string;
  collapseRow: (record: T) => string;
};
```

locale 局部覆盖选择控件与排序按钮的可访问名称，未指定项使用中文默认值；不解析 locale 里的业务状态。空内容仍由 empty 配置，分页文案沿用 Pagination 的能力；此处不承诺额外的分页国际化 API。

## 组件库内置 Hook 与现有项目适配

参考业务文件：`/Users/tingxi/project/mas-cms/src/hooks/useTableHooks.ts` 和 `useRefState.ts`。决定将表格 Hook 纳入组件库，保留原名称，另将 useRefState 作为通用公共 API。以下首版入口已纳入组件库；mas-cms 原文件保留，项目可按相同协议迁移。

- 首版公开 useBasePageTable、useTableChecked 和 useRefState，不改名为 useTable/useTableSelection。
- useTableChecked 继续将 _checked 写入业务行数据，不改为内部独立 keys 存储，业务可以直接读取和修改该字段。
- Table 只依赖 TableSource/TableSelection 协议，内置 Hook 与项目自有 Hook 都能传入；不要求用户使用库内 Hook。
- 面向浏览器，不要求 SSR 兼容。页容量缓存可使用 localStorage，仍是可选功能，存储失败不阻断请求。
- getTableData 由调用方提供，不绑定请求库、URL、响应包装或后端协议。
- useResource 的请求引擎作为内部实现，不因为依赖关系自动成为公共 API。
- 原文件中的局部刷新、增删、复制等辅助 Hook 已保留名称并导出，供业务按需使用；见下方辅助 Hook 清单。

### useBasePageTable 配置与返回值

```ts
type TableQuery<S> = {
  pageNum: number;
  pageSize: number;
  searchParams: S;
};

type GetTableDataResult<T, M = unknown> = {
  data: T[];
  total: number;
  pageNum?: number;
  pageSize?: number;
  render?: boolean;
  meta?: M;
};

// 增加第二个参数；已有只接收 query 的函数仍可使用。
getTableData: (
  query: TableQuery<SearchParams>,
  signal: AbortSignal,
) => Promise<GetTableDataResult<User>>;
```

| 配置 | 计划行为 |
| --- | --- |
| getTableData | 必填，接收查询快照及 AbortSignal，返回统一结果；业务转换实际接口响应 |
| defaultPageSize | 默认 20，初始化页容量 |
| defaultSearchParams | 可选初始化筛选，默认 {}；有必填字段时显式提供，只用于非受控初始化 |
| cachePageSizeKey | 可选，缓存页容量；无效缓存回退默认值 |
| debounceTime | 保留原名，默认 200ms，查询变化时的请求等待时间 |
| deps | 额外请求依赖 |
| subscribe | 接收 reload 回调并返回取消订阅函数，卸载或更换订阅时清理 |
| query / onQueryChange | 成对提供进入受控查询模式；不提供则内部管理查询 |

| 返回值 | 计划用途 |
| --- | --- |
| pageNum / pageSize / searchParams | 当前查询状态 |
| setPageNum / setPageSize / setPagination | 页码、页容量与原子分页更新 |
| setSearchParams | 值或函数更新，筛选变化回到第一页 |
| tableData / setTableData | 当前行数据及本地更新，支持函数更新 |
| total / setTotal | 总数及本地更新 |
| data | 最近接受的结果，包含业务 meta |
| loading / setLoading | 请求加载状态及兼容已有业务的手动入口 |
| error | 当前有效请求的错误 |
| reloadTable | 按当前查询重新请求，不自动重置页码 |

- 受控 query 是唯一查询来源，操作通过 onQueryChange 通知，由父组件回传；不保留另一份生效的内部查询。
- 保留 setSearchParams 更新回第一页、setPageSize 变化回第一页、后端 pageNum/pageSize 回写及 render:false 的结果约定。
- setTableData/setTotal 只更新本地展示结果，不自动请求，也不自动推算总数；本地增删后的总数由业务决定。
- setLoading 不取消请求；有效请求完成会写回其加载状态，不将此方法作为第二套请求控制器。

### AbortSignal 与请求生命周期

```tsx
const table = useBasePageTable<User, SearchParams>({
  getTableData: async (query, signal) => {
    const response = await fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(query),
      headers: { 'Content-Type': 'application/json' },
      signal,
    });
    if (!response.ok) throw new Error('加载失败');
    return response.json(); // 示例接口返回 GetTableDataResult<User>。
  },
});
```

- 新查询、手动刷新、依赖变化和卸载时取消旧等待计时器，并 abort 已发起的旧请求。
- 每次请求使用独立 AbortController 和查询快照，signal 由 Hook 创建并传给 getTableData。
- 取消旧请求不作为业务错误显示，也不让旧请求的 finally 提前关闭新请求的 loading。
- 即使请求函数忽略 signal，也只允许最新请求更新数据、错误和 loading；AbortSignal 不代替请求序号校验。
- 业务请求失败仍通过 error 返回，支持 reloadTable 重试；保留原 Hook 的错误结果清理约定。
- 上游订阅、等待计时器和请求在卸载时全部清理，不默认增加自动重试。

### 通用 Hook 归属

useRefState 是独立通用 Hook，源码位于 hooks 目录，文档与案例移到 [通用 Hooks](./hooks.md)。Table 不提供该 API；表格业务 Hook 内部可以复用它。

### useBasePageTable 补充 setPagination

```ts
setPagination(pageNum: number, pageSize: number): void
```

- 一次更新完整分页查询；页容量变化时回到第一页，否则使用传入页码。
- 页码与页容量都没有变化时保持原状态。
- 保留现有 setPageNum、setPageSize 和 setSearchParams，供业务主动操作。
- 复用 Hook 的 change 更新通道，兼容其内部状态和 query/onQueryChange 受控模式。
- 复用现有页容量缓存和请求机制，不另外存储分页状态。

### useTableChecked 补充 setCheckedIds

```ts
setCheckedIds(ids: (string | number)[]): void
```

一次 setTableData 函数更新，将当前行的 _checked 同步为最终 keys 对应的状态；未变化的行保留对象引用。checkedIds、checkedItems、checkedCount 仍由当前 tableData 派生。

库内 Hook 保留现有选择语义，即当前数据范围：新请求替换 tableData 后，选择取决于新行的 _checked，不天然支持跨页保留。Table 不改变这个语义；若需跨页选择，另用独立 keys 状态实现相同 TableSelection 协议。

### 辅助 Hook 已实现清单

| API | 行为 |
| --- | --- |
| useReloadDataById | 按 ID 请求局部数据，合并到当前匹配行；返回 Promise，错误由调用方处理 |
| useGetIndexById | 按 ID 读取当前行下标，未找到返回 -1 |
| useCopyDataByIds | structuredClone 复制选中行，生成新字符串 ID、清除 _checked，插入开头 |
| useAddRowAtStart / useAddRowAtEnd | 按数量创建暂存行，支持默认字段与本次初始字段，生成唯一字符串 ID |
| useDeleteDataByIds | 按 ID 删除当前行 |

自动生成身份的新增/复制 Hook 要求字符串身份字段，不把字符串 ID 写入声明为 number 的字段；生成的 ID 不被初始字段覆盖。新增数量必须有限且正数，小数向下取整。复制失败同步抛出且不部分更新。其他读取、选择、删除和刷新入口支持稳定 string/number 身份。所有本地辅助操作不自动修改 total 或请求后端；页面负责保存和总数。

### 页面完整用法

```tsx
import { Table, useBasePageTable, useTableChecked } from 'paper-ink';

const table = useBasePageTable<User, SearchParams>({ getTableData });
const selection = useTableChecked({
  tableData: table.tableData,
  setTableData: table.setTableData,
  idName: 'id',
});

<Table
  rowKey="id"
  source={table}
  selection={selection}
  columns={columns}
/>;
```

rowKey 与选择 Hook 的 idName 必须对应同一身份字段。局部刷新、增删、复制等 Hook 继续通过 setTableData 更新行，Table 不参与其业务过程。

## 排序、筛选与请求适配

现有 Hook 没有统一排序协议，因此排序暂时独立，不把 searchParams 的业务结构收进 TableSource。

```tsx
// SearchParams 中显式声明 sort?: TableSort | null。
<Table
  rowKey="id"
  source={table}
  selection={selection}
  columns={columns}
  sort={table.searchParams.sort ?? null}
  onSortChange={(sort) => {
    table.setSearchParams((prev) => ({ ...prev, sort }));
  }}
/>;
```

- 复用 setSearchParams 一次更新排序条件与第一页，不另调用 setPageNum。
- 请求层将列 key 映射为接口排序字段；Table 不猜测接口参数。
- 搜索表单整体替换 searchParams 时，是否保留 sort 由业务显式决定。
- 本地 source 在外部完成筛选、排序和 slice，total 使用筛选后的条数；静态 data 模式直接传最终行列表。
- 请求竞态、取消、缓存、失败重试属于请求层。
- 不提供 filters、总 onChange、request 或自动数据加载。未来只有在排序协议确定后才考虑扩展 source。

## 自定义编辑与 Form

```tsx
{
  title: '数量',
  dataIndex: 'quantity',
  render: (_, record) => (
    <QuantityCell
      value={record.quantity}
      onChange={(quantity) => updateRow(record.id, { quantity })}
    />
  ),
}
```

保存、取消、请求和校验由业务单元格或页面管理。需要 Form 时主动组合现有 Form；Table 不注入隐式表单上下文，也不提供 editable 配置。

## 展示与无障碍

- 默认淡色表头、水平细分隔线、轻微行悬停，不显示垂直网格线。
- 当前模式的 loading 为 true 时保留已有数据，显示忙碌状态；初次加载没有数据时不同时显示“暂无数据”。
- 空内容显示在跨所有可见列的单元格中，选择列计入跨列数量。
- 使用 table、thead、tbody、th、td；表头使用 scope，排序列提供 aria-sort 和可键盘操作的按钮。
- 选择控件提供行与全选标签，保留原生键盘操作；行内按钮不会顺带选中整行。
- 动画仅用于轻微交互反馈，尊重 reduced-motion；不默认对整表、行增删或排序位置做动画。
- 移动端宽表格通过容器横向滚动，不默认隐藏列或转换成卡片。

## 实现前与交付验证

1. 验证 columns 类型推导：字段 value 类型、操作列 undefined、非法字段、rowKey 字段值约束。
2. 验证 data/source 二选一、source 模式禁止状态覆盖、Hook 返回值直接传入的结构类型兼容。
3. 覆盖 source 分页绑定、页容量变化重置第一页、一次操作一次通知、关闭分页和避免二次切页。
4. 覆盖稳定 key、数据替换、排序通知次数和受控回传；不擅自重排数据或切页。
5. 覆盖单选、多选、全选、半选、禁选、跨页保留与业务清理。
6. 浏览器检查列宽/minWidth、左右固定列、选择列、汇总行、隐藏列、横向滚动和固定表头的组合。
   检查 onCell/onHeaderCell/onHeaderRow 的属性合并、事件串联及内部语义保留。
7. 覆盖初次加载与保留旧数据、隐藏表头、关闭悬停、隐藏全选、选择列标题、排序周期、文案覆盖与移动端溢出。
   覆盖分页顶部/底部、换页回顶、横向位置和焦点保留；省略 Tooltip 检查实际溢出、尺寸变化、自定义内容、键盘与重复提示。
8. 文档站提供基础展示、现有 Hook 直接适配、服务端查询、本地排序分页、当前页及独立跨页选择、自定义编辑等可操作案例。
9. 展开/合并覆盖受控回传、禁用展开、typed keys、键盘/焦点、跨页、详情卸载与嵌套控件；跨度归一化、0/自动覆盖、重叠、边界截断、隐藏列、固定区、colgroup 对齐、合并行组内详情顺序。
10. 验证 npm、按组件引入、CLI 源码安装及样式分发，测量实际体积。
11. Hook 检查受控/非受控查询、缓存、筛选回第一页、手动刷新、本地更新和 _checked 派生；AbortSignal 检查真正取消、忽略 signal 的旧响应、loading 竞态、错误与卸载清理。
12. useRefState 检查惰性初始化、连续函数更新、setter/ref 稳定身份、只读类型与 StrictMode 下的行为。
13. 实现后按真实支持范围更新组件优先级 Markdown、生成 HTML，并检查状态筛选与统计；独立 Table 与三个公共 Hook 单独记录，不将 antd Table API 标为已完成。

## 分发与案例

- 根入口：Table、useBasePageTable、useTableChecked、useRefState 及辅助 Hook。
- npm 子路径：paper-ink/table、paper-ink/table-hooks、paper-ink/use-ref-state；Table 单组件样式使用 paper-ink/table/style.css，含所需组件样式。
- CLI：paper-ink add table 自动安装表格、Hook 与所需控件；table-hooks、use-ref-state 也可独立安装。
- 第一批文档站 /#/table 提供 12 个可编辑案例：静态展示、Hook 分页、筛选排序、业务选择、独立跨页选择、固定列与汇总、溢出 Tooltip、编辑、取消竞态、失败重试、受控查询和 useRefState。
- 案例接口使用已标注的本地模拟。浏览器验证覆盖桌面和移动端；SSR 不是这些 Hook 的兼容目标。

## 验证记录（2026-10-12）

| 检查 | 结果 |
| --- | --- |
| typecheck / 完整构建 | 通过 |
| 单元与类型约束检查 | 45 个文件、222 项通过；本次 Table/Hook 相关 42 项 |
| CLI 单元检查 | 8 项通过 |
| 浏览器全量回归 | Chrome 71 项通过，其中 Table 专项 11 项 |
| 独立 npm 包 | React 18.3.1 / 19.3.0 的导出、样式和声明检查通过 |
| CLI 安装实际消费 | 打包后安装、重复安装、源代码类型检查、生产构建、浏览器 Table/Hook 交互通过 |
| 规划页 | 独立条目已完成 8/8；核心与独立条目已完成 44/81，antd Table 保持待实现 |
| 视觉 | 桌面与 390px 移动端查看；固定列/表头/汇总按真实坐标检查，无页面横向溢出 |
| 体积 | Table 含控件依赖 JS gzip 14423 字节，依赖完整 CSS gzip 3539 字节；主表格 Hook JS gzip 1577 字节，useRefState 175 字节，React 外置 |

本次未增加运行时依赖；Button 既有体积检查通过。请求案例为本地模拟，尚不代表特定后端已集成；SSR 不作为 Hook 兼容承诺。树形、多级表头、汇总合并与虚拟化仍在后续范围。展开行与数据/单层表头合并的第二批验证见后续记录。

## 第二批：展开行与合并单元格（2026-10-12）

已新增 6 个可编辑案例，文档站共 18 个案例：受控展开与详情输入、嵌套表格/自定义 SVG、纵向合并、横向/单层表头合并、展开与固定列/选择/汇总组合、分页/隐藏列/展开 keys 保留。

扩展只改变独立 Table 的支持范围，antd Table 条目保持待实现；汇总合并、多级表头、树形、虚拟滚动仍不支持。原有 Hook API 保持不变。展开详情使用稳定父行 key：合并组边界或数据顺序改变时保留仍然挂载的详情组件状态；实际收起、禁用或移出当前页则卸载。

### 第二批验证结果

- 类型检查、完整构建通过；46 个单元文件共 235 项通过，CLI 单元检查 8 项通过。
- Chrome 全量浏览器 78 项通过；展开/合并专项新增 7 项，覆盖真实 rowSpan/colSpan 几何、详情顺序、嵌套表格、键盘、跨页和移动端。
- React 18.3.1、19.3.0 的 npm 导出、样式与声明检查通过；两版均实际验证 CLI 安装源码、类型检查、生产构建、展开/收起、跨行与表头合并，以及退出弹层的 inert 状态。
- 分发检查中修正了 React 18 源码的只读 ref 类型及弹层 inert 属性兼容；不增加运行时依赖，不改变 React 19 的退出状态行为。
- 规划页生成并验证：44/81 已完成、独立条目 8/8，antd Table 保持待实现。桌面/移动端和展开+合并+固定列案例已查看截图。
- Button 既有体积检查通过。原第一批体积数字为当时快照，新增能力的实际体积以最新产物测量为准。

复现 React 18 CLI 消费检查：`PAPER_INK_REACT_VERSION=18.3.1 PLAYWRIGHT_CHANNEL=chrome node scripts/check-cli.mjs`；默认使用 React 19.3.0。
