import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { Popover, type PopoverProps } from '../popover/index.js';
import { Button } from '../button/index.js';
import type { ButtonProps } from '../button/types.js';
import { StatusIcon } from '../internal/icons.js';
export interface PopconfirmProps extends Omit<PopoverProps, 'title' | 'content'> {
  title: ReactNode | (() => ReactNode);
  description?: ReactNode | (() => ReactNode);
  disabled?: boolean;
  icon?: ReactNode;
  okText?: ReactNode;
  cancelText?: ReactNode;
  okType?: ButtonProps['type'];
  okButtonProps?: ButtonProps;
  cancelButtonProps?: ButtonProps;
  showCancel?: boolean;
  onConfirm?: (event: MouseEvent<HTMLElement>) => void | Promise<unknown>;
  onCancel?: (event: MouseEvent<HTMLElement>) => void;
  onPopupClick?: (event: MouseEvent<HTMLDivElement>) => void;
}
export function Popconfirm({ title, description, disabled = false, icon, okText = '确定', cancelText = '取消', okType = 'primary', okButtonProps, cancelButtonProps, showCancel = true, onConfirm, onCancel, onPopupClick, open: controlled, defaultOpen = false, onOpenChange, trigger = 'click', children, ...props }: PopconfirmProps) {
  const [internal, setInternal] = useState(defaultOpen), [pending, setPending] = useState(false);
  const alive = useRef(true), generation = useRef(0);
  useEffect(() => { alive.current = true; return () => { alive.current = false; generation.current++; }; }, []);
  const open = !disabled && (controlled ?? internal);
  const change = (next: boolean) => { if (disabled || pending) return; if (controlled === undefined) setInternal(next); onOpenChange?.(next); };
  const close = () => { if (controlled === undefined) setInternal(false); onOpenChange?.(false); };
  const confirm = async (event: MouseEvent<HTMLElement>) => {
    okButtonProps?.onClick?.(event); if (event.defaultPrevented || pending) return;
    const run = ++generation.current;
    try {
      const result = onConfirm?.(event);
      if (result && typeof result.then === 'function') { setPending(true); await result; }
      if (alive.current && run === generation.current) close();
    } catch { /* Rejected confirmation remains open for retry. */ }
    finally { if (alive.current && run === generation.current) setPending(false); }
  };
  return <Popover {...props} trigger={trigger} open={open} onOpenChange={change} content={<div className="pi-popconfirm" onClick={onPopupClick}>
    <div className="pi-popconfirm-main">{icon !== null && <span className="pi-popconfirm-icon">{icon ?? <StatusIcon type="warning" circle width={18} height={18} />}</span>}<div><div className="pi-popconfirm-title">{typeof title === 'function' ? title() : title}</div>{description != null && <div className="pi-popconfirm-description">{typeof description === 'function' ? description() : description}</div>}</div></div>
    <div className="pi-popconfirm-actions">{showCancel && <Button size="small" {...cancelButtonProps} disabled={pending || cancelButtonProps?.disabled} onClick={event => { cancelButtonProps?.onClick?.(event); if (event.defaultPrevented) return; onCancel?.(event); if (!event.defaultPrevented) close(); }}>{cancelText}</Button>}<Button size="small" type={okType} {...okButtonProps} loading={pending || okButtonProps?.loading} onClick={confirm}>{okText}</Button></div>
  </div>}>{children}</Popover>;
}
