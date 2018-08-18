# EN.CX webextension
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/59bd6c037b9046b2b02349fb1522c260)](https://www.codacy.com/app/L-Eugene/encx_extension?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=L-Eugene/encx_extension&amp;utm_campaign=Badge_Grade)

Расширение для популярных браузеров, улучшающее игровой процесс на движке en.cx и quest.ua.
Работает во всех популярных браузерах (Google Chrome, Mozilla Firefox, Opera)

**Основные функции:**
* Работа движка без перезагрузки страницы (отправка кодов, получение подсказок, и т.д.)
* Хранение истории кодов. Хранятся все коды, которые появлялись в истории во время
работы расширения.
* При прокрутке задания поле ввода кода остается на месте
* Просмотр задания бонуса и кода, закрывшего бонус, после его выполнения
* Штрафные подсказки открываются без перезагрузки страницы
* Отображает список незакрытых секторов (отключается в настройках расширения)

**Известные проблемы:**
* Последний код на уровне виден только тому, кто его ввел. Соответственно, и в истории кодов он виден только у того игрока, который его ввел. Это связано с особенностями работы движка Encounter.
* Возможны ситуации, когда не все коды будут отображаться в истории (некоторые коды, введенные до начала работы расширения или после завершения его работы могут быть не видны). Это связано с особенностями работы движка Encounter.

На текущий момент доступно в [магазине приложений Chrome](https://chrome.google.com/webstore/detail/%D1%80%D0%B0%D1%81%D1%88%D0%B8%D1%80%D0%B5%D0%BD%D0%B8%D0%B5-%D0%B4%D0%B2%D0%B8%D0%B6%D0%BA%D0%B0-encx/ifmagkfplnbpeandhkhiigbglofgihfl).

Для других браузеров устанавливается из файла: [Mozilla Firefox](https://github.com/L-Eugene/encx_extension/releases/download/v1.3.0/encx_extension-1.3.0-an+fx.xpi), [Opera](https://github.com/L-Eugene/encx_extension/releases/download/v1.3.0/encx_extension-1.3.0.crx)
