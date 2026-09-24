# Body Maker Demo

Демо-интерфейс игрового профиля: конструктор персонажа, экран наград и раздевалка.
Приложение только клиентское, данные захардкожены, бэкенда нет.

## Страницы

| Путь          | Что внутри                                                                           |
|---------------|--------------------------------------------------------------------------------------|
| `/`           | Список страниц демо                                                                  |
| `/body-maker` | Конструктор персонажа: цвет кожи, волос, бороды, бровей, глаз и губ (SVG)            |
| `/my-awards`  | «Мои награды»: карточки бустеров и анимированное открытие подарка (react-spring)     |
| `/cloakroom`  | Раздевалка: поле с персонажем, бустеры, очки, модалка выбора одежды                  |

Слева на всех страницах есть боковая панель с информацией о персонаже.

## Стек

- [React 19](https://react.dev/)
- [Vite](https://vite.dev/): dev-сервер и сборка
- [React Router](https://reactrouter.com/)
- [Sass](https://sass-lang.com/) и CSS Modules (`*.module.scss`)
- [@react-spring/web](https://www.react-spring.dev/) для анимаций
- [ESLint](https://eslint.org/) (flat config)

## Запуск

Нужны Node.js 20.19+ (или 22.12+) и Yarn 1.

```bash
yarn install
yarn dev        # dev-сервер на http://localhost:3000
```

## Скрипты

| Команда        | Описание                                  |
|----------------|-------------------------------------------|
| `yarn dev`     | Dev-сервер с HMR (алиас `yarn start`)     |
| `yarn build`   | Production-сборка в `dist/`               |
| `yarn preview` | Локальный просмотр собранного `dist/`     |
| `yarn lint`    | Проверка кода ESLint                      |

## Структура

```
index.html              HTML-шаблон (точка входа Vite)
src/
  main.jsx              Монтирование React
  App.jsx               Роутинг
  app.scss              Глобальные стили и шрифт
  Containers/           Страничные контейнеры (Layout, Cloakroom)
  Components/           UI-компоненты
    BodyMaker/          Конструктор персонажа (SVG головы и тела)
    utils/              Базовые контролы: Button, Input, Radios
  assets/img/           Изображения
```
