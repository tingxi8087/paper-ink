import { createContext, useCallback, forwardRef, useContext, useEffect, useImperativeHandle, useRef, useState, type ChangeEvent, type HTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react';
import { useTheme } from '../config-provider/index.js';
import { themeVariables } from '../theme/variables.js';
export type CheckboxValue = string | number | boolean;
export interface CheckboxChangeEvent { target: CheckboxProps & { checked: boolean }; nativeEvent: Event; preventDefault(): void; stopPropagation(): void }
export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange' | 'size'> {
  value?: CheckboxValue; indeterminate?: boolean; onChange?: (event: CheckboxChangeEvent) => void; children?: ReactNode;
}
export interface CheckboxRef { focus(options?: FocusOptions): void; blur(): void; readonly nativeElement: HTMLInputElement | null }
export interface CheckboxOption { label: ReactNode; value: CheckboxValue; disabled?: boolean; title?: string; className?: string; style?: React.CSSProperties }
export interface CheckboxGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  value?: CheckboxValue[]; defaultValue?: CheckboxValue[]; options?: (CheckboxValue | CheckboxOption)[];
  disabled?: boolean; name?: string; onChange?: (value: CheckboxValue[]) => void;
}
interface GroupState { value: CheckboxValue[]; resetValue: CheckboxValue[]; disabled: boolean; name?: string; toggle(value: CheckboxValue, checked: boolean): void; register(value: CheckboxValue): () => void }
const GroupContext = createContext<GroupState | null>(null);
const CheckboxControl = forwardRef<CheckboxRef, CheckboxProps>(function Checkbox(props, ref) {
  const { checked, defaultChecked = false, indeterminate = false, value, children, disabled = false, className, style, onChange, ...rest } = props;
  const group = useContext(GroupContext);
  const input = useRef<HTMLInputElement>(null);
  const [local, setLocal] = useState(defaultChecked);
  const grouped = group !== null && value !== undefined;
  const current = grouped ? group.value.includes(value) : checked ?? local;
  const blocked = disabled || Boolean(group?.disabled);
  const theme = useTheme();
  useImperativeHandle(ref, () => ({ focus: options => input.current?.focus(options), blur: () => input.current?.blur(), get nativeElement() { return input.current; } }), []);
  useEffect(() => { if (input.current) input.current.indeterminate = indeterminate; }, [indeterminate]);
  useEffect(() => { if (group && value !== undefined) return group.register(value); }, [group?.register, value]);
  const resetState = useRef({ checked, defaultChecked, grouped, group, value, indeterminate });
  resetState.current = { checked, defaultChecked, grouped, group, value, indeterminate };
  useEffect(() => {
    const form = input.current?.form;
    let alive = true;
    const reset = (event: Event) => queueMicrotask(() => {
      if (!alive || event.defaultPrevented || !input.current) return;
      const latest = resetState.current;
      if (latest.checked === undefined && !latest.grouped) setLocal(latest.defaultChecked);
      input.current.checked = latest.grouped ? latest.group!.resetValue.includes(latest.value!) : latest.checked ?? latest.defaultChecked;
      input.current.indeterminate = latest.indeterminate;
    });
    form?.addEventListener('reset', reset);
    return () => { alive = false; form?.removeEventListener('reset', reset); };
  }, [rest.form]);
  function change(event: ChangeEvent<HTMLInputElement>) {
    if (blocked) return;
    const next = event.target.checked;
    if (grouped) group.toggle(value, next); else if (checked === undefined) setLocal(next);
    onChange?.({ target: { ...props, checked: next }, nativeEvent: event.nativeEvent, preventDefault: () => event.preventDefault(), stopPropagation: () => event.stopPropagation() });
  }
  return <label className={['pi-checkbox', blocked && 'pi-checkbox--disabled', className].filter(Boolean).join(' ')} style={{ ...themeVariables(theme), ...style }}>
    <input {...rest} ref={input} type="checkbox" value={value === undefined ? undefined : String(value)} name={group?.name ?? rest.name} checked={current} disabled={blocked} onChange={change} aria-checked={indeterminate ? 'mixed' : current} />
    <span className="pi-checkbox__mark" aria-hidden="true" />{children != null && <span>{children}</span>}
  </label>;
});
export const CheckboxGroup = forwardRef<HTMLDivElement, CheckboxGroupProps>(function CheckboxGroup({ value, defaultValue = [], options, disabled = false, name, onChange, children, className, style, ...rest }, ref) {
  const [local, setLocal] = useState(defaultValue); const root = useRef<HTMLDivElement>(null); const theme = useTheme();
  const current = value ?? local;
  const registered = useRef(new Map<CheckboxValue, number>());
  const register = useCallback((item: CheckboxValue) => { registered.current.set(item, (registered.current.get(item) ?? 0) + 1); return () => { const count = registered.current.get(item) ?? 0; if (count <= 1) registered.current.delete(item); else registered.current.set(item, count - 1); }; }, []);
  useImperativeHandle(ref, () => root.current!);
  const resetState = useRef({ value, defaultValue });
  resetState.current = { value, defaultValue };
  useEffect(() => {
    const form = root.current?.closest('form'); let alive = true;
    const reset = (event: Event) => queueMicrotask(() => {
      if (!alive || event.defaultPrevented || !root.current) return;
      const latest = resetState.current;
      if (latest.value === undefined) setLocal(latest.defaultValue);
    });
    form?.addEventListener('reset', reset);
    return () => { alive = false; form?.removeEventListener('reset', reset); };
  }, []);
  function toggle(item: CheckboxValue, checked: boolean) { const next = checked ? current.includes(item) ? current : [...current, item] : current.filter(entry => entry !== item); const ordered = [...registered.current.keys()].filter(entry => next.includes(entry)); if (value === undefined) setLocal(ordered); onChange?.(ordered); }
  return <GroupContext.Provider value={{ value: current, resetValue: value ?? defaultValue, disabled, name, toggle, register }}><div {...rest} ref={root} className={['pi-checkbox-group', className].filter(Boolean).join(' ')} style={{ ...themeVariables(theme), ...style }}>{options ? options.map(option => { const item = typeof option === 'object' ? option : { label: String(option), value: option }; return <CheckboxControl key={`${typeof item.value}:${item.value}`} value={item.value} disabled={item.disabled} title={item.title} className={item.className} style={item.style}>{item.label}</CheckboxControl>; }) : children}</div></GroupContext.Provider>;
});
export const Checkbox = Object.assign(CheckboxControl, { Group: CheckboxGroup });
