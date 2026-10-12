import { LiveDemo } from '../../../components/LiveDemo';
export function StatisticDemos() {
  return <div className="demo-list">
    <LiveDemo title="指标与金额" code={`<SimpleGrid columns={3} gap={16}><Statistic title="活跃用户" value={12893} /><Statistic title="账户余额" prefix="¥" value={112893.5} precision={2} /><Statistic title="完成率" value={93.2} suffix="%" /></SimpleGrid>`} />
    <LiveDemo title="大数与自定义分隔符" code={`<Stack gap={16}><Statistic title="精确金额字符串" value="12345678901234567890.125" precision={2} /><Statistic title="自定义分隔符" value={-12345.6} groupSeparator=" " decimalSeparator="," precision={2} /></Stack>`} />
    <LiveDemo title="加载与刷新" code={`() => { const [loading,setLoading]=useState(true);return <Stack gap={8}><Statistic title="今日订单" value={376} loading={loading} /><Button onClick={()=>setLoading(v=>!v)}>切换加载</Button></Stack>; }`} />
    <LiveDemo title="格式化与语义样式" code={`<SimpleGrid columns={2}><Statistic title="增长率" value={12.8} suffix="%" styles={{content:{color:'var(--pi-color-success-on-subtle)'}}} /><Statistic title="任务完成" value={42} formatter={value=><span>{value} / 50</span>} /></SimpleGrid>`} />
  </div>;
}
