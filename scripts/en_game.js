// Stored answer from API
var gameObj = {
  data: {},
  updateTimer: null,

  levelId: function (game) { return game.Level.LevelId; },
  topActionId: function (game) { return game.Level.MixedActions[0].ActionId; },

  isLevelUp: function (newData){
    if (this.noData()) return false;
    return this.levelId(this.data) != this.levelId(newData);
  },

  isHistoryUpdated: function (newData){
    if (this.noData()) return true;
    return this.topActionId(this.data) != this.topActionId(newData);
  },

  noData: function (){
    return $.isEmptyObject(this.data);
  }
};

var ENEXT = {
  // Convert Encounter timestamp to readable date
  convertTimestamp: function (ts){
    var d = new Date(ts);
    d.setFullYear(d.getFullYear() - 1969);
    return d.toLocaleString();
  },

  // Split value in seconds into D H:M:S
  convertTime: function(sec){
    var result = `${sec % 60} с`;
    sec = Math.floor(sec / 60);

    if (sec % 60 > 0){
      result = `${sec % 60} м ${result}`;
    }
    sec = Math.floor(sec / 60);

    if (sec % 24 > 0){
      result = `${sec % 24} ч ${result}`;
    }
    sec = Math.floor(sec / 24);

    if (sec > 0){
      result = `${sec} дн ${result}`;
    }

    return result;
  },

  // Replace all values in s1 with values from s2
  copySet: function(s1, s2){
    s1.clear();
    s2.forEach(function(x){ this.add(x); }, s1);
  }
};

function getCleanGameURL(){
  return `${location.protocol}//${location.hostname}${location.pathname}`;
}

function getGameURL(params = ""){
  return `${getCleanGameURL()}?json=1&${params}`;
}

// Update all page elements
function updateEnginePage(data){
  // Reload if level-up happened
  if (gameObj.isLevelUp(data)){
    document.location.reload(true);
  }

  if (gameObj.noData()){
    $("div.content").empty();
    taskData.initialize(data);
    hintData.initialize(data.Level);
    bonusData.initialize(data.Level.Bonuses);
  }

  // Update code history (if changed)
  if (gameObj.isHistoryUpdated(data)){
    codeFields.updateCodeHistory(data.Level.MixedActions);
  }

  taskData.update(data);
  hintData.update(data.Level);
  bonusData.update(data.Level.Bonuses);

  // TODO: update messages
  gameObj.data = data;
  console.log(data);
}

// onSubmit handler for code and bonus fields
function sendCode( event ){
  updateLevel({ data: event.data.hashMethod() }, "", false);

  event.preventDefault();
}

// API request
function updateLevel(data = {}, params="", repeat = true){
  $.ajax(
    getGameURL(params),
    $.extend(
      {},
      {
        dataType: "json",
        type: "POST",
        contentType: "application/json",
        success: updateEnginePage
      },
      data
    )
  );

  if (repeat) gameObj.updateTimer = setTimeout(updateLevel, 5000);
}

function updateTimers(){
  $(".countdown-timer").each(function(index){
    var sec = $(this).attr("seconds-left") - 1;

    if (!sec && gameObj.updateTimer !== null){
      clearTimeout(gameObj.updateTimer);
      gameObj.updateTimer = null
    }

    $(this).html(ENEXT.convertTime(sec));
    $(this).attr("seconds-left", sec);
  });

  if (gameObj.updateTimer === null) updateLevel();
}

$(function(){
  // Do nothing on json API page.
  if (location.search.includes("json=1")) return;

  // Enter codes without page reload
  $("input#Answer[name='LevelAction.Answer']").closest("form").submit(
    { hashMethod: codeFields.getCodeHash },
    sendCode
  );

  // Enter bonuses without page reload
  $("input#BonusAnswer[name='BonusAction.Answer']").closest("form").submit(
    { hashMethod: codeFields.getBonusHash },
    sendCode
  );

  setInterval(updateTimers, 1000);
});
