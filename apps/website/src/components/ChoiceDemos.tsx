import { LiveDemo } from './LiveDemo';
export function CheckboxDemos() { return <div className="demo-list">
  <LiveDemo title="多选与半选" code={`function Demo() {
  const [values, setValues] = useState(['React']);
  const options = ['React', 'TypeScript', 'CSS'];
  return <Stack gap={12}>
    <Checkbox checked={values.length === 3} indeterminate={values.length > 0 && values.length < 3} onChange={e => setValues(e.target.checked ? options : [])}>全选</Checkbox>
    <Checkbox.Group options={options} value={values} onChange={setValues} />
    <span>已选：{values.join('、') || '无'}</span>
  </Stack>;
}`} />
  <LiveDemo title="原生表单与禁用" code={`<form><Stack gap={12}><Checkbox name="agreement" defaultChecked>同意协议</Checkbox><Checkbox disabled>暂不可选</Checkbox><Button htmlType="reset">重置</Button></Stack></form>`} />
</div>; }
export function RadioDemos() { return <div className="demo-list">
  <LiveDemo title="单选与键盘" code={`function Demo() {
  const [value, setValue] = useState('个人');
  return <Stack gap={12}><Radio.Group value={value} onChange={e => setValue(e.target.value)} options={['个人', '团队', { label: '企业', value: '企业', disabled: true }]} /><span>账户：{value}</span></Stack>;
}`} />
  <LiveDemo title="按钮式单选" code={`<Radio.Group defaultValue="周" optionType="button" buttonStyle="solid" options={['日', '周', '月']} />`} />
</div>; }
export function SwitchDemos() { return <div className="demo-list">
  <LiveDemo title="开关与文案" code={`function Demo() {
  const [checked, setChecked] = useState(true);
  return <Inline gap={12}><Switch aria-label="通知" checked={checked} onChange={setChecked} checkedChildren="开" unCheckedChildren="关" /><span>{checked ? '接收通知' : '通知已关闭'}</span></Inline>;
}`} />
  <LiveDemo title="尺寸、加载与禁用" code={`<Inline gap={16}><Switch aria-label="小开关" size="small" defaultChecked /><Switch aria-label="加载中" loading defaultChecked /><Switch aria-label="已禁用" disabled /></Inline>`} />
</div>; }
export function TabsDemos() { return <div className="demo-list">
  <LiveDemo title="基础标签页" code={`<Tabs items={[{ key: 'overview', label: '概览', children: '这里是概览内容。' }, { key: 'settings', label: '设置', children: <Input placeholder="切换标签后保留输入" /> }, { key: 'disabled', label: '权限', disabled: true }]} />`} />
  <LiveDemo title="销毁隐藏面板" code={`<Tabs type="card" destroyOnHidden items={[{ key: 'edit', label: '编辑', children: <Input placeholder="切走后会重置输入" /> }, { key: 'preview', label: '预览', children: '返回编辑标签，输入框会重新挂载。' }]} />`} />
</div>; }
