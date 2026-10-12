import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { Menu } from './index.js';
it('keeps semantic navigation, group names, custom fields and forwarded ref', () => {
  const ref = createRef<HTMLElement>();
  render(<Menu ref={ref} aria-label="Main" items={[{ type: 'group', key: 'g', label: 'Tools', children: [{ key: 'one', label: 'One', href: '#one', extra: '3', className: 'custom' }] }, { key: 'd', type: 'divider' }]} />);
  expect(ref.current).toBe(screen.getByRole('navigation'));
  expect(screen.getByRole('list', { name: 'Tools' })).toBeInTheDocument();
  expect(screen.getByRole('link')).toHaveAttribute('href', '#one');
  expect(screen.getByRole('separator')).toBeInTheDocument();
});
it('does not treat a parent as a leaf and keeps ancestry selected without opening', () => {
  const click = vi.fn(); render(<Menu selectedKeys={['child']} onClick={click} items={[{ key: 'parent', label: 'Parent', children: [{ key: 'child', label: 'Child' }] }]} />);
  expect(screen.getByRole('button', { name: 'Parent' }).closest('li')).toHaveClass('pi-menu__item--ancestor');
  expect(screen.getByRole('button', { name: 'Parent' })).toHaveAttribute('aria-expanded', 'false');
  fireEvent.click(screen.getByRole('button', { name: 'Parent' })); expect(click).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Child' })).toHaveAttribute('aria-current', 'page');
});
it('skips disabled controls and supports inline home/end and parent navigation', () => {
  render(<Menu items={[{ key: 'one', label: 'One' }, { key: 'off', label: 'Off', disabled: true }, { key: 'parent', label: 'Parent', children: [{ key: 'child', label: 'Child' }] }]} />);
  const one = screen.getByRole('button', { name: 'One' }), parent = screen.getByRole('button', { name: 'Parent' });
  one.focus(); fireEvent.keyDown(one, { key: 'ArrowDown' }); expect(parent).toHaveFocus();
  fireEvent.keyDown(parent, { key: 'ArrowRight' }); fireEvent.keyDown(parent, { key: 'ArrowRight' });
  const child = screen.getByRole('button', { name: 'Child' }); expect(child).toHaveFocus();
  fireEvent.keyDown(child, { key: 'ArrowLeft' }); expect(parent).toHaveFocus();
  fireEvent.keyDown(parent, { key: 'Home' }); expect(one).toHaveFocus();
});
it('keeps default selections when defaults change and supports empty navigation', () => {
  const { rerender } = render(<Menu defaultSelectedKeys={['a']} items={[{ key: 'a', label: 'A' }, { key: 'b', label: 'B' }]} />);
  rerender(<Menu defaultSelectedKeys={['b']} items={[{ key: 'a', label: 'A' }, { key: 'b', label: 'B' }]} />);
  expect(screen.getByRole('button', { name: 'A' })).toHaveAttribute('aria-current', 'page');
  rerender(<Menu items={[]} />); expect(screen.getByRole('navigation')).toBeInTheDocument(); expect(screen.queryByRole('button')).toBeNull();
});
