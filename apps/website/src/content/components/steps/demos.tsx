import { LiveDemo } from '../../../components/LiveDemo';
const examples = [
['基本步骤', `<Steps current={1} items={[{title:'填写资料',description:'已完成'},{title:'确认信息',description:'正在进行'},{title:'提交成功'}]}/>`],
['点击与业务切换', `() => { const [current,setCurrent]=useState(0); return <Stack><Steps current={current} onChange={setCurrent} items={[{title:'编辑'},{title:'预览'},{title:'发布',disabled:true}]}/><p>当前步骤：{current+1}，发布暂不可用。</p><Button onClick={()=>setCurrent(current===0?1:0)}>切换步骤</Button></Stack>; }`],
['垂直与错误', `<Steps direction="vertical" current={1} status="error" items={[{title:'上传文件',description:'材料已保存'},{title:'校验数据',description:'字段格式不正确，请修改后重试'},{title:'导入完成'}]}/>`],
['紧凑与独立状态', `<Steps size="small" current={2} items={[{title:'创建',status:'finish'},{title:'审核',status:'error',subTitle:'需重试'},{title:'发布'}]}/>`],
['上下标签', `<Steps labelPlacement="vertical" current={1} items={[{title:'草稿',description:'09:00'},{title:'确认',description:'09:20'},{title:'完成'}]}/>`],
['自定义图标与起始序号', `<Steps initial={3} current={4} items={[{title:'上传',icon:<svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor"><path d="M8 12V2m-4 4 4-4 4 4M2 10v4h12v-4"/></svg>},{title:'处理'},{title:'完成'}]}/>`],
] as const;
export function StepsDemos(){return <div className="demo-list">{examples.map(([title,code])=><LiveDemo key={title} title={title} code={code}/>)}</div>;}
