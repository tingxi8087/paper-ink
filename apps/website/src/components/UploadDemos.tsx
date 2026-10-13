import { LiveDemo } from './LiveDemo';

const image = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='160'%3E%3Crect width='240' height='160' fill='%23fafafa'/%3E%3Cpath d='M0 145 65 35 115 110 175 50 240 145' fill='%23171717'/%3E%3C/svg%3E";
// This is intentionally a local, cancellable demonstration, never a network upload.
const simulatedRequest = `function localDemoRequest({ file, signal, onProgress }) {
  return new Promise((resolve, reject) => {
    let percent = 0;
    const abort = () => { clearInterval(timer); reject(new DOMException('已取消', 'AbortError')); };
    const timer = setInterval(() => {
      percent += 10;
      onProgress(percent);
      if (percent >= 100) {
        clearInterval(timer);
        signal.removeEventListener('abort', abort);
        resolve({ response: { demo: true, name: file.name } });
      }
    }, 250);
    signal.addEventListener('abort', abort, { once: true });
    if (signal.aborted) abort();
  });
}`;
function withRequest(body: string) {
  return `function Example() {
${simulatedRequest}
function Demo() {
${body}
}
return <Demo />;
}`;
}
const examples = [
  ['只选择文件', `() => {
  const [count, setCount] = useState(0);
  return <Stack><Upload multiple onChange={info => setCount(info.fileList.length)} /><output>已选 {count} 个文件；此控件不会发送请求。</output></Stack>;
}`],
  ['受控列表与操作类型', `() => {
  const [files, setFiles] = useState([]);
  const [event, setEvent] = useState('尚未操作');
  return <Stack><Upload fileList={files} multiple onChange={info => {
    setFiles(info.fileList);
    setEvent(info.type + '：' + info.files.map(file => file.name).join('、'));
  }} /><output aria-live="polite">{event}</output><Button onClick={() => setFiles([])}>外部清空列表</Button></Stack>;
}`],
  ['单文件替换', `() => {
  const [event, setEvent] = useState('选择新文件可替换旧文件');
  return <Stack><Upload maxCount={1} defaultFileList={[{uid:'original',name:'原附件.txt',status:'done'}]} onChange={info => setEvent(info.type + (info.type === 'replace' ? '，替换了 ' + info.removedFiles[0].name : ''))} /><output>{event}</output></Stack>;
}`],
  ['类型、数量与异步校验', `() => {
  const [rejected, setRejected] = useState('');
  return <Stack><Upload accept=".txt,.md" multiple maxCount={3} validate={async file => {
    await new Promise(resolve => setTimeout(resolve, 150));
    return file.size > 1024 * 100 ? '文件不能超过 100 KB' : undefined;
  }} onReject={items => setRejected(items.map(item => item.file.name + '：' + item.message).join('；'))} /><p>最多 3 个 TXT / Markdown 文件，每个不超过 100 KB。</p><output aria-live="polite">{rejected}</output></Stack>;
}`],
  ['拖拽选择', `<Upload.Dragger multiple maxCount={5}><Stack gap="small"><strong>拖入文件或点击选择</strong><span>最多 5 个文件，仅保存在当前列表</span></Stack></Upload.Dragger>`],
  ['图片列表与远端回填', `<Stack><Upload accept="image/*" listType="picture" multiple defaultFileList={[{uid:'mountain',name:'山水.svg',type:'image/svg+xml',status:'done',url:${JSON.stringify(image)}}]} /><Upload accept="image/*" listType="picture-card" multiple maxCount={4} defaultFileList={[{uid:'cover',name:'封面.svg',type:'image/svg+xml',status:'done',url:${JSON.stringify(image)}}]} /></Stack>`],
  ['自动上传、取消与重试（本地演示）', withRequest(`const upload = useUpload({ request: localDemoRequest, concurrency: 2 });
  return <Stack><Upload {...upload.props} multiple /><p>本地模拟请求，不上传到服务器。最多同时处理 2 个文件，可取消后重试。</p><output>{upload.fileList.filter(file => file.status === 'done').length} 个演示任务已完成</output></Stack>;`)],
  ['手动队列与批量取消（本地演示）', withRequest(`const upload = useUpload({ request: localDemoRequest, autoUpload: false, concurrency: 1 });
  const [finished, setFinished] = useState(false);
  return <Stack><Upload {...upload.props} multiple /><Inline><Button type="primary" onClick={async () => {setFinished(false); await upload.upload(); setFinished(true);}}>开始上传</Button><Button onClick={() => upload.cancel()}>取消全部</Button><Button onClick={() => upload.setFileList([])}>清空队列</Button></Inline><output>{finished ? '本批任务已结束' : '手动开始，逐个处理'}</output><p>本地模拟请求，不上传到服务器；失败或取消后请在对应文件上重试。</p></Stack>;`)],
  ['失败重试（本地演示）', `function Example() {
${simulatedRequest}
function Demo() {
  const attempts = useRef(new Set());
  const upload = useUpload({request: options => {
    if (!attempts.current.has(options.file)) {attempts.current.add(options.file); return Promise.reject(new Error('首次演示失败，请重试'));}
    return localDemoRequest(options);
  }});
  return <Stack><Upload {...upload.props} multiple /><p>本地演示：每个文件首次失败，重试后成功，不上传到服务器。</p></Stack>;
}
return <Demo />;
}`],
  ['自定义入口、隐藏列表与禁用', `() => {
  const ref = useRef(null);
  const [names, setNames] = useState('未选择');
  return <Stack><Upload ref={ref} showUploadList={false} onChange={info => setNames(info.fileList.map(file => file.name).join('、'))}><Button>自定义选择按钮</Button></Upload><Inline><Button onClick={() => ref.current?.open()}>通过 ref 打开</Button><Upload disabled><Button disabled>禁用选择</Button></Upload><Upload status="error" /></Inline><output>{names}</output></Stack>;
}`],
  ['表单绑定与重置', `() => {
  const form = useForm({defaultValues:{attachments:[]}});
  const [saved, setSaved] = useState('');
  return <Form form={form} onSubmit={values => setSaved(values.attachments.map(file => file.name).join('、'))}><Form.Field name="attachments" label="附件" required="请选择附件"><Upload multiple maxCount={3} /></Form.Field><Inline><Button type="primary" htmlType="submit">提交文件名</Button><Button htmlType="reset" onClick={() => setSaved('')}>重置</Button></Inline><output>{saved || '尚未提交；文件随表单收集，不自动上传'}</output></Form>;
}`],
  ['业务预览与删除确认', `() => {
  const [preview, setPreview] = useState('');
  return <Stack><Upload defaultFileList={[{uid:'locked',name:'受保护说明.txt',status:'done'},{uid:'removable',name:'可删除说明.txt',status:'done'}]} onPreview={file => setPreview('业务预览：' + file.name)} onRemove={async file => {await new Promise(resolve => setTimeout(resolve, 150)); return file.uid !== 'locked';}} /><output>{preview || '受保护说明不可删除；onRemove 可异步决定是否移除。'}</output></Stack>;
}`],
] as const;

export function UploadDemos() {
  return <div className="demo-list">{examples.map(([title, code]) => <LiveDemo key={title} title={title} code={code} />)}</div>;
}
