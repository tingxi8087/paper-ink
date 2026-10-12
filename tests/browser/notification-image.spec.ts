import { test, expect } from '@playwright/test';
for (const width of [1440, 390]) test(`Notification and Image docs at ${width}`, async ({ page }) => {
 await page.setViewportSize({ width, height:900 }); const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
 for(const route of ['notification','image']) {
  await page.goto('/#/'+route); await expect(page.locator('h1')).toBeVisible(); await expect(page.locator('.demo-error')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
 }
 expect(errors).toEqual([]);
});
test('notification supports manual placement, keyed updates and delayed close', async ({ page }) => {
 await page.goto('/#/notification');
 const placement = page.getByRole('region', { name:'位置与手动关闭' }); await placement.getByRole('button', {name:'bottomLeft', exact:true}).click();
 const notice = page.locator('.pi-notification-holder--bottomLeft .pi-notification'); await expect(notice).toContainText('bottomLeft');
 await notice.getByRole('button',{name:'关闭通知'}).click(); await expect(notice).toHaveCount(0);
 const task = page.getByRole('region',{name:'更新与操作'}); await task.getByRole('button',{name:'显示任务通知'}).click();
 const job = page.locator('.pi-notification').filter({hasText:'等待处理'}); await job.getByRole('button',{name:'完成任务'}).click();
 await expect(page.locator('.pi-notification')).toHaveCount(1); await expect(page.locator('.pi-notification')).toContainText('处理完成');
 await expect(page.locator('.pi-notification')).toHaveCount(0); await expect(task).toContainText('通知已关闭');
});
test('image fallback, transforms, keyboard groups and controlled open', async ({ page }) => {
 await page.goto('/#/image');
 await expect(page.locator('.doc-imports')).toContainText("import { Image } from 'paper-ink/image'");
 const fallback = page.getByRole('region',{name:'加载失败回退'}).getByRole('img'); await expect(fallback).toHaveAttribute('src', /^data:image\/svg/);
 const group = page.getByRole('region',{name:'图片分组'}); const trigger = group.getByRole('button',{name:'预览 分组山水二'}); await trigger.click();
 const dialog = page.getByRole('dialog',{name:'图片预览'}); await expect(dialog).toBeVisible(); await expect(dialog).toContainText('2 / 2');
 await dialog.getByRole('button',{name:'放大图片'}).click(); await expect(dialog.locator('.pi-image-stage img')).toHaveCSS('transform', 'matrix(1.5, 0, 0, 1.5, 0, 0)');
 await dialog.getByRole('button',{name:'旋转图片'}).click(); await expect(dialog.locator('.pi-image-stage img')).toHaveCSS('transform', 'matrix(0, 1.5, -1.5, 0, 0, 0)');
 await page.keyboard.press('ArrowRight'); await expect(dialog).toContainText('1 / 2'); await page.keyboard.press('Escape'); await expect(dialog).toHaveCount(0); await expect(trigger).toBeFocused();
 await page.getByRole('button',{name:'打开受控预览'}).click(); await expect(page.getByRole('dialog')).toBeVisible(); await page.getByRole('button',{name:'关闭图片预览'}).click(); await expect(page.getByRole('dialog')).toHaveCount(0);
});
