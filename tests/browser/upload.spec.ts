import { test, expect } from '@playwright/test';
import { createServer, type Server } from 'node:http';

const text = (name: string) => ({ name, mimeType: 'text/plain', buffer: Buffer.from('attachment') });
const image = { name: 'photo.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="320" height="220"><rect width="320" height="220" fill="#fafafa"/><path d="M0 220 90 40 160 155 230 65 320 220" fill="#171717"/></svg>') };
async function harness(page: import('@playwright/test').Page, code: string) {
  await page.goto('/#/upload');
  const demo = page.locator('.demo').first();
  await demo.getByRole('button', { name: '编辑代码', exact: true }).click();
  await demo.getByRole('textbox').fill(code);
  await expect(demo.locator('.demo-error')).toHaveCount(0);
  return demo;
}

test('Upload documentation examples, API and mobile layout render without errors', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 }); await page.goto('/#/upload');
    await expect(page.getByRole('heading', { name: 'Upload 上传', exact: true })).toBeVisible();
    expect(await page.locator('.demo').count()).toBeGreaterThanOrEqual(8);
    await expect(page.locator('.demo-error')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `.artifacts/upload-doc-${width}.png`, fullPage: true });
  }
  expect(errors).toEqual([]);
});

test('pure selection emits one ordered operation and replacement rejects without losing old data', async ({ page }) => {
  const demo = await harness(page, `() => { const [files,setFiles]=useState([]); const [event,setEvent]=useState(''); return <><Upload fileList={files} multiple maxCount={1} accept=".txt" onChange={info=>{setFiles(info.fileList);setEvent(JSON.stringify({type:info.type,names:info.files.map(f=>f.name),removed:info.removedFiles?.map(f=>f.name)}));}}/><output>{event}</output></>; }`);
  const input = demo.locator('input[type=file]'); await input.setInputFiles(text('first.txt'));
  await expect(demo.locator('output')).toContainText('"type":"add"');
  await input.setInputFiles(image); await expect(demo.getByText('first.txt', { exact: true })).toBeVisible();
  await input.setInputFiles(text('next.txt')); await expect(demo.locator('output')).toContainText('"type":"replace"'); await expect(demo.locator('output')).toContainText('"removed":["first.txt"]');
});

test('drag-and-drop uses selection rules and picture preview remains inside mobile viewport', async ({ page }) => {
  const demo = await harness(page, `() => { const [files,setFiles]=useState([]); return <Upload.Dragger multiple listType="picture" accept="image/*" fileList={files} onChange={info=>setFiles(info.fileList)}/>; }`);
  const data = await page.evaluateHandle(() => { const transfer = new DataTransfer(); transfer.items.add(new File(['bad'], 'no.txt', {type:'text/plain'})); transfer.items.add(new File(['<svg xmlns="http://www.w3.org/2000/svg" width="320" height="220"><rect width="320" height="220" fill="#fafafa"/><path d="M0 220 90 40 160 155 230 65 320 220" fill="#171717"/></svg>'], 'photo.svg', {type:'image/svg+xml'})); return transfer; });
  await demo.locator('.pi-upload__dropzone').dispatchEvent('drop', { dataTransfer: data }); await expect(demo.getByText('photo.svg', { exact: true })).toBeVisible(); await expect(demo.getByText('no.txt', {exact:true})).toHaveCount(0); await data.dispose();
  await page.setViewportSize({width:390,height:844}); await demo.getByRole('button', {name:/预览/}).click(); const dialog=page.getByRole('dialog'); await expect(dialog).toBeVisible(); await expect(dialog).toHaveCSS('opacity','1'); const box=(await dialog.boundingBox())!; expect(box.x).toBeGreaterThanOrEqual(0); expect(box.x+box.width).toBeLessThanOrEqual(390); await page.screenshot({path:'.artifacts/upload-preview-mobile.png'}); await page.keyboard.press('Escape'); await expect(dialog).toHaveCount(0);
});

test('useUpload cancels a real HTTP request, ignores late results and successfully retries', async ({ page }) => {
  let closed = 0; let received = 0; let server: Server | undefined;
  const uploads: { method: string | undefined; body: string }[] = [];
  const timers = new Set<ReturnType<typeof setTimeout>>();
  try {
    server = createServer((req, res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      if(req.method==='OPTIONS'){res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS');res.end();return;}
      received++; const ordinal = received;
      const chunks: Buffer[] = [];
      req.on('data', chunk => chunks.push(Buffer.from(chunk)));
      req.on('end', () => uploads.push({ method: req.method, body: Buffer.concat(chunks).toString() }));
      res.on('close', () => { if(!res.writableEnded) closed++; });
      const timer = setTimeout(() => { timers.delete(timer); if(!res.destroyed){res.setHeader('Content-Type','application/json');res.end(JSON.stringify({url:`/files/${ordinal}.txt`}));} }, ordinal===1 ? 3000 : 100);
      timers.add(timer);
    });
    await new Promise<void>(resolve => server!.listen(0,'127.0.0.1',resolve)); const port=(server.address() as {port:number}).port;
    const demo = await harness(page, `() => { const upload=useUpload({autoUpload:false,request:async({file,signal})=>{const response=await fetch('http://127.0.0.1:${port}/file?name='+encodeURIComponent(file.name),{method:'POST',body:file,signal});return response.json();}}); return <><Upload {...upload.props}/><Button onClick={()=>upload.upload()}>开始真实上传</Button><output>{JSON.stringify(upload.fileList.map(f=>({status:f.status,url:f.url,percent:f.percent})))}</output></>; }`);
    await demo.locator('input[type=file]').setInputFiles(text('real.txt')); await expect(demo.locator('output')).toContainText('"status":"idle"');
    await demo.getByRole('button',{name:'开始真实上传',exact:true}).click(); await expect.poll(()=>received).toBe(1); await expect.poll(()=>uploads).toEqual([{method:'POST',body:'attachment'}]); await expect(demo.locator('output')).toContainText('"status":"uploading"'); await expect(demo.locator('output')).not.toContainText('percent');
    await demo.getByRole('button',{name:/取消/}).click(); await expect(demo.locator('output')).toContainText('"status":"cancelled"'); await expect.poll(()=>closed).toBe(1);
    await demo.getByRole('button',{name:/重新上传/}).click(); await expect(demo.locator('output')).toContainText('"status":"done"'); await expect(demo.locator('output')).toContainText('/files/2.txt'); await expect(demo.locator('output')).toContainText('"percent":100'); await expect.poll(()=>uploads).toEqual([{method:'POST',body:'attachment'},{method:'POST',body:'attachment'}]);
  } finally { for(const timer of timers) clearTimeout(timer); if(server){server.closeAllConnections();await new Promise<void>(resolve=>server!.close(()=>resolve()));} }
});

test('Form binds the list, validates required selection and resets it', async ({ page }) => {
  const demo=await harness(page, `() => {const form=useForm({defaultValues:{files:[]}});const [result,setResult]=useState('');return <Form form={form} onSubmit={v=>setResult(v.files.map(f=>f.name).join(','))}><Form.Field name="files" label="附件" required="请添加附件"><Upload multiple/></Form.Field><Button htmlType="submit">提交附件</Button><Button onClick={()=>form.reset()}>重置附件</Button><output>{result}</output></Form>;}`);
  await demo.getByRole('button',{name:'提交附件'}).click(); await expect(demo).toContainText('请添加附件'); await demo.locator('input[type=file]').setInputFiles([text('a.txt'),text('b.txt')]); await demo.getByRole('button',{name:'提交附件'}).click(); await expect(demo.locator('output')).toHaveText('a.txt,b.txt'); await demo.getByRole('button',{name:'重置附件'}).click(); await expect(demo.getByText('a.txt',{exact:true})).toHaveCount(0);
});

test('documented automatic, manual queue and failure demos perform cancellation and retry', async ({ page }) => {
  await page.goto('/#/upload');
  const auto = page.getByRole('region', { name: '自动上传、取消与重试（本地演示）', exact: true });
  await auto.locator('input[type=file]').setInputFiles(text('automatic.txt')); await expect(auto.getByRole('progressbar')).toBeVisible(); await auto.getByRole('button', { name: /取消上传/ }).click(); await expect(auto).toContainText('已取消'); await auto.getByRole('button', { name: /重新上传/ }).click(); await expect(auto.locator('output')).toHaveText('1 个演示任务已完成');
  const manual = page.getByRole('region', { name: '手动队列与批量取消（本地演示）', exact: true });
  await manual.locator('input[type=file]').setInputFiles([text('queued-a.txt'), text('queued-b.txt')]); await expect(manual.getByRole('progressbar')).toHaveCount(0); await manual.getByRole('button', { name: '开始上传', exact: true }).click(); await expect(manual.getByRole('progressbar')).toHaveCount(1); await manual.getByRole('button', { name: '取消全部', exact: true }).click(); await expect(manual.locator('.pi-upload__item--cancelled')).toHaveCount(2); await expect(manual.locator('output')).toHaveText('本批任务已结束'); await manual.getByRole('button', { name: '清空队列', exact: true }).click(); await expect(manual.locator('.pi-upload__item')).toHaveCount(0);
  const failure = page.getByRole('region', { name: '失败重试（本地演示）', exact: true });
  await failure.locator('input[type=file]').setInputFiles(text('retry.txt')); await expect(failure).toContainText('首次演示失败，请重试'); await failure.getByRole('button', { name: /重新上传/ }).click(); await expect(failure.locator('.pi-upload__item--done')).toHaveCount(1);
});
