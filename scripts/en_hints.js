var hintData = {
  hints: {},

  initialize: function (level){
    this.hints = {};
    $("div.content").append("<div id='hints'></div>")
  },

  hintChanged: function (hint){
    return JSON.stringify(hint) != JSON.stringify(this.hints[hint.HintId]);
  },

  update: function (level){
    $(".hint-block").attr("delete-mark", "true");
    level.Helps.forEach(this.updateHint, this);
    level.PenaltyHelps.forEach(this.updateHint, this);
    $(".hint-block[delete-mark=true]").each(
      function (){
        delete hintData.hints[$(this).attr("id-numeric")];
        $(this).remove();
      }
    );
  },

  updateHint: function (hint){
    if (hint.HelpId in this.hints){
      if (this.hintChanged(hint))
        $(`#hint-${hint.HelpId}`).replaceWith(this.hintTemplate(hint));
    } else {
      $("div#hints")
        .append(this.hintTemplate(hint));
    }

    $(`#hint-${hint.HelpId}`).attr("delete-mark", "false");
    this.hints[hint.HelpId] = hint;
  },

  hintTemplate: function (hint){
    return $("<div>")
      .addClass("hint-block")
      .addClass(hint.RemainSeconds ? "color_dis" : "")
      .attr("id", `hint-${hint.HelpId}`)
      .attr("id-numeric", hint.HelpId)
      .attr("delete-mark", false)
      // Penalty hints should go last
      .css("order", hint.Number + (hint.IsPenalty ? 10000 : 0))
      .append(
        $(hint.RemainSeconds ? "<b>" : "<h3>")
          .append(hint.IsPenalty ? "Штрафная подсказка " : "Подсказка ")
          .append(hint.Number)
      )
      .append(
        hint.RemainSeconds
          ? this.timerTemplate(hint)
          : this.bodyTemplate(hint)
      )
      .append(
        $("<div>").addClass("spacer")
      );
  },

  bodyTemplate: function (hint){
    if (!hint.IsPenalty) return $("<p>").append(hint.HelpText);

    return $("<p>")
      .append(
        $("<p>")
          .append(
            $("<b>").append("Описание подсказки: ")
          )
          .append(hint.PenaltyComment)
          .append(
            $("<div>").addClass("spacer")
          )
      )
      .append(
        hint.HelpText
          ? hint.HelpText 
          : this.openPenaltyTemplate(hint)
      );
  },

  openPenaltyTemplate: function (hint){
    return $("<button>")
      .addClass("ui-button ui-widget ui-corner-all")
      .attr("id", hint.HelpId)
      .attr("confirm", hint.RequestConfirm)
      .click(function (){
        if (
          $(this).attr("confirm") == "false" ||
          confirm(`За просмотр этой подсказки вам будет начислено ${ENEXT.convertTime(hint.Penalty)} штрафного времени.\nВы уверены, что хотите её открыть?`)
        ){
          $.get(`${getCleanGameURL()}?pid=${$(this).attr("id")}&pact=1`);
        }
      })
      .append(`Взять подсказку (штраф ${ENEXT.convertTime(hint.Penalty)})`)
  },

  timerTemplate: function (hint){
    return $("<span>")
      .append(" будет через ")
      .append(
        $("<span>")
          .addClass("countdown-timer")
          .attr("seconds-left", hint.RemainSeconds)
          .append(ENEXT.convertTime(hint.RemainSeconds))
      );
  }
};

