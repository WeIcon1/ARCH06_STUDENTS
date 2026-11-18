# Аудит исходной CSS-архитектуры

В исходной версии прошли 4 из 18 структурных проверок. Chrome зафиксировал 36 отклонений в 48 сценариях матрицы. Номера строк ниже относятся к исходной версии.

Подрядчик подключался вне слоёв. Его обычные правила опережали все обычные слоистые объявления автора. Слой управляет приоритетом, а область совпадения определяется селектором.

| ID | Исходное правило | Что выиграло и почему | Исправление | Проверка |
|---|---|---|---|---|
| A-01 | `css/legacy.css:3` `#workbench .ui-button` | `background: #2939a8` и `padding: .45rem .65rem` вне слоя вытеснили варианты и размеры из `components`. | Импорт в `legacy`, правила ограничены виджетом. | M01, M27-M30 |
| A-02 | `css/legacy.css:4` `#workbench .ui-button.is-danger` | `background: #a41e24 !important` выиграл по важности, включая hover. | Локальный вариант danger со своими токенами. | M03 |
| A-03 | `css/legacy.css:2` `button` | `border-radius: 0` вне слоя выиграл у `.ui-button` из `components` при меньшей специфичности. | Правило действует на кнопку виджета через `legacy.vendor-v2`. | M01, M47 |
| A-04 | `css/states.css:11` и `css/legacy.css:5` `.is-danger` | Фон победил из позднего слоя `states`, белый текст из правила вне слоя. Селектор объединял метки, кнопки и уведомления. | Модификаторы роли принадлежат семействам. | M38, M42 |
| A-05 | `css/states.css:12` `:is(.ui-card, #workbench) .ui-tag` | `padding-inline: 1rem` из `states` вытеснил `.65rem`. Специфичность `(1,1,0)` берётся из ветки с ID. | Отступ задан только базой тега. | M38 |
| A-06 | `css/states.css:9` `.ui-field:has(input:invalid) input` | Фон `#fff0f2` и рамка `#b42336` выигрывали в `states` уже при загрузке. Пустое обязательное поле сразу соответствует `:invalid`. | Стиль зависит от `aria-invalid='true'`, которое ставит JS. | M05, M06, M31 |
| A-07 | `css/states.css:6` `.ui-button:focus` | `outline: none` в `states` выиграл у `:where(:focus-visible)` из `base`. | Кольцо `:focus-visible` с темным или светлым токеном фокуса. | M02 |
| A-08 | `css/legacy.css:7` `input` | `outline: none` вне слоя убрал фокус у всех полей, включая поле в диалоге. | Подрядный файл больше не выбирает поля библиотеки. | `browser-before.json` и `browser-after.json`, `fieldFocus` |
| A-09 | `css/components.css:12` `.ui-field input, .ui-field textarea` | `min-width: 20rem` ограничивал фактическую ширину снизу, даже при `width: 100%`. | Нулевой минимум у слота и гибкий трек формы. | M15-M18 |
| A-10 | `css/components.css:18` `.ui-card` | `min-width: 22rem` один задавал минимум 352 px. Сетка могла выделить меньше места, карточка выходила за пределы. | Гибкая сетка и перенос текста. | M07, M34 |
| A-11 | `css/components.css:21` `.ui-card p` и `css/legacy.css:6` `.ui-card p` | `color: var(--color-muted)` назначался самому тексту уведомления и побеждал наследование. Размер `.69rem` пришёл из правила вне слоя и выиграл у `.ui-alert p`. | Карточка оформляет собственное описание, уведомление задаёт размер своего текста. | M08, M35 |
| A-12 | `css/states.css:13` `.ui-tag:hover` | `cursor: pointer` и `filter: brightness(.94)` применялись при наведении без действия. | Метка статична. | M09 |
| A-13 | `css/components.css:29` `.ui-alert` | `color: #111827` задавался всем темам. В тёмной теме warning через `--color-warning-bg` получал фон `#574223` и низкий контраст. | Цвет текста и фона назначает одна семантическая роль. | M10, M42 |
| A-14 | `css/components.css:44` `.ui-switch input` | `display: none` убирал checkbox из Tab и дерева доступности. | Визуальное скрытие через позиционирование и `clip-path`, контур на треке. | M11, M12, M45 |
| A-15 | `js/app.js:15` `dialog.show()` | `<dialog open>` появлялся вне модального режима. Фон оставался доступен, Escape не закрывал окно. | `showModal()`, автофокус и возврат к фактической кнопке запуска. | M13, M14, M46 |
| A-16 | `css/components.css:2-3` два правила `.ui-button` | `padding-inline: 1.25rem` из второго блока выигрывал по порядку при одинаковом слое и специфичности. | Одна база плюс отдельные модификаторы размеров. | M30, структурный тест 11 |

## Трассировки Chrome DevTools

### 1. Фон основной кнопки

`#buttons .ui-button--primary`, свойство `background-color`. У UA есть `button` с `ButtonFace`. Обычное авторское `.ui-button--primary` из `components.css:4` в слое `components`, вес `(0,1,0)`, задаёт `#3659d9`. Обычное авторское `#workbench .ui-button` из `legacy.css:3` вне слоя, вес `(1,1,0)`, задаёт `#2939a8`. Оно выигрывает даже при раннем импорте, поскольку normal вне слоя имеет больший приоритет. Итог в Computed - `rgb(41, 57, 168)`. [Исходные Styles](screenshots/before/devtools-primary.png)

У соседней опасной кнопки выигрывает `#workbench .ui-button.is-danger` из `legacy.css:4`, вес `(1,2,0)`, с `!important`. Итог - `rgb(164, 30, 36)`. Перенос в ранний слой сам по себе оставил бы это объявление сильнее обычных. Среди слоистых important-объявлений раньше объявленный слой имеет приоритет. [Опасная кнопка](screenshots/before/devtools-danger.png)

### 2. Оформление метки внутри карточки

`#cards .ui-tag--danger`, свойства `background-color`, `color`, `padding-inline`. Все кандидаты авторские normal. Для фона `.is-danger` из `states.css:11`, вес `(0,1,0)`, побеждает `.ui-tag--danger` из `components.css:28` того же веса из-за позднего слоя. Для текста `.is-danger` из `legacy.css:5` побеждает оба слоя. Для отступа `:is(.ui-card, #workbench) .ui-tag` из `states.css:12`, вес `(1,1,0)`, побеждает базу `components.css:24`. Итог - фон `#c12236`, текст `#fff`, отступ 16 px. [Исходные Styles](screenshots/before/devtools-tag.png)

### 3. Поле email до взаимодействия

`#user-email`, свойства `border-color` и `background-color`. UA задаёт стандартное оформление поля. Авторское normal `.ui-field input` из `components.css:12`, вес `(0,1,1)`, задаёт токены рамки и поверхности. Авторское normal `.ui-field:has(input:invalid) input` из `states.css:9`, вес `(0,2,2)`, побеждает из-за слоя. Итог - рамка `#b42336` и фон `#fff0f2` при отсутствующем `aria-invalid`. Повышение специфичности не исправило бы момент срабатывания. [Исходные Styles](screenshots/before/devtools-field.png)

## Итог

После исправления основная кнопка получает `rgb(54, 89, 217)` из `--color-accent` в `components`. Подрядный селектор к ней больше не применяется. Поле при загрузке использует обычную рамку и поверхность. JS управляет моментом ошибки и модальностью, HTML задаёт связи и нативные состояния. [Styles кнопки после](screenshots/after/devtools-primary.png) · [Styles поля после](screenshots/after/devtools-field.png) · [Снимок Computed до](browser-before.json) · [Снимок Computed после](browser-after.json)

