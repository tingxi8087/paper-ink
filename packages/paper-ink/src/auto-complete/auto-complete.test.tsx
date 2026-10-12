import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { AutoComplete, type AutoCompleteRef } from './index.js';
const options = [{value:'React'}, {value:'Redux',disabled:true}, {value:'Vue',label:'Vue.js'}];
it('keeps arbitrary input, searches while typing and selects enabled suggestions by keyboard', () => {
 const change=vi.fn(), search=vi.fn(), select=vi.fn(); render(<AutoComplete options={options} onChange={change} onSearch={search} onSelect={select}/>);
 const input=screen.getByRole('combobox');fireEvent.change(input,{target:{value:'Re'}});expect(search).toHaveBeenLastCalledWith('Re');fireEvent.keyDown(input,{key:'ArrowDown'});fireEvent.keyDown(input,{key:'ArrowDown'});fireEvent.keyDown(input,{key:'Enter'});
 expect(select).toHaveBeenLastCalledWith('Vue',options[2]);expect(input).toHaveValue('Vue');expect(search).toHaveBeenCalledTimes(1);expect(screen.queryByRole('listbox')).toBeNull();
});
it('supports controlled value, filtering, clear, custom labels and escaped popup', () => {
 const change=vi.fn(), clear=vi.fn();render(<AutoComplete value="Re" options={options} filterOption allowClear onChange={change} onClear={clear}/>);const input=screen.getByRole('combobox');fireEvent.focus(input);expect(screen.getAllByRole('option')).toHaveLength(2);fireEvent.keyDown(input,{key:'Escape'});expect(screen.queryByRole('listbox')).toBeNull();fireEvent.click(screen.getByRole('button',{name:'清空内容'}));expect(change).toHaveBeenLastCalledWith('');expect(clear).toHaveBeenCalledOnce();expect(input).toHaveValue('Re');
});
it('ignores disabled and composing selection, preserves focus on mouse selection and exposes input ref',()=>{
 const ref=createRef<AutoCompleteRef>(),select=vi.fn();const {rerender}=render(<AutoComplete ref={ref} defaultOpen options={options} onSelect={select}/>);fireEvent.click(screen.getByRole('option',{name:'Redux'}));expect(select).not.toHaveBeenCalled();ref.current?.focus();fireEvent.keyDown(screen.getByRole('combobox'),{key:'ArrowDown',isComposing:true});fireEvent.click(screen.getByRole('option',{name:'React'}));expect(ref.current?.input).toHaveValue('React');rerender(<AutoComplete disabled options={options} open/>);expect(screen.queryByRole('listbox')).toBeNull();
});
it('handles empty and async options without invalid active selection',()=>{
 const {rerender}=render(<AutoComplete open options={[]} notFoundContent="加载中"/>);expect(screen.getByText('加载中')).toBeInTheDocument();fireEvent.keyDown(screen.getByRole('combobox'),{key:'ArrowDown'});rerender(<AutoComplete open options={options}/>);fireEvent.keyDown(screen.getByRole('combobox'),{key:'Enter'});expect(screen.getByRole('combobox')).toHaveValue('');
});
it('initial ArrowUp activates final suggestion and IME searches only after composition finishes',()=>{
 const search=vi.fn();render(<AutoComplete options={options} onSearch={search}/>);const input=screen.getByRole('combobox');fireEvent.focus(input);fireEvent.keyDown(input,{key:'ArrowUp'});expect(input.getAttribute('aria-activedescendant')).toMatch(/-2$/);fireEvent.compositionStart(input);fireEvent.change(input,{target:{value:'北'}});fireEvent.change(input,{target:{value:'北京'}});expect(search).not.toHaveBeenCalled();fireEvent.compositionEnd(input,{data:'北京'});expect(search).toHaveBeenCalledExactlyOnceWith('北京');fireEvent.change(input,{target:{value:'北京'}});expect(search).toHaveBeenCalledTimes(1);fireEvent.change(input,{target:{value:'北京城'}});expect(search).toHaveBeenLastCalledWith('北京城');
});
it('closes when focus leaves or pointer is outside and custom filter only shows matches',()=>{
 render(<AutoComplete defaultOpen options={options} filterOption={(value, option)=> option.value !== 'Redux'} />);expect(screen.getAllByRole('option')).toHaveLength(2);fireEvent.pointerDown(document.body);expect(screen.queryByRole('listbox')).toBeNull();fireEvent.focus(screen.getByRole('combobox'));expect(screen.getByRole('listbox')).toBeInTheDocument();fireEvent.blur(screen.getByRole('combobox'));expect(screen.queryByRole('listbox')).toBeNull();
});
