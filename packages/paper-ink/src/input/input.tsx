import { forwardRef, useImperativeHandle, useRef } from 'react';
import { useTheme } from '../config-provider/index.js';
import { themeVariables } from '../theme/variables.js';
import type { InputProps, InputRef } from './types.js';
import { ClearButton, Count, clearChangeEvent, focusInput, useFormReset, useInputValue } from './shared.js';

export const InputControl = forwardRef<InputRef, InputProps>(function Input({
  value, defaultValue, onChange, onPressEnter, onKeyDown, onClear, allowClear = false,
  showCount = false, prefix, suffix, size = 'middle', status, className = '', rootClassName = '', style,
  disabled, readOnly, maxLength, ...rest
}, ref) {
  const theme = useTheme();
  const input = useRef<HTMLInputElement>(null);
  const root = useRef<HTMLSpanElement>(null);
  const [text, update] = useInputValue(value, defaultValue);
  useFormReset(input, value !== undefined, defaultValue, update);
  useImperativeHandle(ref, () => ({
    input: input.current, nativeElement: root.current,
    focus: options => focusInput(input.current, options), blur: () => input.current?.blur(),
    select: () => input.current?.select(),
    setSelectionRange: (start, end, direction) => input.current?.setSelectionRange(start, end, direction),
  }), []);
  const classes = ['pi-input', `pi-input--${size}`, status && `pi-input--${status}`, disabled && 'pi-input--disabled', className, rootClassName].filter(Boolean).join(' ');
  return <span ref={root} className={classes} style={{ ...themeVariables(theme), ...style }}>
    {prefix != null && <span className="pi-input__affix">{prefix}</span>}
    <input {...rest} ref={input} className="pi-input__control" disabled={disabled} readOnly={readOnly} maxLength={maxLength} value={text}
      aria-invalid={rest['aria-invalid'] ?? (status === 'error' ? true : undefined)}
      onChange={event => { update(event.target.value); onChange?.(event); }}
      onKeyDown={event => {
        onKeyDown?.(event);
        if (!event.defaultPrevented && event.key === 'Enter' && !event.nativeEvent.isComposing && event.keyCode !== 229) onPressEnter?.(event);
      }} />
    {allowClear && text && !disabled && !readOnly && <ClearButton allowClear={allowClear} clear={event => {
      if (!input.current) return;
      update(''); onChange?.(clearChangeEvent(event, input.current)); onClear?.(); input.current.focus();
    }} />}
    {suffix != null && <span className="pi-input__affix">{suffix}</span>}
    <Count value={text} maxLength={maxLength} showCount={showCount} />
  </span>;
});
