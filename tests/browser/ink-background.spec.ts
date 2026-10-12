import { expect, test } from '@playwright/test';

test.beforeEach(async({page})=>{
  await page.route('https://fonts.googleapis.com/**',route=>route.abort());
});

test('ink drops flow themselves and preserve their nodes across navigation',async({page})=>{
  await page.goto('/#/',{waitUntil:'domcontentloaded'});
  const drops=page.locator('.ink-mark--home-drops');
  await expect(drops.locator('.ink-spread').last()).toHaveCSS('transform','matrix(1, 0, 0, 1, 0, 0)');
  await expect(drops.locator('.ink-fluid')).toHaveCount(4);
  expect(await drops.locator('.ink-ripple,ellipse[stroke]').count()).toBe(0);
  const contours=await drops.locator('.ink-fluid').first().evaluate(el=>{
    const animation=el.getAnimations()[0];animation.pause();
    return [0,6000].map(time=>{animation.currentTime=time;return getComputedStyle(el).getPropertyValue('d');});
  });
  expect(contours[0]).not.toBe(contours[1]);
  await drops.evaluate(el=>el.setAttribute('data-preserved','true'));
  await page.screenshot({path:'.artifacts/ink-drops-home-desktop.png'});
  await page.getByRole('link',{name:'探索 Button'}).click();
  await expect(page.locator('.ink-mark--doc-drops .ink-spread').last()).toHaveCSS('transform','matrix(1, 0, 0, 1, 0, 0)');
  await expect(drops.locator('.ink-fluid').last()).toHaveCSS('animation-play-state','paused');
  await page.screenshot({path:'.artifacts/ink-drops-doc-desktop.png'});
  await page.getByRole('link',{name:'Input 输入框',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Input 输入框',exact:true})).toBeVisible();
  await page.locator('.brand').click();
  await expect(drops).toHaveAttribute('data-preserved','true');
  await expect(drops.locator('.ink-fluid').last()).toHaveCSS('animation-play-state','running');
  expect(await drops.evaluate(el=>el.getAnimations().filter(a=>a.playState==='running').length)).toBe(0);
});

test('nearby pointer moves the ink and leaving restores it without intercepting clicks',async({page})=>{
  await page.goto('/#/',{waitUntil:'domcontentloaded'});
  const drops=page.locator('.ink-mark--home-drops');
  await expect(drops.locator('.ink-spread').last()).toHaveCSS('transform','matrix(1, 0, 0, 1, 0, 0)');
  const rect=(await drops.boundingBox())!;
  const follow=drops.locator('.ink-follow').first();
  await page.mouse.move(rect.x+210+45,rect.y+115+25);
  await expect.poll(()=>follow.evaluate(el=>Number.parseFloat(el.style.getPropertyValue('--ink-x')))).toBeGreaterThan(1);
  await expect.poll(()=>follow.evaluate(el=>Number(el.style.getPropertyValue('--ink-stretch')))).toBeGreaterThan(1);
  await page.screenshot({path:'.artifacts/ink-drops-pointer.png'});
  await page.mouse.move(10,700);
  await expect.poll(()=>follow.evaluate(el=>el.style.getPropertyValue('--ink-x'))).toBe('0px');
  await page.mouse.move(rect.x+210+45,rect.y+115+25);
  await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
  await expect.poll(()=>follow.evaluate(el=>el.style.getPropertyValue('--ink-x'))).toBe('');
  await expect(page.locator('.ink-background')).toHaveCSS('pointer-events','none');
  await page.getByRole('link',{name:'探索 Button'}).click();
  await expect(page.getByRole('heading',{name:'Button 按钮',exact:true})).toBeVisible();
});

test('mobile ink stays in the margin and docs controls remain usable',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/#/',{waitUntil:'domcontentloaded'});
  await expect(page.locator('.ink-mark--home-drops .ink-spread').last()).toHaveCSS('transform','matrix(1, 0, 0, 1, 0, 0)');
  await expect(page.locator('.ink-background')).toHaveAttribute('aria-hidden','true');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.screenshot({path:'.artifacts/ink-drops-home-mobile.png'});
  await page.getByRole('link',{name:'探索 Button'}).click();
  await expect(page.locator('.ink-mark--doc-drops .ink-spread').last()).toHaveCSS('transform','matrix(1, 0, 0, 1, 0, 0)');
  await expect(page.locator('.demo').first()).toHaveCSS('background-color','rgb(255, 255, 255)');
  const demo=page.getByRole('region',{name:'按钮类型',exact:true});
  await demo.getByRole('button',{name:'编辑代码'}).click();await expect(demo.locator('textarea')).toBeVisible();
  await page.getByRole('button',{name:'展开导航',exact:true}).click();await expect(page.getByRole('link',{name:'快速开始',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'展开导航',exact:true}).click();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:'.artifacts/ink-drops-doc-mobile.png'});
});

test('reduced motion disables flow and pointer interaction, including live preference changes',async({page})=>{
  await page.goto('/#/',{waitUntil:'domcontentloaded'});
  const drops=page.locator('.ink-mark--home-drops');
  await expect(drops.locator('.ink-spread').last()).toHaveCSS('transform','matrix(1, 0, 0, 1, 0, 0)');
  const rect=(await drops.boundingBox())!;
  await page.mouse.move(rect.x+250,rect.y+140);
  const follow=drops.locator('.ink-follow').first();
  await expect.poll(()=>follow.evaluate(el=>el.style.getPropertyValue('--ink-x'))).not.toBe('');
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(follow).toHaveCSS('transform','none');
  await expect.poll(()=>follow.evaluate(el=>el.style.getPropertyValue('--ink-x'))).toBe('');
  await page.mouse.move(rect.x+230,rect.y+130);
  await expect(follow).toHaveCSS('transform','none');
  expect(await page.locator('.ink-background').evaluate(el=>el.getAnimations({subtree:true}).length)).toBe(0);
});

test('each dimensional drop spreads outward from its own landing point without overshoot',async({page})=>{
  await page.goto('/#/',{waitUntil:'domcontentloaded'});
  const drops=page.locator('.ink-mark--home-drops');
  const spread=drops.locator('.ink-spread').first();
  await expect(spread).toBeAttached();
  const samples=await spread.evaluate(el=>{
    const animation=el.getAnimations()[0];animation.pause();
    return [0,300,800,1200,1700].map(time=>{
      animation.currentTime=time;
      const style=getComputedStyle(el);
      return {scale:new DOMMatrix(style.transform).a,opacity:Number(style.opacity)};
    });
  });
  expect(samples[0].scale).toBeCloseTo(.12);
  expect(samples[0].opacity).toBe(0);
  for(let index=1;index<samples.length;index++) {
    expect(samples[index].scale).toBeGreaterThan(samples[index-1].scale);
    expect(samples[index].scale).toBeLessThanOrEqual(1);
  }
  expect(samples.at(-1)).toEqual({scale:1,opacity:1});
  await expect(spread).toHaveCSS('transform-origin','0px 0px');
  await expect(spread).toHaveCSS('animation-iteration-count','1');
  await expect(spread.locator('path')).toHaveAttribute('fill',/^url\(#.+-body\)$/);
  await expect(spread.locator('path')).toHaveAttribute('filter',/^url\(#.+-shadow\)$/);
  await expect(spread.locator('ellipse')).toHaveAttribute('fill',/^url\(#.+-light\)$/);
});
