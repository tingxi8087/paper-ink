import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { Rate, type RateRef } from './index.js';
it('supports half-star pointer selection, hover preview and clear',()=>{
 const change=vi.fn(),hover=vi.fn();const {container}=render(<Rate allowHalf onChange={change} onHoverChange={hover}/>);const star=container.querySelectorAll<HTMLElement>('.pi-rate__star')[2];vi.spyOn(star,'getBoundingClientRect').mockReturnValue({left:100,width:20} as DOMRect);
 fireEvent.mouseMove(star,{clientX:105});expect(hover).toHaveBeenLastCalledWith(2.5);expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow','0');
 fireEvent.click(star,{clientX:105});expect(change).toHaveBeenLastCalledWith(2.5);expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow','2.5');
 fireEvent.click(star,{clientX:105});expect(change).toHaveBeenLastCalledWith(0);
});
it('preserves controlled values and supports keyboard, disabled and allowClear=false',()=>{
 const change=vi.fn();const {container,rerender}=render(<Rate value={2} onChange={change} allowClear={false}/>);fireEvent.click(container.querySelectorAll('.pi-rate__star')[1]);expect(change).not.toHaveBeenCalled();fireEvent.keyDown(screen.getByRole('slider'),{key:'ArrowRight'});expect(change).toHaveBeenLastCalledWith(3);expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow','2');
 rerender(<Rate disabled value={2} onChange={change}/>);change.mockClear();fireEvent.keyDown(screen.getByRole('slider'),{key:'End'});fireEvent.click(container.querySelectorAll('.pi-rate__star')[4]);expect(change).not.toHaveBeenCalled();expect(screen.getByRole('slider')).toHaveAttribute('tabindex','-1');
});
it('exposes focus ref and respects prevented keys, custom glyphs, tooltips and count changes',()=>{
 const ref=createRef<RateRef>();const change=vi.fn();const {container,rerender}=render(<Rate ref={ref} defaultValue={4} count={3} character={({index})=><b>{index+1}</b>} tooltips={['bad','ok','great']} onChange={change} onKeyDown={e=>e.preventDefault()}/>);
 expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow','3');expect(container.querySelector('[title="great"]')).not.toBeNull();ref.current?.focus();expect(screen.getByRole('slider')).toHaveFocus();fireEvent.keyDown(screen.getByRole('slider'),{key:'Home'});expect(change).not.toHaveBeenCalled();ref.current?.blur();expect(screen.getByRole('slider')).not.toHaveFocus();rerender(<Rate count={0}/>);expect(screen.getByRole('slider')).toHaveAttribute('aria-valuemax','0');
});
