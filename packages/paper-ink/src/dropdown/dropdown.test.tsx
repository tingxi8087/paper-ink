import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Dropdown } from './index.js';
describe('Dropdown', () => {
  it('opens from keyboard, skips disabled items, selects and returns focus', () => {
    const click = vi.fn(), change = vi.fn();
    render(<Dropdown trigger={['click']} onOpenChange={change} menu={{ items: [{ key:'a',label:'甲' }, { key:'b',label:'乙',disabled:true }, { key:'c',label:'丙' }], onClick:click }}><button>操作</button></Dropdown>);
    fireEvent.keyDown(screen.getByText('操作'), { key:'ArrowDown' }); expect(screen.getByRole('menuitem', { name:'甲' })).toHaveFocus();
    fireEvent.keyDown(screen.getByRole('menuitem', { name:'甲' }), { key:'ArrowDown' }); expect(screen.getByRole('menuitem', { name:'丙' })).toHaveFocus();
    fireEvent.click(screen.getByRole('menuitem', { name:'丙' })); expect(click.mock.calls[0][0].key).toBe('c'); expect(change).toHaveBeenLastCalledWith(false, { source:'menu' }); expect(screen.queryByRole('menu')).not.toBeInTheDocument(); expect(screen.getByText('操作')).toHaveFocus();
  });
  it('preserves controlled state and prevents disabled activation', () => {
    const change = vi.fn(); const { rerender } = render(<Dropdown trigger={['click']} disabled onOpenChange={change} menu={{ items:[{key:'a',label:'甲'}] }}><button>操作</button></Dropdown>);
    fireEvent.click(screen.getByText('操作')); expect(change).not.toHaveBeenCalled();
    rerender(<Dropdown trigger={['click']} open onOpenChange={change} menu={{ items:[{key:'a',label:'甲'}] }}><button>操作</button></Dropdown>);
    fireEvent.pointerDown(document.body); expect(change).toHaveBeenCalledWith(false, { source:'trigger' }); expect(screen.getByRole('menu')).toBeVisible();
  });
});
