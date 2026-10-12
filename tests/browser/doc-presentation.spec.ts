import { expect, test } from '@playwright/test';
import { readdirSync } from 'node:fs';

test.describe.configure({ mode: 'parallel' });
const routes = [...readdirSync('apps/website/src/content/components'), 'hooks'].sort();

for (const width of [1440, 390]) {
  for (const [group, batch] of [routes.slice(0, 20), routes.slice(20)].entries()) {
    test(`component documentation has styled reference sections at ${width}px, group ${group + 1}`, async ({ page }) => {
      test.setTimeout(120_000);
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.setViewportSize({ width, height: 900 });
      for (const route of batch) {
        await test.step(route, async () => {
          await page.goto('/#/' + route, { waitUntil: 'domcontentloaded' });
          await expect(page.locator('.main-content > h1')).toBeVisible();
          await expect(page.locator('.main-content .doc-boundary').first()).toBeVisible();
          await expect(page.locator('.main-content .doc-imports').first()).toBeVisible();
          const audit = await page.locator('.main-content').evaluate(main => {
            const tables = [...main.querySelectorAll('table')].filter(table => !table.closest('.demo'));
            return {
              tableCount: tables.length,
              unwrappedTables: tables.filter(table => !table.closest('.table-scroll')).length,
              unstyledTables: tables.filter(table => getComputedStyle(table.closest('.table-scroll') ?? table).borderTopStyle === 'none').length,
              emptyHeaders: tables.flatMap(table => [...table.querySelectorAll('thead th')]).filter(header => !header.textContent?.trim()).length,
              overflow: document.documentElement.scrollWidth - innerWidth,
              demoErrors: [...main.querySelectorAll('.demo-error')].map(error => error.textContent?.trim()).filter(Boolean),
            };
          });
          expect(audit.tableCount, route).toBeGreaterThan(0);
          expect(audit.unwrappedTables, route).toBe(0);
          expect(audit.unstyledTables, route).toBe(0);
          expect(audit.emptyHeaders, route).toBe(0);
          expect(audit.overflow, route).toBeLessThanOrEqual(1);
          expect(audit.demoErrors, route).toEqual([]);
        });
      }
      expect(errors).toEqual([]);
    });
  }
}

test('Segmented reference uses typed API rows and compact styled description', async ({ page }) => {
  await page.goto('/#/segmented', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Segmented 分段控制器', exact: true })).toBeVisible();
  const table = page.locator('.main-content .table-scroll table').first();
  await expect(table.locator('thead')).toContainText('属性');
  await expect(table.locator('thead')).toContainText('类型');
  await expect(table.locator('thead')).toContainText('默认值');
  await expect(table.locator('thead')).toContainText('说明');
  const options = table.locator('tbody tr').filter({ has: page.locator('td:first-child', { hasText: /^options$/ }) });
  await expect(options).toContainText('SegmentedOption');
  await expect(table.locator('tbody tr').filter({ has: page.locator('td:first-child', { hasText: /^onChange$/ }) })).toContainText('=>');
  await expect(page.locator('.doc-boundary')).toHaveCSS('border-left-width', '3px');
  await expect(page.locator('.doc-import-card')).toHaveCount(2);
});
