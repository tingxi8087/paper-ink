import { StrictMode, useEffect } from 'react';
import { createServer } from 'node:http';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useUpload, type UploadRequestOptions, type UploadResult } from './useUpload.js';
import type { UploadFile } from '../upload/types.js';

const file = (uid: string): UploadFile => ({ uid, name: `${uid}.txt`, status: 'idle', originFileObj: new File([uid], `${uid}.txt`) });
function deferred<T>() {
  let resolve!: (value: T) => void; let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { resolve, reject, promise };
}
const flush = async () => { await act(async () => { await Promise.resolve(); await Promise.resolve(); }); };
function controlledRequests() {
  const calls: { options: UploadRequestOptions; result: ReturnType<typeof deferred<UploadResult>> }[] = [];
  const request = vi.fn((options: UploadRequestOptions) => {
    const result = deferred<UploadResult>(); calls.push({ options, result }); return result.promise;
  });
  return { request, calls };
}

describe('useUpload', () => {
  it('automatically uploads only newly added files and exposes regular Upload props', async () => {
    const { request, calls } = controlledRequests();
    const h = renderHook(() => useUpload({ request, defaultFileList: [{ uid: 'remote', name: 'remote', status: 'done', url: '/old' }] }));
    expect(request).not.toHaveBeenCalled();
    const added = file('new');
    act(() => h.result.current.props.onChange({ type: 'add', fileList: [...h.result.current.fileList, added], files: [added] }));
    await flush(); expect(calls).toHaveLength(1); expect(calls[0].options.file).toBe(added.originFileObj);
    expect(h.result.current.fileList[1]).toMatchObject({ status: 'uploading', percent: undefined });
    act(() => calls[0].options.onProgress(41)); expect(h.result.current.fileList[1].percent).toBe(41);
    await act(async () => calls[0].result.resolve({ url: '/new', response: { id: 3 } }));
    expect(h.result.current.fileList[1]).toMatchObject({ status: 'done', percent: 100, url: '/new', response: { id: 3 } });
  });
  it('limits concurrency, queues in list order, and resolves upload after every selected task', async () => {
    const { request, calls } = controlledRequests();
    const h = renderHook(() => useUpload({ request, concurrency: 2, defaultFileList: [file('a'), file('b'), file('c')] }));
    let completed = false;
    act(() => { void h.result.current.upload().then(() => { completed = true; }); });
    await flush(); expect(calls).toHaveLength(2); expect(h.result.current.fileList[2].status).toBe('idle'); expect(completed).toBe(false);
    await act(async () => calls[0].result.resolve({})); await flush();
    expect(calls).toHaveLength(3); expect(calls[2].options.file.name).toBe('c.txt');
    await act(async () => { calls[1].result.reject(new Error('bad')); calls[2].result.resolve({}); }); await flush();
    expect(completed).toBe(true); expect(h.result.current.fileList.map(f => f.status)).toEqual(['done', 'error', 'done']);
  });
  it('manual mode does not upload on change or setFileList, and no-argument upload does not retry failures', async () => {
    const request = vi.fn(async () => { throw 'failure'; });
    const h = renderHook(() => useUpload({ request, autoUpload: false }));
    const a = file('a'); act(() => h.result.current.props.onChange({ type: 'add', files: [a], fileList: [a] }));
    await flush(); expect(request).not.toHaveBeenCalled();
    await act(async () => h.result.current.upload()); expect(request).toHaveBeenCalledTimes(1);
    expect(h.result.current.fileList[0].error).toBeInstanceOf(Error);
    await act(async () => h.result.current.upload()); expect(request).toHaveBeenCalledTimes(1);
    await act(async () => h.result.current.upload(['a'])); expect(request).toHaveBeenCalledTimes(2);
    act(() => h.result.current.setFileList([file('b')])); await flush(); expect(request).toHaveBeenCalledTimes(2);
  });
  it('cancels waiting and active tasks, aborts signals, and settles despite non-cooperative requests', async () => {
    const { request, calls } = controlledRequests();
    const h = renderHook(() => useUpload({ request, concurrency: 1, defaultFileList: [file('a'), file('b')] }));
    let completed = false; act(() => { void h.result.current.upload().then(() => { completed = true; }); }); await flush();
    act(() => h.result.current.cancel('b')); expect(h.result.current.fileList[1].status).toBe('cancelled');
    act(() => h.result.current.cancel('a')); await flush();
    expect(calls[0].options.signal.aborted).toBe(true); expect(completed).toBe(true); expect(calls).toHaveLength(1);
    act(() => calls[0].options.onProgress(70));
    await act(async () => calls[0].result.resolve({ url: '/late' }));
    expect(h.result.current.fileList[0]).toMatchObject({ status: 'cancelled', percent: undefined });
  });
  it('a cancelled uid can retry immediately; old success, failure and progress cannot overwrite it', async () => {
    const { request, calls } = controlledRequests();
    const h = renderHook(() => useUpload({ request, defaultFileList: [file('a')] }));
    act(() => { void h.result.current.upload(); }); await flush();
    act(() => { h.result.current.cancel('a'); h.result.current.props.onRetry(h.result.current.fileList[0]); }); await flush();
    expect(calls).toHaveLength(2);
    act(() => { calls[1].options.onProgress(20); calls[0].options.onProgress(99); });
    await act(async () => calls[0].result.reject(new Error('stale')));
    expect(h.result.current.fileList[0]).toMatchObject({ status: 'uploading', percent: 20, error: undefined });
    await act(async () => calls[1].result.resolve({ url: '/retry' }));
    expect(h.result.current.fileList[0]).toMatchObject({ status: 'done', url: '/retry' });
  });
  it('removing or replacing files aborts old tasks and never reinserts late responses', async () => {
    const { request, calls } = controlledRequests();
    const h = renderHook(() => useUpload({ request })); const a = file('a'); const b = file('b');
    act(() => h.result.current.props.onChange({ type: 'add', fileList: [a], files: [a] })); await flush();
    act(() => h.result.current.props.onChange({ type: 'replace', fileList: [b], files: [b], removedFiles: [a] })); await flush();
    expect(calls[0].options.signal.aborted).toBe(true);
    act(() => h.result.current.props.onChange({ type: 'remove', fileList: [], files: [b] }));
    expect(calls[1].options.signal.aborted).toBe(true);
    await act(async () => { calls[0].result.resolve({}); calls[1].result.resolve({}); });
    expect(h.result.current.fileList).toEqual([]);
  });
  it('retains current progress when an async component operation sends an old list snapshot', async () => {
    const { request, calls } = controlledRequests(); const a = file('a'); const b = file('b');
    const h = renderHook(() => useUpload({ request }));
    act(() => h.result.current.props.onChange({ type: 'add', fileList: [a], files: [a] })); await flush();
    act(() => calls[0].options.onProgress(50));
    act(() => h.result.current.props.onChange({ type: 'add', fileList: [a, b], files: [b] })); await flush();
    expect(calls[0].options.signal.aborted).toBe(false); expect(h.result.current.fileList[0]).toMatchObject({ status: 'uploading', percent: 50 });
    await act(async () => { calls[0].result.resolve({}); calls[1].result.resolve({}); });
  });
  it('applies operation deltas without resurrecting removed files or losing unrendered additions', async () => {
    const a = file('a'); const b = file('b'); const c = file('c'); const d = file('d');
    const h = renderHook(() => useUpload({ request: async () => ({}), autoUpload: false, defaultFileList: [a] }));
    act(() => {
      h.result.current.setFileList([]);
      h.result.current.props.onChange({ type: 'add', files: [b], fileList: [a, b] });
      h.result.current.props.onChange({ type: 'add', files: [c], fileList: [a, c] });
    });
    expect(h.result.current.fileList.map(f => f.uid)).toEqual(['b', 'c']);
    act(() => h.result.current.props.onChange({ type: 'remove', files: [b], fileList: [a] }));
    expect(h.result.current.fileList.map(f => f.uid)).toEqual(['c']);
    act(() => h.result.current.props.onChange({ type: 'replace', files: [d], removedFiles: [a], fileList: [d] }));
    expect(h.result.current.fileList.map(f => f.uid)).toEqual(['c', 'd']);
    await flush();
  });
  it('metadata updates retain requests, while original-file replacement and clear abort them', async () => {
    const { request, calls } = controlledRequests();
    const h = renderHook(() => useUpload({ request, defaultFileList: [file('a')] }));
    act(() => { void h.result.current.upload(); }); await flush();
    act(() => h.result.current.setFileList(list => list.map(f => ({ ...f, name: 'renamed' }))));
    expect(calls[0].options.signal.aborted).toBe(false);
    act(() => h.result.current.setFileList(list => list.map(f => ({ ...f, originFileObj: new File(['new'], 'new'), status: 'idle' }))));
    expect(calls[0].options.signal.aborted).toBe(true);
    act(() => { void h.result.current.upload(); }); await flush();
    act(() => h.result.current.setFileList([])); expect(calls[1].options.signal.aborted).toBe(true);
    await act(async () => { calls[0].result.resolve({}); calls[1].result.resolve({}); }); expect(h.result.current.fileList).toEqual([]);
  });
  it('ignores invalid progress, clamps real progress and catches synchronous request errors', async () => {
    const request = vi.fn((o: UploadRequestOptions): Promise<UploadResult> => {
      o.onProgress(NaN); o.onProgress(-4); o.onProgress(130); throw new Error('sync');
    });
    const h = renderHook(() => useUpload({ request, defaultFileList: [file('a')] }));
    await act(async () => h.result.current.upload()); expect(h.result.current.fileList[0]).toMatchObject({ status: 'error', error: new Error('sync'), percent: undefined });
  });
  it('never reuploads remote files or done files and joins an existing explicit task', async () => {
    const { request, calls } = controlledRequests();
    const h = renderHook(() => useUpload({ request, defaultFileList: [file('a'), { ...file('b'), status: 'done' }, { uid: 'c', name: 'remote', status: 'error' }] }));
    let joined = false; act(() => { void h.result.current.upload(['a', 'b', 'c']); void h.result.current.upload(['a']).then(() => { joined = true; }); }); await flush();
    expect(calls).toHaveLength(1); expect(joined).toBe(false);
    await act(async () => calls[0].result.resolve({})); await flush(); expect(joined).toBe(true);
  });
  it('aborts on unmount and settles upload without waiting for server', async () => {
    const { request, calls } = controlledRequests(); const h = renderHook(() => useUpload({ request, defaultFileList: [file('a')] }), { wrapper: StrictMode });
    let done = false; act(() => { void h.result.current.upload().then(() => { done = true; }); }); await flush();
    h.unmount(); await flush(); expect(calls[0].options.signal.aborted).toBe(true); expect(done).toBe(true);
    calls[0].options.onProgress(80); await act(async () => calls[0].result.resolve({}));
  });
  it('updates the concurrency ceiling and uses current request function for queued tasks', async () => {
    const { request, calls } = controlledRequests(); const nextRequest = vi.fn(async () => ({ url: '/next' }));
    const h = renderHook(({ limit, run }) => useUpload({ request: run, concurrency: limit, defaultFileList: [file('a'), file('b')] }), { initialProps: { limit: 1, run: request as (o: UploadRequestOptions) => Promise<UploadResult> } });
    act(() => { void h.result.current.upload(); }); await flush(); expect(calls).toHaveLength(1);
    h.rerender({ limit: 2, run: nextRequest }); await flush(); expect(nextRequest).toHaveBeenCalledTimes(1);
    expect(h.result.current.fileList[1]).toMatchObject({ status: 'done', url: '/next' }); await act(async () => calls[0].result.resolve({}));
  });
  it('resumes effect-started uploads through StrictMode mount replay', async () => {
    const request = vi.fn(async () => ({ url: '/strict' }));
    const h = renderHook(() => {
      const upload = useUpload({ request, defaultFileList: [file('strict')] });
      useEffect(() => { void upload.upload(); }, [upload.upload]);
      return upload;
    }, { wrapper: StrictMode });
    await flush();
    expect(request).toHaveBeenCalledTimes(1);
    expect(h.result.current.fileList[0]).toMatchObject({ status: 'done', url: '/strict' });
  });
  it('cancels a real HTTP request through AbortSignal', async () => {
    const arrived = deferred<void>(); const closed = deferred<void>();
    const server = createServer((_request, response) => {
      arrived.resolve();
      const timer = setTimeout(() => response.end('late'), 5000);
      response.on('close', () => { clearTimeout(timer); closed.resolve(); });
    });
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
    const address = server.address() as { port: number };
    let rejected = false;
    const h = renderHook(() => useUpload({ defaultFileList: [file('http')], request: async ({ signal }) => {
      try { await fetch(`http://127.0.0.1:${address.port}/upload`, { signal }); return {}; }
      catch (error) { rejected = true; throw error; }
    } }));
    try {
      await act(async () => { void h.result.current.upload(); await arrived.promise; });
      act(() => h.result.current.cancel('http'));
      await act(async () => { await closed.promise; });
      expect(rejected).toBe(true);
      expect(h.result.current.fileList[0].status).toBe('cancelled');
    } finally {
      h.unmount(); server.closeAllConnections();
      await new Promise<void>(resolve => server.close(() => resolve()));
    }
  });
  it('rejects invalid concurrency', () => {
    for (const concurrency of [0, -1, 1.5, NaN]) expect(() => renderHook(() => useUpload({ request: async () => ({}), concurrency }))).toThrow(RangeError);
  });
});
