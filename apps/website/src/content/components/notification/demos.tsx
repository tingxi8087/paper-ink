import { LiveDemo } from '../../../components/LiveDemo';
export function NotificationDemos() { return <div className="demo-list">
<LiveDemo title="通知类型" code={`function Demo() {
 const [api, holder] = notification.useNotification();
 return <>{holder}<div className="example-row">{['success','info','warning','error'].map(type => <Button key={type} onClick={() => api[type]({ message: type === 'success' ? '导出完成' : '系统通知', description: '报表已经准备好，可以继续处理下一项任务。' })}>{type}</Button>)}</div></>;
}`} />
<LiveDemo title="位置与手动关闭" code={`function Demo() {
 const [api, holder] = notification.useNotification();
 return <>{holder}<div className="example-row">{['topLeft','topRight','bottomLeft','bottomRight'].map(placement => <Button key={placement} onClick={() => api.open({ key: placement, placement, message: placement, description: '点击关闭按钮手动关闭', duration: 0 })}>{placement}</Button>)}<Button onClick={() => api.destroy()}>关闭全部</Button></div></>;
}`} />
<LiveDemo title="更新与操作" code={`function Demo() {
 const [api, holder] = notification.useNotification({ maxCount: 2 });
 const [closed, setClosed] = useState(false);
 return <>{holder}<div className="example-row"><Button onClick={() => { setClosed(false); api.open({ key: 'job', message: '等待处理', description: '通知保留直到手动关闭', duration: 0, onClose: () => setClosed(true), btn: <Button size="small" onClick={() => api.success({ key: 'job', message: '处理完成', description: '同 key 直接更新', duration: 1, onClose: () => setClosed(true) })}>完成任务</Button> }); }}>显示任务通知</Button><span>{closed ? '通知已关闭' : ''}</span></div></>;
}`} />
<LiveDemo title="继承局部主题" code={`function Demo() {
 function Inner() {
 const [api, holder] = notification.useNotification();
 return <>{holder}<Button onClick={() => api.info({ message: '局部主题', description: 'holder 继承 ConfigProvider 的主题变量', duration: 0 })}>主题通知</Button></>;
 }
 return <ConfigProvider theme={{ token: { radius: { control: 12 } } }}><Inner /></ConfigProvider>;
}`} />
</div>; }
