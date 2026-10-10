import { forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import { useTheme } from '../config-provider/index.js';
import { themeVariables } from '../theme/variables.js';
import { DotIcon, LoadingIcon } from '../internal/icons.js';
export interface TimelineItemType extends Omit<HTMLAttributes<HTMLLIElement>, 'title' | 'content'> {
  [attribute: `data-${string}`]: string | number | boolean | undefined;
  key?: string | number; title?: ReactNode; content?: ReactNode; icon?: ReactNode; loading?: boolean; color?: string;
  placement?: 'start' | 'end'; label?: ReactNode; dot?: ReactNode; position?: 'left' | 'right' | 'start' | 'end';
}
export interface TimelineProps extends Omit<HTMLAttributes<HTMLOListElement>, 'children'> {
  items?: TimelineItemType[]; mode?: 'start' | 'end' | 'alternate' | 'left' | 'right'; reverse?: boolean;
  variant?: 'outlined' | 'filled'; pending?: ReactNode; pendingDot?: ReactNode;
}
export const Timeline = forwardRef<HTMLOListElement, TimelineProps>(function Timeline({ items = [], mode = 'start', reverse = false, variant = 'outlined', pending = false, pendingDot, className, style, ...rest }, ref) {
  const theme = useTheme(); const resolvedMode = mode === 'left' ? 'start' : mode === 'right' ? 'end' : mode;
  const entries = items.map((item, index) => ({ ...item, key: item.key ?? index }));
  if (pending !== null && pending !== false && pending !== undefined) entries.push({ key: '__pi-pending', content: pending === true ? undefined : pending, loading: true, icon: pendingDot });
  if (reverse) entries.reverse();
  const labelled = entries.some(item => item.title != null || item.label != null);
  const colors: Record<string, string> = { blue: theme.token.color.info.solid, red: theme.token.color.error.solid, green: theme.token.color.success.solid, gray: theme.token.color.text.disabled, grey: theme.token.color.text.disabled };
  return <ol role="list" {...rest} ref={ref} className={['pi-timeline', `pi-timeline--${resolvedMode}`, `pi-timeline--${variant}`, labelled && 'pi-timeline--labelled', className].filter(Boolean).join(' ')} style={{ ...themeVariables(theme), ...style }}>
    {entries.map((item, index) => {
      const { key, title, label, content, children, icon, dot, loading = false, color, placement, position, className: itemClass, style: itemStyle, ...itemRest } = item;
      const side = placement ?? (position === 'left' ? 'start' : position === 'right' ? 'end' : position) ?? (resolvedMode === 'alternate' ? index % 2 ? 'end' : 'start' : resolvedMode);
      const custom = icon !== undefined ? icon : dot; const heading = title !== undefined ? title : label; const body = content !== undefined ? content : children;
      return <li {...itemRest} key={key} className={['pi-timeline__item', `pi-timeline__item--${side}`, loading && 'pi-timeline__item--loading', itemClass].filter(Boolean).join(' ')} style={itemStyle} aria-busy={loading || undefined}>
        <div className="pi-timeline__title">{heading}</div>
        <div className="pi-timeline__axis"><span className="pi-timeline__tail" aria-hidden="true" /><span className={['pi-timeline__dot', custom === undefined && loading && 'pi-timeline__spinner'].filter(Boolean).join(' ')} style={{ color: color ? colors[color] ?? color : theme.token.color.primary.solid }} aria-hidden="true">{custom !== undefined ? custom : loading ? <LoadingIcon width={16} height={16} /> : <DotIcon width={16} height={16} fill={variant === 'filled' ? 'currentColor' : 'none'} />}</span></div>
        <div className="pi-timeline__content">{body}</div>
      </li>;
    })}
  </ol>;
});
