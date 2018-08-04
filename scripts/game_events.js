/*
MIT License

Copyright (c) 2018 Eugene Lapeko

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/*
Event descriptions. Taken from https://github.com/necto68/EnApp

2: 'Игры с указанным ID не существует',
3: 'Запрошенная игра не соответствует запрошенному Engine',
4: 'Игрок не залогинен на сайте',
5: 'Игра не началась',
6: 'Игра закончилась',
7: 'Не подана заявка (игроком)',
8: 'Не подана заявка (командой)',
9: 'Игрок еще не принят в игру',
10: 'У игрока нет команды (в командной игре)',
11: 'Игрок не активен в команде (в командной игре)',
12: 'В игре нет уровней)',
13: 'Превышено количество участников в команде (в командной игре)',
16: 'Уровень снят',
17: 'Игра закончена',
18: 'Уровень снят',
19: 'Уровень пройден автопереходом',
20: 'Все сектора отгаданы',
21: 'Уровень снят',
22: 'Таймаут уровня',
 */

class GameEventManager extends GameManager {
  initialize(storage){
    if (storage.isGameOver()){
      location.reload(true);
    }
  }

  update(storage){}
};
