var taskData = {
  task: "",
  title: "",
  sectors: {},

  initialize: function(game){
    $("div.content")
      .append(this.titleTemplate(game))
      .append(this.timeoutTemplate(game.Level))
      .append(this.sectorsTitleTemplate(game.Level))
      .append(this.sectorsTemplate(game.Level))
      .append($("<div>").addClass("spacer"))
      .append(this.taskTemplate(game.Level));

    this.task = (0 in game.Level.Tasks) ? game.Level.Tasks[0].TaskTextFormatted : "";
    this.title = `${game.Level.Number}/${game.Levels.length}`;
    this.sectors = {};
  },

  update: function(game){
    // Update task header
    if (`${game.Level.Number}/${game.Levels.length}` != this.title){
      $("div.content h2").replaceWith(this.titleTemplate(game));
    }

    // Update task text
    var t = (0 in game.Level.Tasks) ? game.Level.Tasks[0].TaskTextFormatted : "";
    if (t != this.task){
      $("#task").replaceWith(this.taskTemplate(game.Level));
    }

    // Update sectors header
    if (game.Level.Sectors.length > 1){
      $("#sectors-total").html(game.Level.Sectors.length);
      $("#sectors-left").html(game.Level.SectorsLeftToClose);
      $("#sectors-left-list").html(this.openSectorList(game.Level.Sectors));
    }

    // Update sectors
    $(".sector-block").attr("delete-mark", "true");
    game.Level.Sectors.forEach(this.updateSector, this);
    $(".sector-block[delete-mark=true]").each(
      function (){
        delete taskData.sectors[$(this).attr("id-numeric")];
        $(this).remove();
      }
    );
  },

  sectorChanged: function (sector){
    return JSON.stringify(sector) != JSON.stringify(this.sectors[sector.SectorId]);
  },

  updateSector: function (sector){
    if (sector.SectorId in this.sectors){
      if (this.sectorChanged(sector))
        $(`#sector-${sector.SectorId}`)
          .replaceWith(this.sectorTemplate(sector));
    } else {
      $("div#sectors").append(this.sectorTemplate(sector));
    }

    $(`#sector-${sector.SectorId}`).attr("delete-mark", false);
    this.sectors[sector.SectorId] = sector;
  },

  openSectorList: function(sectors){
    var i, result = "";
    for (i = 0; i < sectors.length; i++){
      if (sectors[i].IsAnswered == false)
        result += `${(result != "") ? ", " : ""}${sectors[i].Name}`;
    }
    return result;
  },

  completeSectorTemplate: function(sector){
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
  },

  incompleteSectorTemplate: function(sector){
    return $("<span>")
      .addClass("color_dis")
      .append("код не введён");
  },

  sectorTemplate: function(sector){
    return $("<p>")
      .addClass("sector-block")
      .attr("id", `sector-${sector.SectorId}`)
      .attr("id-numeric", sector.SectorId)
      .attr("delete-mark", false)
      .append(`${sector.Name}: `)
      .append(
        sector.IsAnswered
          ? this.completeSectorTemplate(sector)
          : this.incompleteSectorTemplate(sector)
      );
  },

  sectorsTitleTemplate: function(level){
    if (level.Sectors.length < 2) return "";

    return $("<h3>")
      .append("На уровне ")
      .append(
        $("<span>")
          .attr("id", "sectors-total")
          .append(level.Sectors.length)
      )
      .append(" секторов ")
      .append(
        $("<span>")
          .addClass("color_sec")
          .append("(осталось закрыть ")
          .append(
            $("<span>")
              .attr("id", "sectors-left")
              .append(level.SectorsLeftToClose)
          )
          .append(")")
      )
      .append("<br>")
      .append("Незакрытые сектора: ")
      .append(
        $("<span>")
          .attr("id", "sectors-left-list")
          .append(this.openSectorList(level.Sectors))
      );
  },

  sectorsTemplate: function(level){
    return $("<div>")
      .attr("id", "sectors")
  },

  titleTemplate: function(game){
    return $("<div>")
      .append(
        $("<h2>")
          .append("Уровень ")
          .append(
            $("<span>")
              .append(game.Level.Number)
          )
          .append(` из ${game.Levels.length}`)
          .append(
            game.Level.Name != ""
              ? `: ${game.Level.Name}`
              : ""
          )
      )
      .append(
        $("<div>")
          .append(
            game.Level.Timeout > 0
              ? `<b>Продолжительность уровня</b> ${ENEXT.convertTime(game.Level.Timeout)}`
              : "<b>Уровень без автоперехода</b>"
          )
      );
  },

  timeoutTemplate: function (level){
    if (level.TimeoutSecondsRemain == 0) return $("<div class='spacer'></div>");
    return $("<h3>")
      .addClass("timer")
      .attr("id", "timeout-block")
      .append(
        $("<strong>")
          .append("Автопереход ")
      )
      .append(" на следующий уровень через ")
      .append(
        $("<span>")
          .addClass("countdown-timer")
          .attr("seconds-left", level.TimeoutSecondsRemain)
          .append(ENEXT.convertTime(level.TimeoutSecondsRemain))
      )
      .append(
        level.TimeoutAward != 0
          ? ` (штраф ${ENEXT.convertTime(-1*level.TimeoutAward)})`
          : ""
      )
      .append(
        $("<div>")
          .addClass("spacer")
      )
  },

  taskTemplate: function(level){
    return $("<div>")
      .attr("id", "task")
      .append(
        $("<h3>").append("Задание")
      )
      .append(
        (0 in level.Tasks)
          ? $("<p>").append(level.Tasks[0].TaskTextFormatted)
          : ""
      )
      .append(
        $("<div>")
          .addClass("spacer")
      );
  }
};

