import {test,expect} from '@playwright/test';
test.beforeEach(async({page,context})=>{
  await page.route('https://fonts.googleapis.com/**',route=>route.abort());
  await context.grantPermissions(['clipboard-read','clipboard-write']);
});
for(const width of [1440,390,320]){
  test(`Tabler catalog search, previews, copy and navigation at ${width}px`,async({page})=>{
    const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
    await page.setViewportSize({width,height:900});
    await page.goto('/#/icons');
    await expect(page.getByRole('heading',{name:'Icons 图标',exact:true})).toBeVisible();
    await expect(page.locator('.icons-page')).toContainText('Tabler Icons');
    await expect(page.locator('.icons-tile')).toHaveCount(72);
    const centers = await page.locator('.icons-stage').evaluateAll(stages=>stages.every(stage=>{const box=stage.getBoundingClientRect();const svg=stage.querySelector('svg')!.getBoundingClientRect();return Math.abs(box.x+box.width/2-svg.x-svg.width/2)<0.5 && Math.abs(box.y+box.height/2-svg.y-svg.height/2)<0.5;}));
    expect(centers).toBe(true);
    const first=await page.locator('.icons-tile').first().getAttribute('aria-label');
    await page.getByRole('navigation',{name:'图标分页'}).getByRole('button',{name:'第 2 页',exact:true}).click();
    await expect(page.locator('.icons-tile').first()).not.toHaveAttribute('aria-label',first!);
    const search=page.getByRole('searchbox',{name:'搜索图标',exact:true});
    await search.fill('搜索');
    await expect(page.getByRole('button',{name:'选择 IconSearch',exact:true})).toBeVisible();
    await page.getByRole('button',{name:'选择 IconSearch',exact:true}).click();
    await page.getByRole('slider',{name:'图标尺寸'}).press('End');
    await expect(page.getByRole('button',{name:'选择 IconSearch',exact:true}).locator('svg')).toHaveAttribute('width','40');
    await page.getByRole('slider',{name:'图标线宽'}).press('Home');
    await expect(page.getByRole('button',{name:'选择 IconSearch',exact:true}).locator('svg')).toHaveAttribute('stroke-width','1');
    await page.getByRole('button',{name:'显示居中辅助线',exact:true}).click();
    await expect(page.locator('.icons-grid')).toHaveAttribute('data-guides','true');
    await page.getByRole('button',{name:'复制使用代码',exact:true}).click();
    await expect(page.getByRole('status').filter({hasText:'已复制 IconSearch'})).toBeVisible();
    expect(await page.evaluate(()=>navigator.clipboard.readText())).toContain("import { IconSearch } from 'paper-ink/icons'");
    await expect(page.getByLabel('所选图标使用代码')).toContainText('size={40} stroke={1}');
    await search.fill('not-a-real-icon-123xyz');
    await expect(page.locator('.icons-tile')).toHaveCount(0);
    await expect(page.getByText('没有匹配的图标，试试其他名称。')).toBeVisible();
    await search.fill('Heart');
    await page.getByRole('radio',{name:'填充',exact:true}).check();
    await expect(page.getByRole('button',{name:'选择 IconHeartFilled',exact:true})).toBeVisible();
    expect((await page.locator('.icons-tile').allTextContents()).every(name=>name.endsWith('Filled'))).toBe(true);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await page.evaluate(()=>window.scrollTo(0,0));
    await page.screenshot({path:`.artifacts/tabler-icons-${width}.png`,fullPage:true});
    expect(errors).toEqual([]);
  });
}
