import { test, expect } from '@playwright/test';
test.beforeEach(async ({ page }) => { await page.route('https://fonts.googleapis.com/**', route => route.fulfill({ contentType: 'text/css', body: '' })); });

test('Popover keeps interactive hover and click content open until dismissed', async ({ page }) => {
  await page.goto('/#/popover');
  await page.getByRole('button', { name: '悬停查看', exact: true }).hover();
  const hoverCard = page.getByRole('dialog', { name: '项目概览' });
  await expect(hoverCard).toBeVisible();
  await hoverCard.getByRole('button', { name: '查看项目', exact: true }).hover();
  await page.waitForTimeout(160);
  await expect(hoverCard).toBeVisible();
  await hoverCard.getByRole('button', { name: '查看项目', exact: true }).click();
  await expect(hoverCard).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(hoverCard).not.toBeVisible();
  await page.getByRole('button', { name: '打开设置', exact: true }).click();
  const editor = page.getByRole('dialog', { name: '项目设置' });
  await editor.getByPlaceholder('项目名称').fill('测试项目');
  await editor.getByRole('button', { name: '保存', exact: true }).click();
  await expect(editor).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(editor).not.toBeVisible();
});

test('Dropdown keyboard selection and asynchronous Popconfirm work in the browser', async ({ page }) => {
  await page.goto('/#/dropdown');
  await page.getByRole('button', { name: '更多操作', exact: true }).focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('menuitem', { name: '编辑', exact: true })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('menuitem', { name: '复制', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('menu')).not.toBeVisible();
  await expect(page.getByRole('button', { name: '更多操作', exact: true })).toBeFocused();
  await page.goto('/#/popconfirm');
  await page.getByRole('button', { name: '异步保存', exact: true }).click();
  await page.getByRole('button', { name: '确定', exact: true }).click();
  await expect(page.getByRole('button', { name: '取消', exact: true })).toBeDisabled();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 4000 });
});

test('Drawer attaches to viewport edges and restores scroll and focus on desktop and mobile', async ({ page }) => {
  await page.goto('/#/drawer');
  const trigger = page.getByRole('button', { name: '查看详情', exact: true });
  await trigger.click();
  const drawer = page.getByRole('dialog', { name: '编辑项目' });
  await expect(drawer).toBeVisible();
  await expect(drawer).toHaveCSS('animation-name', 'pi-drawer-enter');
  await expect.poll(async () => { const r = await drawer.boundingBox(); return Math.abs(r!.x + r!.width - page.viewportSize()!.width); }).toBeLessThan(1);
  let rect = await drawer.boundingBox();
  expect(Math.abs(rect!.x + rect!.width - page.viewportSize()!.width)).toBeLessThan(1);
  expect(rect!.y).toBe(0);
  await drawer.getByPlaceholder('项目名称').fill('项目');
  await page.keyboard.press('Escape');
  await expect(drawer).toHaveCSS('animation-name', 'pi-drawer-leave');
  await expect(drawer).not.toBeVisible();
  await expect(trigger).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: '底部打开', exact: true }).click();
  const bottom = page.getByRole('dialog', { name: '快捷操作' });
  await expect.poll(async () => { const r = await bottom.boundingBox(); return Math.abs(r!.y + r!.height - 844); }).toBeLessThan(1);
  rect = await bottom.boundingBox();
  expect(Math.abs(rect!.y + rect!.height - 844)).toBeLessThan(1);
  expect(rect!.width).toBeLessThanOrEqual(390);
  await bottom.getByRole('button', { name: '关闭', exact: true }).last().click();
  await expect(bottom).not.toBeVisible();
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
});

test('Drawer entrance moves the panel from outside the viewport while focusing its content', async ({ page }) => {
  await page.goto('/#/drawer', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: '查看详情', exact: true }).waitFor();
  const positions = await page.evaluate(async () => {
    [...document.querySelectorAll('button')].find(button => button.textContent === '查看详情')!.click();
    await new Promise(requestAnimationFrame);
    const panel = document.querySelector<HTMLElement>('.pi-drawer')!;
    const animation = panel.getAnimations()[0];
    animation.pause();
    animation.currentTime = 0;
    const start = panel.getBoundingClientRect().x;
    animation.currentTime = 130;
    const middle = panel.getBoundingClientRect().x;
    animation.currentTime = 260;
    const end = panel.getBoundingClientRect().x;
    return { start, middle, end, viewport: window.innerWidth, width: panel.offsetWidth, focused: panel.contains(document.activeElement) };
  });
  expect(positions.focused).toBe(true);
  expect(positions.start).toBeCloseTo(positions.viewport, 0);
  expect(positions.middle).toBeLessThan(positions.start);
  expect(positions.middle).toBeGreaterThan(positions.end);
  expect(positions.end).toBeCloseTo(positions.viewport - positions.width, 0);
});

test('Modal is vertically centered by default on desktop and mobile', async ({page})=>{
  for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){
    await page.setViewportSize(viewport);
    await page.goto('/#/modal');
    await page.getByRole('button',{name:'打开基础弹窗',exact:true}).click();
    const dialog=page.getByRole('dialog',{name:'基础弹窗',exact:true});
    await expect(dialog).toBeVisible();
    await expect.poll(async()=>{const box=(await dialog.boundingBox())!;return Math.abs(box.y+box.height/2-viewport.height/2);}).toBeLessThan(1);
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  }
});
