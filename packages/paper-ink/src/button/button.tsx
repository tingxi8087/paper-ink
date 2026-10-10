import { forwardRef, useEffect, useState } from 'react';
import { useTheme } from '../config-provider/index.js';
import { themeVariables } from '../theme/variables.js';
import type { ButtonColor, ButtonProps, ButtonVariant } from './types.js';
const typeVariants: Record<NonNullable<ButtonProps['type']>, ButtonVariant> = {
  default: 'outlined', primary: 'solid', dashed: 'dashed', text: 'text', link: 'link',
};
export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(function Button({
  type, color, variant, size = 'middle', shape = 'default', htmlType = 'button', loading = false,
  danger = false, ghost = false, block = false, icon, iconPosition, iconPlacement, href, target, rel,
  disabled = false, children, className = '', rootClassName, classNames, styles, style, onClick,
  autoInsertSpace = true, ...rest
}, ref) {
  const theme = useTheme();
  const delay = typeof loading === 'object' ? Math.max(0, loading.delay || 0) : 0;
  const requested = Boolean(loading);
  const [delayedLoading, setDelayedLoading] = useState(requested && delay === 0);
  useEffect(() => {
    setDelayedLoading(requested && delay === 0);
    if (requested && delay > 0) {
      const timer = setTimeout(() => setDelayedLoading(true), delay);
      return () => clearTimeout(timer);
    }
  }, [requested, delay]);
  const busy = requested && (delay === 0 || delayedLoading);
  const blocked = disabled || busy;
  const mergedType = type ?? 'default';
  // Follow antd's paired color/variant override and legacy type/danger fallback.
  const paired = color !== undefined && variant !== undefined;
  const mergedColor: ButtonColor = paired ? color : danger ? 'danger' : type === 'primary' || (!type && variant === 'solid') ? 'primary' : 'default';
  const mergedVariant = paired ? variant : type || danger ? typeVariants[mergedType] : variant === 'solid' ? 'solid' : 'outlined';
  const placement = iconPlacement ?? iconPosition ?? 'start';
  const spaced = autoInsertSpace && !icon && mergedVariant !== 'text' && mergedVariant !== 'link' && typeof children === 'string' && /^[\u4e00-\u9fa5]{2}$/.test(children);
  const classes = ['pi-button', `pi-button--${size}`, `pi-button--${shape}`, `pi-button--color-${mergedColor}`, `pi-button--variant-${mergedVariant}`, ghost && 'pi-button--ghost', block && 'pi-button--block', disabled && 'pi-button--disabled', busy && 'pi-button--loading', children == null && 'pi-button--icon-only', className, rootClassName, classNames?.root].filter(Boolean).join(' ');
  const customLoadingIcon = typeof loading === 'object' ? loading.icon : undefined;
  const visualIcon = busy ? customLoadingIcon ?? <span className="pi-button__spinner" aria-hidden="true" /> : icon;
  const iconNode = visualIcon != null && <span className={['pi-button__icon', classNames?.icon].filter(Boolean).join(' ')} style={styles?.icon}>{visualIcon}</span>;
  const contents = <>{placement === 'start' && iconNode}{children != null && <span className={['pi-button__content', spaced && 'pi-button__content--spaced', classNames?.content].filter(Boolean).join(' ')} style={styles?.content}>{children}</span>}{placement === 'end' && iconNode}</>;
  const shared = { className: classes, style: { ...themeVariables(theme), ...styles?.root, ...style }, 'aria-busy': busy || undefined, onClick: ((event) => { if (blocked) { event.preventDefault(); return; } onClick?.(event); }) as ButtonProps['onClick'] };
  if (href !== undefined) return <a {...rest as object} {...shared} ref={ref as React.Ref<HTMLAnchorElement>} href={blocked ? undefined : href} target={target} rel={rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined)} aria-disabled={blocked || undefined} tabIndex={blocked ? -1 : rest.tabIndex}>{contents}</a>;
  return <button {...rest} {...shared} ref={ref as React.Ref<HTMLButtonElement>} type={htmlType} disabled={blocked}>{contents}</button>;
});
