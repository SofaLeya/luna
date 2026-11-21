# Луна

Календарь месячных с учётом приёма КОК. Без рекламы, все данные хранятся только на устройстве.

https://sofaleya.github.io/luna/

## Тесты

`npm ci && npx playwright install --only-shell chromium && npm test` запускает функциональные, офлайн- и визуальные проверки. На GitHub Pages сайт публикуется после успешных тестов.

Мобильные снимки четырёх экранов лежат в `tests/visual.spec.js-snapshots/`. Для обновления эталонов на Linux после согласованных изменений выполните `npm test -- tests/visual.spec.js --update-snapshots` и просмотрите разницу. В тестах используются вымышленные записи.

## Android

Папка `android` - маленькое приложение, которое открывает сайт и умеет уведомления и ярлыки.
apk собирается в GitHub Actions ("Сборка apk") и лежит тут: https://github.com/sofaleya/luna/releases/latest/download/luna.apk
