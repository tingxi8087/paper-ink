import { test, expect } from '@playwright/test';
test('MDX demos compile, editing changes output, errors recover, reset works', async ({ page }) => {
 const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
 await page.goto('/#/button', { waitUntil: 'domcontentloaded' });
 await expect(page.getByRole('heading', { name: 'Button 按钮' })).toBeVisible();
 const demo = page.getByRole('region', { name: '按钮类型', exact: true });
 await expect(demo.getByRole('button', { name: 'Primary', exact: true })).toBeVisible();
 await demo.getByRole('button', { name: '编辑代码' }).click();
 const editor = demo.locator('textarea');
 await editor.fill('<Button type="primary">在线修改成功</Button>');
 await expect(demo.getByRole('button', { name: '在线修改成功' })).toBeVisible();
 await editor.fill('<Button');
 await expect(demo.getByRole('alert')).toBeVisible();
 await editor.fill('function Demo() { throw new Error("示例渲染错误"); }');
 await expect(demo.getByRole('alert')).toContainText('示例渲染错误');
 await editor.fill('function Demo() { const [n, setN] = useState(0); return <Button onClick={() => setN(n + 1)}>计数 {n}</Button>; }');
 await demo.getByRole('button', { name: '计数 0' }).click();
 await expect(demo.getByRole('button', { name: '计数 1' })).toBeVisible();
 await expect(demo.getByRole('alert')).toHaveCount(0);
 await demo.getByRole('button', { name: '重置按钮类型' }).click();
 await expect(demo.getByRole('button', { name: 'Primary', exact: true })).toBeVisible();
 await editor.fill('<ConfigProvider theme={{ components: { Button: { radius: 20 } } }}><ConfigProvider theme={{ inherit: false }}><Button>独立主题</Button></ConfigProvider></ConfigProvider>');
 await expect(demo.getByRole('button', { name: '独立主题' })).toHaveCSS('border-radius', '6px');
 await demo.getByRole('button', { name: '重置按钮类型' }).click();
 await page.screenshot({ path: '.artifacts/button-desktop.png', fullPage: false });
 const loading = page.getByRole('button', { name: '点击提交', exact: true });
 await loading.click(); await expect(loading).toBeDisabled(); await expect(loading).toBeEnabled({ timeout: 3000 });
 expect(errors.filter(message => !message.includes('示例渲染错误'))).toEqual([]);
});
test('theme controls update real Button styles and export matching configuration', async ({ page }) => {
 await page.goto('/#/theme', { waitUntil: 'domcontentloaded' });
 await page.getByRole('button', { name: '信息蓝', exact: true }).click();
 const button = page.getByRole('button', { name: '保存修改', exact: true });
 await expect(button).toHaveCSS('background-color', 'rgb(22, 119, 255)');
 await page.getByRole('slider', { name: '全局圆角' }).fill('18');
 await expect(button).toHaveCSS('border-radius', '18px');
 await expect(page.locator('pre')).toContainText('"control": 18');
 await page.getByRole('button', { name: '恢复默认' }).click();
 await expect(button).toHaveCSS('background-color', 'rgb(23, 23, 23)');
});
test('composition submits and resets using native form behavior', async ({ page }) => {
 await page.goto('/#/examples', { waitUntil: 'domcontentloaded' });
 await page.getByLabel('名称').fill('New workspace');
 await page.getByRole('button', { name: '保存修改' }).click();
 await expect(page.getByRole('status')).toHaveText('已保存到本次演示');
 await page.getByRole('button', { name: '重置', exact: true }).click();
 await expect(page.getByLabel('名称')).toHaveValue('Paper Ink');
});
test('desktop and mobile pages have no horizontal overflow', async ({ page }) => {
 for (const width of [1440, 390]) {
  await page.setViewportSize({ width, height: 900 });
  for (const route of ['', 'button', 'guide', 'theme', 'examples', 'input', 'modal']) {
   await page.goto(`/#/${route}`, { waitUntil: 'domcontentloaded' });
   await expect(page.locator('h1')).toBeVisible();
   expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
   if (width === 390 && route === 'button') await page.screenshot({ path: '.artifacts/button-mobile.png', fullPage: false });
  }
 }
 await page.getByRole('button', { name: '展开导航' }).click();
 await expect(page.getByRole('link', { name: '快速开始', exact: true })).toBeVisible();
});

test('Input clear, native attributes and TextArea auto size work in the browser', async ({ page }) => {
 await page.goto('/#/input', { waitUntil: 'domcontentloaded' });
 const demo = page.getByRole('region', { name: '输入与清空', exact: true });
 await expect(demo.getByRole('textbox')).toHaveValue('Paper Ink');
 await demo.getByRole('button', { name: '清空内容' }).click();
 await expect(demo.getByRole('textbox')).toHaveValue('');
 await expect(demo.getByRole('textbox')).toBeFocused();
 await demo.getByRole('textbox').fill('新的名称');
 await expect(demo.getByRole('textbox')).toHaveValue('新的名称');
 const textarea = page.getByRole('textbox', { name: '自适应简介' });
 const height = () => textarea.evaluate(el => el.getBoundingClientRect().height);
 const initial = await height();
 await textarea.fill('第一行\n第二行\n第三行\n第四行');
 expect(await height()).toBeGreaterThan(initial);
 const expanded = await height();
 await textarea.fill(Array.from({length:12}, (_, i) => `第${i}行`).join('\n'));
 const capped = await height();
 expect(capped).toBeGreaterThanOrEqual(expanded);
 expect(capped).toBeLessThan(150);
 await expect(textarea).toHaveCSS('overflow-y', 'auto');
 await page.getByRole('region', { name: '文本域自适应' }).getByRole('button', { name: '清空内容' }).click();
 expect(await height()).toBe(initial);
 const prefix = page.getByRole('region', { name: '前后缀与计数' });
 await prefix.getByRole('textbox').fill('paper');
 await expect(prefix).toContainText('5 / 20');
});

test('Modal traps focus, restores trigger, waits for controlled submit and inherits portal theme', async ({ page }) => {
 await page.goto('/#/modal', { waitUntil: 'domcontentloaded' });
 const trigger = page.getByRole('button', { name: '打开基础弹窗' });
 await trigger.click();
 const dialog = page.getByRole('dialog', { name: '基础弹窗', exact: true });
 await expect(dialog).toBeVisible();
 await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
 await dialog.getByRole('button', { name: '确定', exact: true }).focus();
 await page.keyboard.press('Tab');
 await expect(dialog.getByRole('button', { name: '关闭', exact: true })).toBeFocused();
 await page.keyboard.press('Escape');
 await expect(dialog).toBeHidden();
 await expect(trigger).toBeFocused();
 await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
 await page.getByRole('button', { name: '打开异步确认' }).click();
 const asyncDialog = page.getByRole('dialog', { name: '保存修改', exact: true });
 await asyncDialog.getByRole('button', { name: '确定', exact: true }).click();
 await expect(asyncDialog.getByRole('button', { name: '确定', exact: true })).toBeDisabled();
 await expect(asyncDialog).toBeHidden();
 await page.getByRole('button', { name: '打开主题弹窗' }).click();
 const themed = page.getByRole('dialog', { name: '主题继承', exact: true });
 await expect(themed).toHaveCSS('border-radius', '16px');
 await expect(themed.getByRole('button', { name: '确定', exact: true })).toHaveCSS('background-color', 'rgb(22, 119, 255)');
 await page.keyboard.press('Escape');
 await page.screenshot({ path: '.artifacts/modal-desktop.png' });
});

test('business ref.open initializes each session and reports local save result', async ({ page }) => {
 await page.goto('/#/modal', { waitUntil: 'domcontentloaded' });
 const demo = page.getByRole('region', { name: '命令式业务弹窗' });
 await demo.getByRole('button', { name: '编辑工作空间' }).click();
 const dialog = page.getByRole('dialog', { name: '编辑工作空间', exact: true });
 await expect(dialog.getByLabel('名称')).toHaveValue('Paper Ink');
 await dialog.getByLabel('名称').fill('New workspace');
 await dialog.getByRole('button', { name: '确定', exact: true }).click();
 await expect(dialog).toBeHidden();
 await expect(demo.getByRole('status')).toContainText('New workspace');
 await demo.getByRole('button', { name: '编辑工作空间' }).click();
 await dialog.getByLabel('名称').fill('Unsaved');
 await page.keyboard.press('Escape');
 await demo.getByRole('button', { name: '编辑工作空间' }).click();
 await expect(dialog.getByLabel('名称')).toHaveValue('New workspace');
});

test('mobile Modal fits viewport with focused form and scrollable content', async ({ page }) => {
 await page.setViewportSize({ width: 390, height: 700 });
 await page.goto('/#/modal', { waitUntil: 'domcontentloaded' });
 await page.getByRole('button', { name: '打开基础弹窗' }).click();
 const dialog = page.getByRole('dialog', { name: '基础弹窗', exact: true });
 const bounds = await dialog.boundingBox();
 expect(bounds!.x).toBeGreaterThanOrEqual(0);
 expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390);
 await dialog.getByRole('textbox').fill('手机输入');
 await page.screenshot({ path: '.artifacts/modal-mobile.png' });
 await page.keyboard.press('Escape');
});
