import { forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import { useTheme } from '../config-provider/index.js';
import { themeVariables } from '../theme/variables.js';
type EmptySemantic = 'root' | 'image' | 'description' | 'footer';
export interface EmptyProps extends HTMLAttributes<HTMLDivElement> { image?: ReactNode; imageStyle?: CSSProperties; description?: ReactNode; classNames?: Partial<Record<EmptySemantic, string>>; styles?: Partial<Record<EmptySemantic, CSSProperties>> }
const simple = <svg width="64" height="44" viewBox="0 0 64 44" fill="none" aria-hidden="true"><path d="M12 16 22 4h20l10 12v23H12V16Z" fill="currentColor" opacity=".08"/><path d="M12 16h12l3 6h10l3-6h12M12 16 22 4h20l10 12v23H12V16Z" stroke="currentColor" opacity=".35"/><path d="M7 40h50" stroke="currentColor" opacity=".15"/></svg>;
const detailed = <svg width="88" height="64" viewBox="0 0 88 64" fill="none" aria-hidden="true"><ellipse cx="44" cy="56" rx="36" ry="5" fill="currentColor" opacity=".06"/><path d="m15 24 13-17h32l13 17v30H15V24Z" fill="currentColor" opacity=".06"/><path d="M15 24h20l4 8h10l4-8h20M15 24 28 7h32l13 17v30H15V24Z" stroke="currentColor" opacity=".35"/><path d="M36 15h16" stroke="currentColor" opacity=".2"/></svg>;
const EmptyRoot = forwardRef<HTMLDivElement, EmptyProps>(function Empty({ image = detailed, imageStyle, description = '暂无数据', children, className, classNames, styles, style, ...rest }, ref) {
 const theme = useTheme(); const hasDescription = description !== false && description !== null && description !== '';
 return <div {...rest} ref={ref} className={['pi-empty', className, classNames?.root].filter(Boolean).join(' ')} style={{ ...themeVariables(theme), ...styles?.root, ...style }}>
  {image !== false && image != null && <div className={['pi-empty__image', classNames?.image].filter(Boolean).join(' ')} style={{ ...imageStyle, ...styles?.image }}>{typeof image === 'string' ? <img src={image} alt="" /> : image}</div>}
  {hasDescription && <div className={['pi-empty__description', classNames?.description].filter(Boolean).join(' ')} style={styles?.description}>{description}</div>}
  {children != null && <div className={['pi-empty__footer', classNames?.footer].filter(Boolean).join(' ')} style={styles?.footer}>{children}</div>}
 </div>;
});
export const Empty = Object.assign(EmptyRoot, { PRESENTED_IMAGE_DEFAULT: detailed, PRESENTED_IMAGE_SIMPLE: simple });
