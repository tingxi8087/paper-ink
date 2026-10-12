import { test, expect } from '@playwright/test';
test('Layout, Splitter and Steps examples render without errors on desktop and mobile',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 for(const width of [1440,390]){await page.setViewportSize({width,height:1000});for(const [slug,count] of [['layout',5],['splitter',6],['steps',6]] as const){await page.goto(`/#/${slug}`);await expect(page.locator('.demo')).toHaveCount(count);await expect(page.locator('.demo-error')).toHaveCount(0);expect(await page.getByRole('table').count()).toBeGreaterThan(0);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}}
 expect(errors).toEqual([]);
});
test('Layout controlled and zero-width sidebars collapse and restore',async({page})=>{
 await page.goto('/#/layout');const controlled=page.getByRole('region',{name:'可折叠侧栏',exact:true});await controlled.getByRole('button',{name:'折叠侧栏',exact:true}).click();await expect(controlled.getByRole('button',{name:'展开侧栏',exact:true})).toHaveAttribute('aria-expanded','false');await expect.poll(async()=>Math.round((await controlled.locator('aside').boundingBox())!.width)).toBe(56);await controlled.getByRole('button',{name:'展开侧栏',exact:true}).click();await expect.poll(async()=>Math.round((await controlled.locator('aside').boundingBox())!.width)).toBe(150);
 const zero=page.getByRole('region',{name:'零宽侧栏',exact:true});await zero.getByRole('button',{name:'折叠侧栏',exact:true}).click();await expect(zero.getByText('可完全收起')).toBeHidden();await zero.getByRole('button',{name:'展开侧栏',exact:true}).click();await expect(zero.getByText('可完全收起')).toBeVisible();
});
test('Splitter mouse drag, keyboard bounds, collapse and vertical keyboard work',async({page})=>{
 await page.goto('/#/splitter');const demo=page.getByRole('region',{name:'左右拖动',exact:true}), bar=demo.getByRole('separator');const initial=Number(await bar.getAttribute('aria-valuenow'));const box=(await bar.boundingBox())!;await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2+30,box.y+box.height/2);await page.mouse.up();await expect.poll(async()=>Number(await bar.getAttribute('aria-valuenow'))).toBeGreaterThan(initial+20);
 await bar.focus();await page.keyboard.press('Home');const minimum=Number(await bar.getAttribute('aria-valuemin'));await expect(bar).toHaveAttribute('aria-valuenow',String(minimum));await page.keyboard.press('ArrowRight');await expect(bar).toHaveAttribute('aria-valuenow',String(minimum+10));
 const collapse=page.getByRole('region',{name:'折叠与恢复',exact:true});await collapse.getByRole('button',{name:'折叠面板 1'}).click();await expect(collapse.getByText('可折叠左侧')).toBeHidden();await collapse.getByRole('button',{name:'展开面板 1'}).click();await expect(collapse.getByText('可折叠左侧')).toBeVisible();
 const vertical=page.getByRole('region',{name:'上下分隔',exact:true}).getByRole('separator');const before=Number(await vertical.getAttribute('aria-valuenow'));await vertical.focus();await page.keyboard.press('ArrowDown');await expect(vertical).toHaveAttribute('aria-valuenow',String(before+10));
});
test('Steps uses native keyboard controls and blocks disabled steps',async({page})=>{
 await page.goto('/#/steps');const demo=page.getByRole('region',{name:'点击与业务切换',exact:true});const preview=demo.getByRole('button',{name:'预览',exact:true});await preview.focus();await page.keyboard.press('Enter');await expect(demo.getByText('当前步骤：2，发布暂不可用。')).toBeVisible();await expect(demo.getByRole('button',{name:'发布',exact:true})).toBeDisabled();await expect(demo.locator('[aria-current=step]')).toHaveText('2预览');
});
