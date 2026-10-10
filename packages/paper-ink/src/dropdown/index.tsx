import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type MouseEvent, type KeyboardEvent } from 'react';
import { Popover, type PopoverPlacement } from '../popover/index.js';
export interface DropdownMenuItem { key?: string; label?: ReactNode; icon?: ReactNode; disabled?: boolean; danger?: boolean; type?: 'divider' | 'group'; children?: DropdownMenuItem[]; }
export interface DropdownMenuClickInfo { key: string; keyPath: string[]; domEvent: MouseEvent<HTMLElement>; }
export interface DropdownProps {
  children: ReactNode;
  menu?: { items?: DropdownMenuItem[]; onClick?: (info: DropdownMenuClickInfo) => void; selectable?: boolean; selectedKeys?: string[]; defaultSelectedKeys?: string[]; onSelect?: (info: DropdownMenuClickInfo & { selectedKeys: string[] }) => void };
  trigger?: Array<'hover' | 'click'>;
  placement?: Extract<PopoverPlacement, 'top' | 'topLeft' | 'topRight' | 'bottom' | 'bottomLeft' | 'bottomRight'>;
  open?: boolean; defaultOpen?: boolean; disabled?: boolean;
  onOpenChange?: (open: boolean, info: { source: 'trigger' | 'menu' }) => void;
  getPopupContainer?: (trigger: HTMLElement) => HTMLElement;
  destroyOnHidden?: boolean; autoFocus?: boolean;
  popupRender?: (menus: ReactNode) => ReactNode;
  className?: string; style?: CSSProperties; overlayClassName?: string; overlayStyle?: CSSProperties;
}
export function Dropdown({ children, menu, trigger = ['hover'], placement = 'bottomLeft', open: controlled, defaultOpen = false, disabled = false, onOpenChange, autoFocus = false, popupRender, className = '', style, ...props }: DropdownProps) {
  const [internal, setInternal] = useState(defaultOpen), [selected, setSelected] = useState(menu?.defaultSelectedKeys ?? []);
  const root = useRef<HTMLDivElement>(null), anchor = useRef<HTMLSpanElement>(null), focusRequest = useRef<'first' | 'last' | null>(null);
  const open = !disabled && (controlled ?? internal);
  const change = (next: boolean, source: 'trigger' | 'menu' = 'trigger') => { if (disabled) return; if (!next) focusRequest.current = null; if (controlled === undefined) setInternal(next); onOpenChange?.(next, { source }); };
  const buttons = () => Array.from(root.current?.querySelectorAll<HTMLButtonElement>('button[role^="menuitem"]:not(:disabled)') ?? []);
  useEffect(() => {
    if (!open) return;
    if (!autoFocus && !focusRequest.current) return;
    const last = focusRequest.current === 'last';
    const focus = () => { const items = buttons(); (last ? items.at(-1) : items[0])?.focus({ preventScroll: true }); };
    focus(); // Also retry after the popup's positioning effect makes it visible.
    const win = root.current?.ownerDocument.defaultView;
    const panel = root.current?.closest<HTMLElement>('.pi-popover');
    const retry = () => { if (panel && win?.getComputedStyle(panel).visibility !== 'hidden') { focus(); focusRequest.current = null; observer?.disconnect(); } };
    const observer = panel && typeof MutationObserver !== 'undefined' ? new MutationObserver(retry) : null;
    if (panel) observer?.observe(panel, { attributes: true, attributeFilter: ['style', 'hidden'] });
    const frame = win?.requestAnimationFrame(retry);
    return () => { observer?.disconnect(); if (frame !== undefined) win?.cancelAnimationFrame(frame); };
  }, [open, autoFocus]);
  const keydown = (event: KeyboardEvent<HTMLElement>) => {
    if (disabled) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) { focusRequest.current = event.key === 'ArrowUp' ? 'last' : 'first'; change(true); }
      else { const items = buttons(), index = items.indexOf(event.target as HTMLButtonElement); items[index < 0 ? (event.key === 'ArrowDown' ? 0 : items.length - 1) : (index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus({ preventScroll: true }); }
    }
    if (open && (event.key === 'Home' || event.key === 'End')) { event.preventDefault(); (event.key === 'Home' ? buttons()[0] : buttons().at(-1))?.focus({ preventScroll: true }); }
    if (event.key === 'Escape' && open) { event.preventDefault(); event.stopPropagation(); change(false); anchor.current?.querySelector<HTMLElement>('button, a, [tabindex]')?.focus({ preventScroll: true }); }
    if (event.key === 'Tab' && open) change(false);
  };
  const renderItems = (items: DropdownMenuItem[]): ReactNode => items.map((item, index) => {
    const key = item.key ?? String(index);
    if (item.type === 'divider') return <div key={key} role="separator" className="pi-dropdown-divider" />;
    if (item.type === 'group') return <div key={key} role="group" aria-label={typeof item.label === 'string' ? item.label : undefined}><div className="pi-dropdown-group">{item.label}</div>{renderItems(item.children ?? [])}</div>;
    const checked = (menu?.selectedKeys ?? selected).includes(key);
    return <button key={key} type="button" role={menu?.selectable ? 'menuitemradio' : 'menuitem'} aria-checked={menu?.selectable ? checked : undefined} disabled={item.disabled} className={['pi-dropdown-item', item.danger && 'pi-dropdown-item--danger', checked && 'pi-dropdown-item--selected'].filter(Boolean).join(' ')} onClick={event => {
      const info = { key, keyPath: [key], domEvent: event }; menu?.onClick?.(info);
      if (event.defaultPrevented) return;
      if (menu?.selectable) { const selectedKeys = [key]; if (menu.selectedKeys === undefined) setSelected(selectedKeys); menu.onSelect?.({ ...info, selectedKeys }); }
      change(false, 'menu'); anchor.current?.querySelector<HTMLElement>('button, a, [tabindex]')?.focus({ preventScroll: true });
    }}>{item.icon && <span className="pi-dropdown-icon">{item.icon}</span>}{item.label}</button>;
  });
  const menus = <div ref={root} role="menu" className="pi-dropdown-menu" onKeyDown={keydown}>{renderItems(menu?.items ?? [])}</div>;
  return <Popover {...props} placement={placement} trigger={trigger} open={open} onOpenChange={next => change(next)} overlayClassName={`pi-dropdown ${props.overlayClassName ?? ''}`} content={popupRender ? popupRender(menus) : menus}><span ref={anchor} className={`pi-dropdown-trigger ${className}`} style={style} onKeyDown={keydown}>{children}</span></Popover>;
}
