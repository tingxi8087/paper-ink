import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { InputNumber } from './index';
import { useState } from 'react';
describe('InputNumber', () => {
  it('steps precisely with stringMode and stays inside bounds', async () => {
    const user = userEvent.setup(); const change = vi.fn();
    render(<InputNumber stringMode defaultValue="0.000000000000000001" step="0.000000000000000001" max="0.000000000000000003" onChange={change} />);
    await user.click(screen.getByRole('button', {name:'增加'}));
    expect(change).toHaveBeenLastCalledWith('0.000000000000000002');
    await user.click(screen.getByRole('button', {name:'增加'}));
    expect(screen.getByRole('button',{name:'增加'})).toBeDisabled();
    expect(screen.getByRole('spinbutton')).toHaveValue('0.000000000000000003');
  });
  it('preserves typing intermediates and commits bounds on blur', async () => {
    const user = userEvent.setup(); const change = vi.fn();
    render(<InputNumber min={0} max={10} onChange={change} />);
    const input=screen.getByRole('spinbutton'); await user.type(input,'-');
    expect(input).toHaveValue('-'); expect(change).not.toHaveBeenCalled();
    await user.clear(input); await user.type(input,'12'); expect(input).toHaveValue('12');
    await user.tab(); expect(input).toHaveValue('10'); expect(change).toHaveBeenLastCalledWith(10);
  });
  it('supports formatter parser and preserves controlled decimal suffix while typing', async () => {
    function Demo() { const [value,setValue]=useState<number|string|null>(1); return <InputNumber value={value} onChange={setValue} formatter={(value, info)=>info.userTyping ? info.input : `$ ${value ?? ''}`} parser={text=>text?.replace(/\$\s*/g,'') ?? ''} />; }
    const user=userEvent.setup();render(<Demo />);const input=screen.getByRole('spinbutton');
    await user.clear(input); await user.type(input,'1.20'); expect(input).toHaveValue('1.20');
    await user.tab(); expect(input).toHaveValue('$ 1.2');
  });
  it('resets uncontrolled form values', async () => {
    render(<form><InputNumber defaultValue={2} /><button type="reset">Reset</button></form>);
    fireEvent.change(screen.getByRole('spinbutton'),{target:{value:'4'}}); fireEvent.click(screen.getByText('Reset'));
    await waitFor(() => expect(screen.getByRole('spinbutton')).toHaveValue('2'));
  });
  it('rounds with decimal arithmetic on blur and keyboard step', async () => {
    const user=userEvent.setup();render(<InputNumber defaultValue={0.1} step={0.2} precision={2} />);
    const input=screen.getByRole('spinbutton');await user.click(input);await user.keyboard('{ArrowUp}');expect(input).toHaveValue('0.30');
    await user.clear(input);await user.type(input,'1.005');await user.tab();expect(input).toHaveValue('1.01');
  });
  it('prioritizes bounds when rounding would cross both boundaries', async () => {
    const user=userEvent.setup();const change=vi.fn();render(<InputNumber stringMode defaultValue="0.005" step="0.001" min="0.001" max="0.009" precision={2} onChange={change} />);
    await user.click(screen.getByRole('button',{name:'增加'}));expect(change).toHaveBeenLastCalledWith('0.006');expect(screen.getByRole('spinbutton')).toHaveValue('0.006');
  });

});
