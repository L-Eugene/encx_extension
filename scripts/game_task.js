/*
MIT License

Copyright (c) 2018 Eugene Lapeko

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

class GameTaskManager extends GameManager {
  _titleUpdated(ln, lc){
    return this.title != `${ln}/${lc}`;
  }

  _openSectorList(sectors){
    var i, result = "";
    for (i = 0; i < sectors.length; i++){
      if (sectors[i].IsAnswered == false)
        result += `${(result != "") ? ", " : ""}${sectors[i].Name}`;
    }
    return result;
  }

  initialize(storage){
    this.storage = storage;

    $("div.content")
      .append(this._titleTemplate(storage.getGame()))
      .append(this._timeoutTemplate(storage.getLevel()))
      .append(this._sectorsTitleTemplate(storage.getLevel()))
      .append(this._sectorsTemplate(storage.getLevel()))
      .append($("<div>").addClass("spacer"))
      .append(this._taskTemplate(storage.getLevel()));

    this.task = storage.getTaskText();
    this.title = `${storage.getLevelNumber()}/${storage.getLevelCount()}`;
  }

  update(storage){
    // Update task header
    if (
      this._titleUpdated(storage.getLevelNumber(), storage.getLevelCount())
    ){
      $("div.level-length")
        .replaceWith(this._titleTemplate(storage.getGame()));
    }

    // Update timeout data
    if (storage.getTimeoutSecondsRemain() > 0){
      $("#timeout-block .countdown-timer.backward")
        .attr("seconds-left", storage.getTimeoutSecondsRemain());
        $("#timeout-block .countdown-timer.forward")
          .attr("seconds-left", storage.getTimeout() - storage.getTimeoutSecondsRemain());
    }

    // Update sectors header
    if (storage.getSectorNumber() > 1){
      $("#sectors-total").html(storage.getSectorNumber());
      $("#sectors-left").html(storage.getSectorsLeft());
      $("#sectors-left-list").html(
        this._openSectorList(storage.getSectors())
      );
      if (ENEXT.parseBoolean(
        localStorage.getItem(`${storage.getGameId()}-hide-disclosed-sectors`)
      )){
        $("#sectors-left-list-block").hide();
      } else {
        $("#sectors-left-list-block").show();
      }
    }

    // Update sectors
    $(".sector-block").attr("delete-mark", "true");
    storage.getSectors().forEach(
      function(sector, ind){
        if (this.storage.isSectorNew(sector.SectorId)){
          $("div#sectors").append(this._sectorTemplate(sector));
        } else if (this.storage.isSectorChanged(sector.SectorId)) {
          $(`#sector-${sector.SectorId}`)
            .replaceWith(this._sectorTemplate(sector));
        }

        $(`#sector-${sector.SectorId}`).attr("delete-mark", false);
      },
      this
    );
    $(".sector-block[delete-mark=true]").remove();
    if (storage.getSectors().length > 10){
      $("#sectors").addClass("sectors-column");
    } else {
      $("#sectors").removeClass("sectors-column");
    }

    // Update task text
    if (storage.getTaskText() != this.task){
      $("#task").replaceWith(this._taskTemplate(storage.getLevel()));
    }
  }

  _titleTemplate(game){
    return $("<div>")
      .addClass("level-length")
      .append(
        $("<h2>")
          .append(
            chrome.i18n.getMessage(
              "levelTitle",
              [
                game.Level.Number,
                game.Levels.length,
                game.Level.Name != "" ? `: ${game.Level.Name}`: ""
              ]
            )
          )
      )
      .append(
        $("<div>")
          .append(
            game.Level.Timeout > 0
              ? chrome.i18n.getMessage(
                  "levelDuration",
                  [ENEXT.convertTime(game.Level.Timeout)]
                )
              : chrome.i18n.getMessage("levelInfinite")
          )
      );
  }

  _timeoutTemplate(level){
    if (level.TimeoutSecondsRemain == 0) return $("<div class='spacer'></div>");
    return $("<h3>")
      .addClass("timer")
      .attr("id", "timeout-block")
      .append(chrome.i18n.getMessage("levelAutoUp"))
      .append(
        $("<span>")
          .addClass("countdown-timer backward")
          .attr("seconds-left", level.TimeoutSecondsRemain)
          .append(ENEXT.convertTime(level.TimeoutSecondsRemain))
      )
      .append(" ")
      .append(chrome.i18n.getMessage("levelOnLevelTime"))
      .append(
        $("<span>")
          .addClass("countdown-timer forward")
          .attr("seconds-left", level.Timeout - level.TimeoutSecondsRemain)
          .attr("seconds-step", +1)
          .append(ENEXT.convertTime(level.Timeout - level.TimeoutSecondsRemain))
      )
      .append()
      .append(
        level.TimeoutAward != 0
          ? chrome.i18n.getMessage(
              "levelAutoUpPenalty",
              [ENEXT.convertTime(-1*level.TimeoutAward)]
            )
          : ""
      )
      .append(
        $("<div>")
          .addClass("spacer")
      )
  }

  _sectorsTitleTemplate(level){
    if (level.Sectors.length < 2) return "";

    return $("<h3>")
      .append(
        chrome.i18n.getMessage(
          "sectorsCount",
          [
            level.Sectors.length,
            this.storage.getSectorsToClose(),
            level.SectorsLeftToClose
          ]
        )
      )
      .append("<br>")
      .append(
        $("<div>")
          .attr("id", "sectors-left-list-block")
          .append(
            chrome.i18n.getMessage(
              "sectorsDisclosed",
              [this._openSectorList(level.Sectors)]
            )
          )
      )
  }

  _sectorsTemplate(level){
    return $("<div>")
      .attr("id", "sectors")
  }

  _completeSectorTemplate(sector){
    return $("<span>")
      .addClass("color_correct")
      .append(sector.Answer.Answer)
      .append("&nbsp;")
      .append(
        $("<span>")
          .addClass("color_sec")
          .append("(")
          .append(ENEXT.convertTimestamp(sector.Answer.AnswerDateTime.Value))
          .append("&nbsp;")
          .append(
            $("<a>")
              .attr("href", `/userdetails.aspx?uid=${sector.Answer.UserId}`)
              .attr("target", "_blank")
              .append(sector.Answer.Login)
          )
          .append(")")
      )
  }

  _incompleteSectorTemplate(sector){
    return $("<span>")
      .addClass("color_dis")
      .append(chrome.i18n.getMessage("sectorDisclosed"));
  }

  _sectorTemplate(sector){
    return $("<p>")
      .addClass("sector-block")
      .attr("id", `sector-${sector.SectorId}`)
      .attr("id-numeric", sector.SectorId)
      .attr("delete-mark", false)
      .append(`${sector.Name}: `)
      .append(
        sector.IsAnswered
          ? this._completeSectorTemplate(sector)
          : this._incompleteSectorTemplate(sector)
      );
  }

  _taskTemplate(level){
    var result = $("<div>")
      .attr("id", "task")
      .append(encx_tpl.documentWriteOverride("#task p"));
    if (level.Tasks.length == 0) return result;

    return result
      .append(
        $("<h3>").append(chrome.i18n.getMessage("titleTask"))
      )
      .append(
        $("<p>")
          .append(level.Tasks[0].TaskTextFormatted)
      )
      .append(
        $("<div>")
          .addClass("spacer")
      )
      .append(encx_tpl.documentWriteRollback());
  }
}
