const {test,expect}=require('@playwright/test');
const NOW=new Date('2025-11-21T12:00:00+03:00');
async function boot(page,flow){
 await page.clock.setFixedTime(NOW);
 await page.addInitScript(({flow})=>{if(localStorage.getItem('luna-v1'))return;localStorage.setItem('luna-v1',JSON.stringify({setup:true,mode:'natural',since:'2025-11-19',pet:'unicorn',compact:false,cyc:{len:28,dur:6},days:flow?{'2025-11-19':{flow:3},'2025-11-20':{flow:3},'2025-11-21':{flow:3,pads:2}}:{},taken:{},ended:{}}));},{flow});
 await page.goto('/index.html');
}
test('home hygiene counter saves to existing daily record and respects bounds',async({page})=>{
 await boot(page,true);
 const box=page.getByRole('region',{name:'Средства гигиены сегодня'});
 await expect(box).toBeVisible();
 await expect(box.locator('[data-home-pads-count]')).toHaveText('2');
 await box.getByRole('button',{name:'Увеличить количество средств'}).click();
 await expect(box.locator('[data-home-pads-count]')).toHaveText('3');
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('luna-v1')).days['2025-11-21'].pads)).toBe(3);
 await page.reload();
 await expect(page.locator('[data-home-pads-count]')).toHaveText('3');
 await page.locator('[data-home-pads="-1"]').click();
 await expect(page.locator('[data-home-pads-count]')).toHaveText('2');
});
test('home hygiene counter is hidden outside menstrual days',async({page})=>{
 await boot(page,false);
 await expect(page.locator('.hygiene-home')).toHaveCount(0);
});
