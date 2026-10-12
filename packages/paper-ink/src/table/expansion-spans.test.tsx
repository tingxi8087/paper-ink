import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode } from 'react';
import { expect, it, vi } from 'vitest';
import { Table, type TableColumn, type TableExpansion } from './index.js';

type Row = { id: number | string; name: string; group: string; amount: number; disabled?: boolean };
const rows: Row[] = [
  { id: 1, name: 'Alice', group: 'A', amount: 10 },
  { id: '1', name: 'Bob', group: 'A', amount: 20 },
  { id: 3, name: 'Carol', group: 'B', amount: 30 },
  { id: 4, name: 'Dan', group: 'B', amount: 40 },
];
const columns: TableColumn<Row>[] = [{ dataIndex: 'name', title: 'Name' }, { dataIndex: 'amount', title: 'Amount' }];
const locale = { expandRow: (row: Row) => `Expand ${row.name}`, collapseRow: (row: Row) => `Collapse ${row.name}` };
function expansion(expandedIds: (string | number)[] = []): TableExpansion<Row> { return { expandedIds, setExpandedIds: vi.fn(), render: row => <input aria-label={`Detail ${row.name}`} defaultValue={row.name} /> }; }

it('uses controlled expansion, typed stable keys, native button keyboard and one notification', async () => {
  const state = expansion(['offpage']); const rowClick = vi.fn(); const user = userEvent.setup();
  const { rerender } = render(<Table rowKey="id" data={rows} columns={columns} expansion={state} locale={locale} onRow={() => ({ onClick: rowClick })} />);
  const toggle = screen.getByRole('button', { name: 'Expand Alice' });
  expect(toggle).toHaveAttribute('aria-expanded', 'false'); expect(toggle).not.toHaveAttribute('aria-controls');
  toggle.focus(); await user.keyboard('{Enter}');
  expect(state.setExpandedIds).toHaveBeenCalledExactlyOnceWith(['offpage', 1]); expect(rowClick).not.toHaveBeenCalled(); expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  rerender(<Table rowKey="id" data={rows} columns={columns} expansion={{ ...state, expandedIds: ['offpage', 1] }} locale={locale} />);
  const expandedButton = screen.getByRole('button', { name: 'Collapse Alice' }); const panelId = expandedButton.getAttribute('aria-controls')!;
  expect(document.getElementById(panelId)).toHaveAttribute('role', 'region'); expect(screen.getByRole('region', { name: 'Collapse Alice' })).toContainElement(screen.getByRole('textbox', { name: 'Detail Alice' }));
  fireEvent.click(screen.getByRole('button', { name: 'Expand Bob' })); expect(state.setExpandedIds).toHaveBeenLastCalledWith(['offpage', 1, '1']);
  fireEvent.click(expandedButton); expect(state.setExpandedIds).toHaveBeenLastCalledWith(['offpage']);
});

it('unmounts details on external collapse, restores focus and creates fresh detail state on reopen', async () => {
  const state = expansion([1]); const { rerender } = render(<StrictMode><Table rowKey="id" data={rows} columns={columns} expansion={state} locale={locale} /></StrictMode>);
  const input = screen.getByRole('textbox', { name: 'Detail Alice' }); fireEvent.change(input, { target: { value: 'Edited' } }); input.focus();
  await act(async () => { rerender(<StrictMode><Table rowKey="id" data={rows} columns={columns} expansion={{ ...state, expandedIds: [] }} locale={locale} /></StrictMode>); await Promise.resolve(); });
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument(); expect(screen.getByRole('button', { name: 'Expand Alice' })).toHaveFocus();
  rerender(<Table rowKey="id" data={rows} columns={columns} expansion={state} locale={locale} />); expect(screen.getByRole('textbox', { name: 'Detail Alice' })).toHaveValue('Alice');
});

it('does not steal focus when another control is selected, and omits nonexpandable and removed rows', async () => {
  const state = expansion([1, 3]); const renderDetail = vi.fn(row => row.name);
  const { rerender } = render(<Table rowKey="id" data={rows} columns={columns} expansion={{ ...state, render: renderDetail, rowExpandable: row => row.id !== 3 }} locale={locale} />);
  expect(screen.queryByRole('button', { name: /Carol/ })).not.toBeInTheDocument(); expect(renderDetail).toHaveBeenCalledTimes(1);
  const other = screen.getByRole('button', { name: 'Expand Bob' }); other.focus();
  await act(async () => { rerender(<Table rowKey="id" data={rows.slice(1)} columns={columns} expansion={{ ...state, expandedIds: [], render: renderDetail }} locale={locale} />); await Promise.resolve(); });
  expect(other).toHaveFocus(); expect(state.setExpandedIds).not.toHaveBeenCalled(); expect(screen.queryByRole('region')).not.toBeInTheDocument();
});

it('renders custom icon and fixes expansion before selection with empty and summary colspans', () => {
  const state = expansion([1]); const setCheckedIds = vi.fn();
  const fixed: TableColumn<Row>[] = [{ dataIndex: 'name', title: 'Name', width: 120, fixed: 'left' }, { dataIndex: 'amount', title: 'Amount', width: 90, fixed: 'right' }];
  const { container, rerender } = render(<Table rowKey="id" data={rows.slice(0, 1)} columns={fixed} expansion={{ ...state, expandIcon: open => <svg data-testid="custom-icon" data-open={open} /> }} selection={{ checkedIds: [], setCheckedIds }} locale={locale} summary={() => ({ name: 'Total' })} />);
  const headers = screen.getAllByRole('columnheader'); expect(headers[0]).toHaveClass('pi-table__expansion'); expect(headers[0]).toHaveStyle({ left: '0px' }); expect(headers[1]).toHaveClass('pi-table__selection'); expect(headers[1]).toHaveStyle({ left: '40px' }); expect(headers[2]).toHaveStyle({ left: '80px' }); expect(headers[3]).toHaveStyle({ right: '0px' });
  expect(screen.getByTestId('custom-icon')).toHaveAttribute('data-open', 'true'); expect(container.querySelector('.pi-table__expanded-row td')).toHaveAttribute('colspan', '4'); expect(container.querySelector('tfoot tr')?.children).toHaveLength(4);
  rerender(<Table rowKey="id" data={[]} columns={fixed} expansion={state} selection={{ checkedIds: [], setCheckedIds }} />); expect(container.querySelector('.pi-table__placeholder td')).toHaveAttribute('colspan', '4');
});

it('keeps expanded keys through data refresh and only renders panels in displayed row order', () => {
  const state = expansion([3, 1, '1', 'offpage']); const { container, rerender } = render(<Table rowKey="id" data={rows} columns={columns} expansion={state} locale={locale} />);
  expect(Array.from(container.querySelectorAll('.pi-table__expanded-row')).map(node => node.getAttribute('data-parent-row-key'))).toEqual(['number:1', 'string:1', 'number:3']);
  rerender(<Table rowKey="id" data={[{ ...rows[0], name: 'Updated' }]} columns={columns} expansion={state} locale={locale} />); expect(screen.getByRole('textbox', { name: 'Detail Updated' })).toBeInTheDocument(); expect(state.setExpandedIds).not.toHaveBeenCalled();
});

it('merges rectangular body cells and skips covered cells without explicit zeros', () => {
  const attrs = vi.fn((row: Row, index: number) => index === 0 ? { rowSpan: 2, colSpan: 2 } : {});
  const renderCovered = vi.fn((value: string) => value);
  const merged: TableColumn<Row>[] = [{ dataIndex: 'group', title: 'Group', onCell: attrs }, { dataIndex: 'name', title: 'Name', render: renderCovered }, { dataIndex: 'amount', title: 'Amount' }];
  const { container } = render(<Table rowKey="id" data={rows} columns={merged} />);
  const dataRows = container.querySelectorAll('tbody tr'); expect(dataRows[0].children).toHaveLength(2); expect(dataRows[1].children).toHaveLength(1); expect(dataRows[2].children).toHaveLength(3);
  expect(dataRows[0].firstElementChild).toHaveAttribute('rowspan', '2'); expect(dataRows[0].firstElementChild).toHaveAttribute('colspan', '2'); expect(attrs).toHaveBeenCalledTimes(4); expect(renderCovered.mock.calls.map(call => call[0])).toEqual(['Carol', 'Dan']);
});

it('supports explicit zero spans, visible-column clamping and does not merge utility columns', () => {
  const merged: TableColumn<Row>[] = [{ dataIndex: 'group', hidden: true }, { dataIndex: 'name', onCell: (_, index) => index === 0 ? { colSpan: 100 } : { colSpan: 0 } }, { dataIndex: 'amount' }];
  const { container } = render(<Table rowKey="id" data={rows.slice(0, 2)} columns={merged} expansion={expansion()} selection={{ checkedIds: [], setCheckedIds: vi.fn() }} />);
  const dataRows = container.querySelectorAll('tbody tr'); expect(dataRows[0].children).toHaveLength(3); expect(dataRows[0].lastElementChild).toHaveAttribute('colspan', '2'); expect(dataRows[1].children).toHaveLength(3); expect(screen.queryByText('Bob')).not.toBeInTheDocument(); expect(screen.getByText('20')).toBeInTheDocument();
});

it('clamps rows to displayed page and colspans to fixed boundaries, normalizes invalid spans', () => {
  const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const merged: TableColumn<Row>[] = [
    { dataIndex: 'group', width: 80, fixed: 'left', onCell: () => ({ colSpan: 20, rowSpan: 20 }) },
    { dataIndex: 'name', onCell: () => ({ rowSpan: -2, colSpan: 1.5 }) },
    { dataIndex: 'amount', width: 90, fixed: 'right' },
  ];
  const { container } = render(<Table rowKey="id" data={rows.slice(0, 2)} columns={merged} />);
  const first = container.querySelector('tbody tr')!; expect(first.children).toHaveLength(3); expect(first.firstElementChild).toHaveAttribute('rowspan', '2'); expect(first.firstElementChild).toHaveAttribute('colspan', '1'); expect(screen.getByText('Alice')).toHaveAttribute('rowspan', '1'); expect(warning).toHaveBeenCalled(); warning.mockRestore();
});

it('merges header only within fixed boundary and retains attributes/events on anchor', () => {
  const callback = vi.fn(), skipped = vi.fn();
  const merged: TableColumn<Row>[] = [
    { dataIndex: 'group', title: 'Group', width: 80, fixed: 'left', onHeaderCell: () => ({ colSpan: 100 }) },
    { dataIndex: 'name', title: 'Combined', onHeaderCell: () => ({ colSpan: 2, onClick: callback, 'data-testid': 'merged-heading' }) },
    { dataIndex: 'amount', title: 'Hidden heading', onHeaderCell: () => { skipped(); return {}; } },
  ];
  render(<Table rowKey="id" data={rows} columns={merged} />);
  expect(screen.getAllByRole('columnheader')).toHaveLength(2); expect(screen.getByRole('columnheader', { name: 'Group' })).toHaveAttribute('colspan', '1');
  const head = screen.getByTestId('merged-heading'); expect(head).toHaveAttribute('scope', 'colgroup'); expect(head).toHaveAttribute('colspan', '2'); fireEvent.click(head); expect(callback).toHaveBeenCalledTimes(1); expect(skipped).toHaveBeenCalledTimes(1); expect(screen.queryByText('Hidden heading')).not.toBeInTheDocument(); expect(screen.getByText('Alice')).toBeInTheDocument();
});

it('places expanded panels after connected rowspan groups, preserving parent order and full widths', () => {
  const merged: TableColumn<Row>[] = [
    { dataIndex: 'group', title: 'Group', onCell: (_, index) => index === 0 ? { rowSpan: 2 } : {} },
    { dataIndex: 'name', title: 'Name', onCell: (_, index) => index === 1 ? { rowSpan: 3 } : {} },
    { dataIndex: 'amount', title: 'Amount' },
  ];
  const state = expansion([3, 1]); const { container } = render(<Table rowKey="id" data={rows} columns={merged} expansion={state} locale={locale} />);
  const body = Array.from(container.querySelectorAll('tbody tr')); expect(body).toHaveLength(6);
  expect(body.slice(0, 4).map(row => row.getAttribute('data-row-key'))).toEqual(['number:1', 'string:1', 'number:3', 'number:4']);
  expect(body.slice(4).map(row => row.getAttribute('data-parent-row-key'))).toEqual(['number:1', 'number:3']); expect(body[4].firstElementChild).toHaveAttribute('colspan', '4');
  expect(screen.getByRole('button', { name: 'Collapse Alice' })).toHaveAttribute('aria-controls', screen.getByRole('region', { name: 'Collapse Alice' }).id);
});

it('recomputes spans and expansion panel column count on refresh, hidden columns and header changes', () => {
  const state = expansion([1]); const merged: TableColumn<Row>[] = [{ dataIndex: 'name', onCell: () => ({ rowSpan: 100 }) }, { dataIndex: 'amount' }];
  const { container, rerender } = render(<Table rowKey="id" data={rows} columns={merged} expansion={state} />); expect(container.querySelector('tbody td[rowspan]')).toHaveAttribute('rowspan', '4');
  rerender(<Table rowKey="id" data={rows.slice(0, 1)} columns={[merged[0], { ...merged[1], hidden: true }]} expansion={state} showHeader={false} />);
  expect(container.querySelector('tbody td[rowspan]')).toHaveAttribute('rowspan', '1'); expect(container.querySelector('.pi-table__expanded-row td')).toHaveAttribute('colspan', '2'); expect(container.querySelectorAll('col')).toHaveLength(2);
});

it('preserves expanded component state when merged group boundaries move on data refresh', () => {
  const state = expansion([1]);
  const merged: TableColumn<Row>[] = [{ dataIndex: 'name', onCell: (_, index) => ({ rowSpan: index === 0 ? 100 : 1 }) }, { dataIndex: 'amount' }];
  const { rerender } = render(<Table rowKey="id" data={rows.slice(0, 2)} columns={merged} expansion={state} locale={locale} />);
  const input = screen.getByRole('textbox', { name: 'Detail Alice' }); fireEvent.change(input, { target: { value: 'Keep edit' } }); input.focus();
  rerender(<Table rowKey="id" data={rows} columns={merged} expansion={state} locale={locale} />);
  expect(screen.getByRole('textbox', { name: 'Detail Alice' })).toBe(input); expect(input).toHaveValue('Keep edit'); expect(input).toHaveFocus();
});

it('labels the native table once, keeping nested tables distinguishable', () => {
  render(<Table aria-label="People" rowKey="id" data={rows.slice(0, 1)} columns={columns} expansion={{ ...expansion([1]), render: () => <Table aria-label="Tasks" rowKey="id" data={rows.slice(0, 1)} columns={columns} /> }} />);
  expect(screen.getByRole('table', { name: 'People' })).toBeInTheDocument(); expect(screen.getByRole('table', { name: 'Tasks' })).toBeInTheDocument(); expect(screen.getAllByLabelText('Tasks')).toHaveLength(1);
});
