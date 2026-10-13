import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import type { UploadChangeInfo, UploadFile } from '../upload/types.js';

export type UploadRequestOptions = {
  file: File;
  signal: AbortSignal;
  onProgress: (percent: number) => void;
};
export type UploadResult<T = unknown> = { url?: string; response?: T };
export type UseUploadOptions<T = unknown> = {
  request: (options: UploadRequestOptions) => Promise<UploadResult<T>>;
  defaultFileList?: readonly UploadFile<T>[];
  autoUpload?: boolean;
  concurrency?: number;
};
export type UseUploadReturn<T = unknown> = {
  fileList: UploadFile<T>[];
  props: {
    fileList: UploadFile<T>[];
    onChange: (info: UploadChangeInfo<T>) => void;
    onCancel: (file: UploadFile<T>) => void;
    onRetry: (file: UploadFile<T>) => void;
  };
  upload: (uids?: string[]) => Promise<void>;
  cancel: (uid?: string) => void;
  setFileList: Dispatch<SetStateAction<UploadFile<T>[]>>;
};
type Task = {
  uid: string;
  file: File;
  controller: AbortController;
  started: boolean;
  promise: Promise<void>;
  finish: () => void;
};

/** Request ownership stays here; Upload only emits file-list operations. */
export function useUpload<T = unknown>(options: UseUploadOptions<T>): UseUploadReturn<T> {
  if (options.concurrency !== undefined && (!Number.isInteger(options.concurrency) || options.concurrency < 1)) {
    throw new RangeError('useUpload concurrency must be a positive integer');
  }
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const [fileList, setState] = useState<UploadFile<T>[]>(() => [...(options.defaultFileList ?? [])]);
  const files = useRef(fileList);
  const alive = useRef(true);
  const tasks = useRef(new Map<string, Task>());
  const interrupted = useRef<string[]>([]);
  const api = useRef<Omit<UseUploadReturn<T>, 'fileList' | 'props'> & {
    onChange: (info: UploadChangeInfo<T>) => void;
    pump: () => void;
  } | null>(null);
  if (!api.current) {
    const publish = (next: UploadFile<T>[]) => {
      files.current = next;
      if (alive.current) setState(next);
    };
    const current = (task: Task) => alive.current && tasks.current.get(task.uid) === task;
    const patch = (task: Task, changes: Partial<UploadFile<T>>) => {
      if (current(task)) publish(files.current.map(file => file.uid === task.uid ? { ...file, ...changes } : file));
    };
    const discard = (task: Task) => {
      tasks.current.delete(task.uid);
      task.controller.abort();
      task.finish();
    };
    const pump = () => {
      if (!alive.current) return;
      const limit = optionsRef.current.concurrency ?? 3;
      let running = [...tasks.current.values()].filter(task => task.started).length;
      for (const task of tasks.current.values()) {
        if (running >= limit) break;
        if (task.started) continue;
        task.started = true;
        running++;
        patch(task, { status: 'uploading', percent: undefined, error: undefined });
        // A microtask catches synchronous request throws as ordinary failures.
        void Promise.resolve().then(() => {
          if (!current(task)) return;
          return optionsRef.current.request({
            file: task.file,
            signal: task.controller.signal,
            onProgress: percent => {
              if (Number.isFinite(percent)) patch(task, { percent: Math.min(100, Math.max(0, percent)) });
            },
          });
        }).then(result => {
          if (current(task)) patch(task, { ...result, status: 'done', percent: 100, error: undefined });
        }, error => {
          if (current(task)) patch(task, { status: 'error', error: error instanceof Error ? error : new Error(String(error)), percent: undefined });
        }).finally(() => {
          if (tasks.current.get(task.uid) === task) {
            tasks.current.delete(task.uid);
            task.finish();
            pump();
          }
        });
      }
    };
    const setFileList: Dispatch<SetStateAction<UploadFile<T>[]>> = update => {
      if (!alive.current) return;
      const next = typeof update === 'function' ? update(files.current) : update;
      for (const task of [...tasks.current.values()]) {
        const replacement = next.find(file => file.uid === task.uid);
        if (!replacement || replacement.originFileObj !== task.file ||
          (task.started ? replacement.status !== 'uploading' : replacement.status !== 'idle')) discard(task);
      }
      publish([...next]);
      pump();
    };
    const upload = (uids?: string[]): Promise<void> => {
      if (!alive.current) return Promise.resolve();
      const requested = uids && new Set(uids);
      const waiting: Promise<void>[] = [];
      for (const file of files.current) {
        if (requested ? !requested.has(file.uid) : file.status !== 'idle') continue;
        const existing = tasks.current.get(file.uid);
        if (existing) { waiting.push(existing.promise); continue; }
        if (!file.originFileObj || file.status === 'done' || file.status === 'uploading') continue;
        let finish!: () => void;
        const promise = new Promise<void>(resolve => { finish = resolve; });
        tasks.current.set(file.uid, { uid: file.uid, file: file.originFileObj, controller: new AbortController(), started: false, promise, finish });
        waiting.push(promise);
      }
      // Retry candidates become idle while waiting for a free slot.
      publish(files.current.map(file => tasks.current.has(file.uid) && !tasks.current.get(file.uid)!.started
        ? { ...file, status: 'idle', error: undefined, percent: undefined } : file));
      pump();
      return Promise.all(waiting).then(() => undefined);
    };
    const cancel = (uid?: string) => {
      if (!alive.current) return;
      const cancelled = new Set<string>();
      for (const task of [...tasks.current.values()]) if (uid === undefined || task.uid === uid) {
        cancelled.add(task.uid);
        discard(task);
      }
      if (cancelled.size) publish(files.current.map(file => cancelled.has(file.uid)
        ? { ...file, status: 'cancelled', percent: undefined, error: undefined } : file));
      pump();
    };
    api.current = { setFileList, upload, cancel, pump, onChange: info => {
      // Apply user-operation deltas to the current owner list. Async validation
      // can produce an older full-list snapshot; it must neither resurrect a
      // removed item nor discard additions that have not rendered yet.
      const remove = new Set(info.type === 'replace' ? info.removedFiles.map(file => file.uid)
        : info.type === 'remove' ? info.files.map(file => file.uid) : []);
      const retained = files.current.filter(file => !remove.has(file.uid));
      const existing = new Set(retained.map(file => file.uid));
      const additions = info.type === 'remove' ? [] : info.files.filter(file => {
        if (existing.has(file.uid)) return false;
        existing.add(file.uid);
        return true;
      });
      setFileList([...retained, ...additions]);
      if (optionsRef.current.autoUpload !== false && info.type !== 'remove') void upload(info.files.map(file => file.uid));
    } };
  }
  useEffect(() => {
    alive.current = true;
    // React StrictMode replays mount effects. Resume only tasks interrupted by
    // that cleanup; a genuine unmount never gets this setup again.
    if (interrupted.current.length) {
      const resume = interrupted.current;
      interrupted.current = [];
      api.current!.setFileList(files.current);
      void api.current!.upload(resume);
    }
    api.current!.pump();
    return () => {
      alive.current = false;
      interrupted.current = [...tasks.current.keys()];
      files.current = files.current.map(file => tasks.current.has(file.uid)
        ? { ...file, status: 'cancelled', error: undefined, percent: undefined } : file);
      for (const task of tasks.current.values()) { task.controller.abort(); task.finish(); }
      tasks.current.clear();
    };
  }, []);
  useEffect(() => { api.current!.pump(); }, [options.concurrency]);
  const engine = api.current;
  return {
    fileList,
    props: { fileList, onChange: engine.onChange, onCancel: file => engine.cancel(file.uid), onRetry: file => { void engine.upload([file.uid]); } },
    upload: engine.upload, cancel: engine.cancel, setFileList: engine.setFileList,
  };
}
