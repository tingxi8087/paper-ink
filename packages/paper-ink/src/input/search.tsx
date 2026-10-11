import { defineFieldBinding, textFieldBinding } from '../internal/field-binding.js';
import { cloneElement, forwardRef, isValidElement, useImperativeHandle, useRef, type MouseEvent, type ReactElement } from 'react';
import { Button } from '../button/button.js';
import type { ButtonProps } from '../button/types.js';
import { SearchIcon } from '../internal/icons.js';
import { useTheme } from '../config-provider/index.js';
import { themeVariables } from '../theme/variables.js';
import { InputControl } from './input.js';
import type { InputRef, SearchProps } from './types.js';

export const Search = forwardRef<InputRef, SearchProps>(function Search({
 enterButton = false, loading = false, searchIcon, onSearch, onChange, onPressEnter,
 onCompositionStart, onCompositionEnd, size = 'middle', disabled, className, rootClassName, style, hidden, ...rest
}, ref) {
 const theme = useTheme(); const input = useRef<InputRef>(null); const root = useRef<HTMLSpanElement>(null); const composing = useRef(false);
 useImperativeHandle(ref, () => ({ get input() { return input.current?.input ?? null; }, get nativeElement() { return root.current; }, focus: options => input.current?.focus(options), blur: () => input.current?.blur(), select: () => input.current?.select(), setSelectionRange: (start,end,direction) => input.current?.setSelectionRange(start,end,direction) }), []);
 function search(event: MouseEvent<HTMLElement>) { if (disabled || loading || event.defaultPrevented) return; onSearch?.(input.current?.input?.value ?? '', event, {source:'input'}); }
 function preserveFocus(event: MouseEvent<HTMLElement>) { if (document.activeElement === input.current?.input) event.preventDefault(); }
 let button;
 if (isValidElement<ButtonProps>(enterButton) && (enterButton.type === Button || enterButton.type === 'button')) {
  const custom = enterButton as ReactElement<ButtonProps>; const isLibraryButton = custom.type === Button;
  button = cloneElement(custom, {
   className: ['pi-input-search__button', custom.props.className].filter(Boolean).join(' '),
   disabled: disabled || custom.props.disabled || (!isLibraryButton && loading),
   ...(isLibraryButton ? {size, loading: loading || custom.props.loading} : {}),
   onMouseDown: event => { custom.props.onMouseDown?.(event as MouseEvent<HTMLButtonElement>); preserveFocus(event); },
   onClick: event => { custom.props.onClick?.(event); search(event); },
  });
 } else {
  button = <Button className="pi-input-search__button" size={size} type={enterButton ? 'primary' : 'default'} disabled={disabled} loading={loading} icon={typeof enterButton === 'boolean' ? searchIcon ?? <SearchIcon /> : undefined} aria-label={typeof enterButton === 'boolean' ? '搜索' : undefined} onMouseDown={preserveFocus} onClick={search}>{typeof enterButton === 'boolean' ? null : enterButton}</Button>;
 }
 return <span ref={root} hidden={hidden} className={['pi-input-search',`pi-input-search--${size}`,className,rootClassName].filter(Boolean).join(' ')} style={{...themeVariables(theme),...style}}>
  <InputControl {...rest} ref={input} type="search" disabled={disabled} size={size} onChange={event => {
   if (event.nativeEvent.type === 'click') onSearch?.(event.target.value,event,{source:'clear'});
   onChange?.(event);
  }} onPressEnter={event => { if(composing.current || loading || disabled)return; onPressEnter?.(event); if(!event.defaultPrevented)onSearch?.(event.currentTarget.value,event,{source:'input'}); }}
  onCompositionStart={event => {composing.current=true;onCompositionStart?.(event);}} onCompositionEnd={event => {composing.current=false;onCompositionEnd?.(event);}} />
  {button}
 </span>;
});

defineFieldBinding(Search, textFieldBinding);
