import { Children, createContext, forwardRef, useContext, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type HTMLAttributes, type ReactNode, type ImgHTMLAttributes } from 'react';
import { useTheme } from '../config-provider/index.js';
import { themeVariables } from '../theme/variables.js';
export type AvatarSize = number | 'small' | 'medium' | 'large' | 'default';
export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> { size?: AvatarSize; shape?: 'circle' | 'square'; src?: ReactNode; srcSet?: string; alt?: string; icon?: ReactNode; gap?: number; onError?: () => boolean | void; crossOrigin?: ImgHTMLAttributes<HTMLImageElement>['crossOrigin']; draggable?: boolean }
const GroupContext = createContext<{size?: AvatarSize; shape?: 'circle' | 'square'}>({});
const useMeasureEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;
const AvatarRoot = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar({size, shape, src, srcSet, alt, icon, gap = 4, onError, crossOrigin, draggable, children, className, style, ...rest}, ref) {
 const theme = useTheme(); const group = useContext(GroupContext); const actualSize = size ?? group.size ?? 'medium'; const pixels = typeof actualSize === 'number' ? Math.max(1, actualSize) : actualSize === 'small' ? 24 : actualSize === 'large' ? 40 : 32;
 const [failedSource, setFailedSource] = useState<ReactNode>(undefined); const failed = failedSource !== undefined && failedSource === src;
 const hasImage = src != null && src !== false && !failed; const content = useRef<HTMLSpanElement>(null); const [scale, setScale] = useState(1);
 useMeasureEffect(() => { const node = content.current; if (!node || hasImage || icon != null) { setScale(1); return; } const measure = () => { const width = node.scrollWidth; setScale(width > 0 ? Math.min(1, Math.max(0,pixels - gap * 2) / width) : 1); }; measure(); const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : undefined; observer?.observe(node); return () => observer?.disconnect(); }, [children, pixels, gap, hasImage, icon]);
 return <span {...rest} ref={ref} className={['pi-avatar', (shape ?? group.shape ?? 'circle') === 'square' && 'pi-avatar--square', hasImage && 'pi-avatar--image',className].filter(Boolean).join(' ')} style={{...themeVariables(theme), width:pixels,height:pixels,fontSize: icon != null ? pixels * .56 : 14,...style}}>
 {hasImage ? typeof src === 'string' ? <img src={src} srcSet={srcSet} alt={alt ?? ''} crossOrigin={crossOrigin} draggable={draggable} onError={() => { if (onError?.() !== false) setFailedSource(src); }} /> : src : <span ref={content} className="pi-avatar__content" style={{transform:`scale(${scale})`}}>{icon ?? children}</span>}
 </span>;
});
export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> { size?: AvatarSize; shape?: 'circle' | 'square' }
const Group = forwardRef<HTMLDivElement, AvatarGroupProps>(function Group({size,shape,children,className,style,...rest},ref) { const theme = useTheme(); return <GroupContext.Provider value={{size,shape}}><div {...rest} ref={ref} className={['pi-avatar-group',className].filter(Boolean).join(' ')} style={{...themeVariables(theme),...style}}>{Children.toArray(children)}</div></GroupContext.Provider>; });
export const Avatar = Object.assign(AvatarRoot, { Group });
