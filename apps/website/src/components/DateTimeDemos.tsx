import { LiveDemo } from './LiveDemo';
export function DatePickerDemos() { return <div className="demo-list">
<LiveDemo title="基础日期与尺寸" code={`function Demo() {
  return <Stack gap="medium"><DatePicker aria-label="基础日期" defaultValue={dayjs('2026-10-12')} /><Inline><DatePicker size="small" placeholder="小尺寸" /><DatePicker size="large" placeholder="大尺寸" /><DatePicker disabled defaultValue={dayjs('2026-10-12')} /></Inline></Stack>;
}`} />
<LiveDemo title="月份与年份" code={`function Demo() {
  return <Inline><DatePicker picker="month" aria-label="统计月份" defaultValue={dayjs('2026-10-01')} /><DatePicker picker="year" aria-label="统计年份" defaultValue={dayjs('2026-01-01')} /></Inline>;
}`} />
<LiveDemo title="受控值与清空" code={`function Demo() {
  const [value, setValue] = useState(dayjs('2026-10-12'));
  const [changes, setChanges] = useState(0);
  return <Stack gap="medium"><DatePicker aria-label="受控日期" value={value} onChange={next => { setValue(next); setChanges(n => n + 1); }} /><Inline><Button onClick={() => setValue(dayjs('2026-12-31'))}>外部设置年底</Button><Button onClick={() => setValue(null)}>外部清空</Button></Inline><span role="status">已提交：{value?.format('YYYY-MM-DD') ?? '空'}，变化 {changes} 次</span></Stack>;
}`} />
<LiveDemo title="严格输入与 Escape 还原" code={`function Demo() {
  const [value, setValue] = useState(dayjs('2024-02-29'));
  return <Stack gap="medium"><DatePicker aria-label="严格日期" value={value} onChange={setValue} /><span role="status">有效值：{value?.format('YYYY-MM-DD') ?? '空'}</span><span>按回车解析；2025-02-29 不存在，错误文本不会提交。Escape 还原已提交值。</span></Stack>;
}`} />
<LiveDemo title="范围限制与周末禁用" code={`function Demo() {
  return <Stack gap="medium"><DatePicker aria-label="限选日期" minDate={dayjs('2026-10-01')} maxDate={dayjs('2026-10-31')} disabledDate={date => date.day() === 0 || date.day() === 6} /><span>仅可选择 2026 年 10 月的工作日；边界同时限制面板导航。</span></Stack>;
}`} />
<LiveDemo title="快捷日期与动态计算" code={`function Demo() {
  const [text, setText] = useState('尚未选择');
  return <Stack gap="medium"><DatePicker aria-label="快捷日期" presets={[{ label: '今天', value: () => dayjs() }, { label: '七天后', value: () => dayjs().add(7, 'day') }]} onChange={(_, text) => setText(text || '空')} /><span role="status">{text}</span></Stack>;
}`} />
<LiveDemo title="日期范围与选择过程" code={`function Demo() {
  const [range, setRange] = useState(null);
  const [draft, setDraft] = useState('尚未选择');
  return <Stack gap="medium"><DatePicker.RangePicker aria-label="查询范围" value={range} onChange={setRange} onCalendarChange={(_, texts, info) => setDraft(info.range + ': ' + texts.join(' → '))} presets={[{ label: '最近七天', value: () => [dayjs().subtract(6, 'day'), dayjs()] }, { label: '固定示例', value: [dayjs('2026-10-01'), dayjs('2026-10-12')] }]} /><span role="status">已提交：{range ? range.map(value => value?.format('YYYY-MM-DD') ?? '空').join(' → ') : '空'}</span><span>草稿：{draft}</span></Stack>;
}`} />
<LiveDemo title="允许单端为空与禁用端点" code={`function Demo() {
  const [text, setText] = useState('尚未选择');
  return <Stack gap="medium"><DatePicker.RangePicker aria-label="开放结束日期" allowEmpty={[false, true]} needConfirm onChange={(_, texts) => setText(texts.join(' → '))} placeholder={['生效日期', '结束日期可空']} /><span role="status">{text}</span><DatePicker.RangePicker aria-label="固定起始日期" disabled={[true, false]} defaultValue={[dayjs('2026-10-01'), dayjs('2026-10-12')]} /></Stack>;
}`} />
<LiveDemo title="月份与年份范围" code={`function Demo() {
  return <Stack gap="medium"><DatePicker.RangePicker picker="month" aria-label="月份范围" defaultValue={[dayjs('2026-01-01'), dayjs('2026-06-01')]} /><DatePicker.RangePicker picker="year" aria-label="年份范围" defaultValue={[dayjs('2024-01-01'), dayjs('2026-01-01')]} /></Stack>;
}`} />
<LiveDemo title="日期时间草稿与确认" code={`function Demo() {
  const [text, setText] = useState('尚未提交');
  return <Stack gap="medium"><DatePicker aria-label="预约时间" showTime={{ format: 'HH:mm', minuteStep: 15 }} format="YYYY-MM-DD HH:mm" defaultValue={dayjs('2026-10-12T09:00:00')} onChange={(_, text) => setText(text)} /><span role="status">已提交：{text}</span><span>选择日期和时间只修改草稿，点确定提交；关闭弹层取消草稿。</span></Stack>;
}`} />
<LiveDemo title="日期时间范围与端点约束" code={`function Demo() {
  return <Stack gap="medium"><DatePicker.RangePicker aria-label="会议时段" showTime={{ format: 'HH:mm', minuteStep: 30 }} format="YYYY-MM-DD HH:mm" defaultValue={[dayjs('2026-10-12T09:00:00'), dayjs('2026-10-12T17:00:00')]} disabledTime={(_, partial) => ({ disabledHours: () => partial === 'start' ? [0, 1, 2, 3, 4, 5, 6, 7] : [22, 23] })} /><span>起始时间禁用 00–07 点，结束时间禁用 22–23 点。</span></Stack>;
}`} />
<LiveDemo title="表单绑定、提交转换与重置" code={`function Demo() {
  const form = useForm({ defaultValues: { birthday: dayjs('2026-10-12'), period: null, runAt: dayjs('2026-10-12T09:00:00') } });
  const { dirty } = useFormState(form);
  const [saved, setSaved] = useState('');
  return <Form form={form} onSubmit={values => setSaved(JSON.stringify({ birthday: values.birthday?.format('YYYY-MM-DD') ?? null, period: values.period?.map(value => value?.format('YYYY-MM-DD') ?? null) ?? null, runAt: values.runAt?.format('HH:mm') ?? null }, null, 2))}>
    <Form.Field name="birthday" label="生日" required="请选择生日"><DatePicker /></Form.Field>
    <Form.Field name="period" label="查询期间"><DatePicker.RangePicker /></Form.Field>
    <Form.Field name="runAt" label="执行时间"><TimePicker format="HH:mm" minuteStep={5} /></Form.Field>
    <Inline><Button htmlType="submit" type="primary">读取表单</Button><Button htmlType="reset">重置日期表单</Button><span role="status">{dirty ? '已修改' : '未修改'}</span></Inline>
    {saved && <pre aria-label="日期表单结果">{saved}</pre>}
  </Form>;
}`} />
<LiveDemo title="英文与局部主题" code={`function Demo() {
  return <ConfigProvider theme={{ token: { color: { text: { primary: '#eeeeec', secondary: '#aaaaa7' }, surface: { container: '#242423', elevated: '#242423', muted: '#343432' }, border: { default: '#525250' }, primary: { solid: '#eeeeec', onSolid: '#161616' } } } }}><Stack gap="medium"><DatePicker locale={enUS} aria-label="English date" defaultValue={dayjs('2026-10-12')} /><DatePicker.RangePicker locale={enUS} aria-label="English range" /></Stack></ConfigProvider>;
}`} dark />
<LiveDemo title="窄容器与只读输入" code={`function Demo() {
  return <Stack gap="medium" style={{ width: '100%', maxWidth: 280 }}><DatePicker.RangePicker aria-label="窄容器范围" inputReadOnly style={{ width: '100%' }} /><DatePicker aria-label="只读日期" inputReadOnly prefix="日期" renderExtraFooter={() => <span>只允许面板选择，业务说明放在底部。</span>} /></Stack>;
}`} />
</div>; }
export function TimePickerDemos() { return <div className="demo-list">
<LiveDemo title="时间选择与确认" code={`function Demo() {
  const [text, setText] = useState('尚未提交');
  return <Stack gap="medium"><TimePicker aria-label="基础时间" defaultValue={dayjs('2026-10-12T09:30:00')} onChange={(_, text) => setText(text || '空')} /><span role="status">已提交：{text}</span><span>时间列为草稿；确定提交，Escape 取消。</span></Stack>;
}`} />
<LiveDemo title="分钟精度与步长" code={`function Demo() {
  return <Inline><TimePicker aria-label="十五分钟步长" format="HH:mm" minuteStep={15} defaultValue={dayjs('2026-10-12T09:30:00')} /><TimePicker aria-label="秒步长" hourStep={2} secondStep={10} defaultValue={dayjs('2026-10-12T10:30:20')} /></Inline>;
}`} />
<LiveDemo title="禁用时间组合" code={`function Demo() {
  return <Stack gap="medium"><TimePicker aria-label="营业时间" format="HH:mm" minuteStep={15} disabledTime={() => ({ disabledHours: () => [0, 1, 2, 3, 4, 5, 6, 7, 20, 21, 22, 23], disabledMinutes: hour => hour === 12 ? [0, 15, 30] : [] })} /><span>08–19 点可选，12 点禁用 00、15、30 分；禁用规则同时校验输入。</span></Stack>;
}`} />
<LiveDemo title="即时提交与受控更新" code={`function Demo() {
  const [value, setValue] = useState(dayjs('2026-10-12T09:00:00'));
  return <Stack gap="medium"><TimePicker aria-label="即时时间" value={value} onChange={setValue} format="HH:mm" minuteStep={5} needConfirm={false} /><span role="status">当前时间：{value?.format('HH:mm') ?? '空'}</span><Button onClick={() => setValue(dayjs('2026-10-12T18:00:00'))}>外部设置 18:00</Button></Stack>;
}`} />
<LiveDemo title="严格时间输入" code={`function Demo() {
  const [text, setText] = useState('尚未提交');
  return <Stack gap="medium"><TimePicker aria-label="严格时间" format="HH:mm" minuteStep={15} needConfirm={false} onChange={(_, text) => setText(text)} /><span role="status">已提交：{text}</span><span>09:15 可提交；09:17 不满足步长，24:00 超出 24 小时制范围。</span></Stack>;
}`} />
<LiveDemo title="只读、禁用与底部说明" code={`function Demo() {
  return <Stack gap="medium"><TimePicker aria-label="只读时间" inputReadOnly locale={enUS} format="HH:mm" renderExtraFooter={() => <span>Local time · use the panel to choose</span>} /><Inline><TimePicker disabled defaultValue={dayjs('2026-10-12T09:30:00')} /><TimePicker status="warning" size="small" placeholder="待确认时间" /></Inline></Stack>;
}`} />
</div>; }
