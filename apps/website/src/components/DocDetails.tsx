import { useState, type ReactNode } from 'react';

export function DocBoundary({ children }: { children: ReactNode }) {
  return <div className="doc-boundary">{children}</div>;
}
function ImportCode({ title, code }: { title: string; code: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { setCopied(false); }
  }
  return <div className="doc-import-card"><div className="doc-import-header"><strong>{title}</strong><button onClick={copy} type="button" aria-label={`复制${title}`}>{copied ? '已复制' : '复制'}</button></div><pre><code>{code}</code></pre></div>;
}
export function ComponentImport({ name, component }: { name: string; component: string }) {
  return <div className="doc-imports"><ImportCode title="npm 引用" code={`import { ${component} } from 'paper-ink/${name}';\nimport 'paper-ink/${name}/style.css';`} /><ImportCode title="CLI 源码安装" code={`paper-ink add ${name}`} /></div>;
}
