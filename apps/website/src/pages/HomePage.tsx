import { useEffect, useId, useState } from 'react';
import { Button } from 'paper-ink';
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
    <section className="home-specimen home-overview" aria-label="组件预览">
      <a className="home-overview-link" href="#/showcase" aria-label="查看组件画廊">
        <img src={`${import.meta.env.BASE_URL}images/components-home.png`} width={1600} height={1260} alt="Paper Ink 中文组件总览：按钮、输入框、日期选择、复选框、开关、标签、进度和表格" fetchPriority="high" />
        <span className="home-overview-caption"><span>中文组件总览</span><span>查看组件画廊 <ArrowRightIcon /></span></span>
      </a>
    </section>
    </div>
    <div className="principles">
      <div><h3>常用 API</h3><p>熟悉的使用习惯，精简的能力边界。</p></div>
      <div><h3>清晰的主题</h3><p>黑白为底，按视觉用途组织主题变量。</p></div>
      <div><h3>npm 与 CLI</h3><p>安装组件包，或把需要的源码带回项目。</p></div>
    </div>
  </div>;
}
