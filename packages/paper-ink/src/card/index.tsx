import { forwardRef, type HTMLAttributes, type ReactNode, type CSSProperties } from 'react';
import { useTheme } from '../config-provider/index.js';
import { themeVariables } from '../theme/variables.js';
type CardPart = 'root' | 'header' | 'title' | 'extra' | 'cover' | 'body' | 'actions';
export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
 title?: ReactNode; extra?: ReactNode; cover?: ReactNode; actions?: ReactNode[]; size?: 'small' | 'medium' | 'default'; type?: 'inner';
 variant?: 'outlined' | 'borderless'; bordered?: boolean; hoverable?: boolean; loading?: boolean;
 styles?: Partial<Record<CardPart, CSSProperties>>; classNames?: Partial<Record<CardPart, string>>; headStyle?: CSSProperties; bodyStyle?: CSSProperties;
}
const CardRoot = forwardRef<HTMLDivElement, CardProps>(function Card({ title, extra, cover, actions, size = 'medium', type, variant, bordered = true, hoverable, loading, styles = {}, classNames = {}, headStyle, bodyStyle, children, className, style, ...rest }, ref) {
 const theme = useTheme(); const border = variant ? variant === 'outlined' : bordered;
 const cls = (part: CardPart) => [`pi-card__${part}`, classNames[part]].filter(Boolean).join(' ');
 return <div {...rest} ref={ref} className={['pi-card', size === 'small' && 'pi-card--small', type === 'inner' && 'pi-card--inner', !border && 'pi-card--borderless', hoverable && 'pi-card--hoverable', classNames.root, className].filter(Boolean).join(' ')} style={{...themeVariables(theme), ...styles.root, ...style}} aria-busy={loading || undefined}>
 {(title != null || extra != null) && <div className={cls('header')} style={{...headStyle, ...styles.header}}><div className={cls('title')} style={styles.title}>{title}</div>{extra != null && <div className={cls('extra')} style={styles.extra}>{extra}</div>}</div>}
 {cover != null && <div className={cls('cover')} style={styles.cover}>{cover}</div>}
 <div className={cls('body')} style={{...bodyStyle, ...styles.body}}>{loading ? <div className="pi-card__loading" role="status" aria-label="加载中"><span /><span /><span /></div> : children}</div>
 {!!actions?.length && <ul className={cls('actions')} style={styles.actions}>{actions.map((action, index) => <li key={index}>{action}</li>)}</ul>}
 </div>;
});
export interface CardMetaProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> { avatar?: ReactNode; title?: ReactNode; description?: ReactNode }
const Meta = forwardRef<HTMLDivElement, CardMetaProps>(function Meta({ avatar, title, description, children, className, style, ...rest }, ref) {
 const theme = useTheme(); return <div {...rest} ref={ref} className={['pi-card-meta',className].filter(Boolean).join(' ')} style={{...themeVariables(theme),...style}}>{avatar != null && <div className="pi-card-meta__avatar">{avatar}</div>}<div className="pi-card-meta__detail">{title != null && <div className="pi-card-meta__title">{title}</div>}{description != null && <div className="pi-card-meta__description">{description}</div>}{children}</div></div>;
});
export const Card = Object.assign(CardRoot, { Meta });
