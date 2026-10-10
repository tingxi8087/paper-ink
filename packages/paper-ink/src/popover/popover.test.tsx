import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Popover } from './index.js';
import { Drawer } from '../drawer/index.js';
import { ConfigProvider } from '../config-provider/index.js';
describe('Popover', () => {
  it('keeps portal interaction inside an enclosing Drawer focus boundary', () => {
    render(<Drawer open title="详情"><Popover trigger="click" title="编辑" content={<input aria-label="浮层名称" />}><button>设置</button></Popover></Drawer>);
    fireEvent.click(screen.getByText('设置'));
    const input = screen.getByLabelText('浮层名称'); input.focus();
    expect(input).toHaveFocus(); expect(screen.getByRole('dialog', { name: '详情' })).toContainElement(input);
  });
  it('allows interactive content without toggling the trigger and dismisses outside', () => {
    const click = vi.fn();
    render(<ConfigProvider theme={{ token: { radius: { control: 12 } } }}><Popover title="编辑" trigger="click" content={<button onClick={click}>保存</button>}><button>打开</button></Popover></ConfigProvider>);
    fireEvent.click(screen.getByText('打开'));
    const dialog = screen.getByRole('dialog', { name: '编辑' });
    expect(dialog.style.getPropertyValue('--pi-radius-control')).toBe('12px');
    fireEvent.click(screen.getByText('保存')); expect(click).toHaveBeenCalledOnce(); expect(dialog).toBeVisible();
    fireEvent.pointerDown(document.body); expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
  it('keeps focus-triggered content open when focus moves into popup and supports controlled dismissal', () => {
    const change = vi.fn();
    render(<Popover title="标题" trigger="focus" open onOpenChange={change} content={<input aria-label="名称" />}><button>触发</button></Popover>);
    fireEvent.blur(screen.getByText('触发'), { relatedTarget: screen.getByLabelText('名称') });
    expect(change).not.toHaveBeenCalled();
    fireEvent.keyDown(document, { key: 'Escape' }); expect(change).toHaveBeenLastCalledWith(false);
    expect(screen.getByRole('dialog')).toBeVisible();
  });
});
