# Vue App Test

## Быстрый старт в Docker

```bash
cp .env.example .env   # если ещё нет .env
npm run docker:up
```

Открой: http://localhost:3020

Админ (из `.env`):
- логин: `ADMIN_USERNAME` (по умолчанию `admin`)
- пароль: `ADMIN_PASSWORD` (по умолчанию `admin123`)

Порт приложения задаётся `APP_PORT` в `.env` (сейчас `3020`).

Остановить:
```bash
npm run docker:down
```

Логи:
```bash
npm run docker:logs
```

## Локальная разработка без Docker-приложения

```bash
npm run db:up          # только Postgres
npm install
npm run seed:admin
npm run dev
```
