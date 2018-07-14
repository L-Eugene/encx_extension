class GameBonusManager extends GameManager {
  initialize(storage){
    this.storage = storage;
    $("div.content").append("<div id='bonuses'></div>");
  }

  update(storage){
    $(".bonus-block").attr("delete-mark", true);
    storage.getBonuses().forEach(
      function(bonus){
        if (this.storage.isBonusNew(bonus.BonusId)){
          $("div#bonuses").append(this._bonusTemplate(bonus));
        } else if (this.storage.isBonusChanged(bonus.BonusId)){
          $(`div#bonus-${bonus.BonusId}`)
            .replaceWith(this._bonusTemplate(bonus));
        }

        $(`#bonus-${bonus.BonusId}`).attr("delete-mark", false);
        $(`#bonus-${bonus.BonusId} .tabs`).tabs();
      },
      this
    );
    $(".bonus-block[delete-mark=true]").remove();
  }

  _bonusInfoTemplate(bonus){
    return $("<span>")
      .addClass("color_sec")
      .append(`(${ENEXT.convertTimestamp(bonus.Answer.AnswerDateTime.Value)} `)
      .append(
        $("<a>")
          .attr("href", `/userdetails.aspx?uid=${bonus.Answer.UserId}`)
          .attr("target", "_blank")
          .append(bonus.Answer.Login)
      )
      .append(chrome.i18n.getMessage("bonusReward"))
      .append(
        ENEXT.convertTime(bonus.AwardTime)
      )
      .append(")");
  }

  _tabHeaderTemplate(title, href){
    return $("<li>")
      .append(
        $("<a>")
          .attr("href", href)
          .append(title)
      );
  }

  _tabBodyTemplate(id, text, clas=''){
    return $("<div>")
      .attr("id", id)
      .append(
        $("<p>")
          .addClass(clas)
          .append(text)
      )
  }

  _bonusOpenTemplate(bonus){
    return $("<div>")
      .addClass("tabs")
      .append(
        $("<ul>")
          .append(
            this._tabHeaderTemplate(
              chrome.i18n.getMessage("bonusTitleHint"),
              `#bonus-${bonus.BonusId}-hint`
            )
          )
          .append(
            this._tabHeaderTemplate(
              chrome.i18n.getMessage("bonusTitleTask"),
              `#bonus-${bonus.BonusId}-task`
            )
          )
          .append(
            this._tabHeaderTemplate(
              chrome.i18n.getMessage("bonusTitleAnswer"),
              `#bonus-${bonus.BonusId}-answer`
            )
          )
      )
      .append(
        this._tabBodyTemplate(`bonus-${bonus.BonusId}-hint`, bonus.Help)
      )
      .append(
        this._tabBodyTemplate(`bonus-${bonus.BonusId}-task`, bonus.Task)
      )
      .append(
        this._tabBodyTemplate(
          `bonus-${bonus.BonusId}-answer`,
          bonus.Answer.Answer,
          "color_correct"
        )
      );
  }

  _bonusClosedTemplate(bonus){
    return $("<div>")
      .addClass("tabs")
      .append(
        $("<ul>")
          .append(
            this._tabHeaderTemplate(
              chrome.i18n.getMessage("bonusTitleTask"),
              `#bonus-${bonus.BonusId}-task`
            )
          )
      )
      .append(
        this._tabBodyTemplate(`bonus-${bonus.BonusId}-task`, bonus.Task)
      )
  }

  _bonusExpiredTemplate(bonus){
    return $("<div>")
      .addClass("bonus-block")
      .addClass("color_dis")
      .attr("id", `bonus-${bonus.BonusId}`)
      .attr("id-numeric", bonus.BonusId)
      .attr("delete-mark", false)
      .css("order", bonus.Number)
      .append(
        $("<b>").append(
          chrome.i18n.getMessage("bonusNumber", [bonus.Number])
        )
      )
      .append(
        chrome.i18n.getMessage("bonusExpiredMessage")
      )
  }

  _bonusWaitingTemplate(bonus){
    return $("<div>")
      .addClass("bonus-block")
      .addClass("color_dis")
      .attr("id", `bonus-${bonus.BonusId}`)
      .attr("id-numeric", bonus.BonusId)
      .attr("delete-mark", false)
      .css("order", bonus.Number)
      .append(
        $("<b>").append(
          chrome.i18n.getMessage("bonusNumber", [bonus.Number])
        )
      )
      .append(this._timerTemplate(bonus.SecondsToStart))
  }

  _bonusTemplate(bonus){
    if (bonus.SecondsToStart > 0) return this._bonusWaitingTemplate(bonus);
    if (bonus.Expired == true) return this._bonusExpiredTemplate(bonus);
    return $("<div>")
      .addClass("bonus-block")
      .attr("id", `bonus-${bonus.BonusId}`)
      .attr("id-numeric", bonus.BonusId)
      .attr("delete-mark", false)
      .css("order", bonus.Number)
      .append(
        $("<h3>")
          .addClass(bonus.IsAnswered ? "color_correct" : "color_bonus")
          .append(
            bonus.Name != null
            ? chrome.i18n.getMessage(
                "bonusNumberName",
                [bonus.Number, bonus.Name]
              )
            : chrome.i18n.getMessage(
                "bonusNumber",
                [bonus.Number]
              )
          )
          .append(
            bonus.SecondsLeft > 0
            ? $("<span>")
                .addClass("color_sec")
                .append(" (")
                .append(
                  this._timerTemplate(
                    bonus.SecondsLeft,
                    chrome.i18n.getMessage("timerLeft")
                  )
                )
                .append(")")
            : ""
          )
          .append(
            bonus.IsAnswered
              ? $("<span>")
                  .addClass("color_sec")
                  .append(this._bonusInfoTemplate(bonus))
              : ""
          )
      )
      .append(
        bonus.IsAnswered
          ? this._bonusOpenTemplate(bonus)
          : this._bonusClosedTemplate(bonus)
      )
      .append(
        $("<div>").addClass("spacer")
      );
  }
};
