import { test, expect } from '@playwright/test';

test('Menu documentation examples and API cards fit desktop and mobile', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 }); await page.goto('/#/menu');
    await expect(page.locator('.demo')).toHaveCount(19); await expect(page.locator('.demo-error')).toHaveCount(0);
    await expect(page.locator('.doc-import-card')).toHaveCount(2);
    expect(await page.getByRole('table').count()).toBeGreaterThanOrEqual(2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  expect(errors).toEqual([]);
});

test('Inline navigation keeps submenu selection and permits native Tab traversal', async ({ page }) => {
  await page.goto('/#/menu'); const demo = page.getByRole('region', { name: '基础侧边导航', exact: true });
  const nav = demo.locator('nav'); const parent = nav.getByRole('button', { name: '工作空间', exact: true });
  await parent.click(); await expect(parent).toHaveAttribute('aria-expanded', 'true');
  await nav.getByRole('button', { name: '成员', exact: true }).click();
  await expect(nav.getByRole('button', { name: '成员', exact: true })).toHaveAttribute('aria-current', 'page');
  await expect(parent).toHaveAttribute('aria-expanded', 'true');
  await parent.focus(); await page.keyboard.press('Tab'); await expect(nav.getByRole('button', { name: '成员', exact: true })).toBeFocused();
  await page.keyboard.press('ArrowLeft'); await expect(parent).toBeFocused();
});

test('Horizontal submenu is portalled and Escape returns focus to its trigger', async ({ page }) => {
  await page.goto('/#/menu'); const demo = page.getByRole('region', { name: '顶部下拉与多级内容', exact: true });
  const parent = demo.locator('nav').getByRole('button', { name: '工作空间', exact: true });
  await parent.focus(); await page.keyboard.press('ArrowDown');
  await expect(parent).toHaveAttribute('aria-expanded', 'true');
  // Only one visible portal child may be focused; inline examples remain independently visible.
  await expect.poll(() => page.evaluate(() => document.activeElement?.textContent?.includes('成员'))).toBe(true);
  expect(await demo.locator('.pi-menu__popup').count()).toBe(0);
  await page.keyboard.press('Escape'); await expect(parent).toHaveAttribute('aria-expanded', 'false'); await expect(parent).toBeFocused();
});

test('Horizontal popup outside dismissal lets the clicked control retain focus', async ({ page }) => {
  await page.goto('/#/menu'); const demo = page.getByRole('region', { name: '顶部下拉与多级内容', exact: true });
  const parent = demo.locator('nav').getByRole('button', { name: '工作空间', exact: true });
  await parent.click(); await expect(parent).toHaveAttribute('aria-expanded', 'true');
  const edit = demo.getByRole('button', { name: '编辑代码', exact: true }); await edit.click();
  await expect(parent).toHaveAttribute('aria-expanded', 'false'); await expect(demo.getByRole('button', { name: '收起代码', exact: true })).toBeFocused();
});

test('Controlled selection deduplicates events and external updates do not auto-expand', async ({ page }) => {
  await page.goto('/#/menu'); const demo = page.getByRole('region', { name: '受控选中与事件', exact: true });
  const member = demo.locator('nav').getByRole('button', { name: '成员', exact: true });
  await member.click(); await member.click();
  await expect(demo.getByRole('status')).toContainText('选中变化 1 次'); await expect(demo.getByRole('status')).toContainText('members ← workspace');
  await demo.getByRole('button', { name: '外部选中审计', exact: true }).click();
  await expect(demo.locator('nav').getByRole('button', { name: '高级', exact: true })).toHaveAttribute('aria-expanded', 'false');
  await expect(demo.getByRole('status')).toContainText('选中变化 1 次');
});

test('Accordion and collapsed popup retain hidden nested expansion state', async ({ page }) => {
  await page.goto('/#/menu'); const accordion = page.getByRole('region', { name: '同层手风琴', exact: true });
  await accordion.locator('nav').getByRole('button', { name: '报表', exact: true }).click();
  await expect(accordion.getByRole('status')).toContainText('advanced');
  await expect(accordion.locator('nav').getByRole('button', { name: '工作空间', exact: true })).toHaveAttribute('aria-expanded', 'false');
  await accordion.locator('nav').getByRole('button', { name: '工作空间', exact: true }).click();
  await expect(accordion.locator('nav').getByRole('button', { name: '高级', exact: true })).toHaveAttribute('aria-expanded', 'true');
  const collapsed = page.getByRole('region', { name: '图标折叠与状态保留', exact: true });
  await collapsed.getByRole('button', { name: '折叠侧栏', exact: true }).click();
  const parent = collapsed.locator('nav').getByRole('button', { name: '工作空间', exact: true });
  await parent.focus(); await parent.press('Enter'); await page.keyboard.press('Escape'); await expect(parent).toBeFocused();
  await collapsed.getByRole('button', { name: '恢复侧栏', exact: true }).click();
  await expect(collapsed.locator('nav').getByRole('button', { name: '高级', exact: true })).toHaveAttribute('aria-expanded', 'true');
  await expect(collapsed.locator('nav').getByRole('button', { name: '审计', exact: true })).toHaveAttribute('aria-current', 'page');
});

test('Horizontal overflow keyboard reveals end items and popup escapes its clipping ancestor', async ({ page }) => {
  await page.goto('/#/menu'); const demo = page.getByRole('region', { name: '顶部溢出滚动', exact: true });
  const nav = demo.locator('nav'); const first = nav.getByRole('button', { name: '栏目 1', exact: true }); await first.focus();
  await page.keyboard.press('End'); await expect(nav.getByRole('button', { name: '栏目 10', exact: true })).toBeFocused();
  await page.keyboard.press('ArrowLeft'); const trigger = nav.getByRole('button', { name: '栏目 9', exact: true }); await expect(trigger).toBeFocused();
  await page.keyboard.press('ArrowDown'); await expect(page.getByRole('button', { name: '末端下拉内容', exact: true })).toBeVisible();
  await expect(demo.getByRole('button', { name: '末端下拉内容', exact: true })).toHaveCount(0);
  const bounds = await page.getByRole('button', { name: '末端下拉内容', exact: true }).boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(0); expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(1440);
});

test('Portal inherits local theme and native link cancellation never changes selection', async ({ page }) => {
  await page.goto('/#/menu'); const theme = page.getByRole('region', { name: '局部主题', exact: true });
  await theme.locator('nav').getByRole('button', { name: '工作空间', exact: true }).click();
  const popup = page.locator('.pi-menu__popup'); await expect(popup).toHaveCSS('background-color', 'rgb(36, 36, 35)');
  await expect(popup).toHaveCSS('opacity', '1');
  await page.screenshot({ path: '.artifacts/menu-theme.png' });
  await page.keyboard.press('Escape');
  const links = page.getByRole('region', { name: '原生链接与取消选择', exact: true });
  await links.getByRole('link', { name: '取消默认选中与跳转', exact: true }).click();
  await expect(links.getByRole('status')).toContainText('当前：current');
  await expect(links.getByRole('status')).toContainText('点击：cancel');
});

test('Controlled top-level open changes emit once and mode switches retain active route', async ({ page }) => {
  await page.goto('/#/menu'); const controlled = page.getByRole('region', { name: '顶部受控开合', exact: true });
  await controlled.locator('nav').getByRole('button', { name: '工作空间', exact: true }).click();
  await expect(controlled.getByRole('status')).toContainText('通知 1 次');
  await controlled.locator('nav').getByRole('button', { name: '报表', exact: true }).click();
  await expect(controlled.getByRole('status')).toContainText('通知 2 次');
  await expect(controlled.getByRole('status')).toContainText('展开：reports');
  await controlled.getByRole('button', { name: '外部关闭', exact: true }).click();
  await expect(controlled.getByRole('status')).toContainText('通知 3 次');
  const switching = page.getByRole('region', { name: '顶部与侧边切换', exact: true });
  await switching.getByRole('switch').click();
  await expect(switching.locator('nav')).toHaveClass(/pi-menu--horizontal/);
  await expect(page.locator('.pi-menu__popup').getByRole('button', { name: '审计', exact: true })).toBeVisible();
  await switching.getByRole('switch').focus(); await switching.getByRole('switch').press('Space');
  await expect(switching.locator('nav').getByRole('button', { name: '审计', exact: true })).toHaveAttribute('aria-current', 'page');
});

test('Interrupted Menu popup entry fades continuously without a brightness flash', async ({ page }) => {
  await page.goto('/#/menu'); const parent = page.getByRole('region', { name: '顶部下拉与多级内容', exact: true }).locator('nav').getByRole('button', { name: '工作空间', exact: true });
  await page.addStyleTag({ content: '.pi-menu__popup { transition-duration: 1000ms !important; }' });
  await parent.click();
  const trace = await page.evaluate(async () => {
    const popup = document.querySelector<HTMLElement>('.pi-menu__popup')!;
    while (Number(getComputedStyle(popup).opacity) < .15) await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    const before = Number(getComputedStyle(popup).opacity);
    popup.querySelector<HTMLButtonElement>('[data-menu-key="members"]')!.click();
    const after: number[] = [];
    for (let i = 0; i < 4; i++) { await new Promise<void>(resolve => requestAnimationFrame(() => resolve())); if (popup.isConnected) after.push(Number(getComputedStyle(popup).opacity)); }
    return { before, after };
  });
  expect(trace.before).toBeLessThan(.9); expect(Math.max(...trace.after)).toBeLessThanOrEqual(trace.before + .03);
  await expect(parent).toHaveAttribute('aria-expanded', 'false');
});
