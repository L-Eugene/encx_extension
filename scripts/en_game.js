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
var dialogWindows = {
  gameConfig: false
};

var ENEXT = {
  // Convert Encounter timestamp to readable date
  convertTimestamp: function (ts){
    var d = new Date(ts);
    d.setFullYear(d.getFullYear() - 1969);
    return d.toLocaleString();
  },

  parseBoolean:function (value){
    switch (typeof value){
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
  },
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
    {'deniedDomains': ""},
    function (result){
      var domains = result.deniedDomains.split("|");
      // Run extension only on allowed domains
      if (!domains.includes(location.hostname)){
        gameStorage = new GameStorage();

        gameStorage.addCallbackObject(new GameEventManager());
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
    }
  );
});
