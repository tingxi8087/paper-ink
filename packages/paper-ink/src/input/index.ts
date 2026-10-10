import { InputControl } from './input.js';
import { TextArea } from './text-area.js';
import { Search } from './search.js';
import { Password } from './password.js';
export const Input = Object.assign(InputControl, { TextArea, Search, Password });
export { TextArea, Search, Password };
export type { InputProps, InputRef, TextAreaProps, TextAreaRef, InputFocusOptions, ShowCount, SearchProps, PasswordProps } from './types.js';
