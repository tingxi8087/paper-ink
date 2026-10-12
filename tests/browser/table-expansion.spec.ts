import { test, expect, type Page } from '@playwright/test';
const region = (page: Page, name: string) => page.getByRole('region', { name, exact: true });
test.beforeEach(async ({ page }) => { await page.goto('/#/table'); await expect(page.getByRole('heading', { name: 'Table 表格', exact: true })).toBeVisible(); });
test('controlled expansion handles keyboard, disabled rows, focus, stable keys and detail unmount', async ({ page }) => {
  const demo = region(page, '受控展开、详情输入与行选择'); const expand = demo.getByRole('button', { name: '展开成员 1', exact: true });
  await expect(demo.getByRole('button', { name: '展开成员 3', exact: true })).toHaveCount(0);
  await expand.focus(); await page.keyboard.press('Enter'); await expect(demo.getByRole('button', { name: '收起成员 1', exact: true })).toBeFocused();
  await expect(demo.locator('span[role=status]').last()).toHaveText('展开 keys：1；行点击 0 次；选择 0 项');
  const input = demo.getByRole('textbox', { name: '详情备注 1', exact: true }); await input.fill('暂存内容');
  await demo.getByRole('button', { name: '收起成员 1', exact: true }).click(); await expect(input).toHaveCount(0);
  await demo.getByRole('button', { name: '展开成员 1', exact: true }).click(); await expect(input).toHaveValue('');
  await demo.getByRole('button', { name: '反转数据', exact: true }).click(); await expect(input).toBeVisible();
  await demo.getByRole('button', { name: '外部展开第二行', exact: true }).click(); await expect(input).toHaveCount(0); await expect(demo.getByRole('textbox', { name: '详情备注 2', exact: true })).toBeVisible();
  await demo.getByRole('checkbox', { name: '勾选展开成员 2', exact: true }).check(); await expect(demo.locator('span[role=status]').last()).toContainText('选择 1 项');
});
test('custom SVG keeps keyboard button semantics and supports a nested table', async ({ page }) => {
  const demo = region(page, '嵌套表格与自定义展开图标'); const button = demo.getByRole('button', { name: '展开设计组', exact: true });
  await expect(button.locator('svg')).toHaveCount(1); await button.focus(); await page.keyboard.press('Space');
  const nested = demo.getByRole('table', { name: '设计组任务', exact: true }); await expect(nested).toBeVisible(); await expect(nested.locator('tbody tr')).toHaveCount(2);
  await expect(nested).toContainText('组件视觉'); await demo.getByRole('button', { name: '收起设计组', exact: true }).click(); await expect(nested).toHaveCount(0);
});
test('native row spans cover two physical rows and zero hides occupied cells', async ({ page }) => {
  const demo = region(page, '按分组纵向合并单元格'); const rows = demo.locator('tbody > tr'); await expect(rows).toHaveCount(3);
  await expect(rows.nth(0).locator('td')).toHaveCount(3); await expect(rows.nth(1).locator('td')).toHaveCount(2); await expect(rows.nth(2).locator('td')).toHaveCount(3);
  const merged = rows.first().locator('td').first(); await expect(merged).toHaveAttribute('rowspan', '2');
  const geometry = await demo.locator('table').evaluate(table => {
    const rows = table.querySelectorAll('tbody > tr'); const cell = rows[0].querySelector('td')!.getBoundingClientRect();
    return { top: cell.top, bottom: cell.bottom, firstTop: rows[0].getBoundingClientRect().top, secondBottom: rows[1].getBoundingClientRect().bottom };
  }); expect(geometry.top).toBeCloseTo(geometry.firstTop, 0); expect(geometry.bottom).toBeCloseTo(geometry.secondBottom, 0);
});
test('body and one-row header colspans hide covered cells and preserve header geometry', async ({ page }) => {
  const demo = region(page, '横向合并与单行表头分组'); await expect(demo.locator('thead th')).toHaveCount(2);
  await expect(demo.locator('thead th').first()).toHaveAttribute('colspan', '2'); await expect(demo.locator('tbody > tr').first().locator('td')).toHaveCount(1);
  await expect(demo.locator('tbody > tr').first().locator('td')).toHaveAttribute('colspan', '3'); await expect(demo.locator('tbody > tr').nth(1).locator('td')).toHaveCount(3);
  const geometry = await demo.locator('table').evaluate(table => {
    const header = table.querySelector('thead th')!.getBoundingClientRect(); const cells = table.querySelectorAll('tbody tr:nth-child(2) td');
    return { headerLeft: header.left, headerRight: header.right, firstLeft: cells[0].getBoundingClientRect().left, secondRight: cells[1].getBoundingClientRect().right };
  }); expect(geometry.headerLeft).toBeCloseTo(geometry.firstLeft, 0); expect(geometry.headerRight).toBeCloseTo(geometry.secondRight, 0);
});
test('merged group places details after group in parent order with fixed selection and summary', async ({ page }) => {
  const demo = region(page, '合并、展开、固定列与汇总组合'); await demo.getByRole('button', { name: '展开组合 2', exact: true }).click(); await demo.getByRole('button', { name: '展开组合 1', exact: true }).click();
  const rows = demo.locator('tbody > tr'); await expect(rows).toHaveCount(5); await expect(rows.nth(0)).toContainText('小林'); await expect(rows.nth(1)).toContainText('小陈'); await expect(rows.nth(2)).toContainText('第 1 行详情'); await expect(rows.nth(3)).toContainText('第 2 行详情'); await expect(rows.nth(4)).toContainText('小周');
  await expect(rows.first().getByRole('cell', { name: '设计组', exact: true })).toHaveAttribute('rowspan', '2');
  await expect(rows.nth(2).locator('td')).toHaveAttribute('colspan', '6'); await expect(demo.locator('tfoot')).toContainText('240');
  await demo.getByRole('checkbox', { name: '勾选组合 2', exact: true }).check(); await expect(demo.locator('span[role=status]').last()).toHaveText('选择 1 项');
  const viewport = demo.locator('.pi-table__viewport').first(); const firstCell = rows.first().locator('td').first(); const before = (await firstCell.boundingBox())!;
  await viewport.evaluate(node => { node.scrollLeft = 180; }); const after = (await firstCell.boundingBox())!; expect(after.x).toBeCloseTo(before.x, 0);
  await demo.getByRole('button', { name: '收起组合 1', exact: true }).click(); await expect(demo.getByLabel('组合详情 1')).toHaveCount(0); await expect(demo.getByLabel('组合详情 2')).toBeVisible();
});
test('hidden columns recalculate spans and paged source retains external expansion keys', async ({ page }) => {
  const demo = region(page, '分页、隐藏列与展开状态保留'); await expect(demo.locator('tbody > tr').first().getByRole('cell', { name: '第一组说明', exact: true })).toHaveAttribute('colspan', '2');
  await demo.getByRole('button', { name: '展开分页 1', exact: true }).click(); await expect(demo.getByLabel('分页详情 1')).toBeVisible();
  await demo.getByRole('checkbox', { name: '隐藏动态年龄列', exact: true }).check(); await expect(demo.getByRole('columnheader', { name: '年龄', exact: true })).toHaveCount(0);
  await expect(demo.locator('tbody > tr').first().getByRole('cell', { name: '第一组说明', exact: true })).toHaveAttribute('colspan', '1');
  await expect(demo.getByLabel('分页详情 1').locator('xpath=ancestor::td')).toHaveAttribute('colspan', '2');
  await demo.getByRole('button', { name: '第 2 页', exact: true }).click(); await expect(demo.locator('tbody')).toContainText('第二组说明'); await expect(demo.getByLabel('分页详情 1')).toHaveCount(0); await expect(demo.locator('span[role=status]').last()).toHaveText('保留展开 keys：1');
  await demo.getByRole('button', { name: '第 1 页', exact: true }).click(); await expect(demo.getByLabel('分页详情 1')).toBeVisible();
});
test('expanded and merged examples render on mobile without page overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await expect(page.locator('.demo-error')).toHaveCount(0);
  await region(page, '合并、展开、固定列与汇总组合').getByRole('button', { name: '展开组合 1', exact: true }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390); await page.screenshot({ path: '.artifacts/table-expansion-mobile.png', fullPage: true });
});
