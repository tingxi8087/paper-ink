import { useEffect, useId, useState } from 'react';
import { Button, Checkbox, Input, Select, Switch, Tag } from 'paper-ink';
import { ArrowRightIcon } from '../../../../packages/paper-ink/src/internal/icons';
import './home.css';

// One introduction per page load, including when home is reached from the docs.
let introduced = false;

export function HomePage() {
  const id = useId();
  const [intro, setIntro] = useState(() => !introduced && !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    introduced = true;
    if (!intro) return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finish = () => setIntro(false);
    const preference = () => { if (media.matches) finish(); };
    const timer = window.setTimeout(finish, 2700);
    media.addEventListener('change', preference);
    return () => { window.clearTimeout(timer); media.removeEventListener('change', preference); };
  }, [intro]);

  return <div className="home-page" data-intro={intro ? 'playing' : 'done'} onPointerDown={() => setIntro(false)} onFocusCapture={() => setIntro(false)}>
    {intro && <svg className="home-ink-defs" width="0" height="0" aria-hidden="true" focusable="false">
      <defs><filter id={`${id}-fusion`} x="-25%" y="-30%" width="150%" height="160%" colorInterpolationFilters="sRGB">
        <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="soft">
          <animate attributeName="stdDeviation" values="6;6;0" keyTimes="0;.45;1" dur="2.3s" fill="freeze" />
        </feGaussianBlur>
        <feColorMatrix in="soft" type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 19 -7">
          <animate attributeName="values" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 19 -7;1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 19 -7;1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0" keyTimes="0;.55;1" dur="2.3s" fill="freeze" />
        </feColorMatrix>
      </filter></defs>
    </svg>}
    <div className="home-hero">
    <div className="home-copy">
    <div className="home-title" style={{ filter: intro ? `url(#${id}-fusion)` : undefined }}>
      {intro && <svg className="home-title-ink" viewBox="0 0 300 146" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        {[[40,38,18],[101,56,22],[163,88,19],[225,107,17],[266,35,14]].map(([cx,cy,r],index) =>
          <circle key={index} className="home-title-drop" cx={cx} cy={cy} r={r} style={{ animationDelay: `${index * 65}ms` }} />)}
      </svg>}
      <h1>留白之间，<br />交互自明<span>。</span></h1>
    </div>
    <p className="lead">黑白为底，语义为色。<br />熟悉的 API，更克制的 React 组件。</p>
    <div className="home-actions">
      <div className="home-action-stage">
        {intro && <span className="home-action-pool" aria-hidden="true" />}
        <Button type="primary" size="large" href="#/showcase">查看演示 <ArrowRightIcon /></Button>
      </div>
      <div className="home-action-stage">
        {intro && <span className="home-action-pool" aria-hidden="true" />}
        <Button size="large" href="#/guide">开始使用</Button>
      </div>
    </div>
    </div>
    <section className="home-specimen" aria-label="组件预览">
      <header className="home-sample-heading"><span>组件预览</span><span>试试这些组件</span></header>
      <div className="home-preview-group">
        <h2>按钮 <span>Button</span></h2>
        <div className="home-preview-row"><Button type="primary">主要按钮</Button><Button>默认按钮</Button><Button disabled>禁用按钮</Button></div>
      </div>
      <div className="home-preview-group">
        <h2>输入与选择 <span>Input / Select</span></h2>
        <div className="home-preview-inputs">
          <Input aria-label="输入框预览" placeholder="试着输入一些文字" allowClear />
          <Select aria-label="选择器预览" defaultValue="ink" options={[{ value: 'ink', label: '墨黑' }, { value: 'paper', label: '纸白' }]} />
        </div>
      </div>
      <div className="home-preview-group">
        <h2>选中与状态 <span>Checkbox / Switch / Tag</span></h2>
        <div className="home-preview-row"><Checkbox defaultChecked>复选框</Checkbox><Switch aria-label="开关预览" defaultChecked size="small" /><Tag>默认标签</Tag><Tag color="success" variant="outlined">成功</Tag></div>
      </div>
    </section>
    </div>
    <div className="principles">
      <div><h3>常用 API</h3><p>熟悉的使用习惯，精简的能力边界。</p></div>
      <div><h3>清晰的主题</h3><p>黑白为底，按视觉用途组织主题变量。</p></div>
      <div><h3>npm 与 CLI</h3><p>安装组件包，或把需要的源码带回项目。</p></div>
    </div>
  </div>;
}
