import type { CSSProperties, FormHTMLAttributes, ReactElement, ReactNode, Ref } from 'react';
import type { FormStore } from './store.js';
export type FieldName<T> = Extract<keyof T, string>;
export type ValidateTrigger = 'blur' | 'change' | 'submit';
export interface ValidationContext<T> { values: T; signal: AbortSignal }
export type FieldValidator<T, K extends FieldName<T>> = (value: T[K], context: ValidationContext<T>) => string | undefined | Promise<string | undefined>;
export interface ValuesChangeInfo<T> { source: 'user' | 'programmatic'; names: FieldName<T>[]; previousValues: Partial<T> }
export type ValidationResult<T> =
  | { status: 'valid'; values: T; errors: Partial<Record<FieldName<T>, string>> }
  | { status: 'invalid'; values: T; errors: Partial<Record<FieldName<T>, string>> }
  | { status: 'cancelled'; values: T; errors: Partial<Record<FieldName<T>, string>> };
export interface FormState { submitting: boolean; dirty: boolean }
export interface FieldState {
  error?: string; status?: 'error' | 'warning'; validating: boolean; touched: boolean;
  dirty: boolean; disabled: boolean; required: boolean;
}
export interface FieldControlRef { focus(options?: FocusOptions): void }
export interface FieldControlProps {
  id?: string; status?: 'error' | 'warning'; disabled?: boolean;
  'aria-labelledby'?: string; 'aria-invalid'?: boolean; 'aria-required'?: boolean; 'aria-describedby'?: string;
  onBlur?: (...args: any[]) => void; ref?: (instance: FieldControlRef | null) => void | (() => void);
}
export interface FieldControl<V> { value: V; setValue(value: V): void; props: FieldControlProps }
export interface FormInstance<T extends object> {
  getValues(): T;
  setValue<K extends FieldName<T>>(name: K, value: T[K]): void;
  patchValues(values: Partial<T>): void;
  reset(values?: T): void;
  validate(names?: FieldName<T>[]): Promise<ValidationResult<T>>;
  /** Internal subscription engine; not a public manipulation API. */
  readonly _store: Pick<FormStore<T>, keyof FormStore<T>>;
}
export interface UseFormOptions<T> { defaultValues: T }
export interface FormErrorInfo { phase: 'validate' | 'submit' | 'change' }
export interface FormProps<T extends object> extends Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit' | 'onError'> {
  form: FormInstance<T>; disabled?: boolean; validateTrigger?: ValidateTrigger;
  onSubmit?: (values: T) => void | Promise<void>;
  onValuesChange?: (changedValues: Partial<T>, values: T, info: ValuesChangeInfo<T>) => void;
  onError?: (error: unknown, info: FormErrorInfo) => void;
}
export interface FieldProps<T extends object = Record<string, any>, K extends FieldName<T> = FieldName<T>> {
  name: K; form?: FormInstance<T>; label?: ReactNode; required?: boolean | string;
  validate?: NoInfer<FieldValidator<T, K>>; validateTrigger?: ValidateTrigger;
  dependencies?: NoInfer<FieldName<T>>[]; help?: ReactNode; disabled?: boolean; preserve?: boolean;
  children: ReactElement | ((args: { control: FieldControl<T[K]> } & FieldState) => ReactNode);
  className?: string; style?: CSSProperties;
}
