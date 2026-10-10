import { LiveDemo } from './LiveDemo';
const demos = [
 ['竖向表单', `<Stack gap="large" style={{ width: '100%' }}>
  <Input placeholder="名称" aria-label="布局名称" />
  <Input.TextArea placeholder="描述" />
  <Inline justify="flex-end"><Button>取消</Button><Button type="primary">保存</Button></Inline>
</Stack>`],
 ['工具栏', `<Inline wrap={false} style={{ width: '100%' }}>
  <Input style={{ flex: 1, minWidth: 0 }} placeholder="搜索" />
  <Button type="primary">新建</Button>
</Inline>`],
 ['列比例', `<SimpleGrid columns="100px minmax(0, 1fr)" gap="large" style={{ width: '100%' }}>
  <div style={{ background: '#f5f5f5', padding: 12 }}>侧栏</div>
  <div style={{ background: '#f5f5f5', padding: 12 }}>自适应内容</div>
</SimpleGrid>`],
 ['跨列表单', `<SimpleGrid columns={2} columnGap="large" rowGap="medium" style={{ width: '100%' }}>
  <Input placeholder="名称" />
  <Input placeholder="负责人" />
  <SimpleGrid.Item span="full"><Input.TextArea placeholder="备注，占满一行" /></SimpleGrid.Item>
  <SimpleGrid.Item span="full"><Inline justify="flex-end"><Button type="primary">提交</Button></Inline></SimpleGrid.Item>
</SimpleGrid>`],
 ['自动列数', `<SimpleGrid minChildWidth={160} gap="medium" style={{ width: '100%' }}>
  {[1, 2, 3, 4].map(n => <div key={n} style={{ background: '#f5f5f5', padding: 16 }}>项目 {n}</div>)}
  <SimpleGrid.Item span="full">跟随容器宽度自动调整列数</SimpleGrid.Item>
</SimpleGrid>`],
 ['主题间距', `<ConfigProvider theme={{ token: { spacing: { medium: 20 } } }}>
  <Stack><Button>继承主题间距</Button><Inline gap="small"><Button>4px</Button><Button>4px</Button></Inline></Stack>
</ConfigProvider>`],
];
export function LayoutDemos() { return <div className="demo-list">{demos.map(([title, code]) => <LiveDemo key={title} title={title} code={code} />)}</div>; }
export function LayoutApiTable() {
 const rows = [
  ['gap', '预设 / number / CSS string', 'medium (8px)', '所有容器；small=4px，large=16px'],
  ['align / justify', 'CSS 属性取值', 'Stack: stretch；Inline: center', '对应 align-items / justify-content'],
  ['wrap', 'boolean', 'true', '仅 Inline；是否允许换行'],
  ['columns', 'number / CSS string', '1', '仅 SimpleGrid；等宽列数或列模板'],
  ['minChildWidth', 'number / CSS string', '—', '仅 SimpleGrid；与 columns 互斥，数字单位 px'],
  ['rowGap / columnGap', '同 gap', '继承 gap', '仅 SimpleGrid；单独覆盖纵向 / 横向间距'],
  ['Item.span', "正整数 / 'full'", '1', '自动列数仅支持 1 或 full；固定列数会限制跨列上限'],
  ['className / style / ref', '原生 div 属性', '—', '所有组件及 Item；style 优先于布局属性'],
 ];
 return <div className="table-scroll"><table><thead><tr>{['属性', '类型', '默认值', '说明'].map(v => <th key={v}>{v}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row[0]}>{row.map((cell, i) => <td key={i}>{cell}</td>)}</tr>)}</tbody></table></div>;
}
