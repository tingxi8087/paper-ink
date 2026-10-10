import { mkdtemp, writeFile, readFile, readdir, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
const root = process.cwd();
const temp = await mkdtemp(join(tmpdir(), 'paper-ink-cli-consumer-'));
const consumer = join(temp, 'app');
const run = (cmd, args, cwd = consumer) => execFileSync(cmd, args, { cwd, stdio: 'inherit', timeout: 120000 });
let server;
let browser;
try {
  for (const pkg of ['paper-ink', 'cli']) run('pnpm', ['--dir', `packages/${pkg}`, 'pack', '--pack-destination', temp], root);
  const archives = await readdir(temp);
  const libArchive = archives.find(name => /^paper-ink-\d/.test(name) && name.endsWith('.tgz'));
  const cliArchive = archives.find(name => /cli.*\.tgz$/.test(name));
  assert.ok(libArchive && cliArchive);
  await mkdir(join(consumer, 'src'), { recursive: true });
  await writeFile(join(consumer, 'package.json'), JSON.stringify({ private: true, type: 'module', dependencies: { 'paper-ink': `file:${join(temp, libArchive)}`, '@paper-ink/cli': `file:${join(temp, cliArchive)}`, react: '19.3.0', 'react-dom': '19.3.0' }, devDependencies: { vite: '7.3.7', typescript: '5.9.3', '@types/react': '19.3.0', '@types/react-dom': '19.3.0' } }));
  await writeFile(join(consumer, 'tsconfig.json'), JSON.stringify({ compilerOptions: { target: 'ES2022', lib: ['ES2022', 'DOM'], module: 'ESNext', moduleResolution: 'Bundler', jsx: 'react-jsx', strict: true, skipLibCheck: true, noEmit: true }, include: ['src'] }));
  run('pnpm', ['install', '--offline', '--ignore-scripts']);
  run('pnpm', ['exec', 'paper-ink', '--version']);
  run('pnpm', ['exec', 'paper-ink', 'init']);
  run('pnpm', ['exec', 'paper-ink', 'add', 'button', 'input', 'modal', '--dry-run']);
  assert.equal((await readdir(join(consumer, 'src'))).length, 0);
  run('pnpm', ['exec', 'paper-ink', 'add', 'button', 'input', 'modal']);
  run('pnpm', ['exec', 'paper-ink', 'add', 'button', 'input', 'modal']);
  await writeFile(join(consumer, 'index.html'), '<!doctype html><html><head><meta charset="utf-8" /></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>');
  await writeFile(join(consumer, 'src/main.tsx'), `import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Button as NpmButton, Input as NpmInput, Modal as NpmModal, ConfigProvider as NpmProvider } from 'paper-ink';
import { Button as LocalButton, Input as LocalInput, Modal as LocalModal, ConfigProvider as LocalProvider } from './components/paper-ink';
import 'paper-ink/style.css';
import './components/paper-ink/style.css';
function Demo() {
 const [local, setLocal] = useState(0); const [npm, setNpm] = useState(0);
 const [localOpen, setLocalOpen] = useState(false); const [npmOpen, setNpmOpen] = useState(false);
 const theme = { token: { color: { primary: { solid: '#1677ff' } }, radius: { control: 12 } } };
 return <><h1>Paper Ink dual distribution</h1>
 <section aria-label="CLI source"><LocalProvider theme={theme}><LocalButton type="primary" size="large" onClick={() => setLocal(local + 1)}>Local {local}</LocalButton><LocalButton disabled>Local disabled</LocalButton><LocalInput aria-label="Local input" defaultValue="Source" allowClear /><LocalInput.TextArea aria-label="Local textarea" autoSize={{ minRows: 2, maxRows: 4 }} /><LocalButton onClick={() => setLocalOpen(true)}>Local modal</LocalButton><LocalModal title="Local dialog" open={localOpen} onOk={() => setLocalOpen(false)} onCancel={() => setLocalOpen(false)}><LocalInput placeholder="Portal input" /></LocalModal></LocalProvider></section>
 <section aria-label="npm package"><NpmProvider theme={theme}><NpmButton type="primary" size="large" onClick={() => setNpm(npm + 1)}>Npm {npm}</NpmButton><NpmButton disabled>Npm disabled</NpmButton><NpmInput aria-label="Npm input" defaultValue="Package" allowClear /><NpmInput.TextArea aria-label="Npm textarea" autoSize={{ minRows: 2, maxRows: 4 }} /><NpmButton onClick={() => setNpmOpen(true)}>Npm modal</NpmButton><NpmModal title="Npm dialog" open={npmOpen} onOk={() => setNpmOpen(false)} onCancel={() => setNpmOpen(false)}><NpmInput placeholder="Portal input" /></NpmModal></NpmProvider></section></>;
}
createRoot(document.getElementById('root')!).render(<Demo />);`);
  run('pnpm', ['exec', 'tsc', '--noEmit']);
  run('pnpm', ['exec', 'vite', 'build']);
  const require = createRequire(join(consumer, 'package.json'));
  const { preview } = await import(require.resolve('vite'));
  server = await preview({ root: consumer, preview: { host: '127.0.0.1', port: 0, strictPort: false } });
  const address = server.httpServer.address();
  browser = await chromium.launch({ ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}) });
  const page = await browser.newPage(); const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`http://127.0.0.1:${address.port}`);
  for (const [region, label] of [['CLI source', 'Local'], ['npm package', 'Npm']]) {
    const button = page.getByRole('region', { name: region }).getByRole('button', { name: `${label} 0`, exact: true });
    await button.waitFor({ state: 'visible' });
    const visual = await button.evaluate(el => { const s = getComputedStyle(el); return { background: s.backgroundColor, radius: s.borderRadius, height: s.height }; });
    assert.deepEqual(visual, { background: 'rgb(22, 119, 255)', radius: '12px', height: '40px' });
    await button.click();
    await page.getByRole('button', { name: `${label} 1`, exact: true }).waitFor();
    assert.equal(await page.getByRole('button', { name: `${label} disabled`, exact: true }).isDisabled(), true);
  }
  for (const [region, label] of [['CLI source', 'Local'], ['npm package', 'Npm']]) {
    const group = page.getByRole('region', { name: region });
    const input = group.getByRole('textbox', { name: `${label} input` });
    await group.getByRole('button', { name: '清空内容' }).click();
    assert.equal(await input.inputValue(), '');
    await input.fill('Installed successfully');
    assert.equal(await input.inputValue(), 'Installed successfully');
    const textarea = group.getByRole('textbox', { name: `${label} textarea` });
    const initial = await textarea.evaluate(el => el.getBoundingClientRect().height);
    await textarea.fill('one\ntwo\nthree\nfour');
    assert.ok(await textarea.evaluate(el => el.getBoundingClientRect().height) > initial);
    await group.getByRole('button', { name: `${label} modal`, exact: true }).click();
    const dialog = page.getByRole('dialog', { name: `${label} dialog` });
    await dialog.waitFor({ state: 'visible' });
    assert.equal(await dialog.getByRole('button', { name: '确定', exact: true }).evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(22, 119, 255)');
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'hidden' });
  }
  assert.deepEqual(errors, []);
  await page.screenshot({ path: join(root, '.artifacts/dual-distribution.png') });
  console.log('Packed CLI binary + local TSX + npm package: typecheck, Vite production build, browser Button/Input/TextArea/Modal behavior and portal theme all passed.');
} finally {
  await browser?.close();
  await new Promise(resolve => { if (server) server.httpServer.close(resolve); else resolve(); });
  await rm(temp, { recursive: true, force: true });
}
