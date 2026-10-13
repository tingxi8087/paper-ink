import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Avatar, Badge, Button, Card, Checkbox, DatePicker, Drawer, Dropdown, Form, Input, Modal, Popover, Progress, Radio, Select, Switch, Table, Tabs, Tag, Tooltip, useForm, useMessage, type DateValue, type TableColumn, type TableKey } from 'paper-ink';
import { ArrowRightIcon } from '../../../../packages/paper-ink/src/internal/icons';
import './showcase.css';

function GallerySection({ number, title, subtitle, doc, children, wide }: { number: string; title: string; subtitle: string; doc: string; children: ReactNode; wide?: boolean }) {
  return <section className={`showcase-section${wide ? ' showcase-section--wide' : ''}`} aria-label={title}><header className="showcase-section-head"><div><span className="showcase-number">{number}</span><h2>{title}</h2><p>{subtitle}</p></div><a href={`#/${doc}`} aria-label={`${title}组件文档`}>组件文档 <ArrowRightIcon /></a></header><div className="showcase-section-body">{children}</div></section>;
}
const projects = ['墨色品牌手册', '纸上工作室', '留白交互设计', '山水视觉档案', '黑白组件探索', '雨后书店', '城市手绘地图', '四季明信片'].map((name, index) => ({ id: index + 1, name, owner: ['林', '白', '陈'][index % 3], state: index % 3 === 0 ? '完成' : '进行中' }));
type Project = typeof projects[number];
const columns: TableColumn<Project>[] = [{ dataIndex: 'name', title: '项目', ellipsis: true, minWidth: 160 }, { dataIndex: 'owner', title: '负责人', width: 80, render: value => <Avatar size="small">{value}</Avatar> }, { dataIndex: 'state', title: '状态', width: 92, render: value => <Tag color={value === '完成' ? 'success' : undefined}>{value}</Tag> }];
const studioDefaults = { name: '纸上工作室', email: 'hello@paper.ink', access: 'team', notify: true, description: '用清晰的黑白，记录每一次灵感。' };

export function ShowcasePage() {
  const [message, holder] = useMessage();
  const [percent, setPercent] = useState(0), [running, setRunning] = useState(false);
  const taskTimer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  useEffect(() => () => clearInterval(taskTimer.current), []);
  function startTask() {
    clearInterval(taskTimer.current); setPercent(0); setRunning(true);
    let next = 0;
    taskTimer.current = setInterval(() => { next = Math.min(100, next + 10); setPercent(next); if (next === 100) { clearInterval(taskTimer.current); setRunning(false); } }, 160);
  }
  function resetTask() { clearInterval(taskTimer.current); setRunning(false); setPercent(0); }
  const [name, setName] = useState('纸上计划'), [password, setPassword] = useState('paperink'), [description, setDescription] = useState('让界面留一点呼吸的空间。');
  const [category, setCategory] = useState<string | undefined>('design'), [priority, setPriority] = useState('normal'), [subscribe, setSubscribe] = useState(true), [published, setPublished] = useState(false), [date, setDate] = useState<DateValue>(null);
  const [tab, setTab] = useState('all'), [page, setPage] = useState(1), [checkedIds, setCheckedIds] = useState<TableKey[]>([]);
  const filtered = tab === 'done' ? projects.filter(item => item.state === '完成') : projects;
  const [modal, setModal] = useState(false), [drawer, setDrawer] = useState(false), [feedback, setFeedback] = useState('等待一次交互。');
  const form = useForm({ defaultValues: studioDefaults });
  const [saved, setSaved] = useState<typeof studioDefaults | null>(null), [formNotice, setFormNotice] = useState('修改设置，然后保存到本页。');
  return <div className="showcase-page">
    {holder}
    <header className="showcase-intro"><div><span className="showcase-eyebrow">PAPER INK / COMPONENT GALLERY</span><h1>组件画廊</h1><p>白纸、浓墨与恰到好处的交互。所有内容均为本地演示，不连接后台。</p></div><Button href="#/button">查看组件文档</Button></header>
    <div className="showcase-grid">
      <GallerySection number="01" title="操作与状态" subtitle="一笔落下，界面给出清晰回应。" doc="button">
        <div className="showcase-task-heading"><Badge status={running ? 'processing' : percent === 100 ? 'success' : 'default'} text={running ? '正在整理' : percent === 100 ? '整理完成' : '等待开始'} /><Tag>本地模拟任务</Tag></div>
        <h3>整理灵感档案</h3><p className="showcase-copy">点击开始，体验按钮、状态与进度的协作。</p>
        <Progress aria-label="本地演示任务进度" percent={percent} status={running ? 'active' : undefined} />
        <div className="showcase-row"><Button type="primary" loading={running} onClick={startTask}>{percent === 100 ? '再次整理' : '开始整理'}</Button><Button disabled={percent === 0 && !running} onClick={resetTask}>{running ? '取消整理' : '重置进度'}</Button><Button type="link" href="#/progress">了解进度组件</Button></div>
      </GallerySection>
      <GallerySection number="02" title="输入与选择" subtitle="写下想法，再选择它的方向。" doc="input">
        <div className="showcase-fields"><label>计划名称<Input aria-label="画廊计划名称" value={name} onChange={event => setName(event.target.value)} /></label><label>访问密码<Input.Password aria-label="画廊访问密码" value={password} onChange={event => setPassword(event.target.value)} /></label><label>分类<Select aria-label="画廊分类" value={category} onChange={value => setCategory(value as string | undefined)} options={[{ value: 'design', label: '设计探索' }, { value: 'writing', label: '文字记录' }, { value: 'archive', label: '素材归档' }]} /></label><label>计划日期<DatePicker aria-label="画廊计划日期" value={date} onChange={setDate} /></label><label className="showcase-field-wide">备注<Input.TextArea aria-label="画廊备注" rows={2} value={description} onChange={event => setDescription(event.target.value)} /></label></div>
        <div className="showcase-row"><Radio.Group aria-label="画廊优先级" value={priority} onChange={event => setPriority(String(event.target.value))} options={[{ value: 'normal', label: '常规' }, { value: 'urgent', label: '优先' }]} /><Checkbox checked={subscribe} onChange={event => setSubscribe(event.target.checked)}>订阅更新</Checkbox><span className="showcase-switch"><Switch aria-label="画廊公开计划" checked={published} onChange={setPublished} />公开计划</span></div>
        <p className="showcase-state" aria-live="polite">{name || '未命名计划'} · {category === 'writing' ? '文字记录' : category === 'archive' ? '素材归档' : '设计探索'} · {priority === 'urgent' ? '优先' : '常规'} · {published ? '公开' : '私密'}{date ? ` · ${date.format('YYYY-MM-DD')}` : ''}</p>
      </GallerySection>
      <GallerySection number="03" title="信息与列表" subtitle="用细线组织信息，用浓墨指出重点。" doc="table">
        <Card size="small" className="showcase-profile"><Card.Meta avatar={<Avatar shape="square">纸</Avatar>} title="纸上工作室" description="8 个本地项目 · 一起把灵感变成作品" /></Card>
        <Tabs activeKey={tab} onChange={key => { setTab(key); setPage(1); }} items={[{ key: 'all', label: '全部项目' }, { key: 'done', label: '已完成' }]} />
        <Table<Project> aria-label="画廊项目列表" columns={columns} rowKey="id" size="small" selection={{ checkedIds, setCheckedIds }} source={{ tableData: filtered.slice((page - 1) * 3, page * 3), loading: false, pageNum: page, pageSize: 3, total: filtered.length, setPagination: next => setPage(next) }} pagination={{ showSizeChanger: false, hideOnSinglePage: false, showTotal: total => `共 ${total} 个项目` }} scroll={{ x: 360 }} />
        <p className="showcase-state" aria-live="polite">已选择 {checkedIds.length} 个项目 · 第 {page} 页</p>
      </GallerySection>
      <GallerySection number="04" title="浮层与反馈" subtitle="需要时出现，结束后把空间还给内容。" doc="modal">
        <div className="showcase-overlay-sample"><span className="showcase-stamp" aria-hidden="true">墨</span><div><h3>让操作有回音</h3><p className="showcase-copy">菜单、提示与弹层，延续同一张白纸。</p></div></div>
        <div className="showcase-row"><Button type="primary" onClick={() => setModal(true)}>打开弹窗</Button><Button onClick={() => setDrawer(true)}>打开抽屉</Button><Dropdown trigger={['click']} menu={{ items: [{ key: 'pin', label: '置顶灵感' }, { key: 'archive', label: '归档灵感' }], onClick: ({ key }) => setFeedback(key === 'pin' ? '灵感已置顶（本地演示）' : '灵感已归档（本地演示）') }}><Button>更多操作</Button></Dropdown><Tooltip title="清晰的黑白，让提示也易于阅读。"><Button>查看提示</Button></Tooltip><Popover trigger="click" title="关于这张白纸" content={<p>这里展示的都是 Paper Ink 的真实组件。</p>}><Button>关于风格</Button></Popover><Button onClick={() => { void message.success('操作成功，这是本地消息演示'); setFeedback('已显示成功消息。'); }}>显示消息</Button></div>
        <p className="showcase-state" aria-live="polite">{feedback}</p>
        <Modal title="保存这次灵感" open={modal} onCancel={() => setModal(false)} onOk={() => { setModal(false); setFeedback('灵感已保存（本地演示）'); }}><p>留住这次探索。确认后只会更新本页的演示状态。</p></Modal>
        <Drawer title="灵感笔记" open={drawer} onClose={() => setDrawer(false)} width="min(378px, 100vw)" footer={<Button type="primary" onClick={() => { setDrawer(false); setFeedback('已读完灵感笔记。'); }}>读完了</Button>}><h3>少一点装饰，多一点清晰</h3><p>浓墨用于重点，留白用于呼吸。细边线、明确状态和简洁交互共同构成 Paper Ink。</p></Drawer>
      </GallerySection>
      <GallerySection number="05" title="工作室设置" subtitle="将组件组合起来，完成一次真实的本地表单操作。" doc="form" wide>
        <div className="showcase-settings"><Form form={form} onSubmit={values => { setSaved({ ...values }); setFormNotice('工作室设置已保存到本页。'); void message.success('工作室设置已保存（本地演示）'); }}><div className="showcase-fields"><Form.Field name="name" label="工作室名称" required="请填写工作室名称"><Input aria-label="工作室名称" /></Form.Field><Form.Field name="email" label="联系邮箱" required="请填写联系邮箱" validate={value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? undefined : '请输入有效的邮箱地址'}><Input aria-label="联系邮箱" /></Form.Field><Form.Field name="access" label="可见范围"><Select aria-label="工作室可见范围" options={[{ value: 'team', label: '团队可见' }, { value: 'public', label: '公开展示' }]} /></Form.Field><Form.Field name="notify" label="通知更新"><Switch aria-label="工作室通知更新" /></Form.Field><Form.Field name="description" label="工作室介绍" className="showcase-field-wide"><Input.TextArea aria-label="工作室介绍" rows={2} /></Form.Field></div><div className="showcase-row"><Button htmlType="submit" type="primary">保存工作室设置</Button><Button onClick={() => { form.reset(); setFormNotice('已恢复默认设置；上次保存的记录仍保留。'); }}>重置工作室设置</Button></div><p role="status" className="showcase-state">{formNotice}</p></Form><aside className="showcase-saved" aria-label="已保存的工作室设置"><span className="showcase-eyebrow">LOCAL SNAPSHOT</span><h3>{saved?.name ?? '等待保存'}</h3>{saved ? <><p>{saved.description || '暂无介绍'}</p><dl><dt>联系邮箱</dt><dd>{saved.email}</dd><dt>可见范围</dt><dd>{saved.access === 'team' ? '团队可见' : '公开展示'}</dd><dt>通知更新</dt><dd>{saved.notify ? '开启' : '关闭'}</dd></dl><Tag color="success">已保存 · 本页有效</Tag></> : <p>保存后在这里查看结果。离开页面后演示数据会清空。</p>}</aside></div>
      </GallerySection>
    </div>
    <footer className="showcase-footer"><span>同一套组件，从一笔到一页。</span><a href="#/guide">开始使用 Paper Ink <ArrowRightIcon /></a></footer>
  </div>;
}
