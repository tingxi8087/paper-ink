import { existsSync, readFileSync, writeFileSync, mkdirSync, lstatSync, realpathSync } from 'node:fs';
import { resolve, relative, dirname, sep, isAbsolute } from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
const CONFIG = 'paper-ink.json';
const LOCK = 'paper-ink.lock.json';
const START = '// <paper-ink:exports>';
const END = '// </paper-ink:exports>';
const hash = text => createHash('sha256').update(text).digest('hex');
const json = value => `${JSON.stringify(value, null, 2)}\n`;
const read = path => JSON.parse(readFileSync(path, 'utf8'));
const help = `Paper Ink — npm components or local source, same implementation.

  paper-ink init [--path src/components/paper-ink] [--dry-run]
  paper-ink add button input modal [--dry-run] [--overwrite] [--no-install]
  paper-ink list

  --cwd <directory>  Target project (default: current directory)
  --dry-run          Show changes without writing files or installing dependencies
  --overwrite        Replace conflicting component files explicitly
  --no-install       Write sources but leave missing npm dependencies to you
  --help, --version

Requires a React 18+ TypeScript project. Local imports do not require an alias.
Installed code belongs to your project. Existing files are preserved by default.`;
function parse(args) {
  const result = { command: undefined, names: [], cwd: process.cwd(), dryRun: false, overwrite: false, noInstall: false };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') result.help = true;
    else if (arg === '--version' || arg === '-v') result.version = true;
    else if (['--cwd', '--path'].includes(arg)) {
      const value = args[++i];
      if (!value || value.startsWith('--')) throw new Error(`${arg} requires a value`);
      result[arg === '--cwd' ? 'cwd' : 'path'] = value;
    } else if (arg === '--dry-run') result.dryRun = true;
    else if (arg === '--overwrite') result.overwrite = true;
    else if (arg === '--no-install') result.noInstall = true;
    else if (arg.startsWith('-')) throw new Error(`Unknown option: ${arg}`);
    else if (!result.command) result.command = arg;
    else result.names.push(arg);
  }
  if (result.path && result.command !== 'init') throw new Error('--path is only supported by init');
  return result;
}
// Reject escaping paths and symlink ancestors before *any* project mutation.
export function safePath(root, path) {
  if (typeof path !== 'string' || !path || isAbsolute(path) || path.includes('\\') || path.split('/').some(p => ['..', '.git', 'node_modules'].includes(p))) throw new Error(`Unsafe project path: ${path}`);
  const target = resolve(root, path);
  const rel = relative(root, target);
  if (!rel || rel.startsWith(`..${sep}`) || isAbsolute(rel)) throw new Error(`Path must stay inside project: ${path}`);
  let cursor = root;
  for (const part of rel.split(sep)) {
    cursor = resolve(cursor, part);
    if (existsSync(cursor) || (() => { try { lstatSync(cursor); return true; } catch { return false; } })()) {
      const stat = lstatSync(cursor);
      if (stat.isSymbolicLink()) throw new Error(`Refusing symlink path: ${path}`);
      if (cursor !== target && !stat.isDirectory()) throw new Error(`Parent is not a directory: ${path}`);
    }
  }
  return target;
}
function safeDirectory(root, path) {
  const target = safePath(root, path);
  if (existsSync(target) && !lstatSync(target).isDirectory()) throw new Error(`Install path is not a directory: ${path}`);
  return target;
}
function project(root) {
  const packagePath = safePath(root, 'package.json');
  if (!existsSync(packagePath)) throw new Error('Target needs a package.json. Run this inside a React TypeScript project.');
  const pkg = read(packagePath);
  const deps = { ...pkg.peerDependencies, ...pkg.devDependencies, ...pkg.dependencies };
  if (!deps.react) throw new Error('Target needs React 18+. Install React before initializing Paper Ink.');
  const major = deps.react.match(/\d+/)?.[0];
  if (major && Number(major) < 18) throw new Error('React 18+ is required.');
  if (!existsSync(resolve(root, 'tsconfig.json')) && !existsSync(resolve(root, 'tsconfig.app.json'))) throw new Error('Target needs a TypeScript config (tsconfig.json or tsconfig.app.json).');
  return { pkg, deps };
}
function resolveItems(names, registry) {
  const byName = new Map(registry.items.map(item => [item.name, item]));
  const visited = new Set(); const visiting = new Set(); const result = [];
  const visit = name => {
    if (visited.has(name)) return;
    if (visiting.has(name)) throw new Error(`Registry dependency cycle: ${name}`);
    const item = byName.get(name);
    if (!item) throw new Error(`Unknown component: ${name}. Run paper-ink list.`);
    visiting.add(name);
    for (const dep of item.registryDependencies ?? []) visit(dep);
    visiting.delete(name); visited.add(name); result.push(item);
  };
  for (const name of names) visit(name);
  return result;
}
function manager(root, pkg) {
  const declared = pkg.packageManager?.split('@')[0];
  if (declared && !['npm', 'pnpm', 'yarn', 'bun'].includes(declared)) throw new Error(`Unsupported package manager: ${declared}`);
  if (declared) return declared;
  for (const [file, name] of [['pnpm-lock.yaml', 'pnpm'], ['yarn.lock', 'yarn'], ['bun.lock', 'bun'], ['bun.lockb', 'bun']]) if (existsSync(resolve(root, file))) return name;
  return 'npm';
}
function put(root, path, content, overwrite = false) {
  const target = safePath(root, path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content, { flag: overwrite ? 'w' : 'wx' });
}
function init(root, options) {
  project(root);
  const configPath = safePath(root, CONFIG);
  if (existsSync(configPath)) {
    const config = read(configPath);
    if (config.schemaVersion !== 1) throw new Error('Unsupported paper-ink.json schemaVersion');
    safeDirectory(root, config.directory);
    console.log(`${CONFIG} already exists; kept existing configuration.`); return;
  }
  const directory = options.path ?? (existsSync(resolve(root, 'src')) ? 'src/components/paper-ink' : 'components/paper-ink');
  safeDirectory(root, directory);
  console.log(`${options.dryRun ? 'Would create' : 'Create'} ${CONFIG} → ${directory}`);
  if (!options.dryRun) put(root, CONFIG, json({ schemaVersion: 1, directory }));
}
function exportsBlock(items) {
  return `${START}\n${items.flatMap(item => item.exports ?? []).join('\n')}\n${END}`;
}
export function run(args, registry) {
  const options = parse(args);
  if (options.help || !options.command && !options.version) { console.log(help); return; }
  if (options.version) { console.log(registry.version); return; }
  if (options.command === 'list') { for (const item of registry.items.filter(item => !item.internal)) console.log(`${item.name.padEnd(14)} ${item.description}`); return; }
  if (!['init', 'add'].includes(options.command)) throw new Error(`Unknown command: ${options.command}`);
  if (options.command === 'init' && options.names.length) throw new Error('init does not take component names');
  const root = realpathSync(resolve(options.cwd));
  if (options.command === 'init') { init(root, options); return; }
  if (!options.names.length) throw new Error('Specify a component: paper-ink add button');
  const { pkg, deps } = project(root);
  const configPath = safePath(root, CONFIG);
  if (!existsSync(configPath)) throw new Error('Run paper-ink init first.');
  const config = read(configPath);
  if (config.schemaVersion !== 1) throw new Error('Unsupported paper-ink.json schemaVersion');
  safeDirectory(root, config.directory);
  const lockPath = safePath(root, LOCK);
  const lock = existsSync(lockPath) ? read(lockPath) : { schemaVersion: 1, directory: config.directory, items: [], files: {} };
  if (lock.schemaVersion !== 1 || lock.directory !== config.directory || !Array.isArray(lock.items) || !lock.files || typeof lock.files !== 'object') throw new Error('Install record is invalid or directory changed. Restore config before adding components.');
  const requested = resolveItems(options.names, registry);
  for (const item of requested) for (const name of Object.keys(item.peerDependencies ?? {})) {
    if (!deps[name]) throw new Error(`${item.name} requires ${name}. Install a version compatible with your React version before adding this component.`);
  }
  const installed = resolveItems([...new Set([...lock.items, ...requested.map(item => item.name)])], registry);
  const writes = new Map(); const records = { ...lock.files }; const messages = []; const conflicts = [];
  function plan(path, content, managedIndex = false) {
    const target = safePath(root, path);
    if (existsSync(target) && !lstatSync(target).isFile()) throw new Error(`Target is not a file: ${path}`);
    const current = existsSync(target) ? readFileSync(target, 'utf8') : undefined;
    if (current === content) { records[path] = hash(current); messages.push(`Keep ${path}`); return; }
    if (current !== undefined && !options.overwrite && !managedIndex) {
      if (Object.hasOwn(lock.files, path)) { messages.push(`Keep modified/existing ${path}`); return; }
      conflicts.push(path); return;
    }
    writes.set(path, { content, overwrite: current !== undefined }); records[path] = hash(content);
    messages.push(`${current === undefined ? 'Add' : 'Update'} ${path}`);
  }
  for (const item of requested) for (const file of item.files) {
    const path = `${config.directory}/${file.path}`;
    const content = `/* Paper Ink ${registry.version} · MIT License — see LICENSE.paper-ink */\n${file.content}`;
    plan(path, content);
  }
  const entryPath = `${config.directory}/index.ts`;
  const entryTarget = safePath(root, entryPath);
  const currentEntry = existsSync(entryTarget) ? readFileSync(entryTarget, 'utf8') : undefined;
  const block = exportsBlock(installed);
  let entry = `${block}\n`;
  if (currentEntry !== undefined) {
    const start = currentEntry.indexOf(START); const end = currentEntry.indexOf(END);
    if (start < 0 || end < start || currentEntry.indexOf(START, start + START.length) !== -1 || currentEntry.indexOf(END, end + END.length) !== -1) {
      if (!options.overwrite) conflicts.push(entryPath);
    } else {
      const oldBlock = currentEntry.slice(start, end + END.length);
      const expected = exportsBlock(resolveItems(lock.items, registry));
      if (oldBlock !== expected && !options.overwrite) conflicts.push(`${entryPath} (managed exports edited)`);
      entry = currentEntry.slice(0, start) + block + currentEntry.slice(end + END.length);
    }
  }
  plan(entryPath, entry, true);
  const styles = installed.flatMap(item => item.files.filter(file => file.path.endsWith('.css')).map(file => file.path));
  const stylePath = `${config.directory}/style.css`;
  plan(stylePath, `/* Paper Ink styles — import this once in your app entry. */\n${styles.map(path => `@import './${path}';`).join('\n')}\n`);
  plan(`${config.directory}/LICENSE.paper-ink`, registry.license);
  if (conflicts.length) throw new Error(`Existing files conflict; no changes made:\n${conflicts.join('\n')}\nChoose a different directory or use --overwrite explicitly.`);
  const allDeps = {};
  for (const item of requested) for (const [name, version] of Object.entries(item.dependencies ?? {})) {
    if (allDeps[name] && allDeps[name] !== version) throw new Error(`Conflicting dependency versions: ${name}`);
    allDeps[name] = version;
  }
  const missing = Object.entries(allDeps).filter(([name]) => !deps[name]).map(([name, version]) => `${name}@${version}`);
  const pm = manager(root, pkg);
  const installArgs = [pm === 'npm' ? 'install' : 'add', ...missing];
  console.log(`${options.dryRun ? 'DRY RUN — no files or dependencies will change' : `Paper Ink ${registry.version}`}\n${messages.join('\n')}`);
  if (missing.length) console.log(`${options.noInstall ? 'Install manually:' : 'Dependencies:'} ${pm} ${installArgs.join(' ')}`);
  if (options.dryRun) return;
  if (missing.length && !options.noInstall) {
    const result = spawnSync(pm, installArgs, { cwd: root, stdio: 'inherit', timeout: 120000, shell: process.platform === 'win32' });
    if (result.error || result.status !== 0) throw new Error('Dependency installation failed. No component files were written.');
  }
  for (const [path, { content, overwrite }] of writes) put(root, path, content, overwrite);
  const nextLock = json({ schemaVersion: 1, version: registry.version, directory: config.directory, items: installed.map(item => item.name), files: records });
  if (!existsSync(lockPath) || readFileSync(lockPath, 'utf8') !== nextLock) put(root, LOCK, nextLock, existsSync(lockPath));
  console.log(`\nImport components from ${config.directory}/index.ts\nImport ${config.directory}/style.css once in your app entry.\nUse either local source or the npm package for a component tree; their theme contexts are independent.`);
}
