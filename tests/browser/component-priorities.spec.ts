import { test, expect } from '@playwright/test';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { readFile } from 'node:fs/promises';

const url = pathToFileURL(resolve('doc/component-priorities.html')).href;

test('planning pending four-point filter excludes independent and deferred APIs', async ({ page }) => {
  await page.goto(url + '#status=pending&scores=4');
  await expect(page.locator('#total')).toHaveText('0 / 85');
  await expect(page.locator('#pending')).toHaveText('0');
  await expect(page.locator('#rows tr')).toHaveCount(0);
  await expect(page.locator('#empty')).toBeVisible();
  await page.locator('#status').selectOption('independent');
  await expect(page.locator('#total')).toHaveText('2 / 85');
  await expect(page.locator('#independent')).toHaveText('2');
  await expect(page.locator('#rows')).toContainText('Form');
  await expect(page.locator('#rows')).toContainText('Table');
  await page.reload();
  await expect(page.locator('#status')).toHaveValue('independent');
  await expect(page.locator('#total')).toHaveText('2 / 85');
  const downloadEvent = page.waitForEvent('download');
  await page.locator('#export').click();
  const download = await downloadEvent;
  const csv = await readFile((await download.path())!, 'utf8');
  expect(csv).toContain('已有独立方案');
  expect(csv).toContain('使用独立方案');
  expect(csv).not.toContain('待实现');
  await page.locator('#status').selectOption('deferred');
  await expect(page.locator('#total')).toHaveText('1 / 85');
  await expect(page.locator('#deferred')).toHaveText('1');
  await expect(page.locator('#rows')).toContainText('Space');
});

test('planning status totals reconcile across scopes and compact mobile layout', async ({ page }) => {
  await page.goto(url);
  for (const [id, value] of Object.entries({ total: '85 / 85', done: '61', pending: '17', independent: '6', deferred: '1' })) {
    await expect(page.locator('#' + id)).toHaveText(value);
  }
  await page.locator('#scope').selectOption('all');
  await expect(page.locator('#total')).toHaveText('91 / 91');
  await expect(page.locator('#pending')).toHaveText('23');
  await page.locator('#scope').selectOption('own');
  await expect(page.locator('#total')).toHaveText('12 / 12');
  await expect(page.locator('#done')).toHaveText('12');
  await expect(page.locator('#independent')).toHaveText('0');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(url + '#status=pending&scores=4');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.locator('#status').selectOption('done');
  await expect(page.locator('#rows')).toContainText('DatePicker');
  await page.screenshot({ path: '.artifacts/component-priorities-mobile.png', fullPage: true });
});
