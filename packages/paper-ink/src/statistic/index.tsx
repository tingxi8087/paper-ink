import { forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import { BigIntDecimal, toFixed } from '@rc-component/mini-decimal';
import { useTheme } from '../config-provider/index.js';
import { themeVariables } from '../theme/variables.js';

export type StatisticSemantic = 'root' | 'header' | 'title' | 'content' | 'value' | 'prefix' | 'suffix';
export interface StatisticProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'prefix' | 'children'> {
  title?: ReactNode;
  value?: number | string;
  precision?: number;
  decimalSeparator?: string;
  groupSeparator?: string;
  formatter?: (value: number | string) => ReactNode;
  prefix?: ReactNode;
  suffix?: ReactNode;
  loading?: boolean;
  valueStyle?: CSSProperties;
  classNames?: Partial<Record<StatisticSemantic, string>>;
  styles?: Partial<Record<StatisticSemantic, CSSProperties>>;
}

export function formatStatistic(value: number | string, precision: number | undefined, decimalSeparator: string, groupSeparator: string): string {
  // Preserve large decimal strings; converting through Number would lose digits.
  const decimal = new BigIntDecimal(value);
  if (decimal.isInvalidate()) return String(value);
  let normalized = decimal.toString();
  if (precision !== undefined && Number.isFinite(precision)) normalized = toFixed(normalized, '.', Math.max(0, Math.min(100, Math.floor(precision))));
  const [integer, fraction] = normalized.split('.');
  return integer.replace(/\B(?=(\d{3})+(?!\d))/g, () => groupSeparator) + (fraction === undefined ? '' : decimalSeparator + fraction);
}

export const Statistic = forwardRef<HTMLDivElement, StatisticProps>(function Statistic({ title, value = 0, precision, decimalSeparator = '.', groupSeparator = ',', formatter, prefix, suffix, loading = false, valueStyle, classNames = {}, styles = {}, className, style, ...rest }, ref) {
  const theme = useTheme();
  const classFor = (part: StatisticSemantic) => [`pi-statistic${part === 'root' ? '' : `__${part}`}`, classNames[part]].filter(Boolean).join(' ');
  return <div {...rest} ref={ref} aria-busy={loading || undefined} className={[classFor('root'), loading && 'pi-statistic--loading', className].filter(Boolean).join(' ')} style={{ ...themeVariables(theme), ...styles.root, ...style }}>
    {title != null && <div className={classFor('header')} style={styles.header}><div className={classFor('title')} style={styles.title}>{title}</div></div>}
    {loading ? <span className="pi-statistic__placeholder" role="status" aria-label="加载中" /> : <div className={classFor('content')} style={{ ...valueStyle, ...styles.content }}>
      {prefix != null && <span className={classFor('prefix')} style={styles.prefix}>{prefix}</span>}
      <span className={classFor('value')} style={styles.value}>{formatter ? formatter(value) : formatStatistic(value, precision, decimalSeparator, groupSeparator)}</span>
      {suffix != null && <span className={classFor('suffix')} style={styles.suffix}>{suffix}</span>}
    </div>}
  </div>;
});
