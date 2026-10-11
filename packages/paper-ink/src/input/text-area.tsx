import { defineFieldBinding, textFieldBinding } from '../internal/field-binding.js';
import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef } from 'react';
import { useTheme } from '../config-provider/index.js';
import { themeVariables } from '../theme/variables.js';
import type { TextAreaProps, TextAreaRef } from './types.js';
import { ClearButton, Count, clearChangeEvent, focusInput, useFormReset, useInputValue } from './shared.js';

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export const TextArea = forwardRef<TextAreaRef, TextAreaProps>(function TextArea({
  value, defaultValue, onChange, onPressEnter, onKeyDown, onClear, allowClear = false, showCount = false,
  size = 'middle', status, autoSize = false, rows = 3, className = '', rootClassName = '', style,
  disabled, readOnly, maxLength, ...rest
}, ref) {
  const theme = useTheme();
  const input = useRef<HTMLTextAreaElement>(null);
  const root = useRef<HTMLSpanElement>(null);
  const [text, update] = useInputValue(value, defaultValue);
  useFormReset(input, value !== undefined, defaultValue, update);
  const minRows = typeof autoSize === 'object' ? autoSize.minRows ?? 1 : 1;
  const maxRows = typeof autoSize === 'object' ? autoSize.maxRows : undefined;
  useImperativeHandle(ref, () => ({
    nativeElement: root.current, resizableTextArea: { textArea: input.current },
    focus: options => focusInput(input.current, options), blur: () => input.current?.blur(),
    select: () => input.current?.select(),
    setSelectionRange: (start, end, direction) => input.current?.setSelectionRange(start, end, direction),
  }), []);
  useIsomorphicLayoutEffect(() => {
    const node = input.current;
    if (!node || !autoSize) return;
    const measure = () => {
      const computed = getComputedStyle(node);
      const line = parseFloat(computed.lineHeight) || (parseFloat(computed.fontSize) || 14) * 1.5;
      const padding = (parseFloat(computed.paddingTop) || 0) + (parseFloat(computed.paddingBottom) || 0);
      const border = (parseFloat(computed.borderTopWidth) || 0) + (parseFloat(computed.borderBottomWidth) || 0);
      const scrollTop = node.scrollTop;
      node.style.height = '0px';
      const minimum = Math.max(1, minRows) * line + padding;
      const maximum = maxRows === undefined ? Infinity : Math.max(Math.max(1, minRows), maxRows) * line + padding;
      const height = Math.min(maximum, Math.max(minimum, node.scrollHeight));
      node.style.height = `${height + border}px`;
      node.style.overflowY = node.scrollHeight > maximum ? 'auto' : 'hidden';
      node.scrollTop = scrollTop;
    };
    measure();
    let width = node.getBoundingClientRect().width;
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(() => {
      const next = node.getBoundingClientRect().width;
      if (next !== width) { width = next; measure(); }
    });
    observer?.observe(node);
    return () => {
      observer?.disconnect();
      node.style.height = typeof style?.height === 'number' ? `${style.height}px` : style?.height ?? '';
      node.style.overflowY = style?.overflowY ?? '';
    };
  }, [text, autoSize, minRows, maxRows, rows, size, theme, style?.height, style?.overflowY]);
  const classes = ['pi-textarea', `pi-input--${size}`, status && `pi-input--${status}`, disabled && 'pi-input--disabled', rootClassName].filter(Boolean).join(' ');
  return <span ref={root} className={classes} style={{ ...themeVariables(theme), width: style?.width, maxWidth: style?.maxWidth, minWidth: style?.minWidth }}>
    <textarea {...rest} ref={input} rows={rows} className={`pi-textarea__control ${className}`} style={{ ...style, width: '100%', ...(autoSize ? { resize: 'none' } : {}) }}
      disabled={disabled} readOnly={readOnly} maxLength={maxLength} value={text}
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
    <Count value={text} maxLength={maxLength} showCount={showCount} />
  </span>;
});

defineFieldBinding(TextArea, textFieldBinding);
