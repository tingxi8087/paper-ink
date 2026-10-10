import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Popconfirm } from './index.js';
describe('Popconfirm', () => {
  it('waits for confirmation, blocks dismissal while pending, and retains rejected confirmation for retry', async () => {
    let reject!: (reason?: unknown) => void;
    const confirm = vi.fn(() => new Promise<void>((_, no) => { reject = no; }));
    render(<Popconfirm title="确定删除？" onConfirm={confirm}><button>删除</button></Popconfirm>);
    fireEvent.click(screen.getByText('删除')); fireEvent.click(screen.getByText('确定'));
    expect(screen.getByRole('button', { name:'取消' })).toBeDisabled(); fireEvent.pointerDown(document.body); expect(screen.getByRole('dialog')).toBeVisible();
    await act(async () => { reject(new Error('failed')); }); expect(screen.getByRole('dialog')).toBeVisible(); expect(screen.getByRole('button', { name:'取消' })).not.toBeDisabled();
    fireEvent.click(screen.getByText('取消')); expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
  it('closes after a fulfilled Promise and respects controlled open', async () => {
    const change = vi.fn();
    render(<Popconfirm title="保存？" open onOpenChange={change} onConfirm={() => Promise.resolve()}><button>保存</button></Popconfirm>);
    await act(async () => { fireEvent.click(screen.getByText('确定')); }); expect(change).toHaveBeenCalledWith(false); expect(screen.getByRole('dialog')).toBeVisible();
  });
});
