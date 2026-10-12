import { test, expect } from '@playwright/test';
test.beforeEach(async ({ page }) => { await page.goto('/#/hooks'); await page.evaluate(() => localStorage.clear()); await page.reload(); await expect(page.getByRole('heading', { name: 'Hooks 通用钩子' })).toBeVisible(); });
test('generic hooks live independently, update refs and persist counts after reload', async ({ page }) => {
  await expect(page.locator('.demo')).toHaveCount(5); await expect(page.locator('.demo-error')).toHaveCount(0);
  const ref = page.getByRole('region', { name: 'useRefState 即时读取与连续更新', exact: true }); await ref.getByRole('button', { name: '连续增加两次' }).click(); await expect(ref.getByRole('status')).toHaveText('渲染值 2，即时 ref 2');
  const count = page.getByRole('region', { name: '本地计数与刷新恢复', exact: true }); await count.getByRole('button', { name: '增加计数' }).click(); await expect(count.getByRole('status')).toHaveText('本地计数：1');
  expect(await page.evaluate(() => localStorage.getItem('paper-ink-demo-hooks-count'))).toBe('1'); await page.reload(); await expect(count.getByRole('status')).toHaveText('本地计数：1');
  await page.goto('/#/table'); await expect(page.getByRole('heading', { name: 'Table 表格', exact: true })).toBeVisible(); await expect(page.getByText('useRefState(initialState)', { exact: true })).toHaveCount(0);
});
test('object drafts and boolean preferences restore from actual browser storage', async ({ page }) => {
  await page.getByRole('textbox', { name: '草稿姓名' }).fill('纸墨'); await page.getByRole('textbox', { name: '草稿备注' }).fill('自动保存'); await page.getByRole('checkbox', { name: '记住紧凑模式' }).check(); await page.reload();
  await expect(page.getByRole('textbox', { name: '草稿姓名' })).toHaveValue('纸墨'); await expect(page.getByRole('textbox', { name: '草稿备注' })).toHaveValue('自动保存'); await expect(page.getByRole('checkbox', { name: '记住紧凑模式' })).toBeChecked();
});
test('switching keys keeps independent slots; docs fit mobile', async ({ page }) => {
  const demo = page.getByRole('region', { name: '切换存储 key', exact: true }); await demo.getByRole('button', { name: '增加当前槽位' }).click(); await demo.getByRole('button', { name: '槽位 B' }).click(); await expect(demo.getByRole('status')).toHaveText('槽位 B：0');
  await demo.getByRole('button', { name: '增加当前槽位' }).click(); await demo.getByRole('button', { name: '增加当前槽位' }).click(); await demo.getByRole('button', { name: '槽位 A' }).click(); await expect(demo.getByRole('status')).toHaveText('槽位 A：1');
  await page.setViewportSize({ width: 390, height: 844 }); expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390); await expect(page.locator('.demo-error')).toHaveCount(0); await page.screenshot({ path: '.artifacts/hooks-mobile.png', fullPage: true });
});
