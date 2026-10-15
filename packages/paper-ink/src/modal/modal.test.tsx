import { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Modal } from './modal.js';
import { ConfigProvider } from '../config-provider/index.js';

describe('Modal public behavior', () => {
  it('centers by default and allows an explicit top layout', () => {
    const { rerender } = render(<Modal open title="位置" />);
    expect(screen.getByRole('dialog').parentElement).toHaveClass('pi-modal-wrap--centered');
    rerender(<Modal open title="位置" centered={false} />);
    expect(screen.getByRole('dialog').parentElement).not.toHaveClass('pi-modal-wrap--centered');
  });
  it('portals a labelled dialog with theme and native attributes while callbacks stay controlled', () => {
    const onOk = vi.fn();
    const { container } = render(<ConfigProvider theme={{ token: { color: { primary: { solid: '#123456' } } } }}><Modal open title="编辑用户" onOk={onOk} className="custom" rootClassName="root-custom" style={{ width: 640 }} data-testid="editor">内容</Modal></ConfigProvider>);
    const dialog = screen.getByRole('dialog', { name: '编辑用户' });
    expect(container.contains(dialog)).toBe(false);
    expect(dialog).toHaveClass('custom');
    expect(dialog).toHaveAttribute('data-testid', 'editor');
    expect(dialog).toHaveStyle({ width: '640px' });
    expect(dialog.closest('.root-custom')?.getAttribute('style')).toContain('--pi-color-primary-solid: #123456');
    fireEvent.click(screen.getByRole('button', { name: '确定' }));
    expect(onOk).toHaveBeenCalledTimes(1);
    expect(dialog).toBeVisible();
  });
  it('supports footer removal, button props and loading without implicit closing', () => {
    const ok = vi.fn(); const cancel = vi.fn();
    const { rerender } = render(<Modal open title="保存" confirmLoading onOk={ok} onCancel={cancel} okText="提交" cancelText="返回" cancelButtonProps={{ disabled: true }} />);
    expect(screen.getByRole('button', { name: '提交' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: '提交' }));
    fireEvent.click(screen.getByRole('button', { name: '返回' }));
    expect(ok).not.toHaveBeenCalled(); expect(cancel).not.toHaveBeenCalled();
    rerender(<Modal open title="保存" footer={null} closable={false} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
  it('traps focus in both directions and restores the trigger when closed', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<><button>打开</button><Modal title="测试"><input aria-label="姓名" /></Modal></>);
    const trigger = screen.getByRole('button', { name: '打开' }); trigger.focus();
    rerender(<><button>打开</button><Modal open title="测试"><input aria-label="姓名" /></Modal></>);
    expect(screen.getByRole('button', { name: '关闭' })).toHaveFocus();
    await user.keyboard('{Shift>}{Tab}{/Shift}');
    expect(screen.getByRole('button', { name: '确定' })).toHaveFocus();
    await user.tab(); expect(screen.getByRole('button', { name: '关闭' })).toHaveFocus();
    trigger.focus(); expect(screen.getByRole('button', { name: '关闭' })).toHaveFocus();
    rerender(<><button>打开</button><Modal title="测试"><input aria-label="姓名" /></Modal></>);
    expect(trigger).toHaveFocus();
  });
  it('dismisses only the top modal and keeps scroll locked until all close', () => {
    document.body.style.overflow = 'scroll';
    const outerCancel = vi.fn(); const innerCancel = vi.fn();
    const { rerender, unmount } = render(<><Modal open title="外层" onCancel={outerCancel} /><Modal open title="内层" onCancel={innerCancel} /></>);
    expect(document.body.style.overflow).toBe('hidden');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(innerCancel).toHaveBeenCalledTimes(1); expect(outerCancel).not.toHaveBeenCalled();
    rerender(<><Modal open title="外层" onCancel={outerCancel} /><Modal title="内层" onCancel={innerCancel} /></>);
    expect(document.body.style.overflow).toBe('hidden');
    fireEvent.keyDown(document, { key: 'Escape' }); expect(outerCancel).toHaveBeenCalledTimes(1);
    unmount(); expect(document.body.style.overflow).toBe('scroll');
    document.body.style.overflow = '';
  });
  it('restores the original trigger when a lower modal unmounts before the top one', () => {
    const { rerender } = render(<><button>触发器</button></>);
    const trigger = screen.getByRole('button', { name: '触发器' }); trigger.focus();
    rerender(<><button>触发器</button><Modal key="outer" open title="外层" /></>);
    rerender(<><button>触发器</button><Modal key="outer" open title="外层" /><Modal key="inner" open title="内层" /></>);
    rerender(<><button>触发器</button><Modal key="inner" open title="内层" /></>);
    expect(document.body.style.overflow).toBe('hidden');
    rerender(<><button>触发器</button></>);
    expect(trigger).toHaveFocus();
    expect(document.body.style.overflow).toBe('');
  });
  it('keeps reopened retained dialogs above already open dialogs', () => {
    const { rerender } = render(<><Modal open title="第一" /><Modal title="第二" /></>);
    rerender(<><Modal open title="第一" /><Modal open title="第二" /></>);
    rerender(<><Modal title="第一" /><Modal open title="第二" /></>);
    rerender(<><Modal open title="第一" /><Modal open title="第二" /></>);
    const firstRoot = screen.getByRole('dialog', { name: '第一' }).closest<HTMLElement>('.pi-modal-root')!;
    const secondRoot = screen.getByRole('dialog', { name: '第二' }).closest<HTMLElement>('.pi-modal-root')!;
    expect(Number(firstRoot.style.zIndex)).toBeGreaterThan(Number(secondRoot.style.zIndex));
    expect(screen.getByRole('dialog', { name: '第一' }).querySelector('button')).toHaveFocus();
  });
  it('honors maskClosable and keyboard, and ignores content clicks', () => {
    const cancel = vi.fn();
    const { rerender } = render(<Modal open title="测试" onCancel={cancel}>内容</Modal>);
    fireEvent.click(screen.getByText('内容')); expect(cancel).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('dialog').parentElement!); expect(cancel).toHaveBeenCalledTimes(1);
    rerender(<Modal open title="测试" onCancel={cancel} maskClosable={false} keyboard={false}>内容</Modal>);
    fireEvent.click(screen.getByRole('dialog').parentElement!);
    fireEvent.keyDown(document, { key: 'Escape' }); expect(cancel).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: '关闭' })); expect(cancel).toHaveBeenCalledTimes(2);
  });
  it('preserves contents by default, resets with destroyOnHidden and calls afterClose once', () => {
    function Counter() { const [value, setValue] = useState(0); return <button onClick={() => setValue(value + 1)}>计数 {value}</button>; }
    const afterClose = vi.fn();
    const { rerender } = render(<Modal title="计数" afterClose={afterClose}><Counter /></Modal>);
    expect(screen.queryByText('计数 0')).not.toBeInTheDocument();
    rerender(<Modal open title="计数" afterClose={afterClose}><Counter /></Modal>);
    fireEvent.click(screen.getByText('计数 0'));
    rerender(<Modal title="计数" afterClose={afterClose}><Counter /></Modal>);
    expect(afterClose).toHaveBeenCalledTimes(1);
    rerender(<Modal open title="计数" afterClose={afterClose}><Counter /></Modal>);
    expect(screen.getByText('计数 1')).toBeInTheDocument();
    rerender(<Modal title="计数" destroyOnHidden><Counter /></Modal>);
    expect(screen.queryByText('计数 1')).not.toBeInTheDocument();
    rerender(<Modal open title="计数" destroyOnHidden><Counter /></Modal>);
    expect(screen.getByText('计数 0')).toBeInTheDocument();
  });
  it('supports inline rendering and forceRender, with an accessible fallback name', () => {
    const { container, rerender } = render(<Modal getContainer={false} forceRender footer={null}>预渲染</Modal>);
    expect(container.querySelector('[role="dialog"]')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    rerender(<Modal open getContainer={false} forceRender footer={null}>预渲染</Modal>);
    expect(screen.getByRole('dialog', { name: '对话框' })).toBeVisible();
  });
});
