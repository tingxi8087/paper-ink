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
    <LiveDemo title="搜索与清空" code={`function Demo() {
  const [result, setResult] = useState('尚未搜索');
  return <Stack><Input.Search aria-label="项目搜索" placeholder="搜索组件" defaultValue="Paper Ink" allowClear enterButton="搜索" onSearch={(value, event, info) => setResult((info?.source === 'clear' ? '清空：' : '搜索：') + value)} /><Typography.Text type="secondary">{result}</Typography.Text></Stack>;
}`} />
    <LiveDemo title="搜索加载与自定义按钮" code={`function Demo() {
  const [loading, setLoading] = useState(false);
  return <Stack><Inline><Switch aria-label="搜索加载状态" checked={loading} onChange={setLoading} /><span>加载中禁止重复提交</span></Inline><Input.Search aria-label="加载搜索" placeholder="输入关键词" loading={loading} enterButton onSearch={value => message.info('搜索：' + value)} /><Input.Search aria-label="自定义搜索" placeholder="自定义按钮" enterButton={<Button type="primary">查找</Button>} onSearch={value => message.info('查找：' + value)} /></Stack>;
}`} />
    <LiveDemo title="密码显示与隐藏" code={`<Stack><Input.Password aria-label="登录密码" placeholder="输入密码" defaultValue="paper-ink" allowClear /><Input.Password aria-label="不显示切换按钮的密码" placeholder="隐藏切换按钮" visibilityToggle={false} /><Input.Password disabled defaultValue="disabled" /></Stack>`} />
    <LiveDemo title="受控密码可见性" code={`function Demo() {
  const [visible, setVisible] = useState(false);
  return <Stack><Input.Password aria-label="受控密码" defaultValue="paper-ink" visibilityToggle={{ visible, onVisibleChange: setVisible }} /><Inline><Switch aria-label="密码可见性" checked={visible} onChange={setVisible} /><span>{visible ? '密码可见' : '密码已隐藏'}</span></Inline></Stack>;
}`} />
    <LiveDemo title="文本域自适应" code={`<Input.TextArea aria-label="自适应简介" placeholder="输入多行内容，高度会随内容变化" allowClear showCount maxLength={120} autoSize={{ minRows: 2, maxRows: 5 }} />`} />
  </div>;
}
