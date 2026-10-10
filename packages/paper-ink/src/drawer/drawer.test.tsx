import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Drawer } from './index.js';
import { Modal } from '../modal/index.js';
describe('Drawer', () => {
  it('shares modal focus/scroll stack and restores the trigger after closing', () => {
    const close = vi.fn(); document.body.style.overflow = 'scroll';
    const trigger = document.createElement('button'); document.body.append(trigger); trigger.focus();
    const { rerender, unmount } = render(<Drawer title="详情" open onClose={close} placement="left"><button>内层</button></Drawer>);
    expect(document.body.style.overflow).toBe('hidden'); expect(screen.getByRole('dialog')).toHaveStyle({ left:'0px', width:'378px' });
    fireEvent.keyDown(document, { key:'Escape' }); expect(close).toHaveBeenCalledOnce();
    rerender(<><Drawer title="详情" open onClose={close}><button>内层</button></Drawer><Modal title="嵌套" open><button>子层</button></Modal></>);
    expect(screen.getByRole('dialog', { name:'嵌套' })).toContainElement(document.activeElement as HTMLElement);
    unmount(); expect(document.body.style.overflow).toBe('scroll'); expect(trigger).toHaveFocus(); trigger.remove(); document.body.style.overflow = '';
  });
  it('retains content by default and destroys when requested, with lifecycle callbacks', () => {
    vi.useFakeTimers();
    const callback = vi.fn(); const { rerender } = render(<Drawer open title="抽屉" afterOpenChange={callback} placement="bottom" height={200}>内容</Drawer>);
    expect(callback).not.toHaveBeenCalled(); act(() => vi.advanceTimersByTime(260)); expect(callback).toHaveBeenCalledWith(true); expect(screen.getByRole('dialog')).toHaveStyle({ bottom:'0px', height:'200px' });
    rerender(<Drawer title="抽屉" afterOpenChange={callback} destroyOnHidden>内容</Drawer>); expect(screen.getByText('内容')).toBeInTheDocument(); expect(document.body.style.overflow).toBe('hidden'); act(() => vi.advanceTimersByTime(260)); expect(callback).toHaveBeenLastCalledWith(false); expect(screen.queryByText('内容')).not.toBeInTheDocument(); vi.useRealTimers();
  });
  it('cancels pending close completion when reopened and restores focus after the final exit', () => {
    vi.useFakeTimers();
    const callback = vi.fn(); const trigger = document.createElement('button'); document.body.append(trigger); trigger.focus();
    const { rerender, unmount } = render(<Drawer open afterOpenChange={callback}><input /></Drawer>);
    act(() => vi.advanceTimersByTime(260)); callback.mockClear();
    rerender(<Drawer afterOpenChange={callback}><input /></Drawer>);
    act(() => vi.advanceTimersByTime(100));
    rerender(<Drawer open afterOpenChange={callback}><input /></Drawer>);
    act(() => vi.advanceTimersByTime(260));
    expect(callback.mock.calls).toEqual([[true]]); expect(document.body.style.overflow).toBe('hidden');
    rerender(<Drawer afterOpenChange={callback}><input /></Drawer>);
    expect(trigger).not.toHaveFocus(); act(() => vi.advanceTimersByTime(260));
    expect(callback).toHaveBeenLastCalledWith(false); expect(trigger).toHaveFocus();
    unmount(); trigger.remove(); vi.useRealTimers();
  });

});
