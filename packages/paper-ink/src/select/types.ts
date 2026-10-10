import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

export type SelectRawValue = string | number;
export type SelectValue = SelectRawValue | SelectRawValue[] | undefined;
export interface SelectOption { value: SelectRawValue; label?: ReactNode; disabled?: boolean; title?: string }
export interface SelectRef { nativeElement: HTMLDivElement | null; focus: (options?: FocusOptions) => void; blur: () => void }
export interface SelectProps<ValueType extends SelectValue = SelectValue> extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'onSelect' | 'defaultValue' | 'prefix'> {
  options?: SelectOption[];
  value?: ValueType;
  defaultValue?: ValueType;
  mode?: 'multiple' | 'tags';
  onChange?: (value: ValueType, option: SelectOption | SelectOption[] | undefined) => void;
  onSelect?: (value: SelectRawValue, option: SelectOption) => void;
  onDeselect?: (value: SelectRawValue, option: SelectOption) => void;
  showSearch?: boolean;
  filterOption?: boolean | ((inputValue: string, option: SelectOption) => boolean);
  optionFilterProp?: 'value' | 'label';
  onSearch?: (value: string) => void;
  searchValue?: string;
  allowClear?: boolean | { clearIcon?: ReactNode };
  onClear?: () => void;
  disabled?: boolean;
  status?: '' | 'error' | 'warning';
  size?: 'small' | 'middle' | 'large';
  placeholder?: ReactNode;
  loading?: boolean;
  notFoundContent?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;
  rootClassName?: string;
  style?: CSSProperties;
  name?: string;
  form?: string;
  autoFocus?: boolean;
}
