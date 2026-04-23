Веб-приложение «мессенджер» — учебный проект Яндекс.Практикума по веб-разработке (**4-й спринт**).

## Стек технологий
- **Язык:** TypeScript
- **Шаблонизатор:** Handlebars
- **Сборщик:** Vite
- **Стилизация:** CSS (BEM методология)
- **Тесты:** Jest, jsdom, ts-jest
- **Деплой:** Netlify

## Функционал (Sprint 4)

Помимо возможностей предыдущих спринтов (авторизация, роутинг с **auth guard**, профиль, список чатов и участников, валидация форм):

- **Чат в реальном времени:** подключение по **WebSocket** к выбранному чату, отправка и получение сообщений
- **Вложения:** загрузка файлов через API **ресурсов**, отображение в ленте сообщений
- **Стикеры:** выбор набора и отправка стикера в сообщении
- **Качество кода:** юнит-тесты (**Jest**), **Husky** + **lint-staged**, проверки в pre-commit (в т.ч. `npm audit`)

## Страницы
- [Страница входа (Login)](https://exquisite-daifuku-9f0d3c.netlify.app/)
- [Страница регистрации (Signup)](https://exquisite-daifuku-9f0d3c.netlify.app/sign-up)
- [Страница списка чатов (Chat)](https://exquisite-daifuku-9f0d3c.netlify.app/messenger)
- [Профиль пользователя (View)](https://exquisite-daifuku-9f0d3c.netlify.app/profile)
- [Редактирование профиля (Edit)](https://exquisite-daifuku-9f0d3c.netlify.app/profile-edit)
- [Смена пароля (Password Edit)](https://exquisite-daifuku-9f0d3c.netlify.app/password-edit)
- [Страница 500 (Server Error)](https://exquisite-daifuku-9f0d3c.netlify.app/500)
- [Страница 404 (Not Found)](https://exquisite-daifuku-9f0d3c.netlify.app/404)

## Структура проекта
- **api/** — HTTP-клиенты: `auth`, `user`, `chats`, `resources`, `stickers`, общая обёртка `base-api`
- **components/** — UI-компоненты (avatar, button, input, link, profile-field)
- **config/** — URL API и WebSocket
- **controllers/** — логика: `auth`, `user`, `chats`, **чат по WebSocket** (`chat-socket-controller`)
- **core/** — Block, Router, Route, `registerComponent`
- **pages/** — login, register, chat, profile, 404, 500
- **store/** — глобальное состояние приложения
- **utils/** — валидация, `HTTPTransport`, маппинг данных, работа с формами и blob-URL для медиа
- **tools/** — вспомогательные скрипты для Jest (например, подстановка `.hbs` как в Vite)

## Требования

- **Node.js** версии 22 и выше (`package.json` → `engines.node`).

## Установка и запуск

1. Установка зависимостей (после клонирования устанавливается и [Husky](https://typicode.github.io/husky/) — хуки git через `npm run prepare`):
   ```bash
   npm install
   ```

2. Запуск в режиме разработки (Vite, по умолчанию порт 3000):
   ```bash
   npm run dev
   ```

3. Сборка проекта (сначала проверка TypeScript, затем `vite build`):
   ```bash
   npm run build
   ```

4. Предпросмотр собранного проекта (production-сборка должна быть выполнена заранее):
   ```bash
   npm run preview
   ```

5. Сборка и сразу предпросмотр (как на проде локально):
   ```bash
   npm run start
   ```

## Тесты

- **Один прогон всех тестов (Jest):**
  ```bash
  npm run test
  ```

- **Режим watch** (перезапуск при изменениях):
  ```bash
  npm run test:watch
  ```

Конфигурация: `jest.config.cjs`, для TypeScript в тестах используется `tsconfig.jest.json`. Тест-файлы: `**/*.test.ts` рядом с исходниками (например, `src/core/Router.test.ts`).

## Проверка качества кода

- **TypeScript (без emit):**
  ```bash
  npm run typecheck
  ```

- **Линтинг: ESLint + Stylelint (и `typecheck` в начале):**
  ```bash
  npm run lint
  ```

- **Автоисправление:** TypeScript не меняет; ESLint + Stylelint с `--fix`, затем снова typecheck + линт:
  ```bash
  npm run lint:fix
  ```

- **Только ESLint / только Stylelint с автофиксом:**
  ```bash
  npm run eslint:fix
  npm run stylelint:fix
  ```

- **Проверка уязвимостей зависимостей (moderate и выше):**
  ```bash
  npm run audit
  ```

## Pre-commit (перед коммитом)

По `git commit` срабатывает хук [Husky](https://typicode.github.io/husky/) (`.husky/pre-commit` → `npm run precommit`). Скрипт `precommit` по очереди запускает:

1. `lint-staged` — ESLint по staged `*.ts` / Stylelint по staged `*.css`
2. `npm run typecheck`
3. `npm run test`
4. `npm run audit`

## Ссылки

- **Публикация на Netlify:** [Ссылка](https://exquisite-daifuku-9f0d3c.netlify.app/)
