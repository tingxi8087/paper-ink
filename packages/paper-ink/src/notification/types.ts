import type { CSSProperties, ReactNode } from 'react';
export type NotificationType = 'success' | 'info' | 'warning' | 'error';
export type NotificationPlacement = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
export interface NotificationConfig { duration?: number; placement?: NotificationPlacement; top?: number; bottom?: number; maxCount?: number; getContainer?: () => HTMLElement; }
export interface NotificationArgs { duration?: number; placement?: NotificationPlacement; key?: string | number; message?: ReactNode; title?: ReactNode; description?: ReactNode; icon?: ReactNode; type?: NotificationType; btn?: ReactNode; closeIcon?: ReactNode; onClose?: () => void; onClick?: () => void; className?: string; style?: CSSProperties; role?: 'alert' | 'status'; }
export interface NotificationInstance { open: (args: NotificationArgs) => void; success: (args: NotificationArgs) => void; info: (args: NotificationArgs) => void; warning: (args: NotificationArgs) => void; error: (args: NotificationArgs) => void; destroy: (key?: string | number) => void; }
