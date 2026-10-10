import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type InputHTMLAttributes, type ReactNode, type KeyboardEvent, type CSSProperties } from 'react';
import { BigIntDecimal, toFixed } from '@rc-component/mini-decimal';
const getDecimal = (value: number | string) => new BigIntDecimal(value);
import { ChevronDownIcon } from '../internal/icons.js';
import { useTheme } from '../config-provider/index.js';
import { themeVariables } from '../theme/variables.js';
import { focusInput, useFormReset } from '../input/shared.js';
import type { InputFocusOptions } from '../input/types.js';
export type InputNumberValue = number | string;
export interface InputNumberRef { focus: (options?: InputFocusOptions) => void; blur: () => void; nativeElement: HTMLSpanElement | null; input: HTMLInputElement | null }
export interface InputNumberProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange' | 'size' | 'min' | 'max' | 'step' | 'prefix'> {
  value?: InputNumberValue | null; defaultValue?: InputNumberValue | null;
  onChange?: (value: InputNumberValue | null) => void;
  min?: InputNumberValue; max?: InputNumberValue; step?: InputNumberValue; precision?: number; stringMode?: boolean;
  size?: 'small' | 'middle' | 'large'; status?: 'error' | 'warning'; variant?: 'outlined' | 'filled' | 'borderless' | 'underlined';
  controls?: boolean | { upIcon?: ReactNode; downIcon?: ReactNode }; keyboard?: boolean; changeOnBlur?: boolean; changeOnWheel?: boolean;
  formatter?: (value: InputNumberValue | undefined, info: { userTyping: boolean; input: string }) => string;
  parser?: (displayValue: string | undefined) => InputNumberValue; decimalSeparator?: string;
  prefix?: ReactNode; suffix?: ReactNode; onPressEnter?: (event: KeyboardEvent<HTMLInputElement>) => void;
  onStep?: (value: InputNumberValue, info: { offset: number; type: 'up' | 'down'; emitter: 'handler' | 'keydown' | 'wheel' }) => void;
}
export const InputNumber = forwardRef<InputNumberRef, InputNumberProps>(function InputNumber({
  value, defaultValue, onChange, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER, step = 1, precision, stringMode = false,
  size = 'middle', status, variant = 'outlined', controls = true, keyboard = true, changeOnBlur = true, changeOnWheel = false,
  formatter, parser, decimalSeparator = '.', prefix, suffix, disabled, readOnly, className, style, onKeyDown, onPressEnter, onBlur, onFocus, onWheel, onStep, ...rest
}, ref) {
  const theme = useTheme(); const root = useRef<HTMLSpanElement>(null); const input = useRef<HTMLInputElement>(null);
  const [inner, setInner] = useState<InputNumberValue | null>(defaultValue ?? null);
  const current = value === undefined ? inner : value;
  const [draft, setDraft] = useState(String(current ?? '')); const [typing, setTyping] = useState(false);
  const focused = useRef(false); const composing = useRef(false); const latest = useRef(current); latest.current = current;
  useEffect(() => {
    if (focused.current && typing && (current === null ? parse(draft).trim() === '' : current != null && getDecimal(parse(draft)).equals(getDecimal(current)))) return;
    setDraft(String(current ?? '')); setTyping(false);
  }, [current]);
  useImperativeHandle(ref, () => ({ focus: options => focusInput(input.current, options), blur: () => input.current?.blur(), nativeElement: root.current, input: input.current }));
  useFormReset(input, value !== undefined, defaultValue, next => { const decimal = getDecimal(next); setInner(decimal.isInvalidate() ? null : stringMode ? decimal.toString() : decimal.toNumber()); setDraft(next); setTyping(false); });
  const parse = (text: string) => String(parser ? parser(text) : text.replace(decimalSeparator, '.').replace(/\s/g, ''));
  const inRange = (text: string) => getDecimal(min).lessEquals(getDecimal(text)) && getDecimal(text).lessEquals(getDecimal(max));
  function normalize(text: string, clamp: boolean) {
    let decimal = getDecimal(text);
    if (decimal.isInvalidate()) return null;
    if (clamp) {
      if (!getDecimal(min).lessEquals(decimal)) decimal = getDecimal(min);
      if (!decimal.lessEquals(getDecimal(max))) decimal = getDecimal(max);
      if (precision !== undefined && Number.isInteger(precision) && precision >= 0) {
        let fixed = getDecimal(toFixed(decimal.toString(), '.', precision));
        if (!getDecimal(min).lessEquals(fixed) || !fixed.lessEquals(getDecimal(max))) fixed = getDecimal(toFixed(decimal.toString(), '.', precision, true));
        if (getDecimal(min).lessEquals(fixed) && fixed.lessEquals(getDecimal(max))) decimal = fixed;
      }
    }
    return decimal.isInvalidate() ? null : decimal.toString();
  }
  function emit(text: string | null) {
    const next = text === null ? null : stringMode ? text : getDecimal(text).toNumber();
    const previous = latest.current;
    const equal = next === null ? previous === null : previous != null && getDecimal(next).equals(getDecimal(previous));
    if (value === undefined) { setInner(next); latest.current = next; }
    if (!equal) onChange?.(next);
    return next;
  }
  function finish() {
    const parsed = parse(draft);
    if (changeOnBlur && !composing.current) {
      if (parsed.trim() === '') emit(null);
      else { const next = normalize(parsed, true); if (next !== null) emit(next); }
    }
    setDraft(String(latest.current ?? '')); setTyping(false);
  }
  function move(type: 'up' | 'down', emitter: 'handler' | 'keydown' | 'wheel', multiplier = 1) {
    if (disabled || readOnly || composing.current) return;
    const offset = getDecimal(step).multi(multiplier);
    if (offset.isInvalidate() || offset.lessEquals(getDecimal(0))) return;
    const parsed = normalize(parse(draft), false) ?? String(current ?? 0);
    const next = normalize(getDecimal(parsed).add(type === 'up' ? offset.toString() : offset.negate().toString()).toString(), true);
    if (next === null) return;
    const emitted = emit(next)!; setDraft(value === undefined ? next : String(latest.current ?? '')); setTyping(false);
    onStep?.(emitted, { offset: (type === 'up' ? offset : offset.negate()).toNumber(), type, emitter });
    input.current?.focus();
  }
  let numericDisplay = draft.replace('.', decimalSeparator);
  if (!typing && precision !== undefined && Number.isInteger(precision) && precision >= 0 && !getDecimal(draft).isInvalidate()) {
    const fixed = toFixed(draft, '.', precision);
    // Never display rounding that would move an in-range value outside its bounds.
    if (!inRange(draft) || inRange(fixed)) numericDisplay = fixed.replace('.', decimalSeparator);
  }
  const display = formatter ? formatter(typing ? normalize(parse(draft), false) ?? undefined : current ?? undefined, { userTyping: typing, input: draft }) : numericDisplay;
  const atMin = current != null && getDecimal(current).lessEquals(getDecimal(min));
  const atMax = current != null && getDecimal(max).lessEquals(getDecimal(current));
  return <span ref={root} className={['pi-input-number', `pi-input-number--${size}`, `pi-input-number--${variant}`, status && `pi-input-number--${status}`, disabled && 'pi-input-number--disabled', className].filter(Boolean).join(' ')} style={{ ...themeVariables(theme), ...style } as CSSProperties}>
    {prefix != null && <span className="pi-input-number__affix">{prefix}</span>}
    <input {...rest} ref={input} type="text" role="spinbutton" inputMode={rest.inputMode ?? 'decimal'} disabled={disabled} readOnly={readOnly} value={display}
      aria-valuemin={Number(min)} aria-valuemax={Number(max)} aria-valuenow={current == null ? undefined : Number(current)} aria-valuetext={String(current ?? '')}
      aria-invalid={rest['aria-invalid'] ?? (status === 'error' || (current != null && !inRange(String(current))) || undefined)}
      onFocus={event => { focused.current = true; onFocus?.(event); }} onBlur={event => { focused.current = false; finish(); onBlur?.(event); }}
      onCompositionStart={event => { composing.current = true; rest.onCompositionStart?.(event); }}
      onCompositionEnd={event => { composing.current = false; const text = parse(event.currentTarget.value); if (text.trim() === '') emit(null); else { const next = normalize(text, false); if (next !== null && inRange(next)) emit(next); } rest.onCompositionEnd?.(event); }}
      onChange={event => { const text = event.target.value; setDraft(text); setTyping(true); if (composing.current) return; const parsed = parse(text); if (parsed.trim() === '') emit(null); else { const next = normalize(parsed, false); if (next !== null && inRange(next)) emit(next); } }}
      onKeyDown={event => { onKeyDown?.(event); if (event.defaultPrevented || event.nativeEvent.isComposing) return; if (event.key === 'Enter') { finish(); onPressEnter?.(event); } else if (keyboard && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) { event.preventDefault(); move(event.key === 'ArrowUp' ? 'up' : 'down', 'keydown', event.shiftKey ? 10 : event.ctrlKey || event.metaKey ? .1 : 1); } }}
      onWheel={event => { onWheel?.(event); if (!event.defaultPrevented && changeOnWheel && focused.current && event.deltaY) move(event.deltaY < 0 ? 'up' : 'down', 'wheel'); }} />
    {suffix != null && <span className="pi-input-number__affix">{suffix}</span>}
    {controls && <span className="pi-input-number__controls">
      <button type="button" tabIndex={-1} disabled={disabled || readOnly || atMax} aria-label="增加" onMouseDown={event => event.preventDefault()} onClick={() => move('up', 'handler')}>{typeof controls === 'object' ? controls.upIcon ?? <ChevronDownIcon style={{ transform: 'rotate(180deg)' }} width={10} height={10} /> : <ChevronDownIcon style={{ transform: 'rotate(180deg)' }} width={10} height={10} />}</button>
      <button type="button" tabIndex={-1} disabled={disabled || readOnly || atMin} aria-label="减少" onMouseDown={event => event.preventDefault()} onClick={() => move('down', 'handler')}>{typeof controls === 'object' ? controls.downIcon ?? <ChevronDownIcon width={10} height={10} /> : <ChevronDownIcon width={10} height={10} />}</button>
    </span>}
  </span>;
});
