import { mkdir, writeFile, readFile } from 'node:fs/promises';
const base = new URL('../packages/paper-ink/', import.meta.url);
const theme = await readFile(new URL('src/styles/theme.css', base), 'utf8');
const styles = Object.fromEntries(await Promise.all(['button', 'input', 'modal'].map(async name => [name, await readFile(new URL(`src/${name}/style.css`, base), 'utf8')])));
await mkdir(new URL('dist/styles/', base), { recursive: true });
await writeFile(new URL('dist/styles/theme.css', base), theme);
for (const name of Object.keys(styles)) {
  await mkdir(new URL(`dist/${name}/`, base), { recursive: true });
  // Subpath CSS is self-contained, including styles of component dependencies.
  await writeFile(new URL(`dist/${name}/style.css`, base), [theme, ...(name === 'modal' ? [styles.button] : []), styles[name]].join('\n'));
}
await writeFile(new URL('dist/style.css', base), [theme, ...Object.values(styles)].join('\n'));
