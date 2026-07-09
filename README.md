# 🚚 Delivery Tracker

Telegram Mini App для трекинга доставок с фабрики на филиалы.
Деплой на Vercel — один проект, одна команда `vercel deploy`.

## Филиалы

| # | Название | Адрес | Управляющий | Координаты |
|---|----------|-------|-------------|------------|
| 1 | C1 Dark | Буюк Ипак Йули 36 | @B_o_b_rakh_tigermma | 41.310862, 69.288302 |
| 2 | Ecopark Cafe | Узбекистон Овози 28 | @zubayrmma | 41.311676, 69.292960 |
| 3 | Shevchenko Cafe | Шевченко 21А | @sob1rov_f1 | 41.297168, 69.281061 |
| 4 | Boulevard Cafe | Укчи 6 | @Ibn_Abdulloh | 41.316910, 69.245351 |
| 5 | SeoulMun Cafe | Баходыра 69/1 | @I_A_R_10 | 41.298851, 69.246487 |
| 6 | Beruni Cafe | Беруни 41 | @shislam_099 | 41.344840, 69.204587 |

🏭 **Фабрика:** 1-й проезд Мукими 23а · @nicknet97 · 41.277943, 69.246124

🚚 **Развозчик:** +998935664333

## Флоу

```
📦 Развозчик → «Забрал с фабрики» → проверка геолокации → @nicknet97 подтверждает ✅/❌
🚚 Развозчик → Выбирает филиал → «Подтвердить доставку» → управляющий филиала подтверждает ✅/❌
📢 После подтверждения → статус уходит в группу
```

## Структура

```
delivery-tracker/
├── app/
│   ├── page.js                    # Mini App (фронтенд)
│   ├── layout.js
│   ├── globals.css
│   └── api/
│       ├── webhook/route.js       # Telegram webhook endpoint
│       ├── branches/route.js      # Список филиалов
│       ├── deliver/route.js       # Подтверждение доставки
│       ├── my-deliveries/route.js # История водителя
│       └── delivery-status/route.js
├── lib/
│   ├── bot.js                     # Логика бота (webhook mode)
│   ├── db.js                      # Turso / SQLite
│   ├── branches.js                # Филиалы + фабрика + водитель
│   └── geo.js                     # Haversine
├── next.config.js
├── jsconfig.json
├── vercel.json
└── package.json
```

## Деплой на Vercel

### 1. Создай Turso базу (бесплатно)

```bash
# Установи Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Залогинься
turso auth login

# Создай базу
turso db create delivery-tracker

# Получи URL и токен
turso db show delivery-tracker --url
turso db tokens create delivery-tracker
```

### 2. Задай переменные окружения в Vercel

```
BOT_TOKEN=123456:ABC...
WEBHOOK_SECRET=random-string
GROUP_CHAT_ID=-100xxxx
MAX_DISTANCE_METERS=300
TURSO_URL=libsql://delivery-tracker-xxx.turso.io
TURSO_AUTH_TOKEN=eyJ...
```

### 3. Деплой

```bash
# Установи Vercel CLI
npm i -g vercel

# Деплой
vercel

# Или через GitHub — просто подключи репо в Vercel Dashboard
```

### 4. Установи webhook

После деплоя открой в браузере:
```
https://your-app.vercel.app/api/webhook?setup=1
```

### 5. Регистрация управляющих

Каждый управляющий должен **один раз** открыть бота и нажать `/start` — бот автоматически привяжет его к филиалу по username.

## Локальная разработка

```bash
# Без Turso — использует локальный SQLite файл
npm run dev

# С Turso — добавь в .env:
# TURSO_URL=libsql://...
# TURSO_AUTH_TOKEN=...
```

## Команды бота

- `/start` — открыть Mini App + регистрация управляющего
- `/stats` — статистика за сегодня
