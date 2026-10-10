import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, readdirSync, existsSync, rmSync, symlinkSync, chmodSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { run } from '../src/install.mjs';
const registry = JSON.parse(readFileSync(new URL('../dist/registry.json', import.meta.url), 'utf8'));
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'paper-ink-cli-test-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, 'src'));
  writeFileSync(join(root, 'package.json'), JSON.stringify({ private: true, dependencies: { react: '^19.0.0' } }));
  writeFileSync(join(root, 'tsconfig.json'), '{}');
  return root;
}
function invoke(root, args, catalog = registry) { run([...args, '--cwd', root], catalog); }
function snapshot(root) {
  const result = {};
  function walk(dir) { for (const file of readdirSync(join(root, dir), { withFileTypes: true })) { const name = [dir, file.name].filter(Boolean).join('/'); if (file.isDirectory()) walk(name); else result[name] = readFileSync(join(root, name), 'utf8'); } }
  walk(''); return result;
}
test('dry-run init and add cause no filesystem mutations', t => {
  const root = fixture(t); const before = snapshot(root);
  invoke(root, ['init', '--dry-run']); assert.deepEqual(snapshot(root), before);
  invoke(root, ['init']); const initialized = snapshot(root);
  invoke(root, ['add', 'button', '--dry-run']); assert.deepEqual(snapshot(root), initialized);
});
test('installs component dependencies once, adds local exports/CSS/license and is idempotent', t => {
  const root = fixture(t); invoke(root, ['init']); invoke(root, ['add', 'button']);
  const after = snapshot(root); invoke(root, ['add', 'button']); assert.deepEqual(snapshot(root), after);
  assert.deepEqual(JSON.parse(after['paper-ink.lock.json']).items, ['theme', 'button']);
  assert.match(after['src/components/paper-ink/index.ts'], /ConfigProvider/);
  assert.match(after['src/components/paper-ink/index.ts'], /Button/);
  assert.match(after['src/components/paper-ink/style.css'], /button\/style.css/);
  assert.match(after['src/components/paper-ink/LICENSE.paper-ink'], /MIT License/);
  assert.doesNotMatch(after['src/components/paper-ink/button/button.tsx'], /from ['"].*\.js['"]/);
});
test('preserves edited source and user exports; explicit overwrite restores source', t => {
  const root = fixture(t); invoke(root, ['init', '--path', 'src/ui/ink']); invoke(root, ['add', 'button']);
  const file = join(root, 'src/ui/ink/button/button.tsx'); writeFileSync(file, '// user implementation\n');
  const index = join(root, 'src/ui/ink/index.ts'); writeFileSync(index, readFileSync(index, 'utf8') + 'export const custom = 1;\n');
  invoke(root, ['add', 'button']); assert.equal(readFileSync(file, 'utf8'), '// user implementation\n');
  assert.match(readFileSync(index, 'utf8'), /export const custom = 1/);
  invoke(root, ['add', 'button', '--overwrite']); assert.match(readFileSync(file, 'utf8'), /forwardRef/);
  assert.match(readFileSync(index, 'utf8'), /export const custom = 1/);
});
test('conflicts are detected before any component files are written', t => {
  const root = fixture(t); invoke(root, ['init']);
  mkdirSync(join(root, 'src/components/paper-ink/button'), { recursive: true });
  writeFileSync(join(root, 'src/components/paper-ink/button/types.ts'), '// existing\n');
  const before = snapshot(root);
  assert.throws(() => invoke(root, ['add', 'button']), /conflict/);
  assert.deepEqual(snapshot(root), before);
});
test('rejects escaping paths, symlinks, unknown components and edited managed exports', t => {
  const root = fixture(t);
  assert.throws(() => invoke(root, ['init', '--path', '../outside']), /Unsafe/);
  const outside = mkdtempSync(join(tmpdir(), 'paper-ink-outside-'));
  t.after(() => rmSync(outside, { recursive: true, force: true }));
  symlinkSync(outside, join(root, 'src/link'));
  assert.throws(() => invoke(root, ['init', '--path', 'src/link/ink']), /symlink/);
  assert.deepEqual(readdirSync(outside), []);
  invoke(root, ['init']);
  assert.throws(() => invoke(root, ['add', 'does-not-exist']), /Unknown component/);
  assert.equal(existsSync(join(root, 'paper-ink.lock.json')), false);
  invoke(root, ['add', 'button']);
  const entry = join(root, 'src/components/paper-ink/index.ts');
  writeFileSync(entry, readFileSync(entry, 'utf8').replace('export { Button }', 'export { Button as LocalButton }'));
  assert.throws(() => invoke(root, ['add', 'button']), /managed exports edited/);
});
test('dependency dry-run and no-install work without invoking a package manager', t => {
  const root = fixture(t); invoke(root, ['init']);
  const catalog = structuredClone(registry);
  catalog.items.find(item => item.name === 'button').dependencies = { 'fake-test-dependency': '^1.0.0' };
  const before = snapshot(root);
  invoke(root, ['add', 'button', '--dry-run'], catalog); assert.deepEqual(snapshot(root), before);
  invoke(root, ['add', 'button', '--no-install'], catalog);
  assert.equal(JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).dependencies['fake-test-dependency'], undefined);
  assert.ok(existsSync(join(root, 'src/components/paper-ink/button/button.tsx')));
});

test('runs the detected package manager for missing dependencies, and does not write sources on failure', t => {
  const root = fixture(t); invoke(root, ['init']);
  const catalog = structuredClone(registry);
  catalog.items.find(item => item.name === 'button').dependencies = { 'fixture-dependency': '^1.2.0' };
  const bin = join(root, 'bin'); mkdirSync(bin);
  const npm = join(bin, 'npm');
  writeFileSync(npm, '#!/usr/bin/env node\nrequire("node:fs").writeFileSync("install-args.json", JSON.stringify(process.argv.slice(2)));\n');
  chmodSync(npm, 0o755);
  const oldPath = process.env.PATH; process.env.PATH = `${bin}:${oldPath}`;
  try {
    invoke(root, ['add', 'button'], catalog);
    assert.deepEqual(JSON.parse(readFileSync(join(root, 'install-args.json'), 'utf8')), ['install', 'fixture-dependency@^1.2.0']);
    const other = fixture(t); invoke(other, ['init']);
    writeFileSync(npm, '#!/usr/bin/env node\nprocess.exit(1);\n');
    assert.throws(() => invoke(other, ['add', 'button'], catalog), /Dependency installation failed/);
    assert.equal(existsSync(join(other, 'src/components/paper-ink')), false);
  } finally { process.env.PATH = oldPath; }
});

test('installs input and modal with shared theme/button once and guards ReactDOM host dependency', t => {
  const root = fixture(t); invoke(root, ['init']);
  const before = snapshot(root);
  assert.throws(() => invoke(root, ['add', 'modal']), /requires react-dom/);
  assert.deepEqual(snapshot(root), before);
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  pkg.dependencies['react-dom'] = '^19.0.0';
  writeFileSync(join(root, 'package.json'), JSON.stringify(pkg));
  invoke(root, ['add', 'input', 'modal']);
  const installed = snapshot(root);
  assert.deepEqual(JSON.parse(installed['paper-ink.lock.json']).items, ['theme', 'input', 'button', 'modal']);
  assert.match(installed['src/components/paper-ink/index.ts'], /Input, TextArea/);
  assert.match(installed['src/components/paper-ink/index.ts'], /Modal/);
  assert.match(installed['src/components/paper-ink/style.css'], /modal\/style.css/);
  assert.match(installed['src/components/paper-ink/modal/modal.tsx'], /from 'react-dom'/);
  invoke(root, ['add', 'modal', 'input']);
  assert.deepEqual(snapshot(root), installed);
});
