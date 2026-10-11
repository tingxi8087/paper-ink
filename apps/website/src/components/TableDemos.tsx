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
<LiveDemo title="useRefState 与加载空状态" code={example(`function Demo() {
  const [value, setValue, valueRef] = useRefState(0);
  const [read, setRead] = useState(0);
  const [loading, setLoading] = useState(false);
  return <Stack gap="medium"><Inline><Button onClick={() => { setValue(prev => prev + 1); setValue(prev => prev + 1); setRead(valueRef.current); }}>连续增加两次</Button><Checkbox checked={loading} onChange={e => setLoading(e.target.checked)}>模拟加载</Checkbox></Inline><span role="status">渲染值 {value}，即时 ref {read}</span><Table rowKey="id" data={[]} loading={loading} showHeader={false} rowHoverable={false} empty={<span>还没有记录</span>} columns={[{ title: '姓名', dataIndex: 'name' }]} /></Stack>;
}`)} />
</div>; }
