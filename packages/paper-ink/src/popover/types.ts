import type { CSSProperties, ReactNode } from 'react';
export type PopoverPlacement = 'top' | 'topLeft' | 'topRight' | 'bottom' | 'bottomLeft' | 'bottomRight' | 'left' | 'leftTop' | 'leftBottom' | 'right' | 'rightTop' | 'rightBottom';
export interface PopoverProps {
  title?: ReactNode | (() => ReactNode);
  content?: ReactNode | (() => ReactNode);
  children: ReactNode;
  placement?: PopoverPlacement;
  trigger?: 'hover' | 'focus' | 'click' | Array<'hover' | 'focus' | 'click'>;
  mouseEnterDelay?: number;
  mouseLeaveDelay?: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  destroyOnHidden?: boolean;
  color?: string;
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;
  className?: string;
  style?: CSSProperties;
  overlayClassName?: string;
  overlayStyle?: CSSProperties;
  zIndex?: number;
  autoAdjustOverflow?: boolean;
}
