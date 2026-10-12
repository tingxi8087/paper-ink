import { createContext, forwardRef } from 'react';
import { expectTypeOf, it } from 'vitest';
import { Input } from '../input/index';
import type { InputRef } from '../input/types';
import type { GetProps, GetProp, GetRef } from './index';
const context = createContext({name:'paper'});
const component = forwardRef<HTMLInputElement, {label:string}>((props, ref) => <input ref={ref} aria-label={props.label} />);
interface Props { options?: {value:string}[] | null; onChange?: (value:number) => string; ref?: React.Ref<HTMLDivElement>; }
it('extracts props, non-nullable fields, function returns and ref targets', () => {
  expectTypeOf<GetProps<typeof component>>().toMatchTypeOf<{label:string}>();
  expectTypeOf<GetProps<typeof context>>().toEqualTypeOf<{name:string}>();
  expectTypeOf<GetProps<Props>>().toEqualTypeOf<Props>();
  expectTypeOf<GetProp<Props,'options'>>().toEqualTypeOf<{value:string}[]>();
  expectTypeOf<GetProp<Props,'onChange','Return'>>().toEqualTypeOf<string>();
  expectTypeOf<GetRef<typeof component>>().toEqualTypeOf<HTMLInputElement>();
  expectTypeOf<GetRef<typeof Input>>().toEqualTypeOf<InputRef>();
  expectTypeOf<GetRef<Props>>().toEqualTypeOf<HTMLDivElement>();
  expectTypeOf<GetRef<'button'>>().toEqualTypeOf<HTMLButtonElement>();
});
// @ts-expect-error Property names are constrained to the extracted props.
type Invalid = GetProp<Props, 'missing'>;
