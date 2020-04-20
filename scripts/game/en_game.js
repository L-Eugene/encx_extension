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

var gameStorage = null;

var ENEXT = {
  // Convert Encounter timestamp to readable date
  convertTimestamp: function (ts, format='readable'){
    var d = new Date(ts);
    d.setFullYear(d.getFullYear() - 1969);

    switch (format){
      case 'readable':
        return d.toLocaleString();
      case 'encounter':
        var time = `${d.getHours().toString().padStart(2, '0')}:` +
                   `${d.getMinutes().toString().padStart(2, '0')}:` +
                   `${d.getSeconds().toString().padStart(2, '0')}`;
        var date = `${d.getDate().toString().padStart(2, '0')}.` +
                   `${(d.getMonth() + 1).toString().padStart(2, '0')}`;
        var diff = Math.floor((Date.now() - d) / (1000*60*60*24)); // Measured in days
        if (diff > 180){ // Show full date if more than 6 month ago
          return `${date}.${d.getFullYear()} ${time}`;
        } else if (diff > 0) { // Show day and month if more than 24 hours ago
          return `${date} ${time}`;
        } else { // Just Time
          return time;
        }
      case 'unix':
        return Math.round(d.getTime() / 1000);
    }
  },

  currentTimestamp: function (){
    return Math.round(new Date().getTime() / 1000);
  },

  parseBoolean:function (value, bydefault = false){
    switch (typeof value){
      case 'object':
        return null === value ? bydefault : Boolean(value);
      case 'number':
        return value != 0;
      case 'string':
        return ["true", "yes", "on"].includes(value.toLowerCase())
      default:
        return Boolean(value);
    }
  },

  // Split value in seconds into D H:M:S
  convertTime: function(sec){
    var result = "";

    if (sec % 60 > 0){
      result = chrome.i18n.getMessage("timeSec", [sec%60]);
    }
    sec = Math.floor(sec / 60);

    if (sec % 60 > 0){
      result = chrome.i18n.getMessage("timeMin", [sec%60, result]);
    }
    sec = Math.floor(sec / 60);

    if (sec % 24 > 0){
      result = chrome.i18n.getMessage("timeHour", [sec%24, result]);
    }
    sec = Math.floor(sec / 24);

    if (sec > 0){
      result = chrome.i18n.getMessage("timeDay", [sec, result]);
    }

    if (result === "")
      result = chrome.i18n.getMessage("timeSec", [0]);

    return $.trim(result);
  }
};

function updateTimers(){
  $(".countdown-timer").each(function(index){
    var diff = $(this).attr("seconds-step") || -1;
    var sec = parseInt($(this).attr("seconds-left")) + parseInt(diff);

    if (!sec) gameStorage.markForUpdate();

    $(this).html(ENEXT.convertTime(sec));
    $(this).attr("seconds-left", sec);
  });

  gameStorage.updateIfNeeded();
}

$(function(){
  // Do nothing on json API page.
  if (location.search.includes("json=1")) return;
  // Do nothing if game is inactive
  if ($(".content .infomessage").length) return;
  // Do nothing if game is over
  if ($(".gameCongratulation").length) return;

  chrome.storage.local.get(
    {
      'selectSentCode': true,
      'enableSound': true,
      'autoFocus': true,
      'refreshRate': 5,
      'disableChat': false,

      'hideDisclosedSectors': false,
      'hideCompleteBonuses': false,
      'showCompleteBonusTask': false,
      'showCompleteBonusCode': false,

      'defaultPageActionTab': "engine",

      'deniedDomains': ""
    },
    function (result){
      gameStorage = new GameStorage();

      var domains = result.deniedDomains.split("|");

      // Set global values as default
      var option_key;
      var option_list = [
        'enable-sound',
        'refresh-rate',
        'auto-focus',
        'select-sent-code',
        'disable-chat',

        'hide-disclosed-sectors',
        'hide-complete-bonuses',
        'show-complete-bonus-task',
        'show-complete-bonus-code',

        'default-page-action-tab'
      ];
      for (option_key in option_list){
        var value = localStorage.getItem(`${gameStorage.getGameId()}-${option_list[option_key]}`);
        localStorage.setItem(
          `${gameStorage.getGameId()}-${option_list[option_key]}`,
          value != null ? value : result[snakeToCamelCase(option_list[option_key])]
        );
      }

      gameStorage.addCallbackObject(new GamePageAction());

      // Run extension only on allowed domains
      if (domains.includes(location.hostname)) return;

      gameStorage.addCallbackObject(new GamePrepare());
      gameStorage.addCallbackObject(new GameCodesManager());
      gameStorage.addCallbackObject(new GameLevelListManager());
      gameStorage.addCallbackObject(new GameTaskManager());
      gameStorage.addCallbackObject(new GameHintManager());
      gameStorage.addCallbackObject(new GameBonusManager());
      gameStorage.addCallbackObject(new GameMessagesManager());

      gameStorage.setErrorCallback(new GameErrors());

      gameStorage.update();

      setInterval(updateTimers, 1000);
    }
  );
});
