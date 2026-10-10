import { test, expect } from '@playwright/test';
test('Search submits through Enter and button, and identifies clear events',async({page})=>{
 await page.goto('/#/input',{waitUntil:'domcontentloaded'});const demo=page.getByRole('region',{name:'搜索与清空',exact:true});const input=demo.getByRole('searchbox',{name:'项目搜索'});
 await input.fill('design');await expect(demo).toContainText('尚未搜索');await input.press('Enter');await expect(demo).toContainText('搜索：design');
 await input.fill('button');await demo.getByRole('button',{name:'搜索',exact:true}).click();await expect(demo).toContainText('搜索：button');
 await demo.getByRole('button',{name:'清空内容',exact:true}).click();await expect(demo).toContainText('清空：');await expect(input).toHaveValue('');await expect(input).toBeFocused();
 const loading=page.getByRole('region',{name:'搜索加载与自定义按钮',exact:true});await loading.getByRole('switch').click();await expect(loading.getByRole('button',{name:'搜索',exact:true})).toBeDisabled();
 await loading.getByRole('searchbox',{name:'自定义搜索'}).fill('custom');await loading.getByRole('button',{name:'查找',exact:true}).click();await expect(page.getByRole('status')).toContainText('查找：custom');
});
test('Password visibility preserves value and focus and supports controlled toggles',async({page})=>{
 await page.goto('/#/input',{waitUntil:'domcontentloaded'});const demo=page.getByRole('region',{name:'密码显示与隐藏',exact:true});const input=demo.getByLabel('登录密码');
 await expect(input).toHaveAttribute('type','password');await input.focus();await demo.getByRole('button',{name:'显示密码',exact:true}).first().click();await expect(input).toHaveAttribute('type','text');await expect(input).toHaveValue('paper-ink');await expect(input).toBeFocused();
 await demo.getByRole('button',{name:'隐藏密码',exact:true}).click();await expect(input).toHaveAttribute('type','password');
 const controlled=page.getByRole('region',{name:'受控密码可见性',exact:true});await controlled.getByRole('switch').click();await expect(controlled.getByLabel('受控密码',{exact:true})).toHaveAttribute('type','text');
 await controlled.getByRole('button',{name:'隐藏密码',exact:true}).click();await expect(controlled.getByRole('switch')).toHaveAttribute('aria-checked','false');
});
test('Input compound components render without errors or mobile overflow',async({page})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 for(const width of [1440,390]){await page.setViewportSize({width,height:900});await page.goto('/#/input',{waitUntil:'domcontentloaded'});await expect(page.getByRole('region',{name:'受控密码可见性',exact:true})).toBeVisible();await expect(page.locator('.demo-error')).toHaveCount(0);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);}
 expect(errors).toEqual([]);
});
