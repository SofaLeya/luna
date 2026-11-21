const { test, expect, devices } = require('@playwright/test');

const NOW = new Date('2025-11-21T12:00:00+03:00');
const DAYS = {
  '2025-10-22': { flow: 3 },
  '2025-10-23': { flow: 2 },
  '2025-11-19': { flow: 3 },
  '2025-11-20': { flow: 3 },
  '2025-11-21': { flow: 3, note: 'Тестовая запись' },
};

async function openLuna(page, mode = 'natural') {
  await page.clock.setFixedTime(NOW);
  await page.route('**/version.txt*', route => route.fulfill({ status: 404 }));
  await page.addInitScript(({days, mode}) => {
    if (localStorage.getItem('luna-v1')) return;
    localStorage.setItem('luna-v1', JSON.stringify({
      setup: true, mode, since: mode==='pill'?'2025-11-21':'2025-10-22', pet: 'unicorn',
      pill: { packs: ['2025-11-21'], time: '21:00' },
      compact: mode==='natural'?false:true, cyc: { dur: 6 }, days, taken: { '2025-10-21': { at: '2025-10-21T21:00:00+03:00' } },
    }));
    window.AndroidApp = {
      setSchedule() {}, setBars() {}, notificationsAllowed: () => true, versionCode: () => 1,
    };
    localStorage.setItem('luna-apkchk', String(Date.now()));
  }, {days:DAYS, mode});
  await page.goto('/index.html');
}

async function snapshot(page, name) {
  await page.evaluate(() => Promise.all([document.fonts.ready, ...Array.from(document.images, img => img.decode())]));
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(page.viewportSize().width);
  await expect(page).toHaveScreenshot(name, { maxDiffPixelRatio: 0.015 });
}

for (const [label, viewport] of [
  ['android', { width: 393, height: 700 }],
  ['android-narrow', { width: 320, height: 640 }],
]) {
  test.describe(label, () => {
    const { defaultBrowserType, ...pixel } = devices['Pixel 7'];
    test.use({ ...pixel, viewport, deviceScaleFactor: 1, reducedMotion: 'reduce' });

    test('основные экраны и оформление', async ({ page }) => {
      await openLuna(page);
      await expect(page.locator('.cycle-dial')).toHaveText('3');
      await snapshot(page, `${label}-today.png`);

      await page.getByRole('button', { name: 'Календарь', exact: true }).click();
      await expect(page.locator('.calendar-detail')).toContainText('День цикла 3');
      await snapshot(page, `${label}-calendar.png`);

      await page.getByRole('button', { name: 'Анализ', exact: true }).click();
      await snapshot(page, `${label}-analysis.png`);
      await page.getByRole('button', { name: 'Уход', exact: true }).click();
      await snapshot(page, `${label}-care.png`);
      await page.getByRole('button', { name: 'Питомец', exact: true }).click();
      await expect(page.getByRole('button', { name: 'Единорог', exact: true })).toHaveAttribute('aria-pressed', 'true');
      // The pet gallery intentionally grows when new companions are introduced.
      // Validate layout and the new category instead of comparing an obsolete screenshot.
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport.width);
      await page.getByRole('button', { name: 'Пиксельные', exact: true }).click();
      await expect(page.locator('.pet-tile .pixel-pet-art')).toHaveCount(8);
      await expect(page.locator('[data-pet="pixel_kitty"]')).toBeVisible();

      await page.getByRole('button', { name: 'Назад', exact: true }).click();
      await page.getByRole('button', { name: 'Оформление', exact: true }).click();
      await expect(page.getByRole('button', { name: 'Лавандовые облака', exact: true })).toHaveAttribute('aria-pressed', 'true');
      await snapshot(page, `${label}-appearance.png`);
    });

    test('главная с КОК и редактор записи', async ({ page }) => {
      await openLuna(page,'pill');
      await expect(page.locator('.pill-today')).toContainText('Активная');
      await snapshot(page, `${label}-pill.png`);
      await page.getByRole('button', { name: 'Запись за сегодня' }).click();
      await expect(page.getByRole('dialog', { name: /Запись · 21 ноября/ })).toBeVisible();
      await snapshot(page, `${label}-editor.png`);
    });
  });
}

test('оформление сохраняется вместе с прежними записями', async ({ page }) => {
  await openLuna(page);
  const read = () => page.evaluate(() => JSON.parse(localStorage.getItem('luna-v1')));
  const previous = await read();
  await page.getByRole('button', { name: 'Настройки', exact: true }).click();
  await page.getByRole('button', { name: 'Оформление', exact: true }).click();
  await page.getByRole('button', { name: 'Розовый', exact: true }).click();
  await page.getByRole('button', { name: 'Звёздное небо', exact: true }).click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-wallpaper', 'stars');
  expect(await read()).toMatchObject({ ...previous, appearance: { accent: 'rose', background: 'stars' } });
});

test.describe('офлайн', () => {
  test.use({ serviceWorkers: 'allow' });

  test('загружает оформление, календарь и иллюстрации без сети', async ({ page, context }) => {
    await openLuna(page);
    await page.evaluate(() => navigator.serviceWorker.ready.then(() => true));
    await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
    await context.setOffline(true);
    await page.reload();
    await expect(page.locator('.cycle-dial')).toHaveText('3');
    expect(await page.locator('#petb img').evaluate(img => img.decode().then(() => img.naturalWidth))).toBeGreaterThan(0);
    await page.getByRole('button', { name: 'Календарь', exact: true }).click();
    await expect(page.locator('.calendar-detail')).toContainText('День цикла 3');
  });
});
