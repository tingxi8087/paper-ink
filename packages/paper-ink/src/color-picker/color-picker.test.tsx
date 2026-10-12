import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { expect, it, vi } from 'vitest';
import { Color, ColorPicker } from './index.js';
import { Form, useForm } from '../form/index.js';
import { ConfigProvider } from '../config-provider/index.js';

it('converts color formats, preserves HSB precision and distinguishes cleared from transparent',()=>{
 const c=new Color({h:215.123456,s:.456789,b:.876543,a:.123456});
 expect(c.toHsb()).toEqual({h:215.123456,s:.456789,b:.876543,a:.123456});
 expect(c.format('hsb')).toBe('hsba(215.123, 45.679%, 87.654%, 0.123)');
 expect(c.toRgbString()).toMatch(/^rgba\(/);expect(c.toHex8String()).toMatch(/^#[\da-f]{8}$/);
 expect(new Color('hsb(240, 60%, 0%)').toHsb()).toEqual({h:240,s:.6,b:0,a:1});
 expect(new Color('hsba(120, 100%, 50%, 0.5)').toRgb()).toEqual({r:0,g:128,b:0,a:.5});
 expect(new Color('transparent').cleared).toBe(false);expect(new Color(null).toCssString()).toBe('');
 expect(new Color('#12').isValid).toBe(false);expect(new Color({h:NaN,s:0,b:1}).isValid).toBe(false);
});
it('retains hue and saturation while passing through black, then restores the chosen color',()=>{
 const blue=new Color('#0000ff'), black=new Color('#000000',blue), gray=new Color('#808080',blue);
 expect(black.h).toBe(240);expect(black.s).toBe(1);expect(black.with({b:1}).toCssString()).toBe('#0000ff');expect(gray.h).toBe(240);
 expect(Object.isFrozen(black)).toBe(true);
});
it('uncontrolled selection, callback completion and clearing preserve the SVG trigger and ref',async()=>{
 const change=vi.fn(),done=vi.fn(),clear=vi.fn(),ref=createRef<HTMLButtonElement>();
 render(<ColorPicker ref={ref} showText allowClear onChange={change} onChangeComplete={done} onClear={clear} presets={[{label:'常用',colors:['#ff0000','#0000ff']}]} />);
 const user=userEvent.setup();expect(ref.current).toBe(screen.getByRole('button',{name:'选择颜色'}));await user.click(ref.current!);
 await user.click(screen.getByRole('button',{name:'选择 #ff0000'}));expect(change.mock.calls[0][1]).toBe('#ff0000');expect(done.mock.calls[0][0]).toBeInstanceOf(Color);
 await user.click(screen.getByRole('button',{name:'清空颜色'}));expect(change.mock.lastCall![0].cleared).toBe(true);expect(change.mock.lastCall![1]).toBe('');expect(clear).toHaveBeenCalledTimes(1);expect(screen.getByText('无颜色')).toBeVisible();
});
it('controlled null and undefined are empty; requests do not overwrite the controlled display',async()=>{
 const change=vi.fn();const view=render(<ColorPicker value={null} defaultOpen showText onChange={change} presets={[{label:'色',colors:['red']}]} />);
 expect(screen.getByRole('button',{name:'选择颜色'})).toHaveTextContent('无颜色');await userEvent.setup().click(screen.getByRole('button',{name:'选择 #ff0000'}));
 expect(change.mock.calls[0][1]).toBe('#ff0000');expect(screen.getByRole('button',{name:'选择颜色'})).toHaveTextContent('无颜色');
 view.rerender(<ColorPicker value={undefined} showText />);expect(screen.getByRole('button',{name:'选择颜色'})).toHaveTextContent('无颜色');
 view.rerender(<ColorPicker value="#0000ff" showText />);expect(screen.getByRole('button',{name:'选择颜色'})).toHaveTextContent('#0000ff');
});
it('retains exact hue when the parent echoes a rounded CSS string',async()=>{
 function Demo(){const [value,setValue]=useState('#000000');return <ColorPicker value={value} defaultOpen onChange={(_,css)=>setValue(css)} />;}
 render(<Demo/>);const hue=screen.getByRole('slider',{name:'色相'});fireEvent.keyDown(hue,{key:'ArrowRight'});expect(hue).toHaveAttribute('aria-valuenow','1');
 fireEvent.keyDown(hue,{key:'ArrowRight'});expect(hue).toHaveAttribute('aria-valuenow','2');
 fireEvent.keyDown(screen.getByRole('group',{name:/颜色区域/}),{key:'End'});expect(screen.getByRole('textbox',{name:'颜色值'})).toHaveValue('#ff0800');expect(hue).toHaveAttribute('aria-valuenow','2');
});
it('validates edit drafts only on commit and resets them on Escape without emitting a change',async()=>{
 const change=vi.fn();render(<ColorPicker defaultOpen defaultValue="#0000ff" onChange={change}/>);const user=userEvent.setup(),input=screen.getByRole('textbox',{name:'颜色值'});
 await user.clear(input);await user.type(input,'#12');expect(change).not.toHaveBeenCalled();await user.keyboard('{Enter}');expect(input).toHaveAttribute('aria-invalid','true');expect(screen.getByRole('alert')).toHaveTextContent('有效');
 await user.clear(input);await user.type(input,'#ff0000');await user.keyboard('{Escape}');expect(change).not.toHaveBeenCalled();
 await user.click(screen.getByRole('button',{name:'选择颜色'}));await waitFor(()=>expect(screen.getByRole('textbox',{name:'颜色值'})).toHaveValue('#0000ff'));
});
it('commits text once on Enter, formats without changing the color and normalizes disabled alpha',async()=>{
 const change=vi.fn(),complete=vi.fn(),formats=vi.fn();render(<ColorPicker defaultOpen disabledAlpha onChange={change} onChangeComplete={complete} onFormatChange={formats}/>);
 const user=userEvent.setup(),input=screen.getByRole('textbox',{name:'颜色值'});await user.clear(input);await user.type(input,'rgba(255,0,0,0.2)');await user.keyboard('{Enter}');fireEvent.blur(input);
 expect(change.mock.lastCall![1]).toBe('#ff0000');expect(complete).toHaveBeenCalledTimes(1);expect(screen.queryByRole('slider',{name:'透明度'})).toBeNull();
 await user.click(screen.getByRole('combobox',{name:'颜色格式'}));await user.click(screen.getByRole('option',{name:/^HSB$/}));
 expect(formats).toHaveBeenCalledWith('hsb');expect(input).toHaveValue('hsb(0, 100%, 100%)');expect(change).toHaveBeenCalledTimes(1);
});
it('keyboard controls support endpoints, accelerated steps and transparent values',()=>{
 const change=vi.fn();render(<ColorPicker defaultOpen defaultValue="red" onChange={change}/>);
 const hue=screen.getByRole('slider',{name:'色相'}),alpha=screen.getByRole('slider',{name:'透明度'}),square=screen.getByRole('group',{name:/颜色区域/});
 fireEvent.keyDown(hue,{key:'End'});expect(hue).toHaveAttribute('aria-valuenow','360');fireEvent.keyDown(hue,{key:'ArrowLeft',shiftKey:true});expect(hue).toHaveAttribute('aria-valuenow','350');
 fireEvent.keyDown(alpha,{key:'Home'});expect(alpha).toHaveAttribute('aria-valuenow','0');expect(change.mock.lastCall![1]).toMatch(/rgba.*0\)/);expect(change.mock.lastCall![0].cleared).toBe(false);
 fireEvent.keyDown(square,{key:'ArrowDown',shiftKey:true});expect(square).toHaveAccessibleName(/亮度 90%/);
});
it('captures drag requests, emits completion once and stops on pointer cancellation',()=>{
 const change=vi.fn(),complete=vi.fn();render(<ColorPicker defaultOpen onChange={change} onChangeComplete={complete}/>);
 const square=screen.getByRole('group',{name:/颜色区域/});vi.spyOn(square,'getBoundingClientRect').mockReturnValue({left:0,top:0,width:100,height:100} as DOMRect);
 const send=(type:string,x:number,y:number)=>{const e=new Event(type,{bubbles:true});Object.assign(e,{pointerId:1,button:0,clientX:x,clientY:y});fireEvent(square,e);};
 send('pointerdown',50,25);expect(change.mock.lastCall![0].toHsb()).toMatchObject({s:.5,b:.75});send('pointermove',200,-20);expect(change.mock.lastCall![0].toHsb()).toMatchObject({s:1,b:1});send('pointerup',200,-20);expect(complete).toHaveBeenCalledTimes(1);
 send('pointerdown',20,20);send('pointercancel',20,20);const count=change.mock.calls.length;send('pointermove',80,20);send('pointerup',80,20);expect(change).toHaveBeenCalledTimes(count);expect(complete).toHaveBeenCalledTimes(1);
});
it('disabled picker prevents opening, custom triggers preserve callbacks and portal theme is inherited',async()=>{
 const clicked=vi.fn();const view=render(<ColorPicker disabled defaultOpen/>);expect(screen.queryByRole('dialog')).toBeNull();expect(screen.getByRole('button')).toBeDisabled();
 view.rerender(<ConfigProvider theme={{token:{color:{primary:{solid:'#123456'}}}}}><ColorPicker aria-label="自定义颜色"><button onClick={clicked}>自定义</button></ColorPicker></ConfigProvider>);
 await userEvent.setup().click(screen.getByRole('button',{name:'自定义颜色'}));expect(clicked).toHaveBeenCalledTimes(1);expect(screen.getByRole('dialog')).toHaveStyle('--pi-color-primary-solid: #123456');
});
it('controlled format and open emit requests without committing parent-owned state',async()=>{
 const formats=vi.fn(),opened=vi.fn();const view=render(<ColorPicker open={false} onOpenChange={opened}/>);await userEvent.setup().click(screen.getByRole('button',{name:'选择颜色'}));expect(opened).toHaveBeenCalledWith(true);expect(screen.queryByRole('dialog')).toBeNull();
 view.rerender(<ColorPicker open format="hex" value="red" onFormatChange={formats}/>);const user=userEvent.setup();await user.click(screen.getByRole('combobox',{name:'颜色格式'}));await user.click(screen.getByRole('option',{name:/^RGB$/}));expect(formats).toHaveBeenCalledWith('rgb');expect(screen.getByRole('textbox',{name:'颜色值'})).toHaveValue('#ff0000');
 view.rerender(<ColorPicker open format="rgb" value="red"/>);expect(screen.getByRole('textbox',{name:'颜色值'})).toHaveValue('rgb(255, 0, 0)');
});
it('external value overrides cancel pending drags and malformed values retain the last valid state',()=>{
 const changed=vi.fn(),complete=vi.fn();const view=render(<ColorPicker open value="red" onChange={changed} onChangeComplete={complete}/>);const square=screen.getByRole('group',{name:/颜色区域/});vi.spyOn(square,'getBoundingClientRect').mockReturnValue({left:0,top:0,width:100,height:100} as DOMRect);
 const send=(type:string)=>{const event=new Event(type,{bubbles:true});Object.assign(event,{pointerId:1,button:0,clientX:40,clientY:50});fireEvent(square,event);};send('pointerdown');
 view.rerender(<ColorPicker open value="blue" onChange={changed} onChangeComplete={complete}/>);const count=changed.mock.calls.length;send('pointermove');send('pointerup');expect(changed).toHaveBeenCalledTimes(count);expect(complete).not.toHaveBeenCalled();expect(screen.getByRole('textbox',{name:'颜色值'})).toHaveValue('#0000ff');
 view.rerender(<ColorPicker open value="var(--brand)"/>);expect(screen.getByRole('textbox',{name:'颜色值'})).toHaveValue('#0000ff');
});
it('Form stores a CSS string or null, supports required validation and reset',async()=>{
 function Demo(){const form=useForm({defaultValues:{color:null as string|null}});return <Form form={form} onSubmit={values=>{saved=values.color;}}><Form.Field name="color" label="品牌色" required><ColorPicker allowClear presets={[{label:'色',colors:['red']}]} /></Form.Field><button type="submit">提交</button><button type="button" onClick={()=>form.reset()}>重置</button></Form>;}
 let saved:string|null=null;render(<Demo/>);const user=userEvent.setup();await user.click(screen.getByText('提交'));expect(await screen.findByText('请填写品牌色')).toBeVisible();
 await user.click(screen.getByRole('button',{name:'品牌色'}));await user.click(screen.getByRole('button',{name:'选择 #ff0000'}));await user.keyboard('{Escape}');await user.click(screen.getByText('提交'));expect(saved).toBe('#ff0000');
 await user.click(screen.getByText('重置'));expect(screen.getByRole('button',{name:'品牌色'}).querySelector('svg')).toBeTruthy();
});
