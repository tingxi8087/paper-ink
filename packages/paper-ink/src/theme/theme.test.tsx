import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { ConfigProvider } from '../config-provider/index.js';
import { Input } from '../input/index.js';
import { Modal } from '../modal/index.js';
it('inherits separate component overrides through a portal and resets all with inherit false', () => {
  render(<ConfigProvider theme={{ components: { Input: { radius: 12, paddingInline: 20 }, Modal: { radius: 18, padding: 30 } } }}>
    <ConfigProvider theme={{ components: { Input: { radius: 16 } } }}>
      <Modal title="Nested" open><Input aria-label="Nested input" /></Modal>
    </ConfigProvider>
    <ConfigProvider theme={{ inherit: false }}><Input aria-label="Reset input" /></ConfigProvider>
  </ConfigProvider>);
  const inputRoot = screen.getByRole('textbox', { name: 'Nested input' }).parentElement!;
  expect(inputRoot.style.getPropertyValue('--pi-input-radius')).toBe('16px');
  expect(inputRoot.style.getPropertyValue('--pi-input-padding-inline')).toBe('20px');
  const modalRoot = screen.getByRole('dialog', { name: 'Nested' }).closest<HTMLElement>('.pi-modal-root')!;
  expect(modalRoot.style.getPropertyValue('--pi-modal-radius')).toBe('18px');
  expect(modalRoot.style.getPropertyValue('--pi-modal-padding')).toBe('30px');
  const reset = screen.getByRole('textbox', { name: 'Reset input' }).parentElement!;
  expect(reset.style.getPropertyValue('--pi-input-radius')).toBe('initial');
  expect(reset.style.getPropertyValue('--pi-modal-radius')).toBe('initial');
});
