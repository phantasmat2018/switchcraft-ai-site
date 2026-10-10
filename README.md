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

```bash
npx wrangler deploy
```

Під час виходу нового релізу оновіть номер версії та посилання на файли в `public/index.html`.
