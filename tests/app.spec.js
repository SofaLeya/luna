// Основные сценарии Луны. Запуск: npm test
// Все тесты идут на "20 ноября 2026, 15:00 по Москве", чтобы прогнозы не зависели от реальной даты.
const { test, expect } = require('@playwright/test');
const path = require('path');

const NOW = new Date('2026-11-20T12:00:00Z'); // 15:00 МСК

test.beforeEach(async ({ page }) => {
  // внешний интернет тестам не нужен
  await page.route(u => !/^(localhost|127\.0\.0\.1)$/.test(u.hostname), r => r.abort());
  await page.clock.setFixedTime(NOW);
});

// первый запуск: КОК, сегодня таблетка №day
async function setup(page, { day = 1, prev = true } = {}) {
  const errs = [];
  page.on('pageerror', e => errs.push(String(e)));
  await page.goto('/index.html');
  await page.fill('#pd', String(day));
  if (!prev) await page.uncheck('#prev');
  await page.click('#go');
  await expect(page.locator('.hero')).toBeVisible();
  return errs;
}
const ev = (page, js) => page.evaluate(js);
async function openSettings(page) { await page.click('#set'); await expect(page.locator('.sheet')).toBeVisible(); }

test('открывается без ошибок, первый запуск', async ({ page }) => {
  const errs = await setup(page, { day: 1 });
  await expect(page.locator('[data-compact]')).toContainText('таблетка 1 из');
  await expect(page.locator('.hero .hb')).toContainText('через');
  await expect(page.locator('#petb')).toBeVisible();
  expect(errs).toEqual([]);
});

test('прогноз: месячные через 2 дня после последней активной', async ({ page }) => {
  await setup(page, { day: 1 });
  // пачка с 20.11: последняя активная 10.12, месячные с 12.12
  expect(await ev(page, 'nextBleedStart(today())')).toBe('2026-12-12');
  await expect(page.locator('.hero .hs')).toContainText('12 декабря');
});

test('отметка таблетки и отмена отметки', async ({ page }) => {
  await setup(page, { day: 3 });
  await page.click('[data-mark]');
  await expect(page.locator('[data-unmark]')).toContainText('✓');
  await page.click('[data-unmark]');
  await expect(page.locator('[data-mark]').first()).toBeVisible();
});

test('пропуск таблетки на 1-й неделе + близость = предупреждение о риске', async ({ page }) => {
  await setup(page, { day: 5, prev: false });
  await ev(page, `S.since=add(today(),-10);const y=add(today(),-6);S.days[y]={sym:[],note:'',sx:true};save();render()`);
  const a = page.locator('.alert.bad').first();
  await expect(a).toContainText('Не отмечены таблетки');
  await expect(a).toContainText('есть риск');
});

test('отменить месячные: пачка без плацебо, прогноз сдвигается и возвращается', async ({ page }) => {
  await setup(page, { day: 5 });
  const before = await ev(page, 'nextBleedStart(today())');
  await page.click('[data-compact]');
  await page.click('[data-skip]'); await page.click('[data-skip]');
  await expect(page.locator('.skipnote')).toBeVisible();
  const after = await ev(page, 'nextBleedStart(today())');
  expect(after > before).toBeTruthy();
  expect(await ev(page, 'packInfo(today()).len')).toBe(21);
  await page.click('[data-unskip]');
  expect(await ev(page, 'nextBleedStart(today())')).toBe(before);
});

test('на плацебо: отменить месячные = новая пачка сегодня', async ({ page }) => {
  await setup(page, { day: 24 });
  await page.click('[data-compact]');
  await page.click('[data-skipnow]'); await page.click('[data-skipnow]');
  await expect(page.locator('[data-compact]')).toContainText('таблетка 1 из');
});

test('месячные: начались, на следующий день спрашивает, отметила по ошибке', async ({ page }) => {
  await setup(page, { day: 26 });
  await page.click('[data-start]');
  await expect(page.locator('.hero .hb')).toHaveText('1-й день');
  await page.clock.setFixedTime(new Date('2026-11-21T12:00:00Z'));
  await page.reload();
  await expect(page.locator('.hero .hs')).toContainText('Сегодня ещё идут?');
  await page.click('[data-cont]');
  await expect(page.locator('.hero .hb')).toHaveText('2-й день');
  await page.click('[data-cancel]'); await page.click('[data-cancel]');
  expect(await ev(page, 'episodes().length')).toBe(0);
});

test('календарь: отметить и стереть диапазон, свайп месяца', async ({ page }) => {
  await setup(page);
  await page.click('[data-tab=cal]');
  await page.click('[data-rng=add]');
  await page.click('[data-day="2026-11-03"]'); await page.click('[data-day="2026-11-07"]');
  expect(await ev(page, `['2026-11-03','2026-11-07','2026-11-08'].map(k=>(S.days[k]||{}).flow||0)`)).toEqual([3, 2, 0]);
  await page.click('[data-rng=del]');
  await page.click('[data-day="2026-11-04"]'); await page.click('[data-day="2026-11-05"]');
  expect(await ev(page, `['2026-11-03','2026-11-04','2026-11-06'].map(k=>(S.days[k]||{}).flow||0)`)).toEqual([3, 0, 2]);
  await ev(page, `(()=>{const c=document.getElementById('calcard');const t=x=>new Touch({identifier:1,target:c,clientX:x,clientY:300});c.dispatchEvent(new TouchEvent('touchstart',{touches:[t(300)],changedTouches:[t(300)]}));c.dispatchEvent(new TouchEvent('touchend',{touches:[],changedTouches:[t(100)]}))})()`);
  await expect(page.locator('.cal-head b')).toHaveText('декабрь 2026');
});

test('важные даты: месячные попадают, кнопка их отменяет', async ({ page }) => {
  await setup(page, { day: 1 });
  await ev(page, `S.plans=[{name:'Отпуск',from:'2026-12-11',to:'2026-12-15'}];save()`);
  await page.click('[data-tab=stats]');
  await expect(page.locator('.plan-it')).toContainText('попадают месячные');
  await page.click('[data-plan-fix="0"]'); await page.click('[data-plan-fix="0"]');
  await expect(page.locator('.plan-it')).toContainText('не попадают');
});

test('перенос из "Мой календарь"', async ({ page }) => {
  await setup(page);
  await openSettings(page);
  await page.setInputFiles('#pcf', path.join(__dirname, 'fixtures', 'sample.pc'));
  await expect(page.locator('.toast')).toContainText('Перенесено: 5 месячных, 1 заметка');
  expect(await ev(page, `S.days['2026-09-24'].w`)).toBe(60);
  await page.click('[data-tab=stats]');
  await expect(page.locator('.stat').first()).toContainText('28 дней');
});

test('копия данных текстом: выгрузка и загрузка', async ({ page }) => {
  await setup(page, { day: 7 });
  await ev(page, `S.days['2026-11-10']={flow:3,sym:[],note:'проверка'};save()`);
  const copy = await ev(page, 'JSON.stringify(S)');
  await ev(page, `localStorage.clear()`); await page.reload();
  await expect(page.locator('#go')).toBeVisible();
  await page.click('#go');
  await openSettings(page);
  await page.click('details summary >> text=Вставить копию текстом');
  await page.fill('#imt', copy);
  await page.click('#imtb');
  expect(await ev(page, `S.days['2026-11-10'].note`)).toBe('проверка');
});

test('код-пароль: поставить, неверный, верный', async ({ page }) => {
  await setup(page);
  await openSettings(page);
  await page.click('#pinon');
  for (const d of '12341234') await page.click(`.lock [data-k="${d}"]`);
  await expect(page.locator('.lock')).toHaveCount(0);
  await page.reload();
  for (const d of '1111') await page.click(`.lock [data-k="${d}"]`);
  await expect(page.locator('.lock .ls')).toHaveText('неверный код');
  for (const d of '1234') await page.click(`.lock [data-k="${d}"]`);
  await expect(page.locator('.lock')).toHaveCount(0);
});

test('ярлык с иконки "Выпила" отмечает таблетку', async ({ page }) => {
  await setup(page, { day: 2 });
  await page.goto('/index.html?a=pill');
  await expect(page.locator('.toast')).toContainText('выпила');
  expect(await ev(page, '!!S.taken[today()]')).toBeTruthy();
});

test('режим без таблеток: своя длина цикла', async ({ page }) => {
  await page.goto('/index.html');
  await page.click('[data-m=natural]');
  await page.click('.step[data-id=len] [data-d="1"]'); // 29
  await page.fill('#ls', '2026-11-01');
  await page.click('#go');
  await expect(page.locator('.hero .hb')).toHaveText('через 10 дней');
});

test('окно дня: средства, обезболивающее, свой симптом, поиск заметок', async ({ page }) => {
  await setup(page);
  await openSettings(page);
  await page.fill('#sya', 'Спина'); await page.click('#syb');
  await page.locator('.sheet-bg').click({ position: { x: 5, y: 5 } });
  await page.click('[data-tab=cal]');
  await page.evaluate(() => openDay('2026-11-18'));
  await page.click('[data-pd="1"]'); await page.click('[data-pd="1"]');
  await page.fill('#mdn', 'Нурофен'); await page.click('#mda');
  await page.click('[data-s="Спина"]');
  await page.fill('#nt', 'болела спина');
  await page.click('.sheet #ok');
  expect(await ev(page, `[S.days['2026-11-18'].pads,S.days['2026-11-18'].meds[0].n,S.days['2026-11-18'].sym[0]]`)).toEqual([2, 'Нурофен', 'Спина']);
  await page.click('[data-tab=stats]');
  await page.fill('#nsearch', 'спина');
  await expect(page.locator('.ep.nt:not(.hide)')).toHaveCount(1);
});

test('питомец: реагирует на касание, можно сменить и убрать', async ({ page }) => {
  await setup(page);
  await page.click('#petb');
  await expect(page.locator('#petbub')).toHaveText('Мур!');
  await openSettings(page);
  await page.click('[data-pet=panda]');
  expect(await ev(page, 'S.pet')).toBe('panda');
  await page.click('[data-pet=none]');
  await page.locator('.sheet-bg').click({ position: { x: 5, y: 5 } });
  await expect(page.locator('#petb')).toHaveCount(0);
});

test('синхронизация: второе устройство получает данные и правки склеиваются', async ({ browser }) => {
  const disk = { file: null, mod: 0 };
  const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' };
  async function fake(route) {
    const u = route.request().url(), m = route.request().method();
    if (/localhost|127\.0\.0\.1/.test(new URL(u).hostname)) return route.continue();
    if (m === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
    if (u.includes('/upload?')) return route.fulfill({ json: { href: 'https://up.test/x' }, headers: cors });
    if (u.includes('/download?')) return route.fulfill({ json: { href: 'https://down.test/x' }, headers: cors });
    if (u.includes('cloud-api') && m === 'GET' && u.includes('luna.json')) return disk.file === null ? route.fulfill({ status: 404, json: {}, headers: cors }) : route.fulfill({ json: { modified: String(disk.mod) }, headers: cors });
    if (u.includes('cloud-api')) return route.fulfill({ status: 201, json: { _embedded: { items: [] } }, headers: cors });
    if (u.includes('up.test')) { disk.file = route.request().postData(); disk.mod++; return route.fulfill({ status: 201, headers: cors }); }
    if (u.includes('down.test')) return route.fulfill({ body: disk.file, headers: cors });
    return route.abort();
  }
  const mk = async () => { const c = await browser.newContext({ baseURL: test.info().project.use.baseURL, serviceWorkers: 'block', timezoneId: 'Europe/Moscow' }); await c.clock.setFixedTime(NOW); await c.route('**/*', fake); return c; };
  const ca = await mk(), cb = await mk();
  const A = await ca.newPage(); await A.goto('/index.html'); await A.fill('#pd', '3'); await A.click('#go');
  await A.evaluate(`YD.cid='x';ydSet({tok:'t'});ydSync()`);
  await expect.poll(() => disk.file !== null).toBeTruthy();
  const B = await cb.newPage(); await B.goto('/index.html');
  await B.evaluate(`YD.cid='x';ydSet({tok:'t'});ydSync()`);
  await expect.poll(() => B.evaluate('S.setup')).toBeTruthy();
  await B.evaluate(`S.days['2026-11-15']={flow:0,sym:[],note:'с телефона B'};ydSet({chg:Date.now()});ydSync()`);
  await expect.poll(() => disk.mod).toBeGreaterThan(1);
  await A.evaluate(`S.days['2026-11-16']={flow:2,sym:[],note:''};ydSet({chg:Date.now()});ydSync()`);
  await expect.poll(() => A.evaluate(`(S.days['2026-11-15']||{}).note`)).toBe('с телефона B');
  expect(await A.evaluate(`S.days['2026-11-16'].flow`)).toBe(2);
  await ca.close(); await cb.close();
});

test('apk: расписание уведомлений уходит в Android', async ({ page }) => {
  await page.addInitScript(() => {
    window.__sched = [];
    window.AndroidApp = { setSchedule: j => { window.__sched = JSON.parse(j) }, notificationsAllowed: () => true, askNotifications: () => true, setBars: () => {} };
  });
  await setup(page, { day: 20 });
  const ids = await ev(page, 'window.__sched.map(x=>x.id)');
  expect(ids).toContain('p2026-11-20');      // таблетка сегодня в 21:00
  expect(ids).toContain('p22026-11-20');     // повтор через 2 часа
  expect(ids).toContain('l2026-11-21');      // завтра последняя активная
  expect(ids).toContain('b2026-11-22');      // за день до месячных (с 23.11)
  await page.click('[data-mark]');
  expect(await ev(page, 'window.__sched.map(x=>x.id)')).not.toContain('p2026-11-20');
  await openSettings(page);
  await page.uncheck('[data-nf=period]');
  expect(await ev(page, `window.__sched.some(x=>x.id[0]==='b')`)).toBeFalsy();
});

test('apk: плашка о новой версии и "Позже"', async ({ page }) => {
  await page.addInitScript(() => {
    window.AndroidApp = { setSchedule: () => {}, notificationsAllowed: () => true, askNotifications: () => true, setBars: () => {}, versionCode: () => 3 };
  });
  await page.route('https://api.github.com/**', r => r.fulfill({ json: { body: 'Скачать...\nСборка №5' }, headers: { 'access-control-allow-origin': '*' } }));
  await setup(page);
  await expect(page.locator('.alert.info').first()).toContainText('Есть новая версия Луны');
  await page.click('#apklater');
  await expect(page.locator('text=Есть новая версия Луны')).toHaveCount(0);
});
