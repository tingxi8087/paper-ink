import { LiveDemo } from './LiveDemo';
export function InputNumberDemos(){return <div className="demo-list">
 <LiveDemo title="步进与范围" code={`function Demo() {
  const [value, setValue] = useState(3);
  return <Inline><InputNumber aria-label="数量" value={value} onChange={setValue} min={0} max={10} /><span>当前：{value ?? '空'}</span></Inline>;
}`} />
 <LiveDemo title="高精度字符串" code={`function Demo() {
  const [value, setValue] = useState('0.000000000000000001');
  return <Stack><InputNumber aria-label="高精度" stringMode value={value} onChange={setValue} step="0.000000000000000001" min="0" style={{ width: 260 }} /><span>{value ?? '空'}</span></Stack>;
}`} />
 <LiveDemo title="格式化与精度" code={`<Inline wrap><InputNumber aria-label="金额" defaultValue={12.5} precision={2} prefix="¥" step={0.1} /><InputNumber aria-label="百分比" defaultValue={35} min={0} max={100} formatter={(value, info) => info.userTyping ? info.input : String(value ?? '') + '%'} parser={text => (text ?? '').replace('%', '')} /></Inline>`} />
 <LiveDemo title="尺寸与状态" code={`<Inline wrap><InputNumber size="small" defaultValue={1} /><InputNumber defaultValue={2} /><InputNumber size="large" defaultValue={3} /><InputNumber status="error" defaultValue={4} /><InputNumber disabled defaultValue={5} /><InputNumber controls={false} defaultValue={6} /></Inline>`} />
 </div>;}
export function AppDemos(){return <div className="demo-list">
 <LiveDemo title="继承应用主题" code={`function Demo() {
 function Actions() {
  const { message, modal } = App.useApp();
  return <Inline><Button onClick={() => message.success('设置已保存')}>保存提示</Button><Button onClick={() => modal.confirm({ title: '清空草稿？', content: '清空后需要重新编辑。', onOk: () => { message.success('草稿已清空'); } })}>确认操作</Button></Inline>;
}
  return <ConfigProvider theme={{ token: { color: { primary: { solid: '#262626', onSolid: '#fff' } } } }}><App><Actions /></App></ConfigProvider>;
}`} />
 <LiveDemo title="异步确认" code={`function Demo() {
 function Actions() {
  const { message, modal } = App.useApp();
  return <Button onClick={async () => {
    const confirmed = await modal.confirm({ title: '提交变更', content: '确认后执行提交。', onOk: () => new Promise(resolve => setTimeout(resolve, 800)) });
    if (confirmed) message.success('提交完成');
  }}>异步提交</Button>;
}
 return <App><Actions /></App>; }`} />
 </div>;}
