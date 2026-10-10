import { motionDuration } from '../internal/motion.js';
import { StatusIcon } from '../internal/icons.js';
import { useEffect, useMemo, useRef, useSyncExternalStore, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { useTheme } from '../config-provider/index.js';
import { themeVariables } from '../theme/variables.js';
import type { MessageArgs, MessageConfig, MessageHandle, MessageInstance, MessageType } from './types.js';

type Notice = MessageArgs & { key: string | number; resolvers: Array<() => void>; closing?: boolean; exitTimer?: ReturnType<typeof setTimeout>; timer?: ReturnType<typeof setTimeout> };
let nextKey = 0;
function createStore(config: MessageConfig = {}) {
  let notices: Notice[] = [];
  let active = true;
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach(listener => listener());
  const finish = (notice: Notice) => { clearTimeout(notice.timer); clearTimeout(notice.exitTimer); notice.resolvers.forEach(resolve => resolve()); notice.onClose?.(); };
  const remove = (notice: Notice) => {
    if (!notices.includes(notice)) return;
    notices = notices.filter(item => item !== notice); notify(); finish(notice);
  };
  const destroy = (key?: string | number) => {
    const delay = motionDuration(180);
    notices.filter(notice => (key === undefined || notice.key === key) && !notice.closing).forEach(notice => {
      clearTimeout(notice.timer);
      if (!delay) { remove(notice); return; }
      notice.closing = true;
      notice.exitTimer = setTimeout(() => remove(notice), delay);
    });
    notices = [...notices]; notify();
  };
  const open = (args: MessageArgs): MessageHandle => {
    if (!active) return serverHandle();
    const key = args.key ?? `pi-message-${++nextKey}`;
    let resolve!: () => void;
    const promise = new Promise<boolean>(done => { resolve = () => done(true); });
    const existing = notices.find(notice => notice.key === key);
    if (existing) { clearTimeout(existing.timer); clearTimeout(existing.exitTimer); }
    const notice: Notice = { ...args, key, resolvers: [...(existing?.resolvers ?? []), resolve] };
    const duration = args.duration ?? config.duration ?? 3;
    if (duration > 0) notice.timer = setTimeout(() => destroy(key), duration * 1000);
    notices = existing ? notices.map(item => item.key === key ? notice : item) : [...notices, notice];
    const limit = config.maxCount === undefined ? Infinity : Math.max(1, config.maxCount);
    const removed = notices.length > limit ? notices.splice(0, notices.length - limit) : [];
    notify(); removed.forEach(finish);
    const handle = (() => destroy(key)) as MessageHandle;
    handle.then = promise.then.bind(promise);
    return handle;
  };
  const api: MessageInstance = { open, destroy,
    ...Object.fromEntries((['success', 'error', 'info', 'warning', 'loading'] as MessageType[]).map(type => [type, (content: ReactNode | MessageArgs, duration?: number | (() => void), onClose?: () => void) => {
      const args = content && typeof content === 'object' && 'content' in content ? content as MessageArgs : { content: content as ReactNode, duration: typeof duration === 'number' ? duration : undefined, onClose: typeof duration === 'function' ? duration : onClose };
      return open({ ...args, type });
    }])) as Pick<MessageInstance, MessageType>,
  };
  return { api, config, activate: () => { active = true; }, dispose: () => { active = false; const removed = notices; notices = []; notify(); removed.forEach(finish); }, subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; }, snapshot: () => notices };
}
type Store = ReturnType<typeof createStore>;
const empty: Notice[] = [];
function MessageHolder({ store }: { store: Store }) {
  const theme = useTheme();
  const notices = useSyncExternalStore(store.subscribe, store.snapshot, () => empty);
  const lifecycle = useRef(0);
  useEffect(() => {
    const generation = ++lifecycle.current; store.activate();
    // StrictMode replays child effects before holder setup; defer final disposal.
    return () => { void Promise.resolve().then(() => { if (lifecycle.current === generation) store.dispose(); }); };
  }, [store]);
  if (typeof document === 'undefined') return null;
  const container = store.config.getContainer?.() ?? document.body;
  return createPortal(<div className="pi-message-holder" style={{ ...themeVariables(theme), top: store.config.top ?? 8 }}>{notices.map(notice =>
    <div key={notice.key} className="pi-message-shell" data-motion={notice.closing ? 'leave' : 'enter'} aria-hidden={notice.closing || undefined}><div className="pi-message-clip"><div role={notice.type === 'error' || notice.type === 'warning' ? 'alert' : 'status'} className={`pi-message pi-message--${notice.type ?? 'info'} ${notice.className ?? ''}`} style={notice.style}>
      <span className={`pi-message-icon ${notice.type === 'loading' ? 'pi-message-icon--loading' : ''}`} aria-hidden="true">{notice.icon ?? (notice.type === 'loading' ? null : <StatusIcon type={notice.type ?? 'info'} />)}</span>
      <span>{notice.content}</span>
    </div></div></div>)}</div>, container);
}
export function useMessage(config: MessageConfig = {}): [MessageInstance, ReactNode] {
  const store = useMemo(() => createStore({ ...config }), []);
  return [store.api, <MessageHolder key="paper-ink-message-holder" store={store} />];
}
const globalConfig: MessageConfig = {};
let globalStore: Store | undefined;
function staticStore() {
  if (!globalStore) {
    globalStore = createStore(globalConfig);
    const node = document.createElement('div');
    node.className = 'pi-message-mount'; document.body.append(node);
    createRoot(node).render(<MessageHolder store={globalStore} />);
  }
  return globalStore;
}
function serverHandle(): MessageHandle { const handle = (() => {}) as MessageHandle; const promise = Promise.resolve(true); handle.then = promise.then.bind(promise); return handle; }
export const message: MessageInstance & { config: (config: MessageConfig) => void; useMessage: typeof useMessage } = {
  open: args => typeof document === 'undefined' ? serverHandle() : staticStore().api.open(args),
  destroy: key => globalStore?.api.destroy(key),
  ...Object.fromEntries((['success', 'error', 'info', 'warning', 'loading'] as MessageType[]).map(type => [type, (...args: Parameters<MessageInstance['success']>) => typeof document === 'undefined' ? serverHandle() : staticStore().api[type](...args)])) as Pick<MessageInstance, MessageType>,
  config: config => { Object.assign(globalConfig, config); },
  useMessage,
};
