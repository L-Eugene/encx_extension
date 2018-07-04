var taskData = {
  task: "",
  title: "",
  sectors: {},
  updatedSectors: new Set(),
  sectorIds: new Set(),

  initialize: function(game){
    $("div.content")
      .append(this.titleTemplate(game))
      .append(this.sectorsTitleTemplate(game.Level))
      .append(this.sectorsTemplate(game.Level))
      .append($("<div>").addClass("spacer"))
      .append(this.taskTemplate(game.Level));

    this.task = game.Level.Tasks[0].TaskTextFormatted;
    this.title = `${game.Level.Number}/${game.Levels.length}`;
  },

  update: function(game){
    // Update task header
    if (`${game.Level.Number}/${game.Levels.length}` != this.title){
      $("div.content h2").replaceWith(this.titleTemplate(game));
    }

    // Update task text
    if (game.Level.Tasks[0].TaskTextFormatted != this.task){
      $("#task").replaceWith(this.taskTemplate(game.Level));
    }

    // Update sectors header
    if (game.Level.Sectors.length > 1){
      $("#sectors-total").html(game.Level.Sectors.length);
      $("#sectors-left").html(game.Level.SectorsLeftToClose);
    }

    // Update sectors
    this.updatedSectors.clear();
    game.Level.Sectors.forEach(this.updateSector, this);
    this.removeDisappeared();
  },

  removeDisappeared: function(){
    this.sectorIds.forEach(function(id){
      if (this.updatedSectors.has(id)) return;
      $(`#sector-${id}`).remove();
    }, this);

    ENEXT.copySet(this.sectorIds, this.updatedSectors);
  },

  sectorChanged: function (sector){
    return JSON.stringify(sector) != JSON.stringify(this.sectors[sector.SectorId]);
  },

  updateSector: function (sector){
    this.updatedSectors.add(sector.SectorId);

    if (sector.SectorId in this.sectors){
      if (this.sectorChanged(sector))
        $(`#sector-${sector.SectorId}`)
          .replaceWith(this.sectorTemplate(sector));
    } else {
      $("div#sectors").append(this.sectorTemplate(sector));
      this.sectorIds.add(sector.SectorId);
    }

    this.sectors[sector.SectorId] = sector;
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
          );

  },

  sectorsTemplate: function(level){
    return $("<div>")
      .attr("id", "sectors")
  },

  titleTemplate: function(game){
    return $("<h2>")
      .append("Уровень ")
      .append(
        $("<span>")
          .append(game.Level.Number)
      )
      .append(` из ${game.Levels.length}`)
      .append(
        $("<div>")
          .addClass("spacer")
      );
  },

  taskTemplate: function(level){
    return $("<div>")
      .attr("id", "task")
      .append(
        $("<h3>").append("Задание")
      )
      .append(
        $("<p>").append(level.Tasks[0].TaskTextFormatted)
      )
      .append(
        $("<div>")
          .addClass("spacer")
      );
  }
};

