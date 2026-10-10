import { CloseIcon } from '../internal/icons.js';
import { forwardRef, useState, type HTMLAttributes, type MouseEvent, type ReactNode, type ButtonHTMLAttributes } from 'react';
import { useTheme } from '../config-provider/index.js';
import { themeVariables } from '../theme/variables.js';
export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  color?: string;
  variant?: 'filled' | 'solid' | 'outlined';
  bordered?: boolean;
  closable?: boolean;
  closeIcon?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  onClose?: (event: MouseEvent<HTMLElement>) => void;
}
const presets: Record<string, string> = { magenta: '#c41d7f', red: '#cf1322', volcano: '#d4380d', orange: '#d46b08', gold: '#d48806', lime: '#7cb305', green: '#389e0d', cyan: '#08979c', blue: '#0958d9', geekblue: '#1d39c4', purple: '#531dab' };
const TagRoot = forwardRef<HTMLSpanElement, TagProps>(function Tag({ color = 'default', variant = 'filled', bordered = true, closable = false, closeIcon, icon, disabled = false, onClose, onClick, children, className, style, ...rest }, ref) {
  const theme = useTheme(); const [closed, setClosed] = useState(false);
  if (closed) return null;
  const semantic = color === 'processing' ? 'info' : color;
  const tone = ['primary', 'success', 'warning', 'error', 'info'].includes(semantic) ? theme.token.color[semantic as 'primary'] : undefined;
  const custom = color !== 'default' && !tone ? presets[color] ?? color : undefined;
  const bg = variant === 'solid' ? tone?.solid ?? custom ?? theme.token.color.primary.solid : variant === 'outlined' ? 'transparent' : tone?.subtle ?? theme.token.color.surface.muted;
  const fg = variant === 'solid' ? tone?.onSolid ?? '#ffffff' : tone?.onSubtle ?? custom ?? theme.token.color.text.primary;
  const border = tone?.border ?? custom ?? theme.token.color.border.default;
  const hasClose = closeIcon !== false && closeIcon !== null && (closable || closeIcon !== undefined);
  return <span {...rest} ref={ref} className={['pi-tag', disabled && 'pi-tag--disabled', className].filter(Boolean).join(' ')} aria-disabled={disabled || undefined} onClick={event => { if (disabled) { event.preventDefault(); return; } onClick?.(event); }}
    style={{ ...themeVariables(theme), background: bg, color: fg, borderColor: bordered ? variant === 'solid' ? bg : border : 'transparent', ...style }}>
    {icon != null && <span className="pi-tag__icon" aria-hidden="true">{icon}</span>}{children}
    {hasClose && <button type="button" className="pi-tag__close" disabled={disabled} aria-label="关闭标签" onClick={event => { event.stopPropagation(); onClose?.(event); if (!event.defaultPrevented) setClosed(true); }}>{closeIcon === true || closeIcon === undefined ? <CloseIcon width={12} height={12} /> : closeIcon}</button>}
  </span>;
});
export interface CheckableTagProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> { checked?: boolean; icon?: ReactNode; onChange?: (checked: boolean) => void }
const CheckableTag = forwardRef<HTMLButtonElement, CheckableTagProps>(function CheckableTag({ checked = false, icon, onChange, onClick, className, style, children, disabled, ...rest }, ref) {
  const theme = useTheme();
  return <button {...rest} ref={ref} type="button" disabled={disabled} aria-pressed={checked} className={['pi-tag', 'pi-tag--checkable', checked && 'pi-tag--checked', className].filter(Boolean).join(' ')} style={{ ...themeVariables(theme), ...style }}
    onClick={event => { onClick?.(event); if (!event.defaultPrevented) onChange?.(!checked); }}>{icon != null && <span className="pi-tag__icon" aria-hidden="true">{icon}</span>}{children}</button>;
});
export const Tag = Object.assign(TagRoot, { CheckableTag });
