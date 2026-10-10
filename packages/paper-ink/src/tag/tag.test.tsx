import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { Tag } from './index';
it('allows preventing close, then closes without bubbling to parent', () => {
 const outer = vi.fn(); const close = vi.fn(e => e.preventDefault());
 const { rerender } = render(<div onClick={outer}><Tag closable onClose={close}>Keep</Tag></div>);
 fireEvent.click(screen.getByRole('button', { name: '关闭标签' }));
 expect(close).toHaveBeenCalledOnce(); expect(outer).not.toHaveBeenCalled(); expect(screen.getByText('Keep')).toBeVisible();
 rerender(<Tag closable>Keep</Tag>);fireEvent.click(screen.getByRole('button', { name: '关闭标签' }));expect(screen.queryByText('Keep')).toBeNull();
});
it('keeps checkable tags controlled and disables close actions', () => {
 const change=vi.fn();render(<><Tag.CheckableTag checked={false} onChange={change}>Choice</Tag.CheckableTag><Tag disabled closable>Disabled</Tag></>);
 fireEvent.click(screen.getByRole('button', { name: 'Choice' }));expect(change).toHaveBeenCalledWith(true);expect(screen.getByRole('button', { name: 'Choice' })).toHaveAttribute('aria-pressed','false');
 expect(screen.getByRole('button', { name: '关闭标签' })).toBeDisabled();
});
