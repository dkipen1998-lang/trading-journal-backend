# Trading Journal — бекенд (NestJS + PostgreSQL + Prisma)

Реалізація REST API за `backend-design.md`: авторизація через Telegram `initData`,
угоди (trades), теги, сетапи, зображення, статистика та експорт CSV/XLSX.

## Що всередині

```
src/
  auth/       перевірка Telegram initData, видача JWT
  users/      users.service.ts
  trades/     CRUD угод, close/duplicate, PnL-калькуляція
  tags/       теги користувача
  setups/     сетапи користувача
  images/     presign + підтвердження завантаження скріншотів
  stats/      summary, equity-curve, by-day, by-month
  export/     CSV / XLSX експорт
prisma/schema.prisma   схема БД (1:1 з backend-design.md)
```

---

## Крок 1 — встанови залежності

Потрібен **Node.js 18+**. Перевір версію:

```bash
node -v
```

У папці `backend/`:

```bash
npm install
```

## Крок 2 — підніми PostgreSQL

Найпростіше — через Docker (якщо Docker не встановлений, став [Docker Desktop](https://www.docker.com/products/docker-desktop/)):

```bash
docker compose up -d
```

Це підніме Postgres на `localhost:5432` з базою `trading_journal`, юзером/паролем `postgres`/`postgres`.

Якщо не хочеш Docker — онови `DATABASE_URL` у `.env` на свою вже наявну БД.

## Крок 3 — налаштуй `.env`

```bash
cp .env.example .env
```

Відкрий `.env` і заповни:

- `TELEGRAM_BOT_TOKEN` — токен, який дає **@BotFather** у Telegram, коли створюєш бота (`/newbot`)
- `JWT_SECRET` — будь-який довгий випадковий рядок:
  ```bash
  openssl rand -hex 32
  ```
- `DATABASE_URL` — залиш дефолт, якщо використовуєш `docker compose` з кроку 2

## Крок 4 — застосуй схему БД

```bash
npx prisma migrate dev --name init
npx prisma generate
```

Це створить усі таблиці (`users`, `trades`, `trade_images`, `tags`, `trade_tags`, `setups`) у Postgres.

Перевірити вміст БД візуально:

```bash
npx prisma studio
```

## Крок 5 — запусти сервер

```bash
npm run start:dev
```

Побачиш:

```
Trading Journal API running on http://localhost:3000/api
```

Сервер перезапускається автоматично при зміні коду.

## Крок 6 — перевір, що працює

Ендпоінт `/auth/telegram` вимагає справжній підписаний `initData` від Telegram, тому для швидкої перевірки без бота зручно тимчасово замінити перевірку — або одразу протестувати через реального бота (крок 7).

Швидка перевірка, що сервер живий:

```bash
curl http://localhost:3000/api/trades
# Очікувано: 401 Unauthorized — це нормально, значить guard і роутінг працюють
```

## Крок 7 — підключи як Telegram Mini App

1. У **@BotFather**: `/newbot` → отримай токен → встав у `.env` як `TELEGRAM_BOT_TOKEN`.
2. `/newapp` (або `/mybots` → Bot Settings → Menu Button → Configure Mini App) → вкажи URL, де захостиш фронтенд (крок 8).
3. Фронтенд (`TradingJournal.jsx`) при завантаженні всередині Telegram отримує `window.Telegram.WebApp.initData` — його й треба відправляти на `POST /api/auth/telegram`, щоб отримати JWT, а далі класти його в `Authorization: Bearer <jwt>` для всіх інших запитів.
4. Локально Telegram не зможе достукатись до `localhost` — постав тунель, наприклад `ngrok http 3000`, і вкажи публічний URL в BotFather / у фронтенді.

## Крок 8 — деплой у продакшн (коротко)

Найпростіший безкоштовний варіант — **Railway** або **Render**:

1. Заливаєш `backend/` у GitHub-репозиторій.
2. На Railway/Render: New Project → Deploy from GitHub → додаєш PostgreSQL плагін (він сам дасть `DATABASE_URL`).
3. У Environment Variables вставляєш `TELEGRAM_BOT_TOKEN`, `JWT_SECRET`.
4. Build command: `npm install && npx prisma generate && npm run build`
5. Start command: `npx prisma migrate deploy && npm run start:prod`
6. Отримуєш публічний `https://…` URL — його вказуєш у BotFather як Mini App URL, і в фронтенді як базовий URL для запитів (`fetch('https://your-app.up.railway.app/api/...')`).

## Наступний крок для фронтенда

Зараз `TradingJournal.jsx` тримає угоди в `useState([])` локально. Щоб підключити цей бекенд, потрібно:
- замінити `useState([])` на завантаження через `GET /api/trades` при старті;
- замінити локальні `setTrades(...)` виклики на `POST/PATCH/DELETE /api/trades/...`;
- на старті застосунку викликати `POST /api/auth/telegram` з `window.Telegram.WebApp.initData` і зберегти JWT.

Скажи, якщо хочеш — я перепишу `TradingJournal.jsx` під ці виклики.
