import dayjs, { type Dayjs } from 'dayjs';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Form, useForm, useFormState, type FormInstance } from '../form/index.js';
import { DatePicker } from './index.js';
import { TimePicker } from '../time-picker/index.js';

describe('date and time Form integration', () => {
  it('binds Dayjs fields, resets initial values, and retains previous-value snapshots', () => {
    let form!: FormInstance<{ date: Dayjs | null; time: Dayjs | null }>;
    const changed = vi.fn();
    const baseline = dayjs('2026-10-12');
    function Demo() {
      form = useForm({ defaultValues: { date: baseline as Dayjs | null, time: null as Dayjs | null } });
      const { dirty } = useFormState(form);
      return <Form form={form} onValuesChange={changed}>
        <Form.Field name="date" label="日期"><DatePicker /></Form.Field>
        <Form.Field name="time" label="时间"><TimePicker format="HH:mm" needConfirm={false} /></Form.Field>
        <output>{dirty ? 'dirty' : 'clean'}</output>
        <button type="button" onClick={() => form.reset()}>重置</button>
      </Form>;
    }
    render(<Demo />);
    const input = screen.getByLabelText('日期');
    fireEvent.focus(input); fireEvent.change(input, { target: { value: '2026-10-20' } }); fireEvent.keyDown(input, { key: 'Enter' });
    expect(form.getValues().date?.format('YYYY-MM-DD')).toBe('2026-10-20');
    expect(screen.getByText('dirty')).toBeVisible();
    expect(changed.mock.calls[0][2].previousValues.date.format('YYYY-MM-DD')).toBe('2026-10-12');
    fireEvent.focus(input); fireEvent.change(input, { target: { value: '2026-10-12' } }); fireEvent.keyDown(input, { key: 'Enter' });
    expect(screen.getByText('clean')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: '重置' }));
    expect(input).toHaveValue('2026-10-12'); expect(screen.getByText('clean')).toBeVisible();
    expect(form.getValues().date).toBe(baseline);
    const time = screen.getByLabelText('时间');
    fireEvent.focus(time); fireEvent.change(time, { target: { value: '09:15' } }); fireEvent.keyDown(time, { key: 'Enter' });
    expect(form.getValues().time?.format('HH:mm')).toBe('09:15');
    expect(changed.mock.calls[0][2].previousValues.date.format('YYYY-MM-DD')).toBe('2026-10-12');
  });
  it('uses one top-level range field and forwards required/error relationships to both inputs', async () => {
    let form!: FormInstance<{ range: [Dayjs | null, Dayjs | null] | null }>;
    function Demo() {
      form = useForm({ defaultValues: { range: null as [Dayjs | null, Dayjs | null] | null } });
      return <Form form={form}><Form.Field name="range" label="范围" required><DatePicker.RangePicker /></Form.Field><button>提交</button></Form>;
    }
    render(<Demo />);
    fireEvent.click(screen.getByRole('button', { name: '提交' }));
    const inputs = screen.getAllByRole('combobox');
    expect(inputs[0]).toHaveAttribute('aria-required', 'true'); expect(inputs[1]).toHaveAttribute('aria-required', 'true');
    // asynchronous Form validation applies the same error to both endpoints
    expect(await screen.findByText('请填写范围')).toBeVisible();
    expect(inputs[0]).toHaveAttribute('aria-invalid', 'true'); expect(inputs[1]).toHaveAttribute('aria-invalid', 'true');
    for (const [index, value] of ['2026-10-12', '2026-10-20'].entries()) {
      fireEvent.focus(inputs[index]); fireEvent.change(inputs[index], { target: { value } }); fireEvent.keyDown(inputs[index], { key: 'Enter' });
    }
    expect(form.getValues().range?.map(value => value?.format('YYYY-MM-DD'))).toEqual(['2026-10-12', '2026-10-20']);
  });
});
