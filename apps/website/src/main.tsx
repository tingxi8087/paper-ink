import React, { lazy, Suspense, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { DocLayout } from './layouts/DocLayout';
const ButtonDoc = lazy(() => import('./content/components/button/index.mdx')); 
const InputDoc = lazy(() => import('./content/components/input/index.mdx'));
const ModalDoc = lazy(() => import('./content/components/modal/index.mdx'));
import Guide from './content/guides/getting-started.mdx';
import { HomePage } from './pages/HomePage';
import { ThemePage } from './pages/ThemePage';
import { ExamplesPage } from './pages/ExamplesPage';
import '../../../packages/paper-ink/src/styles/theme.css';
import '../../../packages/paper-ink/src/button/style.css';
import '../../../packages/paper-ink/src/input/style.css';
import '../../../packages/paper-ink/src/modal/style.css';
import './style.css';
function App() {
 const [route, setRoute] = useState(window.location.hash.replace(/^#\/?/, ''));
 useEffect(() => { const update = () => setRoute(window.location.hash.replace(/^#\/?/, '')); window.addEventListener('hashchange', update); return () => window.removeEventListener('hashchange', update); }, []);
 const pages: Record<string, React.ReactNode> = { '': <HomePage />, button: <ButtonDoc />, input: <InputDoc />, modal: <ModalDoc />, guide: <Guide />, theme: <ThemePage />, examples: <ExamplesPage /> };
 return <DocLayout route={route}><Suspense fallback={<p role="status">正在载入文档…</p>}>{pages[route] ?? <><h1>页面未找到</h1><a href="#/">回到首页</a></>}</Suspense></DocLayout>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
