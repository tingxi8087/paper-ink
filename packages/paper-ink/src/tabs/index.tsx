import { forwardRef, useId, useRef, useState, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import { useTheme } from '../config-provider/index.js';
import { themeVariables } from '../theme/variables.js';
export interface TabItem { key: string; label: ReactNode; children?: ReactNode; disabled?: boolean; forceRender?: boolean; destroyOnHidden?: boolean }
export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  items?: TabItem[]; activeKey?: string; defaultActiveKey?: string; onChange?: (activeKey: string) => void;
  destroyOnHidden?: boolean; type?: 'line' | 'card'; size?: 'small' | 'middle' | 'large'; centered?: boolean;
  tabBarExtraContent?: ReactNode | { left?: ReactNode; right?: ReactNode }; tabBarStyle?: CSSProperties;
}
export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs({ items = [], activeKey, defaultActiveKey, onChange, destroyOnHidden = false, type = 'line', size = 'middle', centered = false, tabBarExtraContent, tabBarStyle, className, style, children, ...rest }, ref) {
  const first = items.find(item => !item.disabled)?.key;
  const [local, setLocal] = useState(defaultActiveKey ?? first);
  const selected = activeKey ?? (items.some(item => item.key === local) ? local : first);
  const [visited, setVisited] = useState<string[]>(selected === undefined ? [] : [selected]);
  const [focused, setFocused] = useState<string>(); const nav = useRef<HTMLDivElement>(null); const id = useId(); const theme = useTheme();
  const enabled = items.filter(item => !item.disabled);
  const focusKey = enabled.some(item => item.key === focused) ? focused : enabled.some(item => item.key === selected) ? selected : enabled[0]?.key;
  function select(key: string) { if (items.find(item => item.key === key)?.disabled) return; if (activeKey === undefined) setLocal(key); setVisited(list => list.includes(key) ? list : [...list, key]); if (selected !== key) onChange?.(key); }
  // Track externally controlled selections too, retaining visited panels on later switches.
  if (selected !== undefined && !visited.includes(selected)) setVisited([...visited, selected]);
  const extra = typeof tabBarExtraContent === 'object' && tabBarExtraContent !== null && !('$$typeof' in tabBarExtraContent) && !Array.isArray(tabBarExtraContent) ? tabBarExtraContent as { left?: ReactNode; right?: ReactNode } : { right: tabBarExtraContent as ReactNode };
  return <div {...rest} ref={ref} className={['pi-tabs', `pi-tabs--${type}`, `pi-tabs--${size}`, centered && 'pi-tabs--centered', className].filter(Boolean).join(' ')} style={{ ...themeVariables(theme), ...style }}>
    <div className="pi-tabs__bar" style={tabBarStyle}>{extra.left}<div ref={nav} className="pi-tabs__nav" role="tablist" onKeyDown={event => {
      if (event.key === 'Enter' || event.key === ' ') { if (focusKey !== undefined) { event.preventDefault(); select(focusKey); } return; }
      const index = enabled.findIndex(item => item.key === focused || (focused === undefined && item.key === focusKey)); let next = index;
      if (event.key === 'ArrowRight') next = (index + 1) % enabled.length; else if (event.key === 'ArrowLeft') next = (index - 1 + enabled.length) % enabled.length; else if (event.key === 'Home') next = 0; else if (event.key === 'End') next = enabled.length - 1; else return;
      if (!enabled.length) return; event.preventDefault(); const key = enabled[next].key; setFocused(key); nav.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[items.findIndex(item => item.key === key)]?.focus();
    }}>{items.map((item, index) => <button type="button" role="tab" key={item.key} id={`${id}-tab-${index}`} aria-controls={`${id}-panel-${index}`} aria-selected={item.key === selected} disabled={item.disabled} tabIndex={item.key === focusKey ? 0 : -1} className="pi-tabs__tab" onFocus={() => setFocused(item.key)} onClick={() => select(item.key)}>{item.label}</button>)}</div>{extra.right}</div>
    {items.map((item, index) => {
      const active = item.key === selected; const destroy = item.destroyOnHidden ?? destroyOnHidden;
      if (!active && (destroy || (!item.forceRender && !visited.includes(item.key)))) return null;
      return <div role="tabpanel" id={`${id}-panel-${index}`} aria-labelledby={`${id}-tab-${index}`} tabIndex={0} hidden={!active} key={item.key} className="pi-tabs__panel">{item.children}</div>;
    })}{children}
  </div>;
});
