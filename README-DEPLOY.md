# Развёртывание

Production-сборка (скомпилированный JS). Собирать на сервере ничего не нужно.

## Требования

- **Node.js 22** (на 20 не пойдёт: `better-sqlite3` требует `>=22`)
- npm 10+
- Права на запись в `database/`

Пакеты AdonisJS объявляют `engines.node >= 24`, поэтому `npm ci` напечатает
кучу предупреждений `EBADENGINE`. Это нормально, приложение проверено на Node 22.
В корне лежит `.npmrc` с `engine-strict=false` — без него установка упадёт
на хостингах, где `engine-strict` включён глобально. Не удаляйте его.

## Установка

```bash
npm ci --omit=dev
```

`better-sqlite3` — нативный модуль, но в пакете лежат готовые бинарники
(`prebuilds/linux-x64.node` и др., N-API). node-gyp и build tools не нужны.

## Переменные окружения

Скопировать `.env.example` в `.env` и заполнить:

```env
NODE_ENV=production
HOST=0.0.0.0
PORT=3000
APP_KEY=<сгенерировать>
DB_CONNECTION=sqlite
SQLITE_DB_PATH=./database/prod.sqlite3
SESSION_DRIVER=cookie
```

- `PORT` — порт, выданный панелью.
- `HOST` — `127.0.0.1`, если приложение за nginx-прокси; `0.0.0.0`, если наружу.
- `SQLITE_DB_PATH` — относительно корня приложения, файл создастся сам.
- `NODE_ENV=production` обязателен: при `development` сид `dev_seeder`
  создаст тестового пользователя `dev@example.com` с паролем `secret123`.

Ключ (им подписываются сессии и cookies, для прода нужен новый):

```bash
node ace.js generate:key
# или: node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))"
```

## Миграции и справочники

```bash
node ace.js migration:run --force   # 6 миграций
node ace.js db:seed                 # 7 культур + 5 удобрений
```

Файл ace в сборке называется **`ace.js`**, не `ace`. `--force` для миграций
в production обязателен.

Если SSH нет — либо загрузить готовый `.sqlite3` с применёнными миграциями,
либо повесить миграции на startup: `node ace.js migration:run --force && node bin/server.js`.

## Запуск

```bash
node bin/server.js
```

Точка входа — `bin/server.js` (в корне `server.js` нет). Эквивалент — `npm start`.

В логе: `started HTTP server on 0.0.0.0:3000`.

## Параметры для ISPmanager

| Параметр | Значение |
|---|---|
| Node version | 22 |
| Package manager | npm |
| Install command | `npm ci --omit=dev` |
| Startup command | `node bin/server.js` (или `npm start`) |
| Document root | корень распакованного архива |

## Прочее

- Статику (`public/assets`) отдаёт само приложение через `@adonisjs/static`,
  отдельная настройка nginx не нужна. `public/assets/.vite/manifest.json`
  удалять нельзя — по нему шаблоны находят CSS/JS.
- Вся база — один файл `database/prod.sqlite3`, бэкап = копия файла
  (лучше через `sqlite3 prod.sqlite3 ".backup backup.sqlite3"`).
- Рендеринг серверный (Edge-шаблоны), не SPA.
