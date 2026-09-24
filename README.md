# Body Maker Demo

Мини-игра про юного футболиста: создай персонажа, выигрывай серии пенальти, открывай подарки
с экипировкой и прокачивай характеристики. Всё работает в браузере, прогресс хранится в localStorage.

## Игровой цикл

1. **Внешность** (`/body-maker`): создаёшь персонажа.
2. **Раздевалка** (`/cloakroom`): надеваешь вещи в четыре слота (футболка, шорты, бутсы, перчатки)
   и вкладываешь очки характеристик.
3. **Поединки** (`/match`): выбираешь соперника и, если есть, бустер. Серия пенальти, 5 ударов
   на каждого: при ударе выбираешь угол ворот, в воротах выбираешь, куда прыгнуть.
4. **Мои награды** (`/my-awards`): за победу дают опыт, монеты и подарок с тремя случайными вещами.
   Подарок можно и купить за монеты.
5. С ростом ранга открываются новые соперники, начисляются очки характеристик и чаще выпадают
   редкие вещи. **Статистика** (`/stats`) показывает историю поединков.

Характеристики:
- **Нападение**: точность удара;
- **Ловкость**: шанс взять мяч, если угадал угол;
- **Защита**: соперник чаще промахивается.

## Стек

- [React 19](https://react.dev/)
- [Vite](https://vite.dev/): dev-сервер и сборка
- [React Router](https://reactrouter.com/)
- [Sass](https://sass-lang.com/) и CSS Modules (`*.module.scss`)
- [zustand](https://zustand.docs.pmnd.rs/): состояние игры с сохранением в localStorage
- [@react-spring/web](https://www.react-spring.dev/) для анимаций
- [Vitest](https://vitest.dev/) для тестов игровой логики
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
| `yarn test`    | Тесты игровой логики (Vitest)             |

## Структура

```
index.html              HTML-шаблон (точка входа Vite)
src/
  main.jsx              Монтирование React
  App.jsx               Роутинг
  app.scss              Глобальные стили и шрифт
  data/                 Каталоги в JSON: вещи, соперники, бустеры, ранги
  game/                 Чистая игровая логика: пенальти, награды, ранги, характеристики
  store/                Стор zustand: прогресс игрока и действия
  Containers/           Страницы (Home, Cloakroom, Match, Stats, Layout)
  Components/           UI-компоненты
    BodyMaker/          Конструктор персонажа (SVG головы и тела)
    utils/              Базовые контролы: Button, Input, Radios
  assets/img/           Изображения
```

## Контент

Вещи, соперники, бустеры и ранги описаны в `src/data/*.json`. Картинки указываются именем файла
из `src/assets/img/`. Если у вещи нет картинки, на карточке показывается название слота.

## Генерация картинок (ComfyUI)

Картинки для вещей, бустеров и соперников можно сгенерировать через ComfyUI:

```bash
export COMFY_URL=https://<твой-домен>.ngrok-free.dev
export COMFY_AUTH=user:password          # если на тоннеле basic auth

yarn gen:art --check                     # проверить связь и список моделей
yarn gen:art --dry-run                   # показать промпты без генерации
yarn gen:art --only=boosters             # сгенерировать бустеры
yarn gen:art --id=golden-boots --force   # перегенерировать одну вещь
yarn gen:art --id=golden-boots --force --reroll=2   # другой вариант (другой seed)
```

- Файлы сохраняются в `src/assets/gen/<kind>/<id>.webp` с прозрачным фоном. Если такой файл есть,
  он заменяет картинку из каталога. Если удалить файл, вернётся исходная картинка.
- Промпты: `tools/comfy/subjects.json` (что нарисовать) и `tools/comfy/style.json` (общий стиль).
- Workflow по умолчанию: `tools/comfy/workflows/txt2img.json`. Свой workflow в API-формате
  с плейсхолдерами `{{positive}}`, `{{seed}}` и т. д. можно подключить через `COMFY_WORKFLOW=path.json`.
- Готовый workflow под Krea 2 Turbo (8 шагов, cfg 1, без негативного промпта): `tools/comfy/workflows/krea2-turbo.json`.
  Запуск: `COMFY_WORKFLOW=tools/comfy/workflows/krea2-turbo.json COMFY_CHECKPOINT=krea2_turbo_fp8_scaled.safetensors yarn gen:art ...`
  (`COMFY_CHECKPOINT` здесь нужен только для выбора размера 1024×1024, модели прописаны в самом workflow).
- Модель берётся из `COMFY_CHECKPOINT`. Если переменная не задана, выбирается первый SDXL-подобный
  checkpoint на сервере.

## Персонаж из слоёв

Тело и одежда персонажа тоже генерируются через ComfyUI: Krea 2 стилизует SVG-тело,
а Flux 2 Klein «надевает» на него каждую вещь. Голова остаётся SVG, цвет кожи
перекрашивается в браузере.

```bash
yarn gen:character base                     # база: тело + серые шорты
yarn gen:character items --id=golden-boots  # варианты вещи (seed 1,2,3) + лист для выбора
yarn gen:character pick golden-boots=2      # сохранить выбранный вариант как слой
```

Слои лежат в `src/assets/character/`. Если у вещи нет слоя, на персонаже рисуется её SVG-версия.
