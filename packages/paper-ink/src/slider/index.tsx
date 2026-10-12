import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type CSSProperties, type HTMLAttributes, type KeyboardEventHandler, type ReactNode } from 'react';
import { useTheme } from '../config-provider/index.js';
import { themeVariables } from '../theme/variables.js';
import { defineFieldBinding } from '../internal/field-binding.js';
import { Tooltip } from '../tooltip/index.js';
export type SliderValue = number | [number, number];
export interface SliderRef { nativeElement: HTMLDivElement | null; focus: () => void; blur: () => void }
interface SliderBaseProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue' | 'onKeyDown'> {
 onKeyDown?: KeyboardEventHandler<HTMLButtonElement>;
 min?: number; max?: number; step?: number | null;
 disabled?: boolean; vertical?: boolean; reverse?: boolean; included?: boolean;
 marks?: Record<number, ReactNode | { style?: CSSProperties; label: ReactNode }>;
 tooltip?: { open?: boolean; formatter?: ((value: number) => ReactNode) | null };
 status?: '' | 'error' | 'warning'; rootClassName?: string; ariaLabelForHandle?: string | [string, string];
}
export type SliderProps = SliderBaseProps & (
 { range?: false; value?: number; defaultValue?: number; onChange?: (value: number) => void; onChangeComplete?: (value: number) => void } |
 { range: true; value?: [number, number]; defaultValue?: [number, number]; onChange?: (value: [number, number]) => void; onChangeComplete?: (value: [number, number]) => void }
);
const precision = (n: number) => { const [base, exponent = '0'] = String(n).split('e'); return Math.max(0, (base.split('.')[1]?.length ?? 0) - Number(exponent)); };
export const Slider = forwardRef<SliderRef, SliderProps>(function Slider(props, ref) {
 const { min: givenMin = 0, max: givenMax = 100, step = 1, value, defaultValue, range = false, onChange, onChangeComplete,
 disabled = false, vertical = false, reverse = false, included = true, marks = {}, tooltip, status, rootClassName = '', className = '', style, ariaLabelForHandle, onKeyDown, ...rest } = props;
 const notifyChange = onChange as ((value: SliderValue) => void) | undefined;
 const notifyComplete = onChangeComplete as ((value: SliderValue) => void) | undefined;
 const min = Number.isFinite(givenMin) ? givenMin : 0, max = Math.max(min, Number.isFinite(givenMax) ? givenMax : 100);
 const controlled = Object.prototype.hasOwnProperty.call(props, 'value');
 const theme = useTheme(), root = useRef<HTMLDivElement>(null), handles = useRef<Array<HTMLButtonElement | null>>([]);
 const [inner, setInner] = useState<SliderValue>(defaultValue ?? (range ? [min, max] : min));
 const [dragging, setDragging] = useState<number | null>(null);
 const raw = (controlled ? value : inner) ?? (range ? [min, max] : min);
 const points = Object.keys(marks).map(Number).filter(n => Number.isFinite(n) && n >= min && n <= max).sort((a,b) => a-b);
 const snap = (n: number) => { n = Number.isFinite(n) ? Math.min(max, Math.max(min,n)) : min;
  if (step === null) return [min,...points,max].reduce((a,b) => Math.abs(b-n) < Math.abs(a-n) ? b : a);
  const increment = Number.isFinite(step) && step > 0 ? step : 1;
  return Math.min(max, Math.max(min, Number((min + Math.round((n-min)/increment)*increment).toFixed(Math.min(14,Math.max(precision(min),precision(increment)))))));
 };
 const values = (range ? (Array.isArray(raw) ? raw : [min,raw]) : [Array.isArray(raw) ? raw[0] : raw]).map(snap).sort((a,b) => a-b);
 const latest = useRef<SliderValue>(range ? [values[0],values[1]] : values[0]);
 const percent = (n: number) => max === min ? 0 : (n-min)/(max-min)*100;
 const location = (n: number): CSSProperties => vertical ? { bottom: `${reverse ? 100-percent(n) : percent(n)}%` } : { left: `${reverse ? 100-percent(n) : percent(n)}%` };
 const commit = (index: number, next: number) => { const result = [...values]; result[index] = range ? Math.max(index ? values[0] : min, Math.min(index ? max : values[1],snap(next))) : snap(next); const output: SliderValue = range ? [result[0],result[1]] : result[0]; latest.current = output; if (!controlled) setInner(output); if (result.some((n,i) => n !== values[i])) notifyChange?.(output); return output; };
 const pointerValue = (event: { clientX: number; clientY: number }) => { const rect = root.current!.getBoundingClientRect(); let ratio = vertical ? (rect.bottom-event.clientY)/(rect.height || 1) : (event.clientX-rect.left)/(rect.width || 1); if (reverse) ratio = 1-ratio; return snap(min+ratio*(max-min)); };
 useImperativeHandle(ref, () => ({ nativeElement: root.current, focus: () => handles.current[0]?.focus(), blur: () => handles.current.forEach(h => h?.blur()) }), []);
 useEffect(() => { if (disabled) setDragging(null); }, [disabled]);
 const start = range && included ? Math.min(...values.map(percent)) : 0, end = Math.max(...values.map(percent));
 const trackStyle: CSSProperties = vertical ? { bottom:`${reverse ? 100-end : start}%`, height:`${end-start}%` } : { left:`${reverse ? 100-end : start}%`,width:`${end-start}%` };
 return <div {...rest} ref={root} className={['pi-slider',vertical && 'pi-slider--vertical', disabled && 'pi-slider--disabled',status && `pi-slider--${status}`,className,rootClassName].filter(Boolean).join(' ')} style={{ ...themeVariables(theme), ...style }}
 onPointerDown={event => { if (disabled || event.button !== 0 || max === min) return; const next = pointerValue(event); const targetHandle = (event.target as HTMLElement).closest('[data-handle]'); const index = targetHandle ? Number(targetHandle.getAttribute('data-handle')) : values.length === 1 || Math.abs(values[0]-next) <= Math.abs(values[1]-next) ? 0 : 1; setDragging(index); event.currentTarget.setPointerCapture?.(event.pointerId); handles.current[index]?.focus(); commit(index,next); }}
 onPointerMove={event => { if (dragging !== null && !disabled) commit(dragging,pointerValue(event)); }}
 onPointerUp={event => { if (dragging === null) return; event.currentTarget.releasePointerCapture?.(event.pointerId); setDragging(null); notifyComplete?.(latest.current); }} onPointerCancel={() => setDragging(null)}>
 <div className="pi-slider__rail" />{included && <div className="pi-slider__track" style={trackStyle} />}
 {points.map(n => { const mark = marks[n]; const config = mark && typeof mark === 'object' && 'label' in mark ? mark as { label: ReactNode; style?: CSSProperties } : null; return <span key={n} className="pi-slider__mark" style={{ ...location(n),...config?.style }}><button type="button" tabIndex={-1} disabled={disabled} onPointerDown={event => event.stopPropagation()} onClick={() => { const index = values.length === 1 || Math.abs(values[0]-n) <= Math.abs(values[1]-n) ? 0 : 1; const result = commit(index,n); notifyComplete?.(result); }}>{config?.label ?? mark as ReactNode}</button></span>; })}
 {values.map((n,i) => <span key={i} className="pi-slider__handle-host" style={location(n)}><Tooltip title={tooltip?.formatter === null ? null : tooltip?.formatter ? tooltip.formatter(n) : n} open={tooltip?.formatter === null || disabled ? false : tooltip?.open ?? (dragging === i ? true : undefined)}><button type="button" ref={node => { handles.current[i] = node; }} data-handle={i} className="pi-slider__handle" role="slider" aria-labelledby={rest['aria-labelledby']} aria-describedby={rest['aria-describedby']} aria-invalid={rest['aria-invalid'] ?? (status === 'error' ? true : undefined)} aria-label={Array.isArray(ariaLabelForHandle) ? ariaLabelForHandle[i] : ariaLabelForHandle ?? (range ? `范围${i ? '终点' : '起点'}` : '数值')} aria-valuemin={range && i === 1 ? values[0] : min} aria-valuemax={range && i === 0 ? values[1] : max} aria-valuenow={n} aria-orientation={vertical ? 'vertical' : 'horizontal'} disabled={disabled}
 onKeyDown={event => { onKeyDown?.(event); if (event.defaultPrevented || disabled) return; let next = n; const delta = step === null ? 0 : Number.isFinite(step) && step > 0 ? step : 1; const direction = (event.key === 'ArrowRight' || event.key === 'ArrowUp' ? 1 : -1)*(reverse ? -1 : 1);
  if (['ArrowRight','ArrowLeft','ArrowUp','ArrowDown'].includes(event.key)) next = step === null ? (direction > 0 ? [min,...points,max].find(p => p > n) ?? max : [min,...points,max].reverse().find(p => p < n) ?? min) : n+direction*delta;
  else if (event.key === 'Home') next=min; else if (event.key === 'End') next=max; else if (event.key === 'PageUp') next=n+delta*10; else if (event.key === 'PageDown') next=n-delta*10; else return;
  event.preventDefault(); const result = commit(i,next); notifyComplete?.(result);
 }} /></Tooltip></span>)}
 </div>;
});
defineFieldBinding(Slider, { toControlValue: (value, props) => value ?? (props.range ? [props.min ?? 0, props.max ?? 100] : props.min ?? 0) });
