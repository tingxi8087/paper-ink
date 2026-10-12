import { forwardRef, useEffect, useId, useImperativeHandle, useRef, useState, type ReactNode } from 'react';
import { Input, type InputProps, type InputRef } from '../input/index.js';
import { useTheme } from '../config-provider/index.js';
import { themeVariables } from '../theme/variables.js';
import { defineFieldBinding } from '../internal/field-binding.js';
export interface AutoCompleteOption { value: string; label?: ReactNode; disabled?: boolean }
export interface AutoCompleteProps extends Omit<InputProps, 'value' | 'defaultValue' | 'onChange' | 'onSelect'> {
 value?: string; defaultValue?: string; options?: AutoCompleteOption[];
 onChange?: (value: string) => void; onSearch?: (value: string) => void;
 onSelect?: (value: string, option: AutoCompleteOption) => void;
 filterOption?: boolean | ((input: string, option: AutoCompleteOption) => boolean);
 open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void;
 notFoundContent?: ReactNode;
}
export type AutoCompleteRef = InputRef;
export const AutoComplete = forwardRef<AutoCompleteRef, AutoCompleteProps>(function AutoComplete(props, ref) {
 const { value, defaultValue = '', options = [], onChange, onSearch, onSelect, filterOption = false,
 open, defaultOpen = false, onOpenChange, notFoundContent = null, disabled, readOnly,
 className = '', style, onKeyDown, onFocus, onBlur, onCompositionStart, onCompositionEnd, ...rest } = props;
 const theme = useTheme();
 const controlled = Object.prototype.hasOwnProperty.call(props, 'value');
 const [innerValue, setValue] = useState(defaultValue), [innerOpen, setOpen] = useState(defaultOpen), [active, setActive] = useState(-1);
 const composing = useRef(false), composedSearch = useRef<string | null>(null);
 const input = useRef<InputRef>(null), root = useRef<HTMLDivElement>(null);
 const listId = `pi-autocomplete-${useId()}`;
 const text = (controlled ? value : innerValue) ?? '';
 const visible = options.filter(option => filterOption === false || (typeof filterOption === 'function' ? filterOption(text, option) : !text || option.value.toLowerCase().includes(text.toLowerCase())));
 const enabled = visible.map((item, i) => item.disabled ? -1 : i).filter(i => i >= 0);
 const expanded = !disabled && !readOnly && (open ?? innerOpen) && (visible.length > 0 || notFoundContent != null);
 const changeOpen = (next: boolean) => { if (next === (open ?? innerOpen)) return; if (open === undefined) setOpen(next); onOpenChange?.(next); };
 const update = (next: string, search: boolean) => { if (!controlled) setValue(next); onChange?.(next); if (search) onSearch?.(next); };
 const select = (option: AutoCompleteOption) => { if (option.disabled || disabled || readOnly) return; update(option.value, false); onSelect?.(option.value, option); changeOpen(false); input.current?.focus(); };
 useImperativeHandle(ref, () => ({ get input() { return input.current?.input ?? null; }, get nativeElement() { return root.current; }, focus: opts => input.current?.focus(opts), blur: () => input.current?.blur(), select: () => input.current?.select(), setSelectionRange: (a,b,c) => input.current?.setSelectionRange(a,b,c) }), []);
 useEffect(() => { setActive(-1); }, [text, JSON.stringify(visible.map(o => [o.value, o.disabled]))]);
 useEffect(() => { if (active >= 0) document.getElementById(`${listId}-${active}`)?.scrollIntoView?.({ block: 'nearest' }); }, [active, listId]);
 useEffect(() => { if (!expanded) return; const close = (event: PointerEvent) => { if (event.target instanceof Node && !root.current?.contains(event.target)) changeOpen(false); }; document.addEventListener('pointerdown', close); return () => document.removeEventListener('pointerdown', close); });
 return <div ref={root} className={`pi-auto-complete ${className}`} style={{ ...themeVariables(theme), ...style }}>
  <Input {...rest} ref={input} value={text} disabled={disabled} readOnly={readOnly} role="combobox" aria-autocomplete="list" aria-expanded={expanded} aria-controls={expanded ? listId : undefined} aria-activedescendant={expanded && active >= 0 ? `${listId}-${active}` : undefined}
   onChange={event => { const next = event.target.value; const skip = composing.current || composedSearch.current === next; composedSearch.current = null; update(next, !skip); changeOpen(true); }}
   onCompositionStart={event => { composing.current = true; composedSearch.current = null; onCompositionStart?.(event); }} onCompositionEnd={event => { composing.current = false; composedSearch.current = event.currentTarget.value; onSearch?.(event.currentTarget.value); onCompositionEnd?.(event); }}
   onFocus={event => { onFocus?.(event); changeOpen(true); }} onBlur={event => { onBlur?.(event); changeOpen(false); }}
   onKeyDown={event => { onKeyDown?.(event); if (event.defaultPrevented || disabled || readOnly || event.nativeEvent.isComposing || event.keyCode === 229) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); changeOpen(true); const pos = enabled.indexOf(active); setActive(enabled[pos < 0 ? (event.key === 'ArrowDown' ? 0 : enabled.length - 1) : (pos + (event.key === 'ArrowDown' ? 1 : -1) + enabled.length) % enabled.length] ?? -1); }
    else if (event.key === 'Enter' && expanded && active >= 0) { event.preventDefault(); select(visible[active]); }
    else if (event.key === 'Escape') { changeOpen(false); setActive(-1); }
   }} />
  {expanded && <div id={listId} role="listbox" className="pi-auto-complete__popup">
   {visible.length ? visible.map((option, i) => <div key={option.value} id={`${listId}-${i}`} role="option" aria-selected={text === option.value} aria-disabled={option.disabled || undefined} className={`pi-auto-complete__option ${active === i ? 'pi-auto-complete__option--active' : ''}`} onMouseDown={event => event.preventDefault()} onMouseEnter={() => !option.disabled && setActive(i)} onClick={() => select(option)}>{option.label ?? option.value}</div>) : <div className="pi-auto-complete__empty">{notFoundContent}</div>}
  </div>}
 </div>;
});
defineFieldBinding(AutoComplete, { toControlValue: value => value == null ? '' : value });
