import { defaultToken } from './defaults.js';
import type { DeepPartial, ResolvedTheme, ThemeConfig, ThemeToken } from './types.js';
export function merge<T extends object>(base: T, patch?: DeepPartial<T>): T {
  const result = { ...base };
  if (!patch) return result;
  for (const key of Object.keys(patch) as (keyof T)[]) {
    const value = patch[key];
    if (value === undefined) continue;
    const old = base[key];
    result[key] = (value !== null && typeof value === 'object' && old !== null && typeof old === 'object'
      ? merge(old as object, value as DeepPartial<object>) : value) as T[keyof T];
  }
  return result;
}
export const defaultTheme: ResolvedTheme = { token: defaultToken, components: {} };
export function resolveTheme(parent: ResolvedTheme, config?: ThemeConfig): ResolvedTheme {
  const base = config?.inherit === false ? defaultTheme : parent;
  return { token: merge<ThemeToken>(base.token, config?.token), components: { Button: { ...base.components.Button, ...config?.components?.Button }, Input: { ...base.components.Input, ...config?.components?.Input }, Modal: { ...base.components.Modal, ...config?.components?.Modal } } };
}
