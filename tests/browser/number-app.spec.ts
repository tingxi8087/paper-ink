import { test, expect } from '@playwright/test';
for (const width of [1440,390]) {
 test(`InputNumber and App docs at ${width}`,async({page})=>{
  await page.setViewportSize({width,height:900});const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  for(const route of ['input-number','app']){
   await page.goto('/#/'+route,{waitUntil:'domcontentloaded'});await expect(page.locator('h1')).toBeVisible();
   await expect(page.locator('.demo-error')).toHaveCount(0);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  }
  expect(errors).toEqual([]);
 });
}
test('InputNumber precise steps, intermediate input and formatter',async({page})=>{
 await page.goto('/#/input-number',{waitUntil:'domcontentloaded'});
 const precision=page.getByRole('region',{name:'高精度字符串'});
 await precision.getByRole('button',{name:'增加',exact:true}).click();await expect(precision.getByRole('spinbutton')).toHaveValue('0.000000000000000002');
 const count=page.getByRole('spinbutton',{name:'数量',exact:true});await count.fill('-');await expect(count).toHaveValue('-');
 await count.fill('99');await count.press('Tab');await expect(count).toHaveValue('10');
 const percentage=page.getByRole('spinbutton',{name:'百分比',exact:true});await percentage.fill('65');await percentage.press('Tab');await expect(percentage).toHaveValue('65%');
});
test('App contextual modal awaits asynchronous confirmation',async({page})=>{
 await page.goto('/#/app',{waitUntil:'domcontentloaded'});
 await page.getByRole('button',{name:'异步提交',exact:true}).click();const dialog=page.getByRole('dialog',{name:'提交变更'});await expect(dialog).toBeVisible();
 await dialog.getByRole('button',{name:'确定',exact:true}).click();await expect(dialog.getByRole('button',{name:'确定',exact:true})).toBeDisabled();
 await expect(dialog).toBeHidden();await expect(page.getByRole('status')).toContainText('提交完成');
});
