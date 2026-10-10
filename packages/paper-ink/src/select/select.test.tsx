import { createRef, useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ConfigProvider } from '../config-provider/index.js';
import { Select } from './select.js';
import type { SelectRef } from './types.js';

const options = [{ value: 'react', label: 'React' }, { value: 'blocked', label: 'Blocked', disabled: true }, { value: 'vue', label: 'Vue' }];
describe('Select supported behavior', () => {
  it('forwards click handlers and lets the owner prevent opening', async () => {
    const click = vi.fn(event => event.preventDefault());
    render(<Select options={options} onClick={click} />);
    await userEvent.click(screen.getByRole('combobox'));
    expect(click).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
  it('supports keyboard opening, skips disabled options, selects and closes, and preserves focus', async () => {
    const change = vi.fn(); const select = vi.fn();
    render(<Select aria-label="框架" options={options} onChange={change} onSelect={select} />);
    const combo = screen.getByRole('combobox', { name: '框架' });
    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
    expect(combo).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(change).toHaveBeenCalledWith('vue', options[2]);
    expect(select).toHaveBeenCalledWith('vue', options[2]);
    expect(combo).toHaveAttribute('aria-expanded', 'false');
    expect(combo).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}{Escape}');
    expect(combo).toHaveAttribute('aria-expanded', 'false');
  });
  it('single pointer selection closes without reopening through Portal bubbling', async () => {
    render(<Select options={options} />);
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByRole('option', { name: 'Vue' }));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(screen.getByText('Vue')).toBeInTheDocument();
  });
  it('moves from the selected option immediately after pointer opening', async () => {
    const change = vi.fn();
    render(<Select value="react" options={options} onChange={change} />);
    const combo = screen.getByRole('combobox');
    await userEvent.click(combo);
    fireEvent.keyDown(combo, { key: 'ArrowDown' });
    fireEvent.keyDown(combo, { key: 'Enter' });
    expect(change).toHaveBeenCalledWith('vue', options[2]);
  });
  it('keeps controlled multiple selection and emits matching option arrays and clear', async () => {
    const change = vi.fn(); const deselect = vi.fn(); const clear = vi.fn();
    function Demo() {
      const [value, setValue] = useState<string[]>(['react']);
      return <Select mode="multiple" value={value} options={options} allowClear onDeselect={deselect} onClear={clear} onChange={(next, option) => { change(next, option); setValue(next as string[]); }} />;
    }
    render(<Demo />);
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByRole('option', { name: 'Vue' }));
    expect(change).toHaveBeenLastCalledWith(['react', 'vue'], [options[0], options[2]]);
    await userEvent.click(screen.getByRole('button', { name: '移除 React' }));
    expect(deselect).toHaveBeenCalledWith('react', options[0]);
    expect(change).toHaveBeenLastCalledWith(['vue'], [options[2]]);
    await userEvent.click(screen.getByRole('button', { name: '清空选择' }));
    expect(change).toHaveBeenLastCalledWith([], []);
    expect(clear).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: '移除 Vue' })).not.toBeInTheDocument();
  });
  it('does not mutate a controlled empty value or controlled open state', async () => {
    const change = vi.fn(); const opened = vi.fn();
    const { rerender } = render(<Select value={undefined} options={options} open onChange={change} onOpenChange={opened} />);
    await userEvent.click(screen.getByRole('option', { name: 'React' }));
    expect(change).toHaveBeenCalledWith('react', options[0]);
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('option', { name: 'React' })).toHaveAttribute('aria-selected', 'false');
    expect(opened).toHaveBeenCalledWith(false);
    rerender(<Select value={undefined} options={options} open={false} />);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
  it('filters labels, calls search, creates tags by Enter, and ignores composing Enter', async () => {
    const search = vi.fn(); const change = vi.fn();
    render(<Select mode="tags" options={options} optionFilterProp="label" onSearch={search} onChange={change} />);
    const combo = screen.getByRole('combobox');
    await userEvent.type(combo, 'new-tag');
    expect(search).toHaveBeenLastCalledWith('new-tag');
    fireEvent.keyDown(combo, { key: 'Enter', isComposing: true });
    expect(change).not.toHaveBeenCalled();
    await userEvent.keyboard('{Enter}');
    expect(change).toHaveBeenCalledWith(['new-tag'], [{ value: 'new-tag', label: 'new-tag' }]);
    expect(screen.getByRole('button', { name: '移除 new-tag' })).toBeInTheDocument();
    await userEvent.type(combo, 'vu');
    expect(screen.getByRole('option', { name: 'Vue' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'React' })).not.toBeInTheDocument();
  });
  it('honors custom filtering and empty content, outside click, and disabled', async () => {
    const { rerender } = render(<Select showSearch options={options} filterOption={(query, option) => option.value === query} notFoundContent="无匹配" />);
    await userEvent.type(screen.getByRole('combobox'), 'none');
    expect(screen.getByText('无匹配')).toBeInTheDocument();
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    rerender(<Select disabled options={options} defaultOpen allowClear defaultValue="react" />);
    expect(screen.getByRole('combobox')).toBeDisabled();
    expect(screen.queryByRole('button', { name: '清空选择' })).not.toBeInTheDocument();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
  it('preserves theme in a custom popup container and provides focus/blur methods', async () => {
    const host = document.createElement('div'); document.body.append(host);
    const ref = createRef<SelectRef>();
    render(<ConfigProvider theme={{ token: { color: { primary: { solid: '#123456' } } } }}><Select ref={ref} options={options} status="error" rootClassName="custom" getPopupContainer={() => host} /></ConfigProvider>);
    ref.current?.focus();
    expect(screen.getByRole('combobox')).toHaveFocus();
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
    expect(ref.current?.nativeElement).toHaveClass('custom');
    await userEvent.keyboard('{ArrowDown}');
    const list = screen.getByRole('listbox');
    expect(host.contains(list)).toBe(true);
    expect(list.parentElement!.style.getPropertyValue('--pi-color-primary-solid')).toBe('#123456');
    ref.current?.blur();
    expect(screen.getByRole('combobox')).not.toHaveFocus();
    host.remove();
  });
  it('submits multiple hidden fields and supports native uncontrolled form reset', async () => {
    render(<form aria-label="settings"><Select mode="multiple" options={options} name="framework" defaultValue={['react']} /><button type="reset">Reset</button></form>);
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByRole('option', { name: 'Vue' }));
    const form = screen.getByRole('form') as HTMLFormElement;
    expect(new FormData(form).getAll('framework')).toEqual(['react', 'vue']);
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
    await waitFor(() => expect(new FormData(form).getAll('framework')).toEqual(['react']));
    expect(screen.queryByRole('button', { name: '移除 Vue' })).not.toBeInTheDocument();
  });
});
