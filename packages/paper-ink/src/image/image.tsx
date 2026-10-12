import { createContext, forwardRef, useContext, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { useTheme } from '../config-provider/index.js';
import { themeVariables } from '../theme/variables.js';
import { Modal } from '../modal/modal.js';
import { CloseIcon, EyeIcon, ArrowRightIcon } from '../internal/icons.js';
import type { ImagePreviewConfig, ImagePreviewGroupProps, ImageProps } from './types.js';
type Item = { src: string; alt?: string };
type Group = { enabled: boolean; register: (id: string, item: Item, node: HTMLImageElement) => () => void; show: (id: string) => void };
const GroupContext = createContext<Group | null>(null);
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
function ZoomIcon({ plus = false }: { plus?: boolean }) { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="6.5" cy="6.5" r="4.5" /><path d="m10 10 4 4M4 6.5h5" />{plus && <path d="M6.5 4v5" />}</svg>; }
function RotateIcon() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M3 6a5.5 5.5 0 1 1-.2 4M3 2v4h4" /></svg>; }
function Preview({ open, changeOpen, item, config, count = 1, current = 0, changeCurrent }: { open: boolean; changeOpen: (open: boolean) => void; item?: Item; config: ImagePreviewConfig; count?: number; current?: number; changeCurrent?: (index: number) => void }) {
  const [scale, setScale] = useState(1); const [rotation, setRotation] = useState(0);
  const minimum = Number.isFinite(config.minScale) ? Math.max(.1, config.minScale!) : 1;
  const maximum = Number.isFinite(config.maxScale) ? Math.max(minimum, config.maxScale!) : 5;
  const step = Number.isFinite(config.scaleStep) && config.scaleStep! > 0 ? config.scaleStep! : .5;
  useEffect(() => { setScale(clamp(1, minimum, maximum)); setRotation(0); }, [open, item?.src, current, minimum, maximum]);
  useEffect(() => {
    if (!open || !changeCurrent || count < 2) return;
    const keydown = (event: KeyboardEvent) => { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); changeCurrent((current + (event.key === 'ArrowRight' ? 1 : count - 1)) % count); } };
    document.addEventListener('keydown', keydown); return () => document.removeEventListener('keydown', keydown);
  }, [open, current, count, changeCurrent]);
  return <Modal open={open} onCancel={() => changeOpen(false)} footer={null} closable={false} centered width="100%" rootClassName="pi-image-preview-root" className="pi-image-preview" aria-label="图片预览" destroyOnHidden>
    <div className="pi-image-toolbar">
      {count > 1 && <span>{current + 1} / {count}</span>}
      <button type="button" aria-label="缩小图片" disabled={scale <= minimum} onClick={() => setScale(value => clamp(value - step, minimum, maximum))}><ZoomIcon /></button>
      <button type="button" aria-label="放大图片" disabled={scale >= maximum} onClick={() => setScale(value => clamp(value + step, minimum, maximum))}><ZoomIcon plus /></button>
      <button type="button" aria-label="旋转图片" onClick={() => setRotation(value => value + 90)}><RotateIcon /></button>
      <button type="button" aria-label="重置图片" onClick={() => { setScale(clamp(1, minimum, maximum)); setRotation(0); }}>重置</button>
      <button type="button" aria-label="关闭图片预览" onClick={() => changeOpen(false)}><CloseIcon /></button>
    </div>
    <div className="pi-image-stage" onClick={event => { if (event.target === event.currentTarget) changeOpen(false); }} onWheel={event => { setScale(value => clamp(value + (event.deltaY < 0 ? step : -step), minimum, maximum)); }}>
      {item && <img src={item.src} alt={item.alt ?? ''} draggable={false} style={{ transform: `scale(${scale}) rotate(${rotation}deg)` }} />}
    </div>
    {count > 1 && <><button type="button" className="pi-image-prev" aria-label="上一张图片" onClick={() => changeCurrent?.((current + count - 1) % count)}><ArrowRightIcon /></button><button type="button" className="pi-image-next" aria-label="下一张图片" onClick={() => changeCurrent?.((current + 1) % count)}><ArrowRightIcon /></button></>}
  </Modal>;
}
const ImageComponent = forwardRef<HTMLImageElement, ImageProps>(function ImageComponent({ src, alt = '', fallback, placeholder, preview = true, className = '', style, rootClassName = '', rootStyle, onError, onLoad, width, height, ...rest }, forwardedRef) {
  const config = typeof preview === 'object' ? preview : {};
  const [internalOpen, setOpen] = useState(config.defaultOpen ?? false); const open = config.open ?? internalOpen;
  const [failedSrc, setFailedSrc] = useState<string>(); const [loadedSrc, setLoadedSrc] = useState<string>();
  useEffect(() => { setFailedSrc(undefined); setLoadedSrc(undefined); }, [src]);
  const group = useContext(GroupContext); const id = useId(); const imageRef = useRef<HTMLImageElement | null>(null);
  const theme = useTheme();
  const source = src !== undefined && failedSrc === src ? fallback : src;
  const loaded = loadedSrc === source; const enabled = preview !== false && group?.enabled !== false;
  const previewSrc = config.src ?? source;
  useEffect(() => { if (imageRef.current?.complete && imageRef.current.naturalWidth > 0) setLoadedSrc(source); }, [source]);
  useEffect(() => enabled && previewSrc && group && imageRef.current ? group.register(id, { src: previewSrc, alt }, imageRef.current) : undefined, [enabled, previewSrc, alt, group?.register, id]);
  const changeOpen = (next: boolean) => { if (config.open === undefined) setOpen(next); config.onOpenChange?.(next); };
  return <span className={`pi-image ${rootClassName}`} style={{ ...themeVariables(theme), width, height, ...rootStyle }}>
    <img {...rest} ref={node => { imageRef.current = node; if (typeof forwardedRef === 'function') forwardedRef(node); else if (forwardedRef) forwardedRef.current = node; }} src={source} alt={alt} width={width} height={height} className={`pi-image-img ${className}`} style={style} onLoad={event => { setLoadedSrc(source); onLoad?.(event); }} onError={event => { if (source === src && fallback && source !== fallback) setFailedSrc(src); onError?.(event); }} />
    {!loaded && placeholder != null && <span className="pi-image-placeholder">{placeholder === true ? '加载中' : placeholder}</span>}
    {enabled && previewSrc && <button type="button" className="pi-image-mask" aria-label={`预览${alt ? ` ${alt}` : '图片'}`} onClick={() => group ? group.show(id) : changeOpen(true)}>{config.mask ?? <><EyeIcon />预览</>}</button>}
    {!group && enabled && <Preview open={open} changeOpen={changeOpen} item={previewSrc ? { src: previewSrc, alt } : undefined} config={config} />}
  </span>;
});
function PreviewGroup({ children, items, preview = true }: ImagePreviewGroupProps) {
  const config = typeof preview === 'object' ? preview : {};
  const [registered, setRegistered] = useState<Array<Item & { id: string; node: HTMLImageElement }>>([]);
  const [internalOpen, setOpen] = useState(config.defaultOpen ?? false); const open = config.open ?? internalOpen;
  const [internalCurrent, setCurrent] = useState(config.defaultCurrent ?? 0); const rawCurrent = config.current ?? internalCurrent;
  const ordered = (entries: Array<Item & { id: string; node: HTMLImageElement }>) => [...entries].sort((a, b) => a.node.compareDocumentPosition(b.node) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : a.node.compareDocumentPosition(b.node) & Node.DOCUMENT_POSITION_PRECEDING ? 1 : 0);
  const register = useRef<Group['register']>((id, item, node) => { setRegistered(previous => ordered([...previous.filter(entry => entry.id !== id), { id, node, ...item }])); return () => setRegistered(previous => previous.filter(entry => entry.id !== id)); }).current;
  useEffect(() => { setRegistered(previous => { const next = ordered(previous); return next.every((item,index) => item === previous[index]) ? previous : next; }); }, [children]);
  const list = items ? items.map(item => typeof item === 'string' ? { src: item } : item) : registered;
  const current = clamp(Number.isFinite(rawCurrent) ? Math.trunc(rawCurrent) : 0, 0, Math.max(0, list.length - 1));
  const changeOpen = (next: boolean) => { if (config.open === undefined) setOpen(next); config.onOpenChange?.(next); };
  const changeCurrent = (next: number) => { if (config.current === undefined) setCurrent(next); if (next !== current) config.onChange?.(next, current); };
  return <GroupContext.Provider value={{ enabled: preview !== false, register, show: id => { const found = registered.findIndex(item => item.id === id); const index = items ? list.findIndex(item => item.src === registered[found]?.src) : found; changeCurrent(Math.max(0, index)); changeOpen(true); } }}>{children}{preview !== false && list.length > 0 && <Preview open={open} changeOpen={changeOpen} item={list[current]} config={config} count={list.length} current={current} changeCurrent={changeCurrent} />}</GroupContext.Provider>;
}
export const Image = Object.assign(ImageComponent, { PreviewGroup });
