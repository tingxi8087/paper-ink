import { StrictMode } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ConfigProvider } from '../config-provider/index.js';
import { notification, useNotification } from './index.js';
import type { NotificationConfig, NotificationInstance } from './types.js';
function setup(config: NotificationConfig = {}, strict = false) {
 let api!: NotificationInstance;
 function Demo() { const [instance, holder] = useNotification(config); api = instance; return holder; }
 const content = <ConfigProvider theme={{ token: { radius: { control: 12 } } }}><Demo /></ConfigProvider>;
 return { ...render(strict ? <StrictMode>{content}</StrictMode> : content), get api() { return api; } };
}
describe('Notification', () => {
 it('inherits context, renders description and custom actions, and closes once', () => {
  const { api } = setup(); const close = vi.fn(), click = vi.fn();
  act(() => api.success({ message: '任务完成', description: '下载报表', duration: 0, btn: <button>下载</button>, onClose: close, onClick: click }));
  const notice = screen.getByRole('status'); expect(notice).toHaveTextContent('任务完成'); expect(notice).toHaveTextContent('下载报表');
  expect(notice.parentElement!.style.getPropertyValue('--pi-radius-control')).toBe('12px');
  fireEvent.click(notice); expect(click).toHaveBeenCalledOnce();
  fireEvent.click(screen.getByRole('button', { name: '关闭通知' })); expect(close).toHaveBeenCalledOnce(); expect(click).toHaveBeenCalledOnce();
 });
 it('updates same key and resets its duration without duplicates', () => {
  vi.useFakeTimers(); try { const { api } = setup(); const close = vi.fn();
   act(() => api.open({ key: 'job', message: '等待', duration: 1 })); act(() => vi.advanceTimersByTime(500));
   act(() => api.warning({ key: 'job', message: '更新', duration: 2, onClose: close }));
   expect(screen.getAllByRole('alert')).toHaveLength(1); expect(screen.queryByText('等待')).toBeNull();
   act(() => vi.advanceTimersByTime(1000)); expect(screen.getByText('更新')).toBeInTheDocument();
   act(() => vi.advanceTimersByTime(1000)); expect(screen.queryByText('更新')).toBeNull(); expect(close).toHaveBeenCalledOnce();
  } finally { vi.useRealTimers(); }
 });
 it('supports all placements and keyed destroy without closing other notices', () => {
  const { api } = setup({ placement: 'bottomLeft', bottom: 24 });
  act(() => { api.info({ key: 'a', message: '默认位置', duration: 0 }); api.open({ key: 'b', message: '右上', placement: 'topRight', duration: 0, closeIcon: null }); });
  expect(screen.getByText('默认位置').closest('.pi-notification-holder')).toHaveClass('pi-notification-holder--bottomLeft');
  expect(screen.getByText('默认位置').closest('.pi-notification-holder')).toHaveStyle({ bottom: '24px' });
  act(() => api.destroy('a')); expect(screen.queryByText('默认位置')).toBeNull(); expect(screen.getByText('右上')).toBeInTheDocument(); expect(screen.queryByRole('button', { name: '关闭通知' })).toBeNull();
  act(() => api.destroy()); expect(screen.queryByText('右上')).toBeNull();
 });
 it('evicts oldest and disposes timers on holder unmount in StrictMode', async () => {
  const { api, unmount } = setup({ maxCount: 1 }, true); const first = vi.fn(), second = vi.fn();
  act(() => { api.open({ message: '第一条', duration: 0, onClose: first }); api.open({ message: '第二条', duration: 0, onClose: second }); });
  expect(first).toHaveBeenCalledOnce(); expect(screen.queryByText('第一条')).toBeNull();
  unmount(); await act(async () => {}); expect(second).toHaveBeenCalledOnce();
  act(() => api.open({ message: '已卸载' })); expect(screen.queryByText('已卸载')).toBeNull();
 });
 it('retains exits and cancels keyed closing when a new update arrives', () => {
  vi.useFakeTimers(); const original = window.matchMedia; window.matchMedia = vi.fn(() => ({ matches:false }) as MediaQueryList);
  try { const { api } = setup(); const close = vi.fn();
   act(() => api.open({ key:'active', title:'标题别名', duration:0, onClose:close }));
   act(() => api.destroy('active')); expect(document.querySelector('.pi-notification')).toHaveAttribute('data-motion','leave'); expect(close).not.toHaveBeenCalled();
   act(() => vi.advanceTimersByTime(100)); act(() => api.success({ key:'active', message:'继续处理', duration:0, onClose:close }));
   act(() => vi.advanceTimersByTime(200)); expect(screen.getByRole('status')).toHaveTextContent('继续处理'); expect(close).not.toHaveBeenCalled();
   act(() => api.destroy()); act(() => vi.advanceTimersByTime(180)); expect(close).toHaveBeenCalledOnce();
  } finally { window.matchMedia = original; vi.useRealTimers(); }
 });
 it('supports static config and notices' , async () => {
  notification.config({ duration: 0 }); await act(async () => notification.error({ key: 'static', message: '静态错误' }));
  expect(screen.getByRole('alert')).toHaveTextContent('静态错误'); act(() => notification.destroy('static')); expect(screen.queryByText('静态错误')).toBeNull(); notification.config({ duration: 4.5 });
 });
});
