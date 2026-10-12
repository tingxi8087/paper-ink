import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { Slider, type SliderRef } from './index.js';
it('increments decimals exactly and reports committed keyboard changes',()=>{
 const change=vi.fn(),complete=vi.fn();render(<Slider min={0.1} max={1} step={0.1} defaultValue={0.2} onChange={change} onChangeComplete={complete}/>);const handle=screen.getByRole('slider');fireEvent.keyDown(handle,{key:'ArrowRight'});expect(change).toHaveBeenLastCalledWith(0.3);expect(complete).toHaveBeenLastCalledWith(0.3);expect(handle).toHaveAttribute('aria-valuenow','0.3');fireEvent.keyDown(handle,{key:'End'});expect(handle).toHaveAttribute('aria-valuenow','1');
});
it('range cannot cross and controlled value only requests updates',()=>{
 const change=vi.fn();render(<Slider range value={[20,60]} onChange={change}/>);const handles=screen.getAllByRole('slider');fireEvent.keyDown(handles[0],{key:'End'});expect(change).toHaveBeenLastCalledWith([60,60]);expect(handles[0]).toHaveAttribute('aria-valuenow','20');fireEvent.keyDown(handles[1],{key:'Home'});expect(change).toHaveBeenLastCalledWith([20,20]);
});
it('supports marks-only, reverse, vertical, disabled and refs',()=>{
 const ref=createRef<SliderRef>(),change=vi.fn();const {rerender}=render(<Slider ref={ref} vertical reverse step={null} marks={{20:'低',80:{label:'高',style:{color:'red'}}}} defaultValue={20} onChange={change}/>);ref.current?.focus();expect(screen.getByRole('slider')).toHaveFocus();fireEvent.keyDown(screen.getByRole('slider'),{key:'ArrowDown'});expect(change).toHaveBeenLastCalledWith(80);fireEvent.click(screen.getByRole('button',{name:'低'}));expect(change).toHaveBeenLastCalledWith(20);rerender(<Slider disabled value={20} onChange={change}/>);change.mockClear();fireEvent.keyDown(screen.getByRole('slider'),{key:'End'});expect(change).not.toHaveBeenCalled();
});
it('handles invalid bounds, prevented keys, and narrow steps',()=>{
 const change=vi.fn();const {rerender}=render(<Slider min={5} max={3} value={Infinity} onChange={change}/>);expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow','5');rerender(<Slider step={1e-7} defaultValue={2e-7} onChange={change} onKeyDown={e=>e.preventDefault()}/>);fireEvent.keyDown(screen.getByRole('slider'),{key:'ArrowRight'});expect(change).not.toHaveBeenCalled();
});
it('controlled pointer requests value without mutating rendered value and cancellation stops drag',()=>{
 const change=vi.fn(), complete=vi.fn();const {container}=render(<Slider value={10} onChange={change} onChangeComplete={complete}/>);const root=container.querySelector('.pi-slider')!;vi.spyOn(root,'getBoundingClientRect').mockReturnValue({left:0,bottom:20,width:100,height:20} as DOMRect);
 const pointer=(type:string,x:number)=>fireEvent(root,new MouseEvent(type,{bubbles:true,clientX:x,clientY:10,button:0}));
 pointer('pointerdown',30);expect(change).toHaveBeenLastCalledWith(30);expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow','10');pointer('pointermove',60);pointer('pointerup',60);expect(complete).toHaveBeenLastCalledWith(60);
 complete.mockClear();pointer('pointerdown',40);pointer('pointercancel',40);change.mockClear();pointer('pointermove',80);pointer('pointerup',80);expect(change).not.toHaveBeenCalled();expect(complete).not.toHaveBeenCalled();pointer('pointerdown',50);pointer('pointermove',90);pointer('pointerup',90);expect(complete).toHaveBeenLastCalledWith(90);
});
