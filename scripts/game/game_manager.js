/*
MIT License

Copyright (c) 2018-2020 Eugene Lapeko

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

// Base class for all managers
class GameManager {
  _timerTemplate(seconds, text = chrome.i18n.getMessage("timerWillBeIn")){
    return $("<span>")
      .append(text)
      .append(
        $("<span>")
          .addClass("countdown-timer")
          .attr("seconds-left", seconds)
          .append(ENEXT.convertTime(seconds))
      );
  }

  playSound(soundUrl){
    // Don't play sound if it is disabled in this game
    if (!isOptionTrue(`${this.storage.getGameId()}-enable-sound`)) return;

    var sound = new Audio();
    sound.src = chrome.runtime.getURL(soundUrl);
    sound.play();
  }
};
