import { StrictMode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useRefState } from './index.js';

describe('useRefState', () => {
  it('initializes lazily and retains setter/ref identities', () => {
    const initialize = vi.fn(() => 2);
    const h = renderHook(() => useRefState(initialize));
    const [, setter, ref] = h.result.current;
    act(() => setter(4));
    h.rerender();
    expect(initialize).toHaveBeenCalledTimes(1);
    expect(h.result.current).toEqual([4, setter, ref]);
    expect(ref.current).toBe(4);
  });
  it('writes the ref before rendering and composes consecutive functional updates', () => {
    const h = renderHook(() => useRefState(0));
    act(() => {
      h.result.current[1](value => value + 1);
      expect(h.result.current[2].current).toBe(1);
      expect(h.result.current[0]).toBe(0);
      h.result.current[1](value => value + 2);
      expect(h.result.current[2].current).toBe(3);
    });
    expect(h.result.current[0]).toBe(3);
  });
  it('does not run a functional updater twice in StrictMode', () => {
    const update = vi.fn((value: number) => value + 1);
    const h = renderHook(() => useRefState(() => 0), { wrapper: StrictMode });
    act(() => h.result.current[1](update));
    expect(update).toHaveBeenCalledTimes(1);
    expect(h.result.current[0]).toBe(1);
    expect(h.result.current[2].current).toBe(1);
  });
  it('stores function state without React invoking the resulting function', () => {
    const callback = vi.fn(() => 'new');
    const h = renderHook(() => useRefState<() => string>(() => () => 'old'));
    act(() => h.result.current[1](() => callback));
    expect(callback).not.toHaveBeenCalled();
    expect(h.result.current[0]).toBe(callback);
    expect(h.result.current[2].current).toBe(callback);
  });
});
