import { test, expect } from '@playwright/test';
test('DatePicker portal selects a date, restores focus and honors controlled updates and clear', async ({ page }) => {
 await page.goto('/#/date-picker');
 const demo=page.getByRole('region',{name:'受控值与清空',exact:true}), input=demo.getByRole('combobox');
 await input.click();const popup=page.getByRole('dialog',{name:'日期选择',exact:true});await expect(popup).toBeVisible();
 await expect(demo.getByRole('dialog')).toHaveCount(0);
 await popup.getByRole('button',{name:'2026-10-15',exact:true}).click();await expect(input).toHaveValue('2026-10-15');await expect(demo.getByRole('status')).toContainText('变化 1 次');
 await demo.getByRole('button',{name:'外部设置年底'}).click();await expect(input).toHaveValue('2026-12-31');
 await demo.getByRole('button',{name:'清空',exact:true}).click();await expect(input).toHaveValue('');await expect(demo.getByRole('status')).toContainText('变化 2 次');
});
test('DatePicker strict input rejects impossible dates, accepts leap days and Escape restores value', async ({ page }) => {
 await page.goto('/#/date-picker');const demo=page.getByRole('region',{name:'严格输入与 Escape 还原',exact:true}), input=demo.getByRole('combobox');
 await input.fill('2025-02-29');await input.press('Enter');await expect(input).toHaveAttribute('aria-invalid','true');await expect(demo.getByRole('status')).toContainText('2024-02-29');
 await input.press('Escape');await expect(input).toHaveValue('2024-02-29');
 await input.fill('2028-02-29');await input.press('Enter');await expect(input).toHaveValue('2028-02-29');await expect(demo.getByRole('status')).toContainText('2028-02-29');
});
test('RangePicker uses intermediate drafts, orders endpoints and supports open ended confirmation', async ({ page }) => {
 await page.goto('/#/date-picker');const demo=page.getByRole('region',{name:'日期范围与选择过程',exact:true}), inputs=demo.getByRole('combobox');
 await inputs.first().fill('2026-10-20');await inputs.first().press('Enter');await expect(demo.getByRole('status')).toContainText('已提交：空');
 await inputs.last().fill('2026-10-12');await inputs.last().press('Enter');await expect(demo.getByRole('status')).toContainText('2026-10-12 → 2026-10-20');
 const open=page.getByRole('region',{name:'允许单端为空与禁用端点',exact:true});const start=open.getByRole('combobox').first();await start.fill('2026-10-15');await start.press('Enter');await page.getByRole('dialog',{name:'日期范围选择'}).getByRole('button',{name:'确定',exact:true}).click();await expect(open.getByRole('status')).toContainText('2026-10-15 →');
 await expect(open.getByRole('combobox').nth(2)).toBeDisabled();
});
test('Date-time confirmation cancels drafts on Escape and submits minute precision', async ({ page }) => {
 await page.goto('/#/date-picker');const demo=page.getByRole('region',{name:'日期时间草稿与确认',exact:true}),input=demo.getByRole('combobox');
 await input.click();const popup=page.getByRole('dialog',{name:'日期选择',exact:true});await popup.getByRole('button',{name:'2026-10-15',exact:true}).click();await expect(demo.getByRole('status')).toContainText('尚未提交');await page.keyboard.press('Escape');await expect(input).toHaveValue('2026-10-12 09:00');
 await input.fill('2026-10-15 10:30');await input.press('Enter');await page.getByRole('dialog',{name:'日期选择',exact:true}).getByRole('button',{name:'确定',exact:true}).click();await expect(demo.getByRole('status')).toContainText('2026-10-15 10:30');
});
test('DatePicker integrates Dayjs form values, required errors, reset and submitted conversion', async ({ page }) => {
 await page.goto('/#/date-picker');const demo=page.getByRole('region',{name:'表单绑定、提交转换与重置',exact:true});await demo.getByRole('button',{name:'读取表单'}).click();await expect(demo.getByLabel('日期表单结果')).toContainText('2026-10-12');
 await demo.getByRole('button',{name:'清空',exact:true}).first().click();await demo.getByRole('button',{name:'读取表单'}).click();await expect(demo.getByText('请选择生日',{exact:true})).toBeVisible();
 await demo.getByRole('button',{name:'重置日期表单'}).click();await expect(demo.getByRole('combobox').first()).toHaveValue('2026-10-12');await expect(demo.getByRole('status')).toHaveText('未修改');
});
test('TimePicker commits columns only on confirmation and enforces input step and disabled combinations', async ({ page }) => {
 await page.goto('/#/time-picker');const demo=page.getByRole('region',{name:'时间选择与确认',exact:true});await demo.getByRole('combobox').click();const popup=page.getByRole('dialog',{name:'时间选择'});await popup.getByRole('listbox',{name:'时',exact:true}).getByRole('option',{name:'10',exact:true}).click();await expect(demo.getByRole('status')).toContainText('尚未提交');await popup.getByRole('button',{name:'确定',exact:true}).click();await expect(demo.getByRole('status')).toContainText('10:30:00');
 const strict=page.getByRole('region',{name:'严格时间输入',exact:true}),input=strict.getByRole('combobox');await input.fill('09:17');await input.press('Enter');await expect(input).toHaveAttribute('aria-invalid','true');await expect(strict.getByRole('status')).toContainText('尚未提交');await input.fill('09:15');await input.press('Enter');await expect(strict.getByRole('status')).toContainText('09:15');
 const disabled=page.getByRole('region',{name:'禁用时间组合',exact:true});await disabled.getByRole('combobox').click();await expect(page.getByRole('dialog',{name:'时间选择'}).getByRole('listbox',{name:'时',exact:true}).getByRole('option',{name:'07',exact:true})).toBeDisabled();
});
test('All editable date-time demos render and API tables/import cards fit desktop and mobile', async ({ page }) => {
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 for(const width of [1440,390]) {await page.setViewportSize({width,height:900});for(const route of ['date-picker','time-picker']) {await page.goto('/#/'+route);await expect(page.locator('.demo')).toHaveCount(route==='date-picker'?14:6);await expect(page.locator('.demo-error')).toHaveCount(0);await expect(page.locator('.doc-import-card')).toHaveCount(2);await expect(page.getByRole('table')).toHaveCount(route==='date-picker'?2:1);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}}
 await page.goto('/#/date-picker');const demo=page.getByRole('region',{name:'窄容器与只读输入',exact:true});await demo.getByRole('combobox').first().click();const popup=page.getByRole('dialog',{name:'日期范围选择'});await expect(popup).toBeVisible();const rect=await popup.boundingBox();expect(rect!.x).toBeGreaterThanOrEqual(0);expect(rect!.x+rect!.width).toBeLessThanOrEqual(391);await expect(popup).toHaveCSS('opacity','1');await page.screenshot({path:'.artifacts/date-picker-mobile.png'});expect(errors).toEqual([]);
});
test('Date limits constrain navigation, disabled days and keyboard calendar selection',async({page})=>{
 await page.goto('/#/date-picker');const limited=page.getByRole('region',{name:'范围限制与周末禁用',exact:true});await limited.getByRole('combobox').click();const popup=page.getByRole('dialog',{name:'日期选择'});
 await expect(popup.getByRole('button',{name:'上个月'})).toBeDisabled();await expect(popup.getByRole('button',{name:'下个月'})).toBeDisabled();await expect(popup.getByRole('button',{name:'2026-10-10',exact:true})).toHaveAttribute('aria-disabled','true');await popup.getByRole('button',{name:'2026-10-10',exact:true}).click({force:true});await expect(limited.getByRole('combobox')).toHaveValue('');
 const day=popup.getByRole('button',{name:'2026-10-12',exact:true});await day.focus();await day.press('ArrowRight');await expect(popup.getByRole('button',{name:'2026-10-13',exact:true})).toBeFocused();await page.keyboard.press('Enter');await expect(limited.getByRole('combobox')).toHaveValue('2026-10-13');
});
test('Month/year selection normalizes format and English portal inherits local theme',async({page})=>{
 await page.goto('/#/date-picker');const demo=page.getByRole('region',{name:'月份与年份',exact:true});await demo.getByRole('combobox').first().click();await page.getByRole('dialog').getByRole('button',{name:'2026-12',exact:true}).click();await expect(demo.getByRole('combobox').first()).toHaveValue('2026-12');await demo.getByRole('combobox').last().click();await page.getByRole('dialog').getByRole('button',{name:'2028',exact:true}).click();await expect(demo.getByRole('combobox').last()).toHaveValue('2028');
 const english=page.getByRole('region',{name:'英文与局部主题',exact:true});await english.getByRole('combobox').first().click();const popup=page.getByRole('dialog');await expect(popup.getByRole('button',{name:'Today',exact:true})).toBeVisible();await expect(popup.getByRole('columnheader').first()).toHaveText('Su');await expect(popup).toHaveCSS('background-color','rgb(36, 36, 35)');await expect(popup).toHaveCSS('opacity','1');await page.screenshot({path:'.artifacts/date-picker-desktop.png'});
});
test('Range preset resolves complete values and disabled time input cannot commit',async({page})=>{
 await page.goto('/#/date-picker');const range=page.getByRole('region',{name:'日期范围与选择过程',exact:true});await range.getByRole('combobox').first().click();await page.getByRole('dialog').getByRole('button',{name:'固定示例',exact:true}).click();await expect(range.getByRole('status')).toContainText('2026-10-01 → 2026-10-12');
 await page.goto('/#/time-picker');const demo=page.getByRole('region',{name:'禁用时间组合',exact:true}),input=demo.getByRole('combobox');await input.fill('07:00');await input.press('Enter');await expect(input).toHaveAttribute('aria-invalid','true');await expect(page.getByRole('dialog').getByRole('button',{name:'确定',exact:true})).toBeDisabled();await input.press('Escape');await expect(input).toHaveValue('');
});

test('picker selection during entry fades from current opacity without flashing brighter', async ({ page }) => {
 await page.goto('/#/date-picker');
 const input=page.getByRole('combobox',{name:'基础日期',exact:true});
 await input.click();
 const trace=await page.evaluate(async () => {
  const popup=document.querySelector<HTMLElement>('.pi-picker__popup')!;
  // Keep the transition slow so this exercises an interrupted entrance on any machine.
  popup.style.animationDuration='1000ms'; popup.style.transitionDuration='1000ms';
  while(Number(getComputedStyle(popup).opacity)<.15) await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));
  const before=Number(getComputedStyle(popup).opacity);
  popup.querySelector<HTMLButtonElement>('button[data-date="2026-10-15"]')!.click();
  const after:number[]=[];
  for(let frame=0;frame<3;frame++){await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));after.push(Number(getComputedStyle(popup).opacity));}
  return {before,after};
 });
 expect(trace.before).toBeLessThan(.9);
 expect(Math.max(...trace.after)).toBeLessThanOrEqual(trace.before+.03);
 await expect(input).toHaveValue('2026-10-15');
 await expect(page.locator('.pi-picker__popup')).toHaveCount(0);
});

test('picker exit reaches transparent before its portal is removed', async ({ page }) => {
 await page.goto('/#/date-picker');
 await page.getByRole('combobox',{name:'基础日期',exact:true}).click();
 await expect(page.locator('.pi-picker__popup')).toHaveCSS('opacity','1');
 const samples=await page.evaluate(async () => {
  const popup=document.querySelector<HTMLElement>('.pi-picker__popup')!;
  popup.querySelector<HTMLButtonElement>('button[data-date="2026-10-15"]')!.click();
  const opacities:number[]=[];
  while(popup.isConnected){opacities.push(Number(getComputedStyle(popup).opacity));await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));}
  return opacities;
 });
 expect(samples.length).toBeGreaterThan(2);
 expect(samples.at(-1)).toBeLessThanOrEqual(.02);
 for(let index=1;index<samples.length;index++) expect(samples[index]).toBeLessThanOrEqual(samples[index-1]+.02);
});
