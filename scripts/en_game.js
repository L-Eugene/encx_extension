// Stored answer from API
var gameObj = {
  data: {},
  updateTimer: null,

  levelId: function (game) { return game.Level.LevelId; },
  topActionId: function (game) { 
    return (0 in game.Level.MixedActions) ? game.Level.MixedActions[0].ActionId : 0;
  },

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
var levelstat_refresh = null;
var code_input_field = null;

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
      result = `${sec % 60} с`;
    }
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

    if (result === "") result = "0 c";

    return $.trim(result);
  },
};

function getCleanGameURL(){
  return `${location.protocol}//${location.hostname}${location.pathname}`;
}

function getGameURL(params = ""){
  return `${getCleanGameURL()}?json=1&${params}`;
}

function getLevelStatURL(){
  return `${location.protocol}//${location.hostname}/LevelStat.aspx?level=${gameObj.data.Level.Number}&gid=${gameObj.data.GameId}&rnd=${Math.random()}`;
}

// Update all page elements
function updateEnginePage(data){
  // Reload if level-up happened
  if (gameObj.isLevelUp(data)){
    document.location.reload(true);
  }

  if (gameObj.noData()){
    var level_list = null;
    // Save level list for multi-level games
    if (data.LevelSequence == 3) level_list = $("div.content ul.section");

    // Initialize Level Input Field
    if ($("input#Answer").length){
      $("input#Answer").parent().remove();
    }
    $(".aside .blocked").remove();

    $("#lnkAnswerBoxMarker")
      .after(codeFields.inputFieldTemplate(data))
      .after(codeFields.blockMarkerTemplate());
    $("#answer-box #Answer").focus();

    $("div.content").empty();
    taskData.initialize(data);
    hintData.initialize(data.Level);
    bonusData.initialize(data.Level.Bonuses);
    messagesData.initialize(data.Level.Messages);

    // Put level list back for multi-level games
    if (data.LevelSequence == 3){
      $("div.content").prepend(level_list);
    }
  }

  // Update code history (if changed)
  if (gameObj.isHistoryUpdated(data)){
    codeFields.updateCodeHistory(data.Level.MixedActions);
    codeFields.updateLastStatus(data.EngineAction);
  }

  // Update block rule
  $(".aside .blockageinfo").html("");
  if (data.Level.HasAnswerBlockRule == true){
    $(".blockageinfo")
      .append(`Не более ${data.Level.AttemtsNumber} попыток за ${ENEXT.convertTime(data.Level.AttemtsPeriod)}`)
      .append(data.Level.BlockTargetId == 1 ? " для игрока" : "")
      .append(data.Level.BlockTargetId == 2 ? " для команды" : "")
  }

  if (data.Level.BlockDuration > 0){
    // If block is active - display block message
    $("#input-blockage .countdown-timer").attr("seconds-left", data.Level.BlockDuration);
    $("#input-blockage").show();
    $("#answer-box #Answer").val("");
    $("#answer-box").hide();
  } else {
    // If block is inactive - hide block message
    $("#input-blockage .countdown-timer").attr("seconds-left", -1);
    $("#input-blockage").hide();
    $("#answer-box").show();
  }


  taskData.update(data);
  hintData.update(data.Level);
  bonusData.update(data.Level.Bonuses);
  messagesData.update(data.Level.Messages);

  gameObj.data = data;
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

function showLevelStat(event){
  $("<div>")
    .attr("id", "dialog")
    .attr("title", "Статистика уровня")
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

  event.preventDefault();
}

function refreshLevelStat(){
  $("div#dialog iframe").attr("src", getLevelStatURL());
}

$(function(){
  // Do nothing on json API page.
  if (location.search.includes("json=1")) return;
  // Do nothing if game is inactive
  if ($(".content .infomessage").length) return;

  setInterval(updateTimers, 1000);

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

  // Prepare game menu
  $(".header li.mail").remove();
  $(".header li.discuss a").attr("target", "_blank");

  // Show level stat in dialog
  $(".levelstats a").click(showLevelStat);
});
