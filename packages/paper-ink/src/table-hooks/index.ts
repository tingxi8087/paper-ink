import { useCallback, useEffect, useMemo, useRef, useState, type DependencyList, type Dispatch, type SetStateAction } from 'react';
import { useRefState } from '../use-ref-state/index.js';

export type TableQuery<S> = { pageNum: number; pageSize: number; searchParams: S };
export type GetTableDataResult<T, M = unknown> = {
  data: T[]; total: number; pageNum?: number; pageSize?: number; render?: boolean; meta?: M;
};
export type GetTableDataFn<T, S = Record<string, unknown>, M = unknown> =
  (query: TableQuery<S>, signal: AbortSignal) => Promise<GetTableDataResult<T, M>>;
export type TableOptions<T, S, M = unknown> = {
  getTableData: GetTableDataFn<T, S, M>;
  defaultPageSize?: number;
  defaultSearchParams?: S;
  cachePageSizeKey?: string;
  debounceTime?: number;
  deps?: DependencyList;
  subscribe?: (reload: () => void) => (() => void);
} & ({ query: TableQuery<S>; onQueryChange: (query: TableQuery<S>) => void }
  | { query?: undefined; onQueryChange?: undefined });

function positiveInteger(value: number, fallback: number) {
  return Number.isInteger(value) && value > 0 ? value : fallback;
}
function storedPageSize(key: string | undefined, fallback: number) {
  if (!key) return fallback;
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) || 'null')?.value;
    return typeof value === 'number' ? positiveInteger(value, fallback) : fallback;
  } catch { return fallback; }
}

export function useBasePageTable<T = Record<string, unknown>, S = Record<string, unknown>, M = unknown>(options: TableOptions<T, S, M>) {
  const [internalQuery, setInternalQuery, queryRef] = useRefState<TableQuery<S>>(() => ({
    pageNum: 1,
    pageSize: storedPageSize(options.cachePageSizeKey, positiveInteger(options.defaultPageSize ?? 20, 20)),
    searchParams: options.defaultSearchParams ?? {} as S,
  }));
  const query = options.query ?? internalQuery;
  const latest = useRef(options);
  latest.current = options;
  const [result, setResult] = useState<GetTableDataResult<T, M>>();
  const [error, setError] = useState<unknown>();
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const requestRef = useRef<AbortController | null>(null);
  const change = useCallback((update: (current: TableQuery<S>) => TableQuery<S>) => {
    const current = latest.current;
    const previous = current.query ?? queryRef.current;
    const next = update(previous);
    if (next === previous) return;
    if (current.query) current.onQueryChange(next);
    else {
      requestRef.current?.abort();
      setInternalQuery(next);
    }
  }, [queryRef, setInternalQuery]);
  const reloadTable = useCallback(() => {
    requestRef.current?.abort();
    setRevision(value => value + 1);
  }, []);
  useEffect(() => options.subscribe?.(reloadTable), [options.subscribe, reloadTable]);
  const delay = Math.max(0, options.debounceTime ?? 200);
  useEffect(() => {
    const controller = new AbortController();
    requestRef.current = controller;
    let active = true;
    // A snapshot separates the query envelope from future pagination updates.
    // Search parameter objects follow React's immutable update convention.
    const snapshot = { ...query };
    setLoading(true);
    setError(undefined);
    const timer = setTimeout(() => {
      Promise.resolve().then(() => {
        if (!active || controller.signal.aborted) return;
        return latest.current.getTableData(snapshot, controller.signal);
      }).then(next => {
        if (!active || controller.signal.aborted || !next || next.render === false) return;
        setResult(next);
        const pageNum = positiveInteger(next.pageNum ?? snapshot.pageNum, snapshot.pageNum);
        const pageSize = positiveInteger(next.pageSize ?? snapshot.pageSize, snapshot.pageSize);
        if (pageNum !== snapshot.pageNum || pageSize !== snapshot.pageSize) {
          change(current => {
            if (current.pageNum !== snapshot.pageNum || current.pageSize !== snapshot.pageSize || current.searchParams !== snapshot.searchParams) return current;
            return { ...current, pageNum, pageSize };
          });
        }
      }).catch(problem => {
        if (!active || controller.signal.aborted) return;
        setError(problem);
        setResult(undefined);
      }).finally(() => {
        if (active && !controller.signal.aborted) setLoading(false);
      });
    }, delay);
    return () => {
      active = false;
      clearTimeout(timer);
      controller.abort();
      if (requestRef.current === controller) requestRef.current = null;
    };
  }, [query.pageNum, query.pageSize, query.searchParams, revision, delay, change, ...(options.deps ?? [])]);
  useEffect(() => {
    if (!options.cachePageSizeKey) return;
    try { localStorage.setItem(options.cachePageSizeKey, JSON.stringify({ value: query.pageSize })); }
    catch { /* Optional persistence must not block requests. */ }
  }, [options.cachePageSizeKey, query.pageSize]);
  const setPageNum = useCallback<Dispatch<SetStateAction<number>>>(value => {
    change(current => {
      const pageNum = positiveInteger(typeof value === 'function' ? value(current.pageNum) : value, current.pageNum);
      return pageNum === current.pageNum ? current : { ...current, pageNum };
    });
  }, [change]);
  const setPageSize = useCallback<Dispatch<SetStateAction<number>>>(value => {
    change(current => {
      const pageSize = positiveInteger(typeof value === 'function' ? value(current.pageSize) : value, current.pageSize);
      return pageSize === current.pageSize ? current : { ...current, pageNum: 1, pageSize };
    });
  }, [change]);
  const setPagination = useCallback((pageNum: number, pageSize: number) => {
    change(current => {
      const size = positiveInteger(pageSize, current.pageSize);
      const page = size !== current.pageSize ? 1 : positiveInteger(pageNum, current.pageNum);
      return page === current.pageNum && size === current.pageSize ? current : { ...current, pageNum: page, pageSize: size };
    });
  }, [change]);
  const setSearchParams = useCallback<Dispatch<SetStateAction<S>>>(value => {
    change(current => {
      const searchParams = typeof value === 'function' ? (value as (previous: S) => S)(current.searchParams) : value;
      return Object.is(searchParams, current.searchParams) && current.pageNum === 1 ? current : { ...current, pageNum: 1, searchParams };
    });
  }, [change]);
  const setTableData = useCallback<Dispatch<SetStateAction<T[]>>>(value => {
    setResult(previous => ({ ...previous, total: previous?.total ?? 0,
      data: typeof value === 'function' ? value(previous?.data ?? []) : value }));
  }, []);
  const setTotal = useCallback<Dispatch<SetStateAction<number>>>(value => {
    setResult(previous => ({ ...previous, data: previous?.data ?? [],
      total: typeof value === 'function' ? value(previous?.total ?? 0) : value }));
  }, []);
  const emptyData = useMemo<T[]>(() => [], []);
  return { ...query, setPageNum, setPageSize, setPagination, setSearchParams,
    tableData: result?.data ?? emptyData, setTableData, total: result?.total ?? 0, setTotal,
    data: result, error, loading, setLoading, reloadTable };
}
export type UseBasePageTableReturn<T, S = Record<string, unknown>, M = unknown> = ReturnType<typeof useBasePageTable<T, S, M>>;
export type TableRowKey = string | number;
export type TableIdentityKey<T> = { [K in keyof T]-?: T[K] extends TableRowKey ? K : never }[keyof T] & string;
export type UseTableCheckedOptions<T> = {
  tableData: readonly T[]; setTableData: Dispatch<SetStateAction<T[]>>; idName: TableIdentityKey<T>;
};
export type UseTableCheckedReturn<T> = {
  toggleChecked: (id?: TableRowKey) => void;
  changeChecked: (ids: TableRowKey[], checked: boolean) => void;
  setCheckedIds: (ids: TableRowKey[]) => void;
  handleSelectAll: () => void;
  checkedIds: TableRowKey[]; checkedItems: T[]; isAllChecked: boolean; checkedCount: number; isIndeterminate: boolean;
};
function checked<T>(row: T) { return (row as T & { _checked?: boolean })._checked === true; }
function identity<T>(row: T, idName: TableIdentityKey<T>) { return row[idName] as TableRowKey; }
function updateChecked<T>(rows: T[], getChecked: (row: T) => boolean) {
  let changed = false;
  const next = rows.map(row => {
    const value = getChecked(row);
    if (checked(row) === value) return row;
    changed = true;
    return { ...row, _checked: value };
  });
  return changed ? next : rows;
}
/** Selection is deliberately stored in business records as `_checked`. */
export function useTableChecked<T extends object>({ tableData, setTableData, idName }: UseTableCheckedOptions<T>): UseTableCheckedReturn<T> {
  const toggleChecked = useCallback((id?: TableRowKey) => {
    if (id === undefined || id === null) return;
    setTableData(rows => updateChecked(rows, row => identity(row, idName) === id ? !checked(row) : checked(row)));
  }, [setTableData, idName]);
  const changeChecked = useCallback((ids: TableRowKey[], value: boolean) => {
    const keys = new Set(ids);
    setTableData(rows => updateChecked(rows, row => keys.has(identity(row, idName)) ? value : checked(row)));
  }, [setTableData, idName]);
  const setCheckedIds = useCallback((ids: TableRowKey[]) => {
    const keys = new Set(ids);
    setTableData(rows => updateChecked(rows, row => keys.has(identity(row, idName))));
  }, [setTableData, idName]);
  const handleSelectAll = useCallback(() => {
    setTableData(rows => {
      const all = rows.length > 0 && rows.every(checked);
      return updateChecked(rows, () => !all);
    });
  }, [setTableData]);
  const derived = useMemo(() => {
    const checkedItems = tableData.filter(checked);
    const checkedCount = checkedItems.length;
    const isAllChecked = tableData.length > 0 && checkedCount === tableData.length;
    return { checkedItems, checkedCount, checkedIds: checkedItems.map(row => identity(row, idName)),
      isAllChecked, isIndeterminate: checkedCount > 0 && !isAllChecked };
  }, [tableData, idName]);
  return { toggleChecked, changeChecked, setCheckedIds, handleSelectAll, ...derived };
}

export type UpdateGetTableDataByIdFn<T, K extends TableRowKey = TableRowKey> = (ids: K[]) => Promise<Partial<T>[]>;
export function useReloadDataById<T extends object, K extends TableRowKey = TableRowKey>({ getTableDataById, setTableData, idName }: {
  getTableDataById: UpdateGetTableDataByIdFn<T, K>; setTableData: Dispatch<SetStateAction<T[]>>; idName: TableIdentityKey<T>;
}) {
  return useCallback(async (ids: K[]) => {
    const updates = await getTableDataById(ids);
    const byId = new Map(updates.map(row => [row[idName], row]));
    setTableData(rows => rows.map(row => {
      const update = byId.get(row[idName]);
      return update ? { ...row, ...update } : row;
    }));
  }, [getTableDataById, setTableData, idName]);
}
export function useGetIndexById<T extends object>({ tableData, idName }: { tableData: readonly T[]; idName: TableIdentityKey<T> }) {
  const latest = useRef(tableData);
  latest.current = tableData;
  return useCallback((id: TableRowKey) => latest.current.findIndex(row => identity(row, idName) === id), [idName]);
}
type StringIdentityKey<T> = { [K in keyof T]-?: T[K] extends string ? K : never }[keyof T] & string;
let localId = 0;
function createId(prefix: string) { return `${prefix}-${Date.now()}-${++localId}-${crypto.randomUUID()}`; }
export function useCopyDataByIds<T extends object>(tableData: readonly T[], setTableData: Dispatch<SetStateAction<T[]>>, idName: StringIdentityKey<T>) {
  const latest = useRef(tableData);
  latest.current = tableData;
  return useCallback((ids: TableRowKey[]) => {
    const rows = latest.current;
    // Clone before scheduling the update: failures are surfaced to the caller,
    // and the React updater itself remains pure.
    const copies = ids.flatMap(id => {
      const row = rows.find(item => item[idName] === id);
      return row ? [{ ...structuredClone(row), [idName]: createId(`${id}-copy`), _checked: false } as T] : [];
    });
    if (copies.length) setTableData(previous => [...copies, ...previous]);
  }, [setTableData, idName]);
}
function useAddRows<T extends object>(setTableData: Dispatch<SetStateAction<T[]>>, idName: StringIdentityKey<T>, totalRowInitialData: Partial<T> | undefined, atStart: boolean) {
  return useCallback((len = 1, initialData?: Partial<T>) => {
    if (!Number.isFinite(len) || len <= 0) return;
    const rows = Array.from({ length: Math.floor(len) }, () => ({
      ...totalRowInitialData, ...initialData, [idName]: createId('new'),
    } as T));
    if (rows.length) setTableData(previous => atStart ? [...rows, ...previous] : [...previous, ...rows]);
  }, [setTableData, idName, totalRowInitialData, atStart]);
}
export function useAddRowAtStart<T extends object>(setTableData: Dispatch<SetStateAction<T[]>>, idName: StringIdentityKey<T>, totalRowInitialData?: Partial<T>) {
  return useAddRows(setTableData, idName, totalRowInitialData, true);
}
export function useAddRowAtEnd<T extends object>(setTableData: Dispatch<SetStateAction<T[]>>, idName: StringIdentityKey<T>, totalRowInitialData?: Partial<T>) {
  return useAddRows(setTableData, idName, totalRowInitialData, false);
}
export function useDeleteDataByIds<T extends object>(setTableData: Dispatch<SetStateAction<T[]>>, idName: TableIdentityKey<T>) {
  return useCallback((ids: TableRowKey[]) => {
    const keys = new Set(ids);
    setTableData(rows => rows.filter(row => !keys.has(identity(row, idName))));
  }, [setTableData, idName]);
}
