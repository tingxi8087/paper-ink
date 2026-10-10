import { forwardRef } from 'react';
import { gapValue, type LayoutProps } from '../layout/shared.js';
export interface InlineProps extends LayoutProps { wrap?: boolean }
export const Inline = forwardRef<HTMLDivElement, InlineProps>(function Inline(
  { gap = 'medium', align, justify, wrap = true, className, style, ...props }, ref,
) {
  return <div {...props} ref={ref} className={['pi-inline', className].filter(Boolean).join(' ')}
    style={{ gap: gapValue(gap), alignItems: align, justifyContent: justify, flexWrap: wrap ? 'wrap' : 'nowrap', ...style }} />;
});
