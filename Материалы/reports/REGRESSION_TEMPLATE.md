# Регрессионный отчёт

Windows, Node.js 24.22.1, Chrome 157.0.8103.79, Playwright 1.65.1. Браузерные тесты запускались в Chrome через `ATLAS_BROWSER_CHANNEL=chrome`. Рабочая папка сдаётся без Git по указанию пользователя.

## Результаты проверок

| Проверка | До | После | Доказательство |
|---|---|---|---|
| `npm test` | 4 из 18 | 18 из 18 | [Исходный лог](baseline-npm-test.txt) · [Итоговый лог](final-tests.txt) |
| `npm run test:e2e` | Исходные дефекты воспроизведены в матрице | 6 из 6 штатных и 5 из 5 дополнительных | [Итоговый лог](final-tests.txt) |
| 48 сценариев в Chrome | 36 FAIL, 12 OK | 48 OK | [Матрица](MATRIX_TEMPLATE.csv) · [Протокол](browser-matrix.txt) |
| Tab, Shift+Tab, Space, Enter, Escape | Checkbox пропускался. Escape оставлял окно открытым. | Фокус виден. Disabled пропускаются. Диалог удерживает фокус и возвращает его. | M02, M11-M14, M33, M44-M46 |
| Контраст текста тегов и уведомлений | У тёмных уведомлений встречались значения ниже 4,5 | Минимум 5,00:1 в light и 6,15:1 в dark | M39-M42 |
| Reduced motion | Hover смещал кнопку, прокрутка оставалась плавной | Переходы 0 с, смещение 0 px, `scroll-behavior: auto` | [DevTools Rendering](screenshots/after/devtools-reduced-motion.png) · M48 |
| Внешний виджет | Глобальные правила меняли кнопки стенда | Кнопка vendor открывает детали, радиус 0 px. Кнопка Atlas сохраняет 12 px. | M47 |
| Модальный диалог | Без `:modal` и затемнения фона | `:modal`, backdrop, фокус на поле команды | [До](screenshots/before/dialog-open.png) · [После](screenshots/after/dialog-open.png) |

Mxx обозначает номер измерения в [протоколе](browser-matrix.txt). Тест контраста использует вычисленные непрозрачные цвета текста и фона восьми примеров. Он не покрывает произвольные пользовательские палитры, картинки или полупрозрачные поверхности.

## Ширина документа

Проверено на высоте 900 px. `scrollWidth` после совпадает с шириной окна во всех 12 сочетаниях.

| Viewport | Light до | Dark до | Light после | Dark после | Снимки после |
|---|---:|---:|---:|---:|---|
| 320 px | 380 | 380 | 320 | 320 | [Light](screenshots/after/320-light.png) · [Dark](screenshots/after/320-dark.png) |
| 375 px | 380 | 380 | 375 | 375 | [Light](screenshots/after/375-light.png) · [Dark](screenshots/after/375-dark.png) |
| 768 px | 768 | 768 | 768 | 768 | [Light](screenshots/after/768-light.png) · [Dark](screenshots/after/768-dark.png) |
| 1024 px | 1024 | 1024 | 1024 | 1024 | [Light](screenshots/after/1024-light.png) · [Dark](screenshots/after/1024-dark.png) |
| 1440 px | 1440 | 1440 | 1440 | 1440 | [Light](screenshots/after/1440-light.png) · [Dark](screenshots/after/1440-dark.png) |
| 1920 px | 1920 | 1920 | 1920 | 1920 | [Light](screenshots/after/1920-light.png) · [Dark](screenshots/after/1920-dark.png) |

Исходные снимки - [375 light](screenshots/before/375-light.png), [375 dark](screenshots/before/375-dark.png), [1440 light](screenshots/before/1440-light.png), [открытый диалог](screenshots/before/dialog-open.png).

## Сравнение фона кнопки

До исправления `#workbench .ui-button` из `legacy.css:3` вне слоя задавал `#2939a8`. После исправления `.ui-button` в `components` читает `--_button-bg`, который `.ui-button--primary` связывает с `--color-accent`. Фон в светлой теме - `#3659d9`. Отказ от ID и `!important` позволяет добавлять варианты через локальные токены без эскалации специфичности. [Кнопки до](screenshots/before/trace-button.png) · [Кнопки после](screenshots/after/trace-button.png) · [DevTools до](screenshots/before/devtools-primary.png) · [DevTools после](screenshots/after/devtools-primary.png)

## Стресс-тест C

Конверт C выбран и проверен самостоятельно. Задействованы именованный контейнер `ui-card` и прямой слот `.ui-card__action`. При viewport 1440 px правило измерялось на одной версии приложения до и после включения. При области содержимого 353 px ширина кнопки выросла с 95 до 353 px. В контейнере 401 px кнопка сохранила 95 px. Соседняя кнопка вне карточки во всех замерах имела ширину 142 px. [Diff](STRESS_C.diff) · [Замер](stress-c.txt) · [Тест Playwright](../tests/browser/quality.spec.js)

## Ограничения

1. Чужой CSS без ограничения области по-прежнему способен воздействовать на элементы, у которых свойство явно не задано. Для каждого импорта проверяются селекторы, слой и радиус кнопок.
2. Одновременное применение нескольких вариантов или размеров одного компонента контрактом не предусмотрено.
3. Проверен Chromium. Реальные объявления экранных дикторов и поведение других движков в прогон не входили.

План защиты на 7 минут - воспроизвести исходный конфликт, объяснить две трассировки, показать клавиатурный сценарий и выполнить выданную точечную правку. Индивидуальная защита проводится с преподавателем.

