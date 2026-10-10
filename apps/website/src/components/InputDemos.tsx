import { LiveDemo } from './LiveDemo';
export function InputDemos() {
  return <div className="demo-list">
    <LiveDemo title="输入与清空" code={`function Demo() {
  const [value, setValue] = useState('Paper Ink');
  return <Input aria-label="可清空名称" value={value} onChange={e => setValue(e.target.value)} allowClear placeholder="输入名称" />;
}`} />
    <LiveDemo title="尺寸与状态" code={`<div className="input-examples">
  <Input size="small" placeholder="Small" />
  <Input placeholder="Middle" />
  <Input size="large" placeholder="Large" />
  <Input status="error" placeholder="错误状态" />
  <Input status="warning" placeholder="警告状态" />
  <Input disabled defaultValue="Disabled" />
</div>`} />
    <LiveDemo title="前后缀与计数" code={`<Input aria-label="账号" prefix="@" suffix=".com" showCount maxLength={20} placeholder="账号" />`} />
    <LiveDemo title="文本域自适应" code={`<Input.TextArea aria-label="自适应简介" placeholder="输入多行内容，高度会随内容变化" allowClear showCount maxLength={120} autoSize={{ minRows: 2, maxRows: 5 }} />`} />
  </div>;
}
