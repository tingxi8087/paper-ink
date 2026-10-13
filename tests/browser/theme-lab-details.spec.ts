import {expect, test} from '@playwright/test';

test.beforeEach(async({page})=>{
  await page.route('https://fonts.googleapis.com/**',route=>route.abort());
  await page.goto('/#/theme');
});

test('page, secondary, disabled and border tokens plus small/large heights reach their real consumers',async({page})=>{
  await page.locator('summary').filter({hasText:/^文字、背景与边框$/}).click();
  for(const [label,value] of [['页面背景','#e9edf1'],['次要文字','#345678'],['禁用文字','#665544'],['默认边框','#334455'],['细边框','#556677']])
    await page.getByRole('textbox',{name:label,exact:true}).fill(value);
  const preview=page.getByRole('region',{name:'主题预览',exact:true});
  await expect(preview.locator('.lab-samples')).toHaveCSS('background-color','rgb(233, 237, 241)');
  const input=preview.getByRole('textbox',{name:'预览输入框',exact:true});
  expect(await input.evaluate(el=>getComputedStyle(el,'::placeholder').color)).toBe('rgb(52, 86, 120)');
  await expect(preview.getByRole('textbox',{name:'预览禁用输入框',exact:true})).toHaveCSS('color','rgb(102, 85, 68)');
  await expect(input.locator('..')).toHaveCSS('border-color','rgb(51, 68, 85)');
  await expect(preview.locator('.lab-sample').first()).toHaveCSS('border-color','rgb(85, 102, 119)');
  await page.getByRole('slider',{name:'小控件高度',exact:true}).fill('32');
  await page.getByRole('slider',{name:'大控件高度',exact:true}).fill('52');
  await expect(preview.getByRole('button',{name:'Small',exact:true})).toHaveCSS('height','32px');
  await expect(preview.getByRole('button',{name:'Large',exact:true})).toHaveCSS('height','52px');
  await expect(page.locator('.site-header')).toHaveCSS('background-color','rgb(255, 255, 255)');
});

test('all semantic colors, independent tone fields and component padding visibly apply',async({page})=>{
  const preview=page.getByRole('region',{name:'主题预览',exact:true});
  await page.locator('summary').filter({hasText:/^语义色$/}).click();
  const tones=[['成功','#228844','rgb(34, 136, 68)'],['警告','#aa6600','rgb(170, 102, 0)'],['错误','#bb2233','rgb(187, 34, 51)'],['信息','#2244bb','rgb(34, 68, 187)']];
  for(const [index,[label,value,color]] of tones.entries()){
    await page.getByRole('textbox',{name:label,exact:true}).fill(value);
    await expect(preview.locator('.pi-alert__icon').nth(index)).toHaveCSS('color',color);
  }
  await page.locator('summary').filter({hasText:/^主色配套颜色$/}).click();
  for(const [label,value] of [['主色淡色背景','#ddeeff'],['主色淡色文字','#112233'],['主色边框','#446688'],['主色按下背景','#223344']])
    await page.getByRole('textbox',{name:label,exact:true}).fill(value);
  await expect(preview.getByRole('button',{name:'淡色按钮',exact:true})).toHaveCSS('background-color','rgb(221, 238, 255)');
  await expect(preview.getByText('主色标签',{exact:true})).toHaveCSS('color','rgb(17, 34, 51)');
  await expect(preview.getByText('主色标签',{exact:true})).toHaveCSS('border-color','rgb(68, 102, 136)');
  const save=preview.getByRole('button',{name:'保存修改',exact:true});
  await save.hover();await page.mouse.down();await expect(save).toHaveCSS('background-color','rgb(34, 51, 68)');await page.mouse.up();
  await page.getByRole('slider',{name:'按钮内边距',exact:true}).fill('27');
  await expect(save).toHaveCSS('padding-left','27px');
  await page.getByRole('checkbox',{name:'启用Input覆盖',exact:true}).check();
  await page.getByRole('slider',{name:'Input内边距',exact:true}).fill('23');
  await expect(preview.getByRole('textbox',{name:'预览输入框',exact:true}).locator('..')).toHaveCSS('padding-left','23px');
});

test('disabling Modal overrides restores global radius and default padding',async({page})=>{
  await page.getByRole('slider',{name:'全局圆角',exact:true}).fill('18');
  await page.getByRole('checkbox',{name:'启用Modal覆盖',exact:true}).check();
  await page.getByRole('slider',{name:'Modal圆角',exact:true}).fill('4');
  await page.getByRole('slider',{name:'Modal内边距',exact:true}).fill('36');
  await page.getByRole('button',{name:'打开主题弹窗',exact:true}).click();
  const dialog=page.getByRole('dialog',{name:'主题弹窗预览',exact:true});
  await expect(dialog).toHaveCSS('border-radius','4px');await expect(dialog).toHaveCSS('padding','36px');
  await page.keyboard.press('Escape');await expect(dialog).toBeHidden();
  await page.getByRole('checkbox',{name:'启用Modal覆盖',exact:true}).uncheck();
  await page.getByRole('button',{name:'打开主题弹窗',exact:true}).click();
  await expect(dialog).toHaveCSS('border-radius','18px');await expect(dialog).toHaveCSS('padding','24px');
});
