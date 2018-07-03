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
  },

  sortDOM: function(sel1, sel2){
    var $h = $(sel1);
    var $s = $h.find(sel2).sort(function (a, b){
      return +$(a).attr('sort-value') - +$(b).attr('sort-value');
    });
    $h.empty().append($s);
  }
};

var hintData = {
  hints: {},
  hintIds: new Set(),
  updatedHints: new Set(),
  sortHintsNeeded: false,

  initialize: function (level){
    $('div.content')
      .append('<div id="hints"></div>')
      .append('<div id="penalty-hints"></div>');
  },

  hintChanged: function (hint){
    return JSON.stringify(hint) != JSON.stringify(this.hints[hint.HintId]);
  },

  update: function (level){
    this.updatedHints.clear();
    level.Helps.forEach(this.updateHint, this);
    this.removeDisappeared();

    // Sorting hints on page
    if (this.sortHintsNeeded){
      ENEXT.sortDOM('div#hints', 'div.hint-block');
      this.sortHintsNeeded = false;
    }
  },

  updateHint: function (hint){
    if (hint.HelpId in this.hints){
      if (this.hintChanged(hint)){
        $(`#hint-${hint.HelpId}`).replaceWith(this.hintTemplate(hint));
        this.sortHintsNeeded = true;
      }
    } else {
      $('div#hints')
        .append(this.hintTemplate(hint));
      this.hintIds.add(hint.HelpId);

      this.sortHintsNeeded = true;
    }

    this.updatedHints.add(hint.HelpId);
    this.hints[hint.HelpId] = hint;
  },

  removeDisappeared: function(){
    this.hintIds.forEach(function(id){
      if (this.updatedHints.has(id)) return;
      $(`#hint-${id}`).remove();
    }, this);

    ENEXT.copySet(this.hintIds, this.updatedHints);
  },

  hintTemplate: function (hint){
    return $('<div>')
      .addClass('hint-block')
      .addClass(hint.RemainSeconds ? 'color_dis' : '')
      .attr('id', `hint-${hint.HelpId}`)
      .attr('sort-value', hint.Number)
      .append(
        $(hint.RemainSeconds ? '<b>' : '<h3>')
          .append(`Подсказка ${hint.Number}`)
      )
      .append(
        hint.RemainSeconds
          ? this.timerTemplate(hint)
          : $('<p>').append(hint.HelpText)
      )
      .append(
        $('<div>').addClass('spacer')
      );
  },

  timerTemplate: function (hint){
    return $('<span>')
      .append(' будет через ')
      .append(
        $('<span>')
          .addClass('countdown-timer')
          .attr('seconds-left', hint.RemainSeconds)
          .append(ENEXT.convertTime(hint.RemainSeconds))
      );
  }
};

function getGameURL(){
  return location.href + (location.search.length ? '&' : '?') + "json=1";
}

// Update all page elements
function updateEnginePage(data){
  // Reload if level-up happened
  if (gameObj.isLevelUp(data)){
    document.location.reload(true);
  }

  if (gameObj.noData()){
    //$('div.content').empty();
    taskData.initialize(data);
    hintData.initialize(data.Level);
    // TODO: set penalty hints
    bonusData.initialize(data.Level.Bonuses);
  }

  // Update code history (if changed)
  if (gameObj.isHistoryUpdated(data)){
    codeFields.updateCodeHistory(data.Level.MixedActions);
  }

  taskData.update(data);
  hintData.update(data.Level);
  // TODO: update penalty hints
  bonusData.update(data.Level.Bonuses);

  // TODO: update messages
  gameObj.data = data;
  console.log(data);
}

// onSubmit handler for code and bonus fields
function sendCode( event ){
  updateLevel({ data: event.data.hashMethod() }, false);

  event.preventDefault();
}

// API request
function updateLevel(data = {}, repeat = true){
  $.ajax(
    getGameURL(),
    $.extend(
      {},
      {
        dataType: 'json',
        type: 'POST',
        contentType: 'application/json',
        success: updateEnginePage
      },
      data
    )
  );

  if (repeat) gameObj.updateTimer = setTimeout(updateLevel, 5000);
}

function updateTimers(){
  $('.countdown-timer').each(function(index){
    var sec = $(this).attr('seconds-left') - 1;

    if (!sec && gameObj.updateTimer !== null){
      clearTimeout(gameObj.updateTimer);
      gameObj.updateTimer = null
    }

    $(this).html(ENEXT.convertTime(sec));
    $(this).attr('seconds-left', sec);
  });

  if (gameObj.updateTimer === null) updateLevel();
}

$(function(){
  // Do nothing on json API page.
  if (location.search.includes('json=1')) return;

  // Enter codes without page reload
  $('input#Answer[name="LevelAction.Answer"]').closest('form').submit(
    { hashMethod: codeFields.getCodeHash },
    sendCode
  );

  // Enter bonuses without page reload
  $('input#BonusAnswer[name="BonusAction.Answer"]').closest('form').submit(
    { hashMethod: codeFields.getBonusHash },
    sendCode
  );

  updateLevel();
  setInterval(updateTimers, 1000);
});
