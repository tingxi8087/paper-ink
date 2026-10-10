import { createRef } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Tooltip } from './tooltip.js';
import { ConfigProvider } from '../config-provider/index.js';
describe('Tooltip', () => {
  it('delays hover, preserves child callbacks/ref and associates the accessible description', () => {
    vi.useFakeTimers();
    try {
      const click = vi.fn(), ref = createRef<HTMLButtonElement>();
      render(<Tooltip title="说明"><button ref={ref} onClick={click}>按钮</button></Tooltip>);
      fireEvent.mouseEnter(screen.getByRole('button'));
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      act(() => vi.advanceTimersByTime(100));
      const tooltip = screen.getByRole('tooltip');
      expect(ref.current).toBe(screen.getByRole('button'));
      expect(ref.current).toHaveAttribute('aria-describedby', tooltip.id);
      fireEvent.click(ref.current!); expect(click).toHaveBeenCalledTimes(1);
      fireEvent.mouseLeave(ref.current!); act(() => vi.advanceTimersByTime(100));
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    } finally { vi.useRealTimers(); }
  });
  it('keeps a hover tooltip visible while moving onto its popup', () => {
    vi.useFakeTimers();
    try {
      render(<Tooltip title="长文本" mouseEnterDelay={0}><button>按钮</button></Tooltip>);
      fireEvent.mouseEnter(screen.getByRole('button'));
      fireEvent.mouseLeave(screen.getByRole('button'));
      fireEvent.mouseEnter(screen.getByRole('tooltip'));
      act(() => vi.advanceTimersByTime(200));
      expect(screen.getByRole('tooltip')).toBeVisible();
      fireEvent.mouseLeave(screen.getByRole('tooltip'));
      act(() => vi.advanceTimersByTime(100));
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    } finally { vi.useRealTimers(); }
  });
  it('positions custom portals against the real offsetParent instead of the static container', () => {
    const positioned = document.createElement('div'), container = document.createElement('div');
    positioned.append(container); document.body.append(positioned);
    const rect = (left: number, top: number, width: number, height: number) => ({ left, top, width, height, right: left + width, bottom: top + height, x: left, y: top, toJSON() {} }) as DOMRect;
    const bounds = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function(this: HTMLElement) {
      if (this === positioned) return rect(20, 40, 600, 400);
      if (this.classList.contains('pi-tooltip-trigger')) return rect(100, 100, 60, 32);
      if (this.classList.contains('pi-tooltip')) return rect(0, 0, 80, 30);
      return rect(0, 0, 0, 0);
    });
    const parent = vi.spyOn(HTMLElement.prototype, 'offsetParent', 'get').mockImplementation(function(this: HTMLElement) { return this.classList.contains('pi-tooltip') ? positioned : null; });
    try {
      render(<Tooltip title="定位" open getPopupContainer={() => container}><button>按钮</button></Tooltip>);
      expect(screen.getByRole('tooltip')).toHaveStyle({ position: 'absolute', left: '70px', top: '22px' });
    } finally { parent.mockRestore(); bounds.mockRestore(); positioned.remove(); }
  });
  it('does not inject invalid ARIA props into Fragment children', () => {
    const error = vi.spyOn(console, 'error');
    try {
      render(<Tooltip title="说明" open><><button>按钮</button></></Tooltip>);
      expect(screen.getByRole('tooltip')).toBeVisible();
      expect(error).not.toHaveBeenCalled();
    } finally { error.mockRestore(); }
  });
  it('supports controlled click and Escape without implicitly changing controlled open', () => {
    const change = vi.fn();
    const { rerender } = render(<Tooltip title="说明" trigger="click" open={false} onOpenChange={change}><button>按钮</button></Tooltip>);
    fireEvent.click(screen.getByRole('button')); expect(change).toHaveBeenCalledWith(true);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    rerender(<Tooltip title="说明" trigger="click" open onOpenChange={change}><button>按钮</button></Tooltip>);
    fireEvent.keyDown(document, { key: 'Escape' }); expect(change).toHaveBeenLastCalledWith(false);
    expect(screen.getByRole('tooltip')).toBeVisible();
  });
  it('portals themed content, supports disabled triggers and destroys hidden contents', () => {
    const { container, rerender } = render(<ConfigProvider theme={{ token: { radius: { control: 20 } } }}><Tooltip title="禁用原因" open><button disabled>禁用</button></Tooltip></ConfigProvider>);
    const tooltip = screen.getByRole('tooltip');
    expect(container.contains(tooltip)).toBe(false);
    expect(tooltip.style.getPropertyValue('--pi-radius-control')).toBe('20px');
    expect(screen.getByRole('button')).toHaveStyle({ pointerEvents: 'none' });
    rerender(<Tooltip title="禁用原因" open={false} destroyOnHidden><button>禁用</button></Tooltip>);
    expect(screen.queryByText('禁用原因')).not.toBeInTheDocument();
  });
});
