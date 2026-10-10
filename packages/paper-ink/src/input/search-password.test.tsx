import { createRef, useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { Button } from '../button/button.js';
import { Input } from './index.js';
import type { InputRef } from './types.js';

it('Search separates normal changes from Enter/button and clear searches', async () => {
 const search = vi.fn(); const change = vi.fn(); const enter = vi.fn();
 render(<Input.Search aria-label="Search" defaultValue="paper" allowClear onChange={change} onSearch={search} onPressEnter={enter} />);
 const input = screen.getByRole('searchbox');
 await userEvent.type(input, ' ink'); expect(search).not.toHaveBeenCalled();
 fireEvent.keyDown(input, { key: 'Enter' });
 expect(enter).toHaveBeenCalledOnce(); expect(search).toHaveBeenLastCalledWith('paper ink', expect.objectContaining({ type: 'keydown' }), { source: 'input' });
 await userEvent.click(screen.getByRole('button', { name: '搜索' }));
 expect(search).toHaveBeenLastCalledWith('paper ink', expect.objectContaining({ type: 'click' }), { source: 'input' });
 await userEvent.click(screen.getByRole('button', { name: '清空内容' }));
 expect(input).toHaveValue(''); expect(change.mock.calls.at(-1)?.[0].target.value).toBe('');
 expect(search).toHaveBeenLastCalledWith('', expect.objectContaining({ type: 'change', target: expect.objectContaining({ value: '' }) }), { source: 'clear' });
 expect(input).toHaveFocus();
});
it('Search suppresses composing, prevented, disabled and loading submissions', () => {
 const search = vi.fn(); const enter = vi.fn();
 const { rerender } = render(<Input.Search onSearch={search} onPressEnter={enter} />); const node = screen.getByRole('searchbox');
 fireEvent.compositionStart(node); fireEvent.keyDown(node, { key: 'Enter' }); expect(search).not.toHaveBeenCalled();
 fireEvent.compositionEnd(node); fireEvent.keyDown(node, { key: 'Enter', isComposing: true }); fireEvent.keyDown(node, { key: 'Enter', keyCode: 229 }); expect(search).not.toHaveBeenCalled();
 rerender(<Input.Search onSearch={search} onPressEnter={event => event.preventDefault()} />); fireEvent.keyDown(node, { key: 'Enter' }); expect(search).not.toHaveBeenCalled();
 rerender(<Input.Search onSearch={search} loading />); fireEvent.keyDown(node, { key: 'Enter' }); fireEvent.click(screen.getByRole('button', { name: '搜索' })); expect(search).not.toHaveBeenCalled();
 rerender(<Input.Search onSearch={search} disabled />); expect(node).toBeDisabled(); fireEvent.keyDown(node, { key: 'Enter' }); expect(search).not.toHaveBeenCalled();
});
it('Search composes custom button handlers and honors cancellation', async () => {
 const custom = vi.fn(); const search = vi.fn();
 const { rerender } = render(<Input.Search defaultValue="query" enterButton={<Button onClick={custom}>查找</Button>} onSearch={search} />);
 await userEvent.click(screen.getByRole('button', { name: '查找' })); expect(custom).toHaveBeenCalledOnce(); expect(search).toHaveBeenCalledOnce();
 rerender(<Input.Search defaultValue="query" enterButton={<button type="button" onClick={event => event.preventDefault()}>自定义搜索</button>} onSearch={search} />);
 await userEvent.click(screen.getByRole('button', { name: '自定义搜索' })); expect(search).toHaveBeenCalledOnce();
});
it('Search preserves controlled clears, form resets and the shared input ref', async () => {
 const search = vi.fn(); const ref = createRef<InputRef>();
 const { rerender } = render(<Input.Search value="fixed" allowClear onSearch={search} ref={ref} className="custom-search" style={{ width: 240 }} />);
 await userEvent.click(screen.getByRole('button', { name: '清空内容' })); expect(screen.getByRole('searchbox')).toHaveValue('fixed'); expect(search.mock.calls.at(-1)?.[0]).toBe('');
 expect(ref.current?.nativeElement).toHaveClass('custom-search'); expect(ref.current?.nativeElement).toHaveStyle({ width: '240px' }); ref.current?.focus({ cursor: 'all' }); expect(ref.current?.input?.selectionEnd).toBe(5);
 rerender(<form><Input.Search defaultValue="initial" onSearch={search} /><button type="reset">重置</button></form>); const node = screen.getByRole('searchbox'); await userEvent.clear(node); await userEvent.type(node,'edited'); await userEvent.click(screen.getByRole('button',{name:'重置'})); await waitFor(()=>expect(node).toHaveValue('initial'));
});
it('Password changes only visibility and keeps focus, value and suffix', async () => {
 const ref = createRef<InputRef>(); const change = vi.fn();
 render(<Input.Password aria-label="Password" defaultValue="secret" ref={ref} suffix="suffix" onChange={change} />);
 const node = screen.getByLabelText('Password'); expect(node).toHaveAttribute('type','password'); ref.current?.focus({cursor:'end'});
 await userEvent.click(screen.getByRole('button',{name:'显示密码'})); expect(node).toHaveAttribute('type','text'); expect(node).toHaveValue('secret'); expect(node).toHaveFocus(); expect(change).not.toHaveBeenCalled(); expect(screen.getByText('suffix')).toBeVisible();
 await userEvent.click(screen.getByRole('button',{name:'隐藏密码'})); expect(node).toHaveAttribute('type','password');
});
it('Password controlled visibility stays with its owner and custom icons update', async () => {
 const visible = vi.fn();
 const { rerender } = render(<Input.Password aria-label="Password" defaultValue="secret" visibilityToggle={{visible:false,onVisibleChange:visible}} iconRender={shown => <span>{shown?'visible icon':'hidden icon'}</span>} />);
 await userEvent.click(screen.getByRole('button',{name:'显示密码'})); expect(visible).toHaveBeenCalledWith(true); expect(screen.getByLabelText('Password')).toHaveAttribute('type','password'); expect(screen.getByText('hidden icon')).toBeVisible();
 function Controlled() { const [shown,setShown]=useState(false); return <Input.Password aria-label="Password" visibilityToggle={{visible:shown,onVisibleChange:setShown}} />; }
 rerender(<Controlled />); const button = screen.getByRole('button',{name:'显示密码'}); button.focus(); await userEvent.keyboard(' '); expect(screen.getByLabelText('Password')).toHaveAttribute('type','text'); expect(screen.getByRole('button',{name:'隐藏密码'})).toHaveAttribute('aria-pressed','true');
});
it('Password hides or disables toggles and permits revealing a read-only value', async () => {
 const { rerender } = render(<Input.Password visibilityToggle={false} defaultValue="secret" />); expect(screen.queryByRole('button')).toBeNull();
 rerender(<Input.Password disabled defaultValue="secret" />); expect(screen.getByRole('button',{name:'显示密码'})).toBeDisabled();
 rerender(<Input.Password readOnly aria-label="Readonly password" defaultValue="secret" allowClear />); expect(screen.queryByRole('button',{name:'清空内容'})).toBeNull(); await userEvent.click(screen.getByRole('button',{name:'显示密码'})); expect(screen.getByLabelText('Readonly password')).toHaveAttribute('type','text');
});
