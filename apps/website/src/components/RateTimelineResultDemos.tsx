import { LiveDemo } from './LiveDemo';
export function RateDemos() { return <div className="demo-list">
 <LiveDemo title="评分与清空" code={`function Demo() {
  const [value, setValue] = useState(3);
  return <Stack><Rate aria-label="体验评分" value={value} onChange={setValue} tooltips={['很差', '较差', '一般', '满意', '很满意']} /><span>当前评分：{value}</span></Stack>;
 }`} />
 <LiveDemo title="半星评分" code={`function Demo() {
  const [value, setValue] = useState(2.5);
  return <Stack><Rate aria-label="半星评分" allowHalf value={value} onChange={setValue} /><span>当前评分：{value}</span></Stack>;
 }`} />
 <LiveDemo title="尺寸与只读" code={`<Stack><Rate size="small" defaultValue={2} /><Rate disabled defaultValue={3.5} /><Rate size="large" defaultValue={4} allowClear={false} /></Stack>`} />
 <LiveDemo title="自定义评分符号" code={`<Rate count={4} defaultValue={2} character={({ index }) => <span>{index + 1}</span>} />`} />
 </div>; }
export function TimelineDemos() { return <div className="demo-list">
 <LiveDemo title="项目记录" code={`<Timeline items={[{ content: '创建项目' }, { content: '完成组件设计', color: 'green' }, { content: '开始开发', loading: true }]} />`} />
 <LiveDemo title="标签与交错排列" code={`<Timeline mode="alternate" items={[{ title: '09:00', content: '设计评审通过' }, { title: '10:30', content: '提交组件实现' }, { title: '14:00', content: '完成测试', color: 'green' }, { title: '15:20', content: '发布文档' }]} />`} />
 <LiveDemo title="反转顺序" code={`function Demo() {
  const [reverse, setReverse] = useState(false);
  return <Stack><Timeline reverse={reverse} pending="等待下一次更新" items={[{ key: 'a', title: '10:00', content: '首次提交' }, { key: 'b', title: '12:00', content: '完成更新' }]} /><Button onClick={() => setReverse(!reverse)}>反转顺序</Button></Stack>;
 }`} />
 <LiveDemo title="节点样式与自定义图标" code={`<Timeline variant="filled" items={[{ title: '已完成', content: '上线准备', color: 'green' }, { title: '需关注', content: '等待最终确认', color: 'red', icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 2v8m0 3h.01" /></svg> }]} />`} />
 </div>; }
export function ResultDemos() { return <div className="demo-list">
 <LiveDemo title="操作成功" code={`<Result status="success" title="提交成功" subTitle="项目已保存，可以继续编辑或返回列表。" extra={<><Button type="primary" onClick={() => message.success('继续编辑')}>继续编辑</Button><Button onClick={() => message.info('返回列表')}>返回列表</Button></>} />`} />
 <LiveDemo title="页面不存在" code={`<Result status={404} title="404" subTitle="这个页面不存在，或者已经被移走。" extra={<Button onClick={() => message.info('返回首页')}>返回首页</Button>} />`} />
 <LiveDemo title="操作失败" code={`<Result status="error" title="提交未完成" subTitle="检查以下信息后重试。" extra={<Button type="primary" onClick={() => message.info('重新提交')}>重新提交</Button>}><div>项目名称不能为空；至少选择一名成员。</div></Result>`} />
 <LiveDemo title="自定义结果图标" code={`<Result title="邀请已发送" subTitle="对方接受邀请后，会出现在成员列表中。" icon={<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 6 9 7 9-7" /></svg>} />`} />
 </div>; }
