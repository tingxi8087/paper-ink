import { expect, it } from 'vitest';
import { useState } from 'react';
import { useBasePageTable, useTableChecked, useAddRowAtStart, useReloadDataById, type GetTableDataFn, type TableQuery } from './index.js';
import { useRefState } from '../use-ref-state/index.js';

function TypedHooks() {
  type Row = { id: number; name: string; meta: { age: number }; _checked?: boolean };
  type Search = { keyword: string };
  const getTableData: GetTableDataFn<Row, Search, { token: string }> = async (query, signal) => {
    const search: string = query.searchParams.keyword;
    const abort: boolean = signal.aborted;
    void search; void abort;
    return { data: [], total: 0, meta: { token: 'x' } };
  };
  const table = useBasePageTable({ getTableData, defaultSearchParams: { keyword: '' } });
  const token: string | undefined = table.data?.meta?.token;
  table.setSearchParams(previous => ({ ...previous, keyword: 'search' }));
  // @ts-expect-error search parameters follow the request type
  table.setSearchParams({ keyword: 123 });
  // @ts-expect-error controlled query requires onQueryChange
  useBasePageTable({ getTableData, query: { pageNum: 1, pageSize: 20, searchParams: { keyword: '' } } });
  // @ts-expect-error onQueryChange cannot be provided without query
  useBasePageTable({ getTableData, onQueryChange: (_query: TableQuery<Search>) => undefined });
  useTableChecked({ tableData: table.tableData, setTableData: table.setTableData, idName: 'id' });
  // @ts-expect-error object fields are not valid identity fields
  useTableChecked({ tableData: table.tableData, setTableData: table.setTableData, idName: 'meta' });
  // @ts-expect-error unknown identity field
  useTableChecked({ tableData: table.tableData, setTableData: table.setTableData, idName: 'missing' });
  // @ts-expect-error generated local IDs are strings, numeric identity unsupported
  useAddRowAtStart(table.setTableData, 'id');
  const [, setStrings] = useState<{ id: string; name: string }[]>([]);
  useAddRowAtStart(setStrings, 'id', { name: 'new' });
  const refreshStringIds = useReloadDataById({
    setTableData: setStrings, idName: 'id', getTableDataById: async (ids: string[]) => ids.map(id => ({ id })),
  });
  refreshStringIds(['existing-string-service']);
  // @ts-expect-error refresh callback preserves the service identity parameter type
  refreshStringIds([123]);
  const [count, setCount, ref] = useRefState(0);
  setCount(previous => previous + 1);
  // @ts-expect-error ref is readonly; use the setter
  ref.current = 4;
  void count; void token;
  return null;
}
it('keeps hook type fixtures available to tsc', () => expect(typeof TypedHooks).toBe('function'));
