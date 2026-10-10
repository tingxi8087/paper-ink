import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { Alert } from './index';
it('invokes close lifecycle once and honors disabled closable config', () => {
 const after=vi.fn(); const close=vi.fn();
 const { rerender }=render(<Alert title="Notice" closable={{ disabled:true, onClose:close, afterClose:after }} />);
 expect(screen.getByRole('button', {name:'关闭提示'})).toBeDisabled();
 rerender(<Alert title="Notice" closable={{ onClose:close, afterClose:after }} />);
 fireEvent.click(screen.getByRole('button', {name:'关闭提示'}));expect(screen.queryByRole('alert')).toBeNull();expect(close).toHaveBeenCalledOnce();expect(after).toHaveBeenCalledOnce();
 rerender(<Alert title="Notice" closable={{ afterClose:()=>after() }} />);expect(after).toHaveBeenCalledOnce();
});
it('handles legacy message and lets a close handler prevent removal', () => {
 render(<Alert message="Legacy" closable onClose={e=>e.preventDefault()} />);fireEvent.click(screen.getByRole('button', {name:'关闭提示'}));expect(screen.getByRole('alert')).toHaveTextContent('Legacy');
});
