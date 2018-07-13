class GameCodesManager extends GameManager {
  constructor(){
    super();
    
    this.actionIds = new Set();
    this.storage = null;
  }

  initialize(storage){
    this.storage = storage;

    if ($("input#Answer").length){
      $("input#Answer").parent().remove();
    }
    $(".aside .blocked").remove();
    $("#input-blockage").remove();

    $("#lnkAnswerBoxMarker")
      .after(this._inputFieldTemplate(storage.getGame()))
      .after(this._blockMarkerTemplate());
    $("#answer-box #Answer").focus();

    // Enter codes without page reload
    $("input#Answer[name='LevelAction.Answer']").closest("form").submit(
      { type: "Level", storage: this.storage },
      this.storage.sendCode
    );

    // Enter bonuses without page reload
    $("input#BonusAnswer[name='BonusAction.Answer']").closest("form").submit(
      { type: "Bonus", storage: this.storage },
      this.storage.sendCode
    );

    $('ul.history').empty();

    this.actionIds.clear();
  }

  update(storage){
    var actions = storage.getHistoryActions();
    var engineAction = storage.getEngineAction();

    if (storage.isHistoryChanged()){
      if (actions.length > 0) $("ul.history .last_action").remove();

      actions.reverse().forEach(
        // Insert historic action to block if it was not inserted before
        function(action){
          if (!this.actionIds.has(action.ActionId)) {
            $('ul.history').prepend(this._historicActionTemplate(action));
            this.actionIds.add(action.ActionId);
          }
        },
        this
      );

      // Show result for entered code if any
      if (engineAction.LevelAction.Answer){
        $("ul.history").prepend(
          this._lastActionTemplate(engineAction.LevelAction, "color_correct")
        );
      } else if (engineAction.BonusAction.Answer) {
        $("ul.history").prepend(
          this._lastActionTemplate(engineAction.BonusAction, "color_bonus")
        );
      }
    }

    // Update blockage info
    $(".aside .blockageinfo").html("");
    if (storage.isBlockage()){
      $(".blockageinfo")
        .append(
          chrome.i18n.getMessage(
            "blockDescription",
            [
              storage.getBlockAttemtsNumber(),
              ENEXT.convertTime(storage.getBlockAttemtsPeriod()),
              storage.getBlockTargetText()
            ]
          )
        )
    }

    // Update input field block display
    if (storage.isBlocked()){
      $("#input-blockage .countdown-timer")
        .attr("seconds-left", storage.getBlockDuration());
      $("#input-blockage").show();
      $("#answer-box #Answer").val("");
      $("#answer-box").hide();
    } else {
      // If block is inactive - hide block message
      $("#input-blockage .countdown-timer").attr("seconds-left", -1);
      $("#input-blockage").hide();
      $("#answer-box").show();
    }

    // Hide input fields for passed levels
    if (storage.isLevelPassed()){
      $("#answer-box").hide();
    } else if (!storage.isBlocked()) {
      $("#answer-box").show();
    }
  }

  _lastActionTemplate(action, correct_style){
    return $("<li>")
      .addClass(action.IsCorrectAnswer ? correct_style : "color_incorrect")
      .addClass("last_action")
      .append(
        action.IsCorrectAnswer
          ? chrome.i18n.getMessage("answerCorrect")
          : chrome.i18n.getMessage("answerIncorrect")
      )
  }

  _historicActionTemplate(action){
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
  }

  _inputFieldTemplate(data){
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
          .attr(
            "placeholder",
            chrome.i18n.getMessage("inputFieldPlaceholder")
          )
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
          .append(chrome.i18n.getMessage("inputFieldLabel"))
      )
  }

  _blockMarkerTemplate(){
    return $("<div>")
      .addClass("blocked")
      .attr("id", "input-blockage")
      .append(
        $("<div>")
          .append(chrome.i18n.getMessage("blockTimeoutMessage"))
          .append(
            $("<span>")
              .addClass("countdown-timer")
              .attr("seconds-left", -1)
          )
      )
      .hide()
  }
};
