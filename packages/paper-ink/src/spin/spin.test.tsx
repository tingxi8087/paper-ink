import { act, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { Spin } from './index';
it('cancels loading before the delay and restores blocked content', () => {
 vi.useFakeTimers();
 try {
 const {rerender}=render(<Spin delay={200}><button>Content</button></Spin>);
 expect(screen.queryByRole('status')).toBeNull();
 rerender(<Spin delay={200} spinning={false}><button>Content</button></Spin>);act(()=>vi.advanceTimersByTime(250));expect(screen.queryByRole('status')).toBeNull();
 rerender(<Spin delay={200}><button>Content</button></Spin>);act(()=>vi.advanceTimersByTime(200));expect(screen.getByRole('status')).toBeVisible();expect(screen.getByText('Content').parentElement).toHaveAttribute('inert');
 rerender(<Spin spinning={false}><button>Content</button></Spin>);expect(screen.getByRole('button',{name:'Content'}).parentElement).not.toHaveAttribute('inert');
 } finally { vi.useRealTimers(); }
});
it('clamps progress and supports a theme-preserving fullscreen portal', () => {
 render(<Spin fullscreen percent={140} description="Loading" />);expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow','100');expect(document.body.querySelector('.pi-spin--fullscreen')).toBeTruthy();
});
