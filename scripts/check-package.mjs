import { mkdtemp, writeFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
const root = process.cwd();
const temp = await mkdtemp(join(tmpdir(), 'paper-ink-consumer-'));
const run = (cmd, args, cwd) => execFileSync(cmd, args, { cwd, stdio: 'inherit', timeout: 120000 });
try {
 run('pnpm', ['--dir', 'packages/paper-ink', 'pack', '--pack-destination', temp], root);
 const archive = (await readdir(temp)).find(f => f.endsWith('.tgz'));
 for (const version of ['18.3.1', '19.3.0']) {
  const cwd = join(temp, `react-${version}`);
  await import('node:fs/promises').then(fs => fs.mkdir(cwd));
  await writeFile(join(cwd, 'package.json'), JSON.stringify({ private: true, type: 'module', dependencies: { 'paper-ink': `file:${join(temp, archive)}`, react: version, 'react-dom': version, '@types/react': version.startsWith('18') ? '^18.3.0' : '^19.0.0', '@types/react-dom': version.startsWith('18') ? '^18.3.0' : '^19.0.0' } }));
  run('pnpm', ['install', '--registry=https://registry.npmjs.org', '--ignore-scripts'], cwd);
  await writeFile(join(cwd, 'smoke.mjs'), `import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Button, Input, TextArea, Modal, ConfigProvider } from 'paper-ink';
import { Button as SubpathButton } from 'paper-ink/button';
import { Input as SubpathInput } from 'paper-ink/input';
import { Modal as SubpathModal } from 'paper-ink/modal';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
assert.equal(Button, SubpathButton); assert.equal(Input, SubpathInput); assert.equal(Modal, SubpathModal); assert.equal(Input.TextArea, TextArea);
assert.match(renderToStaticMarkup(React.createElement(Input, { defaultValue: 'Hello', showCount: true })), /value="Hello"/);
assert.match(renderToStaticMarkup(React.createElement(TextArea, { defaultValue: 'Notes', autoSize: true })), /Notes/);
assert.equal(renderToStaticMarkup(React.createElement(Modal, { open: true, title: 'SSR' })), '');
const html = renderToStaticMarkup(React.createElement(ConfigProvider, { theme: { token: { radius: { control: 12 } } } }, React.createElement(Button, { type: 'primary', htmlType: 'submit' }, 'Save')));
assert.match(html, /type="submit"/); assert.match(html, /--pi-radius-control:12px/);
assert.match(readFileSync(import.meta.resolve('paper-ink/button/style.css').replace('file://', ''), 'utf8'), /pi-button--variant-solid/);
assert.match(readFileSync(import.meta.resolve('paper-ink/style.css').replace('file://', ''), 'utf8'), /pi-theme/);
assert.match(readFileSync(import.meta.resolve('paper-ink/modal/style.css').replace('file://', ''), 'utf8'), /pi-button--variant-solid/);
assert.match(readFileSync(import.meta.resolve('paper-ink/input/style.css').replace('file://', ''), 'utf8'), /pi-textarea/);
console.log('Packed package runtime + styles: React ${version} passed');`);
  run('node', ['smoke.mjs'], cwd);
  await writeFile(join(cwd, 'check.tsx'), `import { createRef } from 'react';\nimport { Button, Input, TextArea, Modal, ConfigProvider, type InputRef, type ModalProps, type ButtonProps } from 'paper-ink';\nconst props: ButtonProps = { type: 'primary', loading: { delay: 100 }, iconPosition: 'end' };\nconst ref = createRef<HTMLButtonElement>();\nconst inputRef = createRef<InputRef>();\nconst modalProps: ModalProps = { open: true, title: 'Edit', footer: null };\nconst controls = <><Input ref={inputRef} allowClear showCount /><TextArea autoSize={{ minRows: 2, maxRows: 4 }} /><Modal {...modalProps} /></>;\nconst example = <ConfigProvider theme={{ token: { radius: { control: 8 } } }}><Button {...props} ref={ref} /></ConfigProvider>;\n`);
  run('node', [resolve(root, 'node_modules/typescript/bin/tsc'), '--noEmit', '--strict', '--skipLibCheck', '--jsx', 'react-jsx', '--module', 'NodeNext', '--moduleResolution', 'NodeNext', '--lib', 'ES2022,DOM', 'check.tsx'], cwd);
  console.log(`Packed declarations: React ${version} passed`);
 }
} finally { await rm(temp, { recursive: true, force: true }); }
