import { LiveDemo } from './LiveDemo';
export function HooksDemos() { return <div className="demo-list">
<LiveDemo title="useRefState 即时读取与连续更新" code={`function Demo() {
  const [value, setValue, valueRef] = useRefState(0);
  const [read, setRead] = useState(0);
  return <Stack gap="medium"><Button onClick={() => { setValue(n => n + 1); setValue(n => n + 1); setRead(valueRef.current); }}>连续增加两次</Button><span role="status">渲染值 {value}，即时 ref {read}</span></Stack>;
}`} />
<LiveDemo title="本地计数与刷新恢复" code={`function Demo() {
  const [count, setCount] = useLocalstorageState(0, 'paper-ink-demo-hooks-count');
  return <Stack gap="medium"><Inline><Button onClick={() => setCount(n => n + 1)}>增加计数</Button><Button onClick={() => setCount(0)}>重置计数</Button></Inline><span role="status">本地计数：{count}</span><span>刷新页面后恢复；每次提交状态自动保存。</span></Stack>;
}`} />
<LiveDemo title="对象草稿自动保存" code={`function Demo() {
  const [draft, setDraft] = useLocalstorageState({ name: '', note: '' }, 'paper-ink-demo-hooks-draft');
  return <Stack gap="medium"><Input aria-label="草稿姓名" placeholder="姓名" value={draft.name} onChange={e => setDraft(prev => ({ ...prev, name: e.target.value }))} /><Input.TextArea aria-label="草稿备注" placeholder="备注" value={draft.note} onChange={e => setDraft(prev => ({ ...prev, note: e.target.value }))} /><pre aria-label="本地草稿">{JSON.stringify(draft)}</pre><Button onClick={() => setDraft({ name: '', note: '' })}>清空草稿</Button></Stack>;
}`} />
<LiveDemo title="切换存储 key" code={`function Demo() {
  const [slot, setSlot] = useState('a');
  const [count, setCount] = useLocalstorageState(0, 'paper-ink-demo-hooks-slot-' + slot);
  return <Stack gap="medium"><Inline><Button onClick={() => setSlot('a')}>槽位 A</Button><Button onClick={() => setSlot('b')}>槽位 B</Button><Button onClick={() => setCount(n => n + 1)}>增加当前槽位</Button></Inline><span role="status">槽位 {slot.toUpperCase()}：{count}</span></Stack>;
}`} />
<LiveDemo title="布尔值与本地偏好" code={`function Demo() {
  const [compact, setCompact] = useLocalstorageState(false, 'paper-ink-demo-hooks-compact');
  return <Stack gap="medium"><Checkbox checked={compact} onChange={e => setCompact(e.target.checked)}>记住紧凑模式</Checkbox><span role="status">紧凑模式：{compact ? '开启' : '关闭'}</span></Stack>;
}`} />
</div>; }
