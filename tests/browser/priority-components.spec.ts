import { test, expect } from '@playwright/test';

test('Checkbox, Radio and Switch support real keyboard and form interactions', async ({ page }) => {
 await page.goto('/#/checkbox', { waitUntil: 'domcontentloaded' });
 const choices = page.getByRole('region', { name: '多选与半选', exact: true });
 await expect(choices.getByRole('checkbox', { name: '全选' })).toHaveAttribute('aria-checked', 'mixed');
 await choices.getByRole('checkbox', { name: '全选' }).check();
 await expect(choices).toContainText('已选：React、TypeScript、CSS');
 const form = page.getByRole('region', { name: '原生表单与禁用', exact: true });
 await form.getByRole('checkbox', { name: '同意协议' }).uncheck();
 await form.getByRole('button', { name: '重置', exact: true }).click();
 await expect(form.getByRole('checkbox', { name: '同意协议' })).toBeChecked();
 await page.goto('/#/radio', { waitUntil: 'domcontentloaded' });
 const radio = page.getByRole('region', { name: '单选与键盘', exact: true });
 await radio.getByRole('radio', { name: '个人', exact: true }).focus();
 await page.keyboard.press('ArrowRight');
 await expect(radio.getByRole('radio', { name: '团队', exact: true })).toBeChecked();
 await page.keyboard.press('ArrowRight');
 await expect(radio.getByRole('radio', { name: '个人', exact: true })).toBeChecked();
 await page.goto('/#/switch', { waitUntil: 'domcontentloaded' });
 const toggle = page.getByRole('switch', { name: '通知', exact: true });
 await toggle.focus(); await page.keyboard.press('Space'); await expect(toggle).toHaveAttribute('aria-checked', 'false');
 await page.keyboard.press('Enter'); await expect(toggle).toHaveAttribute('aria-checked', 'true');
 await expect(page.getByRole('switch', { name: '加载中', exact: true })).toBeDisabled();
});

test('Tabs preserve or destroy content and activate by keyboard', async ({ page }) => {
 await page.goto('/#/tabs', { waitUntil: 'domcontentloaded' });
 const tabs = page.getByRole('region', { name: '基础标签页', exact: true });
 await tabs.getByRole('tab', { name: '概览', exact: true }).focus();
 await page.keyboard.press('ArrowRight');
 await expect(tabs.getByRole('tab', { name: '设置', exact: true })).toBeFocused();
 await expect(tabs.getByRole('tab', { name: '概览', exact: true })).toHaveAttribute('aria-selected','true');
 await page.keyboard.press('Enter');
 await tabs.getByRole('textbox').fill('Retained');
 await tabs.getByRole('tab', { name: '概览', exact: true }).click();
 await tabs.getByRole('tab', { name: '设置', exact: true }).click();
 await expect(tabs.getByRole('textbox')).toHaveValue('Retained');
 const destroy = page.getByRole('region', { name: '销毁隐藏面板', exact: true });
 await destroy.getByRole('textbox').fill('Discarded');
 await destroy.getByRole('tab', { name: '预览', exact: true }).click();
 await destroy.getByRole('tab', { name: '编辑', exact: true }).click();
 await expect(destroy.getByRole('textbox')).toHaveValue('');
});

test('Select portal handles click, keyboard, search, tags and small viewports', async ({ page }) => {
 await page.goto('/#/select', { waitUntil: 'domcontentloaded' });
 const demo=page.getByRole('region',{name:'单选与搜索',exact:true});
 const combo=demo.getByRole('combobox',{name:'框架',exact:true});
 await combo.click();await page.keyboard.press('ArrowDown');await page.keyboard.press('Enter');
 await expect(demo.locator('.pi-select__value')).toHaveText('Vue');await expect(combo).toHaveAttribute('aria-expanded','false');
 await combo.fill('sv');await page.getByRole('option',{name:'Svelte',exact:true}).click();
 await expect(demo.locator('.pi-select__value')).toHaveText('Svelte');await expect(combo).toHaveAttribute('aria-expanded','false');
 await demo.getByRole('button',{name:'清空选择',exact:true}).click();await expect(demo.locator('.pi-select__value')).toHaveCount(0);
 const multi=page.getByRole('region',{name:'多选',exact:true});
 await multi.getByRole('combobox').click();await page.getByRole('option',{name:'前端',exact:true}).click();
 await expect(multi.getByRole('button',{name:'移除 前端',exact:true})).toBeVisible();
 await multi.getByRole('button',{name:'移除 前端',exact:true}).click();await expect(multi.getByRole('button',{name:'移除 前端',exact:true})).toHaveCount(0);
 const tags=page.getByRole('region',{name:'自定义标签',exact:true});
 await tags.getByRole('combobox').fill('new-tag');await page.keyboard.press('Enter');
 await expect(tags.getByRole('button',{name:'移除 new-tag',exact:true})).toBeVisible();
 await page.keyboard.press('Escape');await page.setViewportSize({width:390,height:844});
 await combo.click();await expect(page.getByRole('listbox')).toBeVisible();
 const box=await page.locator('.pi-select__popup[data-motion=enter]').boundingBox();expect(box!.x).toBeGreaterThanOrEqual(0);expect(box!.x+box!.width).toBeLessThanOrEqual(390);
 await page.screenshot({path:'.artifacts/select-mobile.png'});
});

test('Tooltip stays open over its content, closes on Escape and Message updates one keyed notice', async ({ page }) => {
 await page.goto('/#/tooltip', { waitUntil: 'domcontentloaded' });
 await page.getByRole('button',{name:'悬停或聚焦',exact:true}).hover();
 const tip=page.getByRole('tooltip',{name:'保存当前修改',exact:true});await expect(tip).toBeVisible();
 await tip.hover();await expect(tip).toBeVisible();await page.keyboard.press('Escape');await expect(tip).toBeHidden();
 await page.goto('/#/message', { waitUntil: 'domcontentloaded' });
 await page.getByRole('button',{name:'模拟保存',exact:true}).click();
 await expect(page.getByRole('status')).toHaveText('正在保存…');await expect(page.getByRole('status')).toContainText('保存成功');await expect(page.getByRole('status')).toHaveCount(1);
 await expect(page.getByRole('status')).toHaveCount(0,{timeout:4000});
 const manual=page.getByRole('region',{name:'手动关闭与完成回调',exact:true});
 await manual.getByRole('button',{name:'显示提示',exact:true}).click();await expect(page.getByRole('status')).toContainText('等待手动关闭');
 await manual.getByRole('button',{name:'关闭提示',exact:true}).click();await expect(manual).toContainText('提示已关闭');await expect(page.getByRole('status')).toHaveCount(0);
});

test('Tag, Alert and Spin update their real state and Empty provides actions', async ({ page }) => {
 await page.goto('/#/tag', { waitUntil: 'domcontentloaded' });
 const tags=page.getByRole('region',{name:'关闭与选择',exact:true});
 await tags.getByRole('button',{name:'关闭标签',exact:true}).first().click();await expect(tags.getByText('可移除', {exact:true})).toHaveCount(0);
 await tags.getByRole('button',{name:'关闭标签',exact:true}).click();await expect(tags.locator('.pi-tag').filter({hasText:'保留标签'})).toBeVisible();
 await tags.getByRole('button',{name:'筛选条件',exact:true}).click();await expect(tags.getByRole('button',{name:'筛选条件',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.goto('/#/alert', { waitUntil: 'domcontentloaded' });
 const alert=page.getByRole('region',{name:'关闭与操作',exact:true});await alert.getByRole('button',{name:'关闭提示',exact:true}).click();await expect(alert.getByRole('alert')).toHaveCount(0);
 await page.goto('/#/spin', { waitUntil: 'domcontentloaded' });
 const nested=page.getByRole('region',{name:'区域加载与延迟',exact:true});const toggle=nested.getByRole('switch',{name:'区域加载',exact:true});
 await toggle.click();await expect(nested.locator('.pi-spin__content')).toHaveAttribute('inert','');
 await toggle.focus();await page.keyboard.press('Tab');expect(await nested.locator('.pi-spin__content').evaluate(el=>el.contains(document.activeElement))).toBe(false);
 await toggle.click();await expect(nested.getByRole('button',{name:'内容操作',exact:true})).toBeEnabled();
 await page.getByRole('button',{name:'演示全屏加载',exact:true}).click();await expect(page.locator('.pi-spin--fullscreen')).toBeVisible();await expect(page.locator('.pi-spin--fullscreen')).toHaveCount(0,{timeout:3000});
 await page.goto('/#/empty', { waitUntil: 'domcontentloaded' });await expect(page.getByRole('region',{name:'默认空状态',exact:true}).getByText('暂无数据',{exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'创建项目',exact:true})).toBeVisible();
});

test('all priority component docs render without errors or mobile overflow', async ({ page }) => {
 const errors: string[]=[];page.on('pageerror',e=>errors.push(e.message));
 for (const width of [1440,390]) {
  await page.setViewportSize({width,height:900});
  for (const route of ['checkbox','radio','switch','tabs','select','tooltip','message','tag','alert','spin','empty']) {
   await page.goto('/#/'+route, { waitUntil: 'domcontentloaded' });await expect(page.locator('h1')).toBeVisible();await expect(page.locator('.demo-error')).toHaveCount(0);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
 }
 expect(errors).toEqual([]);
 await page.screenshot({path:'.artifacts/priority-components-mobile.png'});
});
