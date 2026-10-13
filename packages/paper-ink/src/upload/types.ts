import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
export interface UploadFile<T = unknown> {
  uid: string;
  name: string;
  size?: number;
  type?: string;
  originFileObj?: File;
  status: 'idle' | 'uploading' | 'done' | 'error' | 'cancelled';
  percent?: number;
  url?: string;
  response?: T;
  error?: Error;
}
export type UploadChangeInfo<T = unknown> =
  | { type: 'add' | 'remove'; fileList: UploadFile<T>[]; files: UploadFile<T>[]; removedFiles?: never }
  | { type: 'replace'; fileList: UploadFile<T>[]; files: UploadFile<T>[]; removedFiles: UploadFile<T>[] };
export interface UploadRejection { file: File; reason: 'type' | 'count' | 'validation'; message: string }
export interface UploadRef { open(): void; focus(): void; readonly nativeElement: HTMLDivElement | null }
export interface UploadProps<T = unknown> extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'onDrop' | 'children'> {
  fileList?: readonly UploadFile<T>[];
  defaultFileList?: readonly UploadFile<T>[];
  onChange?: (info: UploadChangeInfo<T>) => void;
  accept?: string;
  multiple?: boolean;
  maxCount?: number;
  validate?: (file: File, batch: readonly File[]) => string | undefined | Promise<string | undefined>;
  listType?: 'text' | 'picture' | 'picture-card';
  showUploadList?: boolean;
  onRemove?: (file: UploadFile<T>) => boolean | void | Promise<boolean | void>;
  onPreview?: (file: UploadFile<T>) => void;
  onCancel?: (file: UploadFile<T>) => void;
  onRetry?: (file: UploadFile<T>) => void;
  onReject?: (rejections: UploadRejection[]) => void;
  disabled?: boolean;
  status?: 'error' | 'warning';
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}
