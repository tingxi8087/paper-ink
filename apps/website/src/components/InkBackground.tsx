import { useEffect, useId, useRef, useState } from 'react';

type InkMode = 'home' | 'docs';
const drops = [
  { x: 210, y: 115, scale: 1, phase: 0 },
  { x: 108, y: 185, scale: .46, phase: -3 },
  { x: 277, y: 215, scale: .24, phase: -6 },
  { x: 76, y: 132, scale: .09, phase: -1 },
];

function InkDrops({ className }: { className: string }) {
  const id = useId();
  return <svg className={`ink-mark ${className}`} viewBox="0 0 360 300" fill="#171717" focusable="false">
    <defs>
      <radialGradient id={`${id}-body`} gradientUnits="userSpaceOnUse" cx="-20" cy="-30" r="100">
        <stop stopColor="#414141" />
        <stop offset=".38" stopColor="#202020" />
        <stop offset=".78" stopColor="#101010" />
        <stop offset="1" stopColor="#070707" />
      </radialGradient>
      <radialGradient id={`${id}-light`}>
        <stop stopColor="#ffffff" stopOpacity=".26" />
        <stop offset=".55" stopColor="#ffffff" stopOpacity=".09" />
        <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
      </radialGradient>
      <filter id={`${id}-shadow`} x="-25%" y="-25%" width="150%" height="150%">
        <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodColor="#000000" floodOpacity=".18" />
      </filter>
    </defs>
    {drops.map((drop, index) => <g key={index} transform={`translate(${drop.x} ${drop.y}) scale(${drop.scale})`}>
      <g className="ink-follow" data-x={drop.x} data-y={drop.y}>
        <g className="ink-spread" style={{ animationDelay: `${index * 140}ms` }}>
          <path className="ink-fluid" fill={`url(#${id}-body)`} filter={`url(#${id}-shadow)`} style={{ animationDelay: `${drop.phase}s` }} d="M0-56C31-60 57-31 56 0C58 34 27 57 0 55C-32 57-57 29-55 0C-58-31-30-57 0-56Z" />
          <ellipse cx="-19" cy="-29" rx="27" ry="17" transform="rotate(-30 -19 -29)" fill={`url(#${id}-light)`} />
        </g>
      </g>
    </g>)}
  </svg>;
}

/** Keep visited layers mounted; pointer updates never trigger React renders. */
export function InkBackground({ mode }: { mode: InkMode }) {
  const root = useRef<HTMLDivElement>(null);
  const [visited, setVisited] = useState(() => ({ home: mode === 'home', docs: mode === 'docs' }));
  useEffect(() => { setVisited(previous => previous[mode] ? previous : { ...previous, [mode]: true }); }, [mode]);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: no-preference) and (pointer: fine)');
    let frame = 0;
    const reset = () => root.current?.querySelectorAll<SVGGElement>('.ink-follow').forEach(el => {
      el.style.removeProperty('--ink-x'); el.style.removeProperty('--ink-y'); el.style.removeProperty('--ink-stretch');
    });
    const move = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      if (!media.matches || event.pointerType === 'touch') return;
      frame = requestAnimationFrame(() => {
        const svg = root.current?.querySelector<SVGSVGElement>(`.ink-layer--${mode} .ink-mark`);
        if (!svg) return;
        const rect = svg.getBoundingClientRect();
        svg.querySelectorAll<SVGGElement>('.ink-follow').forEach(el => {
          const dx = event.clientX - (rect.left + Number(el.dataset.x) / 360 * rect.width);
          const dy = event.clientY - (rect.top + Number(el.dataset.y) / 300 * rect.height);
          const distance = Math.hypot(dx, dy);
          const proximity = Math.max(0, 1 - distance / 220);
          // A small pull toward the pointer; no spring or trailing particles.
          el.style.setProperty('--ink-x', `${dx / Math.max(1, distance) * proximity * 12}px`);
          el.style.setProperty('--ink-y', `${dy / Math.max(1, distance) * proximity * 12}px`);
          el.style.setProperty('--ink-stretch', `${1 + proximity * .07}`);
        });
      });
    };
    const leave = () => { cancelAnimationFrame(frame); reset(); };
    window.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', leave);
    window.addEventListener('blur', leave);
    media.addEventListener('change', leave);
    return () => {
      cancelAnimationFrame(frame); reset();
      window.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', leave);
      window.removeEventListener('blur', leave);
      media.removeEventListener('change', leave);
    };
  }, [mode]);
  return <div ref={root} className="ink-background" aria-hidden="true">
    {visited.home && <div className="ink-layer ink-layer--home"><InkDrops className="ink-mark--home-drops" /></div>}
    {visited.docs && <div className="ink-layer ink-layer--docs"><InkDrops className="ink-mark--doc-drops" /></div>}
  </div>;
}
