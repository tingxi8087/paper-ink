import { expect, test } from '@playwright/test';

test('Typography copies the requested text through the browser clipboard', async ({page,context}) => {
 await page.goto('/#/typography');
 await context.grantPermissions(['clipboard-read','clipboard-write'],{origin:new URL(page.url()).origin});
 const demo=page.getByRole('region',{name:'复制与省略',exact:true});
 await demo.getByRole('button',{name:'复制',exact:true}).click();
 await expect(demo.getByRole('button',{name:'已复制',exact:true})).toBeVisible();
 expect(await page.evaluate(()=>navigator.clipboard.readText())).toBe('npm install paper-ink');
 const single=demo.locator('.pi-typography__content--ellipsis');
 expect(await single.evaluate(el=>el.scrollWidth>el.clientWidth)).toBe(true);
 const multi=demo.locator('.pi-typography__content--clamp');
 expect(await multi.evaluate(el=>el.scrollHeight>el.clientHeight)).toBe(true);
});

test('Card loading restores content and actions remain functional',async ({page})=>{
 await page.goto('/#/card');
 const demo=page.getByRole('region',{name:'内容与加载状态',exact:true});
 await demo.getByRole('switch',{name:'卡片加载状态',exact:true}).click();
 await expect(demo.getByRole('status',{name:'加载中',exact:true})).toBeVisible();
 await expect(demo.locator('.pi-card-meta')).toHaveCount(0);
 await demo.getByRole('switch',{name:'卡片加载状态',exact:true}).click();
 await expect(demo.locator('.pi-card-meta')).toBeVisible();
 await demo.getByRole('button',{name:'收藏',exact:true}).click();
 await expect(page.getByRole('status')).toContainText('已收藏');
});

test('Avatar handles browser image errors and scales long initials',async ({page})=>{
 await page.goto('/#/avatar');
 const demo=page.getByRole('region',{name:'图片与头像组',exact:true});
 const image=demo.getByAltText('示例头像');
 await expect(image).toBeVisible();
 // Switch an already mounted image to invalid bytes to trigger a real native load error.
 await image.evaluate((img:HTMLImageElement)=>{img.src='data:image/png;base64,invalid';});
 await expect(image).toHaveCount(0);
 await expect(demo.getByText('PI',{exact:true})).toBeVisible();
 const long=page.getByRole('region',{name:'尺寸与字母',exact:true}).getByText('PaperInk',{exact:true});
 expect(await long.evaluate(el=>new DOMMatrix(getComputedStyle(el).transform).a)).toBeLessThan(1);
});

test('all content docs render with no runtime errors or page overflow',async ({page})=>{
 test.setTimeout(120000);
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:900});
  for(const name of ['typography','divider','avatar','badge','card','descriptions']){
   await page.goto('/#/'+name);
   await expect(page.locator('.demo-list')).toBeVisible();
   await expect(page.locator('.demo-error')).toHaveCount(0);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${name} at ${width}px`).toBe(true);
  }
 }
 expect(errors).toEqual([]);
});
