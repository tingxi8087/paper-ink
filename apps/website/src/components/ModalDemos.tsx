import { LiveDemo } from './LiveDemo';
export function ModalDemos() {
  return <div className="demo-list">
    <LiveDemo title="基础弹窗" code={`function Demo() {
  const [open, setOpen] = useState(false);
  return <>
    <Button type="primary" onClick={() => setOpen(true)}>打开基础弹窗</Button>
    <Modal title="基础弹窗" open={open} onCancel={() => setOpen(false)} onOk={() => setOpen(false)}>
      <p>支持 Esc、遮罩关闭和键盘焦点管理。</p>
      <Input aria-label="弹窗内输入" placeholder="试试 Tab 切换焦点" />
    </Modal>
  </>;
}`} />
    <LiveDemo title="异步确认" code={`function Demo() {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  async function save() {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setOpen(false);
    } finally { setSaving(false); }
  }
  return <>
    <Button onClick={() => setOpen(true)}>打开异步确认</Button>
    <Modal title="保存修改" open={open} confirmLoading={saving} onOk={save} onCancel={() => setOpen(false)}>
      <p>本地演示：等待 800ms 后关闭，由调用方管理状态。</p>
    </Modal>
  </>;
}`} />
    <LiveDemo title="自定义页脚" code={`function Demo() {
  const [open, setOpen] = useState(false);
  return <>
    <Button onClick={() => setOpen(true)}>打开详情</Button>
    <Modal title="详情" open={open} centered footer={null} onCancel={() => setOpen(false)}>
      <Input.TextArea aria-label="详情文本" readOnly defaultValue="自定义内容，无默认操作栏。" rows={3} />
    </Modal>
  </>;
}`} />
    <LiveDemo title="主题继承" code={`function Demo() {
  const [open, setOpen] = useState(false);
  return <ConfigProvider theme={{ token: { color: { primary: { solid: '#1677ff', solidHover: '#4096ff', solidActive: '#0958d9' } } }, components: { Modal: { radius: 16 } } }}>
    <Button type="primary" onClick={() => setOpen(true)}>打开主题弹窗</Button>
    <Modal title="主题继承" open={open} onOk={() => setOpen(false)} onCancel={() => setOpen(false)}>
      <Input placeholder="Portal 内也继承主题" />
    </Modal>
  </ConfigProvider>;
}`} />
  </div>;
}
