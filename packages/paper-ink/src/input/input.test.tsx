import { createRef, useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Input, TextArea } from './index.js';
import type { InputRef, TextAreaRef } from './types.js';

describe('Input and TextArea public behavior', () => {
  it('resets uncontrolled inputs and counts with the native form without changing controlled values', async () => {
    const change = vi.fn();
    render(<form aria-label="editor">
      <Input defaultValue="PaperInk" showCount onChange={change} />
      <TextArea defaultValue="note" showCount />
      <Input value="controlled" readOnly />
      <button type="reset">Reset</button>
    </form>);
    const fields = screen.getAllByRole('textbox');
    await userEvent.type(fields[0], 'more');
    await userEvent.type(fields[1], ' more');
    expect(screen.getByText('12')).toBeInTheDocument();
    const changesBeforeReset = change.mock.calls.length;
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
    await waitFor(() => expect(fields[0]).toHaveValue('PaperInk'));
    expect(fields[1]).toHaveValue('note');
    expect(fields[2]).toHaveValue('controlled');
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(change).toHaveBeenCalledTimes(changesBeforeReset);
  });
  it('respects prevented form reset and supports externally associated forms', async () => {
    const { rerender } = render(<><form id="outside" onReset={event => event.preventDefault()} /><Input form="outside" defaultValue="original" showCount /></>);
    const node = screen.getByRole('textbox');
    await userEvent.clear(node);
    await userEvent.type(node, 'edited');
    fireEvent.reset(document.getElementById('outside')!);
    await Promise.resolve();
    expect(node).toHaveValue('edited');
    expect(screen.getByText('6')).toBeInTheDocument();
    rerender(<><form id="outside" /><Input form="outside" defaultValue="original" showCount /></>);
    document.querySelector('form')!.reset();
    await waitFor(() => expect(node).toHaveValue('original'));
    expect(screen.getByText('8')).toBeInTheDocument();
  });
  it('forwards native input attributes, styles, custom classes, and a focus handle', () => {
    const ref = createRef<InputRef>();
    render(<Input ref={ref} id="username" name="username" aria-label="用户名" placeholder="名字" className="custom" style={{ width: 200 }} autoComplete="username" required defaultValue="Paper" />);
    const node = screen.getByRole('textbox');
    expect(node).toHaveAttribute('name', 'username');
    expect(node).toHaveAttribute('autocomplete', 'username');
    expect(node).toBeRequired();
    expect(ref.current?.input).toBe(node);
    expect(ref.current?.nativeElement).toHaveClass('custom');
    expect(ref.current?.nativeElement).toHaveStyle({ width: '200px' });
    ref.current?.focus({ cursor: 'all' });
    expect(node).toHaveFocus();
    expect(ref.current?.input?.selectionEnd).toBe(5);
    ref.current?.blur();
    expect(node).not.toHaveFocus();
  });
  it('updates uncontrolled input and dispatches an empty value when cleared', async () => {
    const change = vi.fn(); const clear = vi.fn();
    render(<Input defaultValue="hello" allowClear onClear={clear} onChange={event => change(event.target.value)} />);
    await userEvent.type(screen.getByRole('textbox'), '!');
    expect(screen.getByRole('textbox')).toHaveValue('hello!');
    await userEvent.click(screen.getByRole('button', { name: '清空内容' }));
    expect(screen.getByRole('textbox')).toHaveValue('');
    expect(change).toHaveBeenLastCalledWith('');
    expect(clear).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('textbox')).toHaveFocus();
  });
  it('lets the owner accept or reject a controlled clear', async () => {
    const change = vi.fn();
    const { rerender } = render(<Input value="fixed" allowClear onChange={event => change(event.target.value)} />);
    await userEvent.click(screen.getByRole('button', { name: '清空内容' }));
    expect(change).toHaveBeenCalledWith('');
    expect(screen.getByRole('textbox')).toHaveValue('fixed');
    function Controlled() {
      const [value, setValue] = useState('accepted');
      return <Input value={value} allowClear onChange={event => setValue(event.target.value)} />;
    }
    rerender(<Controlled />);
    await userEvent.click(screen.getByRole('button', { name: '清空内容' }));
    expect(screen.getByRole('textbox')).toHaveValue('');
  });
  it('keeps over-limit controlled data intact and supports affixes and count formatter', () => {
    render(<Input value="abcdef" maxLength={3} prefix="@" suffix=".com" showCount={{ formatter: ({ count, maxLength }) => `${count} of ${maxLength}` }} readOnly />);
    expect(screen.getByRole('textbox')).toHaveValue('abcdef');
    expect(screen.getByText('@')).toBeInTheDocument();
    expect(screen.getByText('.com')).toBeInTheDocument();
    expect(screen.getByText('6 of 3')).toBeInTheDocument();
  });
  it('does not expose clear actions on disabled or read-only controls', () => {
    render(<><Input disabled allowClear defaultValue="a" /><TextArea readOnly allowClear defaultValue="b" /></>);
    expect(screen.queryByRole('button', { name: '清空内容' })).not.toBeInTheDocument();
    expect(screen.getAllByRole('textbox')[0]).toBeDisabled();
    expect(screen.getAllByRole('textbox')[1]).toHaveAttribute('readonly');
  });
  it('fires Enter once and ignores composition and prevented key events', () => {
    const enter = vi.fn();
    const { rerender } = render(<Input onPressEnter={enter} />);
    const node = screen.getByRole('textbox');
    fireEvent.keyDown(node, { key: 'Enter', isComposing: true });
    fireEvent.keyDown(node, { key: 'Enter', keyCode: 229 });
    expect(enter).not.toHaveBeenCalled();
    fireEvent.keyDown(node, { key: 'Enter' });
    expect(enter).toHaveBeenCalledTimes(1);
    rerender(<Input onPressEnter={enter} onKeyDown={event => event.preventDefault()} />);
    fireEvent.keyDown(node, { key: 'Enter' });
    expect(enter).toHaveBeenCalledTimes(1);
  });
  it('supports textarea native attributes, counting, clearing, and selection ref', async () => {
    const ref = createRef<TextAreaRef>(); const change = vi.fn();
    render(<Input.TextArea ref={ref} aria-label="简介" rows={4} name="description" defaultValue="hello" allowClear showCount maxLength={20} onChange={event => change(event.target.value)} />);
    const node = screen.getByRole('textbox');
    expect(node).toHaveAttribute('rows', '4');
    expect(node).toHaveAttribute('name', 'description');
    expect(screen.getByText('5 / 20')).toBeInTheDocument();
    expect(ref.current?.resizableTextArea.textArea).toBe(node);
    ref.current?.focus({ cursor: 'end' });
    expect(ref.current?.resizableTextArea.textArea?.selectionStart).toBe(5);
    await userEvent.click(screen.getByRole('button', { name: '清空内容' }));
    expect(node).toHaveValue('');
    expect(change).toHaveBeenCalledWith('');
    expect(screen.getByText('0 / 20')).toBeInTheDocument();
  });
  it('clamps automatic height to row bounds and restores manual height after disabling', () => {
    const ref = createRef<TextAreaRef>();
    const { rerender } = render(<TextArea ref={ref} defaultValue="one" style={{ lineHeight: '20px', padding: '0px', borderWidth: '0px', height: 100 }} autoSize={{ minRows: 2, maxRows: 4 }} />);
    const node = ref.current!.resizableTextArea.textArea!;
    Object.defineProperty(node, 'scrollHeight', { configurable: true, get: () => node.value.length > 4 ? 200 : 20 });
    fireEvent.change(node, { target: { value: 'long content' } });
    expect(node.style.height).toBe('80px');
    expect(node.style.overflowY).toBe('auto');
    fireEvent.change(node, { target: { value: 'a' } });
    expect(node.style.height).toBe('40px');
    expect(node.style.overflowY).toBe('hidden');
    rerender(<TextArea ref={ref} style={{ height: 100 }} autoSize={false} />);
    expect(node.style.height).toBe('100px');
  });
});
