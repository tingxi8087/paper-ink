import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Stack, Inline, SimpleGrid } from '../index';

describe('layout composition', () => {
  it('forwards native props/ref without introducing child wrappers', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Stack ref={ref} aria-label="form" className="custom"><Inline><button>Save</button></Inline></Stack>);
    expect(ref.current).toBe(screen.getByLabelText('form'));
    expect(ref.current).toHaveClass('custom');
    expect(screen.getByRole('button').parentElement?.parentElement).toBe(ref.current);
  });
  it('bounds numeric spans and restores outer grid context after nested grids', () => {
    render(<SimpleGrid columns={2}><SimpleGrid.Item span={8} data-testid="outer" />
      <SimpleGrid minChildWidth={200}><SimpleGrid.Item span="full" data-testid="inner" /></SimpleGrid>
      <SimpleGrid.Item span={3} data-testid="after" /></SimpleGrid>);
    expect(screen.getByTestId('outer')).toHaveStyle({ gridColumn: 'span 2' });
    expect(screen.getByTestId('inner')).toHaveStyle({ gridColumn: '1 / -1' });
    expect(screen.getByTestId('after')).toHaveStyle({ gridColumn: 'span 2' });
  });
  it('rejects numeric spanning that would create implicit columns in automatic mode', () => {
    expect(() => render(<SimpleGrid minChildWidth={200}><SimpleGrid.Item span={2} /></SimpleGrid>)).toThrow(/automatic columns/);
  });
  it('allows explicit CSS style overrides', () => {
    render(<Stack gap="small" style={{ gap: 24 }} data-testid="custom" />);
    expect(screen.getByTestId('custom')).toHaveStyle({ gap: '24px' });
  });
});
