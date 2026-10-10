import { useEffect, useState, type ReactNode } from 'react';
const nav = [{ group: '开始', items: [['guide', '快速开始'], ['theme', '主题实验室']] }, { group: '组件', items: [['button', 'Button 按钮'], ['input', 'Input 输入框'], ['modal', 'Modal 对话框'], ['layout', '布局']] }, { group: '组合', items: [['examples', '实际场景']] }];
export function DocLayout({ route, children }: { route: string; children: ReactNode }) {
 const [menu, setMenu] = useState(false);
 useEffect(() => { setMenu(false); window.scrollTo(0, 0); }, [route]);
 return <><header className="site-header"><a href="#/" className="brand"><span className="brand-mark">pi<span>·</span></span><span>paper ink</span></a><div className="header-links"><a href="#/button" className={route === 'button' ? 'selected' : ''}>组件</a><a href="#/theme" className={route === 'theme' ? 'selected' : ''}>主题</a><span className="version">v0.1.0</span><button className="mobile-menu" onClick={() => setMenu(v => !v)} aria-expanded={menu} aria-label="展开导航">☰</button></div></header>
 <div className={`site-body ${route === '' ? 'site-body--home' : ''}`}>
 {route !== '' && <aside className={`sidebar ${menu ? 'sidebar--open' : ''}`}>{nav.map(g => <nav key={g.group} aria-label={g.group}><h2>{g.group}</h2>{g.items.map(([id,label]) => <a key={id} href={`#/${id}`} aria-current={route === id ? 'page' : undefined}>{label}</a>)}</nav>)}</aside>}
 <main className="main-content" key={route}>{children}</main>
 </div></>;
}
