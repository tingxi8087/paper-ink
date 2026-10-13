import { cloneElement, forwardRef, isValidElement, useEffect, useId, useImperativeHandle, useRef, useState, type ReactElement, type Ref, type MouseEvent } from 'react';
import { useTheme } from '../config-provider/index.js';
import { themeVariables } from '../theme/variables.js';
import { defineFieldBinding } from '../internal/field-binding.js';
import { Button } from '../button/button.js';
import { Modal } from '../modal/modal.js';
import { CheckIcon, CloseIcon, EyeIcon, FileSearchIcon, LoadingIcon } from '../internal/icons.js';
import type { UploadFile, UploadProps, UploadRef, UploadRejection } from './types.js';

let sequence = 0;
function accepts(file: File, accept?: string) {
  if (!accept?.trim()) return true;
  return accept.split(',').some(raw => {
    const token = raw.trim().toLowerCase();
    if (!token) return false;
    if (token.startsWith('.')) return file.name.toLowerCase().endsWith(token);
    if (token.endsWith('/*')) return file.type.toLowerCase().startsWith(token.slice(0, -1));
    return file.type.toLowerCase() === token;
  });
}
function image(file: UploadFile) { return file.type?.startsWith('image/') || /\.(png|jpe?g|gif|webp|avif|bmp|svg)(?:[?#]|$)/i.test(file.url ?? file.name); }
const states = { idle: '待上传', uploading: '上传中', done: '已完成', error: '上传失败', cancelled: '已取消' };

function FileRow({ file, picture, card, disabled, pending, remove, preview, customPreview, onCancel, onRetry }: {
  file: UploadFile; picture: boolean; card: boolean; disabled: boolean; pending: boolean;
  remove(): void; preview?: (url: string) => void; customPreview?: boolean; onCancel?: () => void; onRetry?: () => void;
}) {
  const [local, setLocal] = useState<{ file: File; url: string }>();
  const [failed, setFailed] = useState<string>();
  useEffect(() => {
    if (!image(file) || !file.originFileObj || !URL.createObjectURL) return;
    const url = URL.createObjectURL(file.originFileObj);
    setLocal({ file: file.originFileObj, url });
    return () => URL.revokeObjectURL(url);
  }, [file.originFileObj, file.type]);
  const src = file.url ?? (local?.file === file.originFileObj ? local?.url : undefined);
  const canPreview = preview && (customPreview || (image(file) && src));
  const percent = file.percent !== undefined && Number.isFinite(file.percent) ? Math.min(100, Math.max(0, file.percent)) : undefined;
  return <li className={`pi-upload__item pi-upload__item--${file.status}`} data-uid={file.uid}>
    {picture && <div className="pi-upload__thumbnail">{src && failed !== src && image(file) ? <img src={src} alt="" onError={() => setFailed(src)} /> : <FileSearchIcon width={card ? 24 : 18} height={card ? 24 : 18} />}</div>}
    {!picture && <span className="pi-upload__file-icon"><FileSearchIcon /></span>}
    <div className="pi-upload__details"><span className="pi-upload__name" title={file.name}>{file.name}</span>
      <span className="pi-upload__state">{file.status === 'done' && <CheckIcon />}{file.status === 'uploading' && <LoadingIcon />}{states[file.status]}{file.status === 'uploading' && percent !== undefined ? ` ${Math.round(percent)}%` : ''}</span>
      {file.status === 'error' && file.error && <span className="pi-upload__error">{file.error.message}</span>}
      {file.status === 'uploading' && <div className={`pi-upload__progress${percent === undefined ? ' pi-upload__progress--unknown' : ''}`} role="progressbar" aria-label={`${file.name}上传进度`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}><span style={percent === undefined ? undefined : { width: `${percent}%` }} /></div>}
    </div>
    <div className="pi-upload__operations">
      {canPreview && <button type="button" disabled={disabled} aria-label={`预览 ${file.name}`} onClick={() => preview!(src ?? '')}><EyeIcon /></button>}
      {file.status === 'uploading' && onCancel && <button type="button" disabled={disabled} aria-label={`取消上传 ${file.name}`} onClick={onCancel}>取消</button>}
      {(file.status === 'error' || file.status === 'cancelled') && file.originFileObj && onRetry && <button type="button" disabled={disabled} aria-label={`重新上传 ${file.name}`} onClick={onRetry}>重试</button>}
      <button type="button" disabled={disabled || pending} aria-label={`移除 ${file.name}`} aria-busy={pending || undefined} onClick={remove}><CloseIcon /></button>
    </div>
  </li>;
}

function UploadControl<T>(props: UploadProps<T> & { drag?: boolean }, forwardedRef: Ref<UploadRef>) {
  const { fileList, defaultFileList = [], onChange, accept, multiple = false, maxCount, validate, listType = 'text', showUploadList = true,
    onRemove, onPreview, onCancel, onRetry, onReject, disabled = false, status, children, className, style, drag = false, id, onClick, onKeyDown,
    'aria-invalid': invalid, 'aria-labelledby': labelledby, 'aria-describedby': describedby, 'aria-label': ariaLabel, ...rest } = props;
  const [internal, setInternal] = useState<readonly UploadFile<T>[]>(() => [...defaultFileList]);
  const list = fileList ?? internal;
  const latest = useRef({ ...props, list }); latest.current = { ...props, list };
  const root = useRef<HTMLDivElement>(null); const input = useRef<HTMLInputElement>(null);
  const alive = useRef(false); const epoch = useRef(0); const queue = useRef(Promise.resolve());
  const [over, setOver] = useState(false); const [rejections, setRejections] = useState<UploadRejection[]>([]);
  const [removing, setRemoving] = useState<Set<string>>(new Set()); const removingRef = useRef(new Set<string>());
  const [preview, setPreview] = useState<{ uid: string; url: string; name: string; origin?: File; remote?: string }>();
  const theme = useTheme(); const generatedId = useId(); const triggerId = id ?? `${generatedId}-trigger`;
  const open = () => { if (!latest.current.disabled) input.current?.click(); };
  useImperativeHandle(forwardedRef, () => ({ open, get nativeElement() { return root.current; }, focus: () => root.current?.querySelector<HTMLElement>('[data-upload-trigger]')?.focus() }));
  useEffect(() => { alive.current = true; return () => { alive.current = false; epoch.current++; }; }, []);
  useEffect(() => { if (preview && !list.some(file => file.uid === preview.uid && file.originFileObj === preview.origin && file.url === preview.remote)) setPreview(undefined); }, [list, preview]);
  useEffect(() => {
    const form = root.current?.closest('form');
    const reset = () => { epoch.current++; if (latest.current.fileList === undefined) { const next = [...(latest.current.defaultFileList ?? [])]; latest.current.list = next; setInternal(next); } setRejections([]); setPreview(undefined); };
    form?.addEventListener('reset', reset); return () => form?.removeEventListener('reset', reset);
  }, []);
  function commit(info: Parameters<NonNullable<UploadProps<T>['onChange']>>[0]) {
    latest.current.list = info.fileList;
    if (latest.current.fileList === undefined) setInternal(info.fileList);
    latest.current.onChange?.(info);
  }
  function admit(batch: File[]) {
    if (latest.current.disabled || !batch.length) return;
    const admissionEpoch = epoch.current;
    queue.current = queue.current.catch(() => {}).then(async () => {
      const accepted: File[] = []; const rejected: UploadRejection[] = [];
      for (const file of batch) {
        if (!alive.current || epoch.current !== admissionEpoch || latest.current.disabled) return;
        if (!accepts(file, latest.current.accept)) { rejected.push({ file, reason: 'type', message: '文件类型不符合要求' }); continue; }
        try {
          const error = await latest.current.validate?.(file, batch);
          if (error !== undefined) { rejected.push({ file, reason: 'validation', message: error }); continue; }
        } catch (error) { rejected.push({ file, reason: 'validation', message: error instanceof Error ? error.message : '文件校验失败' }); continue; }
        accepted.push(file);
      }
      if (!alive.current || epoch.current !== admissionEpoch || latest.current.disabled) return;
      const current = [...latest.current.list];
      const limit = latest.current.maxCount === undefined ? Infinity : Math.max(0, Math.floor(Number.isFinite(latest.current.maxCount) ? latest.current.maxCount : 0));
      const capacity = Math.max(0, limit === 1 ? 1 : limit - current.length);
      const selected = accepted.slice(0, Math.min(capacity, latest.current.multiple ? Infinity : 1));
      accepted.slice(selected.length).forEach(file => rejected.push({ file, reason: 'count', message: '超出可选择的文件数量' }));
      const files: UploadFile<T>[] = selected.map(file => ({ uid: `pi-upload-${Date.now()}-${++sequence}`, name: file.name, size: file.size, type: file.type, originFileObj: file, status: 'idle' }));
      if (files.length) {
        if (limit === 1 && current.length) commit({ type: 'replace', fileList: files, files, removedFiles: current });
        else commit({ type: 'add', fileList: [...current, ...files], files });
      }
      setRejections(rejected);
      if (rejected.length) latest.current.onReject?.(rejected);
    });
  }
  async function remove(uid: string) {
    const file = latest.current.list.find(item => item.uid === uid);
    if (!file || latest.current.disabled || removingRef.current.has(uid)) return;
    removingRef.current.add(uid); setRemoving(new Set(removingRef.current));
    const removalEpoch = epoch.current;
    try {
      if (await latest.current.onRemove?.(file) === false) return;
      if (!alive.current || epoch.current !== removalEpoch || latest.current.disabled) return;
      const current = [...latest.current.list]; const removed = current.find(item => item.uid === uid);
      if (removed && removed.originFileObj === file.originFileObj && removed.url === file.url) commit({ type: 'remove', fileList: current.filter(item => item.uid !== uid), files: [removed] });
    } catch { /* A rejected removal keeps the item; business owns its error message. */ }
    finally { removingRef.current.delete(uid); if (alive.current) setRemoving(new Set(removingRef.current)); }
  }
  const control = {
    id: triggerId, 'data-upload-trigger': '', disabled, 'aria-disabled': disabled || undefined,
    'aria-invalid': invalid ?? (status === 'error' ? true : undefined), 'aria-labelledby': labelledby, 'aria-describedby': describedby, 'aria-label': ariaLabel,
  };
  let trigger: ReactElement;
  if (isValidElement(children) && (typeof children.type !== 'string' || ['button', 'a'].includes(children.type))) {
    const child = children as ReactElement<any>;
    trigger = cloneElement(child, { ...control, disabled: disabled || child.props.disabled,
      ...(child.type === 'a' && disabled ? { tabIndex: -1, href: undefined } : {}),
      onClick: (event: MouseEvent) => { if (disabled || child.props.disabled) { event.preventDefault(); return; } child.props.onClick?.(event); if (!event.defaultPrevented) { event.preventDefault(); open(); } },
    });
  } else {
    trigger = <Button {...control} htmlType="button" onClick={open}>{children ?? (drag ? '点击或拖入文件' : '选择文件')}</Button>;
  }
  return <div {...rest} ref={root} onClick={onClick} onKeyDown={onKeyDown} className={['pi-upload', `pi-upload--${listType}`, status && `pi-upload--${status}`, disabled && 'pi-upload--disabled', className].filter(Boolean).join(' ')} style={{ ...themeVariables(theme), ...style }}>
    <input ref={input} type="file" accept={accept} multiple={multiple} disabled={disabled} tabIndex={-1} aria-hidden="true" className="pi-upload__input" onChange={event => { const batch = Array.from(event.currentTarget.files ?? []); event.currentTarget.value = ''; admit(batch); }} />
    <div className={drag ? `pi-upload__dropzone${over ? ' pi-upload__dropzone--over' : ''}` : 'pi-upload__trigger'}
      onDragOver={drag ? event => { if (!disabled && Array.from(event.dataTransfer.types).includes('Files')) { event.preventDefault(); event.dataTransfer.dropEffect = 'copy'; setOver(true); } } : undefined}
      onDragLeave={drag ? event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOver(false); } : undefined}
      onDrop={drag ? event => { event.preventDefault(); setOver(false); if (!disabled) admit(Array.from(event.dataTransfer.files)); } : undefined}>
      {trigger}
      {drag && !children && <p>支持点击选择或拖拽文件</p>}
    </div>
    {showUploadList && list.length > 0 && <ul className="pi-upload__list" aria-label="文件列表">{list.map(file => <FileRow key={file.uid} file={file} picture={listType !== 'text'} card={listType === 'picture-card'} disabled={disabled} pending={removing.has(file.uid)} remove={() => void remove(file.uid)}
      customPreview={!!onPreview} preview={onPreview ? () => onPreview(file) : image(file) ? url => { if (url) setPreview({ uid: file.uid, name: file.name, url, origin: file.originFileObj, remote: file.url }); } : undefined}
      onCancel={onCancel ? () => onCancel(file) : undefined} onRetry={onRetry ? () => onRetry(file) : undefined} />)}</ul>}
    {rejections.length > 0 && <div className="pi-upload__rejections" role="alert">{rejections.map((item, index) => <div key={index}>{item.file.name}：{item.message}</div>)}</div>}
    <Modal open={!!preview} title={preview?.name} footer={null} onCancel={() => setPreview(undefined)} destroyOnHidden><img className="pi-upload__preview" src={preview?.url} alt={preview?.name ?? ''} /></Modal>
  </div>;
}
const binding = { valueProp: 'fileList', getValue: (info: { fileList: UploadFile[] }) => info.fileList, toControlValue: (value: unknown) => value ?? [], defaultProps: ['defaultFileList'] };
const Base = defineFieldBinding(forwardRef(UploadControl), binding) as <T = unknown>(props: UploadProps<T> & { ref?: Ref<UploadRef> }) => ReactElement;
// forwardRef must reach the internal control rather than the JSX-only generic signature.
const Drag = defineFieldBinding(forwardRef((props: UploadProps, ref: Ref<UploadRef>) => UploadControl({ ...props, drag: true }, ref)), binding) as typeof Base;
export const Upload = Object.assign(Base, { Dragger: Drag });
