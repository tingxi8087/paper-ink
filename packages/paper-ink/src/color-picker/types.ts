import type { ButtonHTMLAttributes, ReactElement, ReactNode } from 'react';
import type { PopoverPlacement } from '../popover/types.js';
import type { Color, ColorFormat, ColorValue } from './color.js';
export interface ColorPreset { label: ReactNode; colors: ColorValue[] }
export interface ColorPickerProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value' | 'defaultValue' | 'onChange' | 'children'> {
  value?: ColorValue; defaultValue?: ColorValue;
  onChange?: (color: Color, css: string) => void; onChangeComplete?: (color: Color) => void;
  format?: ColorFormat; defaultFormat?: ColorFormat; onFormatChange?: (format: ColorFormat) => void;
  open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void;
  disabledAlpha?: boolean; disabledFormat?: boolean; allowClear?: boolean; onClear?: () => void;
  presets?: ColorPreset[]; showText?: boolean | ((color: Color) => ReactNode);
  size?: 'small' | 'middle' | 'large'; status?: 'error' | 'warning'; placement?: PopoverPlacement;
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;
  children?: ReactElement; destroyOnHidden?: boolean;
}
