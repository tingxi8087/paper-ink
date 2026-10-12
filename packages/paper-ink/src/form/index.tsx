import {
  Children, Fragment, cloneElement, createContext, forwardRef, isValidElement, useCallback,
  useContext, useEffect, useId, useLayoutEffect, useRef, useSyncExternalStore,
  type HTMLAttributes, type ReactElement, type Ref, type RefAttributes,
} from 'react';
import { useTheme } from '../config-provider/index.js';
import { themeVariables } from '../theme/variables.js';
import { getFieldBinding } from '../internal/field-binding.js';
import { FormStore } from './store.js';
import type { FieldControlRef, FieldName, FieldProps, FieldState, FormInstance, FormProps, UseFormOptions } from './types.js';
export type * from './types.js';
export { defineFieldBinding, fieldBinding } from '../internal/field-binding.js';
export type { FieldBinding } from '../internal/field-binding.js';
const useSafeLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
const FormContext = createContext<{ form: FormInstance<any>; disabled: boolean; trigger: 'blur' | 'change' | 'submit' } | null>(null);
const FieldContext = createContext<FieldState | null>(null);
export function useForm<T extends object>({ defaultValues }: UseFormOptions<T>): FormInstance<T> {
  const ref = useRef<FormInstance<T> | null>(null);
  if (!ref.current) {
    const store = new FormStore(defaultValues);
    ref.current = { _store: store, getValues: store.getValues, reset: store.reset, validate: store.validate,
      setValue: (name, value) => store.patch({ [name]: value } as unknown as Partial<T>, 'programmatic'),
      patchValues: values => store.patch(values, 'programmatic'),
    };
  }
  return ref.current;
}
export function useWatch<T extends object, K extends FieldName<T>>(form: FormInstance<T>, name: K): T[K] {
  const subscribe = useCallback((listener: () => void) => form._store.subscribe(name, listener), [form, name]);
  const read = useCallback(() => form._store.read(name), [form, name]);
  return useSyncExternalStore(subscribe, read, read);
}
export function useFormState<T extends object>(form: FormInstance<T>) {
  return useSyncExternalStore(form._store.subscribeMeta, form._store.formState, form._store.formState);
}
export function useFieldState(): FieldState {
  const state = useContext(FieldContext);
  if (!state) throw new Error('useFieldState must be used inside Form.Field');
  return state;
}
function FormRoot<T extends object>({ form, disabled = false, validateTrigger = 'blur', onSubmit, onValuesChange, onError, onReset, children, className, style, ...rest }: FormProps<T>, ref: Ref<HTMLFormElement>) {
  const theme = useTheme(); const store = form._store;
  const callbacks = useRef({ onSubmit, onValuesChange, onError }); callbacks.current = { onSubmit, onValuesChange, onError };
  useSafeLayoutEffect(() => {
    store.onValuesChange = (...args) => callbacks.current.onValuesChange?.(...args);
    store.onError = (error, phase) => { if (callbacks.current.onError) callbacks.current.onError(error, { phase }); else console.error('[paper-ink Form]', phase, error); };
    return () => { store.onValuesChange = undefined; store.onError = undefined; };
  }, [store]);
  return <FormContext.Provider value={{ form, disabled, trigger: validateTrigger }}>
    <form {...rest} ref={ref} noValidate className={['pi-form', className].filter(Boolean).join(' ')} style={{ ...themeVariables(theme), ...style }}
      onReset={event => { onReset?.(event); if (!event.defaultPrevented) { event.preventDefault(); form.reset(); } }}
      onSubmit={event => {
        event.preventDefault(); if (disabled || !store.startSubmit()) return;
        void (async () => {
          let phase: 'validate' | 'submit' = 'validate';
          try {
            const result = await form.validate();
            if (result.status === 'invalid') { store.focusFirst(result.errors); return; }
            if (result.status === 'cancelled') return;
            phase = 'submit'; await callbacks.current.onSubmit?.(result.values);
          } catch (error) { store.report(error, phase); }
          finally { store.finishSubmit(); }
        })();
      }}>{children}</form>
  </FormContext.Provider>;
}
function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') return ref(value);
  if (ref) (ref as { current: T | null }).current = value;
}
function elementRef(child: ReactElement<any>): Ref<FieldControlRef> | undefined {
  // React 19 moved ref into props. Read the descriptor on React 18 without invoking its warning getter.
  if (Object.prototype.hasOwnProperty.call(child.props, 'ref')) {
    const descriptor = Object.getOwnPropertyDescriptor(child.props, 'ref');
    if (descriptor && 'value' in descriptor) return descriptor.value;
  }
  const descriptor = Object.getOwnPropertyDescriptor(child, 'ref');
  return descriptor && 'value' in descriptor ? descriptor.value : undefined;
}
function Field<T extends object = Record<string, any>, K extends FieldName<T> = FieldName<T>>({
  name, form: explicitForm, label, required = false, validate, validateTrigger, dependencies, help,
  disabled = false, preserve = false, children, className, style,
}: FieldProps<T, K>) {
  const context = useContext(FormContext); const form = explicitForm ?? context?.form;
  if (!form) throw new Error('Form.Field requires a parent Form or a form prop');
  const store = form._store; const id = `pi-field-${useId().replace(/:/g, '')}`;
  const root = useRef<HTMLDivElement>(null); const controlRef = useRef<FieldControlRef | null>(null);
  const theme = useTheme(); const value = useWatch(form, name);
  const subscribe = useCallback((listener: () => void) => store.subscribe(name, listener), [store, name]);
  const readState = useCallback(() => store.fieldState(name), [store, name]);
  const state = useSyncExternalStore(subscribe, readState, readState);
  const child = typeof children === 'function' ? null : Children.only(children);
  if (child && (!isValidElement(child) || child.type === Fragment || typeof child.type === 'string')) throw new Error('Form.Field automatic binding requires one direct control component; use a render function for native elements or wrappers');
  const childProps: Record<string, any> = child?.props ?? {};
  const blocked = Boolean(context?.disabled || disabled || childProps.disabled);
  const focus = () => {
    if (controlRef.current?.focus) { controlRef.current.focus({ preventScroll: true }); }
    if (!root.current?.contains(document.activeElement) || document.activeElement === root.current) root.current?.querySelector<HTMLElement>('input:not(:disabled),textarea:not(:disabled),button:not(:disabled),[tabindex]:not([tabindex="-1"])')?.focus({ preventScroll: true });
    root.current?.scrollIntoView?.({ block: 'nearest' });
  };
  const options = { required, label, validate, trigger: validateTrigger ?? context?.trigger ?? 'blur', dependencies, disabled: blocked, preserve, focus };
  const latestOptions = useRef(options); latestOptions.current = options;
  useSafeLayoutEffect(() => store.register(name, latestOptions.current), [store, name]);
  useSafeLayoutEffect(() => store.configure(name, latestOptions.current));
  const binding = child ? getFieldBinding(child.type) : {};
  const warned = useRef(false);
  useSafeLayoutEffect(() => {
    const keys = [binding.valueProp ?? 'value', 'defaultValue', ...(binding.defaultProps ?? [])];
    if (child && !warned.current && keys.some(key => childProps[key] !== undefined)) {
      warned.current = true;
      console.warn(`[paper-ink Form] Field "${name}" owns its value; move value/defaultValue into defaultValues or use the render-function binding.`);
    }
  });
  const originalRef = child ? elementRef(child) : undefined;
  const composedRef = useCallback((node: FieldControlRef | null) => { controlRef.current = node; return assignRef(originalRef, node); }, [originalRef]);
  const errorId = `${id}-error`; const helpId = `${id}-help`; const labelId = `${id}-label`;
  const props = {
    id, disabled: blocked, status: state.status,
    'aria-labelledby': childProps['aria-labelledby'] ?? (label != null && !childProps['aria-label'] ? labelId : undefined), 'aria-invalid': Boolean(state.error) || undefined,
    'aria-required': Boolean(required) || undefined,
    'aria-describedby': [childProps['aria-describedby'], state.error && errorId, help != null && helpId].filter(Boolean).join(' ') || undefined,
    onBlur: () => store.touch(name), ref: composedRef,
  };
  const setValue = (next: any) => { if (!blocked) { try { store.patch({ [name]: next } as Partial<T>, 'user'); } catch (error) { store.report(error, 'change'); } } };
  let content;
  if (typeof children === 'function') content = children({ ...state, disabled: blocked, required: Boolean(required), control: { value, setValue, props } });
  else {
    const valueProp = binding.valueProp ?? 'value'; const changeProp = binding.changeProp ?? 'onChange';
    const injected: Record<string, any> = { ...props,
      [valueProp]: binding.toControlValue ? binding.toControlValue(value, childProps) : value,
      [changeProp]: (...args: any[]) => { setValue(binding.getValue ? binding.getValue(...args) : args[0]); childProps[changeProp]?.(...args); },
      onBlur: (...args: any[]) => { props.onBlur(); childProps.onBlur?.(...args); },
    };
    if (binding.status === false) delete injected.status;
    for (const key of ['defaultValue', ...(binding.defaultProps ?? [])]) injected[key] = undefined;
    content = cloneElement(child!, injected);
  }
  return <FieldContext.Provider value={{ ...state, disabled: blocked, required: Boolean(required) }}>
    <div ref={root} className={['pi-form-field', state.error && 'pi-form-field--error', className].filter(Boolean).join(' ')} style={{ ...themeVariables(theme), ...style }}>
      {label != null && <label id={labelId} className="pi-form-field__label" htmlFor={id} onClick={() => { if (!['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(document.getElementById(id)?.tagName ?? '')) focus(); }}>{required && <span className="pi-form-field__required" aria-hidden="true">*</span>}{label}</label>}
      <div className="pi-form-field__control">{content}</div>
      {help != null && <div id={helpId} className="pi-form-field__help">{help}</div>}
      {state.error && <div id={errorId} className="pi-form-field__error" role="alert">{state.error}</div>}
    </div>
  </FieldContext.Provider>;
}
const FormComponent = forwardRef(FormRoot) as <T extends object>(props: FormProps<T> & RefAttributes<HTMLFormElement>) => ReactElement;
export const Form = Object.assign(FormComponent, { Field });
export interface FieldControlContainerProps extends HTMLAttributes<HTMLDivElement> { status?: 'error' | 'warning'; disabled?: boolean }
export const FieldControl = forwardRef<HTMLDivElement, FieldControlContainerProps>(function FieldControl({ status, disabled, className, style, ...rest }, ref) {
  const state = useContext(FieldContext); const theme = useTheme();
  return <div {...rest} ref={ref} className={['pi-field-control', `pi-field-control--${status ?? state?.status ?? 'default'}`, (disabled || state?.disabled) && 'pi-field-control--disabled', className].filter(Boolean).join(' ')} style={{ ...themeVariables(theme), ...style }} />;
});
