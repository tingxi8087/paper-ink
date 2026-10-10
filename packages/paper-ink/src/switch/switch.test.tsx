import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Switch } from './index.js';
describe('Switch', () => {
  it('changes with keyboard and click without submitting native forms', async () => {
    const change = vi.fn(); const submit = vi.fn(); render(<form onSubmit={submit}><Switch aria-label="Notifications" onChange={change} checkedChildren="On" unCheckedChildren="Off" /></form>);
    await userEvent.tab(); await userEvent.keyboard(' '); expect(screen.getByRole('switch')).toBeChecked(); expect(change).toHaveBeenCalledTimes(1); expect(submit).not.toHaveBeenCalled();
    fireEvent.keyDown(screen.getByRole('switch'), { key: 'ArrowLeft' }); expect(screen.getByRole('switch')).not.toBeChecked();
  });
  it('keeps controlled values and blocks loading interactions', () => {
    const change = vi.fn(); const { rerender } = render(<Switch checked onChange={change} />);
    fireEvent.click(screen.getByRole('switch')); expect(change).toHaveBeenCalledWith(false, expect.anything()); expect(screen.getByRole('switch')).toBeChecked();
    rerender(<Switch loading checked onChange={change} />); expect(screen.getByRole('switch')).toBeDisabled(); fireEvent.click(screen.getByRole('switch')); expect(change).toHaveBeenCalledTimes(1);
  });
});
