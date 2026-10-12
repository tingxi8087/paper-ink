import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';

type Entry<T> = { key: string; value: T };
function read<T>(initialState: T | (() => T), key: string): Entry<T> {
  try {
    const saved = localStorage.getItem(key);
    if (saved !== null) return { key, value: JSON.parse(saved) as T };
  } catch { /* Unavailable storage or invalid JSON falls back to the initial value. */ }
  return { key, value: typeof initialState === 'function' ? (initialState as () => T)() : initialState };
}

/** Like useState(initialState), with a second argument for the localStorage key. */
export function useLocalstorageState<T>(initialState: T | (() => T), storageKey: string): [T, Dispatch<SetStateAction<T>>] {
  const [entry, setEntry] = useState(() => read(initialState, storageKey));
  let current = entry;
  if (entry.key !== storageKey) {
    // Adjust during render rather than persisting the previous key's value to
    // the new key in an effect. React retries this component before committing.
    current = read(initialState, storageKey);
    setEntry(current);
  }
  const latest = useRef(current);
  latest.current = current;
  const setValue = useCallback<Dispatch<SetStateAction<T>>>((update) => {
    const active = latest.current;
    setEntry(previous => {
      const previousValue = previous.key === active.key ? previous.value : active.value;
      const value = typeof update === 'function' ? (update as (value: T) => T)(previousValue) : update;
      return previous.key === active.key && Object.is(previous.value, value) ? previous : { key: active.key, value };
    });
  }, []);
  useEffect(() => {
    try {
      const saved = JSON.stringify(current.value);
      if (saved === undefined) localStorage.removeItem(current.key);
      else localStorage.setItem(current.key, saved);
    } catch { /* Persistence is optional; state updates still work if it fails. */ }
  }, [current]);
  return [current.value, setValue];
}
