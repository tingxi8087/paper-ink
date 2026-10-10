import { createContext, useContext, useEffect, useMemo, useRef, useState, type HTMLAttributes, type ReactNode, type ElementType } from 'react';
import { Button } from '../button/button.js';
import { Modal } from '../modal/modal.js';
import type { ModalProps } from '../modal/types.js';
import { useMessage } from '../message/message.js';
import type { MessageConfig, MessageInstance } from '../message/types.js';
import { useTheme } from '../config-provider/index.js';
import { themeVariables } from '../theme/variables.js';
import { StatusIcon } from '../internal/icons.js';
export interface ModalConfirmConfig extends Omit<ModalProps, 'children' | 'content' | 'open' | 'onOk' | 'onCancel' | 'afterClose'> {
  content?: ReactNode; icon?: ReactNode; afterClose?: () => void;
  onOk?: () => void | Promise<unknown>; onCancel?: () => void | Promise<unknown>;
}
export interface ModalConfirmHandle extends PromiseLike<boolean> { destroy: () => void; update: (config: Partial<ModalConfirmConfig> | ((previous: ModalConfirmConfig) => Partial<ModalConfirmConfig>)) => void }
export interface AppModalInstance {
  confirm: (config: ModalConfirmConfig) => ModalConfirmHandle;
  info: (config: ModalConfirmConfig) => ModalConfirmHandle;
  success: (config: ModalConfirmConfig) => ModalConfirmHandle;
  error: (config: ModalConfirmConfig) => ModalConfirmHandle;
  warning: (config: ModalConfirmConfig) => ModalConfirmHandle;
  destroyAll: () => void;
}
export interface AppInstance { message: MessageInstance; modal: AppModalInstance }
export interface AppProps extends HTMLAttributes<HTMLDivElement> { component?: ElementType | false; message?: MessageConfig }
interface Entry { closing?: boolean; key: number; config: ModalConfirmConfig; type: 'confirm' | 'info' | 'success' | 'error' | 'warning'; finish: (confirmed: boolean) => void }
const Context = createContext<AppInstance | null>(null);
function ConfirmDialog({ entry, close, complete }: { entry: Entry; close: (key: number, confirmed: boolean) => void; complete: (key: number) => void }) {
  const [pending, setPending] = useState(false); const [error, setError] = useState(false); const alive = useRef(true); const busy = useRef(false);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const { content, icon, onOk, onCancel, afterClose, ...props } = entry.config;
  async function act(confirmed: boolean) {
    if (busy.current || entry.closing !== undefined) return;
    busy.current = true; setPending(true); setError(false);
    try { await (confirmed ? onOk?.() : onCancel?.()); if (alive.current) close(entry.key, confirmed); }
    catch { if (alive.current) setError(true); }
    finally { busy.current = false; if (alive.current) setPending(false); }
  }
  const status = entry.type === 'confirm' ? 'warning' : entry.type;
  return <Modal {...props} open={entry.closing === undefined} afterClose={() => complete(entry.key)} centered={props.centered ?? true} closable={props.closable ?? false} maskClosable={props.maskClosable ?? false}
    onOk={() => { void act(true); }} onCancel={() => { void act(false); }} confirmLoading={pending}
    cancelButtonProps={{ ...props.cancelButtonProps, disabled: pending || props.cancelButtonProps?.disabled }}
    footer={props.footer === undefined ? (entry.type !== 'confirm' ? <Button type="primary" {...props.okButtonProps} loading={pending} onClick={event => { props.okButtonProps?.onClick?.(event); if (!event.defaultPrevented) void act(true); }}>{props.okText ?? '知道了'}</Button> : undefined) : props.footer}>
    <div className="pi-app-confirm-content">{icon !== null && <span className={`pi-app-confirm-icon pi-app-confirm-icon--${status}`} aria-hidden="true">{icon ?? <StatusIcon type={status} circle width={20} height={20} />}</span>}<div>{content}{error && <p role="alert" className="pi-app-confirm-error">操作未完成，请重试。</p>}</div></div>
  </Modal>;
}
function AppRoot({ children, component = 'div', message: config, className, style, ...rest }: AppProps) {
  const theme = useTheme(); const [api, holder] = useMessage(config); const [entries, setEntries] = useState<Entry[]>([]);
  const afterCloseQueue = useRef<Entry[]>([]);
  const entriesRef = useRef<Entry[]>([]); const sequence = useRef(0); const mounted = useRef(true); const lifecycle = useRef(0);
  function close(key: number, confirmed: boolean) {
    const entry = entriesRef.current.find(item => item.key === key); if (!entry || entry.closing !== undefined) return;
    entriesRef.current = entriesRef.current.map(item => item.key === key ? { ...item, closing: confirmed } : item); setEntries(entriesRef.current);
  }
  function complete(key: number) {
    const entry = entriesRef.current.find(item => item.key === key); if (!entry) return;
    entriesRef.current = entriesRef.current.filter(item => item.key !== key); setEntries(entriesRef.current);
    entry.finish(entry.closing ?? false); afterCloseQueue.current.push(entry);
  }
  const modal = useMemo<AppModalInstance>(() => {
    const open = (type: Entry['type'], config: ModalConfirmConfig) => {
      let finish!: (confirmed: boolean) => void;
      const promise = new Promise<boolean>(resolve => { finish = resolve; }); const key = ++sequence.current;
      if (!mounted.current) finish(false);
      else { entriesRef.current = [...entriesRef.current, { key, type, config, finish }]; setEntries(entriesRef.current); }
      return { destroy: () => close(key, false), update: (update: Partial<ModalConfirmConfig> | ((previous: ModalConfirmConfig) => Partial<ModalConfirmConfig>)) => {
        entriesRef.current = entriesRef.current.map(entry => entry.key === key ? { ...entry, config: { ...entry.config, ...(typeof update === 'function' ? update(entry.config) : update) } } : entry); if (mounted.current) setEntries(entriesRef.current);
      }, then: promise.then.bind(promise) };
    };
    return { confirm: config => open('confirm', config), info: config => open('info', config), success: config => open('success', config), error: config => open('error', config), warning: config => open('warning', config), destroyAll: () => { for (const entry of [...entriesRef.current]) close(entry.key, false); } };
  }, []);
  useEffect(() => {
    const closed = afterCloseQueue.current; afterCloseQueue.current = [];
    for (const entry of closed) entry.config.afterClose?.();
  }, [entries]);
  useEffect(() => {
    mounted.current = true; const generation = ++lifecycle.current;
    return () => { queueMicrotask(() => {
      if (lifecycle.current !== generation) return;
      mounted.current = false; const pending = entriesRef.current; entriesRef.current = [];
      for (const entry of pending) entry.finish(false);
    }); };
  }, []);
  const instance = useMemo(() => ({ message: api, modal }), [api, modal]);
  const content = <>{children}{holder}{entries.map(entry => <ConfirmDialog key={entry.key} entry={entry} close={close} complete={complete} />)}</>;
  const Wrapper = component;
  return <Context.Provider value={instance}>{Wrapper === false ? content : <Wrapper {...rest} className={['pi-app', className].filter(Boolean).join(' ')} style={{ ...themeVariables(theme), ...style }}>{content}</Wrapper>}</Context.Provider>;
}
function useApp(): AppInstance { const instance = useContext(Context); if (!instance) throw new Error('App.useApp() must be used inside <App>.'); return instance; }
export const App = Object.assign(AppRoot, { useApp });
