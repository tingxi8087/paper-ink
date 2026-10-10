import { useState } from 'react';
import { Button, ConfigProvider, defaultToken } from 'paper-ink';
const presets = [{ name: '墨黑', tone: defaultToken.color.primary }, { name: '信息蓝', tone: defaultToken.color.info }, { name: '草木绿', tone: defaultToken.color.success }];
export function ThemePage() {
  const [preset, setPreset] = useState(0);
  const [solid, setSolid] = useState(presets[0].tone.solid);
  const [radius, setRadius] = useState(6);
  const [padding, setPadding] = useState(15);
  const [copied, setCopied] = useState(false);
  const theme = { token: { color: { primary: { ...presets[preset].tone, solid } }, radius: { control: radius } }, components: { Button: { paddingInline: padding } } };
  return <><h1>主题实验室</h1>
    <div className="theme-grid"><section className="theme-controls"><h2>全局与组件</h2>
      <fieldset><legend>主色预设</legend><div className="preset-row">{presets.map((p, i) => <button key={p.name} aria-pressed={preset === i} onClick={() => { setPreset(i); setSolid(p.tone.solid); }}><span style={{ background: p.tone.solid }} />{p.name}</button>)}</div></fieldset>
      <label className="control-label">实心背景 <code>color.primary.solid</code><input aria-label="主色" type="color" value={solid} onChange={e => setSolid(e.target.value)} /></label>
      <label className="control-label">全局圆角 <output>{radius}px</output><input aria-label="全局圆角" type="range" min="0" max="24" value={radius} onChange={e => setRadius(Number(e.target.value))} /></label>
      <label className="control-label">按钮横向内边距 <output>{padding}px</output><input aria-label="按钮内边距" type="range" min="4" max="40" value={padding} onChange={e => setPadding(Number(e.target.value))} /></label>
      <p className="small-note">预设同时提供配套状态色。单独选色只覆盖 solid，不会隐式改变 hover、active 或文字色。</p>
    </section><section className="theme-preview"><ConfigProvider theme={theme}><div className="theme-sample"><h3>按钮预览</h3><div className="example-row"><Button type="primary">保存修改</Button><Button>取消</Button><Button type="dashed">添加</Button></div><div className="example-row"><Button type="primary" size="small">Small</Button><Button type="primary" size="large">Large</Button><Button danger>删除</Button></div><Button type="primary" block>继续</Button></div></ConfigProvider></section></div>
    <h2>可复制的配置</h2><div className="config-toolbar"><span>传入 ConfigProvider 的 theme 属性</span><button onClick={async () => { await navigator.clipboard.writeText(JSON.stringify(theme, null, 2)); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>{copied ? '已复制' : '复制配置'}</button><button onClick={() => { setPreset(0); setSolid(presets[0].tone.solid); setRadius(6); setPadding(15); }}>恢复默认</button></div><pre><code>{JSON.stringify(theme, null, 2)}</code></pre>
    <h2>覆盖规则</h2><p>组件显式覆盖 → 全局语义变量 → 内置默认值。改变 Button 的 paddingInline 不会修改其他组件；改变 radius.control 会影响所有消费该变量的控件。</p>
  </>;
}
