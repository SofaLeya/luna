const { test, expect, devices } = require('@playwright/test');

const DATE = '2026-12-31';
const NEXT = '2026-12-30';
const STATE = {
  setup: true,
  mode: 'pill',
  since: '2026-12-28',
  compact: true,
  pet: 'unicorn',
  appearance: { accent: 'violet', background: 'moon' },
  pill: { name: 'Длинное название КОК', time: '21:00', type: 'placebo', packs: ['2026-12-28'] },
  taken: Object.fromEntries([28, 29, 30].map(day => [`2026-12-${day}`, { at: `2026-12-${day}T18:00:00.000Z` }])),
  days: {
    '2026-07-27': { flow: 3, note: 'Самая старая запись' },
    '2026-08-24': { flow: 3, note: 'Запись за август' },
    '2026-09-21': { flow: 3, note: 'Запись за сентябрь' },
    '2026-10-19': { flow: 3, note: 'Запись за октябрь' },
    '2026-11-16': { flow: 3, note: 'Запись за ноябрь' },
    '2026-12-14': { flow: 3, note: 'Запись за декабрь', mood: '😌 спокойное', sym: ['Голова'] },
    [NEXT]: { note: 'Старая запись', mood: '😌 спокойное', temp: 36.6, customField: { keep: true } },
  },
  plans: [{ name: 'Поездка', from: '2027-01-03', to: '2027-01-04' }],
  visits: [{ date: '2026-12-03', type: 'УЗИ', note: 'Контроль' }],
};
const entry = date => `[data-cal-day="${date}"]`;
const tab = name => `nav [data-tab="${name}"]`;
const panel = name => `[data-disclosure="${name}"]`;
const read = page => page.evaluate(() => JSON.parse(localStorage.getItem('luna-v1')));

async function openLuna(page, updates = {}) {
  await page.clock.setFixedTime(new Date('2026-12-31T14:00:00+03:00'));
  await page.route(url => !/^(localhost|127\.0\.0\.1)$/.test(url.hostname), route => route.abort());
  await page.addInitScript(data => {
    if (!localStorage.getItem('luna-v1')) localStorage.setItem('luna-v1', JSON.stringify(data));
  }, { ...STATE, ...updates });
  await page.goto('/index.html');
}

async function pickMonth(page, month, year) {
  await page.locator('#calendar-month').click();
  const picker = page.getByRole('dialog', { name: 'Выбор месяца и года' });
  await picker.getByLabel('Месяц').selectOption(String(month));
  await picker.getByLabel('Год').fill(String(year));
  await picker.getByRole('button', { name: 'Перейти' }).click();
}

test('смена месяца и вкладки сохраняет выбранный день до явного выбора', async ({ page }) => {
  await openLuna(page);
  const loaded = await page.evaluate(() => structuredClone(S));
  await page.locator(tab('cal')).click();
  await page.locator(entry(NEXT)).click();
  await expect(page.locator(entry(NEXT))).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#nm').click();
  await expect(page.locator('#calendar-month')).toContainText('январь 2027');
  await expect(page.locator('[data-cal-day][aria-pressed=true]')).toHaveCount(0);
  await expect(page.locator('.calendar-detail')).toContainText('30 декабря 2026');
  await expect(page.locator('#calendar-edit')).toHaveCount(0);
  await page.locator(tab('stats')).click();
  await page.locator(tab('cal')).click();
  await expect(page.locator('#calendar-month')).toContainText('январь 2027');
  await page.locator('#pm').click();
  await expect(page.locator('#calendar-month')).toContainText('декабрь 2026');
  await expect(page.locator(entry(NEXT))).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#nm').click();
  await page.locator('#calendar-selection').click();
  await expect(page.locator(entry(NEXT))).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#nm').click();
  await page.locator('#calendar-today').click();
  await expect(page.locator(entry(DATE))).toHaveAttribute('aria-current', 'date');
  await expect(page.locator(entry(DATE))).toHaveAttribute('aria-pressed', 'true');
  // Selecting a date never changes stored data.
  expect(await read(page)).toEqual(loaded);
});

test('выбор месяца и года, длина февраля, 30 и 31 день', async ({ page }) => {
  await openLuna(page);
  await page.locator(tab('cal')).click();
  await pickMonth(page, 2, 2024);
  await expect(page.locator('#calendar-month')).toContainText('февраль 2024');
  await expect(page.locator('#calcard button:not(.out)')).toHaveCount(29);
  await page.locator(entry('2024-02-29')).click();
  await page.locator('#nm').click();
  await expect(page.locator('#calcard button:not(.out)')).toHaveCount(31);
  await page.locator('#nm').click();
  await expect(page.locator('#calcard button:not(.out)')).toHaveCount(30);
  await page.locator('#calendar-selection').click();
  await expect(page.locator(entry('2024-02-29'))).toHaveAttribute('aria-pressed', 'true');
  await pickMonth(page, 2, 2025);
  await expect(page.locator('#calcard button:not(.out)')).toHaveCount(28);
  await page.locator(entry('2025-03-01')).click();
  await expect(page.locator('#calendar-month')).toContainText('март 2025');
  await expect(page.locator(entry('2025-03-01'))).toHaveAttribute('aria-pressed', 'true');
});

test('редактор сохраняет месячные, заметку, настроение, симптом и таблетку вместе', async ({ page }) => {
  await openLuna(page);
  const loaded = await page.evaluate(() => structuredClone(S));
  await page.locator(tab('cal')).click();
  await page.locator(entry(NEXT)).click();
  const detail = page.locator('.calendar-detail');
  await expect(detail).toContainText('Старая запись');
  await expect(detail).toContainText('Таблетка принята');
  await page.locator('#calendar-edit').click();
  const editor = page.getByRole('dialog', { name: /Запись · 30 декабря/ });
  await editor.getByRole('textbox', { name: 'Заметка' }).fill('Уточнённая запись');
  await editor.getByRole('button', { name: 'средне', exact: true }).click();
  await editor.getByRole('button', { name: '😊 хорошее' }).click();
  await editor.getByRole('button', { name: 'Голова' }).click();
  await editor.getByRole('button', { name: /Снять отметку/ }).click();
  await expect(editor.getByRole('textbox', { name: 'Заметка' })).toHaveValue('Уточнённая запись');
  expect(await read(page)).toEqual(loaded);
  await editor.getByRole('button', { name: 'Сохранить запись' }).click();
  await expect(detail).toContainText('Уточнённая запись');
  await expect(detail).toContainText('Кровотечение: средне');
  await expect(detail).toContainText('Настроение: 😊 хорошее');
  await expect(detail).toContainText('Симптомы: Голова');
  await expect(detail).toContainText('Таблетка не отмечена');
  const take = { ...loaded.taken };
  delete take[NEXT];
  expect(await read(page)).toEqual({
    ...loaded, taken: take, days: { ...loaded.days, [NEXT]: {
      ...STATE.days[NEXT], flow: 3, note: 'Уточнённая запись', mood: '😊 хорошее', sym: ['Голова'],
    } },
  });
  await page.locator('#calendar-edit').click();
  await editor.getByRole('button', { name: 'Выпила', exact: true }).click();
  await editor.getByRole('textbox', { name: 'Заметка' }).fill('Черновик');
  await page.keyboard.press('Escape');
  await expect(detail).toContainText('Уточнённая запись');
  expect((await read(page)).taken[NEXT]).toBeUndefined();
});

test('плюс всегда открывает запись за сегодня и оставляет календарь на месте', async ({ page }) => {
  await openLuna(page);
  await page.locator(tab('cal')).click();
  await page.locator(entry(NEXT)).click();
  await page.locator('#nm').click();
  const quick = page.getByRole('button', { name: 'Запись за сегодня' });
  await expect(quick).toContainText('Запись');
  await quick.click();
  const dialog = page.getByRole('dialog', { name: 'Запись · 31 декабря 2026' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Закрыть окно' }).click();
  await expect(quick).toBeFocused();
  await expect(page.locator('#calendar-month')).toContainText('январь 2027');
  await expect(page.locator('.calendar-detail')).toContainText('30 декабря 2026');
});

test('секции раскрываются с клавиатуры, поиск видит всю историю, данные остаются в прежнем формате', async ({ page }) => {
  await openLuna(page);
  await page.locator(tab('stats')).click();
  const forecast = page.locator(panel('stats-forecast'));
  await expect(forecast.locator('.analysis-week-event:visible')).toHaveCount(3);
  await forecast.locator(panel('forecast-more')+' summary').press('Enter');
  expect(await forecast.locator('.analysis-week-event:visible').count()).toBeGreaterThan(3);
  await forecast.locator('summary').first().press('Space');
  await expect(forecast).not.toHaveAttribute('open', '');
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('luna-ui-disclosures-v1'))?.['stats-forecast'])).toBe(false);
  const history = page.locator(panel('stats-history'));
  await expect(history.locator('.analysis-week-event:visible')).toHaveCount(3);
  await history.locator(panel('history-more')+' summary').click();
  await expect(history.locator('.analysis-week-event:visible')).toHaveCount(6);
  await expect(page.locator('.nt:visible')).toHaveCount(3);
  await page.locator('#more-notes').click();
  await expect(page.locator('.nt:visible')).toHaveCount(7);
  await page.locator('#more-notes').click();
  await page.locator('#nsearch').fill('самая старая');
  await expect(page.locator('.nt:visible')).toHaveCount(1);
  await expect(page.locator('.nt:visible')).toContainText('Самая старая запись');
  await page.locator(tab('cal')).click();
  const legend = page.locator(panel('calendar-legend'));
  await legend.locator('summary').click();
  await expect(legend).toHaveAttribute('open', '');
  await page.reload();
  await page.locator(tab('cal')).click();
  await expect(legend).toHaveAttribute('open', '');
  await page.locator(tab('stats')).click();
  await expect(forecast).not.toHaveAttribute('open', '');
  await expect(history.locator('.analysis-week-event:visible')).toHaveCount(6);
  expect(await read(page)).toEqual(STATE);
});

test('перерыв и плацебо различимы, а отметка доступна при закрытых деталях', async ({ page }) => {
  await openLuna(page);
  const pill = page.locator('.pill-card');
  await expect(pill).toContainText('Таблетка 4 из 28 · Активная');
  await expect(pill).toContainText('По плану в 21:00');
  await expect(pill.locator(panel('pill-details'))).not.toHaveAttribute('open', '');
  await pill.getByRole('button', { name: 'Выпила', exact: true }).click();
  await expect(pill).toContainText('принято в 14:00');
  await pill.getByRole('button', { name: /Снять отметку/ }).click();
  await expect(pill.getByRole('button', { name: 'Выпила', exact: true })).toBeVisible();
  // Shift the fixture pack start into its inactive phase, without passing through a scheme edit.
  await page.evaluate(() => {
    const data = JSON.parse(localStorage.getItem('luna-v1'));
    data.pill.packs = ['2026-12-08'];
    localStorage.setItem('luna-v1', JSON.stringify(data));
  });
  await page.reload();
  await expect(pill).toContainText('Таблетка 24 из 28 · Плацебо');
  await expect(pill.getByRole('button', { name: 'Выпила', exact: true })).toBeVisible();
  await page.evaluate(() => {
    const data = JSON.parse(localStorage.getItem('luna-v1'));
    data.pill.type = 'break';
    localStorage.setItem('luna-v1', JSON.stringify(data));
  });
  await page.reload();
  await expect(pill).toContainText('День схемы 24 из 28 · Перерыв');
  await expect(pill).toContainText('Сегодня без таблетки');
  await expect(pill.getByRole('button', { name: 'Выпила', exact: true })).toHaveCount(0);
});

test('анализ без записей объясняет, почему нет средних значений', async ({ page }) => {
  await openLuna(page, { mode: 'natural', days: {}, taken: {} });
  await page.locator(tab('stats')).click();
  await expect(page.locator('.stat b')).toHaveText(['Мало данных', 'Мало данных']);
  await expect(page.locator('.forecast-summary')).toContainText('Пока нет прогноза');
});

test('возврат к длинному анализу восстанавливает позицию прокрутки', async ({ page }) => {
  await openLuna(page, { days: {
    ...STATE.days, ...Object.fromEntries(Array.from({ length: 25 }, (_, i) => [
      `2026-12-${String(i + 1).padStart(2, '0')}`, { note: 'Длинная запись за декабрь '.repeat(6) },
    ])),
  } });
  await page.locator(tab('stats')).click();
  await page.locator('#more-notes').click();
  await page.evaluate(() => scrollTo(0, 420));
  const before = await page.evaluate(() => scrollY);
  expect(before).toBeGreaterThan(250);
  await page.locator(tab('cal')).click();
  expect(await page.evaluate(() => scrollY)).toBe(0);
  await page.locator(tab('stats')).click();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(before);
});

const { defaultBrowserType, ...pixel } = devices['Pixel 7'];
test.describe('мобильная раскладка', () => {
  test.use({ ...pixel, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  for (const width of [320, 360, 393, 430]) {
    test(`${width} CSS px: экраны и редактор помещаются по ширине`, async ({ page }) => {
      await page.setViewportSize({ width, height: 585 });
      await openLuna(page);
      const noOverflow = async () => {
        expect(await page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth))).toBe(width);
      };
      await noOverflow();
      const primary = await page.locator('.pill-card [data-mark]').boundingBox();
      const nav = await page.locator('nav').boundingBox();
      expect(primary.y + primary.height).toBeLessThan(nav.y);
      for (const name of ['cal', 'care', 'stats']) {
        await page.locator(tab(name)).click();
        await noOverflow();
      }
      await page.locator('#quick-entry').click();
      await page.locator(panel('day-extra')+' summary').click();
      await noOverflow();
      expect(await page.locator('.day-editor').evaluate(node => node.scrollWidth)).toBeLessThanOrEqual(width);
      await expect(page.getByRole('button', { name: 'Сохранить запись' })).toBeInViewport();
    });
  }
});
