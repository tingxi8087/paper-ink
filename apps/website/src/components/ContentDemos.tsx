import { LiveDemo } from './LiveDemo';
import { PropsTable } from './ComponentApiTables';
export function TypographyDemos() { return <div className="demo-list">
 <LiveDemo title="文字层级与样式" code={`<Stack><Typography.Title level={4}>清晰的文字层级</Typography.Title><Inline><Typography.Text>默认文字</Typography.Text><Typography.Text type="secondary">辅助文字</Typography.Text><Typography.Text type="success">成功</Typography.Text><Typography.Text type="warning">警告</Typography.Text><Typography.Text type="danger">错误</Typography.Text></Inline><Inline><Typography.Text strong>加粗</Typography.Text><Typography.Text code>npm install paper-ink</Typography.Text><Typography.Text keyboard>⌘ K</Typography.Text><Typography.Text mark>标记</Typography.Text><Typography.Link href="https://ant.design" target="_blank" rel="noreferrer">参考文档</Typography.Link></Inline></Stack>`} />
 <LiveDemo title="复制与省略" code={`<Stack><Typography.Text copyable={{ text: 'npm install paper-ink' }}>安装命令</Typography.Text><Typography.Text ellipsis style={{ width: 160 }}>这是一段超出容器宽度后自动省略的文字。</Typography.Text><Typography.Paragraph ellipsis={{ rows: 2 }} style={{ maxWidth: 240 }}>组件提供一致的文字层级、语义颜色和紧凑间距。较长的说明可以按行数省略，完整内容仍保留在文档中，复制按钮也可以使用单独的文本。</Typography.Paragraph></Stack>`} />
 </div>; }
export function DividerDemos() { return <div className="demo-list">
 <LiveDemo title="分组与标题" code={`<div><Typography.Text>基本信息</Typography.Text><Divider titlePlacement="start" plain>详细设置</Divider><Typography.Text type="secondary">通过分割线划分内容层级</Typography.Text><Divider variant="dashed" size="small" /><Typography.Text>后续内容</Typography.Text></div>`} />
 <LiveDemo title="纵向分割" code={`<Inline gap={0}><Typography.Link href="#/button">按钮</Typography.Link><Divider orientation="vertical" /><Typography.Link href="#/input">输入框</Typography.Link><Divider vertical /><Typography.Link href="#/layout">布局</Typography.Link></Inline>`} />
 </div>; }
export function AvatarDemos() { return <div className="demo-list">
 <LiveDemo title="尺寸与字母" code={`<Inline><Avatar size="small">小</Avatar><Avatar>PI</Avatar><Avatar size="large">PaperInk</Avatar><Avatar shape="square" size={48} style={{ background: '#171717', color: '#fff' }}>墨</Avatar></Inline>`} />
 <LiveDemo title="图片与头像组" code={`<Stack><Avatar src="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2764%27 height=%2764%27%3E%3Crect width=%2764%27 height=%2764%27 fill=%27%23e5e5e5%27/%3E%3Ccircle cx=%2732%27 cy=%2724%27 r=%2712%27 fill=%27%23737373%27/%3E%3Cpath d=%27M8 64a24 24 0 0 1 48 0%27 fill=%27%23737373%27/%3E%3C/svg%3E" alt="示例头像" style={{ background: '#e6f4ff', color: '#0958d9' }}>PI</Avatar><Avatar.Group size="large"><Avatar>A</Avatar><Avatar>B</Avatar><Avatar size="small">C</Avatar></Avatar.Group></Stack>`} />
 </div>; }
export function BadgeDemos() { return <div className="demo-list">
 <LiveDemo title="数量与红点" code={`function Demo() {
 const [count,setCount] = useState(5);
 return <Stack gap="large"><Inline gap="large"><Badge count={count}><Avatar shape="square">PI</Avatar></Badge><Badge count={120}><Avatar shape="square">99</Avatar></Badge><Badge dot><Avatar shape="square">新</Avatar></Badge><Badge count={0} showZero /></Inline><Inline><Button size="small" onClick={() => setCount(Math.max(0,count - 1))}>减少</Button><Button size="small" onClick={() => setCount(count + 1)}>增加</Button></Inline></Stack>;
}`} />
 <LiveDemo title="状态徽标" code={`<Stack><Badge status="success" text="已完成" /><Badge status="processing" text="处理中" /><Badge status="default" text="未开始" /><Badge status="warning" text="待确认" /><Badge status="error" text="失败" /></Stack>`} />
 </div>; }
export function CardDemos() { return <div className="demo-list">
 <LiveDemo title="标题与操作" code={`<Card title="项目概览" extra={<Typography.Link href="#/examples">查看示例</Typography.Link>} size="small"><Descriptions column={1} items={[{ label: '项目', children: 'Paper Ink' }, { label: '状态', children: <Badge status="success" text="开发中" /> }]} /></Card>`} />
 <LiveDemo title="内容与加载状态" code={`function Demo() {
 const [loading,setLoading] = useState(false);
 return <Stack><Inline><Switch checked={loading} onChange={setLoading} aria-label="卡片加载状态" /><span>加载状态</span></Inline><Card loading={loading} actions={[<Button type="text" size="small" onClick={() => message.info('已收藏')}>收藏</Button>, <Typography.Link href="#/theme">主题设置</Typography.Link>]}><Card.Meta avatar={<Avatar>PI</Avatar>} title="Paper Ink" description="轻量、黑白主色、可复制源码的 React 组件库" /></Card></Stack>;
}`} />
 </div>; }
export function DescriptionsDemos() { return <div className="demo-list">
 <LiveDemo title="详情列表" code={`<Descriptions title="项目信息" column={2} items={[{ key: 'name', label: '名称', children: 'Paper Ink' }, { key: 'license', label: '许可证', children: 'MIT' }, { key: 'description', label: '说明', children: '黑白主色的轻量 React 组件库', span: 'filled' }]} />`} />
 <LiveDemo title="边框与纵向排列" code={`<Descriptions bordered layout="vertical" column={2} size="small" items={[{ key: 'owner', label: '负责人', children: 'Tingxi' }, { key: 'status', label: '状态', children: <Badge status="processing" text="开发中" /> }, { key: 'delivery', label: '分发方式', children: 'npm 包与 CLI 源码', span: 2 }]} />`} />
 </div>; }
export function TypographyApiTable() { return <PropsTable rows={[
 ['Text / Title / Paragraph / Link','静态子组件','—','span / h1–h5 / div / a'],['Title.level','1 / 2 / 3 / 4 / 5','1','标题级别'],['type / disabled','secondary / success / warning / danger；boolean','— / false','语义颜色与禁用'],['strong / italic / underline / delete / code / keyboard / mark','boolean','false','文字样式'],['ellipsis','boolean；Title/Paragraph 可用 { rows }','false','CSS 省略，不支持展开'],['copyable','boolean / { text, onCopy, icon, tooltips, tabIndex }','false','text 支持异步函数；icon/tooltips 为二元组'],['className / style / ref','原生属性','—','Link 支持 href / target / rel'],
 ]} />; }
export function DividerApiTable() { return <PropsTable rows={[
 ['orientation / vertical / type','horizontal / vertical；boolean；旧别名','horizontal','orientation 优先，type 次之'],['titlePlacement','start / center / end','center','标题位置'],['orientationMargin','number / string','5%','标题到近侧边缘距离'],['size','small / medium / large','large','上下间距 4 / 8 / 16'],['variant / dashed','solid / dashed / dotted；boolean','solid / false','variant 优先'],['plain','boolean','false','标题使用正常字重'],['className / style / ref','原生 div 属性','—','局部调整'],
 ]} />; }
export function AvatarApiTable() { return <PropsTable rows={[
 ['size','number / small / medium / large','medium','24 / 32 / 40；兼容 default'],['shape','circle / square','circle','头像外形'],['src / srcSet / alt','ReactNode / string / string','—','字符串 src 渲染图片'],['icon / children','ReactNode','—','加载失败依次回退至 icon、children'],['onError','() => boolean | void','—','返回 false 阻止回退'],['gap','number','4','字母自动缩放的两侧留白'],['Group.size / shape','同 Avatar','medium / circle','单个头像可覆盖'],['className / style / ref','原生 span 属性','—','Group 为 div'],
 ]} />; }
export function BadgeApiTable() { return <PropsTable rows={[
 ['count / overflowCount','ReactNode / number','— / 99','超过阈值显示阈值+'],['dot / showZero','boolean','false','红点或显示零值'],['status / text','success / processing / default / error / warning；ReactNode','—','状态点与说明'],['size','small / medium','medium','兼容 default'],['color / offset','CSS color / [x, y]','—','自定义颜色与偏移'],['title','string / null / false','完整 count','false/null 隐藏原生提示'],['className / style / ref','原生 span 属性','—','局部调整'],
 ]} />; }
export function CardApiTable() { return <PropsTable rows={[
 ['title / extra / cover','ReactNode','—','标题、操作与封面'],['actions','ReactNode[]','—','底部操作区域'],['size / type','small / medium；inner','medium / —','兼容 default'],['variant / bordered','outlined / borderless；boolean','outlined / true','variant 优先'],['loading / hoverable','boolean','false','加载占位与悬停阴影'],['styles / classNames','分区对象','—','root / header / title / extra / cover / body / actions'],['headStyle / bodyStyle','CSSProperties','—','旧版别名；styles 优先'],['Meta.avatar / title / description','ReactNode','—','卡片摘要'],['className / style / ref','原生 div 属性','—','局部调整'],
 ]} />; }
export function DescriptionsApiTable() { return <PropsTable rows={[
 ['items','{ key, label, children, span, styles }[]','—','推荐数据形式；兼容 Item 子组件'],['title / extra','ReactNode','—','标题与操作区'],['column','number','3','每行逻辑列数'],['items[].span','number / filled','1','超出剩余列时换行；末项补齐剩余列'],['layout / bordered / colon','horizontal / vertical；boolean','horizontal / false / true','边框或纵向布局不显示冒号'],['size','small / medium / large','large','兼容 middle/default'],['styles','root / header / title / extra / label / content','—','分区样式；条目可覆盖 label/content'],['labelStyle / contentStyle','CSSProperties','—','旧版样式别名'],['className / style / ref','原生 div 属性','—','局部调整'],
 ]} />; }
