import { useEffect, useRef, useState, type CSSProperties, type HTMLAttributes, type MouseEvent, type ReactNode } from 'react';
import { Modal } from '../modal/index.js';
export interface DrawerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'onClose'> {
  title?: ReactNode; children?: ReactNode; open?: boolean;
  onClose?: (event: MouseEvent<HTMLElement> | KeyboardEvent) => void;
  placement?: 'left' | 'right' | 'top' | 'bottom';
  size?: 'default' | 'large'; width?: number | string; height?: number | string;
  mask?: boolean; maskClosable?: boolean; keyboard?: boolean; closable?: boolean;
  footer?: ReactNode; extra?: ReactNode; zIndex?: number;
  destroyOnHidden?: boolean; forceRender?: boolean;
  getContainer?: HTMLElement | (() => HTMLElement) | string | false;
  rootClassName?: string;
  afterOpenChange?: (open: boolean) => void;
}
export function Drawer({ title, children, open = false, onClose, placement = 'right', size = 'default', width, height, footer, extra, className = '', rootClassName = '', style, afterOpenChange, ...props }: DrawerProps) {
  const previous = useRef(false), callback = useRef(afterOpenChange); callback.current = afterOpenChange;
  const [present, setPresent] = useState(open);
  useEffect(() => {
    if (!open && !previous.current) return;
    previous.current = open;
    if (open) setPresent(true);
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const timer = window.setTimeout(() => {
      setPresent(open);
      callback.current?.(open);
    }, reducedMotion ? 0 : 260);
    return () => window.clearTimeout(timer);
  }, [open]);
  const horizontal = placement === 'left' || placement === 'right';
  const panelStyle: CSSProperties = { ...(horizontal ? { top: 0, bottom: 0, [placement]: 0, width: width ?? (size === 'large' ? 736 : 378), height: '100%' } : { left: 0, right: 0, [placement]: 0, width: '100%', height: height ?? (size === 'large' ? 736 : 378) }), ...style };
  return <Modal {...props} centered={false} open={open || present} onCancel={open ? onClose : undefined} title={title != null || extra != null ? <div className="pi-drawer-heading"><span>{title}</span>{extra != null && <div className="pi-drawer-extra">{extra}</div>}</div> : undefined} footer={null} width={horizontal ? panelStyle.width : '100%'} rootClassName={`pi-drawer-root pi-drawer-root--${placement} pi-drawer-root--${open ? 'enter' : 'leave'} ${rootClassName}`} className={`pi-drawer ${className}`} style={panelStyle}>
    <div className="pi-drawer-content">{children}</div>{footer != null && <div className="pi-drawer-footer">{footer}</div>}
  </Modal>;
}
