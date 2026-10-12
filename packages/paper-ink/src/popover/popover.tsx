import { inertAttributes } from '../internal/inert.js';
import { usePresence } from '../internal/motion.js';
import { Fragment, cloneElement, isValidElement, useEffect, useId, useRef, useState, type CSSProperties, type ReactElement } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../config-provider/index.js';
import { themeVariables } from '../theme/variables.js';
import type { PopoverPlacement, PopoverProps } from './types.js';

function coordinates(rect: DOMRect, width: number, height: number, placement: PopoverPlacement) {
  const gap = 8;
  let left = rect.left + (rect.width - width) / 2, top = rect.top - height - gap;
  if (placement.startsWith('bottom')) top = rect.bottom + gap;
  if (placement.startsWith('left') || placement.startsWith('right')) {
    left = placement.startsWith('left') ? rect.left - width - gap : rect.right + gap;
    top = rect.top + (rect.height - height) / 2;
    if (placement.endsWith('Top')) top = rect.top;
    if (placement.endsWith('Bottom')) top = rect.bottom - height;
  } else {
    if (placement.endsWith('Left')) left = rect.left;
    if (placement.endsWith('Right')) left = rect.right - width;
  }
  return { left, top };
}
export function Popover({ title, content: body, children, placement = 'top', trigger = 'hover', mouseEnterDelay = .1, mouseLeaveDelay = .1,
  open: controlled, defaultOpen = false, onOpenChange, destroyOnHidden = false, color, getPopupContainer, className = '', style, overlayClassName = '', overlayStyle, zIndex = 1200, autoAdjustOverflow = true }: PopoverProps) {
  const theme = useTheme();
  const [internal, setInternal] = useState(defaultOpen);
  const [position, setPosition] = useState<CSSProperties>({ left: 0, top: 0, visibility: 'hidden' });
  const [node, setNode] = useState<HTMLSpanElement | null>(null);
  const popup = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const id = useId();
  const triggers = Array.isArray(trigger) ? trigger : [trigger];
  const heading = typeof title === 'function' ? title() : title;
  const bodyContent = typeof body === 'function' ? body() : body;
  const content = heading != null || bodyContent != null;
  const visible = (controlled ?? internal) && content;
  const present = usePresence(visible, 180);
  const ever = useRef(visible); if (visible) ever.current = true;
  const state = useRef({ visible, controlled, onOpenChange }); state.current = { visible, controlled, onOpenChange };
  const change = (next: boolean, delay = 0) => {
    clearTimeout(timer.current);
    const apply = () => { if (state.current.visible === next) return; if (state.current.controlled === undefined) setInternal(next); if (!next && popup.current?.contains(popup.current.ownerDocument.activeElement)) node?.querySelector<HTMLElement>('button, a[href], input, [tabindex]')?.focus(); state.current.onOpenChange?.(next); };
    if (delay > 0) timer.current = setTimeout(apply, delay * 1000); else apply();
  };
  useEffect(() => () => clearTimeout(timer.current), []);
  const container = node ? getPopupContainer?.(node) ?? node.closest<HTMLElement>('.pi-modal') ?? node.ownerDocument.body : null;
  useEffect(() => {
    if (!visible || !node || !popup.current || !container) return;
    const doc = node.ownerDocument, win = doc.defaultView!;
    const update = () => {
      if (!popup.current) return;
      const rect = node.getBoundingClientRect(), box = popup.current.getBoundingClientRect();
      let next = coordinates(rect, box.width, box.height, placement);
      if (autoAdjustOverflow) {
        const opposite = placement.startsWith('top') ? placement.replace('top', 'bottom') : placement.startsWith('bottom') ? placement.replace('bottom', 'top') : placement.startsWith('left') ? placement.replace('left', 'right') : placement.replace('right', 'left');
        if (next.top < 8 || next.top + box.height > win.innerHeight - 8 || next.left < 8 || next.left + box.width > win.innerWidth - 8) {
          const flipped = coordinates(rect, box.width, box.height, opposite as PopoverPlacement);
          const overflow = (p: typeof next) => Math.max(8 - p.left, 0) + Math.max(p.left + box.width - win.innerWidth + 8, 0) + Math.max(8 - p.top, 0) + Math.max(p.top + box.height - win.innerHeight + 8, 0);
          if (overflow(flipped) < overflow(next)) next = flipped;
        }
        next.left = Math.max(8, Math.min(next.left, win.innerWidth - box.width - 8));
        next.top = Math.max(8, Math.min(next.top, win.innerHeight - box.height - 8));
      }
      if (container !== doc.body) {
        const parent = popup.current.offsetParent as HTMLElement | null;
        if (parent && (parent !== doc.body || win.getComputedStyle(parent).position !== 'static')) {
          const bounds = parent.getBoundingClientRect();
          next.left += parent.scrollLeft - bounds.left - parent.clientLeft;
          next.top += parent.scrollTop - bounds.top - parent.clientTop;
        } else { next.left += win.scrollX; next.top += win.scrollY; }
      }
      setPosition({ ...next, visibility: 'visible' });
    };
    update(); win.addEventListener('resize', update); doc.addEventListener('scroll', update, true);
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    observer?.observe(node); observer?.observe(popup.current);
    const dismiss = (event: KeyboardEvent) => { if (event.key === 'Escape' && !event.isComposing) { event.preventDefault(); event.stopPropagation(); change(false); } };
    const outside = (event: PointerEvent) => { if (event.target instanceof Node && !node.contains(event.target) && !popup.current?.contains(event.target)) change(false); };
    const blur = () => change(false);
    doc.addEventListener('keydown', dismiss, true); doc.addEventListener('pointerdown', outside); win.addEventListener('blur', blur);
    return () => { win.removeEventListener('resize', update); doc.removeEventListener('scroll', update, true); observer?.disconnect(); doc.removeEventListener('keydown', dismiss, true); doc.removeEventListener('pointerdown', outside); win.removeEventListener('blur', blur); };
  }, [visible, node, container, placement, autoAdjustOverflow, title, body]);
  let child = children;
  if (isValidElement(children) && children.type !== Fragment) {
    const element = children as ReactElement<{ 'aria-controls'?: string; 'aria-expanded'?: boolean; 'aria-haspopup'?: 'dialog'; disabled?: boolean; style?: CSSProperties }>;
    child = cloneElement(element, { 'aria-controls': visible ? id : undefined, 'aria-expanded': visible, 'aria-haspopup': 'dialog', ...(element.props.disabled ? { style: { ...element.props.style, pointerEvents: 'none' } } : {}) });
  }
  return <><span ref={setNode} className="pi-popover-trigger"
    onMouseEnter={() => triggers.includes('hover') && change(true, mouseEnterDelay)}
    onMouseLeave={() => triggers.includes('hover') && change(false, mouseLeaveDelay)}
    onFocus={() => (triggers.includes('focus') || triggers.includes('hover')) && change(true)}
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null) && !popup.current?.contains(event.relatedTarget as Node | null) && triggers.includes('focus')) change(false); }}
    onClick={() => triggers.includes('click') && change(!visible)}>{child}</span>
    {container && (present || (ever.current && !destroyOnHidden)) && createPortal(<div ref={popup} id={id} role="dialog" aria-labelledby={heading != null ? `${id}-title` : undefined} hidden={!present} aria-hidden={!visible} {...inertAttributes(!visible)} data-motion={visible ? 'enter' : 'leave'} className={`pi-popover ${className} ${overlayClassName}`} onMouseEnter={() => triggers.includes('hover') && change(true)} onMouseLeave={() => triggers.includes('hover') && change(false, mouseLeaveDelay)} style={{ ...themeVariables(theme), ...style, ...overlayStyle, zIndex, background: color ?? overlayStyle?.background ?? style?.background, position: container === node?.ownerDocument.body ? 'fixed' : 'absolute', ...position }} onFocus={() => change(true)} onBlur={event => { if (triggers.includes('focus') && !popup.current?.contains(event.relatedTarget as Node | null) && !node?.contains(event.relatedTarget as Node | null)) change(false); }} onClick={event => event.stopPropagation()}>{heading != null && <div id={`${id}-title`} className="pi-popover-title">{heading}</div>}<div className="pi-popover-content">{bodyContent}</div></div>, container)}
  </>;
}
