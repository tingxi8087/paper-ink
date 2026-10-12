import { createContext, forwardRef, useCallback, useContext, useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useTheme } from '../config-provider/index.js';
import { themeVariables } from '../theme/variables.js';
import { Checkbox } from '../checkbox/index.js';
import { Radio } from '../radio/index.js';
import { Spin } from '../spin/index.js';
import { Empty } from '../empty/index.js';
import { Pagination } from '../pagination/index.js';
import { Tooltip } from '../tooltip/index.js';
import { ChevronDownIcon } from '../internal/icons.js';
import { planSpans } from './spans.js';
import type { TableColumn, TableComponent, TableKey, TableProps, TableSort } from './types.js';
export type { TableColumn, TableProps, TableSource, TableSelection, TableSort, TableLocale, TablePaginationOptions, TableKey, TableExpansion } from './types.js';

const join = (...parts: (string | undefined | false)[]) => parts.filter(Boolean).join(' ');
const defaultDirections = ['ascend', 'descend', null] as const;
const warned = new Set<string>();
function warn(message: string) {
  if ((globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !== 'production' && !warned.has(message)) { warned.add(message); console.warn(`[paper-ink Table] ${message}`); }
}
function columnKey<T>(column: TableColumn<T>, index: number) { return column.key ?? column.dataIndex ?? `__missing-${index}`; }
function minWidth<T>(column: TableColumn<T>) { return Number.isFinite(column.minWidth) ? Math.max(0, column.minWidth!) : 0; }
function reactKey(key: TableKey) { return `${typeof key}:${key}`; }
function nextSort(key: string, sort: TableSort | null | undefined, cycle: readonly ('ascend' | 'descend' | null)[]): TableSort | null {
  const current = sort?.key === key ? cycle.indexOf(sort.order) : -1;
  const order = current < 0 ? cycle.find(value => value !== null)! : cycle[(current + 1) % cycle.length];
  return order === null ? null : { key, order };
}

// One observer and font/resize subscriptions per table, not one per cell.
type RegisterMeasure = (node: HTMLElement, measure: () => void) => () => void;
const MeasureContext = createContext<RegisterMeasure>(() => () => {});
function Ellipsis({ children, tooltip, complex }: { children: ReactNode; tooltip: ReactNode; complex: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const register = useContext(MeasureContext);
  const [overflow, setOverflow] = useState(false);
  const [interactive, setInteractive] = useState(false);
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    return register(node, () => {
      const blocked = complex && Boolean(node.querySelector('button,input,select,textarea,a[href],[tabindex],[contenteditable="true"],[role="button"]'));
      setInteractive(blocked);
      setOverflow(!blocked && node.scrollWidth > node.clientWidth + 1);
    });
  }, [register, children, complex]);
  const enabled = overflow && !interactive && tooltip != null && tooltip !== false && tooltip !== '';
  return <div className="pi-table__truncate"><Tooltip title={enabled ? tooltip : null} trigger={['hover', 'focus']}>
    <div ref={ref} className={interactive ? 'pi-table__cell-content' : 'pi-table__ellipsis'} tabIndex={enabled ? 0 : undefined}>{children}</div>
  </Tooltip></div>;
}

function ExpandedPanel({ id, toggle, buttons, rowKey, children }: { id: string; toggle: string; buttons: { readonly current: Map<TableKey, HTMLButtonElement> }; rowKey: TableKey; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    return () => {
      if (!node.contains(node.ownerDocument.activeElement)) return;
      queueMicrotask(() => {
        // StrictMode's simulated cleanup keeps the node mounted. Real removal
        // restores focus only if it has fallen to the document, never stealing
        // focus from another control deliberately selected by the caller.
        const active = node.ownerDocument.activeElement;
        const button = buttons.current.get(rowKey);
        if (!node.isConnected && active === node.ownerDocument.body && button?.isConnected && !button.disabled) button.focus({ preventScroll: true });
      });
    };
  }, [buttons, rowKey]);
  return <div id={id} ref={ref} role="region" aria-labelledby={toggle} className="pi-table__expanded-content">{children}</div>;
}

const TableRoot = forwardRef(function Table<T extends object>(props: TableProps<T>, ref: React.ForwardedRef<HTMLDivElement>) {
  const { columns, rowKey, source, data, loading: dataLoading, pagination, empty, size = 'middle', bordered = false,
    showHeader = true, rowHoverable = true, summary, locale, sort, onSortChange, sortDirections = defaultDirections,
    selection, expansion, rowSelectable, scroll, stickyHeader = scroll?.y !== undefined, scrollToFirstRowOnChange = true,
    rowClassName, onRow, onHeaderRow, className, style, 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledBy, 'aria-describedby': ariaDescribedBy, ...rest } = props;
  const theme = useTheme();
  const rows = source?.tableData ?? data ?? [];
  const loading = source?.loading ?? dataLoading ?? false;
  const visible = columns.filter(column => !column.hidden);
  const keys = visible.map(columnKey);
  const rowKeys = rows.map(record => typeof rowKey === 'function' ? rowKey(record) : record[rowKey] as TableKey);
  const selected = new Set(selection?.checkedIds ?? []);
  const selectable = rows.map((row, index) => ({ row, key: rowKeys[index], allowed: rowSelectable?.(row) !== false }));
  const eligible = selectable.filter(item => item.allowed);
  const allChecked = eligible.length > 0 && eligible.every(item => selected.has(item.key));
  const someChecked = eligible.some(item => selected.has(item.key));
  const leftFixed = visible.some(column => column.fixed === 'left');
  const selectionFixed = Boolean(selection && leftFixed);
  const expansionFixed = Boolean(expansion && leftFixed);
  const expandWidth = expansion?.columnWidth ?? 40;
  const utilityCount = (selection ? 1 : 0) + (expansion ? 1 : 0);
  const expanded = new Set(expansion?.expandedIds ?? []);
  const expansionButtons = useRef(new Map<TableKey, HTMLButtonElement>());
  const expansionPrefix = useId();
  const detailId = (key: TableKey) => `${expansionPrefix}-detail-${encodeURIComponent(reactKey(key))}`;
  const toggleId = (key: TableKey) => `${expansionPrefix}-toggle-${encodeURIComponent(reactKey(key))}`;
  const selectWidth = selection?.columnWidth ?? 40;
  const cycleValid = sortDirections.length > 0 && new Set(sortDirections).size === sortDirections.length &&
    sortDirections.every(value => value === null || value === 'ascend' || value === 'descend') && sortDirections.some(value => value !== null);
  const cycle = cycleValid ? sortDirections : defaultDirections;
  const activeSort = sort && visible.some((column, index) => keys[index] === sort.key && column.sorter) ? sort : null;
  const labels = { expandRow: (_record: T) => '展开详情', collapseRow: (_record: T) => '收起详情', selectAll: '选择当前页全部可选行', selectRow: (_record: T) => '选择此行', sortAscending: '升序', sortDescending: '降序', cancelSort: '取消排序', ...locale };
  const radioName = useId();
  const viewport = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const measures = useRef(new Map<HTMLElement, () => void>());
  const observer = useRef<ResizeObserver | null>(null);
  const [widths, setWidths] = useState<number[]>([]);
  const [constrainedWidths, setConstrainedWidths] = useState<Record<string, number>>({});
  const layoutMeasure = useRef(() => {});
  layoutMeasure.current = () => {
    // Native fixed-layout tables ignore min-width on cells, and max(%, px) on
    // col is not interoperable. Resolve CSS widths against the requested table
    // width, then clamp them; using actual expanded width would create feedback
    // when percentage columns plus minimum widths exceed the container.
    const constrained = visible.filter(column => typeof column.width === 'string' && column.minWidth !== undefined);
    if (viewport.current && constrained.length) {
      const probe = document.createElement('div');
      probe.style.cssText = `position:absolute;visibility:hidden;pointer-events:none;height:0;overflow:hidden;left:0;top:0;width:${viewport.current.clientWidth}px`;
      const base = document.createElement('div');
      base.style.width = typeof scroll?.x === 'number' ? `${scroll.x}px` : scroll?.x ?? '100%';
      const cell = document.createElement('div');
      base.appendChild(cell); probe.appendChild(base); viewport.current.appendChild(probe);
      const resolved: Record<string, number> = {};
      for (const column of constrained) {
        cell.style.width = ''; cell.style.width = column.width as string;
        resolved[columnKey(column, visible.indexOf(column))] = Math.max(minWidth(column), cell.getBoundingClientRect().width);
      }
      probe.remove();
      setConstrainedWidths(previous => Object.keys(previous).length === Object.keys(resolved).length && Object.keys(resolved).every(key => Math.abs(previous[key] - resolved[key]) < .1) ? previous : resolved);
    }
    const cols = tableRef.current?.querySelectorAll(':scope > colgroup > col');
    if (!cols?.length) return;
    const measured = Array.from(cols).map(col => col.getBoundingClientRect().width);
    if (measured.some(value => value > 0)) setWidths(previous => previous.length === measured.length && previous.every((value, index) => Math.abs(value - measured[index]) < .1) ? previous : measured);
  };
  const register = useCallback<RegisterMeasure>((node, measure) => {
    measures.current.set(node, measure); observer.current?.observe(node); measure();
    return () => { measures.current.delete(node); observer.current?.unobserve(node); };
  }, []);
  useLayoutEffect(() => { layoutMeasure.current(); for (const measure of measures.current.values()) measure(); });
  useEffect(() => {
    let alive = true;
    const update = () => { if (!alive) return; layoutMeasure.current(); for (const measure of measures.current.values()) measure(); };
    if (typeof ResizeObserver !== 'undefined') {
      observer.current = new ResizeObserver(update);
      if (viewport.current) observer.current.observe(viewport.current);
      if (tableRef.current) observer.current.observe(tableRef.current);
      for (const node of measures.current.keys()) observer.current.observe(node);
    }
    window.addEventListener('resize', update);
    const fonts = document.fonts;
    fonts?.addEventListener('loadingdone', update);
    void fonts?.ready.then(update);
    update();
    return () => { alive = false; observer.current?.disconnect(); observer.current = null; window.removeEventListener('resize', update); fonts?.removeEventListener('loadingdone', update); };
  }, []);
  const previousPage = useRef([source?.pageNum, source?.pageSize]);
  useEffect(() => {
    const previous = previousPage.current;
    const next = [source?.pageNum, source?.pageSize];
    if (source && previous[0] !== undefined && scrollToFirstRowOnChange && (previous[0] !== next[0] || previous[1] !== next[1]) && viewport.current) viewport.current.scrollTop = 0;
    previousPage.current = next;
  }, [source?.pageNum, source?.pageSize, scrollToFirstRowOnChange]);
  useEffect(() => {
    const seen = new Set<string>();
    columns.forEach((column, index) => {
      if (column.key === undefined && column.dataIndex === undefined) warn('Every column needs a key or dataIndex.');
      const key = columnKey(column, index); if (seen.has(key)) warn(`Duplicate column key: ${key}`); seen.add(key);
    });
    const seenRows = new Set<TableKey>();
    rowKeys.forEach(key => { if (typeof key !== 'string' && typeof key !== 'number') warn('rowKey must return a string or number.'); if (seenRows.has(key)) warn(`Duplicate row key: ${reactKey(key)}`); seenRows.add(key); });
    if (!cycleValid) warn('sortDirections must be a nonempty unique cycle containing ascend or descend.');
    if (sort && !activeSort) warn(`Sort column is absent or not sortable: ${sort.key}`);
    let section = 0;
    visible.forEach(column => {
      const next = column.fixed === 'left' ? 0 : column.fixed === 'right' ? 2 : 1;
      if (next < section) warn('Left fixed columns must precede normal columns, and right fixed columns must follow them.');
      section = Math.max(section, next);
      if (column.fixed && (typeof column.width !== 'number' || !Number.isFinite(column.width) || column.width <= 0 || column.width < (column.minWidth ?? 0))) warn('Fixed columns require a positive numeric width no smaller than minWidth.');
    });
    if (selectionFixed && typeof selectWidth !== 'number') warn('A fixed selection column requires a numeric columnWidth.');
    if (expansionFixed && typeof expandWidth !== 'number') warn('A fixed expansion column requires a numeric columnWidth.');
  });

  const effectiveWidths = visible.map(column => typeof column.width === 'number' ? Math.max(column.width, minWidth(column)) : typeof column.width === 'string' && column.minWidth !== undefined ? constrainedWidths[columnKey(column, visible.indexOf(column))] ?? minWidth(column) : column.width ?? (column.minWidth === undefined ? undefined : minWidth(column)));
  const cellWidths = [...(expansion ? [expandWidth] : []), ...(selection ? [selectWidth] : []), ...effectiveWidths];
  const minTableWidth = visible.reduce((sum, column, index) => sum + (typeof effectiveWidths[index] === 'number' ? effectiveWidths[index] as number : minWidth(column)), (typeof selectWidth === 'number' && selection ? selectWidth : 0) + (typeof expandWidth === 'number' && expansion ? expandWidth : 0));
  const actualWidths = cellWidths.map((width, index) => widths[index] || (typeof width === 'number' ? width : 0));
  function fixedStyle(index: number, side?: 'left' | 'right'): CSSProperties {
    if (!side) return {};
    const offset = side === 'left' ? actualWidths.slice(0, index).reduce((a, b) => a + b, 0) : actualWidths.slice(index + 1).reduce((a, b) => a + b, 0);
    return { position: 'sticky', [side]: offset, zIndex: 2 };
  }
  function columnStyle(column: TableColumn<T>, index: number, span = 1): CSSProperties {
    return { textAlign: column.align ?? 'left', width: effectiveWidths[index], minWidth: column.minWidth, ...fixedStyle(index + utilityCount + (column.fixed === 'right' ? span - 1 : 0), column.fixed) };
  }
  function changeAll(checked: boolean) {
    if (!selection) return;
    const next = new Set(selection.checkedIds);
    for (const { key } of eligible) { if (checked) next.add(key); else next.delete(key); }
    selection.setCheckedIds([...next]);
  }
  function changeRow(key: TableKey, checked: boolean) {
    if (!selection) return;
    if (selection.type === 'radio') { selection.setCheckedIds([key]); return; }
    const next = new Set(selection.checkedIds); if (checked) next.add(key); else next.delete(key); selection.setCheckedIds([...next]);
  }
  const bodyAttrs = rows.map((record, rowIndex) => visible.map(column => column.onCell?.(record, rowIndex) ?? {}));
  const bodyPlan = planSpans(bodyAttrs, visible.map(column => column.fixed), warn);
  const headAttrs = showHeader ? visible.map(column => column.onHeaderCell?.(column) ?? {}) : [];
  const headPlan = planSpans([headAttrs], visible.map(column => column.fixed), warn).cells[0];
  function toggleExpanded(key: TableKey, isExpanded: boolean) {
    if (!expansion) return;
    const next = new Set(expansion.expandedIds);
    if (isExpanded) next.delete(key); else next.add(key);
    expansion.setExpandedIds([...next]);
  }
  const summaryValues = summary?.(rows);
  const pageOptions = pagination === false ? null : pagination ?? {};
  const { position: _position, ...paginationProps } = pageOptions ?? {};
  const pager = source && pageOptions && <div className="pi-table__pagination"><Pagination {...paginationProps} current={source.pageNum} pageSize={source.pageSize} total={source.total} onChange={source.setPagination} /></div>;
  const selectionStyle = { width: selectWidth, ...fixedStyle(expansion ? 1 : 0, selectionFixed ? 'left' : undefined) };
  const expansionStyle = { width: expandWidth, ...fixedStyle(0, expansionFixed ? 'left' : undefined) };
  const headerProps = showHeader ? onHeaderRow?.(visible) ?? {} : {};
  return <div {...rest} ref={ref} className={join('pi-table', `pi-table--${size}`, bordered && 'pi-table--bordered', rowHoverable && 'pi-table--hoverable', stickyHeader && 'pi-table--sticky-header', className)} style={{ ...themeVariables(theme), ...style }} aria-busy={loading}>
    {pageOptions?.position === 'top' && pager}
    <MeasureContext.Provider value={register}>
      <div className="pi-table__viewport" ref={viewport} style={{ maxHeight: scroll?.y, overscrollBehaviorY: scroll?.y === undefined ? undefined : 'none' }}>
        <table ref={tableRef} aria-label={ariaLabel} aria-labelledby={ariaLabelledBy} aria-describedby={ariaDescribedBy} style={{ width: scroll?.x ?? '100%', minWidth: minTableWidth || undefined }}>
          <colgroup>{expansion && <col style={{ width: expandWidth }} />}{selection && <col style={{ width: selectWidth }} />}{visible.map((column, index) => <col key={keys[index]} style={{ width: effectiveWidths[index], minWidth: column.minWidth }} />)}</colgroup>
          {showHeader && <thead><tr {...headerProps}>
            {expansion && <th scope="col" aria-label="展开详情" className={join('pi-table__expansion', expansionFixed && 'pi-table__fixed')} style={{ ...expansionStyle, zIndex: expansionFixed ? 4 : undefined }} />}
            {selection && <th scope="col" className={join('pi-table__selection', selectionFixed && 'pi-table__fixed')} style={{ ...selectionStyle, zIndex: selectionFixed ? 4 : undefined }}>
              {selection.type !== 'radio' && !selection.hideSelectAll && <span onClick={event => event.stopPropagation()}><Checkbox aria-label={labels.selectAll} checked={allChecked} indeterminate={someChecked && !allChecked} disabled={!eligible.length || loading} onChange={event => changeAll(event.target.checked)} /></span>}
              {selection.columnTitle}
            </th>}
            {visible.map((column, index) => {
              const attrs = headAttrs[index];
              const span = headPlan[index];
              if (!span) return null;
              const next = nextSort(keys[index], activeSort, cycle);
              const action = next === null ? labels.cancelSort : next.order === 'ascend' ? labels.sortAscending : labels.sortDescending;
              const order = activeSort?.key === keys[index] ? activeSort.order : null;
              return <th {...attrs} key={keys[index]} colSpan={span.colSpan} rowSpan={undefined} scope={span.colSpan > 1 ? 'colgroup' : 'col'} className={join(column.fixed && 'pi-table__fixed', column.sorter && 'pi-table__sortable', attrs.className)} style={{ ...attrs.style, ...columnStyle(column, index, span.colSpan), width: span.colSpan > 1 ? undefined : effectiveWidths[index], zIndex: column.fixed ? 4 : undefined }} aria-sort={column.sorter ? order === 'ascend' ? 'ascending' : order === 'descend' ? 'descending' : 'none' : undefined} onClick={event => { attrs.onClick?.(event); if (!loading && !event.defaultPrevented && column.sorter && (event.target as HTMLElement).closest('.pi-table__sort')) onSortChange?.(next); }}>
                {column.sorter ? <button type="button" className="pi-table__sort" aria-label={`${typeof column.title === 'string' || typeof column.title === 'number' ? `${column.title}：` : ''}${action}`} disabled={loading}>
                  <span>{column.title}</span><span className="pi-table__sort-icons" aria-hidden="true"><ChevronDownIcon className={order === 'ascend' ? 'pi-table__sort-active' : undefined} style={{ transform: 'rotate(180deg)' }} /><ChevronDownIcon className={order === 'descend' ? 'pi-table__sort-active' : undefined} /></span>
                </button> : column.title}
              </th>;
            })}
          </tr></thead>}
          <tbody>{rows.flatMap((record, rowIndex) => {
            const attrs = onRow?.(record, rowIndex) ?? {};
            const key = rowKeys[rowIndex];
            const checked = selected.has(key);
            return [<tr {...attrs} key={`data-${reactKey(key)}`} data-row-key={reactKey(key)} className={join(selection && checked && 'pi-table__row--selected', typeof rowClassName === 'function' ? rowClassName(record, rowIndex) : rowClassName, attrs.className)}>
              {expansion && <td className={join('pi-table__expansion', expansionFixed && 'pi-table__fixed')} style={expansionStyle}>
                {expansion.rowExpandable?.(record) !== false && <button type="button" id={toggleId(key)} ref={button => { if (button) expansionButtons.current.set(key, button); else expansionButtons.current.delete(key); }} className="pi-table__expand" aria-label={expanded.has(key) ? labels.collapseRow(record) : labels.expandRow(record)} aria-expanded={expanded.has(key)} aria-controls={expanded.has(key) ? detailId(key) : undefined} disabled={loading} onClick={event => { event.stopPropagation(); toggleExpanded(key, expanded.has(key)); }}>
                  {expansion.expandIcon ? expansion.expandIcon(expanded.has(key), record) : <ChevronDownIcon style={{ transform: expanded.has(key) ? undefined : 'rotate(-90deg)' }} />}
                </button>}
              </td>}
              {selection && <td className={join('pi-table__selection', selectionFixed && 'pi-table__fixed')} style={selectionStyle}>
                <span onClick={event => event.stopPropagation()}>{selection.type === 'radio' ? <Radio name={radioName} aria-label={labels.selectRow(record)} value={key} checked={checked} disabled={!selectable[rowIndex].allowed || loading} onChange={() => changeRow(key, true)} /> : <Checkbox aria-label={labels.selectRow(record)} checked={checked} disabled={!selectable[rowIndex].allowed || loading} onChange={event => changeRow(key, event.target.checked)} />}</span>
              </td>}
              {visible.map((column, index) => {
                const attrs = bodyAttrs[rowIndex][index];
                const span = bodyPlan.cells[rowIndex][index];
                if (!span) return null;
                const value = column.dataIndex === undefined ? undefined : record[column.dataIndex];
                const content = column.render ? (column.render as (value: unknown, record: T, index: number) => ReactNode)(value, record, rowIndex) : typeof value === 'string' || typeof value === 'number' ? value : null;
                const text = typeof content === 'string' || typeof content === 'number';
                const custom = typeof column.ellipsis === 'object' ? column.ellipsis.tooltip : undefined;
                const tooltip = attrs.title !== undefined || custom === false ? null : typeof custom === 'function' ? custom(record) : text ? content : null;
                const truncate = Boolean(column.ellipsis) && (text || typeof custom === 'function');
                return <td {...attrs} key={keys[index]} rowSpan={span.rowSpan} colSpan={span.colSpan} className={join(column.className, column.fixed && 'pi-table__fixed', attrs.className)} style={{ ...attrs.style, ...columnStyle(column, index, span.colSpan), width: span.colSpan > 1 ? undefined : effectiveWidths[index] }}>{truncate ? <Ellipsis tooltip={tooltip} complex={!text}>{content}</Ellipsis> : content}</td>;
              })}
            </tr>, ...(expansion ? bodyPlan.groups.get(rowIndex)?.map(parentIndex => {
              const parent = rows[parentIndex], parentKey = rowKeys[parentIndex];
              if (!expanded.has(parentKey) || expansion.rowExpandable?.(parent) === false) return null;
              return <tr key={`detail-${reactKey(parentKey)}`} className="pi-table__expanded-row" data-parent-row-key={reactKey(parentKey)}><td colSpan={Math.max(1, visible.length + utilityCount)}><ExpandedPanel id={detailId(parentKey)} toggle={toggleId(parentKey)} buttons={expansionButtons} rowKey={parentKey}>{expansion.render(parent, parentIndex)}</ExpandedPanel></td></tr>;
            }) ?? [] : [])];
          })}{!rows.length && <tr className="pi-table__placeholder"><td colSpan={Math.max(1, visible.length + utilityCount)}>{loading ? <span className="pi-table__initial-loading" /> : empty === undefined ? <Empty /> : empty}</td></tr>}</tbody>
          {summaryValues && <tfoot><tr>{expansion && <td className={join('pi-table__expansion', expansionFixed && 'pi-table__fixed')} style={expansionStyle} />}{selection && <td className={join('pi-table__selection', selectionFixed && 'pi-table__fixed')} style={selectionStyle} />}{visible.map((column, index) => <td key={keys[index]} className={join(column.fixed && 'pi-table__fixed')} style={columnStyle(column, index)}>{summaryValues[keys[index]]}</td>)}</tr></tfoot>}
        </table>
      </div>
    </MeasureContext.Provider>
    {loading && <div className="pi-table__loading"><Spin /></div>}
    {pageOptions?.position !== 'top' && pager}
  </div>;
});
export const Table = TableRoot as TableComponent;
