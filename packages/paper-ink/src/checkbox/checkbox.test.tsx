import { createRef } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Checkbox, type CheckboxRef } from './index.js';
describe('Checkbox', () => {
  it('exposes checked/value events, indeterminate state and focus ref', () => {
    const ref = createRef<CheckboxRef>(); const change = vi.fn();
    const { rerender } = render(<Checkbox ref={ref} value={12} indeterminate onChange={change}>Choice</Checkbox>);
    const input = screen.getByRole('checkbox'); expect(input).toBePartiallyChecked();
    fireEvent.click(input); expect(change.mock.calls[0][0].target).toMatchObject({ checked: true, value: 12 });
    rerender(<Checkbox ref={ref} checked={false}>Choice</Checkbox>); fireEvent.click(input); expect(input).not.toBeChecked();
    act(() => ref.current?.focus()); expect(input).toHaveFocus();
  });
  it('supports child groups, native submission and reset without firing changes', async () => {
    const change = vi.fn(); const { container } = render(<form><Checkbox.Group name="fruit" defaultValue={['pear']} onChange={change}><Checkbox value="pear">Pear</Checkbox><Checkbox value="apple">Apple</Checkbox><Checkbox value="locked" disabled>Locked</Checkbox></Checkbox.Group></form>);
    fireEvent.click(screen.getByLabelText('Apple')); expect(change).toHaveBeenLastCalledWith(['pear', 'apple']);
    expect(new FormData(container.querySelector('form')!).getAll('fruit')).toEqual(['pear', 'apple']);
    await act(async () => { fireEvent.reset(container.querySelector('form')!); }); expect(screen.getByLabelText('Pear')).toBeChecked(); expect(screen.getByLabelText('Apple')).not.toBeChecked(); expect(change).toHaveBeenCalledTimes(1);
  });
  it('keeps controlled group values and disables option inputs', () => {
    const change = vi.fn(); render(<Checkbox.Group value={[true]} options={[{ value: true, label: 'Enabled' }, { value: false, label: 'Disabled', disabled: true }]} onChange={change} />);
    fireEvent.click(screen.getByLabelText('Enabled')); expect(change).toHaveBeenCalledWith([]); expect(screen.getByLabelText('Enabled')).toBeChecked(); expect(screen.getByLabelText('Disabled')).toBeDisabled();
  });
});
it('preserves controlled selection during native form reset', async () => {
  const { container } = render(<form><Checkbox checked>Standalone</Checkbox><Checkbox.Group value={['a']} options={['a', 'b']} /></form>);
  await act(async () => { container.querySelector('form')!.reset(); });
  expect(screen.getByLabelText('Standalone')).toBeChecked(); expect(screen.getByLabelText('a')).toBeChecked();
});

it('respects canceled resets for controls and groups, keeping DOM and state aligned', async () => {
  const { container } = render(<form onReset={event => event.preventDefault()}><Checkbox defaultChecked>Standalone cancel</Checkbox><Checkbox.Group defaultValue={['a']} options={['a', 'b']} /></form>);
  fireEvent.click(screen.getByLabelText('Standalone cancel')); fireEvent.click(screen.getByLabelText('b'));
  await act(async () => { container.querySelector('form')!.reset(); });
  expect(screen.getByLabelText('Standalone cancel')).not.toBeChecked(); expect(screen.getByLabelText('a')).toBeChecked(); expect(screen.getByLabelText('b')).toBeChecked();
  fireEvent.click(screen.getByLabelText('a')); expect(screen.getByLabelText('b')).toBeChecked();
});
it('restores indeterminate state and ignores reset callbacks after unmount', async () => {
  const { container, unmount } = render(<form><Checkbox indeterminate defaultChecked>Partial</Checkbox></form>);
  fireEvent.click(screen.getByLabelText('Partial')); expect((screen.getByLabelText('Partial') as HTMLInputElement).indeterminate).toBe(false);
  await act(async () => { container.querySelector('form')!.reset(); }); expect(screen.getByLabelText('Partial')).toBePartiallyChecked();
  const input = screen.getByLabelText('Partial') as HTMLInputElement;
  await act(async () => { container.querySelector('form')!.reset(); unmount(); input.checked = false; input.indeterminate = false; });
  expect(input.checked).toBe(false); expect(input.indeterminate).toBe(false);
});
