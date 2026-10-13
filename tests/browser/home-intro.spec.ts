import { expect, test } from '@playwright/test';

test.beforeEach(async({page})=>{
  await page.route('https://fonts.googleapis.com/**',route=>route.abort());
});

for(const width of [1440,390]) {
  test(`ink fuses into the actual heading and buttons, then settles without replay at ${width}px`,async({page})=>{
    await page.setViewportSize({width,height:width===390?844:1000});
    const now=new Date('2026-10-12T10:00:00Z');
    await page.clock.install({time:now});await page.clock.pauseAt(now);
    await page.goto('/#/',{waitUntil:'domcontentloaded'});
    const home=page.locator('.home-page');
    await expect(home).toHaveAttribute('data-intro','playing');
    await expect(home.locator('.home-title-drop')).toHaveCount(5);
    await expect(home.locator('h1')).toHaveCount(1);
    const shapes:string[]=[];
    for(const [name,time] of [['drop',.35],['fusion',.95],['forming',1.5],['settled',2.65]] as const){
      shapes.push(await home.evaluate((root,t)=>{
        root.getAnimations({subtree:true}).forEach(animation=>{animation.pause();animation.currentTime=t*1000;});
        const svg=root.querySelector<SVGSVGElement>('.home-ink-defs')!;
        svg.pauseAnimations();svg.setCurrentTime(t);
        return getComputedStyle(root.querySelector('.home-title-drop')!).transform;
      },time));
      await page.screenshot({path:`.artifacts/home-ink-${width}-${name}.png`});
    }
    expect(shapes[0]).not.toBe(shapes[1]);
    await expect(home.locator('h1')).toHaveCSS('opacity','1');
    await page.clock.runFor(2700);
    await expect(home).toHaveAttribute('data-intro','done');
    await expect(page.locator('.ink-background')).toHaveCount(0);
    await expect(home.locator('.home-title-ink,.home-action-pool,.home-ink-defs')).toHaveCount(0);
    await expect(home.locator('.home-title')).toHaveCSS('filter','none');
    expect(await home.evaluate(el=>el.getAnimations({subtree:true}).length)).toBe(0);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await page.clock.resume();
    await page.getByRole('link',{name:'探索 Button'}).click();
    await expect(page.getByRole('heading',{name:'Button 按钮',exact:true})).toBeVisible();
    await page.locator('.brand').click();
    await expect(page.locator('.home-page')).toHaveAttribute('data-intro','done');
    expect(await page.locator('.home-page').evaluate(el=>el.getAnimations({subtree:true}).length)).toBe(0);
  });
}

test('keyboard focus and pointer interaction finish the intro immediately',async({page})=>{
  await page.goto('/#/',{waitUntil:'domcontentloaded'});
  await expect(page.locator('.home-page')).toHaveAttribute('data-intro','playing');
  await page.getByRole('link',{name:'开始使用',exact:true}).focus();
  await expect(page.locator('.home-page')).toHaveAttribute('data-intro','done');
  await expect(page.getByRole('link',{name:'开始使用',exact:true})).toBeFocused();
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.locator('.home-page')).toHaveAttribute('data-intro','playing');
  await page.locator('.home-title').dispatchEvent('pointerdown');
  await expect(page.locator('.home-page')).toHaveAttribute('data-intro','done');
  await page.getByRole('link',{name:'开始使用',exact:true}).click();
  await expect(page.getByRole('heading',{name:'快速开始',exact:true})).toBeVisible();
});

test('reduced motion shows complete home immediately and cancels an active introduction',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/#/',{waitUntil:'domcontentloaded'});
  await expect(page.locator('.home-page')).toHaveAttribute('data-intro','done');
  expect(await page.locator('.home-page').evaluate(el=>el.getAnimations({subtree:true}).length)).toBe(0);
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.locator('.home-page')).toHaveAttribute('data-intro','playing');
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(page.locator('.home-page')).toHaveAttribute('data-intro','done');
  await expect(page.locator('.home-title')).toHaveCSS('filter','none');
  await expect(page.locator('.home-title-drop')).toHaveCount(0);
});
