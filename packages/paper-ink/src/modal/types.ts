import type { CSSProperties, HTMLAttributes, MouseEvent, ReactNode } from 'react';
import type { ButtonProps } from '../button/types.js';

export interface ModalProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'children' | 'onCancel'> {
  open?: boolean;
  title?: ReactNode;
  children?: ReactNode;
  onOk?: (event: MouseEvent<HTMLElement>) => void;
  onCancel?: (event: MouseEvent<HTMLElement> | KeyboardEvent) => void;
  confirmLoading?: boolean;
  footer?: ReactNode;
  width?: number | string;
  /** Vertically center the dialog. @default true */
  centered?: boolean;
  mask?: boolean;
  maskClosable?: boolean;
  keyboard?: boolean;
  closable?: boolean;
  okText?: ReactNode;
  cancelText?: ReactNode;
  okButtonProps?: ButtonProps;
  cancelButtonProps?: ButtonProps;
  afterClose?: () => void;
  destroyOnHidden?: boolean;
  forceRender?: boolean;
  getContainer?: HTMLElement | (() => HTMLElement) | string | false;
  rootClassName?: string;
  style?: CSSProperties;
  zIndex?: number;
  focusTriggerAfterClose?: boolean;
}
