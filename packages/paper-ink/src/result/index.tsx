import { forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import { useTheme } from '../config-provider/index.js';
import { themeVariables } from '../theme/variables.js';
import { FileSearchIcon, ServerIcon, ShieldIcon, StatusIcon } from '../internal/icons.js';
export type ResultStatus = 'success' | 'error' | 'info' | 'warning' | '403' | '404' | '500' | 403 | 404 | 500;
export type ResultSemantic = 'root' | 'icon' | 'title' | 'subTitle' | 'extra' | 'body';
export interface ResultProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  rootClassName?: string; status?: ResultStatus; title?: ReactNode; subTitle?: ReactNode; icon?: ReactNode; extra?: ReactNode;
  classNames?: Partial<Record<ResultSemantic, string>>; styles?: Partial<Record<ResultSemantic, CSSProperties>>;
}
export const Result = forwardRef<HTMLDivElement, ResultProps>(function Result({ status = 'info', title, subTitle, icon, extra, children, classNames = {}, styles = {}, className, rootClassName, style, ...rest }, ref) {
  const theme = useTheme(); const resolved = String(status) as Exclude<ResultStatus, number>; const exception = resolved === '403' || resolved === '404' || resolved === '500';
  const color = exception ? theme.token.color.primary.solid : theme.token.color[resolved].solid;
  const defaultIcon = resolved === '403' ? <ShieldIcon width={56} height={56} /> : resolved === '404' ? <FileSearchIcon width={56} height={56} /> : resolved === '500' ? <ServerIcon width={56} height={56} /> : <StatusIcon type={resolved} circle width={56} height={56} />;
  const classes = (part: ResultSemantic) => [`pi-result__${part}`, classNames[part]].filter(Boolean).join(' ');
  return <div {...rest} ref={ref} className={['pi-result', `pi-result--${status}`, className, rootClassName, classNames.root].filter(Boolean).join(' ')} style={{ ...themeVariables(theme), ...styles.root, ...style }}>
    {icon !== null && icon !== false && <div className={classes('icon')} style={{ color, ...styles.icon }}>{icon ?? defaultIcon}</div>}
    {title != null && <div className={classes('title')} style={styles.title}>{title}</div>}
    {subTitle != null && <div className={classes('subTitle')} style={styles.subTitle}>{subTitle}</div>}
    {extra != null && <div className={classes('extra')} style={styles.extra}>{extra}</div>}
    {children != null && <div className={classes('body')} style={styles.body}>{children}</div>}
  </div>;
});
