import { forwardRef, type HTMLAttributes, type CSSProperties } from 'react';
import { useTheme } from '../config-provider/index.js';
import { themeVariables } from '../theme/variables.js';
export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
 orientation?: 'horizontal' | 'vertical'; type?: 'horizontal' | 'vertical'; vertical?: boolean;
 titlePlacement?: 'start' | 'center' | 'end'; orientationMargin?: string | number;
 plain?: boolean; dashed?: boolean; variant?: 'solid' | 'dashed' | 'dotted'; size?: 'small' | 'medium' | 'large';
}
export const Divider = forwardRef<HTMLDivElement, DividerProps>(function Divider({ orientation, type, vertical, titlePlacement = 'center', orientationMargin, plain, dashed, variant, size = 'large', children, className, style, ...rest }, ref) {
 const theme = useTheme(); const direction = orientation ?? type ?? (vertical ? 'vertical' : 'horizontal');
 const margin = typeof orientationMargin === 'string' && /^\d+(\.\d+)?$/.test(orientationMargin) ? `${orientationMargin}px` : orientationMargin;
 return <div {...rest} ref={ref} role="separator" aria-orientation={direction} className={['pi-divider', `pi-divider--${direction}`, `pi-divider--${titlePlacement}`, children != null && 'pi-divider--with-text', plain && 'pi-divider--plain', className].filter(Boolean).join(' ')} style={{ ...themeVariables(theme), '--pi-divider-space': `${theme.token.spacing[size]}px`, '--pi-divider-line': variant ?? (dashed ? 'dashed' : 'solid'), ...(margin !== undefined ? {'--pi-divider-title-margin': typeof margin === 'number' ? `${margin}px` : margin} : {}), ...style } as CSSProperties}>{direction === 'horizontal' && children != null && <span className="pi-divider__text">{children}</span>}</div>;
});
