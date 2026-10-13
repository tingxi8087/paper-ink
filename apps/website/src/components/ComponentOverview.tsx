import dayjs from 'dayjs';
import { Button, Input, Select, DatePicker, Checkbox, Radio, Switch, Tag, Badge, Tabs, Table, Pagination, Card, Avatar, Steps, Progress, Rate, Slider, Timeline, Alert, Segmented, Modal, ConfigProvider } from 'paper-ink';
import './component-overview.css';

const projects = [
  { id: 1, name: '留白设计系统', owner: '林墨', status: '进行中' },
  { id: 2, name: '山水视觉档案', owner: '白纸', status: '已完成' },
  { id: 3, name: '日常灵感笔记', owner: '青禾', status: '进行中' },
];
const columns = [
  { dataIndex: 'name' as const, title: '项目名称' },
  { dataIndex: 'owner' as const, title: '负责人', width: 76 },
  { dataIndex: 'status' as const, title: '状态', width: 90, render: (value: string) => <Tag color={value === '已完成' ? 'success' : 'default'}>{value}</Tag> },
];
function Actions() {
  return <div className="overview-row"><Button type="primary">主要按钮</Button><Button>默认按钮</Button><Button danger>危险按钮</Button></div>;
}
function Inputs() {
  return <><Input.Search placeholder="寻找一点灵感" enterButton="搜索" /><div className="overview-inputs"><Select defaultValue="ink" options={[{ value: 'ink', label: '水墨风格' }]} /><DatePicker defaultValue={dayjs('2026-10-13')} /></div></>;
}
function Choices() {
  return <><div className="overview-row"><Checkbox defaultChecked>已选中</Checkbox><Checkbox>未选中</Checkbox><Checkbox disabled>已禁用</Checkbox></div><Radio.Group defaultValue="ink" options={[{ value: 'ink', label: '墨黑' }, { value: 'paper', label: '纸白' }, { value: 'gray', label: '淡灰', disabled: true }]} /><div className="overview-row"><Switch defaultChecked /><Switch /><Switch disabled defaultChecked /><span className="overview-caption">清晰的选中状态</span></div></>;
}
function Statuses() {
  return <div className="overview-row"><Tag>默认标签</Tag><Tag color="success" variant="outlined">已完成</Tag><Tag color="warning" variant="outlined">待确认</Tag><Tag color="error" variant="outlined">需修改</Tag></div>;
}
function ProjectTable() {
  return <Table rowKey="id" data={projects} columns={columns} size="small" selection={{ checkedIds: [1], setCheckedIds: () => {} }} />;
}
export function ComponentOverview({ compact = false }: { compact?: boolean }) {
  return <ConfigProvider theme={compact ? { token: { font: { size: 16 } } } : undefined}>
    <main className={`component-overview ${compact ? 'component-overview--compact' : ''}`}>
      {!compact && <header className="overview-heading"><div><img src="/favicon.svg" width="26" height="26" alt="" /><strong>paper ink</strong></div><span>黑白为底，语义为色。</span></header>}
      {compact ? <div className="overview-compact-grid">
        <section className="overview-section overview-compact-wide"><Actions /><Inputs /></section>
        <section className="overview-section"><Choices /><Statuses /></section>
        <section className="overview-section"><Progress type="circle" percent={68} size={94} /><div className="overview-row"><Avatar>墨</Avatar><Badge status="success" text="一切就绪" /></div></section>
        <section className="overview-section overview-compact-wide"><Tabs defaultActiveKey="projects" items={[{ key: 'projects', label: '全部项目', children: <ProjectTable /> }, { key: 'done', label: '已完成' }, { key: 'notes', label: '灵感笔记' }]} /></section>
      </div> : <>
        <div className="overview-grid">
          <div className="overview-column">
            <section className="overview-section"><h2>输入与选择</h2><Actions /><Inputs /><Choices /><Segmented options={['日视图', '周视图', '月视图']} defaultValue="周视图" /></section>
            <Card title="灵感笔记" extra={<Button type="link">查看全部</Button>}><Card.Meta avatar={<Avatar>墨</Avatar>} title="留白之间，交互自明。" description="用更少的装饰，留下更多表达的空间。" /><div className="overview-card-bottom"><Tag>设计</Tag><Tag>水墨</Tag><Rate defaultValue={4.5} allowHalf /></div></Card>
            <section className="overview-section"><h2>时间与记录</h2><Timeline items={[{ children: '确定视觉方向 · 10 月 10 日' }, { children: '整理常用组件 · 10 月 12 日' }, { children: '完成交互预览 · 10 月 13 日', color: 'green' }]} /></section>
          </div>
          <div className="overview-column">
            <section className="overview-section"><h2>信息与列表</h2><Tabs defaultActiveKey="projects" items={[{ key: 'projects', label: '全部项目', children: <ProjectTable /> }, { key: 'done', label: '已完成' }, { key: 'archive', label: '已归档' }]} /><Pagination total={24} pageSize={5} defaultCurrent={1} showSizeChanger={false} showTotal={total => `共 ${total} 个项目`} size="small" /></section>
            <section className="overview-section"><h2>标签与状态</h2><Statuses /><div className="overview-row"><Badge status="success" text="已保存" /><Badge status="processing" text="进行中" /><Badge status="error" text="有待处理" /></div><Alert type="success" showIcon title="所有修改已保存" /><Alert type="info" showIcon title="让内容成为界面的主角" /></section>
            <section className="overview-section"><h2>过程与反馈</h2><Steps current={1} size="small" items={[{ title: '已完成' }, { title: '进行中' }, { title: '待开始' }]} /><Slider defaultValue={42} tooltip={{ open: false }} /><div className="overview-row"><Avatar>林</Avatar><Avatar shape="square">白</Avatar><Avatar style={{ background: '#171717', color: '#fff' }}>墨</Avatar><span className="overview-caption">简洁，也足够灵活。</span></div></section>
          </div>
          <div className="overview-column">
            <section className="overview-section"><h2>弹窗与确认</h2><div className="overview-dialog-stage"><Modal open title="保存这次灵感" mask={false} getContainer={false} width="100%" okText="确认保存" cancelText="取消" focusTriggerAfterClose={false}><p>保留此刻的想法，让下一次创作从这里开始。</p></Modal></div></section>
            <section className="overview-section"><h2>进度与结果</h2><Progress percent={68} /><Progress percent={100} /><Progress percent={42} status="exception" /><div className="overview-circles"><Progress type="circle" percent={68} size={94} /><Progress type="circle" percent={100} size={94} /><Progress type="circle" percent={42} status="exception" size={94} /></div></section>
            <Card title="纸上工作室"><Input placeholder="工作室名称" defaultValue="纸上工作室" /><Input.TextArea defaultValue="用清晰的黑白，记录每一个想法。" rows={2} /><div className="overview-row"><Checkbox defaultChecked>订阅更新</Checkbox><Button type="primary">保存设置</Button></div></Card>
          </div>
        </div>
        <footer className="overview-footer"><span>熟悉的 API · 清晰的主题 · 克制的交互</span><span>组件包 / CLI 源码</span></footer>
      </>}
    </main>
  </ConfigProvider>;
}
