import { act, render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { message, useMessage } from './message.js';
import { ConfigProvider } from '../config-provider/index.js';
import type { MessageHandle, MessageInstance } from './types.js';
function setup(config = {}) {
  let api!: MessageInstance;
  function Demo() { const [instance, holder] = useMessage(config); api = instance; return holder; }
  const rendered = render(<ConfigProvider theme={{ token: { radius: { control: 17 } } }}><Demo /></ConfigProvider>);
  return { api, ...rendered };
}
describe('message', () => {
  it('inherits holder context and resolves the callable thenable after closing', async () => {
    const { api } = setup(); const close = vi.fn(); let handle!: MessageHandle;
    act(() => { handle = api.success({ content: '保存成功', duration: 0, onClose: close }); });
    expect(screen.getByRole('status')).toHaveTextContent('保存成功');
    expect(screen.getByRole('status').closest<HTMLElement>('.pi-message-holder')!.style.getPropertyValue('--pi-radius-control')).toBe('17px');
    act(() => handle()); await handle;
    expect(screen.queryByText('保存成功')).not.toBeInTheDocument(); expect(close).toHaveBeenCalledTimes(1);
  });
  it('updates keyed content and duration while resolving all handles when it closes', async () => {
    vi.useFakeTimers();
    try {
      const { api } = setup(); let first!: MessageHandle, second!: MessageHandle;
      act(() => { first = api.loading({ key: 'save', content: '正在保存', duration: 0 }); });
      act(() => { second = api.success({ key: 'save', content: '保存成功', duration: 1 }); });
      expect(screen.queryByText('正在保存')).not.toBeInTheDocument();
      expect(screen.getAllByRole('status')).toHaveLength(1);
      act(() => vi.advanceTimersByTime(1000)); await Promise.all([first, second]);
      expect(screen.queryByText('保存成功')).not.toBeInTheDocument();
    } finally { vi.useRealTimers(); }
  });
  it('drops oldest at maxCount and clears pending timers when the holder unmounts', async () => {
    vi.useFakeTimers();
    try {
      const { api, unmount } = setup({ maxCount: 1 }); const close = vi.fn(); let first!: MessageHandle, second!: MessageHandle;
      act(() => { first = api.info('第一条', 1, close); second = api.error({ content: '第二条', duration: 0 }); });
      await first; expect(close).toHaveBeenCalledTimes(1);
      expect(screen.queryByText('第一条')).not.toBeInTheDocument(); expect(screen.getByRole('alert')).toHaveTextContent('第二条');
      unmount(); await second; act(() => vi.advanceTimersByTime(5000)); expect(close).toHaveBeenCalledTimes(1);
    } finally { vi.useRealTimers(); }
  });
  it('supports static configuration, static notices and keyed destroy', async () => {
    message.config({ duration: 0, maxCount: 2 }); let handle!: MessageHandle;
    await act(async () => { handle = message.warning({ key: 'static', content: '静态提示' }); });
    expect(screen.getByRole('alert')).toHaveTextContent('静态提示');
    act(() => message.destroy('static')); await handle;
    expect(screen.queryByText('静态提示')).not.toBeInTheDocument();
    message.config({ duration: 3 });
  });
});
