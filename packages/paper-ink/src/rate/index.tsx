import { defineFieldBinding } from '../internal/field-binding.js';
import { forwardRef, useImperativeHandle, useRef, useState, type HTMLAttributes, type MouseEvent, type ReactNode } from 'react';
import { useTheme } from '../config-provider/index.js';
import { themeVariables } from '../theme/variables.js';
import { StarIcon } from '../internal/icons.js';
export interface RateRef { nativeElement: HTMLDivElement | null; focus: (options?: FocusOptions) => void; blur: () => void }
export interface RateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue' | 'children'> {
  value?: number; defaultValue?: number; count?: number; allowHalf?: boolean; allowClear?: boolean; disabled?: boolean; keyboard?: boolean;
  size?: 'small' | 'medium' | 'large'; tooltips?: string[];
  character?: ReactNode | ((props: RateProps & { index: number }) => ReactNode);
  onChange?: (value: number) => void; onHoverChange?: (value: number) => void;
}
export const Rate = forwardRef<RateRef, RateProps>(function Rate(props, ref) {
  const { value, defaultValue = 0, count = 5, allowHalf = false, allowClear = true, disabled = false, keyboard = true, size = 'medium', tooltips, character, onChange, onHoverChange, onKeyDown, onMouseLeave, className, style, tabIndex, ...rest } = props;
  const theme = useTheme(); const root = useRef<HTMLDivElement>(null); const [inner, setInner] = useState(defaultValue); const [hover, setHover] = useState<number | null>(null);
  const length = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 5;
  const clamp = (n: number) => Number.isFinite(n) ? Math.min(length, Math.max(0, n)) : 0;
  const current = clamp(value ?? inner); const display = disabled ? current : hover ?? current; const inactive = disabled || !length;
  useImperativeHandle(ref, () => ({ get nativeElement() { return root.current; }, focus: options => root.current?.focus(options), blur: () => root.current?.blur() }), []);
  function change(next: number) { if (inactive) return; next = clamp(next); if (value === undefined) setInner(next); if (next !== current) onChange?.(next); }
  function hit(event: MouseEvent<HTMLElement>, index: number) { const box = event.currentTarget.getBoundingClientRect(); return index + (allowHalf && box.width > 0 && event.clientX < box.left + box.width / 2 ? .5 : 1); }
  return <div {...rest} ref={root} role="slider" aria-label={rest['aria-label'] ?? (rest['aria-labelledby'] ? undefined : '评分')} aria-valuemin={0} aria-valuemax={length} aria-valuenow={current} aria-valuetext={`${current} / ${length}`} aria-disabled={inactive || undefined} tabIndex={inactive ? -1 : tabIndex ?? 0} className={['pi-rate', `pi-rate--${size}`, inactive && 'pi-rate--disabled', className].filter(Boolean).join(' ')} style={{ ...themeVariables(theme), ...style }}
    onKeyDown={event => { onKeyDown?.(event); if (event.defaultPrevented || inactive || !keyboard) return; const step = allowHalf ? .5 : 1; const rtl = root.current && root.current.ownerDocument.defaultView?.getComputedStyle(root.current).direction === 'rtl'; const next = event.key === 'ArrowRight' ? current + (rtl ? -step : step) : event.key === 'ArrowLeft' ? current + (rtl ? step : -step) : event.key === 'ArrowUp' ? current + step : event.key === 'ArrowDown' ? current - step : event.key === 'Home' ? 0 : event.key === 'End' ? length : undefined; if (next !== undefined) { event.preventDefault(); setHover(null); change(next); } }}
    onMouseLeave={event => { if (hover !== null) { setHover(null); onHoverChange?.(0); } onMouseLeave?.(event); }}>
    {Array.from({ length }, (_, index) => { const glyph = typeof character === 'function' ? character({ ...props, value: current, index }) : character ?? <StarIcon width="1em" height="1em" />; const fill = Math.min(1, Math.max(0, display - index)); return <span key={index} className="pi-rate__star" aria-hidden="true" title={tooltips?.[index]} data-rate-index={index} onMouseMove={event => { if (inactive) return; const next = hit(event, index); if (hover !== next) { setHover(next); onHoverChange?.(next); } }} onClick={event => { if (inactive) return; const next = hit(event, index); if (hover !== null) onHoverChange?.(0); setHover(null); change(allowClear && next === current ? 0 : next); root.current?.focus({ preventScroll: true }); }}><span className="pi-rate__glyph pi-rate__glyph--empty">{glyph}</span><span className="pi-rate__fill" style={{ width: `${fill * 100}%` }}><span className="pi-rate__glyph">{glyph}</span></span></span>; })}
  </div>;
});

defineFieldBinding(Rate, { toControlValue: value => value ?? 0, status: false });
