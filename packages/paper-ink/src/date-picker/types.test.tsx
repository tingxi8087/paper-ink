import { it, expect } from 'vitest';
import { createRef } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { DatePicker, type PickerRef, type RangeValue } from './index.js';
import { TimePicker } from '../time-picker/index.js';
function TypedPickers() {
  const ref = createRef<PickerRef>();
  const single = <DatePicker ref={ref} defaultValue={dayjs()} onChange={(value, text) => { const date: Dayjs | null = value; const formatted: string = text; void date; void formatted; }} />;
  const range = <DatePicker.RangePicker value={null} allowEmpty={[true, false]} onChange={(values, texts) => { const value: RangeValue = values; const strings: [string, string] = texts; void value; void strings; }} disabledTime={(date, partial, info) => { const endpoint: 'start' | 'end' = partial; const from: Dayjs | undefined = info.from; void date; void endpoint; void from; return { disabledHours: () => [0] }; }} />;
  const time = <TimePicker format="HH:mm" minuteStep={5} disabledTime={date => ({ disabledMinutes: hour => hour === date.hour() ? [10] : [] })} />;
  // @ts-expect-error values must be Dayjs, not strings
  const invalidDate = <DatePicker value="2026-10-12" />;
  // @ts-expect-error a date range is a pair, not a single Dayjs
  const invalidRange = <DatePicker.RangePicker value={dayjs()} />;
  // @ts-expect-error week mode is outside the first release
  const invalidMode = <DatePicker picker="week" />;
  // @ts-expect-error TimePicker has no date-mode selection
  const invalidTime = <TimePicker picker="month" />;
  return <>{single}{range}{time}{invalidDate}{invalidRange}{invalidMode}{invalidTime}</>;
}
it('keeps public picker types checked by tsc', () => expect(typeof TypedPickers).toBe('function'));
