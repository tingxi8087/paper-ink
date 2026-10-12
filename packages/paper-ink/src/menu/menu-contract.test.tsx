import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Menu } from './index.js';
import { Modal } from '../modal/index.js';
const tree = [
  { key: 'parent', label: 'Parent', children: [
    { key: 'child', label: 'Child', children: [{ key: 'leaf', label: 'Leaf' }] },
    { key: 'group', type: 'group' as const, label: 'Group', children: [{ key: 'group-leaf', label: 'Grouped' }] },
  ] },
  { key: 'other', label: 'Other', children: [{ key: 'other-leaf', label: 'Other leaf' }] },
];
describe('Menu public behavior contract', () => {
  it('explicit undefined remains controlled and requests are not stored internally', () => {
    const select = vi.fn(), open = vi.fn();
    render(<Menu items={tree} selectedKeys={undefined} openKeys={undefined} onSelect={select} onOpenChange={open} />);
    fireEvent.click(screen.getByRole('button', { name: 'Parent' }));
    expect(open).toHaveBeenLastCalledWith(['parent']);
    expect(screen.getByRole('button', { name: 'Parent' })).toHaveAttribute('aria-expanded', 'false');
  });
  it('same selected leaf activates once without repeating selection, with group excluded from keyPath', () => {
    const click = vi.fn(), select = vi.fn();
    render(<Menu items={tree} defaultOpenKeys={['parent']} onClick={click} onSelect={select} />);
    fireEvent.click(screen.getByRole('button', { name: 'Grouped' }));
    fireEvent.click(screen.getByRole('button', { name: 'Grouped' }));
    expect(click).toHaveBeenCalledTimes(2); expect(select).toHaveBeenCalledTimes(1);
    expect(click.mock.calls[0][0].keyPath).toEqual(['group-leaf', 'parent']);
    expect(select.mock.calls[0][0].selectedKeys).toEqual(['group-leaf']);
  });
  it('onClick cancellation prevents default selection and runs before onSelect', () => {
    const events: string[] = [];
    render(<Menu items={[{ key: 'one', label: 'One', href: '#one' }]} onClick={info => { events.push('click'); info.domEvent.preventDefault(); }} onSelect={() => events.push('select')} />);
    const link = screen.getByRole('link', { name: 'One' });
    expect(fireEvent.click(link)).toBe(false);
    expect(events).toEqual(['click']); expect(link).not.toHaveAttribute('aria-current');
  });
  it.each([{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { altKey: true }])('modified link activation preserves current selection: %j', modifiers => {
    const select = vi.fn(), click = vi.fn();
    render(<Menu items={[{ key: 'one', label: 'One', href: '#one' }]} onClick={click} onSelect={select} />);
    fireEvent.click(screen.getByRole('link'), modifiers);
    expect(click).toHaveBeenCalledOnce(); expect(select).not.toHaveBeenCalled();
    expect(screen.getByRole('link')).not.toHaveAttribute('aria-current');
  });
  it('blank targets and middle clicks do not change current navigation', () => {
    const select = vi.fn(), click = vi.fn();
    render(<Menu items={[{ key: 'one', label: 'One', href: '#one', target: '_blank' }]} onClick={click} onSelect={select} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
    fireEvent.click(link); fireEvent(link, new MouseEvent('auxclick', { button: 1, bubbles: true }));
    expect(click).toHaveBeenCalledOnce(); expect(select).not.toHaveBeenCalled();
  });
  it('disabled parents disable the entire expanded subtree including links', () => {
    const select = vi.fn(), click = vi.fn(), open = vi.fn();
    render(<Menu items={[{ key: 'parent', label: 'Disabled', disabled: true, children: [{ key: 'leaf', label: 'Disabled link', href: '#bad' }] }]} defaultOpenKeys={['parent']} onClick={click} onSelect={select} onOpenChange={open} />);
    fireEvent.click(screen.getByRole('button', { name: 'Disabled' }));
    const link = screen.getByText('Disabled link').closest('a')!;
    expect(link).toHaveAttribute('aria-disabled', 'true'); expect(link).toHaveAttribute('tabindex', '-1');
    expect(fireEvent.click(link)).toBe(false);
    expect(select).not.toHaveBeenCalled(); expect(click).not.toHaveBeenCalled(); expect(open).not.toHaveBeenCalled();
  });
  it('selected props and data changes do not auto-open ancestors or emit user callbacks', () => {
    const select = vi.fn(), open = vi.fn();
    const view = render(<Menu items={tree} selectedKeys={['leaf']} onSelect={select} onOpenChange={open} />);
    expect(screen.getByRole('button', { name: 'Parent' })).toHaveAttribute('aria-expanded', 'false');
    view.rerender(<Menu items={tree.slice(1)} selectedKeys={['leaf']} onSelect={select} onOpenChange={open} />);
    expect(select).not.toHaveBeenCalled(); expect(open).not.toHaveBeenCalled();
  });
  it('accordion replaces a sibling but preserves its hidden nested expansion', () => {
    const open = vi.fn();
    render(<Menu items={tree} accordion defaultOpenKeys={['parent', 'child']} onOpenChange={open} />);
    fireEvent.click(screen.getByRole('button', { name: 'Other' }));
    expect(open).toHaveBeenCalledOnce(); expect(open.mock.calls[0][0]).toEqual(expect.arrayContaining(['child', 'other']));
    expect(open.mock.calls[0][0]).not.toContain('parent');
    fireEvent.click(screen.getByRole('button', { name: 'Parent' }));
    expect(screen.getByRole('button', { name: 'Child' })).toHaveAttribute('aria-expanded', 'true');
  });
  it('collapsing a subtree returns its focused child to the ancestor before hiding', () => {
    const view = render(<Menu items={tree} openKeys={['parent', 'child']} />);
    screen.getByRole('button', { name: 'Leaf' }).focus();
    view.rerender(<Menu items={tree} openKeys={[]} />);
    expect(screen.getByRole('button', { name: 'Parent' })).toHaveFocus();
  });
  it('reordering stable keys preserves focused identity and removing a focused node leaves visible focus', () => {
    const items = [{ key: 'one', label: 'One' }, { key: 'two', label: 'Two' }];
    const view = render(<Menu items={items} />);
    screen.getByRole('button', { name: 'Two' }).focus();
    view.rerender(<Menu items={[...items].reverse()} />);
    expect(screen.getByRole('button', { name: 'Two' })).toHaveFocus();
    view.rerender(<Menu items={items.slice(0, 1)} />);
    expect(screen.getByRole('button', { name: 'One' })).toHaveFocus();
  });
  it('ordinary horizontal selection requests closure but keeps nested records', async () => {
    const open = vi.fn(), select = vi.fn();
    render(<Menu items={tree} mode="horizontal" openKeys={['parent', 'child']} onOpenChange={open} onSelect={select} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Leaf' }));
    expect(open).toHaveBeenCalledOnce(); expect(open).toHaveBeenCalledWith(['child']);
    expect(select).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: 'Parent' })).toHaveAttribute('aria-expanded', 'true');
  });
  it('selectable=false retains controlled highlighting without producing selection events', () => {
    const select = vi.fn(), click = vi.fn();
    render(<Menu items={[{ key: 'one', label: 'One' }, { key: 'two', label: 'Two' }]} selectable={false} selectedKeys={['one']} onSelect={select} onClick={click} />);
    expect(screen.getByRole('button', { name: 'One' })).toHaveAttribute('aria-current', 'page');
    fireEvent.click(screen.getByRole('button', { name: 'Two' })); expect(click).toHaveBeenCalledOnce(); expect(select).not.toHaveBeenCalled();
  });
});

it('explicit undefined selection produces repeated change requests without committing state', () => {
  const select = vi.fn(); render(<Menu items={[{ key: 'one', label: 'One' }]} selectedKeys={undefined} defaultSelectedKeys={['one']} onSelect={select} />);
  const item = screen.getByRole('button', { name: 'One' });
  fireEvent.click(item); fireEvent.click(item);
  expect(select).toHaveBeenCalledTimes(2); expect(item).not.toHaveAttribute('aria-current');
});

it('controlled popup Escape requests closure without returning focus before confirmation', async () => {
  const open = vi.fn(); const view = render(<Menu items={tree} mode="horizontal" openKeys={['parent', 'child']} onOpenChange={open} />);
  const leaf = await screen.findByRole('button', { name: 'Leaf' }); leaf.focus();
  fireEvent.keyDown(leaf, { key: 'Escape' });
  expect(open).toHaveBeenLastCalledWith(['child']); expect(leaf).toHaveFocus();
  view.rerender(<Menu items={tree} mode="horizontal" openKeys={['child']} onOpenChange={open} />);
  expect(screen.getByRole('button', { name: 'Parent' })).toHaveFocus();
});


it('nested popup Escape closes navigation without cancelling its enclosing Modal', async () => {
  const cancel = vi.fn(); render(<Modal open title="Navigation modal" onCancel={cancel}><Menu items={tree} mode="horizontal" defaultOpenKeys={['parent']} /></Modal>);
  const child = await screen.findByRole('button', { name: 'Child' });
  child.focus(); fireEvent.keyDown(child, { key: 'Escape' });
  expect(cancel).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Parent' })).toHaveAttribute('aria-expanded', 'false');
});

it('ArrowLeft at a root popup child closes and returns to its triggering parent', async () => {
  render(<Menu items={tree} mode="horizontal" defaultOpenKeys={['parent']} />);
  const grouped = await screen.findByRole('button', { name: 'Grouped' }); grouped.focus();
  fireEvent.keyDown(grouped, { key: 'ArrowLeft' });
  expect(screen.getByRole('button', { name: 'Parent' })).toHaveFocus();
  expect(screen.getByRole('button', { name: 'Parent' })).toHaveAttribute('aria-expanded', 'false');
});
