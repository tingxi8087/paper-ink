import { forwardRef, useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../config-provider/index.js';
import { themeVariables } from '../theme/variables.js';
export interface SpinProps extends HTMLAttributes<HTMLDivElement> { spinning?: boolean; delay?: number; size?: 'small' | 'default' | 'medium' | 'large'; indicator?: ReactNode; tip?: ReactNode; description?: ReactNode; fullscreen?: boolean; percent?: number | 'auto'; wrapperClassName?: string }
let defaultIndicator: ReactNode;
const SpinRoot = forwardRef<HTMLDivElement, SpinProps>(function Spin({ spinning = true, delay = 0, size = 'medium', indicator, tip, description, fullscreen = false, percent, wrapperClassName, children, className, style, ...rest }, ref) {
 const theme = useTheme(); const [delayed, setDelayed] = useState(spinning && delay <= 0); const content = useRef<HTMLDivElement>(null);
 useEffect(() => { if (!spinning || delay <= 0) { setDelayed(spinning); return; } setDelayed(false); const timer = setTimeout(() => setDelayed(true), Math.max(0, delay)); return () => clearTimeout(timer); }, [spinning, delay]);
 const visible = spinning && (delay <= 0 || delayed);
 useEffect(() => { const node = content.current; if (!node) return; if (visible) { node.setAttribute('inert', ''); if (node.contains(node.ownerDocument.activeElement)) (node.ownerDocument.activeElement as HTMLElement)?.blur?.(); } else node.removeAttribute('inert'); }, [visible]);
 const label = description ?? tip;
 const progress = typeof percent === 'number' && Number.isFinite(percent) ? Math.max(0, Math.min(100, percent)) : undefined;
 const spinner = visible && <div className="pi-spin__indicator" role={progress === undefined ? 'status' : 'progressbar'} aria-label={typeof label === 'string' ? label : '加载中'} aria-valuenow={progress} aria-valuemin={progress === undefined ? undefined : 0} aria-valuemax={progress === undefined ? undefined : 100}>
  {indicator ?? defaultIndicator ?? <span className="pi-spin__ring" aria-hidden="true" />}{label != null && <div className="pi-spin__description">{label}</div>}{progress !== undefined && <span className="pi-spin__percent" aria-hidden="true">{Math.round(progress)}%</span>}
 </div>;
 const root = <div {...rest} ref={ref} className={['pi-spin', `pi-spin--${size}`, children != null && 'pi-spin--nested', fullscreen && 'pi-spin--fullscreen', visible && 'pi-spin--spinning', wrapperClassName, className].filter(Boolean).join(' ')} style={{ ...themeVariables(theme), ...style }} aria-busy={visible}>
  {children != null && <div ref={content} className="pi-spin__content" aria-hidden={visible || undefined}>{children}</div>}{spinner}
 </div>;
 if (fullscreen) return visible && typeof document !== 'undefined' ? createPortal(root, document.body) : null;
 return root;
});
export const Spin = Object.assign(SpinRoot, { setDefaultIndicator(indicator: ReactNode) { defaultIndicator = indicator; } });
