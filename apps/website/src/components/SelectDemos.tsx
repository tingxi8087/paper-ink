import { LiveDemo } from './LiveDemo';

export function SelectDemos() {
  return <div className="demo-list">
    <LiveDemo title="单选与搜索" code={`function Demo() {
  const [value, setValue] = useState('react');
  return <Select aria-label="框架" value={value} onChange={setValue} showSearch optionFilterProp="label" allowClear placeholder="选择框架" options={[
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue' },
    { value: 'angular', label: 'Angular', disabled: true },
    { value: 'svelte', label: 'Svelte' },
  ]} />;
}`} />
    <LiveDemo title="多选" code={`function Demo() {
  const [value, setValue] = useState(['design']);
  return <Select aria-label="团队能力" mode="multiple" value={value} onChange={setValue} allowClear placeholder="选择团队能力" optionFilterProp="label" options={[
    { value: 'design', label: '设计' },
    { value: 'frontend', label: '前端' },
    { value: 'backend', label: '后端' },
    { value: 'test', label: '测试' },
  ]} />;
}`} />
    <LiveDemo title="自定义标签" code={`<Select aria-label="项目标签" mode="tags" defaultValue={['paper']} allowClear placeholder="输入标签，按回车创建" options={[
  { value: 'paper', label: 'paper' },
  { value: 'ink', label: 'ink' },
]} />`} />
    <LiveDemo title="尺寸与状态" code={`<div className="input-examples">
  <Select size="small" placeholder="Small" options={[{ value: 'one', label: '选项一' }]} />
  <Select placeholder="Middle" options={[{ value: 'one', label: '选项一' }]} />
  <Select size="large" placeholder="Large" options={[{ value: 'one', label: '选项一' }]} />
  <Select status="error" placeholder="错误状态" />
  <Select loading placeholder="加载中" />
  <Select disabled defaultValue="one" options={[{ value: 'one', label: 'Disabled' }]} />
</div>`} />
  </div>;
}
