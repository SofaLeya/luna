const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 3 : undefined,
  fullyParallel: true,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  webServer: { command: 'python3 -m http.server 8766', url: 'http://localhost:8766/index.html', reuseExistingServer: true, stdout: 'ignore', stderr: 'ignore' },
  use: {
    baseURL: 'http://localhost:8766',
    viewport: { width: 380, height: 800 },
    serviceWorkers: 'block',
    timezoneId: 'Europe/Moscow',
    locale: 'ru-RU',
    hasTouch: true,
    launchOptions: process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH, args: ['--no-sandbox'] } : {},
  },
});
