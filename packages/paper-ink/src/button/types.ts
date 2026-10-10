import type { ButtonHTMLAttributes, CSSProperties, MouseEventHandler, ReactNode } from 'react';
export type ButtonColor = 'default' | 'primary' | 'danger';
export type ButtonVariant = 'outlined' | 'dashed' | 'solid' | 'filled' | 'text' | 'link';
export type ButtonSemantic = 'root' | 'icon' | 'content';
export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'onClick' | 'color'> {
  type?: 'default' | 'primary' | 'dashed' | 'text' | 'link';
  color?: ButtonColor;
  variant?: ButtonVariant;
  size?: 'small' | 'middle' | 'large';
  shape?: 'default' | 'circle' | 'round';
  htmlType?: 'button' | 'submit' | 'reset';
  loading?: boolean | { delay?: number; icon?: ReactNode };
  danger?: boolean; ghost?: boolean; block?: boolean;
  icon?: ReactNode;
  iconPlacement?: 'start' | 'end';
  /** @deprecated Use iconPlacement. */
  iconPosition?: 'start' | 'end';
  autoInsertSpace?: boolean;
  rootClassName?: string;
  classNames?: Partial<Record<ButtonSemantic, string>>;
  styles?: Partial<Record<ButtonSemantic, CSSProperties>>;
  href?: string; target?: string; rel?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  style?: CSSProperties;
}
