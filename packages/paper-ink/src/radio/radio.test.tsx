import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Radio } from './index.js';
describe('Radio', () => {
  it('selects numeric values, skips disabled options with keyboard and wraps', () => {
    const change = vi.fn(); render(<Radio.Group defaultValue={1} options={[{value: 1, label: 'One'}, {value: 2, label: 'Two', disabled: true}, {value: 3, label: 'Three'}]} onChange={change} />);
    fireEvent.keyDown(screen.getByLabelText('One'), { key: 'ArrowRight' }); expect(screen.getByLabelText('Three')).toBeChecked(); expect(screen.getByLabelText('Three')).toHaveFocus(); expect(change.mock.calls[0][0].target.value).toBe(3);
    fireEvent.keyDown(screen.getByLabelText('Three'), { key: 'ArrowRight' }); expect(screen.getByLabelText('One')).toBeChecked();
  });
  it('supports controlled Radio.Button children and native form reset', async () => {
    const change = vi.fn(); const { container, rerender } = render(<form><Radio.Group name="choice" defaultValue="b" onChange={change}><Radio.Button value="a">A</Radio.Button><Radio.Button value="b">B</Radio.Button></Radio.Group></form>);
    fireEvent.click(screen.getByLabelText('A')); expect(new FormData(container.querySelector('form')!).get('choice')).toBe('a');
    await act(async () => { fireEvent.reset(container.querySelector('form')!); }); expect(screen.getByLabelText('B')).toBeChecked(); expect(change).toHaveBeenCalledTimes(1);
    rerender(<Radio.Group value="b" onChange={change} options={['a', 'b']} />); fireEvent.click(screen.getByLabelText('a')); expect(screen.getByLabelText('b')).toBeChecked();
  });
});

it('preserves controlled selection on reset and coordinates standalone native names', async () => {
  const { container, rerender } = render(<form><Radio.Group value="a" options={['a', 'b']} /></form>);
  await act(async () => { container.querySelector('form')!.reset(); }); expect(screen.getByLabelText('a')).toBeChecked();
  rerender(<><Radio name="single" defaultChecked>First</Radio><Radio name="single">Second</Radio></>);
  fireEvent.click(screen.getByLabelText('Second')); expect(screen.getByLabelText('First')).not.toBeChecked(); expect(screen.getByLabelText('Second')).toBeChecked();
});

it('respects canceled standalone and group resets', async () => {
  const { container } = render(<form onReset={event => event.preventDefault()}><Radio name="cancel" defaultChecked>First cancel</Radio><Radio name="cancel">Second cancel</Radio><Radio.Group defaultValue="a" options={['a', 'b']} /></form>);
  fireEvent.click(screen.getByLabelText('Second cancel')); fireEvent.click(screen.getByLabelText('b'));
  await act(async () => { container.querySelector('form')!.reset(); });
  expect(screen.getByLabelText('Second cancel')).toBeChecked(); expect(screen.getByLabelText('First cancel')).not.toBeChecked(); expect(screen.getByLabelText('b')).toBeChecked(); expect(screen.getByLabelText('a')).not.toBeChecked();
});
