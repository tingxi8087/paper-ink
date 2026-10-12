export interface Span { rowSpan: number; colSpan: number }
function normalize(value: number | undefined, report: (message: string) => void) {
  if (value === undefined) return 1;
  if (Number.isFinite(value) && Number.isInteger(value) && value >= 0) return value;
  report('Cell spans must be nonnegative finite integers; invalid spans fall back to 1.');
  return 1;
}
/** Utility columns stay outside this grid. Covered cells are skipped automatically. */
export function planSpans(
  attributes: readonly (readonly { rowSpan?: number; colSpan?: number }[])[],
  fixed: readonly ('left' | 'right' | undefined)[],
  report: (message: string) => void,
) {
  const height = attributes.length;
  const width = fixed.length;
  const occupied = Array.from({ length: height }, () => Array<boolean>(width).fill(false));
  const rowEnds = Array.from({ length: height }, (_, index) => index);
  const cells = attributes.map((row, rowIndex) => row.map((attrs, columnIndex): Span | null => {
    if (occupied[rowIndex][columnIndex]) return null;
    let rowSpan = normalize(attrs.rowSpan, report);
    let colSpan = normalize(attrs.colSpan, report);
    if (rowSpan === 0 || colSpan === 0) return null;
    rowSpan = Math.min(rowSpan, height - rowIndex);
    colSpan = Math.min(colSpan, width - columnIndex);
    for (let offset = 1; offset < colSpan; offset++) {
      if (fixed[columnIndex + offset] !== fixed[columnIndex] || occupied[rowIndex][columnIndex + offset]) { colSpan = offset; break; }
    }
    for (let offset = 1; offset < rowSpan; offset++) {
      if (occupied[rowIndex + offset].slice(columnIndex, columnIndex + colSpan).some(Boolean)) { rowSpan = offset; break; }
    }
    for (let row = rowIndex; row < rowIndex + rowSpan; row++) for (let column = columnIndex; column < columnIndex + colSpan; column++) occupied[row][column] = true;
    rowEnds[rowIndex] = Math.max(rowEnds[rowIndex], rowIndex + rowSpan - 1);
    return { rowSpan, colSpan };
  }));
  // Detail rows belong after the connected rowspan group, never inside a native
  // rowspan rectangle. Overlapping intervals can join several initial groups.
  const groups = new Map<number, number[]>();
  for (let start = 0; start < height;) {
    let end = rowEnds[start];
    for (let row = start; row <= end; row++) end = Math.max(end, rowEnds[row]);
    groups.set(end, Array.from({ length: end - start + 1 }, (_, index) => start + index));
    start = end + 1;
  }
  return { cells, groups };
}
