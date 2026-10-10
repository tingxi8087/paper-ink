import { LiveDemo } from './LiveDemo';
export function TooltipDemos() { return <div className="demo-list">
  <LiveDemo title="文字提示" code={`<div className="example-row">
  <Tooltip title="保存当前修改"><Button>悬停或聚焦</Button></Tooltip>
  <Tooltip title="请先填写名称"><Button disabled>禁用操作</Button></Tooltip>
</div>`} />
  <LiveDemo title="位置与触发方式" code={`<div className="example-row">
  <Tooltip title="右侧提示" placement="right" trigger="click"><Button>点击查看</Button></Tooltip>
  <Tooltip title="底部左对齐" placement="bottomLeft" color="#1677ff"><Button>自定义颜色</Button></Tooltip>
</div>`} />
  <LiveDemo title="受控提示" code={`function Demo() {
  const [open, setOpen] = useState(false);
  return <Tooltip title="提示由外部状态控制" open={open} onOpenChange={setOpen} trigger="click">
    <Button onClick={() => setOpen(!open)}>切换提示</Button>
  </Tooltip>;
}`} />
</div>; }
export function MessageDemos() { return <div className="demo-list">
  <LiveDemo title="操作反馈" code={`function Demo() {
  const [api, contextHolder] = message.useMessage();
  return <>{contextHolder}<div className="example-row">
    <Button onClick={() => api.success('保存成功')}>成功</Button>
    <Button onClick={() => api.error('保存失败，请重试')}>错误</Button>
    <Button onClick={() => api.warning('还有未保存的修改')}>警告</Button>
    <Button onClick={() => api.info('这是一条提示')}>提示</Button>
  </div></>;
}`} />
  <LiveDemo title="更新加载提示" code={`function Demo() {
  const [api, contextHolder] = message.useMessage();
  const save = () => {
    api.loading({ key: 'save-demo', content: '正在保存…', duration: 0 });
    setTimeout(() => api.success({ key: 'save-demo', content: '保存成功', duration: 2 }), 1000);
  };
  return <>{contextHolder}<Button onClick={save}>模拟保存</Button></>;
}`} />
  <LiveDemo title="手动关闭与完成回调" code={`function Demo() {
  const [api, contextHolder] = message.useMessage({ maxCount: 2 });
  const [closed, setClosed] = useState(false);
  const closeRef = useRef(null);
  return <>{contextHolder}<div className="example-row">
    <Button onClick={() => { setClosed(false); const close = api.info('等待手动关闭', 0); closeRef.current = close; close.then(() => setClosed(true)); }}>显示提示</Button>
    <Button onClick={() => closeRef.current?.()}>关闭提示</Button>
    <span>{closed ? '提示已关闭' : ''}</span>
  </div></>;
}`} />
</div>; }
