import { LiveDemo } from './LiveDemo';
const rows = `const users = Array.from({ length: 48 }, (_, i) => ({ id: i + 1, name: '成员 ' + (i + 1), age: 20 + i % 15, amount: (i + 1) * 10, _checked: false }));
const columns = [{ title: '姓名', dataIndex: 'name' }, { title: '年龄', dataIndex: 'age', align: 'right' }];`;
function example(code: string) { return `function Example() {
${code}
return <Demo />;
}`; }
export function TableDemos() { return <div className="demo-list">
<LiveDemo title="基础展示与隐藏列" code={example(`${rows}
function Demo() {
  const [hidden, setHidden] = useState(false);
  return <Stack gap="medium"><Checkbox checked={hidden} onChange={e => setHidden(e.target.checked)}>隐藏年龄</Checkbox><Table rowKey="id" data={users.slice(0, 3)} columns={[{ ...columns[0], width: '10%', minWidth: 160 }, { ...columns[1], hidden }]} /></Stack>;
}`)} />
<LiveDemo title="Hook 直接绑定与内置分页" code={example(`${rows}
function Demo() {
  const table = useBasePageTable({ defaultPageSize: 5, debounceTime: 0, getTableData: async ({ pageNum, pageSize }) => ({ data: users.slice((pageNum - 1) * pageSize, pageNum * pageSize), total: users.length }) });
  return <Stack gap="medium"><Table rowKey="id" source={table} columns={columns} pagination={{ pageSizeOptions: [5, 10, 20], showSizeChanger: true }} /><span role="status">第 {table.pageNum} 页，每页 {table.pageSize} 条</span></Stack>;
}`)} />
<LiveDemo title="筛选与排序查询（本地模拟）" code={example(`${rows}
function Demo() {
  const table = useBasePageTable({ defaultSearchParams: { keyword: '', sort: null }, defaultPageSize: 5, debounceTime: 0, getTableData: async ({ pageNum, pageSize, searchParams }) => {
    const filtered = users.filter(row => row.name.includes(searchParams.keyword));
    if (searchParams.sort) filtered.sort((a, b) => (a[searchParams.sort.key] - b[searchParams.sort.key]) * (searchParams.sort.order === 'ascend' ? 1 : -1));
    return { data: filtered.slice((pageNum - 1) * pageSize, pageNum * pageSize), total: filtered.length };
  } });
  return <Stack gap="medium"><Input aria-label="筛选成员" placeholder="输入姓名筛选" value={table.searchParams.keyword} onChange={e => table.setSearchParams(prev => ({ ...prev, keyword: e.target.value }))} /><Table rowKey="id" source={table} columns={[columns[0], { ...columns[1], sorter: true }]} sort={table.searchParams.sort} onSortChange={sort => table.setSearchParams(prev => ({ ...prev, sort }))} /><span role="status">筛选结果 {table.total} 条，第 {table.pageNum} 页</span></Stack>;
}`)} />
<LiveDemo title="业务数据选择与禁选" code={example(`${rows}
function Demo() {
  const table = useBasePageTable({ debounceTime: 0, getTableData: async () => ({ data: users.slice(0, 4), total: 4 }) });
  const selection = useTableChecked({ tableData: table.tableData, setTableData: table.setTableData, idName: 'id' });
  return <Stack gap="medium"><Table rowKey="id" source={table} pagination={false} columns={columns} selection={selection} rowSelectable={row => row.id !== 2} locale={{ selectRow: row => '选择成员 ' + row.id }} /><span role="status">已选 {selection.checkedCount} 项：{selection.checkedIds.join(', ') || '无'}</span><Button onClick={() => table.setTableData(rows => rows.map(row => ({ ...row, _checked: row.id === 3 })))}>业务设置第三行</Button></Stack>;
}`)} />
<LiveDemo title="独立跨页选择与单选" code={example(`${rows}
function Demo() {
  const [ids, setIds] = useState([]);
  const [radio, setRadio] = useState(false);
  const table = useBasePageTable({ defaultPageSize: 3, debounceTime: 0, getTableData: async ({ pageNum, pageSize }) => ({ data: users.slice((pageNum - 1) * pageSize, pageNum * pageSize), total: users.length }) });
  return <Stack gap="medium"><Checkbox checked={radio} onChange={e => { setRadio(e.target.checked); setIds([]); }}>单选模式</Checkbox><Table rowKey="id" source={table} columns={columns} selection={{ checkedIds: ids, setCheckedIds: setIds, type: radio ? 'radio' : 'checkbox' }} locale={{ selectRow: row => '跨页选择 ' + row.id }} /><span role="status">跨页 keys：{ids.join(', ') || '无'}</span></Stack>;
}`)} />
<LiveDemo title="固定列、表头与本页汇总" code={example(`${rows}
function Demo() {
  const [data, setData] = useState(users.slice(0, 12));
  const selection = useTableChecked({ tableData: data, setTableData: setData, idName: 'id' });
  return <Table rowKey="id" data={data} selection={selection} scroll={{ x: 900, y: 220 }} columns={[
    { ...columns[0], width: 120, fixed: 'left' },
    { key: 'detail', title: '说明', minWidth: 360, render: (_, row) => '第 ' + row.id + ' 条记录的业务说明' },
    { ...columns[1], width: 120 },
    { title: '金额', dataIndex: 'amount', width: 130, fixed: 'right', align: 'right' }
  ]} summary={rows => ({ name: '本页合计', amount: rows.reduce((sum, row) => sum + row.amount, 0) })} />;
}`)} />
<LiveDemo title="省略与实际溢出 Tooltip" code={example(`function Demo() {
  const [wide, setWide] = useState(false);
  const data = [{ id: 1, text: '这是一段用于查看完整内容的很长很长的文本', address: '浙江省杭州市西湖区完整地址' }, { id: 2, text: '短文本', address: '短地址' }];
  return <Stack gap="medium"><Checkbox checked={wide} onChange={e => setWide(e.target.checked)}>加宽文本列</Checkbox><Table rowKey="id" data={data} scroll={{ x: wide ? 850 : 460 }} columns={[
    { key: 'text', title: '自动提示', dataIndex: 'text', width: wide ? 550 : 140, ellipsis: true },
    { key: 'silent', title: '仅省略', width: 140, render: (_, row) => row.text, ellipsis: { tooltip: false } },
    { key: 'address', title: '自定义提示', width: 180, render: (_, row) => <span>{row.address}</span>, ellipsis: { tooltip: row => '完整地址：' + row.address } }
  ]} /></Stack>;
}`)} />
<LiveDemo title="自定义编辑与本地更新" code={example(`${rows}
function Demo() {
  const [data, setData] = useState(users.slice(0, 3));
  return <Stack gap="medium"><Table rowKey="id" data={data} columns={[columns[0], { key: 'edit', title: '金额', width: 140, render: (_, row) => <InputNumber aria-label={'修改金额 ' + row.id} value={row.amount} min={0} onChange={amount => setData(prev => prev.map(item => item.id === row.id ? { ...item, amount: amount ?? 0 } : item))} /> }]} summary={rows => ({ name: '合计', edit: rows.reduce((sum, row) => sum + row.amount, 0) })} /><span role="status">第一行金额：{data[0].amount}</span></Stack>;
}`)} />
<LiveDemo title="取消请求与过期响应（本地模拟）" code={example(`function Demo() {
  const [logs, setLogs] = useState([]);
  const [ignore, setIgnore] = useState(false);
  const table = useBasePageTable({ defaultSearchParams: { keyword: '初始' }, debounceTime: 0, deps: [ignore], getTableData: ({ searchParams }, signal) => new Promise((resolve, reject) => {
    const word = searchParams.keyword;
    const timer = setTimeout(() => { setLogs(prev => [...prev, '返回 ' + word]); resolve({ data: [{ id: 1, name: word }], total: 1 }); }, word === '慢请求' ? 700 : 100);
    signal.addEventListener('abort', () => { setLogs(prev => [...prev, '取消 ' + word]); if (!ignore) { clearTimeout(timer); reject(new DOMException('已取消', 'AbortError')); } }, { once: true });
  }) });
  return <Stack gap="medium"><span>本地定时器模拟；慢请求 700ms，快请求 100ms。</span><Checkbox checked={ignore} onChange={e => setIgnore(e.target.checked)}>模拟忽略 signal 的接口</Checkbox><Inline><Button onClick={() => table.setSearchParams({ keyword: '慢请求' })}>慢请求</Button><Button onClick={() => table.setSearchParams({ keyword: '快请求' })}>快请求</Button></Inline><Table rowKey="id" source={table} pagination={false} columns={[{ title: '最新结果', dataIndex: 'name' }]} /><span role="status">{table.loading ? '请求中' : '请求完成'}</span><pre aria-label="请求日志">{logs.join('\\n')}</pre></Stack>;
}`)} />
<LiveDemo title="失败处理与手动重试（本地模拟）" code={example(`${rows}
function Demo() {
  const attempts = useRef(0);
  const table = useBasePageTable({ debounceTime: 0, getTableData: async () => {
    await new Promise(resolve => setTimeout(resolve, 120));
    if (++attempts.current === 1) throw new Error('模拟加载失败');
    return { data: users.slice(0, 3), total: 3 };
  } });
  return <Stack gap="medium">{table.error && <Alert type="error" message="模拟加载失败" action={<Button onClick={table.reloadTable}>重试</Button>} />}<Table rowKey="id" source={table} columns={columns} pagination={false} /><span role="status">{table.error ? '失败，等待重试' : table.loading ? '加载中' : '加载完成'}</span></Stack>;
}`)} />
<LiveDemo title="受控查询与顶部简洁分页" code={example(`${rows}
function Demo() {
  const [query, setQuery] = useState({ pageNum: 1, pageSize: 3, searchParams: {} });
  const table = useBasePageTable({ query, onQueryChange: setQuery, debounceTime: 0, getTableData: async ({ pageNum, pageSize }) => ({ data: users.slice((pageNum - 1) * pageSize, pageNum * pageSize), total: users.length }) });
  return <Stack gap="medium"><Button onClick={() => setQuery(prev => ({ ...prev, pageNum: 4 }))}>外部跳到第四页</Button><Table rowKey="id" source={table} columns={columns} pagination={{ position: 'top', simple: true }} /><span role="status">受控页码：{query.pageNum}</span></Stack>;
}`)} />
<LiveDemo title="加载与自定义空状态" code={example(`function Demo() {
  const [loading, setLoading] = useState(false);
  return <Stack gap="medium"><Checkbox checked={loading} onChange={e => setLoading(e.target.checked)}>模拟加载</Checkbox><Table rowKey="id" data={[]} loading={loading} showHeader={false} rowHoverable={false} empty={<span>还没有记录</span>} columns={[{ title: '姓名', dataIndex: 'name' }]} /></Stack>;
}`)} />
<LiveDemo title="受控展开、详情输入与行选择" code={example(`${rows}
function Demo() {
  const [data, setData] = useState(users.slice(0, 3));
  const [ids, setIds] = useState([]);
  const [clicked, setClicked] = useState(0);
  const selection = useTableChecked({ tableData: data, setTableData: setData, idName: 'id' });
  return <Stack gap="medium"><Inline><Button onClick={() => setIds([2])}>外部展开第二行</Button><Button onClick={() => setData(prev => [...prev].reverse())}>反转数据</Button></Inline><Table rowKey="id" data={data} columns={columns} selection={selection} onRow={() => ({ onClick: () => setClicked(prev => prev + 1) })} expansion={{ expandedIds: ids, setExpandedIds: setIds, rowExpandable: row => row.id !== 3, render: row => <Stack gap="small"><strong>{row.name} 详情</strong><Input aria-label={'详情备注 ' + row.id} placeholder="收起后卸载，重新展开恢复空值" /></Stack> }} locale={{ expandRow: row => '展开成员 ' + row.id, collapseRow: row => '收起成员 ' + row.id, selectRow: row => '勾选展开成员 ' + row.id }} /><span role="status">展开 keys：{ids.join(', ') || '无'}；行点击 {clicked} 次；选择 {selection.checkedCount} 项</span></Stack>;
}`)} />
<LiveDemo title="嵌套表格与自定义展开图标" code={example(`function Demo() {
  const [ids, setIds] = useState([]);
  const data = [{ id: 'design', name: '设计组', tasks: [{ id: 'd1', title: '组件视觉' }, { id: 'd2', title: '交互检查' }] }, { id: 'dev', name: '开发组', tasks: [{ id: 't1', title: '实现 API' }] }];
  return <Table rowKey="id" data={data} columns={[{ title: '团队', dataIndex: 'name' }]} expansion={{ expandedIds: ids, setExpandedIds: setIds, expandIcon: expanded => <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d={expanded ? 'M3 8h10' : 'M3 8h10M8 3v10'} /></svg>, render: row => <Table aria-label={row.name + '任务'} size="small" rowKey="id" data={row.tasks} columns={[{ title: '任务', dataIndex: 'title' }]} /> }} locale={{ expandRow: row => '展开' + row.name, collapseRow: row => '收起' + row.name }} />;
}`)} />
<LiveDemo title="按分组纵向合并单元格" code={example(`function Demo() {
  const data = [{ id: 1, team: '设计组', name: '小林', hours: 8 }, { id: 2, team: '设计组', name: '小陈', hours: 6 }, { id: 3, team: '开发组', name: '小周', hours: 10 }];
  return <Table rowKey="id" data={data} bordered columns={[
    { title: '团队', dataIndex: 'team', width: 130, onCell: (_, index) => ({ rowSpan: index === 0 ? 2 : index === 1 ? 0 : 1 }) },
    { title: '成员', dataIndex: 'name' },
    { title: '工时', dataIndex: 'hours', align: 'right' }
  ]} />;
}`)} />
<LiveDemo title="横向合并与单行表头分组" code={example(`function Demo() {
  const data = [{ id: 1, name: '本月排期：先设计，再实现', role: '', progress: '' }, { id: 2, name: '小林', role: '设计', progress: '完成' }, { id: 3, name: '小周', role: '开发', progress: '进行中' }];
  return <Table rowKey="id" data={data} bordered columns={[
    { title: '成员与职责', dataIndex: 'name', onHeaderCell: () => ({ colSpan: 2 }), onCell: (_, index) => ({ colSpan: index === 0 ? 3 : 1 }) },
    { title: '职责', dataIndex: 'role', onHeaderCell: () => ({ colSpan: 0 }), onCell: (_, index) => ({ colSpan: index === 0 ? 0 : 1 }) },
    { title: '进度', dataIndex: 'progress', onCell: (_, index) => ({ colSpan: index === 0 ? 0 : 1 }) }
  ]} />;
}`)} />
<LiveDemo title="合并、展开、固定列与汇总组合" code={example(`function Demo() {
  const [data, setData] = useState([{ id: 1, team: '设计组', name: '小林', amount: 80 }, { id: 2, team: '设计组', name: '小陈', amount: 60 }, { id: 3, team: '开发组', name: '小周', amount: 100 }]);
  const [ids, setIds] = useState([]);
  const selection = useTableChecked({ tableData: data, setTableData: setData, idName: 'id' });
  return <Stack gap="medium"><span>纵向合并时，详情统一放到整个合并组之后，按父行顺序展示。</span><Table rowKey="id" data={data} selection={selection} scroll={{ x: 820, y: 260 }} columns={[
    { title: '团队', dataIndex: 'team', width: 120, fixed: 'left', onCell: (_, index) => ({ rowSpan: index === 0 ? 2 : index === 1 ? 0 : 1 }) },
    { title: '成员', dataIndex: 'name', width: 200 },
    { key: 'note', title: '说明', width: 280, render: (_, row) => row.name + '的工作记录' },
    { title: '金额', dataIndex: 'amount', width: 140, fixed: 'right', align: 'right' }
  ]} expansion={{ expandedIds: ids, setExpandedIds: setIds, render: row => <div aria-label={'组合详情 ' + row.id}>第 {row.id} 行详情：{row.name}</div> }} locale={{ expandRow: row => '展开组合 ' + row.id, collapseRow: row => '收起组合 ' + row.id, selectRow: row => '勾选组合 ' + row.id }} summary={rows => ({ team: '本页合计', amount: rows.reduce((sum, row) => sum + row.amount, 0) })} /><span role="status">选择 {selection.checkedCount} 项</span></Stack>;
}`)} />
<LiveDemo title="分页、隐藏列与展开状态保留" code={example(`function Demo() {
  const [hidden, setHidden] = useState(false);
  const [ids, setIds] = useState([]);
  const data = [{ id: 1, name: '第一组说明', age: 20 }, { id: 2, name: '成员甲', age: 21 }, { id: 3, name: '第二组说明', age: 30 }, { id: 4, name: '成员乙', age: 31 }];
  const table = useBasePageTable({ defaultPageSize: 2, debounceTime: 0, getTableData: async ({ pageNum, pageSize }) => ({ data: data.slice((pageNum - 1) * pageSize, pageNum * pageSize), total: data.length }) });
  return <Stack gap="medium"><Checkbox checked={hidden} onChange={e => setHidden(e.target.checked)}>隐藏动态年龄列</Checkbox><Table rowKey="id" source={table} columns={[
    { title: '姓名', dataIndex: 'name', onCell: (_, index) => ({ colSpan: index === 0 && !hidden ? 2 : 1 }) },
    { title: '年龄', dataIndex: 'age', hidden, onCell: (_, index) => ({ colSpan: index === 0 ? 0 : 1 }) }
  ]} expansion={{ expandedIds: ids, setExpandedIds: setIds, render: row => <div aria-label={'分页详情 ' + row.id}>{row.name}的说明</div> }} locale={{ expandRow: row => '展开分页 ' + row.id, collapseRow: row => '收起分页 ' + row.id }} /><span role="status">保留展开 keys：{ids.join(', ') || '无'}</span></Stack>;
}`)} />

</div>; }
