import { createContext, forwardRef, useContext } from 'react';
import type { CSSProperties, HTMLAttributes } from 'react';
import { gapValue, type LayoutGap } from '../layout/shared.js';
type GridMode = { columns?: number | string; minChildWidth?: never } | { columns?: never; minChildWidth: number | string };
export type SimpleGridProps = HTMLAttributes<HTMLDivElement> & GridMode & {
  gap?: LayoutGap; rowGap?: LayoutGap; columnGap?: LayoutGap;
  align?: CSSProperties['alignItems']; justify?: CSSProperties['justifyContent'];
};
export interface SimpleGridItemProps extends HTMLAttributes<HTMLDivElement> { span?: number | 'full' }
const GridContext = createContext<{ auto: boolean; columns?: number } | null>(null);
const Grid = forwardRef<HTMLDivElement, SimpleGridProps>(function SimpleGrid(
  { columns, minChildWidth, gap = 'medium', rowGap, columnGap, align, justify, className, style, children, ...props }, ref,
) {
  const auto = minChildWidth !== undefined;
  if (auto && columns !== undefined) throw new Error('SimpleGrid: columns and minChildWidth are mutually exclusive.');
  if (typeof columns === 'number' && (!Number.isInteger(columns) || columns < 1)) throw new Error('SimpleGrid: columns must be a positive integer.');
  if (typeof minChildWidth === 'number' && (!Number.isFinite(minChildWidth) || minChildWidth <= 0)) throw new Error('SimpleGrid: minChildWidth must be positive.');
  const width = typeof minChildWidth === 'number' ? `${minChildWidth}px` : minChildWidth;
  const count = columns ?? 1;
  const template = auto ? `repeat(auto-fit, minmax(min(100%, ${width}), 1fr))`
    : typeof count === 'number' ? `repeat(${count}, minmax(0, 1fr))` : count;
  return <GridContext.Provider value={{ auto, columns: typeof count === 'number' && !auto ? count : undefined }}>
    <div {...props} ref={ref} className={['pi-simple-grid', className].filter(Boolean).join(' ')}
      style={{ gridTemplateColumns: template, gap: gapValue(gap),
        rowGap: gapValue(rowGap ?? gap), columnGap: gapValue(columnGap ?? gap),
        alignItems: align, justifyContent: justify, ...style }}>{children}</div>
  </GridContext.Provider>;
});
const Item = forwardRef<HTMLDivElement, SimpleGridItemProps>(function SimpleGridItem({ span = 1, className, style, ...props }, ref) {
  const grid = useContext(GridContext);
  if (typeof span === 'number' && (!Number.isInteger(span) || span < 1)) throw new Error('SimpleGrid.Item: span must be a positive integer or "full".');
  if (grid?.auto && span !== 'full' && span !== 1) throw new Error('SimpleGrid.Item: automatic columns support only span=1 or span="full".');
  const count = typeof span === 'number' && grid?.columns ? Math.min(span, grid.columns) : span;
  return <div {...props} ref={ref} className={['pi-simple-grid-item', className].filter(Boolean).join(' ')}
    style={{ gridColumn: count === 'full' ? '1 / -1' : `span ${count}`, ...style }} />;
});
export const SimpleGrid = Object.assign(Grid, { Item });
