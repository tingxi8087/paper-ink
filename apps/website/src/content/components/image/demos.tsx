import { LiveDemo } from '../../../components/LiveDemo';
const one = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='200'%3E%3Crect width='320' height='200' fill='%23fafafa'/%3E%3Cpath d='M0 170 75 55 135 130 215 25 320 170' fill='%23171717'/%3E%3Ccircle cx='65' cy='35' r='14' fill='%23404040'/%3E%3C/svg%3E";
const two = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='200'%3E%3Crect width='320' height='200' fill='%23171717'/%3E%3Cpath d='M0 165 110 45 200 160 265 95 320 165' fill='%23ffffff'/%3E%3C/svg%3E";
export function ImageDemos() { return <div className="demo-list">
<LiveDemo title="基础图片与预览" code={`<div className="example-row"><Image src="${one}" alt="山水一" width={240} /><Image src="${two}" alt="山水二" width={240} preview={false} /></div>`} />
<LiveDemo title="加载失败回退" code={`<Image src="/missing-photo-for-demo.jpg" fallback="${one}" alt="回退山水" width={240} placeholder={<span>等待图片</span>} />`} />
<LiveDemo title="图片分组" code={`<Image.PreviewGroup><div className="example-row"><Image src="${one}" alt="分组山水一" width={200} /><Image src="${two}" alt="分组山水二" width={200} /></div></Image.PreviewGroup>`} />
<LiveDemo title="受控预览" code={`function Demo() {
 const [open, setOpen] = useState(false);
 return <div className="example-row"><Image src="${two}" alt="受控山水" width={200} preview={{ open, onOpenChange: setOpen, scaleStep: 0.25, maxScale: 3 }} /><Button onClick={() => setOpen(true)}>打开受控预览</Button></div>;
}`} />
<LiveDemo title="独立分组与当前索引" code={`function Demo() {
 const [open, setOpen] = useState(false); const [current, setCurrent] = useState(1);
 return <><Button onClick={() => setOpen(true)}>从第二张打开</Button><Image.PreviewGroup items={[{ src: "${one}", alt: '列表一' }, { src: "${two}", alt: '列表二' }]} preview={{ open, onOpenChange: setOpen, current, onChange: setCurrent }} /><span>当前索引 {current}</span></>;
}`} />
</div>; }
