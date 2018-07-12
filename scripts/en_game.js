var gameStorage = null;
var levelstat_refresh = null;

var ENEXT = {
  // Convert Encounter timestamp to readable date
  convertTimestamp: function (ts){
    var d = new Date(ts);
    d.setFullYear(d.getFullYear() - 1969);
    return d.toLocaleString();
  },

  // Split value in seconds into D H:M:S
  convertTime: function(sec){
    var result = "";

    if (sec % 60 > 0){
      result = chrome.i18n.getMessage("timeSec", sec%60);
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
      result = chrome.i18n.getMessage("timeSec", 0);

    return $.trim(result);
  },
};

function getLevelStatURL(){
  return `${location.protocol}//${location.hostname}/LevelStat.aspx?level=${gameStorage.getLevelNumber()}&gid=${gameStorage.getGameId()}&rnd=${Math.random()}`;
}

function updateTimers(){
  $(".countdown-timer").each(function(index){
    var sec = $(this).attr("seconds-left") - 1;

    if (!sec) gameStorage.markForUpdate();

    $(this).html(ENEXT.convertTime(sec));
    $(this).attr("seconds-left", sec);
  });

  gameStorage.updateIfNeeded();
}

function showLevelStat(event){
  event.preventDefault();

  $("<div>")
    .attr("id", "dialog")
    .attr("title", chrome.i18n.getMessage("levelStatTitle"))
    .append(
      $("<iframe>")
        .attr("src", getLevelStatURL())
        .attr("frameborder", 0)
        .attr("marginwidth", 0)
        .attr("marginheight", 0)
    )
    .dialog({
      autoOpen: true,
      modal: false,
      width: 700,
      height: 420,
      close: function (){
        clearInterval(levelstat_refresh);
        $(".levelstats div#dialog").remove();
      }
    });

  levelstat_refresh = setInterval(refreshLevelStat, 20000);
}

function refreshLevelStat(){
  $("div#dialog iframe").attr("src", getLevelStatURL());
}

$(function(){
  // Do nothing on json API page.
  if (location.search.includes("json=1")) return;
  // Do nothing if game is inactive
  if ($(".content .infomessage").length) return;
  // Do nothing if game is over
  if ($(".gameCongratulation").length) return;

  gameStorage = new GameStorage();
  gameStorage.addCallbackObject(new GameEventManager());
  gameStorage.addCallbackObject(new GamePrepare());
  gameStorage.addCallbackObject(new GameCodesManager());
  gameStorage.addCallbackObject(new GameLevelListManager());
  gameStorage.addCallbackObject(new GameTaskManager());
  gameStorage.addCallbackObject(new GameHintManager());
  gameStorage.addCallbackObject(new GameBonusManager());
  gameStorage.addCallbackObject(new GameMessagesManager());
  gameStorage.update();

  setInterval(updateTimers, 1000);
});
