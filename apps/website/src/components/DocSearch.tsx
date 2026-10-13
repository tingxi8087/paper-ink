import { useEffect, useId, useRef, useState } from 'react';
import { Modal } from 'paper-ink';
import { CloseIcon, SearchIcon } from '../../../../packages/paper-ink/src/internal/icons';
import { searchDocumentation, type DocumentationEntry } from '../data/documentation';

export function SidebarSearch({ value, onChange }: { value: string; onChange: (value: string) => void }) {
 return <div className="doc-sidebar-search"><SearchIcon /><input type="search" aria-label="筛选组件" placeholder="搜索组件…" value={value} onChange={event => onChange(event.target.value)} />{value && <button type="button" aria-label="清空组件筛选" onClick={() => onChange('')}><CloseIcon /></button>}</div>;
}

export function DocSearch() {
 const [open, setOpen] = useState(false);
 const [query, setQuery] = useState('');
 const [active, setActive] = useState(0);
 const input = useRef<HTMLInputElement>(null);
 const listId = useId();
 const shortcut = /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘ K' : 'Ctrl K';
 const results = searchDocumentation(query);
 const show = () => { setQuery(''); setActive(0); setOpen(true); };
 useEffect(() => {
   const keydown = (event: KeyboardEvent) => {
     if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k' && !event.isComposing && !event.repeat) {
       event.preventDefault(); setQuery(''); setActive(0); setOpen(value => !value);
     }
   };
   window.addEventListener('keydown', keydown);
   return () => window.removeEventListener('keydown', keydown);
 }, []);
 useEffect(() => { if (open) { const timer = window.setTimeout(() => input.current?.focus({ preventScroll: true }), 0); return () => window.clearTimeout(timer); } }, [open]);
 useEffect(() => {
   if (open) document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: 'nearest' });
 }, [active, listId, open, query]);
 const navigate = (entry: DocumentationEntry) => { window.location.hash = `#/${entry.route}`; setOpen(false); };
 return <><button type="button" className="doc-search-trigger" aria-label="搜索组件和文档" aria-haspopup="dialog" onClick={show}><SearchIcon /><span>搜索</span><kbd>{shortcut}</kbd></button>
 <Modal open={open} title="搜索组件和文档" footer={null} width={580} rootClassName="doc-search-modal" onCancel={() => setOpen(false)} destroyOnHidden>
   <div className="doc-search-field"><SearchIcon /><input ref={input} role="combobox" aria-label="搜索文档" aria-autocomplete="list" aria-expanded={open} aria-controls={listId} aria-activedescendant={results.length ? `${listId}-${Math.min(active, results.length - 1)}` : undefined} value={query} placeholder="组件名、中文、Hook…" onChange={event => { setQuery(event.target.value); setActive(0); }} onKeyDown={event => {
     if (event.nativeEvent.isComposing || event.keyCode === 229) return;
     if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); if (results.length) setActive(value => (value + (event.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length); }
     if (event.key === 'Enter') { event.preventDefault(); const result = results[Math.min(active, results.length - 1)]; if (result) navigate(result); }
   }} /></div>
   <div id={listId} role="listbox" aria-label="文档搜索结果" className="doc-search-results">{results.map((entry, index) => <div key={entry.route} id={`${listId}-${index}`} role="option" aria-selected={index === active} className="doc-search-result" onMouseEnter={() => setActive(index)} onClick={() => navigate(entry)}><div><strong>{entry.label}</strong><span>{entry.group}</span></div><p>{entry.description}</p></div>)}</div>
   {!results.length && <p className="doc-search-empty" role="status">没有找到匹配的组件或文档</p>}
   <div className="doc-search-hint">↑ ↓ 选择 <span>Enter 打开</span><span>Esc 关闭</span></div>
 </Modal></>;
}
