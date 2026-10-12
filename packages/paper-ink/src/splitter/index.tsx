import { Children, Fragment, forwardRef, isValidElement, useEffect, useRef, useState, type CSSProperties, type HTMLAttributes, type PointerEvent as ReactPointerEvent, type ReactElement } from 'react';
import { useTheme } from '../config-provider/index.js';
import { themeVariables } from '../theme/variables.js';
import { ChevronDownIcon } from '../internal/icons.js';
export type SplitterSize = number | `${number}%`;
export interface SplitterPanelProps extends HTMLAttributes<HTMLDivElement> { size?: SplitterSize; defaultSize?: SplitterSize; min?: SplitterSize; max?: SplitterSize; resizable?: boolean; collapsible?: boolean | { start?: boolean; end?: boolean }; }
export interface SplitterProps extends HTMLAttributes<HTMLDivElement> { layout?: 'horizontal' | 'vertical'; onResizeStart?: (sizes: number[]) => void; onResize?: (sizes: number[]) => void; onResizeEnd?: (sizes: number[]) => void; }
const Panel = ({ children }: SplitterPanelProps) => <>{children}</>;
const px = (size: SplitterSize | undefined, total: number, fallback: number) => size === undefined ? fallback : typeof size === 'number' ? Math.max(0, size) : Math.max(0, parseFloat(size) / 100 * total);
function fitSizes(panels: SplitterPanelProps[], total: number, input: number[], keepCollapsed = false): number[] {
  let sizes = input;
  for (let pass = 0; pass < panels.length + 1; pass++) {
    const delta = total - sizes.reduce((a,b) => a+b, 0); if (Math.abs(delta) < .1) break;
    const free = panels.map((_,i) => i).filter(i => panels[i].size === undefined && !(keepCollapsed && sizes[i] === 0) && (delta > 0 ? sizes[i] < px(panels[i].max,total,Infinity) : sizes[i] > px(panels[i].min,total,0)));
    if (!free.length) break;
    sizes = sizes.map((v,i) => free.includes(i) ? Math.min(px(panels[i].max,total,Infinity), Math.max(px(panels[i].min,total,0), v+delta/free.length)) : v);
  }
  return sizes;
}
function initialSizes(panels: SplitterPanelProps[], total: number): number[] {
  const given = panels.map(p => p.size ?? p.defaultSize); const used = given.reduce<number>((sum, s) => sum + px(s, total, 0), 0);
  const rest = Math.max(0, total - used) / Math.max(1, given.filter(s => s === undefined).length);
  const sizes = panels.map((p, i) => Math.min(px(p.max, total, Infinity), Math.max(px(p.min, total, 0), px(given[i], total, rest))));
  return fitSizes(panels,total,sizes);
}
const Root = forwardRef<HTMLDivElement, SplitterProps>(function Splitter({ layout = 'horizontal', onResizeStart, onResize, onResizeEnd, children, className, style, ...rest }, forwardedRef) {
  const theme = useTheme(); const root = useRef<HTMLDivElement|null>(null); const [length, setLength] = useState(0); const [inner, setInner] = useState<number[]|null>(null);
  const entries = Children.toArray(children).filter((child): child is ReactElement<SplitterPanelProps> => isValidElement<SplitterPanelProps>(child) && child.type === Panel);
  const panels = entries.map(child => child.props); const total = Math.max(0, length - Math.max(0, panels.length - 1) * 8);
  const sizes = inner?.length === panels.length ? inner.map((value,i) => panels[i].size === undefined ? value : px(panels[i].size,total,value)) : initialSizes(panels,total);
  const latest = useRef({ sizes, panels, total, onResizeStart, onResize, onResizeEnd }); latest.current = { sizes, panels, total, onResizeStart, onResize, onResizeEnd };
  const cancelDrag = useRef<(() => void)|null>(null); const saved = useRef<Record<number,number>>({});
  useEffect(() => {
    const node = root.current; if (!node) return;
    const update = () => { const rect = node.getBoundingClientRect(); const css = getComputedStyle(node); const edges = layout === 'horizontal' ? ['borderLeftWidth','borderRightWidth','paddingLeft','paddingRight'] : ['borderTopWidth','borderBottomWidth','paddingTop','paddingBottom']; setLength(Math.max(0,(layout === 'horizontal' ? rect.width : rect.height)-edges.reduce((sum,key)=>sum+(parseFloat(css[key as keyof CSSStyleDeclaration] as string)||0),0))); };
    update(); if (typeof ResizeObserver === 'undefined') { window.addEventListener('resize',update); return () => window.removeEventListener('resize',update); }
    const observer = new ResizeObserver(update); observer.observe(node); return () => observer.disconnect();
  }, [layout]);
  const previousTotal = useRef(total);
  useEffect(() => { const previous = previousTotal.current; previousTotal.current = total; if (previous > 0 && total !== previous) setInner(current => current ? fitSizes(panels,total,current.map((value,i) => panels[i]?.size !== undefined ? px(panels[i].size,total,value) : Math.min(px(panels[i]?.max,total,Infinity),Math.max(value === 0 ? 0 : px(panels[i]?.min,total,0),value * total / previous))),true) : null); }, [total]);
  useEffect(() => () => cancelDrag.current?.(), []);
  function changed(index: number, delta: number, base: number[], collapsing?: number) {
    const { panels, total } = latest.current; const sum = base[index] + base[index+1];
    const minA = collapsing === index ? 0 : px(panels[index].min,total,0); const minB = collapsing === index+1 ? 0 : px(panels[index+1].min,total,0);
    const low = Math.max(minA,sum-px(panels[index+1].max,total,Infinity)); const high = Math.min(px(panels[index].max,total,Infinity),sum-minB);
    if (low > high) return base;
    const next = [...base]; next[index] = Math.max(low,Math.min(high,base[index]+delta)); next[index+1] = sum-next[index]; return next;
  }
  function commit(next: number[]) { setInner(next); latest.current.sizes = next; latest.current.onResize?.([...next]); }
  function begin(event: ReactPointerEvent<HTMLDivElement>, index: number) {
    if (event.button !== 0) return; event.preventDefault(); cancelDrag.current?.();
    const base = [...latest.current.sizes]; const start = layout === 'horizontal' ? event.clientX : event.clientY;
    latest.current.onResizeStart?.([...base]); const target = event.currentTarget; const pointer = event.pointerId;
    target.setPointerCapture?.(pointer); const previousSelect = document.body.style.userSelect; document.body.style.userSelect = 'none';
    const move = (e: PointerEvent) => { if(e.pointerId === pointer) commit(changed(index,(layout === 'horizontal' ? e.clientX : e.clientY)-start,base)); };
    const finish = (e?: PointerEvent) => { if(e && e.pointerId !== pointer) return; window.removeEventListener('pointermove',move); window.removeEventListener('pointerup',finish); window.removeEventListener('pointercancel',finish); document.body.style.userSelect = previousSelect; if (target.hasPointerCapture?.(pointer)) target.releasePointerCapture(pointer); cancelDrag.current = null; latest.current.onResizeEnd?.([...latest.current.sizes]); };
    window.addEventListener('pointermove',move); window.addEventListener('pointerup',finish); window.addEventListener('pointercancel',finish); cancelDrag.current = finish;
  }
  function collapse(index:number, side:'start'|'end') {
    const base = [...latest.current.sizes]; const panel = side === 'start' ? index : index+1; const closed = base[panel] === 0;
    const desired = closed ? saved.current[panel] ?? (base[index]+base[index+1])/2 : 0; if (!closed) saved.current[panel] = base[panel];
    const next = changed(index,side === 'start' ? desired-base[index] : base[index+1]-desired,base,closed ? undefined : panel);
    latest.current.onResizeStart?.([...base]); commit(next); latest.current.onResizeEnd?.([...next]);
  }
  return <div {...rest} ref={node => { root.current = node; if (typeof forwardedRef === 'function') forwardedRef(node); else if (forwardedRef) forwardedRef.current = node; }} className={['pi-splitter', `pi-splitter--${layout}`, className].filter(Boolean).join(' ')} style={{ ...themeVariables(theme), ...style }}>
    {entries.map((entry,index) => { const { size, defaultSize, min, max, resizable, collapsible, className: panelClass, style: panelStyle, children: content, ...panelRest } = entry.props;
      const resize = index < panels.length-1 && resizable !== false && panels[index+1].resizable !== false;
      const allowed = (p:SplitterPanelProps, side:'start'|'end') => p.collapsible === true || typeof p.collapsible === 'object' && p.collapsible[side];
      const startCollapse = allowed(entry.props,'end'); const endCollapse = index < panels.length-1 && allowed(panels[index+1],'start');
      const basis:CSSProperties = length ? { flex:`0 0 ${sizes[index]}px` } : { flex: size !== undefined || defaultSize !== undefined ? `0 0 ${typeof (size ?? defaultSize) === 'number' ? `${size ?? defaultSize}px` : size ?? defaultSize}` : '1 1 0' };
      return <Fragment key={entry.key ?? index}><div {...panelRest} className={['pi-splitter__panel',panelClass].filter(Boolean).join(' ')} style={{ ...basis, ...panelStyle }} hidden={length > 0 && sizes[index] === 0}>{content}</div>{index < panels.length-1 && <div className="pi-splitter__bar">
        <div role="separator" aria-label={`调整面板 ${index+1} 和 ${index+2}`} aria-orientation={layout === 'horizontal' ? 'vertical' : 'horizontal'} aria-valuemin={sizes[index] === 0 ? 0 : Math.round(px(min,total,0))} aria-valuemax={Math.round(Math.min(px(max,total,total),sizes[index]+sizes[index+1]-px(panels[index+1].min,total,0)))} aria-valuenow={Math.round(sizes[index])} aria-disabled={!resize || undefined} tabIndex={resize ? 0 : -1} className="pi-splitter__handle" onPointerDown={resize ? e => begin(e,index) : undefined} onKeyDown={e => { if(!resize) return; const backwards = layout === 'horizontal' ? 'ArrowLeft' : 'ArrowUp'; const forwards = layout === 'horizontal' ? 'ArrowRight' : 'ArrowDown'; if(![backwards,forwards,'Home','End'].includes(e.key)) return; e.preventDefault(); const base=[...latest.current.sizes]; const delta=e.key === 'Home' ? -Infinity : e.key === 'End' ? Infinity : (e.key === backwards ? -1:1)*(e.shiftKey ? 40:10); latest.current.onResizeStart?.([...base]); const next=changed(index,delta,base); commit(next); latest.current.onResizeEnd?.([...next]); }} />
        {startCollapse && <button type="button" className="pi-splitter__collapse pi-splitter__collapse--start" aria-label={sizes[index] === 0 ? `展开面板 ${index+1}` : `折叠面板 ${index+1}`} onClick={() => collapse(index,'start')}><ChevronDownIcon /></button>}
        {endCollapse && <button type="button" className="pi-splitter__collapse pi-splitter__collapse--end" aria-label={sizes[index+1] === 0 ? `展开面板 ${index+2}` : `折叠面板 ${index+2}`} onClick={() => collapse(index,'end')}><ChevronDownIcon /></button>}
      </div>}</Fragment>;
    })}
  </div>;
});
export const Splitter = Object.assign(Root,{ Panel });
