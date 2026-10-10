import { forwardRef, useState, type ButtonHTMLAttributes, type MouseEvent, type KeyboardEvent, type ReactNode } from 'react';
import { useTheme } from '../config-provider/index.js';
import { themeVariables } from '../theme/variables.js';
export interface SwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'onClick' | 'value' | 'defaultValue'> {
  checked?: boolean; defaultChecked?: boolean; value?: boolean; defaultValue?: boolean;
  loading?: boolean; checkedChildren?: ReactNode; unCheckedChildren?: ReactNode; size?: 'default' | 'small';
  onChange?: (checked: boolean, event: MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLButtonElement>) => void;
  onClick?: (checked: boolean, event: MouseEvent<HTMLButtonElement>) => void;
}
export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(function Switch({ checked, defaultChecked, value, defaultValue, loading = false, disabled = false, checkedChildren, unCheckedChildren, size = 'default', onChange, onClick, onKeyDown, className, style, ...rest }, ref) {
  const [local, setLocal] = useState(defaultChecked ?? defaultValue ?? false); const current = checked ?? value ?? local; const controlled = checked !== undefined || value !== undefined; const blocked = loading || disabled; const theme = useTheme();
  function change(next: boolean, event: MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLButtonElement>) { if (blocked || next === current) return; if (!controlled) setLocal(next); onChange?.(next, event); }
  return <button {...rest} ref={ref} type="button" role="switch" aria-checked={current} aria-busy={loading || undefined} disabled={blocked} className={['pi-switch', current && 'pi-switch--checked', loading && 'pi-switch--loading', `pi-switch--${size}`, className].filter(Boolean).join(' ')} style={{ ...themeVariables(theme), ...style }} onClick={event => { if (blocked) return; const next = !current; change(next, event); onClick?.(next, event); }} onKeyDown={event => { onKeyDown?.(event); if (!event.defaultPrevented && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) { event.preventDefault(); change(event.key === 'ArrowRight', event); } }}><span className="pi-switch__handle" aria-hidden="true">{loading && <span className="pi-switch__spinner" />}</span><span className="pi-switch__label">{current ? checkedChildren : unCheckedChildren}</span></button>;
});
