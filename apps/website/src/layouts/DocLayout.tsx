import { useEffect, useState, type ReactNode } from 'react';
import { Menu, type MenuItem } from 'paper-ink';
import { DocSearch, SidebarSearch } from '../components/DocSearch';
import { documentationGroups, documentation, searchDocumentation } from '../data/documentation';
import '../components/search.css';
import { GitHubLink } from '../components/GitHubLink';

export function DocLayout({ route, children }: { route: string; children: ReactNode }) {
 const standalone = route === '' || route === 'showcase';
 const [menu, setMenu] = useState(false);
 const [query, setQuery] = useState('');
 useEffect(() => { setMenu(false); setQuery(''); window.scrollTo(0, 0); }, [route]);
 useEffect(() => {
   const entry = documentation.find(item => item.route === route);
   const match = entry?.label.match(/^([A-Za-z][A-Za-z0-9.]*) (.+)$/);
   const label = match && /[\u4e00-\u9fff]/.test(match[2]) ? `${match[2]} ${match[1]}` : entry?.label;
   document.title = route === '' ? 'Paper Ink - 水墨风格的 React 组件库' : `${label ?? '页面未找到'} - Paper Ink`;
 }, [route]);
 const matches = new Set(searchDocumentation(query).map(entry => entry.route));
 const navigationItems: MenuItem[] = documentationGroups.flatMap(group => {
   const children = group.items.filter(([id]) => matches.has(id)).map(([id, label]) => ({ key:id, label, href:`#/${id}` }));
   return children.length ? [{ key:`group-${group.group}`, type:'group' as const, label:group.group, children }] : [];
 });
 return <div className="site-shell"><header className="site-header"><a href="#/" className="brand"><img className="brand-mark" src={`${import.meta.env.BASE_URL}favicon.svg`} width={28} height={28} alt="" aria-hidden="true" /><span>paper ink</span></a><div className="header-links"><DocSearch /><a href="#/showcase" className={route === 'showcase' ? 'selected' : ''}>演示</a><a href="#/button" className={route === 'button' ? 'selected' : ''}>组件</a><a href="#/theme" className={route === 'theme' ? 'selected' : ''}>主题</a><GitHubLink /><span className="version">v0.1.0</span>{!standalone && <button className="mobile-menu" onClick={() => setMenu(value => !value)} aria-expanded={menu} aria-label="展开导航"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg></button>}</div></header>
 <div className={`site-body ${standalone ? 'site-body--home' : ''}`}>
 {!standalone && <aside className={`sidebar ${menu ? 'sidebar--open' : ''}`}><SidebarSearch value={query} onChange={setQuery} /><div className="doc-navigation">{navigationItems.length ? <Menu aria-label="文档导航" items={navigationItems} selectedKeys={[route]} /> : <p className="doc-sidebar-empty" role="status">没有匹配的组件</p>}</div></aside>}
 <main className="main-content" key={route}>{children}</main>
 </div></div>;
}
