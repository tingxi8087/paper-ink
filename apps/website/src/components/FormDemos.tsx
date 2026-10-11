import { LiveDemo } from './LiveDemo';
function formExample(code: string) { return `function Example() {
${code}
return <Demo />;
}`; }
export function FormDemos() { return <div className="demo-list">
<LiveDemo title="基础表单与提交" code={formExample(`function Demo() {
  const form = useForm({ defaultValues: { name: '', bio: '' } });
  const { submitting, dirty } = useFormState(form);
  const [saved, setSaved] = useState('');
  return <Form form={form} onSubmit={async values => {
    await new Promise(resolve => setTimeout(resolve, 350));
    setSaved(JSON.stringify(values));
  }}>
    <Form.Field name="name" label="姓名" required="请输入姓名"><Input allowClear placeholder="输入姓名" /></Form.Field>
    <Form.Field name="bio" label="简介" help="最多 80 字"><Input.TextArea maxLength={80} showCount /></Form.Field>
    <Inline><Button htmlType="submit" type="primary" loading={submitting}>保存</Button><Button htmlType="reset">重置</Button><span>{dirty ? '已修改' : '未修改'}</span></Inline>
    {saved && <pre aria-label="保存结果">{saved}</pre>}
  </Form>;
}`)} />
<LiveDemo title="不同控件自动绑定" code={formExample(`function Demo() {
  const form = useForm({ defaultValues: { role: 'member', enabled: true, consent: false, count: 1, tags: [], level: 3 } });
  const [saved, setSaved] = useState('');
  return <Form form={form} onSubmit={values => setSaved(JSON.stringify(values))}>
    <SimpleGrid columns={2}>
      <Form.Field name="role" label="角色"><Select options={[{ value: 'member', label: '成员' }, { value: 'admin', label: '管理员' }]} /></Form.Field>
      <Form.Field name="count" label="数量"><InputNumber min={0} /></Form.Field>
      <Form.Field name="enabled" label="启用"><Switch /></Form.Field>
      <Form.Field name="level" label="评分"><Rate /></Form.Field>
    </SimpleGrid>
    <Form.Field name="tags" label="兴趣"><Checkbox.Group options={['设计', '代码', '音乐']} /></Form.Field>
    <Form.Field name="consent"><Checkbox>同意协议</Checkbox></Form.Field>
    <Inline><Button htmlType="submit">读取数据</Button><Button htmlType="reset">重置</Button></Inline>
    {saved && <pre aria-label="控件数据">{saved}</pre>}
  </Form>;
}`)} />
<LiveDemo title="动态字段与暂存恢复" code={formExample(`function Demo() {
  const form = useForm({ defaultValues: { type: 'person', company: '' } });
  const type = useWatch(form, 'type');
  const [saved, setSaved] = useState('');
  return <Form form={form} onSubmit={values => setSaved(JSON.stringify(values))}>
    <Form.Field name="type" label="账号类型"><Radio.Group options={[{ value: 'person', label: '个人' }, { value: 'company', label: '企业' }]} /></Form.Field>
    {type === 'company' && <Form.Field name="company" label="公司名称" required preserve help="切换个人时暂存，不参与提交；切回企业恢复"><Input /></Form.Field>}
    <Button htmlType="submit">提交账号</Button>
    {saved && <pre aria-label="账号数据">{saved}</pre>}
  </Form>;
}`)} />
<LiveDemo title="密码确认与校验依赖" code={formExample(`function Demo() {
  const form = useForm({ defaultValues: { password: '', confirm: '' } });
  const [saved, setSaved] = useState(false);
  return <Form form={form} onSubmit={() => setSaved(true)}>
    <Form.Field name="password" label="密码" required validate={value => value.length < 6 ? '至少 6 位' : undefined}><Input.Password /></Form.Field>
    <Form.Field name="confirm" label="确认密码" required dependencies={['password']} validate={(value, { values }) => value !== values.password ? '两次密码不一致' : undefined}><Input.Password /></Form.Field>
    <Button htmlType="submit">设置密码</Button>{saved && <p role="status">密码已设置</p>}
  </Form>;
}`)} />
<LiveDemo title="异步校验与过期保护" code={formExample(`function Username({ value, onChange, ...props }) {
  const { validating } = useFieldState();
  return <Input {...props} value={value ?? ''} onChange={event => onChange(event.target.value)} suffix={validating ? '检查中…' : null} />;
}
function Demo() {
  const form = useForm({ defaultValues: { username: '' } });
  const { submitting } = useFormState(form);
  const [saved, setSaved] = useState('');
  return <Form form={form} onSubmit={values => setSaved(values.username)}>
    <Form.Field name="username" label="用户名" required validateTrigger="change" help="本地模拟：输入 admin 会报错；校验期间修改会取消本次提交" validate={async (value, { signal }) => {
      await new Promise(resolve => {
        const timer = setTimeout(resolve, 500);
        signal.addEventListener('abort', () => { clearTimeout(timer); resolve(); }, { once: true });
      });
      return value === 'admin' ? '用户名已被使用' : undefined;
    }}><Username /></Form.Field>
    <Button htmlType="submit" loading={submitting}>注册</Button>
    {saved && <p role="status">注册成功：{saved}</p>}
  </Form>;
}`)} />
<LiveDemo title="批量更新与变化旧值" code={formExample(`function Demo() {
  const form = useForm({ defaultValues: { province: '江苏', city: '南京' } });
  const [change, setChange] = useState('尚未变化');
  return <Form form={form} onValuesChange={(changed, values, info) => setChange(JSON.stringify({ changed, values, ...info }, null, 2))}>
    <Form.Field name="province" label="省份"><Input /></Form.Field>
    <Form.Field name="city" label="城市"><Input /></Form.Field>
    <Inline><Button onClick={() => form.patchValues({ province: '浙江', city: '杭州' })}>一次修改两项</Button><Button onClick={() => form.reset()}>恢复初始值</Button></Inline>
    <pre aria-label="变化记录">{change}</pre>
  </Form>;
}`)} />
<LiveDemo title="加载编辑数据与重置基准" code={formExample(`function Demo() {
  const form = useForm({ defaultValues: { title: '', description: '' } });
  const { dirty } = useFormState(form);
  return <Form form={form}>
    <Form.Field name="title" label="标题"><Input /></Form.Field>
    <Form.Field name="description" label="说明"><Input.TextArea /></Form.Field>
    <Inline><Button onClick={() => form.reset({ title: 'Paper Ink', description: '载入的数据成为新基准' })}>载入示例详情</Button><Button htmlType="reset">恢复基准</Button><span>{dirty ? '有未保存修改' : '与基准一致'}</span></Inline>
  </Form>;
}`)} />
<LiveDemo title="自定义地址对象" code={formExample(`const AddressInput = React.forwardRef(function AddressInput({ value = { province: '', city: '' }, onChange, id, status, disabled, onBlur, ...aria }, ref) {
  const first = useRef(null);
  React.useImperativeHandle(ref, () => ({ focus: () => first.current?.focus() }));
  return <FieldControl id={id} role="group" {...aria} status={status} disabled={disabled} onBlur={onBlur}>
    <Inline wrap={false}>
      <Input aria-describedby={aria['aria-describedby']} ref={first} aria-label="地址省份" disabled={disabled} value={value.province} placeholder="省份" onChange={e => onChange({ ...value, province: e.target.value })} />
      <Input aria-label="地址城市" disabled={disabled} value={value.city} placeholder="城市" onChange={e => onChange({ ...value, city: e.target.value })} />
    </Inline>
  </FieldControl>;
});
function Demo() {
  const form = useForm({ defaultValues: { address: { province: '', city: '' } } });
  const [saved, setSaved] = useState('');
  return <Form form={form} onSubmit={values => setSaved(JSON.stringify(values))}>
    <Form.Field name="address" label="地址" validate={value => !value.province || !value.city ? '请填写完整地址' : undefined}><AddressInput /></Form.Field>
    <Button htmlType="submit">保存地址</Button>{saved && <pre aria-label="地址数据">{saved}</pre>}
  </Form>;
}`)} />
<LiveDemo title="自定义联系人数组" code={formExample(`const ContactsInput = React.forwardRef(function ContactsInput({ value = [], onChange, id, status, disabled, onBlur, ...aria }, ref) {
  const serial = useRef(1);
  const first = useRef(null);
  React.useImperativeHandle(ref, () => ({ focus: () => first.current?.focus() }));
  return <FieldControl id={id} role="group" {...aria} status={status} disabled={disabled} onBlur={onBlur}>
    <Stack>
      {value.map((item, index) => <Inline key={item.id} wrap={false}>
        <Input aria-describedby={aria['aria-describedby']} ref={index === 0 ? first : undefined} aria-label={'联系人姓名 ' + item.id} disabled={disabled} placeholder="姓名" value={item.name} onChange={e => onChange(value.map(entry => entry.id === item.id ? { ...entry, name: e.target.value } : entry))} />
        <Button disabled={disabled || index === 0} onClick={() => { const next = [...value]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; onChange(next); }}>上移</Button>
        <Button disabled={disabled} onClick={() => onChange(value.filter(entry => entry.id !== item.id))}>删除</Button>
      </Inline>)}
      <Button disabled={disabled} ref={value.length ? undefined : first} onClick={() => onChange([...value, { id: 'contact-' + serial.current++, name: '' }])}>添加联系人</Button>
    </Stack>
  </FieldControl>;
});
function Demo() {
  const form = useForm({ defaultValues: { contacts: [] } });
  const [saved, setSaved] = useState('');
  return <Form form={form} onSubmit={values => setSaved(JSON.stringify(values))}>
    <Form.Field name="contacts" label="联系人" required="至少添加一个联系人" validate={value => value.some(item => !item.name.trim()) ? '请填写每位联系人的姓名' : undefined}><ContactsInput /></Form.Field>
    <Inline><Button htmlType="submit">保存联系人</Button><Button htmlType="reset">清空</Button></Inline>
    {saved && <pre aria-label="联系人数据">{saved}</pre>}
  </Form>;
}`)} />
<LiveDemo title="渲染函数与第三方事件" code={formExample(`function Demo() {
  const form = useForm({ defaultValues: { title: '' } });
  const [saved, setSaved] = useState('');
  return <Form form={form} onSubmit={values => setSaved(values.title)}>
    <Form.Field name="title" label="标题" required>
      {({ control }) => <Inline><span>文章</span><Input {...control.props} value={control.value} onChange={e => control.setValue(e.target.value)} /></Inline>}
    </Form.Field>
    <Button htmlType="submit">保存标题</Button>{saved && <p role="status">标题：{saved}</p>}
  </Form>;
}`)} />
<LiveDemo title="自定义绑定协议与禁用" code={formExample(`const Toggle = defineFieldBinding(React.forwardRef(function Toggle({ selected, onSelect, status, ...props }, ref) {
  return <Button {...props} ref={ref} onClick={() => onSelect(!selected)}>{selected ? '已订阅' : '未订阅'}</Button>;
}), { valueProp: 'selected', changeProp: 'onSelect' });
function Demo() {
  const form = useForm({ defaultValues: { subscribed: false } });
  const [disabled, setDisabled] = useState(false);
  return <><Checkbox checked={disabled} onChange={e => setDisabled(e.target.checked)}>禁用表单</Checkbox>
    <Form form={form} disabled={disabled}><Form.Field name="subscribed" label="订阅"><Toggle /></Form.Field></Form>
  </>;
}`)} />
<LiveDemo title="提交失败保留输入" code={formExample(`function Demo() {
  const form = useForm({ defaultValues: { name: '' } });
  const { submitting } = useFormState(form);
  const [error, setError] = useState('');
  return <Form form={form} onSubmit={async () => {
    setError(''); await new Promise(resolve => setTimeout(resolve, 350));
    throw new Error('本地模拟：保存失败，请稍后重试');
  }} onError={(error, info) => setError(info.phase + ': ' + error.message)}>
    <Form.Field name="name" label="名称" required><Input /></Form.Field>
    <Button htmlType="submit" loading={submitting}>模拟保存</Button>
    {error && <Alert type="error" message={error} />}
  </Form>;
}`)} />
</div>; }
