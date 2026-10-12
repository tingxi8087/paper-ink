import { motionDuration } from '../internal/motion.js';
import { CloseIcon, StatusIcon } from '../internal/icons.js';
import { useEffect, useMemo, useRef, useSyncExternalStore, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { useTheme } from '../config-provider/index.js';
import { themeVariables } from '../theme/variables.js';
import type { NotificationArgs, NotificationConfig, NotificationInstance, NotificationPlacement, NotificationType } from './types.js';

type Notice = NotificationArgs & { key: string | number; closing?: boolean; exitTimer?: ReturnType<typeof setTimeout>; timer?: ReturnType<typeof setTimeout> };
let nextKey = 0;
function createStore(config: NotificationConfig = {}) {
  let notices: Notice[] = [];
  let active = true;
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach(listener => listener());
  const finish = (notice: Notice) => { clearTimeout(notice.timer); clearTimeout(notice.exitTimer); notice.onClose?.(); };
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
  const open = (args: NotificationArgs): void => {
    if (!active) return;
    const key = args.key ?? `pi-notification-${++nextKey}`;
    const existing = notices.find(notice => notice.key === key);
    if (existing) { clearTimeout(existing.timer); clearTimeout(existing.exitTimer); }
    const notice: Notice = { ...args, key };
    const duration = args.duration ?? config.duration ?? 4.5;
    if (duration > 0) notice.timer = setTimeout(() => destroy(key), duration * 1000);
    notices = existing ? notices.map(item => item.key === key ? notice : item) : [...notices, notice];
    const limit = config.maxCount === undefined ? Infinity : Math.max(1, config.maxCount);
    const removed = notices.length > limit ? notices.splice(0, notices.length - limit) : [];
    notify(); removed.forEach(finish);
  };
  const api: NotificationInstance = { open, destroy,
    ...Object.fromEntries((['success', 'error', 'info', 'warning'] as NotificationType[]).map(type => [type, (args: NotificationArgs) => open({ ...args, type })])) as Pick<NotificationInstance, NotificationType>,
  };
  return { api, config, activate: () => { active = true; }, dispose: () => { active = false; const removed = notices; notices = []; notify(); removed.forEach(finish); }, subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; }, snapshot: () => notices };
}
type Store = ReturnType<typeof createStore>;
const empty: Notice[] = [];
function NotificationHolder({ store }: { store: Store }) {
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
  return createPortal(<>{(['topLeft', 'topRight', 'bottomLeft', 'bottomRight'] as NotificationPlacement[]).map(placement => <div key={placement} className={`pi-notification-holder pi-notification-holder--${placement}`} style={{ ...themeVariables(theme), [placement.startsWith('top') ? 'top' : 'bottom']: (placement.startsWith('top') ? store.config.top : store.config.bottom) ?? 16 }}>{notices.filter(notice => (notice.placement ?? store.config.placement ?? 'topRight') === placement).map(notice =>
    <div key={notice.key} className={`pi-notification ${notice.className ?? ''}`} data-motion={notice.closing ? 'leave' : 'enter'} aria-hidden={notice.closing || undefined} role={notice.role ?? (notice.type === 'error' || notice.type === 'warning' ? 'alert' : 'status')} style={notice.style} onClick={notice.closing ? undefined : notice.onClick}>
      {notice.type || notice.icon ? <span className={`pi-notification-icon pi-notification-icon--${notice.type ?? 'info'}`} aria-hidden="true">{notice.icon ?? <StatusIcon type={notice.type ?? 'info'} circle width={22} height={22} />}</span> : null}
      <div className="pi-notification-content"><div className="pi-notification-title">{notice.title ?? notice.message}</div>{notice.description != null && <div className="pi-notification-description">{notice.description}</div>}{notice.btn != null && <div className="pi-notification-actions">{notice.btn}</div>}</div>
      {notice.closeIcon !== null && <button type="button" className="pi-notification-close" aria-label="关闭通知" disabled={notice.closing} tabIndex={notice.closing ? -1 : undefined} onClick={event => { event.stopPropagation(); store.api.destroy(notice.key); }}>{notice.closeIcon ?? <CloseIcon />}</button>}
    </div>)}</div>)}</>, container);
}
export function useNotification(config: NotificationConfig = {}): [NotificationInstance, ReactNode] {
  const store = useMemo(() => createStore({ ...config }), []);
  return [store.api, <NotificationHolder key="paper-ink-notification-holder" store={store} />];
}
const globalConfig: NotificationConfig = {};
let globalStore: Store | undefined;
function staticStore() {
  if (!globalStore) {
    globalStore = createStore(globalConfig);
    const node = document.createElement('div');
    node.className = 'pi-notification-mount'; document.body.append(node);
    createRoot(node).render(<NotificationHolder store={globalStore} />);
  }
  return globalStore;
}
export const notification: NotificationInstance & { config: (config: NotificationConfig) => void; useNotification: typeof useNotification } = {
  open: args => typeof document === 'undefined' ? undefined : staticStore().api.open(args),
  destroy: key => globalStore?.api.destroy(key),
  ...Object.fromEntries((['success', 'error', 'info', 'warning'] as NotificationType[]).map(type => [type, (...args: Parameters<NotificationInstance['success']>) => typeof document === 'undefined' ? undefined : staticStore().api[type](...args)])) as Pick<NotificationInstance, NotificationType>,
  config: config => { Object.assign(globalConfig, config); },
  useNotification,
};
