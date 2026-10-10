import { forwardRef } from 'react';
import { gapValue, type LayoutProps } from '../layout/shared.js';
export interface StackProps extends LayoutProps {}
export const Stack = forwardRef<HTMLDivElement, StackProps>(function Stack(
  { gap = 'medium', align, justify, className, style, ...props }, ref,
) {
  return <div {...props} ref={ref} className={['pi-stack', className].filter(Boolean).join(' ')}
    style={{ gap: gapValue(gap), alignItems: align, justifyContent: justify, ...style }} />;
});
