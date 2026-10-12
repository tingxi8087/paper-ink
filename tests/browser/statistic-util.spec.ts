import { test, expect } from '@playwright/test';
test('statistics show exact decimals, custom formatting and loading transitions', async ({page}) => {
  await page.goto('/#/statistic');
  await expect(page.getByRole('heading',{name:'Statistic 统计数值',exact:true})).toBeVisible();
  await expect(page.getByText('12,345,678,901,234,567,890.13',{exact:true})).toBeVisible();
  await expect(page.getByText('-12 345,60',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'切换加载',exact:true}).click();
  await expect(page.getByText('376',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'切换加载',exact:true}).click();
  await expect(page.getByText('376',{exact:true})).toHaveCount(0);
  await expect(page.locator('.demo-error')).toHaveCount(0);
});
test('type utility page documents type-only imports without requiring CSS', async ({page}) => {
  await page.goto('/#/util');
  await expect(page.getByRole('heading',{name:'Util 工具类型',exact:true})).toBeVisible();
  await expect(page.locator('.doc-imports')).toContainText('paper-ink/util');
  await expect(page.locator('.doc-imports')).not.toContainText('style.css');
});
