class GameHintManager extends GameManager {
  initialize(storage){
    this.storage = storage;
    $("div.content").append("<div id='hints'></div>");
  }

  update(storage){
    $(".hint-block").attr("delete-mark", "true");
    storage.getAllHelps().forEach(
      function(hint){
        if (this.storage.isHintNew(hint.HelpId)){
          $("div#hints").append(this._hintTemplate(hint));
        } else if (this.storage.isHintChanged(hint.HelpId)) {
          $(`#hint-${hint.HelpId}`).replaceWith(this._hintTemplate(hint));
        }

        $(`#hint-${hint.HelpId}`).attr("delete-mark", "false");
      },
      this
    );
    $(".hint-block[delete-mark=true]").remove();
  }

  _hintTemplate(hint){
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
          .append(
            hint.IsPenalty
              ? chrome.i18n.getMessage("hintPenaltyTitle", hint.Number)
              : chrome.i18n.getMessage("hintTitle", hint.Number)
          )
      )
      .append(
        hint.RemainSeconds
          ? this._timerTemplate(hint.RemainSeconds)
          : this._bodyTemplate(hint)
      )
      .append(
        $("<div>").addClass("spacer")
      );
  }

  _bodyTemplate(hint){
    if (!hint.IsPenalty) return $("<p>").append(hint.HelpText);

    return $("<p>")
      .append(
        $("<p>")
          .append(
            chrome.i18n.getMessage(
              "hintPenaltyDescription",
              hint.PenaltyComment
            )
          )
          .append(
            $("<div>").addClass("spacer")
          )
      )
      .append(
        hint.HelpText
          ? hint.HelpText
          : this._openPenaltyTemplate(hint)
      );
  }

  _openPenaltyTemplate(hint){
    return $("<button>")
      .addClass("ui-button ui-widget ui-corner-all")
      .attr("id", hint.HelpId)
      .attr("url", this.storage.getCleanURL())
      .attr("confirm", hint.RequestConfirm)
      .click(function (){
        if (
          $(this).attr("confirm") == "false" ||
          confirm(
            chrome.i18n.getMessage(
              "hintPenaltyConfirm",
              ENEXT.convertTime(hint.Penalty)
            )
          )
        ){
          $.get(`${$(this).attr("url")}?pid=${$(this).attr("id")}&pact=1`);
        }
      })
      .append(
        chrome.i18n.getMessage(
          "hintPenaltyButton",
          ENEXT.convertTime(hint.Penalty)
        )
      )
  }
};
