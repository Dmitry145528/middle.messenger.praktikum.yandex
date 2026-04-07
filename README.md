Проект представляет собой веб-приложение мессенджер, разработанное в рамках обучения в Яндекс.Практикуме.

## Стек технологий
- **Язык:** TypeScript
- **Шаблонизатор:** Handlebars
- **Сборщик:** Vite
- **Стилизация:** CSS (BEM методология)
- **Деплой:** Netlify

## Функционал (Sprint 3)
- Авторизация и регистрация через API
- Роутинг с защитой маршрутов (auth guard)
- Профиль пользователя: просмотр, редактирование данных, смена пароля, загрузка аватара
- Чаты: загрузка списка, создание нового чата, добавление/удаление пользователей
- Валидация форм на клиенте

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
- **api/** — HTTP-клиенты к API (auth, user, chats)
- **components/** — UI-компоненты (avatar, button, input, link, profile-field)
- **config/** — Конфигурация (API URL)
- **controllers/** — Контроллеры бизнес-логики (auth, user, chats)
- **core/** — Ядро: Block, Router, Route, Store
- **pages/** — Страницы (login, register, chat, profile, 404, 500)
- **store/** — Глобальное состояние
- **utils/** — Утилиты (валидация, HTTP-транспорт, маппинг данных)

## Установка и запуск

1. Установка зависимостей:
   ```bash
   npm install
   ```

2. Запуск в режиме разработки:
   ```bash
   npm run dev
   ```

3. Сборка проекта:
   ```bash
   npm run build
   ```

4. Предпросмотр собранного проекта:
   ```bash
   npm run preview
   ```

5. Запуск на сервере (сборка и предпросмотр):
   ```bash
   npm run start
   ```

## Проверка качества кода

- **Проверка TypeScript:**
  ```bash
  npm run typecheck
  ```

- **Проверка линтерами (ESLint + Stylelint):**
  ```bash
  npm run lint
  ```

- **Автоисправление:**
  ```bash
  npm run lint:fix
  ```

## Ссылки

- **Публикация на Netlify:** [Ссылка](https://exquisite-daifuku-9f0d3c.netlify.app/)
