import { StrictMode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { useLocalstorageState } from './index.js';

beforeEach(() => localStorage.clear());
it('restores JSON including falsy values and avoids evaluating a cached initializer', () => {
  localStorage.setItem('count', '0'); const initial = vi.fn(() => 10);
  const h = renderHook(() => useLocalstorageState(initial, 'count'));
  expect(h.result.current[0]).toBe(0); expect(initial).not.toHaveBeenCalled();
  localStorage.setItem('nullable', 'null');
  const nullable = renderHook(() => useLocalstorageState<string | null>('default', 'nullable'));
  expect(nullable.result.current[0]).toBeNull();
});
it('initializes, persists and restores object edits after remount', () => {
  const h = renderHook(() => useLocalstorageState({ name: '', enabled: false }, 'settings'));
  act(() => h.result.current[1](previous => ({ ...previous, name: 'Paper Ink' })));
  expect(JSON.parse(localStorage.getItem('settings')!)).toEqual({ name: 'Paper Ink', enabled: false }); h.unmount();
  const restored = renderHook(() => useLocalstorageState({ name: '', enabled: true }, 'settings'));
  expect(restored.result.current[0]).toEqual({ name: 'Paper Ink', enabled: false });
});
it('composes batched functional updates and keeps the setter stable', () => {
  const h = renderHook(() => useLocalstorageState(0, 'count')); const set = h.result.current[1];
  act(() => { set(n => n + 1); set(n => n + 1); });
  expect(h.result.current[0]).toBe(2); expect(localStorage.getItem('count')).toBe('2'); expect(h.result.current[1]).toBe(set);
});
it('switches keys without writing the old value over the new slot', () => {
  localStorage.setItem('a', '3'); localStorage.setItem('b', '7');
  const h = renderHook(({ key }) => useLocalstorageState(0, key), { initialProps: { key: 'a' } });
  const set = h.result.current[1]; h.rerender({ key: 'b' });
  expect(h.result.current[0]).toBe(7); expect(localStorage.getItem('b')).toBe('7'); expect(localStorage.getItem('a')).toBe('3');
  act(() => set(n => n + 1)); expect(localStorage.getItem('b')).toBe('8'); expect(h.result.current[1]).toBe(set);
  h.rerender({ key: 'new' }); expect(h.result.current[0]).toBe(0); expect(localStorage.getItem('new')).toBe('0');
});
it('uses initialization only for a missing key, not for changed initial props', () => {
  const initial = vi.fn(() => 4); localStorage.setItem('bad', '{');
  const h = renderHook(({ value }: { value: () => number }) => useLocalstorageState(value, 'bad'), { initialProps: { value: initial as () => number } });
  expect(h.result.current[0]).toBe(4); expect(localStorage.getItem('bad')).toBe('4'); expect(initial).toHaveBeenCalledTimes(1);
  h.rerender({ value: () => 8 }); expect(h.result.current[0]).toBe(4);
});
it('state still works when storage is blocked or full', () => {
  const read = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
  const write = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('full'); });
  try { const h = renderHook(() => useLocalstorageState(1, 'blocked')); act(() => h.result.current[1](9)); expect(h.result.current[0]).toBe(9); }
  finally { read.mockRestore(); write.mockRestore(); }
});
it('undefined removes the storage entry; unserializable data does not break state', () => {
  const h = renderHook(() => useLocalstorageState<number | undefined>(1, 'optional'));
  act(() => h.result.current[1](undefined)); expect(h.result.current[0]).toBeUndefined(); expect(localStorage.getItem('optional')).toBeNull();
  const object = renderHook(() => useLocalstorageState<Record<string, unknown>>({}, 'object'));
  const cyclic: Record<string, unknown> = {}; cyclic.self = cyclic;
  act(() => object.result.current[1](cyclic)); expect(object.result.current[0]).toBe(cyclic); expect(localStorage.getItem('object')).toBe('{}');
});
it('remains correct through StrictMode effect replay and key changes', () => {
  const h = renderHook(({ key }) => useLocalstorageState(0, key), { wrapper: StrictMode, initialProps: { key: 'a' } });
  act(() => h.result.current[1](n => n + 1)); expect(h.result.current[0]).toBe(1); expect(localStorage.getItem('a')).toBe('1');
  localStorage.setItem('b', '5'); h.rerender({ key: 'b' }); expect(h.result.current[0]).toBe(5); expect(localStorage.getItem('b')).toBe('5');
});
