import { it, expect } from 'vitest';
import { createRef } from 'react';
import { Table, type TableColumn, type TableProps, type TableSource } from './index.js';
interface User { id: number; name: string; age: number; detail: { city: string }; maybe?: string }
function TypedExample() {
  const columns: TableColumn<User>[] = [
    { dataIndex: 'name', render: value => value.toUpperCase(), onCell: () => ({ 'data-testid': 'cell' }), onHeaderCell: () => ({ 'data-testid': 'head' }) },
    { dataIndex: 'age', render: value => value.toFixed(2) },
    { key: 'action', render: (value, row) => { const empty: undefined = value; void empty; return row.name; } },
    // @ts-expect-error invalid top-level field
    { dataIndex: 'detail.city' },
    // @ts-expect-error field render keeps value type
    { dataIndex: 'name', render: (value: number) => value },
    // @ts-expect-error operation column needs explicit key
    { title: 'Action' },
  ];
  const source: TableSource<User> = { tableData: [], loading: false, pageNum: 1, pageSize: 10, total: 0, setPagination: () => {} };
  const good: TableProps<User> = { columns, source, rowKey: 'id' };
  // @ts-expect-error only one source
  const both: TableProps<User> = { columns, source, data: [], rowKey: 'id' };
  // @ts-expect-error source forbids loading override
  const overridden: TableProps<User> = { columns, source, loading: false, rowKey: 'id' };
  // @ts-expect-error static data does not provide internal pagination
  const staticPage: TableProps<User> = { columns, data: [], pagination: false, rowKey: 'id' };
  // @ts-expect-error identity must have key values
  const objectKey: TableProps<User> = { columns, data: [], rowKey: 'detail' };
  // @ts-expect-error optional field not stable key
  const optionalKey: TableProps<User> = { columns, data: [], rowKey: 'maybe' };
  // @ts-expect-error no duplicate pagination state
  const duplicate: TableProps<User> = { columns, source, rowKey: 'id', pagination: { current: 1 } };
  void [both, overridden, staticPage, objectKey, optionalKey, duplicate];
  return <Table {...good} ref={createRef<HTMLDivElement>()} onRow={() => ({ 'data-testid': 'row' })} onHeaderRow={() => ({ 'data-testid': 'head-row' })} />;
}
it('keeps Table generic constraints available to tsc', () => expect(typeof TypedExample).toBe('function'));
