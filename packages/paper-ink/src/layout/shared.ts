import type { CSSProperties, HTMLAttributes } from 'react';
export type LayoutGap = 'small' | 'medium' | 'large' | number | (string & {});
export interface LayoutProps extends HTMLAttributes<HTMLDivElement> {
  gap?: LayoutGap;
  align?: CSSProperties['alignItems'];
  justify?: CSSProperties['justifyContent'];
}
export function gapValue(value: LayoutGap): string | number {
  return value === 'small' || value === 'medium' || value === 'large'
    ? `var(--pi-spacing-${value}, ${value === 'small' ? 4 : value === 'medium' ? 8 : 16}px)` : value;
}
