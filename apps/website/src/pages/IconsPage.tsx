import { useEffect, useRef, useState } from 'react';
import { Button, Input, Pagination, Radio, Slider, Tabs } from 'paper-ink';
import { IconSearch, IconPlus, IconSettings, IconCheck } from 'paper-ink/icons';
import { findIcons, iconCatalog, iconCategories } from './icon-catalog';
import './icons.css';
export function IconsPage() {
  const [category,setCategory]=useState('all');
  const [pageSize,setPageSize]=useState(144);
  const [copied,setCopied]=useState('');
  const copyAttempt=useRef(0);
  useEffect(()=>{if(!copied)return;const timer=setTimeout(()=>setCopied(''),1600);return ()=>clearTimeout(timer);},[copied]);
  const [query,setQuery]=useState('');
  const [variant,setVariant]=useState('all');
  const [page,setPage]=useState(1);
  const [size,setSize]=useState(24);
  const [stroke,setStroke]=useState(2);
  const [guides,setGuides]=useState(true);
  const [selected,setSelected]=useState('IconSearch');
  const [copyMessage,setCopyMessage]=useState('');
  const matches=findIcons(query,variant,category);
  const actualPage=Math.min(page,Math.max(1,Math.ceil(matches.length/pageSize)));
  const code=`import { ${selected} } from 'paper-ink/icons';\n\n<${selected} size={${size}} stroke={${stroke}} />`;
  async function copy(name:string,kind:'jsx'|'import'='jsx'){
    const attempt=++copyAttempt.current;
    setSelected(name);setCopied('');setCopyMessage('');
    const text=kind==='import'?`import { ${name} } from 'paper-ink/icons';`:`<${name} size={${size}} stroke={${stroke}} />`;
    try{
      await navigator.clipboard.writeText(text);
      if(attempt!==copyAttempt.current)return;
      setCopied(name);setCopyMessage(`已复制 ${name} 的${kind==='import'?'导入':'使用'}代码`);
    }catch{if(attempt===copyAttempt.current)setCopyMessage('复制失败，请从下方选取代码');}
  }
  return <div className="icons-page">
    <h1>Icons 图标</h1>
    <p>使用 <a href="https://tabler.io/icons" target="_blank" rel="noopener noreferrer">Tabler Icons</a>，MIT 许可。随 Paper Ink 自动安装，无需额外安装图标包。保留 Tabler 官方组件名称和属性。</p>
    <div className="icons-example"><IconSearch size={20} /><Button type="primary" icon={<IconPlus size={16} />}>新建</Button><Button icon={<IconSettings size={16} />}>设置</Button></div>
    <h2>使用方式</h2>
    <pre><code>{`import { IconSearch, IconPlus } from 'paper-ink/icons';\n\n<IconSearch size={20} stroke={2} />\n<Button icon={<IconPlus size={16} />}>新建</Button>`}</code></pre>
    <p>图标继承文字颜色，支持 size、color、stroke、className、style 和 SVG 属性，无需引入图标 CSS。图标单独从 <code>paper-ink/icons</code> 引入，支持按需打包。</p>
    <h2>图标目录</h2>
    <Tabs className="icons-categories" aria-label="图标分类" activeKey={category} onChange={key=>{setCategory(key);setPage(1);}} items={iconCategories.map(item=>({...item,children:null}))} />
    <div className="icons-controls">
      <Input.Search aria-label="搜索图标" placeholder="搜索英文名称或常用中文，如搜索、设置、文件" value={query} onChange={event=>{setQuery(event.target.value);setPage(1);}} allowClear />
      <Radio.Group aria-label="图标样式" optionType="button" buttonStyle="solid" value={variant} onChange={event=>{setVariant(String(event.target.value));setPage(1);}} options={[{value:'all',label:'全部'},{value:'outline',label:'线框'},{value:'filled',label:'填充'}]} />
    </div>
    <div className="icons-adjustments">
      <label>尺寸 <span>{size}px</span><Slider ariaLabelForHandle="图标尺寸" min={14} max={40} value={size} onChange={value=>setSize(value as number)} /></label>
      <label>线宽 <span>{stroke}</span><Slider ariaLabelForHandle="图标线宽" min={1} max={3} step={0.5} value={stroke} onChange={value=>setStroke(value as number)} /></label>
      <Button aria-pressed={guides} onClick={()=>setGuides(value=>!value)}>{guides?'隐藏辅助线':'显示居中辅助线'}</Button>
    </div>
    <div className="icons-summary" role="status">匹配 {matches.length} / {iconCatalog.length} 个图标组件（含上游别名），点击图标直接复制 JSX。</div>
    <div className="icons-grid" data-guides={guides}>
      {matches.slice((actualPage-1)*pageSize,actualPage*pageSize).map(({name,component:Icon})=><button key={name} className="icons-tile" aria-label={`复制 ${name}`} title={name} aria-pressed={selected===name} onClick={()=>void copy(name)}><span className="icons-stage"><Icon size={size} stroke={stroke} aria-hidden="true" /></span><span className="icons-name">{copied===name?<span className="icons-copied"><IconCheck size={12} aria-hidden="true" />已复制</span>:name}</span></button>)}
    </div>
    {!matches.length&&<p className="icons-empty">没有匹配的图标，试试其他名称。</p>}
    <Pagination aria-label="图标分页" total={matches.length} current={actualPage} pageSize={pageSize} onChange={(next,nextSize)=>{setPage(nextSize===pageSize?next:1);setPageSize(nextSize);}} showSizeChanger pageSizeOptions={[72,144,288]} showLessItems />
    <div className="icons-selected"><strong>{selected}</strong><div className="icons-copy-actions"><Button onClick={()=>void copy(selected,'import')}>复制导入</Button><Button onClick={()=>void copy(selected)}>复制 JSX</Button></div></div>
    <pre aria-label="所选图标使用代码"><code>{code}</code></pre><p role="status">{copyMessage}</p>
    <h2>API</h2><div className="table-scroll"><table><thead><tr><th>属性</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead><tbody>{[
      ['size','number | string','24','宽高，相同尺寸的正方形 SVG'],['color','string','currentColor','继承文字颜色或指定颜色'],['stroke','number | string','2','线框图标的线宽'],['className / style','string / CSSProperties','—','直接作用于 SVG，无额外包装节点'],['ref','SVGSVGElement','—','访问原生 SVG 元素'],['SVG 属性','SVGProps<SVGSVGElement>','—','aria-label、aria-hidden、strokeLinecap 等'],
    ].map(row=><tr key={row[0]}>{row.map((cell,index)=><td key={index}>{index<3?<code>{cell}</code>:cell}</td>)}</tr>)}</tbody></table></div>
    <h2>对齐与使用</h2>
    <p>统一使用 24×24 SVG 画布。在按钮、输入框等容器中，由容器对齐 SVG；单独使用时可用 inline-flex 配合 align-items: center。辅助线用于检查图形的位置，统一画布不意味着每个不对称图形的视觉重心都绝对一致。填充图标的实心轮廓不随 stroke 改变。</p>
    <p>只有图标的按钮请给按钮设置 aria-label；纯装饰图标设置 aria-hidden。完整图标名称也可在 <a href="https://tabler.io/icons" target="_blank" rel="noopener noreferrer">Tabler Icons 官网</a>查阅。</p>
    <h2>源码安装</h2><pre><code>npx @tingxi8087/paper-ink-cli add tabler-icons</code></pre><p>CLI 自动添加所需依赖，从本地 components/paper-ink/icons 引入即可；原有组件内置 SVG 不受影响。</p>
  </div>;
}
