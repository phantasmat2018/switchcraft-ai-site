# Switchcraft AI — сайт

Лендінг для [Switchcraft AI](https://github.com/phantasmat2018/Switchcraft-AI): розумного перемикача розкладки для Windows.

Статичний сайт (HTML/CSS/JS без збірки), розгорнутий на Cloudflare Workers: https://switchcraft-ai.buytur.workers.dev

## Структура

- `public/index.html` — сторінка
- `public/styles.css` — стилі
- `public/app.js` — інтерактивне демо виправлення розкладки (EN ↔ УК)
- `wrangler.jsonc` — конфіг Cloudflare

## Локально

```bash
npx wrangler dev
```

## Деплой

Автоматичний: кожен push у гілку `main` запускає Cloudflare Workers Builds (`npx wrangler deploy`), і сайт оновлюється за ~30 секунд. Статус збірок — у панелі Cloudflare: Workers → switchcraft-ai → Deployments.

Вручну (за потреби):

```bash
npx wrangler deploy
```

Під час виходу нового релізу оновіть номер версії та посилання на файли в `public/index.html`.

## Мови сайту

- Українська (основна): `/`, файл `public/index.html`.
- English: `/en/`, файл `public/en/index.html`.
- Русский: `/ru/`, файл `public/ru/index.html`.

Сторінки статичні й доступні пошуковикам без JavaScript. Кожна має власний canonical, hreflang, Open Graph і перекладені FAQ у JSON-LD. Мовний перемикач зберігає поточний розділ (`#…`) та не перенаправляє відвідувача автоматично. Українська залишається `x-default`.

`public/app.js` спільний: `SC_TEXT` містить рядки для демо, кнопок копіювання, відомостей про реліз і калькулятора. Числа, дати та форми множини залежать від мови сторінки. Браузерне демо на всіх сторінках навмисно показує EN ↔ українська; мова інтерфейсу Windows-програми залишається українською.

Змінюючи тексти чи статичні дані про версію/модель, оновлюйте всі три `index.html`; динамічні посилання й версія релізу завантажуються з GitHub спільним скриптом. Змінюючи URL мов, оновіть також `public/sitemap.xml` і `public/llms.txt`. Локалізовані 404 обирає `src/index.js`, зберігаючи HTTP 404 та перенаправлення на основний домен.
