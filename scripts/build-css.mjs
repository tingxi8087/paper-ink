import { mkdir, writeFile, readFile } from 'node:fs/promises';
const base = new URL('../packages/paper-ink/', import.meta.url);
const theme = await readFile(new URL('src/styles/theme.css', base), 'utf8');
const manifest = JSON.parse(await readFile(new URL('../registry/registry.json', import.meta.url), 'utf8'));
const components = manifest.items.filter(item => item.files.includes(`${item.name}/style.css`));
const styles = Object.fromEntries(await Promise.all(components.map(async item => [item.name, await readFile(new URL(`src/${item.name}/style.css`, base), 'utf8')])));
await mkdir(new URL('dist/styles/', base), { recursive: true });
await writeFile(new URL('dist/styles/theme.css', base), theme);
function dependencies(name, seen = new Set()) {
  if (seen.has(name)) return [];
  seen.add(name);
  const item = manifest.items.find(item => item.name === name);
  if (!item) throw new Error(`Unknown registry dependency: ${name}`);
  return [...(item.registryDependencies ?? []).flatMap(dep => dependencies(dep, seen)), ...(styles[name] ? [styles[name]] : [])];
}
for (const item of components) {
  await mkdir(new URL(`dist/${item.name}/`, base), { recursive: true });
  await writeFile(new URL(`dist/${item.name}/style.css`, base), [theme, ...dependencies(item.name)].join('\n'));
}
await writeFile(new URL('dist/style.css', base), [theme, ...Object.values(styles)].join('\n'));
