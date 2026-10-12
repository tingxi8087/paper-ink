import type { ComponentRef, Context, ElementType, JSXElementConstructor, Ref } from 'react';

/** Component props, context value, or an existing props object. */
export type GetProps<T> = T extends Context<infer Value> ? Value : T extends JSXElementConstructor<infer Props> ? Props : T extends object ? T : never;
type ResolveReturn<T> = T extends (...args: any[]) => infer Result ? Result : never;
/** A non-nullable prop; Return extracts the return type of its callable members. */
export type GetProp<T, Key extends keyof GetProps<T>, Mode extends 'Return' | undefined = undefined> = Mode extends 'Return' ? ResolveReturn<NonNullable<GetProps<T>[Key]>> : NonNullable<GetProps<T>[Key]>;
/** Ref target from a component, native element name, or props object with a ref. */
export type GetRef<T> = T extends ElementType ? ComponentRef<T> : GetProps<T> extends { ref?: Ref<infer Target> | undefined } ? Target : never;
