import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://fonts.googleapis.com/**', route => route.abort());
});

test('sidebar filters Chinese, names, child APIs and Hooks while removing empty groups', async ({ page }) => {
  await page.goto('/#/button');
  const sidebar = page.locator('.sidebar');
  const search = page.getByRole('searchbox', { name: '筛选组件' });
  const links = sidebar.getByRole('link');
  const initialCount = await links.count();
  expect(initialCount).toBeGreaterThan(45);
  for (const [query, label] of [['输入框', 'Input 输入框'], ['Password', 'Input 输入框'], ['TextArea', 'Input 输入框'], ['useUpload', 'Upload 文件上传'], ['useRefState', '通用 Hooks'], ['弹窗', 'Modal 对话框']]) {
    await search.fill(query);
    await expect(sidebar.getByRole('link', { name: label, exact: true })).toBeVisible();
    for (const group of await sidebar.locator('.pi-menu__group').all()) expect(await group.getByRole('link').count()).toBeGreaterThan(0);
  }
  await page.screenshot({ path: '.artifacts/documentation-sidebar-desktop-20261013.png' });
  await search.fill('missing-component-不存在');
  await expect(sidebar.getByRole('status')).toHaveText('没有匹配的组件');
  await expect(links).toHaveCount(0);
  await page.getByRole('button', { name: '清空组件筛选' }).click();
  await expect(links).toHaveCount(initialCount);
  await expect(search).toHaveValue('');
});

test('homepage supports both shortcuts, ranked results, keyboard navigation and focus restoration', async ({ page }) => {
  await page.goto('/#/');
  const trigger = page.getByRole('button', { name: '搜索组件和文档', exact: true });
  await trigger.focus();
  for (const shortcut of ['Control+k', 'Meta+k']) {
    await page.keyboard.press(shortcut);
    const dialog = page.getByRole('dialog', { name: '搜索组件和文档', exact: true });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('combobox', { name: '搜索文档' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  }
  await trigger.click();
  const search = page.getByRole('combobox', { name: '搜索文档' });
  await search.fill('Input');
  await expect(page.getByRole('dialog', { name: '搜索组件和文档' })).toHaveCSS('opacity', '1');
  await page.screenshot({ path: '.artifacts/documentation-search-desktop-20261013.png' });
  const options = page.getByRole('option');
  await expect(options.first()).toContainText('Input 输入框');
  await search.press('ArrowDown');
  await expect(options.nth(1)).toHaveAttribute('aria-selected', 'true');
  await search.press('ArrowUp');
  await expect(options.first()).toHaveAttribute('aria-selected', 'true');
  await search.press('Enter');
  await expect(page).toHaveURL(/#\/input$/);
  await expect(page.getByRole('heading', { name: 'Input 输入框', exact: true })).toBeVisible();
});

test('empty search and composing Enter cannot accidentally navigate; aliases navigate to their parent document', async ({ page }) => {
  await page.goto('/#/button');
  await page.getByRole('button', { name: '搜索组件和文档', exact: true }).click();
  const search = page.getByRole('combobox', { name: '搜索文档' });
  await search.fill('不存在的文档zzz');
  await expect(page.getByRole('dialog', { name: '搜索组件和文档' }).getByRole('status')).toContainText('没有找到匹配的组件或文档');
  await search.press('Enter');
  await expect(page).toHaveURL(/#\/button$/);
  await search.fill('Password');
  await search.dispatchEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 229, isComposing: true });
  await expect(page.getByRole('dialog', { name: '搜索组件和文档' })).toBeVisible();
  await expect(page).toHaveURL(/#\/button$/);
  await search.press('Enter');
  await expect(page).toHaveURL(/#\/input$/);
  await page.getByRole('button', { name: '搜索组件和文档', exact: true }).click();
  await search.fill('useUpload');
  await page.getByRole('option').first().click();
  await expect(page).toHaveURL(/#\/upload$/);
});

test('mobile search and sidebar remain usable without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/');
  await page.getByRole('button', { name: '搜索组件和文档', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: '搜索组件和文档', exact: true });
  await dialog.getByRole('combobox').fill('日期');
  await expect(dialog).toHaveCSS('opacity', '1');
  const box = (await dialog.boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(390);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.screenshot({ path: '.artifacts/documentation-search-mobile-20261013.png' });
  await dialog.getByRole('option').first().click();
  await page.getByRole('button', { name: '展开导航' }).click();
  await page.getByRole('searchbox', { name: '筛选组件' }).fill('分页');
  await page.locator('.sidebar').getByRole('link', { name: 'Pagination 分页', exact: true }).click();
  await expect(page).toHaveURL(/#\/pagination$/);
  await expect(page.getByRole('button', { name: '展开导航' })).toHaveAttribute('aria-expanded', 'false');
});
