import { createContext, forwardRef, useContext, useEffect, useId, useImperativeHandle, useRef, useState, type HTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react';
import { useTheme } from '../config-provider/index.js';
import { themeVariables } from '../theme/variables.js';
export type RadioValue = string | number | boolean;
export interface RadioChangeEvent { target: RadioProps & { checked: boolean }; nativeEvent: Event; preventDefault(): void; stopPropagation(): void }
export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange' | 'size'> { value?: RadioValue; onChange?: (event: RadioChangeEvent) => void; children?: ReactNode }
export interface RadioRef { focus(options?: FocusOptions): void; blur(): void; readonly nativeElement: HTMLInputElement | null }
export interface RadioOption { label: ReactNode; value: RadioValue; disabled?: boolean; title?: string; className?: string; style?: React.CSSProperties }
export interface RadioGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  value?: RadioValue; defaultValue?: RadioValue; options?: (RadioValue | RadioOption)[]; disabled?: boolean; name?: string;
  optionType?: 'default' | 'button'; buttonStyle?: 'outline' | 'solid'; size?: 'small' | 'middle' | 'large'; onChange?: (event: RadioChangeEvent) => void;
}
interface GroupState { value?: RadioValue; resetValue?: RadioValue; disabled: boolean; name: string; select(value: RadioValue | undefined, event: RadioChangeEvent): void }
const GroupContext = createContext<GroupState | null>(null);
function createRadio(button: boolean) {
  return forwardRef<RadioRef, RadioProps>(function Radio(props, ref) {
    const { value, checked, defaultChecked = false, children, className, style, disabled = false, onChange, ...rest } = props;
    const group = useContext(GroupContext); const [local, setLocal] = useState(defaultChecked); const input = useRef<HTMLInputElement>(null); const theme = useTheme();
    const current = group ? group.value === value : checked ?? local; const blocked = disabled || Boolean(group?.disabled);
    useImperativeHandle(ref, () => ({ focus: options => input.current?.focus(options), blur: () => input.current?.blur(), get nativeElement() { return input.current; } }), []);
    const resetState = useRef({ group, checked, defaultChecked, value });
    resetState.current = { group, checked, defaultChecked, value };
    useEffect(() => {
      const form = input.current?.form; let alive = true;
      const reset = (event: Event) => queueMicrotask(() => {
        if (!alive || event.defaultPrevented || !input.current) return;
        const latest = resetState.current;
        if (!latest.group && latest.checked === undefined) setLocal(latest.defaultChecked);
        input.current.checked = latest.group ? latest.group.resetValue === latest.value : latest.checked ?? latest.defaultChecked;
      });
      form?.addEventListener('reset', reset);
      return () => { alive = false; form?.removeEventListener('reset', reset); };
    }, [rest.form]);
    useEffect(() => { if (group || checked !== undefined || !rest.name) return; const sync = (event: Event) => { const other = event.target; if (other instanceof HTMLInputElement && other.type === 'radio' && other.name === rest.name && other.form === input.current?.form && other !== input.current) setLocal(false); }; input.current?.ownerDocument.addEventListener('change', sync); const document = input.current?.ownerDocument; return () => document?.removeEventListener('change', sync); }, [group, checked, rest.name]);
    return <label className={['pi-radio', button && 'pi-radio--button', current && 'pi-radio--checked', blocked && 'pi-radio--disabled', className].filter(Boolean).join(' ')} style={{ ...themeVariables(theme), ...style }}>
      <input {...rest} ref={input} type="radio" name={group?.name ?? rest.name} value={value === undefined ? undefined : String(value)} checked={group ? current : checked} defaultChecked={!group && checked === undefined ? defaultChecked : undefined} disabled={blocked} onChange={event => {
        if (blocked) return; const next = event.target.checked; if (!group && checked === undefined) setLocal(next);
        const change = { target: { ...props, checked: next }, nativeEvent: event.nativeEvent, preventDefault: () => event.preventDefault(), stopPropagation: () => event.stopPropagation() };
        onChange?.(change); group?.select(value, change);
      }} /><span className="pi-radio__mark" aria-hidden="true" />{children != null && <span className="pi-radio__label">{children}</span>}
    </label>;
  });
}
const RadioControl = createRadio(false); export const RadioButton = createRadio(true);
export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(function RadioGroup({ value, defaultValue, options, disabled = false, name, optionType = 'default', buttonStyle = 'outline', size = 'middle', onChange, children, className, style, onKeyDown, ...rest }, ref) {
  const [local, setLocal] = useState(defaultValue); const root = useRef<HTMLDivElement>(null); const id = useId(); const current = value ?? local; const theme = useTheme();
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
  return <GroupContext.Provider value={{ value: current, resetValue: value ?? defaultValue, disabled, name: name ?? `pi-radio-${id}`, select: (next, event) => { if (value === undefined) setLocal(next); if (current !== next) onChange?.(event); } }}>
    <div {...rest} ref={root} role={rest.role ?? 'radiogroup'} className={['pi-radio-group', `pi-radio-group--${size}`, `pi-radio-group--${buttonStyle}`, className].filter(Boolean).join(' ')} style={{ ...themeVariables(theme), ...style }} onKeyDown={event => {
      onKeyDown?.(event); if (event.defaultPrevented || !['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(event.key)) return;
      const inputs = Array.from(root.current?.querySelectorAll<HTMLInputElement>('input[type="radio"]:not(:disabled)') ?? []); const index = inputs.indexOf(event.target as HTMLInputElement); if (index < 0 || !inputs.length) return;
      event.preventDefault(); const next = inputs[(index + (event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1) + inputs.length) % inputs.length]; next.focus(); next.click();
    }}>{options ? options.map(option => { const item = typeof option === 'object' ? option : { label: String(option), value: option }; const Component = optionType === 'button' ? RadioButton : RadioControl; return <Component key={`${typeof item.value}:${item.value}`} value={item.value} disabled={item.disabled} title={item.title} className={item.className} style={item.style}>{item.label}</Component>; }) : children}</div>
  </GroupContext.Provider>;
});
export const Radio = Object.assign(RadioControl, { Group: RadioGroup, Button: RadioButton });
