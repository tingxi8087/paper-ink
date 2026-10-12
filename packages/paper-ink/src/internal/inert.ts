import { version, type HTMLAttributes } from 'react';

// React 18 forwards inert as a string attribute; React 19 treats it as boolean.
// Keep the DOM non-interactive during exit motion with either renderer/types.
export function inertAttributes(active: boolean): HTMLAttributes<HTMLDivElement> {
  return active ? { inert: Number.parseInt(version, 10) >= 19 ? true : '' } as HTMLAttributes<HTMLDivElement> : {};
}
