import dayjs, { type Dayjs } from 'dayjs';
import { forwardRef, useEffect, useId, useImperativeHandle, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import type { DatePickerProps, RangePickerProps, TimePickerProps, PickerRef, DateValue } from './date-time-types.js';
import { useTheme } from '../config-provider/index.js';
import { themeVariables } from '../theme/variables.js';
import { CloseIcon, CalendarIcon, ClockIcon, ChevronDownIcon } from './icons.js';
import { inertAttributes } from './inert.js';
import { usePresence } from './motion.js';
import { DatePanel, TimePanel } from './date-time-panels.js';
import { defaultFormat, resolveLocale, normalizeDate, normalizeTime, parseDate, parseTime, isDateAllowed, isTimeAllowed, sameValue } from './date-time.js';
type Props = (DatePickerProps | RangePickerProps | TimePickerProps) & { range?: boolean; timeOnly?: boolean };
type Pair = [DateValue, DateValue];
export const DateTimeControl = forwardRef<PickerRef, Props>(function DateTimeControl(raw, ref) {
  const props = raw as RangePickerProps & TimePickerProps & { range?: boolean; timeOnly?: boolean };
  const { range = false, timeOnly = false, picker = 'date', showTime, disabled = false, allowClear = true, size = 'middle', inputReadOnly, placement = 'bottomLeft' } = props;
  const locale = resolveLocale(props.locale);
  const withTime = timeOnly || !!showTime && picker === 'date';
  const sourceTimeOptions = timeOnly ? props : typeof showTime === 'object' ? showTime : {};
  const timeOptions = { format: sourceTimeOptions.format, hourStep: sourceTimeOptions.hourStep, minuteStep: sourceTimeOptions.minuteStep, secondStep: sourceTimeOptions.secondStep };
  const timeFormat = timeOptions.format ?? 'HH:mm:ss';
  const format = props.format ?? (timeOnly ? 'HH:mm:ss' : defaultFormat(picker, withTime));
  const confirm = props.needConfirm ?? withTime;
  const controlled = Object.prototype.hasOwnProperty.call(raw, 'value');
  const openControlled = Object.prototype.hasOwnProperty.call(raw, 'open');
  const [inner, setInner] = useState<DateValue | Pair>(props.defaultValue ?? null);
  const committed = (controlled ? props.value : inner) ?? null;
  const toPair = (value: typeof committed): Pair => range ? Array.isArray(value) ? [...value] : [null, null] : [Array.isArray(value) ? null : value, null];
  const textsFor = (pair: Pair): [string, string] => [pair[0]?.format(format) ?? '', pair[1]?.format(format) ?? ''];
  const [draft, setDraft] = useState<Pair>(() => toPair(committed));
  const [texts, setTexts] = useState<[string, string]>(() => textsFor(toPair(committed)));
  const [errors, setErrors] = useState<[boolean, boolean]>([false, false]);
  const [active, setActive] = useState<0 | 1>(0);
  const [viewDate, setViewDate] = useState(() => toPair(committed)[0] ?? toPair(committed)[1] ?? dayjs());
  const [hover, setHover] = useState<Dayjs | null>(null);
  const [innerOpen, setInnerOpen] = useState(props.defaultOpen ?? false);
  const blocked: [boolean, boolean] = Array.isArray(disabled) ? disabled : [disabled, disabled];
  const expanded = !(blocked[0] && (!range || blocked[1])) && (openControlled ? !!props.open : innerOpen);
  const present = usePresence(expanded, 150);
  const root = useRef<HTMLDivElement>(null), popup = useRef<HTMLDivElement>(null);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const generatedId = useId();
  const id = props.id ?? `pi-picker-${generatedId}`;
  const theme = useTheme();
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const [position, setPosition] = useState<CSSProperties>({ position: 'fixed', visibility: 'hidden' });
  const committedKey = textsFor(toPair(committed)).join('|') + toPair(committed).map(v => v?.valueOf()).join('|');
  const previousKey = useRef(committedKey);
  const editing = useRef<[boolean, boolean]>([false, false]);
  const suppressFocus = useRef(false);
  const setOpen = (next: boolean) => { if (next === expanded) return; if (!openControlled) setInnerOpen(next); props.onOpenChange?.(next); };
  const reset = (restoreInvalid = false) => {
    const pair = toPair(committed); setDraft(pair); setViewDate(pair[active] ?? pair[0] ?? dayjs()); editing.current = [false, false];
    setTexts(current => textsFor(pair).map((text, i) => !restoreInvalid && errors[i] ? current[i] : text) as [string, string]);
    if (restoreInvalid) setErrors([false, false]);
  };
  const close = (escape = false, restoreFocus = false) => { reset(escape); setOpen(false); if (restoreFocus) { suppressFocus.current = true; inputs.current[active]?.focus({ preventScroll: true }); suppressFocus.current = false; } };
  useEffect(() => { if (previousKey.current !== committedKey) { previousKey.current = committedKey; setDraft(toPair(committed)); setTexts(textsFor(toPair(committed))); setErrors([false, false]); editing.current = [false, false]; } }, [committedKey]);
  const wasOpen = useRef(false);
  useEffect(() => { if (expanded && !wasOpen.current) { if (!editing.current.some(Boolean)) reset(); if (root.current) setContainer(props.getPopupContainer?.(root.current) ?? document.body); } else if (!expanded && wasOpen.current) reset(); wasOpen.current = expanded; }, [expanded]);
  useImperativeHandle(ref, () => ({ focus: options => inputs.current[0]?.focus(options), blur: () => inputs.current.forEach(input => input?.blur()) }), []);
  const normalize = (value: Dayjs) => timeOnly ? normalizeTime(value, format) : withTime ? normalizeTime(value, timeFormat) : normalizeDate(value, picker);
  const timeDisabled = (index: number, pair: Pair) => (date: Dayjs) => props.disabledTime?.(date, index === 0 ? 'start' : 'end', { from: index === 1 ? pair[0] ?? undefined : undefined }) ?? {};
  const validValue = (value: Dayjs, index: number, pair: Pair) => value.isValid() && (timeOnly || isDateAllowed(value, { picker, minDate: props.minDate, maxDate: props.maxDate, disabledDate: props.disabledDate, from: index === 1 ? pair[0] ?? undefined : undefined })) && (!withTime || isTimeAllowed(value, { ...timeOptions, format: timeOnly ? format : timeFormat, disabledTime: timeDisabled(index, pair) }));
  const prepare = (pair: Pair): Pair | null => {
    let next: Pair = [...pair];
    if (!range) return next[0] && validValue(next[0], 0, next) ? next : null;
    if (!next[0] && !next[1]) return null;
    if (next[0] && next[1] && next[0].isAfter(next[1])) { if (blocked[0] || blocked[1]) return null; next = [next[1], next[0]]; }
    const empty = props.allowEmpty ?? [false, false];
    return next.every((value, index) => value ? validValue(value, index, next) : empty[index]) ? next : null;
  };
  const commit = (pair: Pair | null) => {
    const before = toPair(committed), next: Pair = pair ?? [null, null];
    const changed = !sameValue(before[0], next[0]) || range && !sameValue(before[1], next[1]);
    if (changed) { const value = pair ? range ? pair : pair[0] : null; if (!controlled) setInner(value); (props.onChange as Function | undefined)?.(value, range ? textsFor(next) : textsFor(next)[0]); }
    if (!controlled || !changed) { setTexts(textsFor(next)); setDraft(next); setErrors([false, false]); }
    else { setTexts(textsFor(before)); setDraft(before); setErrors([false, false]); }
  };
  const update = (pair: Pair, index: 0 | 1, fromInput = false) => {
    setDraft(pair); setTexts(current => textsFor(pair).map((text, i) => fromInput && editing.current[i] ? current[i] : text) as [string, string]); setErrors(current => current.map((error, i) => fromInput && i !== index ? error : false) as [boolean, boolean]); if (!fromInput) editing.current = [false, false];
    if (range && (!pair[index] || validValue(pair[index]!, index, pair))) props.onCalendarChange?.(pair, textsFor(pair), { range: index === 0 ? 'start' : 'end' });
    const ready = prepare(pair);
    if (!confirm && ready) { commit(ready); setOpen(false); suppressFocus.current = true; inputs.current[index]?.focus({ preventScroll: true }); suppressFocus.current = false; }
    else if (range && index === 0 && !blocked[1] && !fromInput) { setActive(1); inputs.current[1]?.focus({ preventScroll: true }); }
  };
  const choose = (value: Dayjs) => {
    if (blocked[active]) return;
    let selected = value;
    if (withTime && !timeOnly) { const clock = draft[active] ?? dayjs().startOf('day'); selected = selected.hour(clock.hour()).minute(clock.minute()).second(clock.second()); }
    const next: Pair = [...draft]; next[active] = normalize(selected);
    if (timeOnly || isDateAllowed(next[active]!, { picker, minDate: props.minDate, maxDate: props.maxDate, disabledDate: props.disabledDate, from: active === 1 ? next[0] ?? undefined : undefined })) update(next, active);
  };
  const pendingPair = (): Pair | null => {
    const pair: Pair = [...draft];
    for (const index of [0, ...(range ? [1] : [])] as (0 | 1)[]) {
      if (!editing.current[index]) continue;
      const text = texts[index];
      let value = text.trim() ? timeOnly ? parseTime(text, format) : parseDate(text, format, picker, withTime) : null;
      if (text.trim() && !value) return null;
      if (value && timeOnly) { const carrier = draft[index] ?? dayjs(); value = carrier.hour(value.hour()).minute(value.minute()).second(value.second()); }
      pair[index] = value ? normalize(value) : null;
    }
    return prepare(pair);
  };
  const finishInputs = (): Pair | null => {
    if (!editing.current.some(Boolean)) return draft;
    const pair: Pair = [...draft], changed: (0 | 1)[] = [];
    for (const index of [0, ...(range ? [1] : [])] as (0 | 1)[]) {
      if (!editing.current[index] || blocked[index]) continue;
      const text = texts[index];
      let value = text.trim() ? timeOnly ? parseTime(text, format) : parseDate(text, format, picker, withTime) : null;
      if (value && timeOnly) { const carrier = draft[index] ?? dayjs(); value = carrier.hour(value.hour()).minute(value.minute()).second(value.second()); }
      pair[index] = value ? normalize(value) : null;
      if (text.trim() && (!pair[index] || !validValue(pair[index]!, index, pair))) { setErrors(current => current.map((error, i) => i === index ? true : error) as [boolean, boolean]); return null; }
      changed.push(index);
    }
    editing.current = [false, false];
    if (!range && !pair[0]) { commit(null); setOpen(false); return pair; }
    if (range) for (const index of changed.slice(0, -1)) props.onCalendarChange?.(pair, textsFor(pair), { range: index === 0 ? 'start' : 'end' });
    update(pair, changed[changed.length - 1] ?? active, true);
    return pair;
  };
  const accept = () => { const pair = finishInputs(); if (!pair) return; const ready = prepare(pair); if (!ready) return; commit(ready); (props.onOk as Function | undefined)?.(range ? ready : ready[0]); setOpen(false); suppressFocus.current = true; inputs.current[active]?.focus({ preventScroll: true }); suppressFocus.current = false; };

  useEffect(() => {
    if (!expanded) return;
    const outside = (event: PointerEvent) => { if (event.target instanceof Node && !root.current?.contains(event.target) && !popup.current?.contains(event.target)) { if (editing.current.some(Boolean)) { finishInputs(); setOpen(false); } else close(); } };
    document.addEventListener('pointerdown', outside, true); return () => document.removeEventListener('pointerdown', outside, true);
  });
  useLayoutEffect(() => {
    if (!expanded || !container || !root.current || !popup.current) return;
    const measure = () => {
      if (!root.current || !popup.current) return;
      const rect = root.current.getBoundingClientRect(), panel = popup.current.getBoundingClientRect();
      const width = Math.min(panel.width || (range ? 560 : 288), window.innerWidth - 16), height = panel.height || 340;
      let above = placement.startsWith('top'); if (!above && rect.bottom + height + 12 > window.innerHeight && rect.top > window.innerHeight - rect.bottom) above = true;
      let left = Math.max(8, Math.min(placement.endsWith('Right') ? rect.right - width : rect.left, window.innerWidth - width - 8));
      let top = Math.max(8, above ? rect.top - height - 4 : rect.bottom + 4);
      const fixed = container === document.body || container === document.documentElement;
      if (!fixed) { const parent = popup.current.offsetParent; if (parent instanceof HTMLElement && !(parent === document.body && getComputedStyle(parent).position === 'static')) { const r = parent.getBoundingClientRect(); left += -r.left + parent.scrollLeft - parent.clientLeft; top += -r.top + parent.scrollTop - parent.clientTop; } else { left += window.scrollX; top += window.scrollY; } }
      const next: CSSProperties = { position: fixed ? 'fixed' : 'absolute', left, top, maxWidth: Math.min(window.innerWidth - 16, fixed ? window.innerWidth - 16 : container.clientWidth || window.innerWidth - 16), maxHeight: window.innerHeight - 16, visibility: 'visible' };
      setPosition(current => JSON.stringify(current) === JSON.stringify(next) ? current : next);
    };
    measure(); const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null; observer?.observe(popup.current); observer?.observe(root.current); if (container !== document.body) observer?.observe(container);
    window.addEventListener('resize', measure); window.addEventListener('scroll', measure, true);
    return () => { observer?.disconnect(); window.removeEventListener('resize', measure); window.removeEventListener('scroll', measure, true); };
  }, [expanded, container, placement]);
  const aria = Object.fromEntries(Object.entries(props).filter(([key]) => key.startsWith('aria-')));
  const placeholders = range ? props.placeholder ?? locale.rangePlaceholder : [props.placeholder ?? (timeOnly ? locale.timePlaceholder : (picker === 'month' ? locale.monthPlaceholder : picker === 'year' ? locale.yearPlaceholder : locale.datePlaceholder))];
  const calendarRange: Pair = hover && range && active === 1 && draft[0] ? [draft[0], hover] : draft;
  const popupNode = <div ref={popup} id={`${id}-popup`} role="dialog" aria-label={locale.locale.startsWith('en') ? timeOnly ? 'Select time' : range ? 'Select date range' : 'Select date' : timeOnly ? '时间选择' : range ? '日期范围选择' : '日期选择'} aria-hidden={!expanded} {...inertAttributes(!expanded)} className={`pi-picker__popup${range ? ' pi-picker__popup--range' : ''}`} data-motion={expanded ? 'enter' : 'leave'} style={{ ...themeVariables(theme), ...position }} onClick={event => event.stopPropagation()} onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); close(true, true); } }} onBlur={event => { const next = event.relatedTarget; if (next instanceof Node && (popup.current?.contains(next) || root.current?.contains(next))) return; close(); }}>
    {props.presets && <div className="pi-picker__presets">{props.presets.map((preset, index) => <button type="button" key={index} onClick={() => { const value = typeof preset.value === 'function' ? preset.value() : preset.value; const pair: Pair = Array.isArray(value) ? [normalize(value[0]), normalize(value[1])] : [normalize(value), null]; const current = toPair(committed); if (range && pair.some((v, i) => blocked[i] && !sameValue(v, current[i]))) return; if (prepare(pair)) update(pair, active); }}>{preset.label}</button>)}</div>}
    <div className="pi-picker__panels">{!timeOnly && <DatePanel value={draft[active]} viewDate={viewDate} onViewDateChange={setViewDate} onSelect={choose} picker={picker} minDate={props.minDate} maxDate={props.maxDate} disabledDate={props.disabledDate} from={active === 1 ? draft[0] ?? undefined : undefined} range={range ? calendarRange : undefined} onHover={setHover} locale={locale} />}{withTime && <TimePanel {...timeOptions} value={draft[active] ?? dayjs().startOf('day')} onChange={value => { const next: Pair = [...draft]; next[active] = normalize(value); if (!blocked[active]) update(next, active); }} format={timeOnly ? format : timeFormat} disabledTime={timeDisabled(active, draft)} locale={locale} />}</div>
    <div className="pi-picker__footer"><button type="button" onClick={() => choose(dayjs())}>{timeOnly ? locale.now : locale.today}</button>{confirm && <button type="button" className="pi-picker__confirm" disabled={!pendingPair()} onClick={accept}>{locale.ok}</button>}</div>
    {props.renderExtraFooter && <div className="pi-picker__extra">{props.renderExtraFooter()}</div>}
    {(errors.some(Boolean) || draft.some(Boolean) && !prepare(draft)) && <div role="status" className="pi-picker__error">{locale.invalid}</div>}
  </div>;
  return <div ref={root} className={['pi-picker', `pi-picker--${size}`, range && 'pi-picker--range', expanded && 'pi-picker--open', blocked.every(Boolean) && 'pi-picker--disabled', (errors.some(Boolean) ? 'error' : props.status) && `pi-picker--${errors.some(Boolean) ? 'error' : props.status}`, props.className].filter(Boolean).join(' ')} style={{ ...themeVariables(theme), ...props.style }}>
    {props.prefix && <span className="pi-picker__prefix">{props.prefix}</span>}
    {([0, ...(range ? [1] : [])] as (0 | 1)[]).map(index => <span className="pi-picker__input-wrap" key={index}>{index === 1 && <ChevronDownIcon className="pi-picker__separator" style={{ transform: 'rotate(-90deg)' }} />}<input className="pi-picker__input" {...aria} ref={element => { inputs.current[index] = element; }} id={index ? `${id}-end` : id} role="combobox" aria-haspopup="dialog" aria-expanded={expanded} aria-controls={expanded ? `${id}-popup` : undefined} aria-invalid={errors[index] || props.status === 'error' || aria['aria-invalid'] || undefined} value={texts[index]} placeholder={Array.isArray(placeholders) ? placeholders[index] : placeholders} readOnly={inputReadOnly} disabled={blocked[index]} onChange={event => { setOpen(true); editing.current[index] = true; setTexts(current => current.map((text, i) => i === index ? event.target.value : text) as [string, string]); setErrors(current => current.map((e, i) => i === index ? false : e) as [boolean, boolean]); }} onFocus={event => { setActive(index); props.onFocus?.(event); if (!suppressFocus.current) setOpen(true); }} onClick={() => { setActive(index); setOpen(true); }} onBlur={event => { props.onBlur?.(event); const target = event.relatedTarget; if (target instanceof Node && (root.current?.contains(target) || popup.current?.contains(target))) return; if (editing.current.some(Boolean)) finishInputs(); setOpen(false); }} onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); close(true); } else if (event.key === 'Enter') { event.preventDefault(); finishInputs(); } else if (event.key === 'ArrowDown') { event.preventDefault(); setOpen(true); requestAnimationFrame(() => popup.current?.querySelector<HTMLElement>('button:not(:disabled)')?.focus()); } }} /></span>)}
    {allowClear && toPair(committed).some(Boolean) && !blocked.some(Boolean) && <button type="button" className="pi-picker__clear" aria-label={locale.clear} onMouseDown={event => event.preventDefault()} onClick={() => { commit(null); setOpen(false); }}><CloseIcon /></button>}
    <span className="pi-picker__suffix">{props.suffixIcon !== undefined ? props.suffixIcon : (timeOnly ? <ClockIcon /> : <CalendarIcon />)}</span>
    {present && container && createPortal(popupNode, container)}
  </div>;
});
