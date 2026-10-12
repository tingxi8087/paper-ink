import { useEffect, useState, type ReactNode } from 'react';
const nav = [
 { group: '开始', items: [['guide', '快速开始'], ['theme', '主题实验室']] },
 { group: '通用与布局', items: [['button', 'Button 按钮'], ['layout', '布局'], ['tabs', 'Tabs 标签页'], ['typography', 'Typography 排版'], ['divider', 'Divider 分割线'], ['breadcrumb', 'Breadcrumb 面包屑'], ['dropdown', 'Dropdown 下拉菜单'], ['pagination', 'Pagination 分页']] },
 { group: '数据录入', items: [['form', 'Form 表单'], ['input', 'Input 输入框'], ['checkbox', 'Checkbox 多选框'], ['radio', 'Radio 单选框'], ['switch', 'Switch 开关'], ['select', 'Select 选择器'], ['input-number', 'InputNumber 数字输入框'], ['date-picker', 'DatePicker 日期选择器'], ['time-picker', 'TimePicker 时间选择器'], ['segmented', 'Segmented 分段控制器'], ['rate', 'Rate 评分']] },
 { group: '展示与反馈', items: [['table', 'Table 表格'], ['tag', 'Tag 标签'], ['empty', 'Empty 空状态'], ['alert', 'Alert 警告提示'], ['spin', 'Spin 加载'], ['tooltip', 'Tooltip 文字提示'], ['message', 'Message 全局提示'], ['modal', 'Modal 对话框'], ['avatar', 'Avatar 头像'], ['badge', 'Badge 徽标'], ['card', 'Card 卡片'], ['collapse', 'Collapse 折叠面板'], ['descriptions', 'Descriptions 描述列表'], ['popover', 'Popover 气泡卡片'], ['popconfirm', 'Popconfirm 气泡确认'], ['drawer', 'Drawer 抽屉'], ['progress', 'Progress 进度条'], ['skeleton', 'Skeleton 骨架屏'], ['timeline', 'Timeline 时间轴'], ['result', 'Result 结果页']] },
 { group: 'Hooks', items: [['hooks', '通用 Hooks']] },
 { group: '组合', items: [['app', 'App 应用入口'], ['examples', '实际场景']] },
];
export function DocLayout({ route, children }: { route: string; children: ReactNode }) {
 const [menu, setMenu] = useState(false);
 useEffect(() => { setMenu(false); window.scrollTo(0, 0); }, [route]);
 return <><header className="site-header"><a href="#/" className="brand"><span className="brand-mark">pi<span>·</span></span><span>paper ink</span></a><div className="header-links"><a href="#/button" className={route === 'button' ? 'selected' : ''}>组件</a><a href="#/theme" className={route === 'theme' ? 'selected' : ''}>主题</a><span className="version">v0.1.0</span><button className="mobile-menu" onClick={() => setMenu(v => !v)} aria-expanded={menu} aria-label="展开导航">☰</button></div></header>
 <div className={`site-body ${route === '' ? 'site-body--home' : ''}`}>
 {route !== '' && <aside className={`sidebar ${menu ? 'sidebar--open' : ''}`}>{nav.map(g => <nav key={g.group} aria-label={g.group}><h2>{g.group}</h2>{g.items.map(([id,label]) => <a key={id} href={`#/${id}`} aria-current={route === id ? 'page' : undefined}>{label}</a>)}</nav>)}</aside>}
 <main className="main-content" key={route}>{children}</main>
 </div></>;
}
