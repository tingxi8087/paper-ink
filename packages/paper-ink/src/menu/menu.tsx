import { forwardRef, useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../config-provider/index.js';
import { themeVariables } from '../theme/variables.js';
import { ChevronDownIcon } from '../internal/icons.js';
import { inertAttributes } from '../internal/inert.js';
import { usePresence } from '../internal/motion.js';
import { Tooltip } from '../tooltip/index.js';
import type { MenuItem, MenuProps, MenuSubMenuItem } from './types.js';
// Local declaration keeps CLI source usable without Node type definitions.
// Bundlers may replace NODE_ENV; an unbundled browser safely defaults to warnings.
declare const process: { env: { NODE_ENV?: string } };
const development = (() => { try { return process.env.NODE_ENV !== 'production'; } catch { return true; } })();
const EMPTY_KEYS: readonly string[] = [];
interface Entry { item: MenuItem; parent?: string; path: string[]; root: boolean; disabled: boolean; }
const isParent = (item: MenuItem): item is MenuSubMenuItem => !item.type && Array.isArray(item.children);
const controls = (scope: HTMLElement | null) => Array.from(scope?.querySelectorAll<HTMLElement>('[data-menu-key]') ?? []).filter(node => !node.closest('[aria-hidden="true"]') && node.getAttribute('aria-disabled') !== 'true');
export const Menu = forwardRef<HTMLElement, MenuProps>(function Menu(props, forwardedRef) {
  const { items, mode = 'inline', inlineCollapsed = false, inlineIndent = 16, accordion = false, selectable = true, expandIcon, className = '', style } = props;
  const horizontal = mode === 'horizontal', collapsed = !horizontal && inlineCollapsed;
  const theme = useTheme(), id = useId();
  const [rootNode, setRootNode] = useState<HTMLElement | null>(null);
  const root = useRef<HTMLElement | null>(null), popup = useRef<HTMLDivElement>(null);
  const setRoot = useCallback((node: HTMLElement | null) => { root.current = node; setRootNode(node); if (typeof forwardedRef === 'function') forwardedRef(node); else if (forwardedRef) (forwardedRef as { current: HTMLElement | null }).current = node; }, [forwardedRef]);
  const [selected, setSelected] = useState<readonly string[]>(props.defaultSelectedKeys ?? EMPTY_KEYS);
  const [opened, setOpened] = useState<readonly string[]>(props.defaultOpenKeys ?? EMPTY_KEYS);
  const selectedKeys = 'selectedKeys' in props ? props.selectedKeys ?? EMPTY_KEYS : selected;
  const openKeys = 'openKeys' in props ? props.openKeys ?? EMPTY_KEYS : opened;
  const [collapsedKey, setCollapsedKey] = useState<string>();
  const tree = useMemo(() => {
    const map = new Map<string, Entry>(); let duplicate = false;
    const walk = (nodes: readonly MenuItem[], parent?: string, path: string[] = [], disabled = false) => nodes.forEach(item => {
      if (map.has(item.key)) duplicate = true;
      const denied = disabled || (!item.type && !!item.disabled);
      const nextPath = item.type ? path : [item.key, ...path];
      map.set(item.key, { item, parent, path: nextPath, root: parent === undefined, disabled: denied });
      if (item.type === 'group') walk(item.children, parent, path, denied);
      else if (isParent(item)) walk(item.children, item.key, nextPath, denied);
    }); walk(items);
    if (development && duplicate) console.warn('[Menu] Item keys must be globally unique.');
    return map;
  }, [items]);
  const topParents = [...tree.values()].filter(entry => entry.root && isParent(entry.item) && !entry.disabled).map(entry => entry.item.key);
  const popupKey = horizontal ? topParents.find(key => openKeys.includes(key)) : collapsed && collapsedKey && tree.has(collapsedKey) && !tree.get(collapsedKey)!.disabled ? collapsedKey : undefined;
  const visible = !!popupKey;
  const present = usePresence(visible, 192);
  const lastPopupKey = useRef<string | undefined>(undefined); if (popupKey) lastPopupKey.current = popupKey;
  const renderPopupKey = present ? popupKey ?? lastPopupKey.current : undefined;
  const [position, setPosition] = useState<CSSProperties>({ visibility: 'hidden' });
  const [entered, setEntered] = useState(false);
  const lastFocused = useRef<string | undefined>(undefined);
  const lastFocusedPath = useRef<string[]>([]);
  const restore = useRef<string | undefined>(undefined);
  const pendingFocus = useRef<'first' | 'last' | undefined>(undefined);
  const trigger = (key: string | undefined) => key ? Array.from(root.current?.querySelectorAll<HTMLElement>('[data-menu-key]') ?? []).find(el => el.dataset.menuKey === key) : undefined;
  const focus = (node: HTMLElement | undefined) => { node?.focus(); node?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' }); };
  const emitOpen = (keys: string[]) => { if (!('openKeys' in props)) setOpened(keys); props.onOpenChange?.(keys); };
  const closePopup = (returnFocus = false) => {
    if (!popupKey) return;
    if (returnFocus) restore.current = popupKey;
    if (horizontal) emitOpen(openKeys.filter(key => key !== popupKey)); else setCollapsedKey(undefined);
  };
  const toggle = (key: string, force?: boolean) => {
    const entry = tree.get(key); if (!entry || entry.disabled || !isParent(entry.item)) return;
    if (collapsed && entry.root) { setCollapsedKey(current => force === true ? key : current === key ? undefined : key); return; }
    const nextOpen = force ?? !openKeys.includes(key);
    let next = [...openKeys];
    if (!nextOpen) {
      const scope = horizontal && entry.root ? popup.current : root.current;
      const active = scope?.ownerDocument.activeElement as HTMLElement | null;
      const focused = active?.dataset.menuKey;
      if (focused && tree.get(focused)?.path.slice(1).includes(key)) focus(trigger(key) ?? Array.from(popup.current?.querySelectorAll<HTMLElement>('[data-menu-key]') ?? []).find(el => el.dataset.menuKey === key));
      next = next.filter(value => value !== key);
    } else {
      if (accordion || (horizontal && entry.root)) next = next.filter(value => { const sibling = tree.get(value); return value === key || !sibling || sibling.parent !== entry.parent || !isParent(sibling.item); });
      if (!next.includes(key)) next.push(key);
    }
    emitOpen(next);
  };
  useEffect(() => {
    if (!development) return;
    for (const entry of tree.values()) { if (!entry.item.type && entry.item.title === undefined && typeof entry.item.label !== 'string' && typeof entry.item.label !== 'number' && collapsed) console.warn('[Menu] Complex collapsed labels should provide a text title:', entry.item.key); }
    if (selectedKeys.length > 1) console.warn('[Menu] Only one selected leaf is supported.');
    if (horizontal && topParents.filter(key => openKeys.includes(key)).length > 1) console.warn('[Menu] Horizontal mode supports one root popup.');
    if (accordion) {
      const parents = new Set<string | undefined>();
      for (const key of openKeys) { const entry = tree.get(key); if (!entry || !isParent(entry.item)) continue; if (parents.has(entry.parent)) { console.warn('[Menu] Accordion keys conflict at the same level.'); break; } parents.add(entry.parent); }
    }
  }, [selectedKeys, openKeys, horizontal, accordion, tree, collapsed]);
  useEffect(() => { setCollapsedKey(undefined); pendingFocus.current = undefined; }, [mode, inlineCollapsed]);
  useLayoutEffect(() => {
    if (!visible) { setEntered(false); if (restore.current) { focus(trigger(restore.current)); restore.current = undefined; } return; }
    if (restore.current && restore.current !== popupKey) restore.current = undefined;
    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, [visible, popupKey]);
  useLayoutEffect(() => {
    if (!visible || !popup.current || !popupKey) return;
    const anchor = trigger(popupKey); if (!anchor) return;
    const doc = anchor.ownerDocument, win = doc.defaultView!;
    const update = () => {
      if (!popup.current) return;
      const rect = anchor.getBoundingClientRect(), box = popup.current.getBoundingClientRect();
      let left = horizontal ? rect.left : rect.right + 6;
      let top = horizontal ? rect.bottom + 6 : rect.top;
      if (horizontal && top + box.height > win.innerHeight - 8 && rect.top - box.height - 6 >= 8) top = rect.top - box.height - 6;
      if (!horizontal && left + box.width > win.innerWidth - 8) left = rect.left - box.width - 6;
      const next: CSSProperties = { left: Math.max(8, Math.min(left, win.innerWidth - box.width - 8)), top: Math.max(8, Math.min(top, win.innerHeight - box.height - 8)), visibility: 'visible' };
      setPosition(previous => previous.left === next.left && previous.top === next.top && previous.visibility === next.visibility ? previous : next);
    }; update();
    win.addEventListener('resize', update); doc.addEventListener('scroll', update, true);
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update); observer?.observe(popup.current); observer?.observe(anchor);
    const outside = (event: PointerEvent) => { if (event.target instanceof Node && !root.current?.contains(event.target) && !popup.current?.contains(event.target)) {
      const active = doc.activeElement as HTMLElement | null;
      if (active && popup.current?.contains(active)) active.blur();
      closePopup();
    } };
    doc.addEventListener('pointerdown', outside);
    return () => { observer?.disconnect(); win.removeEventListener('resize', update); doc.removeEventListener('scroll', update, true); doc.removeEventListener('pointerdown', outside); };
  }, [visible, popupKey, items, openKeys, horizontal, rootNode]);
  useLayoutEffect(() => {
    if (!visible || position.visibility !== 'visible' || !popup.current || !pendingFocus.current) return;
    const nodes = controls(popup.current); focus(pendingFocus.current === 'last' ? nodes.at(-1) : nodes[0]); pendingFocus.current = undefined;
  }, [visible, popupKey, position.visibility, rootNode]);
  // Controlled closures and data updates must not leave focus inside an inert subtree.
  useLayoutEffect(() => {
    const active = root.current?.ownerDocument.activeElement as HTMLElement | null;
    if (!active?.dataset.menuKey) {
      if (lastFocused.current && !tree.has(lastFocused.current) && active === root.current?.ownerDocument.body) {
        const nodes = [...controls(root.current), ...controls(popup.current)];
        lastFocused.current = undefined;
        focus(lastFocusedPath.current.map(key => nodes.find(node => node.dataset.menuKey === key)).find(Boolean) ?? nodes[0]);
      }
      return;
    }
    if (tree.get(active.dataset.menuKey)?.disabled) { const nodes = [...controls(root.current), ...controls(popup.current)]; focus(nodes[0]); if (!nodes.length) active.blur(); }
    else if (popup.current?.contains(active) && !visible) focus(trigger(lastPopupKey.current));
    else if (active.closest('[aria-hidden="true"]')) {
      const entry = tree.get(active.dataset.menuKey);
      for (const key of entry?.path.slice(1) ?? []) { const node = trigger(key); if (node && !node.closest('[aria-hidden="true"]')) { focus(node); break; } }
    }
  });
  const activate = (entry: Entry, event: MouseEvent<HTMLElement>) => {
    if (entry.disabled) { event.preventDefault(); return; }
    const info = { key: entry.item.key, keyPath: entry.path, domEvent: event };
    props.onClick?.(info);
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || (!entry.item.type && !isParent(entry.item) && entry.item.target && entry.item.target !== '_self')) return;
    if (selectable && selectedKeys[0] !== entry.item.key) { if (!('selectedKeys' in props)) setSelected([entry.item.key]); props.onSelect?.({ ...info, selectedKeys: [entry.item.key] }); }
    closePopup(event.detail === 0);
  };
  const keyboard = (event: KeyboardEvent<HTMLElement>, entry: Entry, inPopup: boolean) => {
    if (entry.disabled || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.nativeEvent.isComposing) return;
    const key = event.key, top = horizontal && !inPopup;
    const nodes = controls(inPopup ? popup.current : root.current), current = nodes.indexOf(event.currentTarget);
    const parent = isParent(entry.item), popupParent = entry.root && (horizontal || collapsed);
    const open = popupParent ? popupKey === entry.item.key : openKeys.includes(entry.item.key);
    if (key === 'Escape' && visible) { event.preventDefault(); event.stopPropagation(); closePopup(true); return; }
    if (top && (key === 'ArrowDown' || key === 'ArrowUp') && parent || !top && key === 'ArrowRight' && parent) {
      event.preventDefault();
      if (popupParent) { pendingFocus.current = key === 'ArrowUp' ? 'last' : 'first'; if (open) { focus(key === 'ArrowUp' ? controls(popup.current).at(-1) : controls(popup.current)[0]); pendingFocus.current = undefined; } else toggle(entry.item.key, true); }
      else if (!open) toggle(entry.item.key, true); else focus(nodes[current + 1]);
      return;
    }
    if (!top && key === 'ArrowLeft') {
      event.preventDefault(); if (parent && open && !popupParent) toggle(entry.item.key, false); else if (entry.parent) { const parentNode = nodes.find(node => node.dataset.menuKey === entry.parent); if (parentNode) focus(parentNode); else if (inPopup) closePopup(true); else focus(trigger(entry.parent)); } else if (inPopup) closePopup(true); return;
    }
    if (popupParent && (key === 'Enter' || key === ' ')) pendingFocus.current = 'first';
    const next = key === 'Home' ? nodes[0] : key === 'End' ? nodes.at(-1) : key === (top ? 'ArrowRight' : 'ArrowDown') ? nodes[(current + 1) % nodes.length] : key === (top ? 'ArrowLeft' : 'ArrowUp') ? nodes[(current - 1 + nodes.length) % nodes.length] : undefined;
    if (next) { event.preventDefault(); focus(next); }
  };
  const renderItems = (nodes: readonly MenuItem[], depth = 0, inPopup = false, labelledBy?: string) => <ul className="pi-menu__list" aria-labelledby={labelledBy}>{nodes.map(item => {
    const entry = tree.get(item.key)!;
    if (item.type === 'divider') return <li key={item.key} role="separator" className={`pi-menu__divider ${item.className ?? ''}`} style={item.style} />;
    if (item.type === 'group') return <li key={item.key} className={`pi-menu__group ${item.className ?? ''}`} style={item.style}>{!((collapsed || horizontal) && !inPopup) && item.label != null && <div className="pi-menu__group-title" id={`${id}-${encodeURIComponent(item.key)}-group`}>{item.label}</div>}{renderItems(item.children, depth, inPopup, !((collapsed || horizontal) && !inPopup) && item.label != null ? `${id}-${encodeURIComponent(item.key)}-group` : undefined)}</li>;
    const parent = isParent(item), topPopup = entry.root && (horizontal || collapsed) && !inPopup;
    const expanded = topPopup ? popupKey === item.key : openKeys.includes(item.key);
    const selectedEntry = tree.get(selectedKeys[0] ?? '');
    const chosen = !parent && !selectedEntry?.item.type && selectedEntry?.item.key === item.key;
    const ancestor = parent && selectedEntry?.path.slice(1).includes(item.key);
    const compact = collapsed && !inPopup;
    const name = item.title ?? (typeof item.label === 'string' || typeof item.label === 'number' ? String(item.label) : item.key);
    const childId = `${id}-${encodeURIComponent(item.key)}-children`;
    const common = {
      'data-menu-key': item.key, className: 'pi-menu__control', 'aria-label': compact ? name : undefined,
      'aria-disabled': entry.disabled || undefined, tabIndex: entry.disabled ? -1 : undefined,
      style: { paddingInlineStart: compact || (horizontal && !inPopup) ? undefined : `${12 + depth * Math.max(0, inlineIndent)}px` },
      onKeyDown: (event: KeyboardEvent<HTMLElement>) => keyboard(event, entry, inPopup),
      onFocus: (event: React.FocusEvent<HTMLElement>) => { lastFocused.current = item.key; lastFocusedPath.current = entry.path.slice(1); if (horizontal && !inPopup) event.currentTarget.scrollIntoView?.({ inline: 'nearest', block: 'nearest' }); },
    };
    const body = <>{item.icon != null ? <span className="pi-menu__icon" aria-hidden="true">{item.icon}</span> : compact ? <span className="pi-menu__initial" aria-hidden="true">{name?.slice(0, 1) ?? '·'}</span> : null}<span className="pi-menu__label">{item.label}</span>{!compact && item.extra != null && <span className="pi-menu__extra">{item.extra}</span>}{parent && !compact && <span className={`pi-menu__arrow ${expanded ? 'pi-menu__arrow--open' : ''}`} aria-hidden="true">{expandIcon ?? <ChevronDownIcon />}</span>}</>;
    const control = parent ? <button {...common} type="button" disabled={entry.disabled} aria-expanded={expanded} aria-controls={childId} onClick={event => { if (entry.disabled) return; if (event.detail === 0 && topPopup) pendingFocus.current = 'first'; toggle(item.key); }}>{body}</button> : item.href ? <a {...common} href={entry.disabled ? undefined : item.href} target={item.target} rel={item.target === '_blank' ? 'noopener noreferrer' : undefined} aria-current={chosen ? 'page' : undefined} onClick={event => activate(entry, event)}>{body}</a> : <button {...common} type="button" disabled={entry.disabled} aria-current={chosen ? 'page' : undefined} onClick={event => activate(entry, event)}>{body}</button>;
    return <li key={item.key} className={`pi-menu__item ${chosen ? 'pi-menu__item--selected' : ''} ${ancestor ? 'pi-menu__item--ancestor' : ''} ${entry.disabled ? 'pi-menu__item--disabled' : ''} ${item.className ?? ''}`} style={item.style}>{compact && !parent && name ? <Tooltip title={name} placement="right" destroyOnHidden>{control}</Tooltip> : control}{parent && !topPopup && <div id={childId} className={`pi-menu__children ${expanded ? 'pi-menu__children--open' : ''}`} aria-hidden={!expanded} {...inertAttributes(!expanded)}><div>{renderItems(item.children, depth + 1, inPopup)}</div></div>}</li>;
  })}</ul>;
  const popupItem = renderPopupKey ? tree.get(renderPopupKey)?.item : undefined;
  return <><nav ref={setRoot} aria-label={props['aria-label']} aria-labelledby={props['aria-labelledby']} className={`pi-menu pi-menu--${mode} ${collapsed ? 'pi-menu--collapsed' : ''} ${className}`} style={{ ...themeVariables(theme), ...style }}>{renderItems(items)}</nav>{popupItem && isParent(popupItem) && root.current && present && createPortal(<div ref={popup} id={`${id}-${encodeURIComponent(popupItem.key)}-children`} className="pi-menu pi-menu__popup" aria-label={popupItem.title ?? (typeof popupItem.label === 'string' ? popupItem.label : undefined)} aria-hidden={!visible} {...inertAttributes(!visible)} data-motion={visible ? 'enter' : 'leave'} style={{ ...themeVariables(theme), ...position, opacity: visible && entered ? 1 : 0 }}>{renderItems(popupItem.children, 0, true)}</div>, root.current.closest('.pi-modal') ?? root.current.ownerDocument.body)}</>;
});
