import { useCallback, useRef, useState, type Dispatch, type SetStateAction } from 'react';

export type ReadonlyStateRef<T> = { readonly current: T };

/** Updates the ref immediately; React renders the resulting state on its normal schedule. */
export function useRefState<T>(initialState: T | (() => T)): [T, Dispatch<SetStateAction<T>>, ReadonlyStateRef<T>] {
  const [state, setState] = useState(initialState);
  const stateRef = useRef(state);
  const setRefState = useCallback<Dispatch<SetStateAction<T>>>((value) => {
    const next = typeof value === 'function' ? (value as (previous: T) => T)(stateRef.current) : value;
    stateRef.current = next;
    // Wrapping also supports storing a function as the state value.
    setState(() => next);
  }, []);
  return [state, setRefState, stateRef];
}
