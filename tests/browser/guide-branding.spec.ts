import { expect, test } from '@playwright/test';

test.beforeEach(async({page})=>{
  await page.route('https://fonts.googleapis.com/**',route=>route.abort());
});

test('quick start exposes working local-file commands for all package managers without implying a registry release',async({page})=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/#/guide');
  await expect(page.getByRole('heading',{name:'快速开始',exact:true})).toBeVisible();
  await expect(page.locator('.main-content')).toContainText('尚未发布到 npm');
  const commands=page.getByLabel('选择包管理器');
  for(const [name,command,future] of [
    ['npm','npm install ./paper-ink-0.1.0.tgz','npm install paper-ink'],
    ['cnpm','cnpm install ./paper-ink-0.1.0.tgz','cnpm install paper-ink'],
    ['Yarn','yarn add ./paper-ink-0.1.0.tgz','yarn add paper-ink'],
    ['pnpm','pnpm add ./paper-ink-0.1.0.tgz','pnpm add paper-ink'],
  ]){
    await commands.getByRole('tab',{name,exact:true}).click();
    const panel=commands.getByRole('tabpanel');
    await expect(panel.locator('pre').first()).toHaveText(command);
    await panel.locator('summary').click();
    await expect(panel.locator('pre').nth(1)).toHaveText(future);
  }
  await page.setViewportSize({width:390,height:844});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.screenshot({path:'.artifacts/guide-install-mobile.png'});
  expect(errors).toEqual([]);
});

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
