import { expect, test } from '@playwright/test';

test.beforeEach(async({page})=>{
  await page.route('https://fonts.googleapis.com/**',route=>route.abort());
});

for (const width of [1440, 390, 320]) {
  test(`quick start supports both installation methods and a working first example at ${width}px`, async ({page}) => {
    const errors:string[]=[]; page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({width,height:900});
    await page.goto('/#/guide');
    const main = page.locator('.main-content');
    await expect(page.locator('.brand')).toHaveCSS('white-space','nowrap');
    expect((await page.locator('.brand span').boundingBox())!.height).toBeLessThan(28);
    const commands = page.getByLabel('选择包管理器');
    for (const [name,command] of [['npm','npm install paper-ink'],['cnpm','cnpm install paper-ink'],['Yarn','yarn add paper-ink'],['pnpm','pnpm add paper-ink']]) {
      await commands.getByRole('tab',{name,exact:true}).click();
      await expect(commands.getByRole('tabpanel').locator('pre')).toHaveText(command);
    }
    for (const heading of ['开发命令','在线编辑示例','当前范围','主题配置']) {
      await expect(main.getByRole('heading',{name:heading,exact:true})).toHaveCount(0);
    }
    await expect(main).not.toContainText('.tgz');
    const code = page.getByLabel('第一个例子的完整代码');
    await expect(code).toContainText("from 'paper-ink'");
    const demo = page.getByRole('region',{name:'试试第一个例子'});
    await demo.getByRole('textbox',{name:'示例输入框'}).fill('你好，水墨');
    await demo.getByRole('button',{name:'确认',exact:true}).click();
    await expect(demo.getByRole('status')).toHaveText('你好，水墨');
    await page.getByLabel('选择安装方式').getByRole('tab',{name:'CLI 源码',exact:true}).click();
    await expect(main).toContainText('npx @tingxi8087/paper-ink-cli add button input stack');
    await expect(code).toContainText("from './components/paper-ink'");
    await expect(code).toContainText("'./components/paper-ink/style.css'");
    await expect(demo.getByRole('status')).toHaveText('你好，水墨');
    await demo.getByRole('button',{name:'编辑代码',exact:true}).click();
    await expect(demo.getByRole('textbox',{name:'试试第一个例子在线代码编辑器'})).toBeVisible();
    await demo.getByRole('button',{name:'收起代码',exact:true}).click();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await page.getByLabel('选择安装方式').getByRole('tab',{name:'组件包',exact:true}).click();
    await expect(code).toContainText("from 'paper-ink'");
    await page.screenshot({path:`.artifacts/quickstart-${width}.png`,fullPage:true});
    await main.getByRole('link',{name:'组件画廊',exact:true}).click();
    await expect(page.getByRole('heading',{name:'组件画廊',exact:true})).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test('document titles follow navigation, history and missing routes; the SVG favicon is a real served asset',async({page})=>{
  await page.goto('/#/guide');await expect(page).toHaveTitle('快速开始 - Paper Ink');
  const icon=page.locator('link[rel=icon]');await expect(icon).toHaveAttribute('type','image/svg+xml');
  const href=await icon.getAttribute('href');expect(href).toBe('./favicon.svg');
  const brand=page.locator('.brand-mark');
  await expect.poll(()=>brand.evaluate((el:HTMLImageElement)=>el.complete && el.naturalWidth > 0)).toBe(true);
  expect(await brand.evaluate((el:HTMLImageElement)=>el.currentSrc)).toBe(new URL(href!,page.url()).href);
  await expect(brand).toHaveCSS('width','28px');await expect(brand).toHaveCSS('height','28px');
  const response=await page.request.get(new URL(href!,page.url()).href);
  expect(response.ok()).toBe(true);expect(response.headers()['content-type']).toContain('image/svg+xml');
  expect(await response.text()).toContain('viewBox="0 0 64 64"');
  await page.locator('.sidebar').getByRole('link',{name:'Button 按钮',exact:true}).click();await expect(page).toHaveTitle('按钮 Button - Paper Ink');
  await page.locator('.sidebar').getByRole('link',{name:'Input 输入框',exact:true}).click();await expect(page).toHaveTitle('输入框 Input - Paper Ink');
  await page.goBack();await expect(page).toHaveTitle('按钮 Button - Paper Ink');
  await page.getByRole('link',{name:'主题',exact:true}).click();await expect(page).toHaveTitle('主题实验室 - Paper Ink');
  await page.locator('.brand').click();await expect(page).toHaveTitle('Paper Ink - 水墨风格的 React 组件库');
  await page.goto('/#/no-such-page');await expect(page).toHaveTitle('页面未找到 - Paper Ink');
});

for (const width of [1440, 390, 320]) {
  test(`GitHub repository link remains accessible at ${width}px`, async ({page}) => {
    await page.setViewportSize({width, height:900});
    await page.emulateMedia({reducedMotion:'reduce'});
    for (const route of ['/', '/button']) {
      await page.goto(`/#${route}`);
      const link = page.getByRole('link', {name:'GitHub 仓库（新窗口打开）'});
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute('href','https://github.com/tingxi8087/paper-ink');
      await expect(link).toHaveAttribute('target','_blank');
      await expect(link).toHaveAttribute('rel','noopener noreferrer');
      await expect(link.locator('svg')).toHaveCount(1);
      await link.focus(); await expect(link).toBeFocused();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    }
    if (width !== 320) {
      await page.goto('/#/');
      await page.screenshot({path:`.artifacts/github-header-${width}.png`,fullPage:true});
    }
  });
}
