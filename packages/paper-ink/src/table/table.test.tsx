import { act, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Table, type TableColumn, type TableSelection, type TableSource } from './index.js';

type Row = { id: string | number; name: string; age: number; locked?: boolean };
const rows: Row[] = [{ id: 1, name: 'Alice', age: 20 }, { id: '1', name: 'Bob', age: 30, locked: true }];
const columns: TableColumn<Row>[] = [{ dataIndex: 'name', title: 'Name' }, { dataIndex: 'age', title: 'Age', sorter: true }];
function source(overrides: Partial<TableSource<Row>> = {}): TableSource<Row> { return { tableData: rows, loading: false, pageNum: 3, pageSize: 10, total: 60, setPagination: vi.fn(), ...overrides }; }
function selection(ids: (string | number)[] = []): TableSelection { return { checkedIds: ids, setCheckedIds: vi.fn() }; }

describe('Table data and presentation', () => {
  it('renders current rows without slicing or sorting, respects literal fields and custom render', () => {
    render(<Table rowKey="id" source={source()} columns={[...columns, { key: 'actions', render: (value, row, index) => <button>{`${value}:${row.name}:${index}`}</button> }]} />);
    expect(screen.getAllByRole('row')).toHaveLength(3);
    expect(screen.getByRole('button', { name: 'undefined:Alice:0' })).toBeInTheDocument();
    expect(screen.getAllByRole('cell').map(cell => cell.textContent)).toEqual(['Alice', '20', 'undefined:Alice:0', 'Bob', '30', 'undefined:Bob:1']);
  });
  it('merges row/cell properties, hides columns, exposes root ref and summary by effective keys', () => {
    const ref = createRef<HTMLDivElement>(), click = vi.fn(), header = vi.fn();
    const { container } = render(<Table ref={ref} data={rows} rowKey="id" columns={[
      { dataIndex: 'id', hidden: true },
      { dataIndex: 'name', title: 'Name', className: 'column', minWidth: 120, onCell: () => ({ className: 'cell', title: 'full', style: { color: 'red' } }), onHeaderCell: () => ({ className: 'heading' }) },
    ]} rowClassName="custom" onRow={() => ({ className: 'event', onClick: click })} onHeaderRow={() => ({ onClick: header })} summary={data => ({ name: `${data.length} rows`, id: 'hidden total' })} />);
    expect(ref.current).toHaveClass('pi-table');
    expect(screen.queryByText('hidden total')).not.toBeInTheDocument();
    expect(screen.getByText('2 rows').closest('tfoot')).not.toBeNull();
    const cell = screen.getByText('Alice').closest('td')!;
    expect(cell).toHaveClass('column', 'cell'); expect(cell).toHaveStyle({ color: 'rgb(255, 0, 0)', 'min-width': '120px' });
    expect(cell.closest('tr')).toHaveClass('custom', 'event'); fireEvent.click(cell); expect(click).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByText('Name')); expect(header).toHaveBeenCalledTimes(1);
    expect(container.querySelector('colgroup')?.children).toHaveLength(1);
  });
  it('supports empty override, initial loading without empty and retained rows while loading', () => {
    const { rerender } = render(<Table data={[]} columns={columns} rowKey="id" empty="Nothing" />);
    expect(screen.getByText('Nothing')).toBeInTheDocument();
    rerender(<Table data={[]} columns={columns} rowKey="id" loading />);
    expect(screen.queryByText('暂无数据')).not.toBeInTheDocument(); expect(screen.getByRole('status')).toHaveAccessibleName('加载中');
    rerender(<Table data={rows} columns={columns} rowKey="id" loading />);
    expect(screen.getByText('Alice')).toBeInTheDocument(); expect(screen.getByRole('status')).toBeInTheDocument();
    rerender(<Table data={[]} columns={columns} rowKey="id" empty={null} />); expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
  it('hides header without calling its callback and toggles appearance flags', () => {
    const header = vi.fn(); const { container } = render(<Table data={rows} columns={columns} rowKey="id" showHeader={false} onHeaderRow={header} rowHoverable={false} bordered size="small" />);
    expect(header).not.toHaveBeenCalled(); expect(screen.queryByRole('columnheader')).not.toBeInTheDocument();
    expect(container.firstChild).toHaveClass('pi-table--small', 'pi-table--bordered'); expect(container.firstChild).not.toHaveClass('pi-table--hoverable');
  });
});

describe('Table controlled sort', () => {
  it('cycles directions exactly once per click without changing order or page', () => {
    const change = vi.fn(); const tableSource = source(); const { rerender } = render(<Table source={tableSource} columns={columns} rowKey="id" onSortChange={change} />);
    fireEvent.click(screen.getByRole('button', { name: 'Age：升序' })); expect(change).toHaveBeenLastCalledWith({ key: 'age', order: 'ascend' });
    expect(screen.getByRole('columnheader', { name: 'Age' })).toHaveAttribute('aria-sort', 'none');
    rerender(<Table source={tableSource} columns={columns} rowKey="id" sort={{ key: 'age', order: 'ascend' }} onSortChange={change} />);
    fireEvent.click(screen.getByRole('button', { name: 'Age：降序' })); expect(change).toHaveBeenLastCalledWith({ key: 'age', order: 'descend' });
    rerender(<Table source={tableSource} columns={columns} rowKey="id" sort={{ key: 'age', order: 'descend' }} onSortChange={change} />);
    fireEvent.click(screen.getByRole('button', { name: 'Age：取消排序' })); expect(change).toHaveBeenLastCalledWith(null);
    expect(change).toHaveBeenCalledTimes(3); expect(tableSource.setPagination).not.toHaveBeenCalled();
    expect(screen.getAllByRole('cell').map(node => node.textContent)).toEqual(['Alice', '20', 'Bob', '30']);
  });
  it('respects custom cycles and header prevented events, and switching columns starts at first direction', () => {
    const change = vi.fn(), headerClick = vi.fn(event => event.preventDefault());
    const sortedColumns: TableColumn<Row>[] = [{ dataIndex: 'name', title: 'Name', sorter: true }, { dataIndex: 'age', title: 'Age', sorter: true, onHeaderCell: () => ({ onClick: headerClick }) }];
    const { rerender } = render(<Table data={rows} columns={sortedColumns} rowKey="id" sortDirections={['descend', 'ascend']} sort={{ key: 'age', order: 'ascend' }} onSortChange={change} />);
    fireEvent.click(screen.getByRole('button', { name: 'Age：降序' })); expect(headerClick).toHaveBeenCalledTimes(1); expect(change).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Name：降序' })); expect(change).toHaveBeenLastCalledWith({ key: 'name', order: 'descend' });
    rerender(<Table data={rows} columns={columns} rowKey="id" sortDirections={['ascend', null]} sort={{ key: 'age', order: 'ascend' }} onSortChange={change} locale={{ cancelSort: 'Clear' }} />);
    fireEvent.click(screen.getByRole('button', { name: 'Age：Clear' })); expect(change).toHaveBeenLastCalledWith(null);
  });
  it('does not activate missing/hidden sorts or invoke correction during render', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {}); const change = vi.fn();
    render(<Table data={rows} columns={columns} rowKey="id" sort={{ key: 'absent', order: 'ascend' }} onSortChange={change} sortDirections={[]} />);
    expect(screen.getByRole('columnheader', { name: 'Age' })).toHaveAttribute('aria-sort', 'none'); expect(change).not.toHaveBeenCalled(); expect(warning).toHaveBeenCalled(); warning.mockRestore();
  });
});

describe('Table selection', () => {
  it('selects current eligible rows, preserving off-page and disabled keys, then clears only eligible keys', () => {
    const state = selection(['elsewhere', '1']); const click = vi.fn();
    const { rerender } = render(<Table data={rows} columns={columns} rowKey="id" selection={state} rowSelectable={row => !row.locked} onRow={() => ({ onClick: click })} locale={{ selectRow: row => `Select ${row.name}` }} />);
    expect(screen.getByRole('checkbox', { name: 'Select Bob' })).toBeDisabled(); expect(screen.getByRole('checkbox', { name: 'Select Bob' })).toBeChecked();
    fireEvent.click(screen.getByRole('checkbox', { name: '选择当前页全部可选行' })); expect(state.setCheckedIds).toHaveBeenLastCalledWith(['elsewhere', '1', 1]);
    expect(click).not.toHaveBeenCalled();
    rerender(<Table data={rows} columns={columns} rowKey="id" selection={{ ...state, checkedIds: ['elsewhere', '1', 1] }} rowSelectable={row => !row.locked} />);
    fireEvent.click(screen.getByRole('checkbox', { name: '选择当前页全部可选行' })); expect(state.setCheckedIds).toHaveBeenLastCalledWith(['elsewhere', '1']); expect(state.setCheckedIds).toHaveBeenCalledTimes(2);
  });
  it('distinguishes string/number keys and calculates indeterminate only from selectable rows', () => {
    const state = selection([1]);
    render(<Table data={rows} columns={columns} rowKey="id" selection={state} locale={{ selectRow: row => `Select ${row.name}` }} />);
    expect(screen.getByRole('checkbox', { name: '选择当前页全部可选行' })).toHaveAttribute('aria-checked', 'mixed');
    expect(screen.getByRole('checkbox', { name: 'Select Bob' })).not.toBeChecked();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select Bob' })); expect(state.setCheckedIds).toHaveBeenLastCalledWith([1, '1']);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select Alice' })); expect(state.setCheckedIds).toHaveBeenLastCalledWith([]);
  });
  it('supports radio, hides all, retains title and disables all when no eligible rows', () => {
    const state = selection([1, 'elsewhere']); const { rerender } = render(<Table data={rows} columns={columns} rowKey="id" selection={{ ...state, type: 'radio', columnTitle: 'Pick' }} locale={{ selectRow: row => `Select ${row.name}` }} />);
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument(); fireEvent.click(screen.getByRole('radio', { name: 'Select Bob' })); expect(state.setCheckedIds).toHaveBeenLastCalledWith(['1']);
    rerender(<Table data={rows} columns={columns} rowKey="id" selection={{ ...state, hideSelectAll: true, columnTitle: 'Pick' }} />); expect(screen.getAllByRole('checkbox')).toHaveLength(2); expect(screen.getByText('Pick')).toBeInTheDocument();
    rerender(<Table data={rows} columns={columns} rowKey="id" selection={state} rowSelectable={() => false} />); expect(screen.getByRole('checkbox', { name: '选择当前页全部可选行' })).toBeDisabled();
  });
});

describe('Table pagination and scrolling', () => {
  it('binds source pagination once, supports top and hidden pager, does not forward position', () => {
    const tableSource = source(); const { container, rerender } = render(<Table source={tableSource} rowKey="id" columns={columns} pagination={{ position: 'top', showSizeChanger: false }} />);
    expect(container.querySelector('.pi-table')?.firstElementChild).toHaveClass('pi-table__pagination'); expect(screen.getByRole('navigation')).not.toHaveAttribute('position');
    fireEvent.click(screen.getByRole('button', { name: '第 4 页' })); expect(tableSource.setPagination).toHaveBeenLastCalledWith(4, 10); expect(tableSource.setPagination).toHaveBeenCalledTimes(1);
    rerender(<Table source={tableSource} rowKey="id" columns={columns} pagination={false} />); expect(screen.queryByRole('navigation')).not.toBeInTheDocument(); expect(screen.getByText('Alice')).toBeInTheDocument();
  });
  it('resets only vertical scroll on actual page change, preserving focus and opting out', () => {
    const { container, rerender } = render(<Table source={source()} rowKey="id" columns={columns} scroll={{ y: 200, x: 600 }} />);
    const viewport = container.querySelector<HTMLDivElement>('.pi-table__viewport')!; viewport.scrollTop = 80; viewport.scrollLeft = 40;
    const button = screen.getByRole('button', { name: 'Age：升序' }); button.focus();
    rerender(<Table source={source({ tableData: [...rows] })} rowKey="id" columns={columns} scroll={{ y: 200 }} />); expect(viewport.scrollTop).toBe(80);
    rerender(<Table source={source({ pageNum: 4 })} rowKey="id" columns={columns} scroll={{ y: 200 }} />); expect(viewport.scrollTop).toBe(0); expect(viewport.scrollLeft).toBe(40); expect(button).toHaveFocus();
    viewport.scrollTop = 75; rerender(<Table source={source({ pageNum: 5 })} rowKey="id" columns={columns} scrollToFirstRowOnChange={false} />); expect(viewport.scrollTop).toBe(75);
  });
  it('computes left/right fixed offsets with selection, hidden columns and summary', () => {
    const state = selection(); const fixed: TableColumn<Row>[] = [
      { dataIndex: 'id', width: 80, fixed: 'left', hidden: true },
      { dataIndex: 'name', title: 'Name', width: 120, fixed: 'left' },
      { dataIndex: 'age', title: 'Age', width: 90, fixed: 'left' },
      { key: 'action', title: 'Action', width: 100, fixed: 'right', render: () => 'Edit' },
    ];
    const { container } = render(<Table data={rows} rowKey="id" columns={fixed} selection={state} summary={() => ({ name: 'Sum' })} scroll={{ y: 100 }} />);
    const headers = screen.getAllByRole('columnheader'); expect(headers[0]).toHaveStyle({ left: '0px' }); expect(headers[1]).toHaveStyle({ left: '40px' }); expect(headers[2]).toHaveStyle({ left: '160px' }); expect(headers[3]).toHaveStyle({ right: '0px' });
    expect(container.firstChild).toHaveClass('pi-table--sticky-header'); expect(screen.getByText('Sum')).toHaveStyle({ left: '40px' });
  });
});

it('shares overflow detection, updates on resize, only focuses overflowing text and retains interactive custom cells', async () => {
  const listeners: (() => void)[] = [];
  const NativeObserver = globalThis.ResizeObserver;
  class Observer { constructor(callback: () => void) { listeners.push(callback); } observe() {} unobserve() {} disconnect() {} }
  globalThis.ResizeObserver = Observer as unknown as typeof ResizeObserver;
  const width = vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(60);
  const scrollWidth = vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(120);
  try {
    const { container, rerender } = render(<Table data={rows.slice(0, 1)} rowKey="id" columns={[
      { dataIndex: 'name', ellipsis: true },
      { key: 'custom', ellipsis: { tooltip: () => 'Extra' }, render: () => <button>Editor</button> },
      { key: 'off', ellipsis: { tooltip: false }, render: () => 'No tooltip' },
    ]} />);
    const text = screen.getByText('Alice'); expect(text).toHaveAttribute('tabindex', '0'); expect(screen.getByRole('button', { name: 'Editor' })).not.toHaveAttribute('tabindex'); expect(screen.getByText('No tooltip')).not.toHaveAttribute('tabindex');
    fireEvent.focus(text); expect(await screen.findByRole('tooltip')).toHaveTextContent('Alice');
    fireEvent.keyDown(document, { key: 'Escape' }); expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    scrollWidth.mockReturnValue(60); act(() => listeners.forEach(callback => callback())); expect(text).not.toHaveAttribute('tabindex');
    expect(container.querySelector('.pi-table__cell-content')).toContainElement(screen.getByRole('button', { name: 'Editor' }));
    rerender(<Table data={rows.slice(0, 1)} rowKey="id" columns={[{ dataIndex: 'name', ellipsis: true, onCell: () => ({ title: 'Native' }) }]} />); scrollWidth.mockReturnValue(200); act(() => listeners.forEach(callback => callback())); expect(screen.getByText('Alice')).not.toHaveAttribute('tabindex');
  } finally { width.mockRestore(); scrollWidth.mockRestore(); globalThis.ResizeObserver = NativeObserver; }
});
