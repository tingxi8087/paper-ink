import { createRef, useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ConfigProvider } from '../config-provider/index.js';
import { Image } from './index.js';
describe('Image', () => {
 it('loads fallback once, forwards events and resets after src changes', () => {
  const error = vi.fn(), load = vi.fn(); const { rerender } = render(<Image src="original" fallback="fallback" alt="山水" placeholder="等待" onError={error} onLoad={load} preview={false} />);
  const image = screen.getByRole('img'); fireEvent.error(image); expect(image).toHaveAttribute('src','fallback'); fireEvent.error(image); expect(error).toHaveBeenCalledTimes(2);
  fireEvent.load(image); expect(load).toHaveBeenCalledOnce(); expect(screen.queryByText('等待')).toBeNull();
  rerender(<Image src="new" fallback="fallback" alt="山水" placeholder="等待" preview={false} />); expect(image).toHaveAttribute('src','new'); expect(screen.getByText('等待')).toBeInTheDocument();
  rerender(<Image src="original" fallback="fallback" alt="山水" preview={false} />); expect(image).toHaveAttribute('src','original');
 });
 it('opens keyboard accessible preview, zooms, rotates and closes with focus restore', async () => {
  render(<Image src="original" alt="山水" preview={{ maxScale: 1.5 }} />); const trigger = screen.getByRole('button', { name:'预览 山水' }); trigger.focus(); fireEvent.click(trigger);
  const dialog = screen.getByRole('dialog', { name:'图片预览' }); const image = dialog.querySelector('img')!;
  fireEvent.click(screen.getByRole('button', { name:'放大图片' })); expect(image.style.transform).toContain('scale(1.5)'); expect(screen.getByRole('button', { name:'放大图片' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name:'旋转图片' })); expect(image.style.transform).toContain('rotate(90deg)');
  fireEvent.click(screen.getByRole('button', { name:'重置图片' })); expect(image.style.transform).toContain('scale(1)');
  fireEvent.keyDown(document, { key:'Escape' }); await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull()); expect(trigger).toHaveFocus();
 });
 it('collects grouped images and wraps navigation through keys and buttons', () => {
  render(<Image.PreviewGroup><Image src="one" alt="一" /><Image src="two" alt="二" /></Image.PreviewGroup>);
  fireEvent.click(screen.getByRole('button', { name:'预览 二' })); expect(screen.getByRole('dialog').querySelector('img')).toHaveAttribute('src','two'); expect(screen.getByText('2 / 2')).toBeInTheDocument();
  fireEvent.keyDown(document, { key:'ArrowRight' }); expect(screen.getByRole('dialog').querySelector('img')).toHaveAttribute('src','one');
  fireEvent.click(screen.getByRole('button', { name:'上一张图片' })); expect(screen.getByRole('dialog').querySelector('img')).toHaveAttribute('src','two');
 });
 it('supports controlled group without children and open/current callbacks', () => {
  const change = vi.fn(); function Demo() { const [open, setOpen] = useState(true), [current,setCurrent] = useState(0); return <Image.PreviewGroup items={['one','two']} preview={{ open, onOpenChange:setOpen, current, onChange:(next,previous) => { change(next,previous); setCurrent(next); } }} />; }
  render(<Demo />); fireEvent.click(screen.getByRole('button', { name:'下一张图片' })); expect(change).toHaveBeenCalledWith(1,0); expect(screen.getByRole('dialog').querySelector('img')).toHaveAttribute('src','two');
  fireEvent.click(screen.getByRole('button', { name:'关闭图片预览' })); expect(screen.queryByRole('dialog')).toBeNull();
 });
 it('emits controlled open changes without mutating controlled state', () => {
  const change = vi.fn(); render(<Image src="one" alt="受控" preview={{ open:false, onOpenChange:change }} />);
  fireEvent.click(screen.getByRole('button', { name:'预览 受控' })); expect(change).toHaveBeenCalledWith(true); expect(screen.queryByRole('dialog')).toBeNull();
 });
 it('forwards img refs and carries local theme on the image root', () => {
  const ref = createRef<HTMLImageElement>(); render(<ConfigProvider theme={{ token: { radius:{ control:13 } } }}><Image ref={ref} src="one" alt="引用" /></ConfigProvider>);
  expect(ref.current).toBe(screen.getByRole('img')); expect(ref.current!.parentElement!.style.getPropertyValue('--pi-radius-control')).toBe('13px');
 });
 it('retains DOM group ordering after source updates and keyed reordering', () => {
  const { rerender } = render(<Image.PreviewGroup><Image key="a" src="one" alt="一" /><Image key="b" src="two" alt="二" /></Image.PreviewGroup>);
  rerender(<Image.PreviewGroup><Image key="a" src="updated" alt="一" /><Image key="b" src="two" alt="二" /></Image.PreviewGroup>);
  fireEvent.click(screen.getByRole('button', { name:'预览 一' })); expect(screen.getByText('1 / 2')).toBeInTheDocument(); expect(screen.getByRole('dialog').querySelector('img')).toHaveAttribute('src','updated');
  fireEvent.click(screen.getByRole('button',{ name:'关闭图片预览' }));
  rerender(<Image.PreviewGroup><Image key="b" src="two" alt="二" /><Image key="a" src="updated" alt="一" /></Image.PreviewGroup>);
  fireEvent.click(screen.getByRole('button', { name:'预览 二' })); expect(screen.getByText('1 / 2')).toBeInTheDocument(); expect(screen.getByRole('dialog').querySelector('img')).toHaveAttribute('src','two');
 });
 it('does not apply fallback just because src is omitted', () => { render(<Image alt="空地址" fallback="backup" preview={false} />); expect(screen.getByRole('img')).not.toHaveAttribute('src'); });
 it('disables image and group previews'  , () => { render(<Image.PreviewGroup preview={false}><Image src="one" /></Image.PreviewGroup>); expect(screen.queryByRole('button')).toBeNull(); });
});
