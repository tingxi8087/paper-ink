import { test, expect } from '@playwright/test';
const cases = [
 ['Modal', '.pi-modal-root--enter .pi-modal', '<Modal open={open} onCancel={()=>setOpen(false)} title="motion" destroyOnHidden>body</Modal>',180],
 ['Tooltip','.pi-tooltip','<Tooltip open={open} title="hint" destroyOnHidden><span>anchor</span></Tooltip>',120],
 ['Popover','.pi-popover','<Popover open={open} title="heading" content="body" destroyOnHidden><span>anchor</span></Popover>',180],
 ['Dropdown','.pi-popover','<Dropdown open={open} menu={{items:[{key:"a",label:"item"}]}} destroyOnHidden><span>anchor</span></Dropdown>',180],
 ['Popconfirm','.pi-popover','<Popconfirm open={open} title="confirm" destroyOnHidden><span>anchor</span></Popconfirm>',180],
 ['Select','.pi-select__popup','<Select open={open} options={[{value:"a",label:"item"}]} />',180],
] as const;
for(const [name, selector, component, duration] of cases) test(`${name} animates real opacity and retains its exit`,async({page})=>{
 await page.goto('/#/button',{waitUntil:'domcontentloaded'});const demo=page.getByRole('region',{name:'按钮类型',exact:true});await demo.getByRole('button',{name:'编辑代码'}).click();
 await demo.locator('textarea').fill(`function Demo(){const [open,setOpen]=useState(false);return <><Button data-testid="motion-toggle" onClick={()=>setOpen(!open)}>Toggle</Button>${component}</>;}`);
 await expect(page.getByTestId('motion-toggle')).toBeVisible();
 const sample=await page.evaluate(async({selector,duration})=>{
  document.querySelector<HTMLElement>('[data-testid=motion-toggle]')!.click();
  for(let i=0;i<3;i++)await new Promise(requestAnimationFrame);
  const panel=document.querySelector<HTMLElement>(selector)!;const animation=panel.getAnimations()[0];animation.pause();animation.currentTime=0;
  const start=Number(getComputedStyle(panel).opacity);animation.currentTime=duration/2;const middle=Number(getComputedStyle(panel).opacity);animation.currentTime=duration;const end=Number(getComputedStyle(panel).opacity);
  document.querySelector<HTMLElement>('[data-testid=motion-toggle]')!.click();await new Promise(requestAnimationFrame);
  return {start,middle,end,exit:panel.isConnected,exitName:getComputedStyle(panel).animationName};
 },{selector,duration});
 expect(sample.start).toBe(0);expect(sample.middle).toBeGreaterThan(0);expect(sample.middle).toBeLessThan(1);expect(sample.end).toBe(1);expect(sample.exit).toBe(true);expect(sample.exitName).toContain('leave');
 await expect(page.locator(selector.replace('.pi-modal-root--enter ',''))).not.toBeVisible();
});
test('Message fades and closes after its exit; keyed update does not replay entrance',async({page})=>{
 await page.goto('/#/button',{waitUntil:'domcontentloaded'});const demo=page.getByRole('region',{name:'按钮类型',exact:true});await demo.getByRole('button',{name:'编辑代码'}).click();await demo.locator('textarea').fill('<><Button onClick={()=>message.info({key:"motion",content:"old",duration:0})}>Show</Button><Button onClick={()=>message.success({key:"motion",content:"new",duration:0})}>Update</Button><Button onClick={()=>message.destroy("motion")}>Hide</Button></>');
 await demo.getByRole('button',{name:'Show',exact:true}).click();const notice=page.locator('.pi-message');await expect(notice).toBeVisible();
 await page.waitForFunction(()=>document.querySelector('.pi-message')?.getAnimations()[0]?.startTime != null);
 const before=await notice.evaluate(el=>el.getAnimations()[0]?.startTime);await demo.getByRole('button',{name:'Update',exact:true}).click();await expect(notice).toContainText('new');expect(await notice.evaluate(el=>el.getAnimations()[0]?.startTime)).toBe(before);
 await demo.getByRole('button',{name:'Hide',exact:true}).evaluate((el:HTMLElement)=>el.click());await expect(notice).toHaveCSS('animation-name','pi-message-leave');await expect(notice).toHaveCount(0);
});
test('Selection controls use short transitions and reduced motion disables new motion',async({page})=>{
 await page.goto('/#/button',{waitUntil:'domcontentloaded'});const demo=page.getByRole('region',{name:'按钮类型',exact:true});await demo.getByRole('button',{name:'编辑代码'}).click();await demo.locator('textarea').fill('<><Checkbox>check</Checkbox><Radio>radio</Radio><Segmented options={["a","b"]}/><Modal open title="motion" /></>');
 for(const selector of ['.pi-checkbox__mark','.pi-radio__mark','.pi-segmented__item'])await expect(demo.locator(selector).first()).toHaveCSS('transition-duration', /0.12s/);
 await page.emulateMedia({reducedMotion:'reduce'});await expect(page.locator('.pi-modal')).toHaveCSS('animation-name','none');
 for(const selector of ['.pi-checkbox__mark','.pi-radio__mark','.pi-segmented__item'])await expect(demo.locator(selector).first()).toHaveCSS('transition-duration','0s');
});
