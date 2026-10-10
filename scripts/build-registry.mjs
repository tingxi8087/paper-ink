import { readFile, writeFile, mkdir, copyFile, chmod } from 'node:fs/promises';
import ts from 'typescript';
const root = new URL('../', import.meta.url);
const read = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));
const manifest = await read('registry/registry.json');
const { version } = await read('packages/paper-ink/package.json');
// Rewrite module specifiers, not code/comments, for bundler-mode source consumers.
function sourceImports(code, path) {
  const file = ts.createSourceFile(path, code, ts.ScriptTarget.Latest, true);
  const replacements = [];
  for (const node of file.statements) {
    if (!(ts.isImportDeclaration(node) || ts.isExportDeclaration(node))) continue;
    const spec = node.moduleSpecifier;
    if (spec && ts.isStringLiteral(spec) && /^\.{1,2}\//.test(spec.text) && spec.text.endsWith('.js')) {
      replacements.push([spec.getStart(file) + 1, spec.getEnd() - 1, spec.text.slice(0, -3)]);
    }
  }
  for (const [start, end, text] of replacements.reverse()) code = code.slice(0, start) + text + code.slice(end);
  return code;
}
const names = new Set(manifest.items.map(item => item.name));
const filesSeen = new Map();
for (const item of manifest.items) {
  for (const dep of item.registryDependencies ?? []) if (!names.has(dep)) throw new Error(`Unknown dependency: ${dep}`);
  item.files = await Promise.all(item.files.map(async path => {
    if (path.startsWith('/') || path.split('/').includes('..')) throw new Error(`Invalid path: ${path}`);
    if (filesSeen.has(path)) throw new Error(`File belongs to two items: ${path}`);
    filesSeen.set(path, item.name);
    let content = await readFile(new URL(`packages/paper-ink/src/${path}`, root), 'utf8');
    if (/\.tsx?$/.test(path)) content = sourceImports(content, path);
    return { path, content };
  }));
}
await mkdir(new URL('packages/cli/dist/', root), { recursive: true });
await writeFile(new URL('packages/cli/dist/registry.json', root), JSON.stringify({ ...manifest, version, license: await readFile(new URL('LICENSE', root), 'utf8') }, null, 2) + '\n');
for (const file of ['index.mjs', 'install.mjs']) await copyFile(new URL(`packages/cli/src/${file}`, root), new URL(`packages/cli/dist/${file}`, root));
await copyFile(new URL('LICENSE', root), new URL('packages/cli/LICENSE', root));
await chmod(new URL('packages/cli/dist/index.mjs', root), 0o755);
console.log(`Built CLI registry ${version}: ${manifest.items.length} items, ${filesSeen.size} source files`);
