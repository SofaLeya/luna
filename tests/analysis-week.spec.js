const {test,expect}=require('@playwright/test');
test('Анализ: неделя с понедельника, выделение события и переход в календарь',async({page})=>{
  await page.clock.setFixedTime(new Date('2026-11-21T12:00:00+03:00'));
  await page.goto('/');
  await page.evaluate(()=>{
    localStorage.setItem('luna-v1',JSON.stringify({
      setup:true,mode:'pill',since:'2026-09-01',compact:true,
      pill:{name:'Тест',time:'19:00',type:'placebo',packs:['2026-09-01']},
      days:{'2026-10-21':{flow:3},'2026-10-22':{flow:2},'2026-11-19':{flow:3}}
    }));
  });
  await page.reload();
  await page.locator('nav [data-tab="stats"]').click();
  const history=page.locator('[data-disclosure="stats-history"]');
  await expect(history.locator('.analysis-week-days').first().locator('button')).toHaveCount(7);
  const selected=history.locator('.analysis-week-day.is-selected').first();
  await expect(selected).toHaveCount(1);
  const date=await selected.getAttribute('data-week-day');
  const monday=await history.locator('.analysis-week-days').first().locator('button').first().getAttribute('data-week-day');
  const expected=new Date(date+'T12:00:00');
  const actual=new Date(monday+'T12:00:00');
  expect(actual.getDay()).toBe(1);
  expect((expected-actual)/86400000).toBeGreaterThanOrEqual(0);
  expect((expected-actual)/86400000).toBeLessThan(7);
  await selected.click();
  await expect(page.locator('nav [data-tab="cal"]')).toHaveAttribute('aria-current',/page|true/);
  await expect(page.locator('[data-cal-day="'+date+'"]')).toBeVisible();
});
test('Анализ: недельные полоски не создают горизонтальную прокрутку на мобильных экранах',async({page})=>{
  for(const width of [320,360,393,430]){
    await page.setViewportSize({width,height:780});
    await page.goto('/');
    await page.evaluate(()=>{
      localStorage.setItem('luna-v1',JSON.stringify({setup:true,mode:'natural',since:'2026-09-01',days:{'2026-10-21':{flow:3},'2026-11-19':{flow:3}}}));
    });
    await page.reload();
    await page.locator('nav [data-tab="stats"]').click();
    await expect(page.locator('[data-disclosure="stats-history"] .analysis-week-days').first()).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  }
});
