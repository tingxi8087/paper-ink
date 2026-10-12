import { forwardRef } from 'react';
import { DateTimeControl } from '../internal/date-time-control.js';
import { defineFieldBinding } from '../internal/field-binding.js';
import type { PickerRef, TimePickerProps } from '../internal/date-time-types.js';
export const TimePicker = defineFieldBinding(forwardRef<PickerRef, TimePickerProps>(function TimePicker(props, ref) { return <DateTimeControl {...props} timeOnly ref={ref} />; }), { toControlValue: (value: unknown) => value ?? null, defaultProps: ['defaultValue'] });
export { zhCN, enUS } from '../internal/date-time.js';
export type { TimePickerProps, PickerRef, PickerLocale, DisabledTime } from '../internal/date-time-types.js';
