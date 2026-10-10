import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Tabs } from './index.js';
const items = [{ key: 'a', label: 'First', children: <input aria-label="Draft" defaultValue="Hello" /> }, { key: 'b', label: 'Disabled', disabled: true, children: 'Hidden' }, { key: 'c', label: 'Last', children: 'Last panel' }];
describe('Tabs', () => {
  it('skips disabled tabs and maintains roving focus and accessible associations', () => {
    const change = vi.fn(); render(<Tabs items={items} onChange={change} />);
    expect(screen.getByRole('tab', {name: 'First'})).toHaveAttribute('tabindex', '0');
    fireEvent.keyDown(screen.getByRole('tab', {name: 'First'}), {key: 'ArrowRight'});
    const tab = screen.getByRole('tab', {name: 'Last'}); expect(tab).toHaveFocus(); expect(tab).toHaveAttribute('aria-selected', 'false'); expect(change).not.toHaveBeenCalled(); fireEvent.keyDown(tab, {key: 'Enter'}); expect(tab).toHaveAttribute('aria-selected', 'true'); expect(change).toHaveBeenCalledWith('c'); expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', tab.id);
    fireEvent.keyDown(tab, {key: 'Home'}); expect(screen.getByRole('tab', {name: 'First'})).toHaveFocus();
  });
  it('retains visited panel state by default and destroys it on request', () => {
    const { rerender } = render(<Tabs items={items} />); fireEvent.change(screen.getByLabelText('Draft'), {target: {value: 'Edited'}});
    fireEvent.click(screen.getByRole('tab', {name: 'Last'})); expect(screen.getByLabelText('Draft')).toHaveValue('Edited'); fireEvent.click(screen.getByRole('tab', {name: 'First'})); expect(screen.getByLabelText('Draft')).toHaveValue('Edited');
    rerender(<Tabs items={items} destroyOnHidden />); fireEvent.click(screen.getByRole('tab', {name: 'Last'})); expect(screen.queryByLabelText('Draft')).toBeNull(); fireEvent.click(screen.getByRole('tab', {name: 'First'})); expect(screen.getByLabelText('Draft')).toHaveValue('Hello');
  });
  it('keeps controlled selection while requesting changes and handles removed active items', () => {
    const change = vi.fn(); const { rerender } = render(<Tabs activeKey="a" items={items} onChange={change} />); fireEvent.click(screen.getByRole('tab', {name: 'Last'})); expect(change).toHaveBeenCalledWith('c'); expect(screen.getByRole('tab', {name: 'First'})).toHaveAttribute('aria-selected', 'true');
    rerender(<Tabs items={[items[2]]} />); expect(screen.getByRole('tab', {name: 'Last'})).toHaveAttribute('aria-selected', 'true');
  });
});
