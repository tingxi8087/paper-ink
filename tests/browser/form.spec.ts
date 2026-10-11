import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
test.beforeEach(async ({ page }) => { await page.goto('/#/form'); await expect(page.getByRole('heading', { name: 'Form 表单', exact: true })).toBeVisible(); });
test('all twelve examples render without runtime errors, submit/reset/focus work', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await expect(page.locator('.demo')).toHaveCount(12); await expect(page.locator('.demo-error')).toHaveCount(0);
  const demo = page.getByRole('region', { name: '基础表单与提交', exact: true });
  await demo.getByRole('button', { name: '保存', exact: true }).click(); await expect(demo.getByRole('alert')).toHaveText('请输入姓名'); await expect(demo.getByRole('textbox', { name: '姓名', exact: true })).toBeFocused();
  await demo.getByRole('textbox', { name: '姓名', exact: true }).fill('纸墨'); await demo.getByRole('textbox', { name: '简介' }).fill('简介'); await demo.getByRole('button', { name: '保存', exact: true }).click();
  await expect(demo.getByLabel('保存结果')).toContainText('纸墨'); await demo.getByRole('button', { name: '重置', exact: true }).click(); await expect(demo.getByRole('textbox', { name: '姓名', exact: true })).toHaveValue(''); expect(errors).toEqual([]);
});
test('conditional preserve excludes inactive field and restores edited value', async ({ page }) => {
  const demo = page.getByRole('region', { name: '动态字段与暂存恢复', exact: true });
  await demo.getByRole('radio', { name: '企业' }).check(); await demo.getByRole('textbox', { name: '公司名称' }).fill('Paper Ink');
  await demo.getByRole('radio', { name: '个人' }).check(); await demo.getByRole('button', { name: '提交账号' }).click(); await expect(demo.getByLabel('账号数据')).toHaveText('{"type":"person"}');
  await demo.getByRole('radio', { name: '企业' }).check(); await expect(demo.getByRole('textbox', { name: '公司名称' })).toHaveValue('Paper Ink');
});
test('dependency revalidation and async stale-result protection', async ({ page }) => {
  const passwords = page.getByRole('region', { name: '密码确认与校验依赖', exact: true });
  await passwords.locator('input[type=password]').nth(0).fill('abcdef'); await passwords.locator('input[type=password]').nth(1).fill('abcdef'); await passwords.getByRole('button', { name: '设置密码' }).click(); await expect(passwords.getByRole('status')).toHaveText('密码已设置');
  await passwords.locator('input[type=password]').nth(0).fill('abcdefg'); await expect(passwords.getByRole('alert')).toHaveText('两次密码不一致');
  const asyncDemo = page.getByRole('region', { name: '异步校验与过期保护', exact: true }); const name = asyncDemo.getByRole('textbox', { name: '用户名' });
  await name.fill('admin'); await name.fill('alice'); await expect(asyncDemo.getByText('检查中…')).toBeVisible(); await expect(asyncDemo.getByText('检查中…')).toHaveCount(0); await expect(asyncDemo.getByRole('alert')).toHaveCount(0);
  await asyncDemo.getByRole('button', { name: '注册' }).click(); await name.fill('bob'); await expect(asyncDemo.getByRole('status')).toHaveCount(0); await expect(asyncDemo.getByRole('button', { name: '注册' })).toBeEnabled();
  await asyncDemo.getByRole('button', { name: '注册' }).click(); await expect(asyncDemo.getByRole('status')).toHaveText('注册成功：bob');
});
test('patch notifies atomically with changed-only old values, reset is silent', async ({ page }) => {
  const demo = page.getByRole('region', { name: '批量更新与变化旧值', exact: true }); await demo.getByRole('button', { name: '一次修改两项' }).click();
  const data = JSON.parse(await demo.getByLabel('变化记录').innerText()); expect(data.names).toEqual(['province', 'city']); expect(data.previousValues).toEqual({ province: '江苏', city: '南京' }); expect(data.values).toEqual({ province: '浙江', city: '杭州' });
  await demo.getByRole('button', { name: '恢复初始值' }).click(); await expect(demo.getByRole('textbox', { name: '城市' })).toHaveValue('南京'); expect(JSON.parse(await demo.getByLabel('变化记录').innerText())).toEqual(data);
});
test('custom address and array controls support errors, additions, stable reorder and deletion', async ({ page }) => {
  const address = page.getByRole('region', { name: '自定义地址对象', exact: true }); await address.getByRole('button', { name: '保存地址' }).click(); await expect(address.getByRole('alert')).toHaveText('请填写完整地址');
  await address.getByPlaceholder('省份').fill('浙江'); await address.getByPlaceholder('城市').fill('杭州'); await address.getByRole('button', { name: '保存地址' }).click(); await expect(address.getByLabel('地址数据')).toHaveText('{"address":{"province":"浙江","city":"杭州"}}');
  const contacts = page.getByRole('region', { name: '自定义联系人数组', exact: true }); await contacts.getByRole('button', { name: '保存联系人' }).click(); await expect(contacts.getByRole('alert')).toHaveText('至少添加一个联系人');
  await contacts.getByRole('button', { name: '添加联系人' }).click(); await contacts.getByPlaceholder('姓名').nth(0).fill('Alice'); await contacts.getByRole('button', { name: '添加联系人' }).click(); await contacts.getByPlaceholder('姓名').nth(1).fill('Bob');
  await contacts.getByRole('button', { name: '上移', exact: true }).nth(1).click(); await expect(contacts.getByPlaceholder('姓名').nth(0)).toHaveValue('Bob'); await contacts.getByRole('button', { name: '删除', exact: true }).nth(1).click();
  await contacts.getByRole('button', { name: '保存联系人' }).click(); const data = JSON.parse(await contacts.getByLabel('联系人数据').innerText()); expect(data.contacts).toEqual([{ id: 'contact-2', name: 'Bob' }]);
});
test('custom declaration, disabled state, submit errors and live editor work', async ({ page }) => {
  const custom = page.getByRole('region', { name: '自定义绑定协议与禁用', exact: true }); await custom.getByRole('button', { name: '订阅', exact: true }).click(); await expect(custom.getByRole('button', { name: '订阅', exact: true })).toHaveText('已订阅'); await custom.getByRole('checkbox', { name: '禁用表单' }).check(); await expect(custom.getByRole('button', { name: '订阅', exact: true })).toBeDisabled();
  const failed = page.getByRole('region', { name: '提交失败保留输入', exact: true }); await failed.getByRole('textbox', { name: '名称' }).fill('保留'); await failed.getByRole('button', { name: '模拟保存' }).click(); await expect(failed.getByRole('alert')).toContainText('保存失败'); await expect(failed.getByRole('textbox', { name: '名称' })).toHaveValue('保留');
  const basic = page.getByRole('region', { name: '基础表单与提交', exact: true }); await basic.getByRole('button', { name: '编辑代码', exact: true }).click(); await expect(basic.getByRole('textbox', { name: '基础表单与提交在线代码编辑器' })).toContainText('useForm');
});
test('compact desktop and mobile layouts do not overflow', async ({ page }) => {
  await page.screenshot({ path: '.artifacts/form-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 }); await expect(page.locator('.demo')).toHaveCount(12);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.screenshot({ path: '.artifacts/form-mobile.png', fullPage: true });
});

test('planning filters count independent Form separately from pending antd Form', async ({ page }) => {
  await page.goto(pathToFileURL(resolve('doc/component-priorities.html')).href + '#status=done');
  await expect(page.locator('#total')).toHaveText('44 / 81'); await expect(page.locator('#done')).toHaveText('44');
  await page.locator('#scope').selectOption('own'); await expect(page.locator('#total')).toHaveText('8 / 8');
  await page.locator('#search').fill('Form'); await expect(page.locator('#total')).toHaveText('1 / 8');
  await expect(page.locator('#rows')).toContainText('轻量表单'); await expect(page.locator('#rows')).toContainText('数据录入');
  await page.locator('#scope').selectOption('core'); await page.locator('#status').selectOption('pending');
  await expect(page.locator('#total')).toHaveText('1 / 73'); await expect(page.locator('#pending')).toHaveText('1'); await expect(page.locator('#done')).toHaveText('0');
});
