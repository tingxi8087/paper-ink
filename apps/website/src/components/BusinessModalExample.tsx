import { forwardRef, useEffect, useId, useImperativeHandle, useRef, useState } from 'react';
import { Button, Input, Modal } from 'paper-ink';
interface EditorConfig { name: string; onSuccess?: (name: string) => void }
interface EditorHandle { open: (config: EditorConfig) => void }
const WorkspaceEditor = forwardRef<EditorHandle>(function WorkspaceEditor(_, ref) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const session = useRef(0);
  const config = useRef<EditorConfig | null>(null);
  useEffect(() => () => { session.current += 1; }, []);
  const form = useRef<HTMLFormElement>(null);
  const formId = useId();
  useImperativeHandle(ref, () => ({ open(next) {
    session.current += 1;
    config.current = next;
    setName(next.name);
    setSaving(false);
    setOpen(true);
  } }), []);
  const close = () => { session.current += 1; setOpen(false); };
  async function save() {
    const revision = session.current;
    const nextName = name.trim();
    if (!nextName || saving) return;
    setSaving(true);
    // Local demo only. Business requests belong in this component or its hook.
    await new Promise(resolve => setTimeout(resolve, 800));
    if (session.current !== revision) return;
    setSaving(false);
    setOpen(false);
    config.current?.onSuccess?.(nextName);
  }
  return <Modal title="编辑工作空间" open={open} confirmLoading={saving} onCancel={close} onOk={() => form.current?.requestSubmit()} destroyOnHidden>
    <form ref={form} id={formId} onSubmit={e => { e.preventDefault(); void save(); }}>
      <label htmlFor={`${formId}-name`}>名称</label>
      <Input id={`${formId}-name`} value={name} onChange={e => setName(e.target.value)} required disabled={saving} style={{ marginTop: 8 }} />
    </form>
  </Modal>;
});
export function BusinessModalExample() {
  const editor = useRef<EditorHandle>(null);
  const [name, setName] = useState('Paper Ink');
  return <section className="business-modal-example" aria-label="命令式业务弹窗">
    <span role="status">工作空间：{name}（本地演示）</span>
    <Button onClick={() => editor.current?.open({ name, onSuccess: setName })}>编辑工作空间</Button>
    <WorkspaceEditor ref={editor} />
  </section>;
}
