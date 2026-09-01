# ByCrop

Прототип информационной системы учёта выращивания культур (см. `AGENTS.MD` для архитектуры и модели данных).

## Стек

AdonisJS v6, Edge (SSR), SQLite (better-sqlite3), сессионная аутентификация, Alpine.js по минимуму.

## Требования

- Node.js >= 24
- npm

## Запуск локально

```bash
npm install
cp .env.example .env
node ace generate:key          # впишет APP_KEY в .env
node ace migration:run
node ace db:seed               # справочники культур и удобрений
npm run dev
```

Приложение поднимется на `http://localhost:3333`. Первый пользователь создаётся через `/signup`.

## Тесты

```bash
npm run typecheck
npm run lint
node ace test unit
node ace test functional
```

Функциональные тесты используют отдельную БД из `.env.test` (`database/test.sqlite3`) — перед первым запуском накатите на неё миграции:

```bash
NODE_ENV=test node ace migration:run
```

Каждый функциональный тест выполняется в своей транзакции и откатывается после завершения (см. `tests/bootstrap.ts`), поэтому тестовую БД не нужно очищать вручную.

## Как добавить новую сущность

Миграция → модель → сервис (бизнес-логика) → контроллер (тонкий, только валидация/рендер) → маршруты → Edge-вьюхи. Подробности и ограничения — в `AGENTS.MD`.

## Продакшен-сборка

```bash
npm run build
cd build
npm ci --omit=dev
node bin/server.js
```
