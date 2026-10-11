import { StrictMode, useState } from 'react';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useBasePageTable, useTableChecked, useAddRowAtStart, useAddRowAtEnd, useCopyDataByIds, useDeleteDataByIds, useGetIndexById, useReloadDataById, type GetTableDataResult, type TableQuery } from './index.js';

type Row = { id: string | number; name: string; _checked?: boolean };
type Search = { name?: string };
function deferred<T>() {
  let resolve!: (value: T) => void; let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
async function tick(ms = 0) { await act(async () => { await vi.advanceTimersByTimeAsync(ms); }); }
const response = (name = 'first'): GetTableDataResult<Row> => ({ data: [{ id: 1, name }], total: 100 });
beforeEach(() => { vi.useFakeTimers(); localStorage.clear(); });
afterEach(() => vi.useRealTimers());

describe('useBasePageTable query and results', () => {
  it('loads once after the default debounce, passes signal and custom initial search', async () => {
    const getTableData = vi.fn(async () => response());
    const h = renderHook(() => useBasePageTable<Row, Search>({ getTableData, defaultSearchParams: { name: 'test' } }));
    expect(h.result.current.loading).toBe(true);
    await tick(199); expect(getTableData).not.toHaveBeenCalled();
    await tick(1);
    expect(getTableData).toHaveBeenCalledTimes(1);
    expect(getTableData.mock.calls[0]).toEqual([{ pageNum: 1, pageSize: 20, searchParams: { name: 'test' } }, expect.any(AbortSignal)]);
    expect(h.result.current.tableData).toEqual(response().data);
    expect(h.result.current.loading).toBe(false);
  });
  it('debounces queries and resets page only when page size or search changes', async () => {
    const getTableData = vi.fn(async () => response());
    const h = renderHook(() => useBasePageTable<Row, Search>({ getTableData, debounceTime: 30 }));
    act(() => { h.result.current.setPageNum(3); h.result.current.setPageNum(page => page + 1); });
    await tick(30); expect(getTableData).toHaveBeenCalledTimes(1); expect(h.result.current.pageNum).toBe(4);
    act(() => h.result.current.setPagination(5, 20));
    expect(h.result.current.pageNum).toBe(5);
    act(() => h.result.current.setPagination(5, 50));
    expect(h.result.current.pageNum).toBe(1); expect(h.result.current.pageSize).toBe(50);
    await tick(30); expect(getTableData).toHaveBeenCalledTimes(2);
    act(() => h.result.current.setPagination(1, 50));
    await tick(30); expect(getTableData).toHaveBeenCalledTimes(2);
    act(() => { h.result.current.setPageNum(4); h.result.current.setSearchParams(prev => ({ ...prev, name: 'find' })); });
    expect(h.result.current.pageNum).toBe(1); expect(h.result.current.searchParams).toEqual({ name: 'find' });
    await tick(30); expect(getTableData).toHaveBeenCalledTimes(3);
  });
  it('ignores invalid page numbers/sizes and uses functional page-size updates', async () => {
    const h = renderHook(() => useBasePageTable({ getTableData: async () => response(), debounceTime: 0, defaultPageSize: -1 }));
    await tick();
    act(() => { h.result.current.setPageNum(NaN); h.result.current.setPagination(-1, 0); h.result.current.setPageSize(size => size + 10); });
    expect(h.result.current.pageNum).toBe(1); expect(h.result.current.pageSize).toBe(30);
  });
  it('keeps controlled query authoritative and emits one complete pagination change', async () => {
    const onQueryChange = vi.fn(); const getTableData = vi.fn(async () => response());
    const initial: TableQuery<Search> = { pageNum: 4, pageSize: 20, searchParams: { name: 'A' } };
    const h = renderHook(({ query }) => useBasePageTable({ query, onQueryChange, getTableData, debounceTime: 0 }), { initialProps: { query: initial } });
    await tick();
    act(() => h.result.current.setPagination(7, 50));
    expect(onQueryChange).toHaveBeenCalledTimes(1);
    expect(onQueryChange).toHaveBeenLastCalledWith({ ...initial, pageNum: 1, pageSize: 50 });
    expect(h.result.current.pageNum).toBe(4); expect(h.result.current.pageSize).toBe(20);
    await tick(); expect(getTableData).toHaveBeenCalledTimes(1);
    h.rerender({ query: onQueryChange.mock.calls[0][0] });
    await tick(); expect(getTableData).toHaveBeenCalledTimes(2); expect(h.result.current.pageSize).toBe(50);
    onQueryChange.mockClear(); act(() => h.result.current.setPagination(1, 50)); expect(onQueryChange).not.toHaveBeenCalled();
  });
  it('local data/total updates preserve meta and never trigger another request', async () => {
    const getTableData = vi.fn(async () => ({ ...response(), meta: { token: 7 } }));
    const h = renderHook(() => useBasePageTable({ getTableData, debounceTime: 0 }));
    await tick();
    act(() => { h.result.current.setTableData(rows => [...rows, { id: 'local', name: 'local' }]); h.result.current.setTotal(total => total + 1); });
    expect(h.result.current.tableData).toHaveLength(2); expect(h.result.current.total).toBe(101);
    expect(h.result.current.data?.meta).toEqual({ token: 7 });
    await tick(); expect(getTableData).toHaveBeenCalledTimes(1);
    act(() => h.result.current.setTableData([])); expect(h.result.current.total).toBe(101);
  });
  it('keeps old rows while reloading and ignores render:false results', async () => {
    let next = response(); const getTableData = vi.fn(async () => next);
    const h = renderHook(() => useBasePageTable({ getTableData, debounceTime: 10 })); await tick(10);
    next = { data: [], total: 0, render: false }; act(() => h.result.current.reloadTable());
    expect(h.result.current.loading).toBe(true); expect(h.result.current.tableData).toHaveLength(1);
    await tick(10); expect(h.result.current.tableData).toHaveLength(1); expect(h.result.current.loading).toBe(false);
  });
  it('clears result on a business failure and recovers through manual retry', async () => {
    let fail = false; const problem = new Error('network');
    const getTableData = vi.fn(async () => { if (fail) throw problem; return response(); });
    const h = renderHook(() => useBasePageTable({ getTableData, debounceTime: 0 })); await tick();
    fail = true; act(() => h.result.current.reloadTable()); await tick();
    expect(h.result.current.error).toBe(problem); expect(h.result.current.tableData).toEqual([]); expect(h.result.current.total).toBe(0); expect(h.result.current.loading).toBe(false);
    fail = false; act(() => h.result.current.reloadTable()); expect(h.result.current.error).toBeUndefined(); await tick();
    expect(h.result.current.tableData).toHaveLength(1);
  });
  it('reads/writes page-size cache, ignores malformed cache and storage exceptions', async () => {
    localStorage.setItem('size', JSON.stringify({ value: 50 }));
    const getTableData = async () => response();
    const h = renderHook(() => useBasePageTable({ getTableData, cachePageSizeKey: 'size', debounceTime: 0 }));
    expect(h.result.current.pageSize).toBe(50);
    act(() => h.result.current.setPageSize(100)); expect(JSON.parse(localStorage.getItem('size')!).value).toBe(100); h.unmount();
    localStorage.setItem('bad', '{');
    const bad = renderHook(() => useBasePageTable({ getTableData, cachePageSizeKey: 'bad', defaultPageSize: 10, debounceTime: 0 }));
    expect(bad.result.current.pageSize).toBe(10); bad.unmount();
    const read = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    const write = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    const blocked = renderHook(() => useBasePageTable({ getTableData, cachePageSizeKey: 'blocked', debounceTime: 0 }));
    await tick(); expect(blocked.result.current.tableData).toHaveLength(1); read.mockRestore(); write.mockRestore();
  });
  it('accepts backend pagination corrections without a repeat loop', async () => {
    const getTableData = vi.fn(async () => ({ ...response(), pageNum: 2, pageSize: 10 }));
    const h = renderHook(() => useBasePageTable({ getTableData, debounceTime: 0 }));
    await tick(); await tick();
    expect(h.result.current.pageNum).toBe(2); expect(h.result.current.pageSize).toBe(10);
    expect(getTableData).toHaveBeenCalledTimes(2); await tick(); expect(getTableData).toHaveBeenCalledTimes(2);
    expect(h.result.current.loading).toBe(false);
  });
  it('exposes stable query setters and does not reload for inline fetcher identity', async () => {
    const fetch = vi.fn(async (_query: TableQuery<Search>, _signal: AbortSignal) => response());
    const h = renderHook(() => useBasePageTable({ getTableData: (...args) => fetch(...args), debounceTime: 0 }));
    const initial = h.result.current; await tick(); h.rerender(); await tick();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(h.result.current.setPagination).toBe(initial.setPagination); expect(h.result.current.reloadTable).toBe(initial.reloadTable);
    act(() => h.result.current.setLoading(true)); expect(h.result.current.loading).toBe(true);
    act(() => h.result.current.reloadTable()); await tick(); expect(h.result.current.loading).toBe(false);
  });
});

describe('request cancellation and lifecycle', () => {
  it('aborts old signals and rejects stale successes even if signal is ignored', async () => {
    const first = deferred<GetTableDataResult<Row>>(); const second = deferred<GetTableDataResult<Row>>();
    const getTableData = vi.fn((_query: TableQuery<Search>, _signal: AbortSignal) => getTableData.mock.calls.length === 1 ? first.promise : second.promise);
    const h = renderHook(() => useBasePageTable({ getTableData, debounceTime: 0 })); await tick();
    const signal = getTableData.mock.calls[0][1];
    act(() => h.result.current.setPageNum(2)); expect(signal.aborted).toBe(true); await tick();
    await act(async () => first.resolve(response('stale')));
    expect(h.result.current.tableData).toEqual([]); expect(h.result.current.loading).toBe(true); expect(h.result.current.error).toBeUndefined();
    await act(async () => second.resolve(response('current')));
    expect(h.result.current.tableData[0].name).toBe('current'); expect(h.result.current.loading).toBe(false);
  });
  it('aborts a real abort-aware request without exposing cancellation as error', async () => {
    let abortCount = 0;
    const getTableData = vi.fn((_query: TableQuery<Search>, signal: AbortSignal) => new Promise<GetTableDataResult<Row>>((_resolve, reject) => {
      signal.addEventListener('abort', () => { abortCount++; reject(new DOMException('cancelled', 'AbortError')); }, { once: true });
    }));
    const h = renderHook(() => useBasePageTable({ getTableData, debounceTime: 0 })); await tick();
    act(() => h.result.current.reloadTable()); await tick();
    expect(abortCount).toBe(1); expect(h.result.current.error).toBeUndefined(); expect(h.result.current.loading).toBe(true);
    h.unmount(); expect(abortCount).toBe(2);
  });
  it('ignores stale failure/finally after a newer success', async () => {
    const first = deferred<GetTableDataResult<Row>>(); let count = 0;
    const h = renderHook(() => useBasePageTable({ getTableData: async () => ++count === 1 ? first.promise : response('latest'), debounceTime: 0 }));
    await tick(); act(() => h.result.current.reloadTable()); await tick();
    await act(async () => first.reject(new Error('stale')));
    expect(h.result.current.error).toBeUndefined(); expect(h.result.current.tableData[0].name).toBe('latest'); expect(h.result.current.loading).toBe(false);
  });
  it('cancels pending debounce on unmount and tolerates StrictMode effect replay', async () => {
    const getTableData = vi.fn(async () => response());
    const unmounted = renderHook(() => useBasePageTable({ getTableData })); unmounted.unmount(); await tick(200);
    expect(getTableData).not.toHaveBeenCalled();
    const h = renderHook(() => useBasePageTable({ getTableData }), { wrapper: StrictMode }); await tick(200);
    expect(getTableData).toHaveBeenCalledTimes(1); expect(h.result.current.loading).toBe(false);
  });
  it('reloads on explicit deps and cleans/replaces subscriptions', async () => {
    const getTableData = vi.fn(async () => response()); const cleanup = vi.fn(); let notify!: () => void;
    const subscribe = vi.fn((reload: () => void) => { notify = reload; return cleanup; });
    const h = renderHook(({ dep, sub }) => useBasePageTable({ getTableData, debounceTime: 0, deps: [dep], subscribe: sub }), { initialProps: { dep: 1, sub: subscribe } });
    await tick(); act(() => notify()); await tick(); expect(getTableData).toHaveBeenCalledTimes(2);
    h.rerender({ dep: 2, sub: subscribe }); await tick(); expect(getTableData).toHaveBeenCalledTimes(3);
    const secondCleanup = vi.fn(); const second = vi.fn((_reload: () => void) => secondCleanup);
    h.rerender({ dep: 2, sub: second }); expect(cleanup).toHaveBeenCalledTimes(1);
    h.unmount(); expect(secondCleanup).toHaveBeenCalledTimes(1);
  });
});

function selectionHarness(initial: Row[]) {
  return renderHook(() => {
    const [rows, setRows] = useState(initial);
    const selection = useTableChecked({ tableData: rows, setTableData: setRows, idName: 'id' });
    return { rows, setRows, ...selection };
  });
}
describe('useTableChecked business data', () => {
  it('derives counts, keys and checked records from _checked', () => {
    const first = { id: 1, name: 'A', _checked: true }; const h = selectionHarness([first, { id: 2, name: 'B' }]);
    expect(h.result.current.checkedIds).toEqual([1]); expect(h.result.current.checkedItems[0]).toBe(first);
    expect(h.result.current.checkedCount).toBe(1); expect(h.result.current.isAllChecked).toBe(false); expect(h.result.current.isIndeterminate).toBe(true);
  });
  it('sets final keys in one immutable update, preserving unchanged row references', () => {
    const rows = [{ id: 1, name: 'A', _checked: true }, { id: 2, name: 'B' }, { id: 3, name: 'C' }]; const h = selectionHarness(rows);
    act(() => h.result.current.setCheckedIds([1, 2, 999]));
    expect(h.result.current.rows[0]).toBe(rows[0]); expect(h.result.current.rows[2]).toBe(rows[2]); expect(h.result.current.rows[1]).not.toBe(rows[1]);
    expect(h.result.current.checkedIds).toEqual([1, 2]); expect(rows[1]).not.toHaveProperty('_checked');
    const previous = h.result.current.rows; act(() => h.result.current.setCheckedIds([1, 2])); expect(h.result.current.rows).toBe(previous);
  });
  it('distinguishes string/number IDs and composes current row updates', () => {
    const h = selectionHarness([{ id: 1, name: 'number' }, { id: '1', name: 'string' }]);
    act(() => { h.result.current.toggleChecked(1); h.result.current.toggleChecked('1'); });
    expect(h.result.current.checkedIds).toEqual([1, '1']);
    act(() => h.result.current.changeChecked([1], false)); expect(h.result.current.checkedIds).toEqual(['1']);
    const rows = h.result.current.rows; act(() => h.result.current.toggleChecked()); expect(h.result.current.rows).toBe(rows);
  });
  it('toggles all, handles empty data and clears selections when fresh data replaces rows', () => {
    const h = selectionHarness([{ id: 1, name: 'A' }, { id: 2, name: 'B' }]);
    act(() => h.result.current.handleSelectAll()); expect(h.result.current.isAllChecked).toBe(true);
    act(() => h.result.current.handleSelectAll()); expect(h.result.current.checkedCount).toBe(0);
    act(() => { h.result.current.setRows([{ id: 3, name: 'C' }]); h.result.current.setCheckedIds([3]); });
    expect(h.result.current.checkedIds).toEqual([3]);
    act(() => h.result.current.setRows([{ id: 3, name: 'fresh' }])); expect(h.result.current.checkedCount).toBe(0);
    act(() => { h.result.current.setRows([]); h.result.current.handleSelectAll(); }); expect(h.result.current.rows).toEqual([]); expect(h.result.current.isAllChecked).toBe(false);
  });
});

describe('local row auxiliary hooks', () => {
  it('adds unique IDs, finds latest indexes and deletes by identity', () => {
    const h = renderHook(() => {
      const [rows, setRows] = useState([{ id: 'a', name: 'A' }]);
      return { rows, addStart: useAddRowAtStart(setRows, 'id', { name: 'default' }), addEnd: useAddRowAtEnd(setRows, 'id'),
        index: useGetIndexById({ tableData: rows, idName: 'id' }), remove: useDeleteDataByIds(setRows, 'id') };
    });
    act(() => { h.result.current.addStart(2); h.result.current.addEnd(1, { id: 'a', name: 'last' }); });
    expect(h.result.current.rows.map(row => row.name)).toEqual(['default', 'default', 'A', 'last']);
    expect(new Set(h.result.current.rows.map(row => row.id)).size).toBe(4); expect(h.result.current.index('a')).toBe(2);
    act(() => { h.result.current.addStart(Infinity); h.result.current.addStart(-1); h.result.current.addEnd(NaN); });
    expect(h.result.current.rows).toHaveLength(4);
    act(() => h.result.current.remove(['a'])); expect(h.result.current.index('a')).toBe(-1);
  });
  it('copies data deeply with new identity and reset selection', () => {
    const h = renderHook(() => {
      const [rows, setRows] = useState([{ id: 'a', _checked: true, nested: { value: 1 } }]);
      return { rows, copy: useCopyDataByIds(rows, setRows, 'id') };
    });
    act(() => h.result.current.copy(['a']));
    expect(h.result.current.rows).toHaveLength(2); expect(h.result.current.rows[0].id).not.toBe('a'); expect(h.result.current.rows[0]._checked).toBe(false);
    expect(h.result.current.rows[0].nested).not.toBe(h.result.current.rows[1].nested);
  });
  it('merges refreshed rows by key, preserving other records and surfacing failures', async () => {
    const problem = new Error('refresh'); let fail = false;
    const getTableDataById = vi.fn(async () => { if (fail) throw problem; return [{ id: 1, name: 'updated' }]; });
    const original = [{ id: 1, name: 'A', _checked: true }, { id: 2, name: 'B' }];
    const h = renderHook(() => {
      const [rows, setRows] = useState(original);
      return { rows, reload: useReloadDataById({ getTableDataById, setTableData: setRows, idName: 'id' }) };
    });
    await act(async () => h.result.current.reload([1])); expect(h.result.current.rows[0]).toEqual({ id: 1, name: 'updated', _checked: true }); expect(h.result.current.rows[1]).toBe(original[1]);
    fail = true; await expect(h.result.current.reload([1])).rejects.toBe(problem);
  });
});
