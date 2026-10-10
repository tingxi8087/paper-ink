import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../button/button.js';
import { useTheme } from '../config-provider/index.js';
import { themeVariables } from '../theme/variables.js';
import type { ModalProps } from './types.js';

type ModalEntry = { dialog: HTMLDivElement; previousFocus: HTMLElement | null };
type ModalStack = { entries: ModalEntry[]; overflow: string };
const stacks = new WeakMap<Document, ModalStack>();
const focusableSelector = 'button, a[href], input, select, textarea, [tabindex], [contenteditable="true"]';
function focusable(dialog: HTMLElement) {
  return Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector)).filter(element => {
    if (element.tabIndex < 0 || element.matches(':disabled, [aria-disabled="true"]') || element.closest('[hidden], [inert]')) return false;
    for (let ancestor: HTMLElement | null = element; ancestor; ancestor = ancestor.parentElement) {
      const style = ancestor.ownerDocument.defaultView?.getComputedStyle(ancestor);
      if (style?.display === 'none' || style?.visibility === 'hidden') return false;
      if (ancestor === dialog) break;
    }
    return true;
  });
}
function focusFirst(dialog: HTMLElement) { (focusable(dialog)[0] ?? dialog).focus(); }

export function Modal({
  open = false, title, children, onOk, onCancel, confirmLoading = false,
  footer, width = 520, centered = false, mask = true, maskClosable = true,
  keyboard = true, closable = true, okText = '确定', cancelText = '取消',
  okButtonProps, cancelButtonProps, afterClose, destroyOnHidden = false,
  forceRender = false, getContainer, className = '', rootClassName = '', style,
  zIndex = 1000, focusTriggerAfterClose = true, ...rest
}: ModalProps) {
  const theme = useTheme();
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const entryRef = useRef<ModalEntry | null>(null);
  const openedRef = useRef(false);
  const wasOpen = useRef(false);
  const callbacks = useRef({ onCancel, afterClose, keyboard, focusTriggerAfterClose });
  callbacks.current = { onCancel, afterClose, keyboard, focusTriggerAfterClose };
  if (open) openedRef.current = true;

  const container = typeof document === 'undefined' || getContainer === false ? null :
    typeof getContainer === 'function' ? getContainer() : typeof getContainer === 'string' ? document.querySelector(getContainer) : getContainer ?? document.body;

  useEffect(() => {
    if (!open || !dialogRef.current) return;
    const dialog = dialogRef.current;
    const doc = dialog.ownerDocument;
    let stack = stacks.get(doc);
    if (!stack) {
      stack = { entries: [], overflow: doc.body.style.overflow };
      stacks.set(doc, stack);
      doc.body.style.overflow = 'hidden';
    }
    const entry: ModalEntry = { dialog, previousFocus: doc.activeElement instanceof HTMLElement ? doc.activeElement : null };
    const root = dialog.closest<HTMLElement>('.pi-modal-root');
    const previousRoot = stack.entries.at(-1)?.dialog.closest<HTMLElement>('.pi-modal-root');
    if (root) root.style.zIndex = String(Math.max(zIndex, Number(previousRoot?.style.zIndex ?? zIndex - 1) + 1));
    stack.entries.push(entry);
    entryRef.current = entry;
    const isTop = () => stack.entries.at(-1) === entry;
    focusFirst(dialog);
    const keydown = (event: KeyboardEvent) => {
      if (!isTop()) return;
      if (event.key === 'Escape' && callbacks.current.keyboard && !event.isComposing) {
        event.preventDefault();
        event.stopPropagation();
        callbacks.current.onCancel?.(event);
      }
      if (event.key === 'Tab') {
        const items = focusable(dialog);
        const first = items[0];
        const last = items.at(-1);
        if (!first) { event.preventDefault(); dialog.focus(); }
        else if (event.shiftKey && (doc.activeElement === first || !dialog.contains(doc.activeElement))) {
          event.preventDefault(); last!.focus();
        } else if (!event.shiftKey && (doc.activeElement === last || !dialog.contains(doc.activeElement))) {
          event.preventDefault(); first.focus();
        }
      }
    };
    const focusin = (event: FocusEvent) => {
      if (isTop() && event.target instanceof Node && !dialog.contains(event.target)) focusFirst(dialog);
    };
    doc.addEventListener('keydown', keydown);
    doc.addEventListener('focusin', focusin);
    return () => {
      const top = isTop();
      doc.removeEventListener('keydown', keydown);
      doc.removeEventListener('focusin', focusin);
      for (const remaining of stack.entries) {
        if (remaining !== entry && remaining.previousFocus && dialog.contains(remaining.previousFocus)) remaining.previousFocus = entry.previousFocus;
      }
      stack.entries.splice(stack.entries.indexOf(entry), 1);
      entryRef.current = null;
      if (!stack.entries.length) {
        doc.body.style.overflow = stack.overflow;
        stacks.delete(doc);
      }
      if (top && callbacks.current.focusTriggerAfterClose) {
        const next = stack.entries.at(-1);
        if (entry.previousFocus?.isConnected && (!next || next.dialog.contains(entry.previousFocus))) entry.previousFocus.focus();
        else if (next) focusFirst(next.dialog);
      }
    };
  }, [open, container, zIndex]);

  useEffect(() => {
    if (wasOpen.current && !open) callbacks.current.afterClose?.();
    wasOpen.current = open;
  }, [open]);

  if (typeof document === 'undefined' || (!open && !forceRender && (!openedRef.current || destroyOnHidden))) return null;
  const cancelFromMask = (event: React.MouseEvent<HTMLDivElement>) => {
    const entry = entryRef.current;
    if (mask && maskClosable && event.target === event.currentTarget && entry && stacks.get(entry.dialog.ownerDocument)?.entries.at(-1) === entry) onCancel?.(event);
  };
  const content = <div className={['pi-modal-root', !mask && 'pi-modal-root--no-mask', rootClassName].filter(Boolean).join(' ')} hidden={!open} style={{ ...themeVariables(theme), zIndex }}>
    {mask && <div className="pi-modal-mask" />}
    <div className={['pi-modal-wrap', centered && 'pi-modal-wrap--centered'].filter(Boolean).join(' ')} onClick={cancelFromMask}>
      <div {...rest} ref={dialogRef} role="dialog" aria-modal={mask ? true : undefined}
        aria-labelledby={rest['aria-labelledby'] ?? (title != null && !rest['aria-label'] ? titleId : undefined)}
        aria-label={rest['aria-label'] ?? (title == null && !rest['aria-labelledby'] ? '对话框' : undefined)}
        tabIndex={-1} className={['pi-modal', className].filter(Boolean).join(' ')} style={{ width, ...style }}>
        {closable && <button type="button" className="pi-modal-close" aria-label="关闭" onClick={onCancel}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m4 4 8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" /></svg>
        </button>}
        {title != null && <div id={titleId} className="pi-modal-title">{title}</div>}
        <div className="pi-modal-body">{children}</div>
        {footer !== null && <div className="pi-modal-footer">{footer === undefined ? <>
          <Button {...cancelButtonProps} onClick={event => { cancelButtonProps?.onClick?.(event); if (!event.defaultPrevented) onCancel?.(event); }}>{cancelText}</Button>
          <Button type="primary" loading={confirmLoading} {...okButtonProps} onClick={event => { okButtonProps?.onClick?.(event); if (!event.defaultPrevented) onOk?.(event); }}>{okText}</Button>
        </> : footer}</div>}
      </div>
    </div>
  </div>;
  return getContainer === false ? content : createPortal(content, container ?? document.body);
}
