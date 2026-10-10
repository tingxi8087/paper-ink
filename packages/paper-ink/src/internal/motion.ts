import { useEffect, useState } from 'react';

export function motionDuration(duration: number) {
  return typeof window !== 'undefined' && window.matchMedia && !window.matchMedia('(prefers-reduced-motion: reduce)').matches ? duration : 0;
}

/** Keep exits mounted without delaying controlled state or restarting keyed content updates. */
export function usePresence(open: boolean, duration: number) {
  const [retained, setRetained] = useState(open);
  useEffect(() => {
    if (open) { setRetained(true); return; }
    const delay = motionDuration(duration);
    if (!delay) { setRetained(false); return; }
    const timer = window.setTimeout(() => setRetained(false), delay);
    return () => window.clearTimeout(timer);
  }, [open, duration]);
  return open || retained;
}
