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

class GameHintManager extends GameManager {
  initialize(storage){
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

          this.playSound("audio/hint.mp3");
        }

        $(`#hint-${hint.HelpId}`).attr("delete-mark", "false");

        $(`#hint-${hint.HelpId} .countdown-timer`)
          .attr("seconds-left", hint.RemainSeconds);
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
      .append(encx_tpl.documentWriteOverride(`#hint-${hint.HelpId} p`))
      .append(
        $(hint.RemainSeconds ? "<b>" : "<h3>")
          .append(
            hint.IsPenalty
              ? chrome.i18n.getMessage("hintPenaltyTitle", [hint.Number])
              : chrome.i18n.getMessage("hintTitle", [hint.Number])
          )
      )
      .append(
        hint.RemainSeconds
          ? this._timerTemplate(hint.RemainSeconds)
          : this._bodyTemplate(hint)
      )
      .append(
        $("<div>").addClass("spacer")
      )
      .append(encx_tpl.documentWriteRollback());
  }

  _bodyTemplate(hint){
    if (!hint.IsPenalty) return $("<p>").append(hint.HelpText);

    return $("<p>")
      .append(
        $("<p>")
          .append(
            chrome.i18n.getMessage(
              "hintPenaltyDescription",
              [hint.PenaltyComment]
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
      .click(
        function (){
        if (
          $(this).attr("confirm") == "false" ||
          confirm(
            chrome.i18n.getMessage(
              "hintPenaltyConfirm",
              ENEXT.convertTime(hint.Penalty)
            )
          )
        ){
          var level = gameStorage.isStormGame()
            ? `&level=${gameStorage.getLevelNumber()}`
            : '';
          $.get(`${$(this).attr("url")}?pid=${$(this).attr("id")}&pact=1${level}`);
        }
      })
      .append(
        chrome.i18n.getMessage(
          "hintPenaltyButton",
          [ENEXT.convertTime(hint.Penalty)]
        )
      )
  }
};
