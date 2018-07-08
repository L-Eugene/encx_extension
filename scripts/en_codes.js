// Methods to work with code/bonus fields and code history.
var codeFields = {
  actionIds: new Set(),
  lastActionId: -1,

  getCodeHash: function (){
    return JSON.stringify({
      LevelID: $('input[name="LevelId"]').val(),
      LevelAction: {
        Answer: $('input#Answer[name="LevelAction.Answer"]').val()
      }
    });
  },

  getBonusHash: function (){
    return JSON.stringify({
      LevelID: $('input[name="LevelId"]').val(),
      BonusAction: {
        Answer: $('input#BonusAnswer[name="BonusAction.Answer"]').val()
      }
    });
  },

  initialize: function(game){
    if ($("input#Answer").length){
      $("input#Answer").parent().remove();
    }
    $(".aside .blocked").remove();

    $("#lnkAnswerBoxMarker")
      .after(this.inputFieldTemplate(game))
      .after(this.blockMarkerTemplate());
    $("#answer-box #Answer").focus();

    $('ul.history').empty();

    this.actionIds.clear();
    this.lastActionId = -1;
  },

  updateCodeHistory: function (actions){
    if (actions.length > 0 && actions[0].ActionId != this.lastActionId){
      $("ul.history .last_action").remove();
    }
    actions.reverse().forEach(this.addHistoricCode, this);
  },

  updateLastStatus: function (action){
    if (action.LevelAction.Answer || action.BonusAction.Answer)
      $("ul.history").prepend(this.lastActionTemplate(action));
  },

  addHistoricCode: function (action){
    if (!this.actionIds.has(action.ActionId)) {
      $('ul.history').prepend(this.actionTemplate(action));
      this.actionIds.add(action.ActionId);
      this.lastActionId = action.ActionId;
    }
  },

  actionTemplate: function (action){
    return $('<li>')
      .addClass(action.IsCorrect ? 'correct' : '' )
      .append(action.LocDateTime)
      .append('&nbsp;')
      .append(
        $('<a>')
          .attr('href', '/userdetails.aspx?uid=' + action.UserId)
          .append(action.Login)
      )
      .append('&nbsp;')
      .append(
        $('<span>').addClass(
          // data.Level.MixedActions[any].Kind:
          //   1 - code
          //   2 - bonus
          action.IsCorrect ? 
            'color_' + (action.Kind == 1 ? 'correct' : 'bonus') : ''
        ).append(action.Answer)
      );
  },

  lastActionUniversalTemplate: function (action, correct_style){
    return $("<li>")
      .addClass(action.IsCorrectAnswer ? correct_style : "color_incorrect")
      .addClass("last_action")
      .append(
        action.IsCorrectAnswer
          ? "Ответ или код верный"
          : "Ответ или код неверный"
      )
  },

  lastActionTemplate: function (action){
    if (action.LevelAction.Answer)
      return this.lastActionUniversalTemplate(action.LevelAction, "color_correct");
    return this.lastActionUniversalTemplate(action.BonusAction, "color_bonus");
  },

  inputFieldTemplate: function(data){
    return $("<form>")
      .attr("id", "answer-box")
      .append(
        $("<input>")
          .attr("type", "hidden")
          .attr("name", "LevelId")
          .attr("value", data.Level.LevelId)
      )
      .append(
        $("<input>")
          .attr("type", "hidden")
          .attr("name", "LevelNumber")
          .attr("value", data.Level.Number)
      )
      .append(
        $("<input>")
          .addClass("placeholder")
          .attr("id", "Answer")
          .attr("name", "LevelAction.Answer")
          .attr("maxlength", 4000)
          .attr("tabindex", 1)
          .attr("placeholder", "Введите ответ или код")
          .attr("value", "")
          .attr("type", "text")
      )
      .append(
        $("<div>")
          .addClass("hint")
          .addClass("blockageinfo")
      )
      .append(
        $("<label>")
          .addClass("hidden")
          .attr("for", "Answer")
          .append("Введите ответ или код и нажмите Enter")
      )
      .submit(
        { hashMethod: codeFields.getCodeHash },
        sendCode
      );
  },

  blockMarkerTemplate: function(){
    return $("<div>")
      .addClass("blocked")
      .attr("id", "input-blockage")
      .append(
        $("<div>")
          .append("вы сможете ввести код через ")
          .append(
            $("<span>")
              .addClass("countdown-timer")
              .attr("seconds-left", -1)
          )
      )
      .hide()
  }
};

