import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { useTheme } from '../config-provider/index.js';
import { themeVariables } from '../theme/variables.js';
export interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'title'> {
 count?: ReactNode; dot?: boolean; showZero?: boolean; overflowCount?: number; size?: 'small' | 'medium' | 'default';
 status?: 'success' | 'processing' | 'default' | 'error' | 'warning'; color?: string; text?: ReactNode; offset?: [number, number]; title?: string | null | false;
}
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge({ count, dot = false, showZero = false, overflowCount = 99, size = 'medium', status, color, text, offset, title, children, className, style, ...rest }, ref) {
 const theme = useTheme(); const numeric = typeof count === 'number' || (typeof count === 'string' && count.trim() !== '' && Number.isFinite(Number(count))) ? Number(count) : undefined;
 const visible = dot || status !== undefined || (count !== undefined && count !== null && count !== '' && count !== false && (numeric !== 0 || showZero));
 const display = numeric !== undefined && numeric > overflowCount ? `${overflowCount}+` : count;
 const resolvedColor = color ?? (status === 'default' ? theme.token.color.text.disabled : status === 'processing' ? theme.token.color.info.solid : theme.token.color[status ?? 'error'].solid);
 const label = title === null || title === false ? undefined : title ?? (typeof count === 'string' || typeof count === 'number' ? String(count) : undefined);
 return <span {...rest} ref={ref} className={['pi-badge', children != null && 'pi-badge--attached', className].filter(Boolean).join(' ')} style={{...themeVariables(theme), ...style}}>{children}{visible && <sup title={label} className={['pi-badge__indicator', (dot || status) && 'pi-badge__indicator--dot', `pi-badge__indicator--${size}`, status === 'processing' && 'pi-badge__indicator--processing'].filter(Boolean).join(' ')} style={{background: resolvedColor, ...(offset ? { marginInlineEnd: -offset[0], marginTop: offset[1] } : {})}}>{!dot && !status && display}</sup>}{text != null && <span className="pi-badge__text">{text}</span>}</span>;
});
