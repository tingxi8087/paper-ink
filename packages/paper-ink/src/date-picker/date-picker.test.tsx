import dayjs from 'dayjs';
import { createRef } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DatePicker } from './index.js';
import { TimePicker } from '../time-picker/index.js';
import { ConfigProvider } from '../config-provider/index.js';
import type { PickerRef } from './types.js';
const enter = (input: HTMLElement, text: string) => { fireEvent.focus(input); fireEvent.change(input, { target: { value: text } }); fireEvent.keyDown(input, { key: 'Enter' }); };
describe('date and time control submission', () => {
  it('allows repairing linked time restrictions one column at a time', () => {
    const change=vi.fn();render(<TimePicker defaultValue={dayjs('2024-01-01 09:10:00')} format="HH:mm" disabledTime={() => ({disabledMinutes: hour => hour === 10 ? [10] : []})} onChange={change}/>);
    fireEvent.focus(screen.getByRole('combobox'));
    const columns=screen.getAllByRole('listbox');fireEvent.click(columns[0].querySelectorAll('button')[10]);
    expect(screen.getByRole('combobox')).toHaveValue('10:10');expect(screen.getByRole('button',{name:'确定'})).toBeDisabled();expect(change).not.toHaveBeenCalled();
    fireEvent.click(columns[1].querySelectorAll('button')[20]);fireEvent.click(screen.getByRole('button',{name:'确定'}));expect(change.mock.calls[0][1]).toBe('10:20');
  });
  it('confirms both edited range inputs atomically', () => {
    const change=vi.fn();render(<DatePicker.RangePicker needConfirm onChange={change}/>);
    const inputs=screen.getAllByRole('combobox');fireEvent.focus(inputs[0]);fireEvent.change(inputs[0],{target:{value:'2024-05-01'}});fireEvent.focus(inputs[1]);fireEvent.change(inputs[1],{target:{value:'2024-05-03'}});
    fireEvent.click(screen.getByRole('button',{name:'确定'}));expect(change).toHaveBeenCalledTimes(1);expect(change.mock.calls[0][1]).toEqual(['2024-05-01','2024-05-03']);
  });
  it('provides standalone theme variables and inherits provider theme in Portal', () => {
    const {container,rerender}=render(<DatePicker/>);expect((container.querySelector('.pi-picker') as HTMLElement).style.getPropertyValue('--pi-color-primary-solid')).not.toBe('');
    rerender(<ConfigProvider theme={{token:{color:{primary:{solid:'#123456'}}}}}><DatePicker defaultOpen/></ConfigProvider>);
    expect(screen.getByRole('dialog').style.getPropertyValue('--pi-color-primary-solid')).toBe('#123456');
  });
  it('finishes valid text on outside click and retains invalid text for correction', () => {
    const change=vi.fn();render(<><DatePicker onChange={change}/><button>outside</button></>);
    const input=screen.getByRole('combobox');fireEvent.focus(input);fireEvent.change(input,{target:{value:'2024-04-15'}});fireEvent.pointerDown(screen.getByText('outside'));expect(change.mock.calls[0][1]).toBe('2024-04-15');
    fireEvent.focus(input);fireEvent.change(input,{target:{value:'invalid'}});fireEvent.pointerDown(screen.getByText('outside'));expect(input).toHaveValue('invalid');expect(input).toHaveAttribute('aria-invalid','true');expect(change).toHaveBeenCalledTimes(1);
  });
  it('finishes both range text edits once when leaving the entire control', () => {
    const change=vi.fn();render(<><DatePicker.RangePicker onChange={change}/><button>outside</button></>);
    const inputs=screen.getAllByRole('combobox');fireEvent.focus(inputs[0]);fireEvent.change(inputs[0],{target:{value:'2024-05-01'}});fireEvent.focus(inputs[1]);fireEvent.change(inputs[1],{target:{value:'2024-05-03'}});fireEvent.pointerDown(screen.getByText('outside'));
    expect(change).toHaveBeenCalledTimes(1);expect(change.mock.calls[0][1]).toEqual(['2024-05-01','2024-05-03']);
  });
  it('editing after Escape reopens without replacing new text', () => {
    render(<TimePicker defaultValue={dayjs('2024-01-01 08:00:00')}/>);const input=screen.getByRole('combobox');fireEvent.focus(input);fireEvent.keyDown(input,{key:'Escape'});fireEvent.change(input,{target:{value:'09:00:00'}});expect(input).toHaveValue('09:00:00');expect(input).toHaveAttribute('aria-expanded','true');fireEvent.keyDown(input,{key:'Enter'});expect(input).toHaveValue('09:00:00');
  });
  it('strictly rejects impossible dates and Escape restores committed text', () => {
    const change = vi.fn(); render(<DatePicker defaultValue={dayjs('2024-02-20')} onChange={change} />);
    const input = screen.getByRole('combobox'); enter(input, '2024-02-30');
    expect(change).not.toHaveBeenCalled(); expect(input).toHaveAttribute('aria-invalid', 'true'); expect(input).toHaveValue('2024-02-30');
    fireEvent.keyDown(input, { key: 'Escape' }); expect(input).toHaveValue('2024-02-20'); expect(input).not.toHaveAttribute('aria-invalid');
  });
  it('submits normalized leap day once and preserves explicit controlled null', () => {
    const change = vi.fn(); const { rerender } = render(<DatePicker value={null} onChange={change} />);
    const input = screen.getByRole('combobox'); enter(input, '2024-02-29');
    expect(change.mock.calls[0][0].format('YYYY-MM-DD HH:mm:ss')).toBe('2024-02-29 00:00:00'); expect(input).toHaveValue('');
    rerender(<DatePicker value={dayjs('2024-02-29')} onChange={change} />); enter(input, '2024-02-29'); expect(change).toHaveBeenCalledTimes(1);
  });
  it('time input keeps carrier date, normalizes seconds, honors steps and confirms in order', () => {
    const events: string[] = []; const change = vi.fn(value => { events.push('change'); expect(value.format('YYYY-MM-DD HH:mm:ss')).toBe('2024-03-15 09:10:00'); });
    render(<TimePicker defaultValue={dayjs('2024-03-15 08:00:45')} format="HH:mm" minuteStep={5} onChange={change} onOk={() => events.push('ok')} />);
    const input = screen.getByRole('combobox'); enter(input, '09:11'); expect(change).not.toHaveBeenCalled(); expect(input).toHaveAttribute('aria-invalid', 'true');
    enter(input, '09:10'); expect(change).not.toHaveBeenCalled(); fireEvent.click(screen.getByRole('button', { name: '确定' })); expect(events).toEqual(['change', 'ok']);
  });
  it('sorts range only when completed and emits intermediate changes', () => {
    const change = vi.fn(), calendar = vi.fn(); render(<DatePicker.RangePicker onChange={change} onCalendarChange={calendar} />);
    const inputs = screen.getAllByRole('combobox'); enter(inputs[0], '2024-05-20'); expect(change).not.toHaveBeenCalled(); enter(inputs[1], '2024-05-10');
    expect(calendar).toHaveBeenCalledTimes(2); expect(change.mock.calls[0][1]).toEqual(['2024-05-10','2024-05-20']);
  });
  it('does not reorder a disabled endpoint and revalidates sorted contextual rules', () => {
    const change = vi.fn(); render(<DatePicker.RangePicker defaultValue={[dayjs('2024-05-20'), dayjs('2024-05-25')]} disabled={[true,false]} onChange={change} />);
    const inputs = screen.getAllByRole('combobox'); enter(inputs[1], '2024-05-10'); expect(change).not.toHaveBeenCalled();
  });
  it('allows empty range endpoint but clears all to null', () => {
    const change = vi.fn(); render(<DatePicker.RangePicker allowEmpty={[false,true]} onChange={change} />);
    enter(screen.getAllByRole('combobox')[0], '2024-06-01'); expect(change.mock.calls[0][0][1]).toBeNull();
    fireEvent.click(screen.getByRole('button',{name:'清空'})); expect(change).toHaveBeenLastCalledWith(null,['','']);
  });
  it('external changes reset dirty input and forwarded focus honors options', () => {
    const ref=createRef<PickerRef>(); const {rerender}=render(<DatePicker ref={ref} value={dayjs('2024-01-01')} />);
    const input=screen.getByRole('combobox'); fireEvent.change(input,{target:{value:'bad'}}); rerender(<DatePicker ref={ref} value={dayjs('2024-02-01')} />);
    expect(input).toHaveValue('2024-02-01'); ref.current?.focus({preventScroll:true}); expect(input).toHaveFocus(); ref.current?.blur(); expect(input).not.toHaveFocus();
  });
  it('discarded time drafts do not leak after reopening', () => {
    const change=vi.fn(); render(<TimePicker defaultValue={dayjs('2024-01-01 08:00:00')} onChange={change} />);
    const input=screen.getByRole('combobox'); enter(input,'09:30:00'); fireEvent.keyDown(input,{key:'Escape'}); expect(input).toHaveValue('08:00:00'); expect(change).not.toHaveBeenCalled();
  });
  it('rechecks changed restrictions without changing business value', async () => {
    const change=vi.fn();const {rerender}=render(<DatePicker showTime defaultValue={dayjs('2024-01-01 08:00:00')} onChange={change}/>);
    enter(screen.getByRole('combobox'),'2024-01-02 09:00:00'); expect(screen.getByRole('button',{name:'确定'})).not.toBeDisabled();
    rerender(<DatePicker showTime defaultValue={dayjs('2024-01-01 08:00:00')} maxDate={dayjs('2024-01-01')} onChange={change}/>);
    await waitFor(()=>expect(screen.getByRole('button',{name:'确定'})).toBeDisabled());expect(change).not.toHaveBeenCalled();
  });
});
