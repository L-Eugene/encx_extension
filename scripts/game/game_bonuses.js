/*
MIT License

Copyright (c) 2018-2020 Eugene Lapeko

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

class GameBonusManager extends GameManager {
  initialize(storage){
    $("div.content").append("<div id='bonuses'></div>");
  }

  update(storage){
    this.hideBonuses = isOptionTrue(`${this.storage.getGameId()}-hide-complete-bonuses`);
    this.showBonusTask = isOptionTrue(`${this.storage.getGameId()}-show-complete-bonus-task`);

    $(".bonus-block").attr("delete-mark", true);
    storage.getBonuses().forEach(
      function(bonus){
        if (this.storage.isBonusNew(bonus.BonusId)){
          $("div#bonuses").append(this._bonusTemplate(bonus));
          this.attachScripts();
        } else if (
          this.storage.isBonusChanged(bonus.BonusId) ||
          $(`div#bonus-${bonus.BonusId}`).attr("update-mark")
        ){
          $(`div#bonus-${bonus.BonusId}`)
            .replaceWith(this._bonusTemplate(bonus));
          this.attachScripts();
        }

        $(`#bonus-${bonus.BonusId}`).attr("delete-mark", false);
        $(`#bonus-${bonus.BonusId} .tabs`).tabs();

        $(`#bonus-${bonus.BonusId}.bonus-waiting .countdown-timer`)
          .attr("seconds-left", bonus.SecondsToStart);
        $(`#bonus-${bonus.BonusId} .bonus-countdown .countdown-timer`)
          .attr("seconds-left", bonus.SecondsLeft);
      },
      this
    );
    $(".bonus-block[delete-mark=true]").remove();

    // Bonuses on current level summary
    $("li.enext-bonuses")
      .attr(
        "title",
        chrome.i18n.getMessage(
          "bonusesClosedSummary",
          storage.getCompletedBonusesData()
        )
      )
      .tooltip();

    // Adjust iframe sizes
    $("div#bonuses iframe.bonus-task-frame").each(
      function(ind, frame){
        frame.onload = function(){
          this.height = this.contentWindow.document.body.scrollHeight + 1;
          this.width = this.contentWindow.document.body.scrollWidth;
        }
      }
    );

    this.hideBonuses ? $(".bonus-answered").hide() : $(".bonus-answered").show();
  }

  _bonusInfoTemplate(bonus){
    return $("<span>")
      .addClass(bonus.Negative ? "color_pen" : "color_sec")
      .append(" (")
      .append(chrome.i18n.getMessage("bonusCompleted"))
      .append(() => {
        if (bonus.AwardTime === 0) {
          return "";
        }

        const prefix = chrome.i18n.getMessage(bonus.Negative ? "bonusPenalty" : "bonusReward");
        const time = ENEXT.convertTime(bonus.AwardTime);
        return `, ${prefix} ${time}`;
      })
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
    const id = `bonus-${bonus.BonusId}-hint`;
    return [
      $("<div>")
        .addClass("spacer_answer"),

      $("<span>")
          .addClass("answer_bonus")
          .append(`✅ `)
          .append(` ${ENEXT.convertTimestamp(bonus.Answer.AnswerDateTime.Timestamp)} `)
          .append(bonus.Answer.Login)
          .append(" [ ")
          .append(
            $("<span>")
              .addClass("color_bonus")
              .text(bonus.Answer.Answer)
          )
          .append(" ]"),
      $("<div>")
        .addClass("bonus")
        .append(
          $("<div>")
            .addClass("bonus-hint")
            .attr("id", id)
            .append(this.extractScripts((bonus.Help || '').replace(/\r?\n/g, "<br>"), id))
        )
        .append(
          (this.showBonusTask && (bonus.Task || '').length > 0)
            ? $("<div>")
                .addClass("bonus-task")
                .attr("id", `bonus-${bonus.BonusId}-task`)
                .append(
                  encx_tpl.iframeSandbox(
                    (bonus.Task || '').replace(/\r?\n/g, "<br>")
                  )
                )
            : ''
        )
      ];
  }

  _bonusClosedTemplate(bonus){
    const id = `bonus-${bonus.BonusId}-task`;
    return $("<div>")
      .addClass("bonus")
      .append(
        $("<div>")
          .addClass("bonus-task")
          .attr("id", id)
          .append(this.extractScripts((bonus.Task || '').replace(/\r?\n/g, "<br>"), id))
      );
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
      .addClass("bonus-block color_dis bonus-waiting")
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
      .addClass(bonus.IsAnswered ? "bonus-answered" : "")
      .attr("id", `bonus-${bonus.BonusId}`)
      .attr("id-numeric", bonus.BonusId)
      .attr("delete-mark", false)
      .css("order", bonus.Number)
      .append(
        $("<h3>")
          .addClass(bonus.IsAnswered ? "color_correct" : "color_bonus")
          .append(
            bonus.Name != null
            ? document.createTextNode(chrome.i18n.getMessage(
                "bonusNumberName",
                [bonus.Number, bonus.Name]
              ))
            : chrome.i18n.getMessage(
                "bonusNumber",
                [bonus.Number]
              )
          )
          .append(
            bonus.SecondsLeft > 0
            ? $("<span>")
                .addClass("color_sec bonus-countdown")
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
              ? this._bonusInfoTemplate(bonus)
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
