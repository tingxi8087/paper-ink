import { InputControl } from './input.js';
import { TextArea } from './text-area.js';
export const Input = Object.assign(InputControl, { TextArea });
export { TextArea };
export type { InputProps, InputRef, TextAreaProps, TextAreaRef, InputFocusOptions, ShowCount } from './types.js';
