import { inertAttributes } from '../internal/inert.js';
import { defineFieldBinding } from '../internal/field-binding.js';
import { usePresence } from '../internal/motion.js';
import { CheckIcon, ChevronDownIcon, CloseIcon } from '../internal/icons.js';
import { forwardRef, useEffect, useId, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactElement, type RefAttributes } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../config-provider/index.js';
import { themeVariables } from '../theme/variables.js';
import type { SelectOption, SelectProps, SelectRawValue, SelectRef, SelectValue } from './types.js';

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
const asArray = (value: SelectValue): SelectRawValue[] => value === undefined ? [] : Array.isArray(value) ? value : [value];
const textLabel = (option: SelectOption) => typeof option.label === 'string' || typeof option.label === 'number' ? String(option.label) : String(option.value);

const SelectControl = forwardRef<SelectRef, SelectProps>(function Select(props, ref) {
  const {
  options = [], value, defaultValue, mode, onChange, onSelect, onDeselect, showSearch,
  filterOption = true, optionFilterProp = 'value', onSearch, searchValue,
  allowClear = false, onClear, disabled = false, status, size = 'middle', placeholder,
  loading = false, notFoundContent = '暂无数据', open, defaultOpen = false, onOpenChange,
  getPopupContainer, className = '', rootClassName = '', style, name, form, autoFocus,
  onKeyDown, onFocus, onBlur, onClick, id: providedId, ...rest
} = props;
  const controlled = Object.prototype.hasOwnProperty.call(props, 'value');
  const theme = useTheme();
  const generatedId = useId();
  const id = providedId ?? `pi-select-${generatedId}`;
  const listId = `${id}-list`;
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const multiple = mode !== undefined;
  const searchable = showSearch ?? multiple;
  const [innerValue, setInnerValue] = useState<SelectValue>(defaultValue);
  const values = asArray(controlled ? value : innerValue);
  const [innerOpen, setInnerOpen] = useState(defaultOpen);
  const expanded = !disabled && (open ?? innerOpen);
  const present = usePresence(expanded, 180);
  const [innerSearch, setInnerSearch] = useState('');
  const query = searchValue ?? innerSearch;
  const [active, setActive] = useState(-1);
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const [position, setPosition] = useState<CSSProperties>({ position: 'fixed', visibility: 'hidden' });
  const allOptions = useMemo<SelectOption[]>(() => [...options, ...(mode === 'tags' ? values.filter(raw => !options.some(option => option.value === raw)).map(raw => ({ value: raw, label: String(raw) })) : [])], [options, mode, values]);
  const optionOf = (raw: SelectRawValue): SelectOption => allOptions.find(option => option.value === raw) ?? { value: raw, label: String(raw) };
  const filtered = allOptions.filter(option => !query || filterOption === false || (typeof filterOption === 'function' ? filterOption(query, option) : String(optionFilterProp === 'label' ? textLabel(option) : option.value).toLocaleLowerCase().includes(query.toLocaleLowerCase())));
  const freshTag = mode === 'tags' && query.trim() && !allOptions.some(option => String(option.value) === query.trim());
  const visible: SelectOption[] = freshTag ? [{ value: query.trim(), label: query.trim() }, ...filtered] : filtered;
  const enabled = visible.map((option, index) => !option.disabled ? index : -1).filter(index => index >= 0);
  const visibleKey = JSON.stringify(visible.map(option => [option.value, Boolean(option.disabled)]));
  const changeOpen = (next: boolean) => {
    if (disabled || next === expanded) return;
    if (open === undefined) setInnerOpen(next);
    onOpenChange?.(next);
  };
  const changeSearch = (next: string, notify = true) => {
    if (searchValue === undefined) setInnerSearch(next);
    if (notify) onSearch?.(next);
  };
  const commit = (next: SelectRawValue[]) => {
    const result: SelectValue = multiple ? next : next[0];
    if (!controlled) setInnerValue(result);
    onChange?.(result, multiple ? next.map(optionOf) : next.length ? optionOf(next[0]) : undefined);
  };
  const choose = (option: SelectOption) => {
    if (disabled || option.disabled) return;
    if (multiple && values.includes(option.value)) {
      commit(values.filter(raw => raw !== option.value)); onDeselect?.(option.value, option);
    } else {
      commit(multiple ? [...values, option.value] : [option.value]); onSelect?.(option.value, option);
    }
    changeSearch('', false);
    if (!multiple) changeOpen(false);
    input.current?.focus();
  };
  useImperativeHandle(ref, () => ({ nativeElement: root.current, focus: opts => input.current?.focus(opts), blur: () => input.current?.blur() }), []);
  useEffect(() => {
    if (expanded && root.current) setContainer(getPopupContainer?.(root.current) ?? document.body);
  }, [expanded, getPopupContainer]);
  useEffect(() => {
    if (!expanded) return;
    const close = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target) && !popup.current?.contains(event.target)) changeOpen(false);
    };
    document.addEventListener('pointerdown', close, true);
    return () => document.removeEventListener('pointerdown', close, true);
  });
  useIsomorphicLayoutEffect(() => {
    if (!expanded) { setActive(-1); return; }
    setActive(enabled.find(index => values.includes(visible[index].value)) ?? enabled[0] ?? -1);
  }, [expanded, query, visibleKey]);
  useIsomorphicLayoutEffect(() => {
    if (!expanded || !container || !root.current || !popup.current) return;
    const measure = () => {
      if (!root.current || !popup.current) return;
      const rect = root.current.getBoundingClientRect();
      const viewport = window.visualViewport;
      const viewportWidth = viewport?.width ?? window.innerWidth;
      const viewportHeight = viewport?.height ?? window.innerHeight;
      const offsetX = viewport?.offsetLeft ?? 0;
      const offsetY = viewport?.offsetTop ?? 0;
      const below = viewportHeight + offsetY - rect.bottom - 12;
      const above = rect.top - offsetY - 12;
      const flip = below < Math.min(160, popup.current.scrollHeight) && above > below;
      const maxHeight = Math.max(48, Math.min(256, flip ? above : below));
      const height = Math.min(maxHeight, popup.current.scrollHeight || 40);
      const width = Math.min(Math.max(rect.width, 120), viewportWidth - 16);
      let left = Math.max(offsetX + 8, Math.min(rect.left, offsetX + viewportWidth - width - 8));
      let top = flip ? rect.top - height - 4 : rect.bottom + 4;
      const fixed = container === document.body || container === document.documentElement;
      if (!fixed) {
        const parent = popup.current.offsetParent;
        // A static container may not be the popup's positioning parent at all.
        if (parent instanceof HTMLElement && !(parent === document.body && getComputedStyle(parent).position === 'static')) {
          const parentRect = parent.getBoundingClientRect();
          left = left - parentRect.left + parent.scrollLeft - parent.clientLeft;
          top = top - parentRect.top + parent.scrollTop - parent.clientTop;
        } else {
          left += window.scrollX;
          top += window.scrollY;
        }
      }
      const next = { position: fixed ? 'fixed' as const : 'absolute' as const, left, top, width, maxHeight, visibility: 'visible' as const };
      setPosition(current => Object.entries(next).every(([key, val]) => current[key as keyof CSSProperties] === val) ? current : next);
    };
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    window.visualViewport?.addEventListener('resize', measure);
    window.visualViewport?.addEventListener('scroll', measure);
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(measure);
    observer?.observe(root.current);
    observer?.observe(popup.current);
    return () => {
      observer?.disconnect(); window.removeEventListener('resize', measure); window.removeEventListener('scroll', measure, true);
      window.visualViewport?.removeEventListener('resize', measure); window.visualViewport?.removeEventListener('scroll', measure);
    };
  }, [expanded, container, visible.length, query, multiple, values.length]);
  useEffect(() => { popup.current?.querySelector<HTMLElement>(`[data-option-index="${active}"]`)?.scrollIntoView?.({ block: 'nearest' }); }, [active]);
  useEffect(() => {
    const parentForm = input.current?.form;
    if (!parentForm || controlled) return;
    let mounted = true;
    const reset = (event: Event) => queueMicrotask(() => {
      if (mounted && !event.defaultPrevented) { setInnerValue(defaultValue); setInnerSearch(''); setInnerOpen(defaultOpen); }
    });
    parentForm.addEventListener('reset', reset);
    return () => { mounted = false; parentForm.removeEventListener('reset', reset); };
  });
  const selected = values.map(optionOf);
  const classes = ['pi-select', `pi-select--${size}`, multiple && 'pi-select--multiple', expanded && 'pi-select--open', disabled && 'pi-select--disabled', status && `pi-select--${status}`, className, rootClassName].filter(Boolean).join(' ');
  const positionMode = container && container !== container.ownerDocument.body && container !== container.ownerDocument.documentElement ? 'absolute' : 'fixed';
  const popupNode = <div ref={popup} className="pi-select__popup" aria-hidden={!expanded} {...inertAttributes(!expanded)} data-motion={expanded ? 'enter' : 'leave'} style={{ ...themeVariables(theme), ...position, position: positionMode }} onClick={event => event.stopPropagation()}>
    <div id={listId} role="listbox" aria-multiselectable={multiple || undefined} aria-label={rest['aria-label'] ?? '选项'}>
      {visible.map((option, index) => <div key={`${typeof option.value}:${option.value}`} id={`${listId}-${index}`} role="option" aria-selected={values.includes(option.value)} aria-disabled={option.disabled || undefined}
        data-option-index={index} className={['pi-select__option', active === index && 'pi-select__option--active', values.includes(option.value) && 'pi-select__option--selected', option.disabled && 'pi-select__option--disabled'].filter(Boolean).join(' ')}
        title={option.title} onMouseDown={event => event.preventDefault()} onMouseEnter={() => !option.disabled && setActive(index)} onClick={() => choose(option)}>
        <span>{option.label ?? String(option.value)}</span>{values.includes(option.value) && <CheckIcon />}
      </div>)}
      {!visible.length && <div className="pi-select__empty">{notFoundContent}</div>}
    </div>
  </div>;
  return <div {...rest} ref={root} className={classes} style={{ ...themeVariables(theme), ...style }} onFocus={onFocus} onBlur={event => {
    onBlur?.(event);
    if (!root.current?.contains(event.relatedTarget as Node | null) && !popup.current?.contains(event.relatedTarget as Node | null)) changeOpen(false);
  }} onClick={event => { onClick?.(event); if (!event.defaultPrevented && !disabled) { input.current?.focus(); changeOpen(true); } }}>
    <div className="pi-select__selection">
      {multiple && selected.map(option => <span className="pi-select__tag" key={`${typeof option.value}:${option.value}`}>
        <span>{option.label ?? String(option.value)}</span>
        {!disabled && <button type="button" aria-label={`移除 ${textLabel(option)}`} onMouseDown={event => event.preventDefault()} onClick={event => { event.stopPropagation(); choose(option); }}><CloseIcon width={12} height={12} /></button>}
      </span>)}
      {!multiple && !query && selected[0] && <span id={`${id}-selected`} className="pi-select__value">{selected[0].label ?? String(selected[0].value)}</span>}
      {!values.length && !query && <span className="pi-select__placeholder">{placeholder}</span>}
      <input ref={input} id={id} className="pi-select__search" role="combobox" aria-label={rest['aria-label']} aria-labelledby={rest['aria-labelledby']} aria-describedby={rest['aria-describedby'] ?? (!multiple && selected[0] ? `${id}-selected` : undefined)}
        aria-expanded={expanded} aria-controls={expanded && container ? listId : undefined} aria-autocomplete={searchable ? 'list' : 'none'} aria-activedescendant={expanded && container && active >= 0 && visible[active] ? `${listId}-${active}` : undefined}
        aria-invalid={rest['aria-invalid'] ?? (status === 'error' ? true : undefined)} autoComplete="off" disabled={disabled} readOnly={!searchable} value={query} form={form} autoFocus={autoFocus}
        onChange={event => { changeSearch(event.target.value); changeOpen(true); }}
        onKeyDown={event => {
          onKeyDown?.(event);
          if (event.defaultPrevented || disabled || event.nativeEvent.isComposing || event.keyCode === 229) return;
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            if (!expanded) { changeOpen(true); return; }
            const cursor = enabled.indexOf(active);
            const next = event.key === 'ArrowDown' ? (cursor + 1) % enabled.length : (cursor <= 0 ? enabled.length - 1 : cursor - 1);
            setActive(enabled[next] ?? -1);
          } else if (event.key === 'Enter') {
            event.preventDefault();
            if (!expanded) changeOpen(true);
            else if (active >= 0 && visible[active]) choose(visible[active]);
          } else if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); changeOpen(false); changeSearch('', false); }
          else if (event.key === 'Tab') changeOpen(false);
          else if (event.key === 'Backspace' && multiple && !query && values.length) choose(optionOf(values[values.length - 1]));
        }} />
    </div>
    {allowClear && values.length > 0 && !disabled && <button type="button" className="pi-select__clear" aria-label="清空选择" onMouseDown={event => event.preventDefault()} onClick={event => { event.stopPropagation(); commit([]); changeSearch('', false); onClear?.(); input.current?.focus(); }}>{typeof allowClear === 'object' ? allowClear.clearIcon ?? <CloseIcon /> : <CloseIcon />}</button>}
    <button type="button" className="pi-select__arrow" tabIndex={-1} disabled={disabled} aria-label={expanded ? '收起选项' : '展开选项'} onMouseDown={event => event.preventDefault()} onClick={event => { event.stopPropagation(); input.current?.focus(); changeOpen(!expanded); }}>{loading ? <span className="pi-select__spinner" aria-label="加载中" /> : <ChevronDownIcon style={{ transform: expanded ? 'rotate(180deg)' : undefined }} />}</button>
    {name && (values.length ? values : ['']).map((raw, index) => <input key={index} type="hidden" name={name} form={form} disabled={disabled} value={String(raw)} />)}
    {present && container && createPortal(popupNode, container)}
  </div>;
});
export const Select = SelectControl as <ValueType extends SelectValue = SelectValue>(props: SelectProps<ValueType> & RefAttributes<SelectRef>) => ReactElement;

defineFieldBinding(Select, {});
