/** A control declares capabilities; Form never imports or identifies a control. */
export interface FieldBinding {
  valueProp?: string;
  changeProp?: string;
  getValue?: (...args: any[]) => unknown;
  toControlValue?: (value: unknown, props: Record<string, any>) => unknown;
  status?: boolean;
  defaultProps?: string[];
}
export const fieldBinding = Symbol.for('paper-ink.field-binding');
export function defineFieldBinding<T>(component: T, binding: FieldBinding): T {
  Object.defineProperty(component, fieldBinding, { value: binding, configurable: true });
  return component;
}
export function getFieldBinding(component: unknown): FieldBinding {
  return (component as { [fieldBinding]?: FieldBinding })?.[fieldBinding] ?? {};
}
export const textFieldBinding: FieldBinding = {
  getValue: event => event.target.value,
  toControlValue: value => value == null ? '' : value,
};
export const checkedFieldBinding: FieldBinding = {
  valueProp: 'checked', getValue: event => event.target.checked,
  toControlValue: value => Boolean(value), status: false,
  defaultProps: ['defaultChecked'],
};
