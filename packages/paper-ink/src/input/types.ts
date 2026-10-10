import type { ChangeEventHandler, InputHTMLAttributes, KeyboardEventHandler, ReactNode, TextareaHTMLAttributes } from 'react';

export interface InputFocusOptions extends FocusOptions { cursor?: 'start' | 'end' | 'all' }
export interface InputRef {
  input: HTMLInputElement | null;
  nativeElement: HTMLElement | null;
  focus: (options?: InputFocusOptions) => void;
  blur: () => void;
  select: () => void;
  setSelectionRange: (start: number, end: number, direction?: 'forward' | 'backward' | 'none') => void;
}
export interface TextAreaRef {
  nativeElement: HTMLElement | null;
  resizableTextArea: { textArea: HTMLTextAreaElement | null };
  focus: (options?: InputFocusOptions) => void;
  blur: () => void;
  select: () => void;
  setSelectionRange: (start: number, end: number, direction?: 'forward' | 'backward' | 'none') => void;
}
export type ShowCount = boolean | { formatter?: (info: { value: string; count: number; maxLength?: number }) => ReactNode };
export interface SharedInputProps {
  size?: 'small' | 'middle' | 'large';
  status?: '' | 'error' | 'warning';
  allowClear?: boolean | { clearIcon?: ReactNode };
  onClear?: () => void;
  showCount?: ShowCount;
  rootClassName?: string;
}
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'>, SharedInputProps {
  prefix?: ReactNode;
  suffix?: ReactNode;
  onPressEnter?: KeyboardEventHandler<HTMLInputElement>;
  onChange?: ChangeEventHandler<HTMLInputElement>;
}
export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, SharedInputProps {
  autoSize?: boolean | { minRows?: number; maxRows?: number };
  onPressEnter?: KeyboardEventHandler<HTMLTextAreaElement>;
  onChange?: ChangeEventHandler<HTMLTextAreaElement>;
}
