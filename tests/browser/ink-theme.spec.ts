import { test, expect } from '@playwright/test';
function luminance(rgb: string) {
 const [r,g,b]=rgb.match(/[\d.]+/g)!.slice(0,3).map(Number).map(value=>{const n=value/255;return n<=.04045?n/12.92:((n+.055)/1.055)**2.4;});
 return .2126*r+.7152*g+.0722*b;
}
function contrast(a: string,b: string) { const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05); }

test('documentation uses white paper, dark readable text, pale reference surfaces and ink navigation',async({page})=>{
 await page.goto('/#/segmented');await expect(page.getByRole('heading',{name:'Segmented 分段控制器',exact:true})).toBeVisible();
 await expect(page.locator('html')).toHaveCSS('background-color','rgb(255, 255, 255)');
 const active=page.locator('.sidebar a[aria-current]');await expect(active).toHaveCSS('background-color','rgb(23, 23, 23)');await expect(active).toHaveCSS('color','rgb(255, 255, 255)');
 await expect(page.locator('.doc-boundary')).toHaveCSS('background-color','rgb(255, 255, 255)');
 await expect(page.locator('.doc-boundary')).toHaveCSS('border-left-width','1px');
 const ratios=await page.locator('.main-content').evaluate(main=>[...main.querySelectorAll(':scope > h1 + p, :scope > .table-scroll th, :scope > .table-scroll td, .doc-boundary li, .doc-import-header button')].map(el=>{
  const foreground=getComputedStyle(el).color;let current:Element|null=el,background='rgb(255, 255, 255)';
  while(current){const color=getComputedStyle(current).backgroundColor;if(color!=='rgba(0, 0, 0, 0)'&&color!=='transparent'){background=color;break;}current=current.parentElement;}
  return {foreground,background};
 }));
 expect(ratios.length).toBeGreaterThan(10);for(const colors of ratios)expect(contrast(colors.foreground,colors.background),JSON.stringify(colors)).toBeGreaterThanOrEqual(4.5);
 const selected=page.locator('.demo-preview .pi-segmented__item--selected').first();await expect(selected).toHaveCSS('background-color','rgb(23, 23, 23)');await expect(selected).toHaveCSS('color','rgb(255, 255, 255)');
 await selected.hover();await expect(selected).toHaveCSS('color','rgb(255, 255, 255)');
 await page.getByRole('heading',{name:'API',exact:true}).evaluate(el=>window.scrollTo(0,scrollY+el.getBoundingClientRect().top-72));
 await page.screenshot({path:'.artifacts/ink-doc-desktop.png'});
 await page.setViewportSize({width:390,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);await page.screenshot({path:'.artifacts/ink-doc-mobile.png'});
});

test('enabled input placeholders and component contours retain contrast',async({page})=>{
 await page.goto('/#/input');await expect(page.getByRole('heading',{name:'Input 输入框',exact:true})).toBeVisible();
 const input=page.locator('.pi-input__control:not(:disabled)[placeholder]').first();
 const colors=await input.evaluate(el=>{const p=getComputedStyle(el,'::placeholder'),root=getComputedStyle(el.closest('.pi-input')!);return {placeholder:p.color,border:root.borderColor,background:root.backgroundColor};});
 expect(contrast(colors.placeholder,colors.background)).toBeGreaterThanOrEqual(4.5);expect(contrast(colors.border,colors.background)).toBeGreaterThanOrEqual(3);
});
