import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const region = (page: import('@playwright/test').Page, name: string) => page.getByRole('region', { name, exact: true });
test.beforeEach(async ({ page }) => { await page.goto('/#/table'); await expect(page.getByRole('heading', { name: 'Table 表格', exact: true })).toBeVisible(); });
test('eighteen live examples render, hidden columns and live editor work', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await expect(page.locator('.demo')).toHaveCount(18); await expect(page.locator('.demo-error')).toHaveCount(0);
  const demo = region(page, '基础展示与隐藏列'); await expect(demo.getByRole('columnheader', { name: '年龄' })).toBeVisible();
  expect(await demo.locator('tbody tr').first().locator('td').first().evaluate(cell => cell.getBoundingClientRect().width)).toBeGreaterThanOrEqual(160);
  await demo.getByRole('checkbox', { name: '隐藏年龄' }).check(); await expect(demo.getByRole('columnheader', { name: '年龄' })).toHaveCount(0);
  await demo.getByRole('button', { name: '编辑代码', exact: true }).click(); await expect(demo.getByRole('textbox', { name: '基础展示与隐藏列在线代码编辑器' })).toContainText('Table'); expect(errors).toEqual([]);
});
test('source pagination displays supplied rows once and page-size resets page', async ({ page }) => {
  const demo = region(page, 'Hook 直接绑定与内置分页'); await expect(demo.locator('tbody tr')).toHaveCount(5);
  await demo.getByRole('button', { name: '第 2 页', exact: true }).click(); await expect(demo.locator('span[role="status"]').last()).toHaveText('第 2 页，每页 5 条'); await expect(demo.locator('tbody')).toContainText('成员 6');
  await demo.getByRole('combobox').click(); await page.getByRole('option', { name: '10 条/页' }).click(); await expect(demo.locator('span[role="status"]').last()).toHaveText('第 1 页，每页 10 条'); await expect(demo.locator('tbody tr')).toHaveCount(10);
});
test('filter changes page and sort uses controlled query', async ({ page }) => {
  const demo = region(page, '筛选与排序查询（本地模拟）'); await expect(demo.locator('tbody tr')).toHaveCount(5);
  await demo.getByRole('button', { name: '第 2 页', exact: true }).click(); await demo.getByRole('textbox', { name: '筛选成员' }).fill('成员 48');
  await expect(demo.locator('span[role="status"]').last()).toHaveText('筛选结果 1 条，第 1 页'); await expect(demo.locator('tbody')).toContainText('成员 48');
  await demo.getByRole('textbox', { name: '筛选成员' }).fill(''); await demo.getByRole('columnheader').filter({ hasText: '年龄' }).getByRole('button').click(); await expect(demo.locator('th[aria-sort="ascending"]')).toHaveCount(1);
});
test('checked rows, disabled selection and business updates work', async ({ page }) => {
  const demo = region(page, '业务数据选择与禁选'); await expect(demo.getByRole('checkbox', { name: '选择成员 2' })).toBeDisabled();
  await demo.getByRole('checkbox', { name: '选择成员 1' }).check(); await expect(demo.locator('span[role="status"]').last()).toHaveText('已选 1 项：1');
  await demo.getByRole('button', { name: '业务设置第三行' }).click(); await expect(demo.locator('span[role="status"]').last()).toHaveText('已选 1 项：3'); await expect(demo.getByRole('checkbox', { name: '选择成员 3' })).toBeChecked();
  await demo.locator('thead').getByRole('checkbox').check(); await expect(demo.locator('span[role="status"]').last()).toHaveText('已选 3 项：1, 3, 4');
});
test('independent keys preserve cross-page selection and radio replaces keys', async ({ page }) => {
  const demo = region(page, '独立跨页选择与单选'); await demo.getByRole('checkbox', { name: '跨页选择 1', exact: true }).check(); await demo.getByRole('button', { name: '第 2 页', exact: true }).click();
  await demo.getByRole('checkbox', { name: '跨页选择 4' }).check(); await expect(demo.locator('span[role="status"]').last()).toHaveText('跨页 keys：1, 4');
  await demo.getByRole('checkbox', { name: '单选模式' }).check(); await demo.getByRole('radio', { name: '跨页选择 4' }).check(); await demo.getByRole('radio', { name: '跨页选择 5' }).check(); await expect(demo.locator('span[role="status"]').last()).toHaveText('跨页 keys：5');
});
test('fixed cells and summary align while scrolling', async ({ page }) => {
  const demo = region(page, '固定列、表头与本页汇总'); await expect(demo.locator('tfoot')).toContainText('780');
  const metrics = await demo.locator('table').evaluate(table => {
    const scroller = table.parentElement!;
    const first = table.querySelector('tbody tr td')!; const last = table.querySelector('tbody tr td:last-child')!;
    const head = table.querySelector('thead th')!; const footer = table.querySelector('tfoot td:last-child')!;
    const before = { left: first.getBoundingClientRect().left, right: last.getBoundingClientRect().right, top: head.getBoundingClientRect().top };
    scroller.scrollLeft = 200; scroller.scrollTop = 100;
    const after = { left: first.getBoundingClientRect().left, right: last.getBoundingClientRect().right, top: head.getBoundingClientRect().top };
    return { overflow: scroller.scrollWidth > scroller.clientWidth, before, after, footerRight: footer.getBoundingClientRect().right, detailWidth: table.querySelector('tbody tr td:nth-child(3)')!.getBoundingClientRect().width };
  }); expect(metrics.overflow).toBe(true); expect(metrics.after.left).toBeCloseTo(metrics.before.left, 0); expect(metrics.after.right).toBeCloseTo(metrics.before.right, 0); expect(metrics.after.top).toBeCloseTo(metrics.before.top, 0); expect(metrics.footerRight).toBeCloseTo(metrics.after.right, 0); expect(metrics.detailWidth).toBeGreaterThanOrEqual(360);
});
test('overflow text tooltip supports hover and short text avoids a focus stop', async ({ page }) => {
  const demo = region(page, '省略与实际溢出 Tooltip'); const long = demo.locator('tbody tr').first().locator('td').first();
  await long.hover(); await expect(page.getByRole('tooltip')).toContainText('这是一段用于查看完整内容'); await page.mouse.move(0, 0); await expect(page.getByRole('tooltip')).toHaveCount(0);
  await long.locator('.pi-table__ellipsis').focus(); await expect(page.getByRole('tooltip')).toContainText('这是一段用于查看完整内容'); await long.locator('.pi-table__ellipsis').blur();
  const short = demo.locator('tbody tr').nth(1).locator('td').first(); await short.hover(); await expect(page.getByRole('tooltip')).toHaveCount(0);
  await demo.locator('tbody tr').first().locator('td').nth(2).hover(); await expect(page.getByRole('tooltip')).toContainText('完整地址：');
  await page.mouse.move(0, 0); await demo.getByRole('checkbox', { name: '加宽文本列' }).check(); await long.hover(); await expect(page.getByRole('tooltip')).toHaveCount(0); await expect(long.locator('.pi-table__ellipsis')).not.toHaveAttribute('tabindex', '0');
});
test('editing updates cells and summary; failure retries; controlled query and empty state work', async ({ page }) => {
  const edit = region(page, '自定义编辑与本地更新'); await edit.getByRole('spinbutton', { name: '修改金额 1' }).fill('99'); await expect(edit.locator('span[role="status"]').last()).toHaveText('第一行金额：99'); await expect(edit.locator('tfoot')).toContainText('149');
  const failed = region(page, '失败处理与手动重试（本地模拟）'); await expect(failed.locator('span[role="status"]').last()).toHaveText('失败，等待重试'); await failed.getByRole('button', { name: '重试', exact: true }).click(); await expect(failed.locator('span[role="status"]').last()).toHaveText('加载完成'); await expect(failed.locator('tbody tr')).toHaveCount(3);
  const controlled = region(page, '受控查询与顶部简洁分页'); await controlled.getByRole('button', { name: '外部跳到第四页' }).click(); await expect(controlled.locator('span[role="status"]').last()).toHaveText('受控页码：4'); await expect(controlled.locator('tbody')).toContainText('成员 10');
  const ref = region(page, '加载与自定义空状态'); await ref.getByRole('checkbox', { name: '模拟加载' }).check(); await expect(ref.getByText('还没有记录')).toHaveCount(0);
});
test('abort cancels waiting work and ignored old response cannot overwrite newest', async ({ page }) => {
  const demo = region(page, '取消请求与过期响应（本地模拟）'); await expect(demo.locator('tbody')).toContainText('初始');
  await demo.getByRole('button', { name: '慢请求', exact: true }).click(); await expect(demo.locator('span[role="status"]').last()).toHaveText('请求中'); await demo.getByRole('button', { name: '快请求', exact: true }).click();
  await expect(demo.locator('tbody')).toContainText('快请求'); await expect(demo.getByLabel('请求日志')).toContainText('取消 慢请求');
  await demo.getByRole('checkbox', { name: '模拟忽略 signal 的接口' }).check(); await expect(demo.locator('span[role="status"]').last()).toHaveText('请求完成');
  await demo.getByRole('button', { name: '慢请求', exact: true }).click(); await expect(demo.locator('span[role="status"]').last()).toHaveText('请求中'); await demo.getByRole('button', { name: '快请求', exact: true }).click(); await expect(demo.locator('tbody')).toContainText('快请求');
  await expect(demo.getByLabel('请求日志')).toContainText('返回 慢请求'); await expect(demo.locator('tbody')).toContainText('快请求');
});
test('desktop and mobile docs stay within viewport', async ({ page }) => {
  await expect(page.locator('.demo-error')).toHaveCount(0); await page.screenshot({ path: '.artifacts/table-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await region(page, '基础展示与隐藏列').locator('tbody tr').first().locator('td').first().evaluate(cell => cell.getBoundingClientRect().width)).toBeGreaterThanOrEqual(160);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390); await page.screenshot({ path: '.artifacts/table-mobile.png', fullPage: true });
});

test('planning identifies independent Table and hooks as done, antd Table uses an independent alternative', async ({ page }) => {
  await page.goto(pathToFileURL(resolve('doc/component-priorities.html')).href + '#status=done');
  await expect(page.locator('#total')).toHaveText('47 / 82'); await expect(page.locator('#done')).toHaveText('47');
  await page.locator('#scope').selectOption('own'); await page.locator('#search').fill('轻量表格'); await expect(page.locator('#total')).toHaveText('1 / 9');
  await expect(page.locator('#rows')).toContainText('Table'); await expect(page.locator('#rows')).toContainText('数据展示');
  await page.locator('#search').fill(''); await expect(page.locator('#total')).toHaveText('9 / 9');
  await page.locator('#scope').selectOption('core'); await page.locator('#status').selectOption('independent'); await page.locator('#search').fill('Table');
  await expect(page.locator('#total')).toHaveText('1 / 73'); await expect(page.locator('#pending')).toHaveText('0'); await expect(page.locator('#independent')).toHaveText('1'); await expect(page.locator('#done')).toHaveText('0');
});
