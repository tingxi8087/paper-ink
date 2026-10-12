import type { Dayjs } from 'dayjs';
import type { AriaAttributes, CSSProperties, FocusEventHandler, ReactNode } from 'react';
import type { DisabledTime, Picker, PickerLocale, TimeOptions } from './date-time.js';
export type { DisabledTime, Picker, PickerLocale, TimeOptions } from './date-time.js';
export type DateValue = Dayjs | null;
export type RangeValue = [DateValue, DateValue] | null;
export type RangeTexts = [string, string];
export interface PickerRef { focus(options?: FocusOptions): void; blur(): void }
export interface PickerCommonProps extends AriaAttributes {
  format?: string; size?: 'small' | 'middle' | 'large'; status?: '' | 'error' | 'warning'; allowClear?: boolean; inputReadOnly?: boolean;
  className?: string; style?: CSSProperties; prefix?: ReactNode; suffixIcon?: ReactNode; id?: string;
  onFocus?: FocusEventHandler<HTMLInputElement>; onBlur?: FocusEventHandler<HTMLInputElement>;
  open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void;
  placement?: 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight'; getPopupContainer?: (trigger: HTMLElement) => HTMLElement;
  locale?: PickerLocale; needConfirm?: boolean; renderExtraFooter?: () => ReactNode;
}
export interface DateRules { picker?: Picker; showTime?: boolean | TimeOptions; minDate?: Dayjs; maxDate?: Dayjs; disabledDate?: (current: Dayjs, info: { type: Picker; from?: Dayjs }) => boolean }
export interface DatePickerProps extends PickerCommonProps, DateRules {
  value?: DateValue; defaultValue?: DateValue; onChange?: (value: DateValue, text: string) => void; placeholder?: string; disabled?: boolean;
  disabledTime?: (date: Dayjs) => DisabledTime; onOk?: (value: Dayjs) => void;
  presets?: { label: ReactNode; value: Dayjs | (() => Dayjs) }[];
}
export interface RangePickerProps extends PickerCommonProps, DateRules {
  value?: RangeValue; defaultValue?: RangeValue; onChange?: (values: RangeValue, texts: RangeTexts) => void; placeholder?: [string, string]; disabled?: boolean | [boolean, boolean]; allowEmpty?: [boolean, boolean];
  disabledTime?: (date: Dayjs, partial: 'start' | 'end', info: { from?: Dayjs }) => DisabledTime;
  onOk?: (values: [DateValue, DateValue]) => void;
  onCalendarChange?: (values: [DateValue, DateValue], texts: RangeTexts, info: { range: 'start' | 'end' }) => void;
  presets?: { label: ReactNode; value: [Dayjs, Dayjs] | (() => [Dayjs, Dayjs]) }[];
}
export interface TimePickerProps extends PickerCommonProps, TimeOptions {
  value?: DateValue; defaultValue?: DateValue; onChange?: (value: DateValue, text: string) => void; placeholder?: string; disabled?: boolean;
  disabledTime?: (date: Dayjs) => DisabledTime; onOk?: (value: Dayjs) => void;
}
