import { build } from 'esbuild';
import { gzipSync } from 'node:zlib';
import { readFile } from 'node:fs/promises';
const result = await build({ stdin: { contents: "export { Button } from './packages/paper-ink/dist/index.js'", resolveDir: process.cwd() }, bundle: true, write: false, minify: true, format: 'esm', external: ['react', 'react/jsx-runtime', 'react-dom'] });
const css = await readFile('packages/paper-ink/dist/button/style.css');
console.log(`Button JS gzip: ${gzipSync(result.outputFiles[0].contents).length} bytes (React external)`);
console.log(`Button CSS gzip: ${gzipSync(css).length} bytes`);
if (gzipSync(result.outputFiles[0].contents).length > 8000) throw new Error('Button JS exceeds initial 8 KB gzip budget');
