import { LiveDemo } from './LiveDemo';
import { PropsTable } from './ComponentApiTables';
export function TagDemos() { return <div className="demo-list">
 <LiveDemo title="标签颜色与外观" code={`<Inline><Tag>默认</Tag><Tag color="success">已完成</Tag><Tag color="processing">处理中</Tag><Tag color="warning">待确认</Tag><Tag color="error">失败</Tag><Tag color="primary" variant="solid">重点</Tag><Tag variant="outlined">边框</Tag></Inline>`} />
 <LiveDemo title="关闭与选择" code={`function Demo() {
  const [checked, setChecked] = useState(false);
  return <Inline><Tag closable>可移除</Tag><Tag closeIcon onClose={e => e.preventDefault()}>保留标签</Tag><Tag.CheckableTag checked={checked} onChange={setChecked}>筛选条件</Tag.CheckableTag></Inline>;
}`} />
 </div>; }
export function AlertDemos() { return <div className="demo-list">
 <LiveDemo title="语义提示" code={`<Stack><Alert type="success" title="保存成功" showIcon /><Alert type="info" title="这是本地演示" showIcon /><Alert type="warning" title="还有未保存的修改" showIcon /><Alert type="error" title="请检查输入内容" showIcon /></Stack>`} />
 <LiveDemo title="关闭与操作" code={`<Alert title="当前版本有更新" description="更新前请先保存当前编辑内容。" showIcon closable action={<Button size="small">查看</Button>} />`} />
 <LiveDemo title="横幅" code={`<Alert banner title="系统维护期间部分功能暂不可用" closable />`} />
 </div>; }
export function SpinDemos() { return <div className="demo-list">
 <LiveDemo title="加载尺寸" code={`<Inline gap="large"><Spin size="small" /><Spin /><Spin size="large" description="加载中" /><Spin percent={65} /></Inline>`} />
 <LiveDemo title="区域加载与延迟" code={`function Demo() {
  const [spinning, setSpinning] = useState(false);
  return <Stack><Inline><Switch checked={spinning} onChange={setSpinning} aria-label="区域加载" /><span>延迟 200ms 显示</span></Inline><Spin spinning={spinning} delay={200} description="正在加载…"><Alert title="内容在加载时保留" description="加载期间禁止操作，结束后恢复。" action={<Button size="small">内容操作</Button>} /></Spin></Stack>;
}`} />
 <LiveDemo title="全屏加载" code={`function Demo() {
  const [spinning, setSpinning] = useState(false);
  useEffect(() => { if (!spinning) return; const timer = setTimeout(() => setSpinning(false), 1200); return () => clearTimeout(timer); }, [spinning]);
  return <><Button onClick={() => setSpinning(true)}>演示全屏加载</Button><Spin fullscreen spinning={spinning} description="1.2 秒后结束" /></>;
}`} />
 </div>; }
export function EmptyDemos() { return <div className="demo-list">
 <LiveDemo title="默认空状态" code={`<Empty />`} />
 <LiveDemo title="操作与简洁插图" code={`<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="尚未创建项目"><Button type="primary">创建项目</Button></Empty>`} />
 <LiveDemo title="自定义内容" code={`<Empty image={<span style={{ fontSize: 32 }}>⌕</span>} description="没有匹配的搜索结果" />`} />
 </div>; }
export function TagApiTable() { return <PropsTable rows={[
 ['color','语义色 / 预设色 / CSS string','default','success / processing / warning / error 等'],
 ['variant','filled / solid / outlined','filled','标签外观'],
 ['icon','ReactNode','—','标签图标'],['closable / closeIcon','boolean / ReactNode','false','closeIcon=true 使用默认图标；false/null 隐藏'],
 ['onClose','(event) => void','—','preventDefault() 阻止移除'],['disabled','boolean','false','禁用关闭'],
 ['CheckableTag.checked / onChange','boolean / (checked) => void','false','受控选择状态'],
 ['className / style / ref','原生属性','—','Tag 为 span；CheckableTag 为 button'],
 ]} />; }
export function AlertApiTable() { return <PropsTable rows={[
 ['title / message','ReactNode','—','标题；message 为兼容别名'],['description','ReactNode','—','补充说明'],
 ['type','success / info / warning / error','info','banner 默认 warning'],['showIcon / icon','boolean / ReactNode','false','banner 默认显示'],
 ['closable','boolean / { closeIcon, disabled, onClose, afterClose, aria-* }','false','关闭配置；无关闭动画'],
 ['onClose / afterClose','回调函数','—','兼容旧 API；afterClose 移除后调用一次'],['action','ReactNode','—','操作区域'],['banner / variant','boolean / outlined 或 filled','false / outlined','横幅及外观'],
 ['ErrorBoundary','children / title / description','—','捕获子树渲染错误'],['className / style / ref','原生 div 属性','—','局部扩展'],
 ]} />; }
export function SpinApiTable() { return <PropsTable rows={[
 ['spinning','boolean','true','加载状态'],['delay','number','0','延迟毫秒；短于延迟的加载不显示'],
 ['size','small / medium / large','medium','兼容 default 别名'],['description / tip','ReactNode','—','加载文案，tip 为兼容别名'],
 ['indicator','ReactNode','—','自定义指示器'],['percent',"number / 'auto'",'—','数值显示百分比；auto 为不确定进度'],
 ['fullscreen','boolean','false','全屏 Portal；保持主题'],['children','ReactNode','—','区域内容保留，加载时设置 inert'],['setDefaultIndicator','(ReactNode) => void','—','设置默认指示器'],
 ['className / style / ref','原生 div 属性','—','局部扩展'],
 ]} />; }
export function EmptyApiTable() { return <PropsTable rows={[
 ['image','ReactNode / URL','默认插图','支持 PRESENTED_IMAGE_SIMPLE / DEFAULT'],['description','ReactNode','暂无数据','false/null 隐藏说明'],['children','ReactNode','—','操作区域'],
 ['imageStyle','CSSProperties','—','兼容旧 API'],['classNames / styles','对象','—','root / image / description / footer'],['className / style / ref','原生 div 属性','—','局部扩展'],
 ]} />; }
