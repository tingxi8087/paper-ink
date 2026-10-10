import { useState } from 'react';
import { Button, Input } from 'paper-ink';
export function ExamplesPage() {
 const [saved, setSaved] = useState(false);
 const [loading, setLoading] = useState(false);
 return <><h1>实际场景</h1>
 <section className="settings-example"><h2>工作空间</h2><form onSubmit={e => { e.preventDefault(); setLoading(true); setSaved(false); setTimeout(() => { setLoading(false); setSaved(true); }, 800); }} onReset={() => setSaved(false)}>
 <label>名称<Input name="name" defaultValue="Paper Ink" required /></label><label>简介<Input.TextArea name="description" defaultValue="用黑白，写下下一步。" /></label>
 <div className="settings-actions"><span role="status">{saved ? '已保存到本次演示' : '本地演示，不连接后端'}</span><Button htmlType="reset">重置</Button><Button type="primary" htmlType="submit" loading={loading}>保存修改</Button></div>
 </form></section></>;
}
