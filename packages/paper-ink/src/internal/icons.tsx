import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;
const base = { width: 14, height: 14, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, focusable: false } as const;

export function CloseIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="m4.5 4.5 7 7m0-7-7 7" /></svg>;
}
export function ChevronDownIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="m3.5 6 4.5 4.5L12.5 6" /></svg>;
}
export function CheckIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="m3.5 8 3 3 6-6" /></svg>;
}
export function StatusIcon({ type, circle = false, ...props }: IconProps & { type: 'success' | 'error' | 'warning' | 'info'; circle?: boolean }) {
  return <svg {...base} {...props}>
    {circle && <circle cx="8" cy="8" r="6.5" />}
    {type === 'success' ? <path d="m4.5 8 2.5 2.5 4.5-5" /> : type === 'error' ? <path d="m5.5 5.5 5 5m0-5-5 5" /> : type === 'warning' ? <><path d="M8 4.5v4" /><circle cx="8" cy="11" r=".75" fill="currentColor" stroke="none" /></> : <><circle cx="8" cy="5" r=".75" fill="currentColor" stroke="none" /><path d="M8 7.5v4" /></>}
  </svg>;
}

export function CopyIcon(props: IconProps) {
  return <svg {...base} {...props}><rect x="5.5" y="5.5" width="7" height="7" rx="1" /><path d="M3 10V4a1 1 0 0 1 1-1h6" /></svg>;
}

export function SearchIcon(props: IconProps) {
  return <svg {...base} {...props}><circle cx="6.75" cy="6.75" r="4.25" /><path d="m10 10 3.5 3.5" /></svg>;
}
export function EyeIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M1.5 8s2.4-4 6.5-4 6.5 4 6.5 4-2.4 4-6.5 4-6.5-4-6.5-4Z" /><circle cx="8" cy="8" r="1.75" /></svg>;
}
export function EyeOffIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="m2 2 12 12M5.4 4.5A7.1 7.1 0 0 1 8 4c4.1 0 6.5 4 6.5 4a12 12 0 0 1-2.1 2.5M10.6 11.5A7.1 7.1 0 0 1 8 12c-4.1 0-6.5-4-6.5-4a12 12 0 0 1 2.1-2.5" /></svg>;
}

export function StarIcon(props: IconProps) {
  return <svg {...base} fill="currentColor" stroke="none" {...props}><path d="m8 1 2.13 4.32 4.77.7-3.45 3.36.81 4.75L8 11.89l-4.26 2.24.81-4.75L1.1 6.02l4.77-.7L8 1Z" /></svg>;
}
export function DotIcon(props: IconProps) {
  return <svg {...base} {...props}><circle cx="8" cy="8" r="4" /></svg>;
}
export function LoadingIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M14 8a6 6 0 1 1-6-6" /></svg>;
}
export function ShieldIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M8 1.5 13.5 4v4c0 3-3 5.5-5.5 6.5C5.5 13.5 2.5 11 2.5 8V4L8 1.5Z" /><path d="M8 5v4m0 2h.01" /></svg>;
}
export function FileSearchIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M8 14H3V2h7l3 3v3M9 2v4h4" /><circle cx="10.5" cy="11" r="2.5" /><path d="m12.5 13 2 2" /></svg>;
}
export function ServerIcon(props: IconProps) {
  return <svg {...base} {...props}><rect x="2" y="2" width="12" height="5" rx="1" /><rect x="2" y="9" width="12" height="5" rx="1" /><path d="M5 4.5h.01M5 11.5h.01M9 4.5h3M9 11.5h3" /></svg>;
}

export function CalendarIcon(props: IconProps) {
  return <svg {...base} {...props}><rect x="2" y="3.5" width="12" height="11" rx="1.5" /><path d="M5 1.5v4m6-4v4M2 7h12M5 10h.01M8 10h.01M11 10h.01M5 12.5h.01M8 12.5h.01" /></svg>;
}
export function ClockIcon(props: IconProps) {
  return <svg {...base} {...props}><circle cx="8" cy="8" r="6.5" /><path d="M8 4v4l3 2" /></svg>;
}
export function ArrowRightIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M2 8h12m-4-4 4 4-4 4" /></svg>;
}
