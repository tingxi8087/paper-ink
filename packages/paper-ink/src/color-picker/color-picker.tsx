import { cloneElement, forwardRef, useEffect, useId, useRef, useState, type ButtonHTMLAttributes, type PointerEvent } from 'react';
import { Color, sameColor, type ColorFormat } from './color.js';
import type { ColorPickerProps } from './types.js';
import { useTheme } from '../config-provider/index.js';
import { themeVariables } from '../theme/variables.js';
import { defineFieldBinding } from '../internal/field-binding.js';
import { Popover } from '../popover/index.js';
import { Input } from '../input/index.js';
import { Select } from '../select/index.js';
import { CloseIcon } from '../internal/icons.js';

export const ColorPicker = forwardRef<HTMLButtonElement, ColorPickerProps>(function ColorPicker(props, ref) {
  const { value, defaultValue = '#171717', onChange, onChangeComplete, format: givenFormat, defaultFormat = 'hex', onFormatChange,
    open: givenOpen, defaultOpen = false, onOpenChange, disabled = false, disabledAlpha = false, disabledFormat = false, allowClear = false, onClear,
    presets = [], showText = false, size = 'middle', status, placement = 'bottomLeft', getPopupContainer, children, destroyOnHidden = false,
    className, style, onClick, onBlur, ...rest } = props;
  const theme = useTheme(); const helpId = useId();
  const controlled = Object.prototype.hasOwnProperty.call(props, 'value');
  const [inner, setInner] = useState(() => new Color(defaultValue));
  const [, refresh] = useState(0);
  const previous = useRef(inner); const emitted = useRef<Color | null>(null);
  let color = controlled ? emitted.current && (value === emitted.current || typeof value === 'string' && value === emitted.current.toCssString()) ? emitted.current : new Color(value, previous.current) : inner;
  if (!color.isValid) color = previous.current;
  if (disabledAlpha && color.a !== 1) color = color.cleared ? new Color(null, color.with({ a: 1 })) : color.with({ a: 1 });
  previous.current = color;
  const [innerFormat, setFormat] = useState(defaultFormat); const format = givenFormat ?? innerFormat;
  const [innerOpen, setOpen] = useState(defaultOpen); const open = !disabled && (givenOpen ?? innerOpen);
  const [formatOpen, setFormatOpen] = useState(false);
  const [draft, setDraft] = useState(color.format(format)); const [editing, setEditing] = useState(false); const [invalid, setInvalid] = useState(false);
  const latest = useRef(color); latest.current = color;
  const requested = useRef(color);
  const panelRef = useRef<HTMLDivElement>(null); const skipBlur = useRef(false); const skipBlurTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const drag = useRef<{ pointer: number; element: HTMLElement } | null>(null);
  function cancelDrag() { const active = drag.current; drag.current = null; if (active?.element.hasPointerCapture?.(active.pointer)) active.element.releasePointerCapture(active.pointer); }
  useEffect(() => {
    if (!editing) { setDraft(color.format(format)); setInvalid(false); }
  }, [color.h, color.s, color.b, color.a, color.cleared, format, editing]);
  // Parent overrides win over an unfinished drag; accepting our own value preserves precision.
  useEffect(() => {
    if (!open || disabled || controlled && emitted.current && !sameColor(color, emitted.current)) cancelDrag();
    if (!open) { setEditing(false); setInvalid(false); setFormatOpen(false); setDraft(color.format(format)); }
  }, [open, disabled, controlled, color.h, color.s, color.b, color.a, color.cleared, format]);
  useEffect(() => () => { cancelDrag(); clearTimeout(skipBlurTimer.current); }, []);
  useEffect(() => { setEditing(false); setInvalid(false); setDraft(latest.current.format(format)); }, [givenFormat, value]);
  useEffect(() => {
    if (!open) return;
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape' && event.target instanceof Node && panelRef.current?.contains(event.target)) {
      if (formatOpen) { event.preventDefault(); event.stopPropagation(); setFormatOpen(false); return; }
      // Browsers may run microtasks between capture listeners. Keep the guard for the whole key event.
      skipBlur.current = true; clearTimeout(skipBlurTimer.current); skipBlurTimer.current = setTimeout(() => { skipBlur.current = false; }, 0);
    } };
    window.addEventListener('keydown', escape, true); return () => window.removeEventListener('keydown', escape, true);
  }, [open, formatOpen]);
  const changeOpen = (next: boolean) => { if (disabled || next === open) return; if (givenOpen === undefined) setOpen(next); onOpenChange?.(next); if (!next) { cancelDrag(); setFormatOpen(false); setEditing(false); setInvalid(false); setDraft(latest.current.format(format)); } };
  function update(next: Color, complete = false) {
    if (disabled || !next.isValid) return;
    if (disabledAlpha && next.a !== 1 && !next.cleared) next = next.with({a:1});
    requested.current = next;
    if (!sameColor(latest.current, next)) { emitted.current = next; if (!controlled) setInner(next); else refresh(n=>n+1); onChange?.(next, next.toCssString()); }
    if (complete) onChangeComplete?.(next);
  }
  function applyDraft() {
    if (!editing || skipBlur.current) return;
    const parsed = new Color(draft, latest.current);
    if (!parsed.isValid) { setInvalid(true); return; }
    setInvalid(false); setEditing(false); update(parsed, true);
  }
  function begin(event: PointerEvent<HTMLElement>, apply: (x: number, y: number) => void) {
    if (disabled || event.button !== 0) return;
    event.preventDefault(); cancelDrag(); event.currentTarget.focus();
    drag.current = { pointer: event.pointerId, element: event.currentTarget };
    event.currentTarget.setPointerCapture?.(event.pointerId);
    point(event, apply);
  }
  function point(event: PointerEvent<HTMLElement>, apply: (x: number, y: number) => void) {
    const box = event.currentTarget.getBoundingClientRect();
    const clamp = (n: number) => Math.min(1, Math.max(0, n));
    apply(clamp((event.clientX - box.left) / (box.width || 1)), clamp((event.clientY - box.top) / (box.height || 1)));
  }
  const handlers = (apply: (x: number, y: number) => void) => ({
    onPointerDown: (event: PointerEvent<HTMLElement>) => begin(event, apply),
    onPointerMove: (event: PointerEvent<HTMLElement>) => { if (drag.current?.pointer === event.pointerId) point(event, apply); },
    onPointerUp: (event: PointerEvent<HTMLElement>) => { if (drag.current?.pointer !== event.pointerId) return; cancelDrag(); onChangeComplete?.(requested.current); },
    onPointerCancel: cancelDrag, onLostPointerCapture: () => { drag.current = null; },
  });
  const saturated = color.with({s:1,b:1,a:1}).toHexString();
  const panel = <div ref={panelRef} className="pi-color-picker__panel" style={themeVariables(theme)}>
    <div className="pi-color-picker__square" tabIndex={disabled ? -1 : 0} role="group" aria-label={`颜色区域，饱和度 ${Math.round(color.s*100)}%，亮度 ${Math.round(color.b*100)}%`} aria-describedby={helpId} style={{backgroundColor:saturated}}
      {...handlers((x,y) => update(latest.current.with({s:x,b:1-y})))}
      onKeyDown={event => { const delta=event.shiftKey?.1:.01; const next=latest.current; let change: {s?:number;b?:number};
        if (event.key==='ArrowLeft') change={s:next.s-delta}; else if(event.key==='ArrowRight') change={s:next.s+delta}; else if(event.key==='ArrowUp') change={b:next.b+delta}; else if(event.key==='ArrowDown') change={b:next.b-delta}; else if(event.key==='Home') change={s:0,b:0}; else if(event.key==='End') change={s:1,b:1}; else return;
        event.preventDefault();update(next.with(change),true);
      }}><span className="pi-color-picker__cursor" style={{left:`${color.s*100}%`,top:`${(1-color.b)*100}%`}} /></div>
    <span id={helpId} className="pi-color-picker__sr">方向键调整饱和度和亮度，Shift 加速；Home 选择黑色，End 选择当前纯色。也可在下方输入颜色。</span>
    <div className="pi-color-picker__bar pi-color-picker__hue" role="slider" tabIndex={disabled?-1:0} aria-label="色相" aria-valuemin={0} aria-valuemax={360} aria-valuenow={Number(color.h.toFixed(3))}
      {...handlers(x=>update(latest.current.with({h:x*360})))}
      onKeyDown={event=>{ const n=latest.current.h;const step=event.shiftKey?10:1;const next=event.key==='Home'?0:event.key==='End'?360:event.key==='ArrowLeft'||event.key==='ArrowDown'?n-step:event.key==='ArrowRight'||event.key==='ArrowUp'?n+step:undefined;if(next!==undefined){event.preventDefault();update(latest.current.with({h:next}),true);} }}><span className="pi-color-picker__bar-cursor" style={{left:`${color.h/360*100}%`}} /></div>
    {!disabledAlpha && <div className="pi-color-picker__bar pi-color-picker__alpha pi-color-picker__checker" role="slider" tabIndex={disabled?-1:0} aria-label="透明度" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Number((color.a*100).toFixed(3))}
      {...handlers(x=>update(latest.current.with({a:x})))}
      onKeyDown={event=>{const n=latest.current.a;const step=event.shiftKey?.1:.01;const next=event.key==='Home'?0:event.key==='End'?1:event.key==='ArrowLeft'||event.key==='ArrowDown'?n-step:event.key==='ArrowRight'||event.key==='ArrowUp'?n+step:undefined;if(next!==undefined){event.preventDefault();update(latest.current.with({a:next}),true);} }}>
      <span className="pi-color-picker__alpha-paint" style={{background:`linear-gradient(to right, transparent, ${color.with({a:1}).toHexString()})`}} /><span className="pi-color-picker__bar-cursor" style={{left:`${color.a*100}%`}} /></div>}
    <div className="pi-color-picker__editor">
      <Select aria-label="颜色格式" value={format} open={formatOpen} onOpenChange={setFormatOpen} getPopupContainer={node=>node.closest<HTMLElement>('.pi-color-picker__panel')??node.ownerDocument.body} disabled={disabledFormat} options={['hex','rgb','hsb'].map(value=>({value,label:value.toUpperCase()}))} onChange={next=>{const f=next as ColorFormat;if(givenFormat===undefined)setFormat(f);onFormatChange?.(f);setEditing(false);setInvalid(false);}} />
      <Input aria-label="颜色值" value={draft} placeholder={format==='hex'?'#171717':format==='rgb'?'rgb(23, 23, 23)':'hsb(0, 0%, 9%)'} status={invalid?'error':undefined} aria-invalid={invalid||undefined}
        onChange={event=>{setEditing(true);setInvalid(false);setDraft(event.target.value);}}
        onBlur={applyDraft} onPressEnter={event=>{event.preventDefault();applyDraft();}} onKeyDown={event=>{if(event.key==='Escape' && editing){event.preventDefault();event.stopPropagation();setEditing(false);setInvalid(false);setDraft(latest.current.format(format));}}} />
    </div>
    {invalid && <span className="pi-color-picker__error" role="alert">请输入有效的颜色</span>}
    {allowClear && <button type="button" className="pi-color-picker__clear" disabled={color.cleared} onClick={()=>{update(new Color(null,latest.current),true);setEditing(false);onClear?.();}}><CloseIcon />清空颜色</button>}
    {presets.map((preset,index)=><div key={index} className="pi-color-picker__presets"><div className="pi-color-picker__preset-title">{preset.label}</div><div className="pi-color-picker__swatches">{preset.colors.map((value,i)=>{const choice=new Color(value);if(!choice.isValid)return null;return <button key={i} type="button" className="pi-color-picker__swatch pi-color-picker__checker" aria-label={`选择 ${choice.toCssString()||'无颜色'}`} aria-pressed={!color.cleared&&choice.toCssString()===color.toCssString()} onClick={()=>{setEditing(false);update(new Color(value,latest.current),true);}}><span style={{background:choice.toCssString()}} /></button>;})}</div></div>)}
  </div>;
  const triggerProps: ButtonHTMLAttributes<HTMLButtonElement> = { ...rest, disabled, type:rest.type??'button', 'aria-label':rest['aria-label']??'选择颜色', 'aria-invalid':rest['aria-invalid']??(status==='error'?true:undefined), onClick, onBlur,
    className:['pi-color-picker',`pi-color-picker--${size}`,status&&`pi-color-picker--${status}`,className].filter(Boolean).join(' '),style:{...themeVariables(theme),...style} };
  const custom = children as React.ReactElement<ButtonHTMLAttributes<HTMLButtonElement>> | undefined;
  const trigger=custom ? cloneElement(custom, { ...rest, disabled:disabled||custom.props.disabled, 'aria-disabled':disabled||custom.props.disabled||undefined, style:{...themeVariables(theme),...custom.props.style,...style}, className:[custom.props.className,className].filter(Boolean).join(' '), onClick:event=>{custom.props.onClick?.(event);onClick?.(event);if(event.defaultPrevented)event.stopPropagation();},onBlur:event=>{custom.props.onBlur?.(event);onBlur?.(event);} }) : <button {...triggerProps} onClick={event=>{onClick?.(event);if(event.defaultPrevented)event.stopPropagation();}} ref={ref}><span className="pi-color-picker__preview pi-color-picker__checker"><span style={{background:color.toCssString()}} />{color.cleared&&<CloseIcon />}</span>{showText && <span>{typeof showText==='function'?showText(color):color.cleared?'无颜色':color.format(format)}</span>}</button>;
  return <Popover content={panel} title="选择颜色" trigger="click" open={open} onOpenChange={changeOpen} placement={placement} getPopupContainer={getPopupContainer} destroyOnHidden={destroyOnHidden} className="pi-color-picker__popup">{trigger}</Popover>;
});
defineFieldBinding(ColorPicker, { getValue: (_color: Color, css: string) => css || null, toControlValue:value=>value??null });
