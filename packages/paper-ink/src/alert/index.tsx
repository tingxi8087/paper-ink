import { CloseIcon, StatusIcon } from '../internal/icons.js';
import { Component, forwardRef, useEffect, useRef, useState, type AriaAttributes, type HTMLAttributes, type MouseEvent, type ReactNode } from 'react';
import { useTheme } from '../config-provider/index.js';
import { themeVariables } from '../theme/variables.js';
export interface AlertClosable extends AriaAttributes { closeIcon?: ReactNode; disabled?: boolean; onClose?: (event: MouseEvent<HTMLButtonElement>) => void; afterClose?: () => void }
export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode; message?: ReactNode; description?: ReactNode;
  type?: 'success' | 'info' | 'warning' | 'error';
  showIcon?: boolean; icon?: ReactNode; banner?: boolean; action?: ReactNode;
  variant?: 'outlined' | 'filled'; closable?: boolean | AlertClosable;
  closeIcon?: ReactNode; closeText?: ReactNode;
  onClose?: (event: MouseEvent<HTMLButtonElement>) => void; afterClose?: () => void;
}
const AlertRoot = forwardRef<HTMLDivElement, AlertProps>(function Alert({ title, message, description, type, showIcon, icon, banner = false, action, variant = 'outlined', closable = false, closeIcon, closeText, onClose, afterClose, className, style, ...rest }, ref) {
  const theme = useTheme(); const [closed, setClosed] = useState(false);
  const resolvedType = type ?? (banner ? 'warning' : 'info'); const tone = theme.token.color[resolvedType];
  const close = typeof closable === 'object' ? closable : {};
  const onAfter = close.afterClose ?? afterClose; const notified = useRef(false);
  useEffect(() => { if (closed && !notified.current) { notified.current = true; onAfter?.(); } }, [closed, onAfter]);
  if (closed) return null;
  const { closeIcon: objectIcon, disabled, onClose: objectOnClose, afterClose: ignored, ...closeAria } = close;
  return <div {...rest} ref={ref} role={rest.role ?? 'alert'} className={['pi-alert', banner && 'pi-alert--banner', className].filter(Boolean).join(' ')}
    style={{ ...themeVariables(theme), background: tone.subtle, borderColor: variant === 'filled' || banner ? 'transparent' : tone.border, ...style }}>
    {(showIcon ?? banner) && <span className="pi-alert__icon" aria-hidden="true" style={{ color: tone.solid }}>{icon ?? <StatusIcon type={resolvedType} circle width={20} height={20} />}</span>}
    <div className="pi-alert__content"><div className="pi-alert__title">{title ?? message}</div>{description != null && <div className="pi-alert__description">{description}</div>}</div>
    {action != null && <div className="pi-alert__action">{action}</div>}
    {(closable || closeText != null) && <button {...closeAria} type="button" aria-label={closeAria['aria-label'] ?? '关闭提示'} className="pi-alert__close" disabled={disabled} onClick={event => { (objectOnClose ?? onClose)?.(event); if (!event.defaultPrevented) setClosed(true); }}>{objectIcon ?? closeIcon ?? closeText ?? <CloseIcon />}</button>}
  </div>;
});
export interface AlertErrorBoundaryProps { title?: ReactNode; message?: ReactNode; description?: ReactNode; children?: ReactNode }
class ErrorBoundary extends Component<AlertErrorBoundaryProps, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() { return this.state.error ? <AlertRoot type="error" showIcon title={this.props.title ?? this.props.message ?? this.state.error.message} description={this.props.description} /> : this.props.children; }
}
export const Alert = Object.assign(AlertRoot, { ErrorBoundary });
