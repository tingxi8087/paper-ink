import type { CSSProperties, ReactNode } from 'react';
export type MessageType = 'success' | 'error' | 'info' | 'warning' | 'loading';
export interface MessageArgs { content: ReactNode; key?: string | number; type?: MessageType; duration?: number; onClose?: () => void; icon?: ReactNode; className?: string; style?: CSSProperties }
export interface MessageConfig { duration?: number; maxCount?: number; top?: number | string; getContainer?: () => HTMLElement }
export interface MessageHandle extends PromiseLike<boolean> { (): void }
export type MessageMethod = (content: ReactNode | MessageArgs, duration?: number | (() => void), onClose?: () => void) => MessageHandle;
export interface MessageInstance { open: (config: MessageArgs) => MessageHandle; success: MessageMethod; error: MessageMethod; info: MessageMethod; warning: MessageMethod; loading: MessageMethod; destroy: (key?: string | number) => void }
