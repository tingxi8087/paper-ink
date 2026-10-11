import type { CSSProperties, HTMLAttributes, ReactNode, Ref, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import type { PaginationProps } from '../pagination/index.js';

export type TableKey = string | number;
export interface TableSort { key: string; order: 'ascend' | 'descend' }
export interface TableSource<T> {
  tableData: readonly T[];
  loading: boolean;
  pageNum: number;
  pageSize: number;
  total: number;
  setPagination: (pageNum: number, pageSize: number) => void;
}
export interface TableSelection {
  checkedIds: readonly TableKey[];
  setCheckedIds: (ids: TableKey[]) => void;
  type?: 'checkbox' | 'radio';
  columnWidth?: number | string;
  hideSelectAll?: boolean;
  columnTitle?: ReactNode;
}
export interface TableLocale<T> {
  selectAll: string;
  selectRow: (record: T) => string;
  sortAscending: string;
  sortDescending: string;
  cancelSort: string;
}
export type TablePaginationOptions = Pick<PaginationProps,
  'pageSizeOptions' | 'showSizeChanger' | 'showQuickJumper' | 'showTotal' | 'hideOnSinglePage' | 'simple' | 'align'
> & { position?: 'top' | 'bottom' };
type DataAttributes = { [key: `data-${string}`]: string | number | boolean | undefined };
type RowAttributes = HTMLAttributes<HTMLTableRowElement> & DataAttributes;
type CellAttributes = Omit<TdHTMLAttributes<HTMLTableCellElement>, 'rowSpan' | 'colSpan'> & DataAttributes;
type HeaderAttributes = Omit<ThHTMLAttributes<HTMLTableCellElement>, 'rowSpan' | 'colSpan'> & DataAttributes;
interface ColumnBase<T> {
  key?: string;
  title?: ReactNode;
  width?: number | string;
  minWidth?: number;
  fixed?: 'left' | 'right';
  hidden?: boolean;
  align?: 'left' | 'center' | 'right';
  ellipsis?: boolean | { tooltip?: false | ((record: T) => ReactNode) };
  sorter?: boolean;
  className?: string;
  onCell?: (record: T, index: number) => CellAttributes;
  onHeaderCell?: (column: TableColumn<T>) => HeaderAttributes;
}
/** Top-level fields retain their value type in the render callback. */
export type TableColumn<T> = {
  [K in Extract<keyof T, string>]-?: ColumnBase<T> & {
    dataIndex: K;
    render?: (value: T[K], record: T, index: number) => ReactNode;
  }
}[Extract<keyof T, string>] | (ColumnBase<T> & {
  key: string;
  dataIndex?: undefined;
  render?: (value: undefined, record: T, index: number) => ReactNode;
});
type KeyField<T> = { [K in Extract<keyof T, string>]-?: T[K] extends TableKey ? K : never }[Extract<keyof T, string>];
interface TableBaseProps<T> extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  columns: readonly TableColumn<T>[];
  rowKey: KeyField<T> | ((record: T) => TableKey);
  empty?: ReactNode;
  size?: 'small' | 'middle' | 'large';
  bordered?: boolean;
  showHeader?: boolean;
  rowHoverable?: boolean;
  summary?: (rows: readonly T[]) => Partial<Record<string, ReactNode>>;
  locale?: Partial<TableLocale<T>>;
  sort?: TableSort | null;
  onSortChange?: (next: TableSort | null) => void;
  sortDirections?: readonly ('ascend' | 'descend' | null)[];
  selection?: TableSelection;
  rowSelectable?: (record: T) => boolean;
  scroll?: { x?: number | string; y?: number | string };
  stickyHeader?: boolean;
  scrollToFirstRowOnChange?: boolean;
  rowClassName?: string | ((record: T, index: number) => string);
  onRow?: (record: T, index: number) => RowAttributes;
  onHeaderRow?: (columns: readonly TableColumn<T>[]) => RowAttributes;
  style?: CSSProperties;
}
export type TableProps<T> = TableBaseProps<T> & (
  { data: readonly T[]; loading?: boolean; source?: never; pagination?: never }
  | { source: TableSource<T>; pagination?: false | TablePaginationOptions; data?: never; loading?: never }
);
export type TableComponent = <T extends object>(props: TableProps<T> & { ref?: Ref<HTMLDivElement> }) => ReactNode;
