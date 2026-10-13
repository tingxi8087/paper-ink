import { test, expect, type Page } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://fonts.googleapis.com/**', route => route.abort());
});

async function setColor(page: Page, label: string, value: string) {
  await page.getByRole('button', { name: label, exact: true }).click();
  const panel = page.getByRole('dialog', { name: '选择颜色', exact: true });
  await panel.getByRole('textbox', { name: '颜色值' }).fill(value);
  await panel.getByRole('textbox', { name: '颜色值' }).press('Enter');
  await page.keyboard.press('Escape');
}

const preview = (page: Page) => page.getByRole('region', { name: '主题预览', exact: true });
const saveButton = (page: Page) => preview(page).getByRole('button', { name: '保存修改', exact: true });
const cssVariable = (page: Page, name: string) => saveButton(page).evaluate((element, name) => getComputedStyle(element).getPropertyValue(name).trim(), name);
async function expand(page: Page, name: string) { const summary = page.locator('summary').filter({ hasText: new RegExp(`^${name}$`) }); if (await summary.evaluate(el => !el.parentElement!.hasAttribute('open'))) await summary.click(); }

test('ColorPicker changes only its token; generated palette is explicit, valid and reflected in real buttons', async ({ page }) => {
  await page.goto('/#/theme');
  const hover = await cssVariable(page, '--pi-color-primary-solid-hover');
  await setColor(page, '主色选色器', '#aabbcc');
  await expect(saveButton(page)).toHaveCSS('background-color', 'rgb(170, 187, 204)');
  expect(await cssVariable(page, '--pi-color-primary-solid-hover')).toBe(hover);
  await expand(page, '主色配套颜色');
  await page.getByRole('button', { name: '生成主色配套颜色', exact: true }).click();
  expect(await cssVariable(page, '--pi-color-primary-solid-hover')).not.toBe(hover);
  await expect(saveButton(page)).toHaveCSS('color', 'rgb(0, 0, 0)');
  await saveButton(page).hover();
  await expect(saveButton(page)).not.toHaveCSS('background-color', 'rgb(170, 187, 204)');
  await page.mouse.move(1, 1);
  await page.getByRole('textbox', { name: '主色', exact: true }).fill('#bad-color');
  await expect(page.getByRole('textbox', { name: '主色', exact: true })).toHaveAttribute('aria-invalid', 'true');
  await expect(saveButton(page)).toHaveCSS('background-color', 'rgb(170, 187, 204)');
  await page.getByRole('button', { name: '恢复默认', exact: true }).click();
  await expect(page.getByRole('textbox', { name: '主色', exact: true })).toHaveValue('#171717');
});

test('global sizes and semantic, text and surface tokens affect previews without changing documentation', async ({ page }) => {
  await page.goto('/#/theme');
  await page.getByRole('slider', { name: '字号', exact: true }).fill('18');
  await page.getByRole('slider', { name: '控件高度', exact: true }).fill('44');
  await page.getByRole('slider', { name: '全局圆角', exact: true }).fill('15');
  await expect(saveButton(page)).toHaveCSS('font-size', '18px');
  await expect(saveButton(page)).toHaveCSS('height', '44px');
  await expect(saveButton(page)).toHaveCSS('border-radius', '15px');
  await expand(page, '语义色');
  await page.getByRole('textbox', { name: '错误', exact: true }).fill('#aa1122');
  expect(await cssVariable(page, '--pi-color-error-solid')).toBe('#aa1122');
  await expect(preview(page).locator('.pi-progress--exception .pi-progress__fill')).toHaveCSS('background-color', 'rgb(170, 17, 34)');
  await expand(page, '文字、背景与边框');
  await page.getByRole('textbox', { name: '主要文字', exact: true }).fill('#223344');
  await page.getByRole('textbox', { name: '容器背景', exact: true }).fill('#f4f5f6');
  const input = preview(page).getByRole('textbox', { name: '预览输入框', exact: true });
  await expect(input).toHaveCSS('color', 'rgb(34, 51, 68)');
  await expect(preview(page).locator('.pi-input').first()).toHaveCSS('background-color', 'rgb(244, 245, 246)');
  await expect(page.locator('html')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(page.getByRole('region', { name: '主题设置' })).not.toHaveCSS('font-size', '18px');
  await page.getByRole('textbox', { name: '主要文字', exact: true }).fill('#dddddd');
  await expect(page.locator('.lab-warning').first()).toContainText('4.5:1');
});

test('component overrides can be enabled, customized and disabled to follow global variables again', async ({ page }) => {
  await page.goto('/#/theme');
  await page.getByRole('slider', { name: '全局圆角', exact: true }).fill('17');
  await page.getByRole('slider', { name: 'Button圆角', exact: true }).fill('9');
  await expect(saveButton(page)).toHaveCSS('border-radius', '9px');
  await page.getByRole('checkbox', { name: '启用Input覆盖', exact: true }).check();
  await page.getByRole('slider', { name: 'Input圆角', exact: true }).fill('3');
  await expect(preview(page).locator('.pi-input').first()).toHaveCSS('border-radius', '3px');
  await page.getByRole('checkbox', { name: '启用Modal覆盖', exact: true }).check();
  await page.getByRole('slider', { name: 'Modal圆角', exact: true }).fill('21');
  await page.getByRole('slider', { name: 'Modal内边距', exact: true }).fill('30');
  await preview(page).getByRole('button', { name: '打开主题弹窗', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: '主题弹窗预览', exact: true });
  await expect(dialog).toHaveCSS('border-radius', '21px');
  await expect(dialog).toHaveCSS('padding', '30px');
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await page.getByRole('checkbox', { name: '启用Button覆盖', exact: true }).uncheck();
  await page.getByRole('checkbox', { name: '启用Input覆盖', exact: true }).uncheck();
  await expect(saveButton(page)).toHaveCSS('border-radius', '17px');
  await expect(preview(page).locator('.pi-input').first()).toHaveCSS('border-radius', '17px');
});

test('inputs, date calendar, form, dropdown, tooltip and body-portalled modal use real themed components', async ({ page }) => {
  await page.goto('/#/theme');
  await page.getByRole('button', { name: '信息蓝', exact: true }).click();
  await expand(page, '文字、背景与边框');
  await page.getByRole('textbox', { name: '浮层背景', exact: true }).fill('#eaf1ff');
  await preview(page).getByRole('textbox', { name: '预览输入框', exact: true }).fill('实际输入');
  await preview(page).getByRole('checkbox', { name: '勾选', exact: true }).uncheck();
  await preview(page).getByRole('switch', { name: '预览开关', exact: true }).click();
  await expect(preview(page).getByRole('switch', { name: '预览开关', exact: true })).toHaveAttribute('aria-checked', 'false');
  await preview(page).getByRole('combobox', { name: '预览选择器', exact: true }).click();
  await page.getByRole('option', { name: '白纸', exact: true }).click();
  await expect(preview(page).getByRole('combobox', { name: '预览选择器', exact: true }).locator('..')).toContainText('白纸');
  await preview(page).getByRole('combobox', { name: '预览日期', exact: true }).click();
  await expect(page.locator('.pi-picker-calendar__panel')).toBeVisible();
  await page.keyboard.press('Escape');
  await preview(page).getByLabel('工作室名称').fill('自测工作室');
  await preview(page).getByRole('button', { name: '保存设置', exact: true }).click();
  await expect(preview(page).getByRole('status')).toHaveText('设置已保存');
  await preview(page).getByRole('button', { name: '更多操作', exact: true }).click();
  await expect(page.locator('.pi-dropdown.pi-popover')).toHaveCSS('background-color', 'rgb(234, 241, 255)');
  await page.getByRole('menuitem', { name: '归档设置', exact: true }).click();
  await expect(preview(page).getByRole('status')).toHaveText('已归档设置');
  await preview(page).getByRole('button', { name: '查看提示', exact: true }).hover();
  const tooltip = page.getByRole('tooltip');
  await expect(tooltip).toContainText('浮层也继承');
  expect(await tooltip.evaluate(el => getComputedStyle(el).getPropertyValue('--pi-color-primary-solid').trim())).toBe('#1677ff');
  await page.mouse.move(1, 1);
  await preview(page).getByRole('button', { name: '打开主题弹窗', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: '主题弹窗预览', exact: true });
  await expect(dialog).toHaveCSS('opacity', '1');
  await expect(dialog).toHaveCSS('background-color', 'rgb(234, 241, 255)');
  expect(await dialog.evaluate(el => el.closest('.lab-preview') === null)).toBe(true);
  await expect(dialog.getByRole('button', { name: '确定', exact: true })).toHaveCSS('background-color', 'rgb(22, 119, 255)');
  await dialog.getByRole('textbox').fill('浮层真实输入');
  await page.screenshot({ path: '.artifacts/theme-lab-modal-desktop-20261013.png' });
});

test('JSON copy and download match exported config, persist on reload, and reset saved values', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/#/theme');
  await page.getByRole('button', { name: '草木绿', exact: true }).click();
  await page.getByRole('slider', { name: '全局圆角', exact: true }).fill('19');
  await expand(page, '查看 JSON 配置');
  const config = JSON.parse((await page.locator('.lab-json pre').textContent())!);
  await page.getByRole('button', { name: '复制配置', exact: true }).click();
  await expect(page.locator('.lab-message')).toHaveText('已复制');
  expect(JSON.parse(await page.evaluate(() => navigator.clipboard.readText()))).toEqual(config);
  const event = page.waitForEvent('download');
  await page.getByRole('button', { name: '下载 JSON', exact: true }).click();
  const download = await event;
  expect(download.suggestedFilename()).toBe('paper-ink-theme.json');
  const stream = await download.createReadStream();
  const chunks: Buffer[] = []; for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  expect(JSON.parse(Buffer.concat(chunks).toString('utf8'))).toEqual(config);
  await page.reload();
  await expect(saveButton(page)).toHaveCSS('background-color', 'rgb(82, 196, 26)');
  await expect(saveButton(page)).toHaveCSS('border-radius', '19px');
  await page.getByRole('button', { name: '恢复默认', exact: true }).click();
  await page.reload();
  await expect(saveButton(page)).toHaveCSS('background-color', 'rgb(23, 23, 23)');
  await expect(saveButton(page)).toHaveCSS('border-radius', '6px');
});

test('malformed storage and unavailable local persistence recover without preventing theme edits', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('paper-ink.theme-lab.v1', '{invalid JSON'));
  await page.goto('/#/theme');
  await expect(saveButton(page)).toHaveCSS('background-color', 'rgb(23, 23, 23)');
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new DOMException('Quota exceeded', 'QuotaExceededError'); }; });
  await page.getByRole('button', { name: '信息蓝', exact: true }).click();
  await expect(saveButton(page)).toHaveCSS('background-color', 'rgb(22, 119, 255)');
  await expect(page.locator('.lab-message')).toContainText('本地保存不可用');
});

test('desktop and mobile theme laboratory stay readable without overflow, including ColorPicker', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/#/theme');
    await page.reload();
    await expect(page.getByRole('heading', { name: '主题实验室', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await page.screenshot({ path: `.artifacts/theme-lab-${width}-20261013.png`, fullPage: false });
    await page.getByRole('button', { name: '主色选色器', exact: true }).click();
    const panel = page.getByRole('dialog', { name: '选择颜色', exact: true });
    await expect(panel).toHaveCSS('opacity', '1');
    const box = (await panel.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width);
    await page.screenshot({ path: `.artifacts/theme-lab-color-${width}-20261013.png` });
    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
    await expect(page.locator('.pi-color-picker__popup')).toBeHidden();
    await expand(page, '语义色');
    await expand(page, '文字、背景与边框');
    await expand(page, '主色配套颜色');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await preview(page).getByRole('heading', { name: '输入与选择', exact: true }).scrollIntoViewIfNeeded();
    await page.screenshot({ path: `.artifacts/theme-lab-preview-${width}-20261013.png` });
  }
  expect(errors).toEqual([]);
});
