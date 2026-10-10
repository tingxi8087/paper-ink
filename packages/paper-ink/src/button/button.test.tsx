import { createRef } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './button.js';
import { ConfigProvider } from '../config-provider/index.js';
describe('Button public behavior', () => {
 it('defaults to a non-submitting native button and forwards attributes/ref', () => {
   const ref = createRef<HTMLButtonElement>();
   render(<Button ref={ref} data-testid="save" aria-label="保存" name="save">Save</Button>);
   expect(ref.current).toBe(screen.getByRole('button', { name: '保存' }));
   expect(ref.current).toHaveAttribute('type', 'button');
   expect(ref.current).toHaveAttribute('name', 'save');
 });
 it('forwards click events and supports keyboard activation', async () => {
   const onClick = vi.fn(); render(<Button onClick={onClick}>Save</Button>);
   await userEvent.tab(); await userEvent.keyboard('{Enter}');
   expect(onClick).toHaveBeenCalledTimes(1);
   expect(onClick.mock.calls[0][0].currentTarget).toBeDefined();
 });
 it('submits a form only with htmlType submit', () => {
   const submit = vi.fn(e => e.preventDefault());
   render(<form onSubmit={submit}><Button>Normal</Button><Button htmlType="submit">Submit</Button></form>);
   fireEvent.click(screen.getByText('Normal')); expect(submit).not.toHaveBeenCalled();
   fireEvent.click(screen.getByText('Submit')); expect(submit).toHaveBeenCalledTimes(1);
 });
 it('blocks disabled and loading clicks', () => {
   const click = vi.fn(); render(<><Button disabled onClick={click}>Disabled</Button><Button loading onClick={click}>Loading</Button></>);
   fireEvent.click(screen.getByText('Disabled')); fireEvent.click(screen.getByText('Loading'));
   expect(click).not.toHaveBeenCalled(); expect(screen.getByRole('button', { name: 'Loading' })).toHaveAttribute('aria-busy', 'true');
 });
 it('delays loading and cancels pending timers when loading ends', () => {
   vi.useFakeTimers();
   try {
     const { rerender } = render(<Button loading={{ delay: 200 }}>Save</Button>);
     const button = screen.getByRole('button'); expect(button).not.toBeDisabled();
     act(() => vi.advanceTimersByTime(200)); expect(button).toBeDisabled();
     rerender(<Button loading={false}>Save</Button>); expect(button).not.toBeDisabled();
     rerender(<Button loading={{ delay: 200 }}>Save</Button>);
     rerender(<Button loading={false}>Save</Button>);
     act(() => vi.advanceTimersByTime(300)); expect(button).not.toBeDisabled();
   } finally { vi.useRealTimers(); }
 });
 it('renders native links and removes navigation when disabled', () => {
   const click = vi.fn(); const { rerender } = render(<Button href="/next" target="_blank" onClick={click}>Next</Button>);
   expect(screen.getByRole('link')).toHaveAttribute('href', '/next');
   expect(screen.getByRole('link')).toHaveAttribute('rel', 'noopener noreferrer');
   rerender(<Button href="/next" disabled onClick={click}>Next</Button>);
   const anchor = screen.getByText('Next').closest('a')!;
   expect(anchor).not.toHaveAttribute('href'); expect(anchor).toHaveAttribute('aria-disabled', 'true');
   fireEvent.click(anchor); expect(click).not.toHaveBeenCalled();
 });
 it('inherits partial themes, applies component overrides, and can reset inheritance', () => {
   render(<ConfigProvider theme={{ token: { color: { primary: { solid: '#123456' } }, radius: { control: 12 } }, components: { Button: { radius: 18 } } }}>
     <ConfigProvider theme={{ token: { font: { size: 16 } } }}><Button>Nested</Button></ConfigProvider>
     <ConfigProvider theme={{ inherit: false }}><Button>Reset</Button></ConfigProvider>
   </ConfigProvider>);
   const nested = screen.getByRole('button', { name: 'Nested' });
   expect(nested.style.getPropertyValue('--pi-color-primary-solid')).toBe('#123456');
   expect(nested.style.getPropertyValue('--pi-font-size')).toBe('16px');
   expect(nested.style.getPropertyValue('--pi-button-radius')).toBe('18px');
   expect(screen.getByRole('button', { name: 'Reset' }).style.getPropertyValue('--pi-color-primary-solid')).toBe('#171717');
   expect(screen.getByRole('button', { name: 'Reset' }).style.getPropertyValue('--pi-button-radius')).toBe('initial');
 });
});

describe('Button customization', () => {
 it('merges root and semantic classes/styles while preserving native props and ref', () => {
   const ref = createRef<HTMLButtonElement>();
   render(<Button ref={ref} className="custom" rootClassName="wrapper" classNames={{ root: 'root', icon: 'icon', content: 'content' }} styles={{ root: { color: 'red', padding: 4 }, icon: { fontSize: 20 }, content: { fontWeight: 700 } }} style={{ color: 'blue' }} title="Save" icon={<i>+</i>}>Save</Button>);
   expect(ref.current).toHaveClass('custom', 'wrapper', 'root');
   expect(ref.current).toHaveStyle({ color: 'rgb(0, 0, 255)', padding: '4px' });
   expect(ref.current).toHaveAttribute('title', 'Save');
   expect(screen.getByText('Save')).toHaveClass('content');
   expect(screen.getByText('Save')).toHaveStyle({ fontWeight: '700' });
   expect(screen.getByText('+').parentElement).toHaveClass('icon');
 });
 it('gives paired color/variant precedence over type and danger', () => {
   const { rerender } = render(<Button type="primary" danger color="default" variant="filled">Save</Button>);
   expect(screen.getByRole('button')).toHaveClass('pi-button--color-default', 'pi-button--variant-filled');
   rerender(<Button type="dashed" danger>Save</Button>);
   expect(screen.getByRole('button')).toHaveClass('pi-button--color-danger', 'pi-button--variant-dashed');
   rerender(<Button variant="solid">Save</Button>);
   expect(screen.getByRole('button')).toHaveClass('pi-button--color-primary', 'pi-button--variant-solid');
   rerender(<Button type="text" color="primary">Save</Button>);
   expect(screen.getByRole('button')).toHaveClass('pi-button--color-default', 'pi-button--variant-text');
 });
 it('supports custom loading icons and modern placement for blocked links', () => {
   const click = vi.fn();
   render(<Button href="/next" loading={{ icon: <i data-testid="loading">Wait</i> }} iconPlacement="end" iconPosition="start" onClick={click}>Save</Button>);
   const anchor = screen.getByText('Save').closest('a')!;
   expect(anchor).not.toHaveAttribute('href');
   expect(anchor).toHaveAttribute('aria-busy', 'true');
   expect(anchor.lastElementChild).toContainElement(screen.getByTestId('loading'));
   fireEvent.click(anchor); expect(click).not.toHaveBeenCalled();
 });
 it('spaces plain two-character Chinese labels, retaining accessible text and opt-out', () => {
   const { rerender } = render(<Button>保存</Button>);
   expect(screen.getByRole('button', { name: '保存' })).toBeVisible();
   expect(screen.getByText('保存')).toHaveClass('pi-button__content--spaced');
   rerender(<Button autoInsertSpace={false}>保存</Button>);
   expect(screen.getByText('保存')).not.toHaveClass('pi-button__content--spaced');
   rerender(<Button type="link">保存</Button>);
   expect(screen.getByText('保存')).not.toHaveClass('pi-button__content--spaced');
 });
});
