import { build } from 'esbuild';
import { chromium } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { resolve } from 'node:path';
const root = process.cwd();
const output = resolve(root, '.artifacts/component-overview');
const assets = resolve(root, 'apps/website/public');
await mkdir(output, {recursive:true});
await mkdir(resolve(assets,'images'), {recursive:true});
await build({stdin:{contents:`import React from 'react'; import {createRoot} from 'react-dom/client'; import {ComponentOverview} from './apps/website/src/components/ComponentOverview'; import './packages/paper-ink/dist/style.css'; createRoot(document.getElementById('root')).render(<ComponentOverview compact={location.search.includes('compact')} />);`,resolveDir:root,loader:'tsx'},bundle:true,format:'esm',jsx:'automatic',outfile:resolve(output,'index.js'),alias:{'paper-ink':resolve(root,'packages/paper-ink/src/index.ts')}});
await writeFile(resolve(output,'index.html'),'<!doctype html><html lang="zh-CN"><meta charset="utf-8"><link rel="stylesheet" href="/index.css"><div id="root"></div><script type="module" src="/index.js"></script></html>');
const server=createServer(async(req,res)=>{
 try{const path=new URL(req.url,'http://localhost').pathname;const file=path==='/favicon.svg'?resolve(assets,'favicon.svg'):resolve(output,'.'+(path==='/'?'/index.html':path));if(!file.startsWith(output+'/')&&file!==resolve(assets,'favicon.svg'))throw Error('Invalid path');res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.svg')?'image/svg+xml':'text/html');res.end(await readFile(file));}catch{res.writeHead(404);res.end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL??'chrome'});
try{
 for(const compact of [false,true]){
  const page=await browser.newPage({viewport:{width:compact?800:1440,height:1200},deviceScaleFactor:2,reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/${compact?'?compact':''}`);
  await page.locator('.pi-table').waitFor();await page.evaluate(()=>document.fonts.ready);await page.waitForFunction(()=>Array.from(document.images).every(image=>image.complete&&image.naturalWidth>0));
  if(errors.length)throw Error(errors.join('\n'));
  const board=page.locator('.component-overview');
  await board.screenshot({path:resolve(assets,'images',compact?'components-home.png':'components-overview.png')});
  console.log(`${compact?'Home preview':'README overview'}: ${await board.locator('[class^="pi-"]').count()} component elements, ${JSON.stringify(await board.boundingBox())}`);
  await page.close();
 }
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
