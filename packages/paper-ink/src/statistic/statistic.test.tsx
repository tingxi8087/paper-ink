import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { Statistic, formatStatistic } from './index';

it('formats exact large numbers and rounds decimals without binary precision loss', () => {
  expect(formatStatistic('12345678901234567890.125', 2, '.', ',')).toBe('12,345,678,901,234,567,890.13');
  expect(formatStatistic('-1234.005', 2, ',', ' ')).toBe('-1 234,01');
  expect(formatStatistic('9.999', 2, '.', ',')).toBe('10.00');
  expect(formatStatistic(1e-7, undefined, '.', ',')).toBe('0.0000001');
  expect(formatStatistic('12.3', 4, '.', '')).toBe('12.3000');
  expect(formatStatistic('unavailable', 2, '.', ',')).toBe('unavailable');
  expect(formatStatistic(Infinity, 2, '.', ',')).toBe('Infinity');
  expect(formatStatistic(10, -1, '.', ',')).toBe('10');
});
it('renders formatter nodes, title, adornments, styles and the DOM ref', () => {
  const formatter = vi.fn(value => <strong>{value} 人</strong>), ref = createRef<HTMLDivElement>();
  render(<Statistic ref={ref} data-testid="stat" title="访问量" value={1200} formatter={formatter} prefix="约" suffix="今日" className="custom" classNames={{value:'value'}} styles={{content:{color:'red'}}} />);
  expect(formatter).toHaveBeenCalledWith(1200);
  expect(screen.getByText('1200 人')).toBeVisible();
  expect(ref.current).toBe(screen.getByTestId('stat'));
  expect(ref.current).toHaveClass('custom');
  expect(ref.current!.querySelector('.value')).toBeTruthy();
});
it('loading conceals the stale value and renders the replacement after completion', () => {
  const view = render(<Statistic title="余额" value={123} loading />);
  expect(screen.getByRole('status')).toHaveAccessibleName('加载中');
  expect(screen.queryByText('123')).toBeNull();
  view.rerender(<Statistic title="余额" value={456} />);
  expect(screen.getByText('456')).toBeVisible();
  expect(screen.queryByRole('status')).toBeNull();
});
