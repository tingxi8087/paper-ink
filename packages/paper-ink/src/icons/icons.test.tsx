import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { IconSearch, IconHeartFilled } from './index';

describe('Tabler Icons public entrypoint', () => {
  it('renders one SVG node with original sizing, stroke, color, props and ref', () => {
    const ref=createRef<SVGSVGElement>();
    const {container}=render(<IconSearch ref={ref} role="img" aria-label="搜索" size={20} stroke={1.5} color="#171717" className="custom" />);
    const svg=screen.getByRole('img',{name:'搜索'});
    expect(container.children).toHaveLength(1);
    expect(container.firstElementChild).toBe(svg);
    expect(svg).toHaveAttribute('viewBox','0 0 24 24');
    expect(svg).toHaveAttribute('width','20');
    expect(svg).toHaveAttribute('height','20');
    expect(svg).toHaveAttribute('stroke-width','1.5');
    expect(svg).toHaveAttribute('stroke','#171717');
    expect(svg).toHaveClass('custom');
    expect(ref.current).toBe(svg);
  });
  it('also exports filled icons without wrappers or stylesheets', () => {
    const {container}=render(<IconHeartFilled aria-hidden="true" />);
    expect(container.firstElementChild?.tagName.toLowerCase()).toBe('svg');
    expect(container.firstElementChild).toHaveAttribute('fill','currentColor');
  });
});
