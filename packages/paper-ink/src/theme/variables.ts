import type { CSSProperties } from 'react';
import type { ResolvedTheme } from './types.js';
const kebab = (s: string) => s.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`);
export function themeVariables(theme: ResolvedTheme): CSSProperties {
  const vars: Record<string, string | number> = {};
  const walk = (value: object, path: string[]) => {
    for (const [key, item] of Object.entries(value)) {
      const next = [...path, kebab(key)];
      if (typeof item === 'object' && item !== null) walk(item, next);
      else vars[`--pi-${next.join('-')}`] = typeof item === 'number' ? `${item}${next[0] === 'motion' ? 'ms' : 'px'}` : item;
    }
  };
  walk(theme.token, []);
  vars['--pi-button-radius'] = theme.components.Button?.radius === undefined ? 'initial' : `${theme.components.Button.radius}px`;
  vars['--pi-button-padding-inline'] = theme.components.Button?.paddingInline === undefined ? 'initial' : `${theme.components.Button.paddingInline}px`;
  for (const [component, fields] of [['Input', ['radius', 'paddingInline']], ['Modal', ['radius', 'padding']]] as const) {
    for (const field of fields) {
      const value = (theme.components[component] as Record<string, number> | undefined)?.[field];
      vars[`--pi-${component.toLowerCase()}-${kebab(field)}`] = value === undefined ? 'initial' : `${value}px`;
    }
  }
  return vars as CSSProperties;
}
