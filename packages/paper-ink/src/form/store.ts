import type { FieldName, FieldState, FormState, ValidationResult, ValuesChangeInfo, ValidateTrigger } from './types.js';
export type Name = string;
export interface Registration {
  required?: boolean | string; label?: unknown; disabled?: boolean; preserve?: boolean;
  trigger: ValidateTrigger; dependencies?: string[];
  validate?: (value: any, context: { values: any; signal: AbortSignal }) => string | undefined | Promise<string | undefined>;
  focus?: () => void;
}
interface Entry { token: symbol; options: Registration }
const emptyState: FieldState = { validating: false, touched: false, dirty: false, disabled: false, required: false };
const own = (object: object, key: string) => Object.prototype.hasOwnProperty.call(object, key);
/** Copy ordinary form data. Dates are supported; class instances must be adapted by the caller. */
export function copy<T>(value: T, seen = new WeakMap<object, any>()): T {
  if (!value || typeof value !== 'object') return value;
  if (seen.has(value)) return seen.get(value);
  if (value instanceof Date) return new Date(value.getTime()) as T;
  if (!Array.isArray(value) && Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null) return value;
  const next: any = Array.isArray(value) ? [] : {}; seen.set(value, next);
  for (const key of Object.keys(value)) Object.defineProperty(next, key, { value: copy((value as any)[key], seen), writable: true, enumerable: true, configurable: true });
  return next;
}
function equal(a: any, b: any, seen = new WeakMap<object, object>()): boolean {
  if (Object.is(a, b)) return true;
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
  if (a instanceof Date || b instanceof Date) return a instanceof Date && b instanceof Date && a.getTime() === b.getTime();
  if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;
  if (!Array.isArray(a) && Object.getPrototypeOf(a) !== Object.prototype && Object.getPrototypeOf(a) !== null) {
    // Immutable scalar wrappers (such as Dayjs) expose their value without a date-library dependency.
    if (typeof a.valueOf !== 'function' || typeof b.valueOf !== 'function') return false;
    const left = a.valueOf(), right = b.valueOf();
    return (typeof left === 'number' || typeof left === 'string') && typeof left === typeof right && Object.is(left, right);
  }
  if (seen.get(a) === b) return true; seen.set(a, b);
  const keys = Object.keys(a); return keys.length === Object.keys(b).length && keys.every(key => own(b, key) && equal(a[key], b[key], seen));
}
function missing(value: unknown) { return value == null || (typeof value === 'string' && value.trim() === '') || (Array.isArray(value) && value.length === 0); }
export class FormStore<T extends object> {
  private values: Record<string, any>;
  private baseline: Record<string, any>;
  private fields = new Map<string, Entry>();
  private states = new Map<string, FieldState>();
  private listeners = new Map<string, Set<() => void>>();
  private metaListeners = new Set<() => void>();
  private validations = new Map<string, AbortController>();
  private revision = 0;
  private validated = new Set<string>();
  private meta: FormState = { submitting: false, dirty: false };
  onValuesChange?: (changed: Partial<T>, values: T, info: ValuesChangeInfo<T>) => void;
  onError?: (error: unknown, phase: 'validate' | 'submit' | 'change') => void;
  constructor(initial: T) { this.values = copy(initial); this.baseline = copy(initial); }
  read = (name: string) => own(this.values, name) ? this.values[name] : undefined;
  fieldState = (name: string) => this.states.get(name) ?? emptyState;
  formState = () => this.meta;
  subscribe = (name: string, listener: () => void) => {
    const set = this.listeners.get(name) ?? new Set(); this.listeners.set(name, set); set.add(listener);
    return () => { set.delete(listener); if (!set.size) this.listeners.delete(name); };
  };
  subscribeMeta = (listener: () => void) => { this.metaListeners.add(listener); return () => { this.metaListeners.delete(listener); }; };
  private emit(name: string) { this.listeners.get(name)?.forEach(listener => listener()); }
  private updateMeta(patch: Partial<FormState> = {}) {
    const dirty = [...this.fields.keys()].some(name => !equal(this.read(name), own(this.baseline, name) ? this.baseline[name] : undefined));
    const next = { ...this.meta, dirty, ...patch };
    if (next.dirty !== this.meta.dirty || next.submitting !== this.meta.submitting) { this.meta = next; this.metaListeners.forEach(listener => listener()); }
  }
  private state(name: string, patch: Partial<FieldState> = {}) {
    const previous = this.fieldState(name); const options = this.fields.get(name)?.options;
    const next = { ...previous, dirty: !equal(this.read(name), own(this.baseline, name) ? this.baseline[name] : undefined), disabled: Boolean(options?.disabled), required: Boolean(options?.required), ...patch };
    next.status = next.error ? 'error' : undefined;
    if (Object.keys(next).some(key => !Object.is(next[key as keyof FieldState], previous[key as keyof FieldState]))) { this.states.set(name, next); this.emit(name); }
  }
  register(name: string, options: Registration) {
    if (this.fields.has(name)) throw new Error(`Duplicate Form.Field name: ${name}`);
    const token = Symbol(name); this.fields.set(name, { token, options });
    this.revision++;
    for (const key of [...this.validations.keys()]) this.cancelValidation(key);
    if (!own(this.values, name)) Object.defineProperty(this.values, name, { value: own(this.baseline, name) ? copy(this.baseline[name]) : undefined, enumerable: true, writable: true, configurable: true });
    this.state(name); this.updateMeta(); this.emit(name);
    return () => {
      // StrictMode may immediately register the same field again. Dispose only an absent field.
      if (this.fields.get(name)?.token !== token) return;
      const preserve = this.fields.get(name)?.options.preserve;
      this.fields.delete(name);
      this.revision++;
      for (const key of [...this.validations.keys()]) this.cancelValidation(key);
      queueMicrotask(() => {
        if (this.fields.has(name)) return;
        this.validated.delete(name);
        if (!preserve) delete this.values[name];
        this.states.delete(name); this.emit(name); this.updateMeta();
      });
    };
  }
  configure(name: string, options: Registration) {
    const entry = this.fields.get(name); if (!entry) return;
    entry.options = options; this.state(name);
  }
  getValues = (): T => {
    const next: Record<string, any> = {};
    for (const name of this.fields.keys()) Object.defineProperty(next, name, { value: copy(this.values[name]), enumerable: true, configurable: true, writable: true });
    return next as T;
  };
  private cancelValidation(name: string) { this.validations.get(name)?.abort(); this.validations.delete(name); this.state(name, { validating: false }); }
  patch(values: Partial<T>, source: 'user' | 'programmatic') {
    const names = Object.keys(values).filter(name => !Object.is(this.read(name), (values as any)[name]));
    if (!names.length) return;
    const previous: Record<string, any> = {}; const changed: Record<string, any> = {};
    for (const name of names) {
      Object.defineProperty(previous, name, { value: copy(this.values[name]), enumerable: true });
      Object.defineProperty(this.values, name, { value: copy((values as any)[name]), enumerable: true, writable: true, configurable: true });
      Object.defineProperty(changed, name, { value: copy(this.values[name]), enumerable: true });
    }
    this.revision++;
    for (const name of [...this.validations.keys()]) this.cancelValidation(name);
    for (const name of names) { this.state(name); this.emit(name); }
    this.updateMeta();
    const notifyValues = this.getValues();
    this.onValuesChange?.(changed as Partial<T>, notifyValues, { source, names: names as FieldName<T>[], previousValues: previous as Partial<T> });
    const validate = [...this.fields].filter(([name, { options }]) => {
      const state = this.fieldState(name);
      return names.includes(name) ? options.trigger === 'change' || (options.trigger === 'blur' && Boolean(state.error)) : options.dependencies?.some(dep => names.includes(dep)) && (state.touched || this.validated.has(name));
    }).map(([name]) => name);
    if (validate.length) this.validateBackground(validate);
  }
  touch(name: string) { this.state(name, { touched: true }); if (this.fields.get(name)?.options.trigger === 'blur') this.validateBackground([name]); }
  private validateBackground(names: string[]) { void this.validate(names as FieldName<T>[]).catch(error => this.report(error, 'validate')); }
  report(error: unknown, phase: 'validate' | 'submit' | 'change') { if (this.onError) this.onError(error, phase); else console.error('[paper-ink Form]', phase, error); }
  reset = (values?: T) => {
    this.revision++;
    for (const name of [...this.validations.keys()]) this.cancelValidation(name);
    if (values !== undefined) this.baseline = copy(values);
    this.values = copy(this.baseline);
    const names = new Set([...this.states.keys(), ...this.fields.keys(), ...this.listeners.keys()]); this.states.clear(); this.validated.clear();
    for (const name of names) { this.state(name, { error: undefined, touched: false, validating: false }); this.emit(name); }
    this.updateMeta();
  };
  validate = async (names?: FieldName<T>[]): Promise<ValidationResult<T>> => {
    const target = names ? [...new Set(names)].filter(name => this.fields.has(name)) : [...this.fields.keys()];
    const revision = this.revision; const values = this.getValues(); const errors: Record<string, string> = {};
    let cancelled = false; const controllers = new Map<string, AbortController>();
    try { await Promise.all(target.map(async name => {
      const entry = this.fields.get(name)!; const options = entry.options;
      this.cancelValidation(name); const controller = new AbortController(); this.validations.set(name, controller); controllers.set(name, controller);
      this.validated.add(name); this.state(name, { validating: true });
      try {
        let error: string | undefined;
        if (options.required && missing(this.values[name])) error = typeof options.required === 'string' ? options.required : `请填写${typeof options.label === 'string' ? options.label : '此字段'}`;
        else if (options.validate) {
          const validation = Promise.resolve(options.validate(copy(this.values[name]), { values: copy(values), signal: controller.signal }));
          // A validator may ignore signal: racing abort still ends the cancelled submission promptly.
          const aborted = new Promise<undefined>(resolve => controller.signal.addEventListener('abort', () => resolve(undefined), { once: true }));
          error = await Promise.race([validation, aborted]);
        }
        if (controller.signal.aborted || revision !== this.revision || this.fields.get(name) !== entry) { cancelled = true; return; }
        if (error !== undefined && typeof error !== 'string') throw new TypeError('Field validate must return a string or undefined');
        if (error) errors[name] = error;
        this.state(name, { error });
      } finally {
        if (this.validations.get(name) === controller) { this.validations.delete(name); this.state(name, { validating: false }); }
      }
    })); } catch (error) {
      for (const [name, controller] of controllers) if (this.validations.get(name) === controller) this.cancelValidation(name);
      throw error;
    }
    return { status: cancelled || revision !== this.revision ? 'cancelled' : Object.keys(errors).length ? 'invalid' : 'valid', values, errors } as ValidationResult<T>;
  };
  focusFirst(errors: Partial<Record<FieldName<T>, string>>) {
    for (const [name, entry] of this.fields) if (own(errors, name)) { entry.options.focus?.(); break; }
  }
  startSubmit() { if (this.meta.submitting) return false; this.updateMeta({ submitting: true }); return true; }
  finishSubmit() { this.updateMeta({ submitting: false }); }
}
