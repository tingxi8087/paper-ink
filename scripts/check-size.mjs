import { build } from 'esbuild';
import { gzipSync } from 'node:zlib';
import { readFile } from 'node:fs/promises';
const result = await build({ stdin: { contents: "export { Button } from './packages/paper-ink/dist/index.js'", resolveDir: process.cwd() }, bundle: true, write: false, minify: true, format: 'esm', external: ['react', 'react/jsx-runtime', 'react-dom'] });
const css = await readFile('packages/paper-ink/dist/button/style.css');
console.log(`Button JS gzip: ${gzipSync(result.outputFiles[0].contents).length} bytes (React external)`);
console.log(`Button CSS gzip: ${gzipSync(css).length} bytes`);
if (gzipSync(result.outputFiles[0].contents).length > 8000) throw new Error('Button JS exceeds initial 8 KB gzip budget');
// Measure picker entrypoints independently and catch accidental date-library leakage.
for (const name of ['date-picker', 'time-picker', 'menu', 'statistic', 'layout', 'splitter', 'steps', 'auto-complete', 'slider', 'notification', 'image', 'color-picker', 'upload']) {
  const entry = `./packages/paper-ink/dist/${name}/index.js`;
  const bundle = await build({ entryPoints: [entry], bundle: true, write: false, minify: true, metafile: true, format: 'esm', external: ['react', 'react/jsx-runtime', 'react-dom'] });
  const style = await readFile(`packages/paper-ink/dist/${name}/style.css`);
  console.log(`${name} JS gzip: ${gzipSync(bundle.outputFiles[0].contents).length} bytes (${name === 'date-picker' || name === 'time-picker' ? 'includes Day.js; React external' : 'React external'})`);
  console.log(`${name} CSS gzip: ${gzipSync(style).length} bytes`);
}
const buttonOnly = await build({ entryPoints: ['./packages/paper-ink/dist/button/index.js'], bundle: true, write: false, minify: true, metafile: true, external: ['react', 'react/jsx-runtime', 'react-dom'] });
if (Object.keys(buttonOnly.metafile.inputs).some(path => path.includes('/dayjs/'))) throw new Error('Day.js leaked into the independent Button entrypoint');

const uploadOnly = await build({entryPoints:['./packages/paper-ink/dist/upload/index.js'],bundle:true,write:false,minify:true,metafile:true,format:'esm',external:['react','react/jsx-runtime','react-dom']});
if(Object.keys(uploadOnly.metafile.inputs).some(path=>path.includes('/hooks/useUpload'))) throw new Error('Upload unexpectedly imports the request hook');
const uploadHook = await build({entryPoints:['./packages/paper-ink/dist/use-upload/index.js'],bundle:true,write:false,minify:true,metafile:true,format:'esm',external:['react','react/jsx-runtime','react-dom']});
if(Object.keys(uploadHook.metafile.inputs).some(path=>path.includes('/upload/upload') || path.includes('/modal/'))) throw new Error('useUpload unexpectedly imports UI');
console.log('use-upload JS gzip: '+gzipSync(uploadHook.outputFiles[0].contents).length+' bytes (React external, no UI dependency)');
