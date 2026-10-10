import { useEffect, useState, type ChangeEvent, type MouseEvent, type RefObject } from 'react';
import type { InputFocusOptions, SharedInputProps } from './types.js';

export function useInputValue(value: unknown, defaultValue: unknown) {
  const [inner, setInner] = useState(() => String(defaultValue ?? ''));
  return [value === undefined ? inner : String(value ?? ''), (next: string) => {
    if (value === undefined) setInner(next);
  }] as const;
}
export function useFormReset<T extends HTMLInputElement | HTMLTextAreaElement>(
  input: RefObject<T | null>, controlled: boolean, defaultValue: unknown, update: (value: string) => void,
) {
  useEffect(() => {
    const form = input.current?.form;
    if (!form || controlled) return;
    let mounted = true;
    const reset = (event: Event) => {
      // The default can still be prevented by another reset handler during bubbling.
      queueMicrotask(() => {
        if (mounted && !event.defaultPrevented) update(String(defaultValue ?? ''));
      });
    };
    form.addEventListener('reset', reset);
    return () => { mounted = false; form.removeEventListener('reset', reset); };
  });
}
export function focusInput(input: HTMLInputElement | HTMLTextAreaElement | null, options?: InputFocusOptions) {
  input?.focus(options);
  if (!input || !options?.cursor) return;
  const end = input.value.length;
  try {
    input.setSelectionRange(options.cursor === 'end' ? end : 0, options.cursor === 'start' ? 0 : end);
  } catch { /* Native input types such as number do not support selection. */ }
}
// A detached clone exposes the cleared value without changing a controlled DOM node.
export function clearChangeEvent<T extends HTMLInputElement | HTMLTextAreaElement>(event: MouseEvent<HTMLButtonElement>, input: T): ChangeEvent<T> {
  const target = input.cloneNode() as T;
  target.value = '';
  return { ...event, type: 'change', target, currentTarget: target } as unknown as ChangeEvent<T>;
}
export function Count({ value, maxLength, showCount }: { value: string; maxLength?: number; showCount: SharedInputProps['showCount'] }) {
  if (!showCount) return null;
  const count = value.length;
  const formatter = typeof showCount === 'object' ? showCount.formatter : undefined;
  return <span className="pi-input__count">{formatter ? formatter({ value, count, maxLength }) : `${count}${maxLength === undefined ? '' : ` / ${maxLength}`}`}</span>;
}
export function ClearButton({ allowClear, clear }: { allowClear: SharedInputProps['allowClear']; clear: (event: MouseEvent<HTMLButtonElement>) => void }) {
  return <button type="button" className="pi-input__clear" aria-label="清空内容" onMouseDown={event => event.preventDefault()} onClick={clear}>{typeof allowClear === 'object' ? allowClear.clearIcon ?? '×' : '×'}</button>;
}
