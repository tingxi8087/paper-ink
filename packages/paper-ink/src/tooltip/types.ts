import type { CSSProperties, ReactNode } from 'react';
export type TooltipPlacement = 'top' | 'topLeft' | 'topRight' | 'bottom' | 'bottomLeft' | 'bottomRight' | 'left' | 'leftTop' | 'leftBottom' | 'right' | 'rightTop' | 'rightBottom';
export interface TooltipProps {
  title?: ReactNode | (() => ReactNode);
  children: ReactNode;
  placement?: TooltipPlacement;
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
  autoAdjustOverflow?: boolean;
}
