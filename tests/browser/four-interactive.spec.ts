import { test, expect } from '@playwright/test';
const names:Record<string,string>={breadcrumb:'Breadcrumb 面包屑',pagination:'Pagination 分页',collapse:'Collapse 折叠面板',segmented:'Segmented 分段控制器',progress:'Progress 进度条',skeleton:'Skeleton 骨架屏'};
for(const [route,title] of Object.entries(names)) {
 test(`${route} docs fit desktop and mobile`,async({page})=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(`/#/${route}`, {waitUntil: 'domcontentloaded'});await expect(page.getByRole('heading',{name:title,exact:true})).toBeVisible();await expect(page.locator('.demo-error').filter({hasText:/\S/})).toHaveCount(0);
  await page.setViewportSize({width:390,height:844});await expect(page.locator('.demo-error').filter({hasText:/\S/})).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(errors).toEqual([]);
 });
}
test('pagination updates range and page size and jumps to last page',async({page})=>{
 await page.goto('/#/pagination', {waitUntil: 'domcontentloaded'});const demo=page.getByRole('region',{name:'分页与条数'});await demo.getByRole('button',{name:'下一页'}).click();await expect(demo.getByText('第 2 页，每页 10 条')).toBeVisible();await demo.getByRole('combobox',{name:'每页条数',exact:true}).click();await expect(page.getByRole('option',{name:'10 条/页',exact:true})).toHaveAttribute('aria-selected','true');await page.getByRole('option',{name:'20 条/页',exact:true}).click();await expect(demo.getByText('第 2 页，每页 20 条')).toBeVisible();await demo.getByLabel('跳至页码').fill('999');await demo.getByLabel('跳至页码').press('Enter');await expect(demo.getByText('第 10 页，每页 20 条')).toBeVisible();await expect(demo.getByRole('button',{name:'下一页'})).toBeDisabled();
});
test('segmented keyboard selects next option and skips disabled choice',async({page})=>{
 await page.goto('/#/segmented', {waitUntil: 'domcontentloaded'});const demo=page.getByRole('region',{name:'切换视图'});await demo.getByRole('radio',{name:'周',exact:true}).focus();await page.keyboard.press('ArrowRight');await expect(demo.getByText('当前：月')).toBeVisible();await page.keyboard.press('ArrowRight');await expect(demo.getByText('当前：日')).toBeVisible();await expect(demo.getByRole('radio',{name:'日',exact:true})).toBeFocused();
});
test('collapse retains values and extra actions keep panel unchanged',async({page})=>{
 await page.goto('/#/collapse', {waitUntil: 'domcontentloaded'});const demo=page.getByRole('region',{name:'折叠与保留内容'});await demo.getByPlaceholder('切换后保留输入').fill('persist');await demo.getByRole('button',{name:'基本设置'}).click();await expect(demo.getByPlaceholder('切换后保留输入')).toBeHidden();await demo.getByRole('button',{name:'基本设置'}).click();await expect(demo.getByPlaceholder('切换后保留输入')).toHaveValue('persist');const accordion=page.getByRole('region',{name:'手风琴与独立操作'});await accordion.getByRole('button',{name:'项目详情'}).click();await accordion.getByRole('button',{name:'编辑',exact:true}).click();await expect(accordion.getByRole('button',{name:'项目详情'})).toHaveAttribute('aria-expanded','true');await accordion.getByRole('button',{name:'活动记录'}).click();await expect(accordion.getByRole('button',{name:'项目详情'})).toHaveAttribute('aria-expanded','false');const destroy=page.getByRole('region',{name:'销毁隐藏内容'});await destroy.getByPlaceholder('切走后会重置').fill('discard');await destroy.getByRole('button',{name:'预览资料'}).click();await expect(destroy.getByPlaceholder('切走后会重置')).toHaveCount(0);await destroy.getByRole('button',{name:'编辑资料'}).click();await expect(destroy.getByPlaceholder('切走后会重置')).toHaveValue('');
});
test('skeleton reveals content when loading switch is cleared',async({page})=>{
 await page.goto('/#/skeleton', {waitUntil: 'domcontentloaded'});const demo=page.getByRole('region',{name:'内容加载切换'});await expect(demo.getByRole('status')).toHaveAttribute('aria-busy','true');await demo.getByRole('switch',{name:'加载状态'}).click();await expect(demo.getByText('数据准备完成，展示真实内容。')).toBeVisible();await expect(demo.getByRole('status')).toHaveCount(0);
});
