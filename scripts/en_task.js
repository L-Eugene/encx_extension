var taskData = {
  task: "",
  title: "",
  isStorm: false,
  sectors: {},
  activeLevel: -1,
  doRoll: null,
  levels: {},

  initialize: function(game){
    this.isStorm = (game.LevelSequence == 3);
    this.levels = {};
    this.activeLevel = game.Level.LevelId;

    $("div.content")
      .append(this.levelListTemplate(game))
      .append(this.titleTemplate(game))
      .append(this.timeoutTemplate(game.Level))
      .append(this.sectorsTitleTemplate(game.Level))
      .append(this.sectorsTemplate(game.Level))
      .append($("<div>").addClass("spacer"))
      .append(this.taskTemplate(game.Level));

    this.task = (0 in game.Level.Tasks) ? game.Level.Tasks[0].TaskTextFormatted : "";
    this.title = `${game.Level.Number}/${game.Levels.length}`;
    this.sectors = {};

    game.Levels.forEach(this.updateLevel, this);
    this.scrollToActive();
  },

  update: function(game){
    // Update task header
    if (`${game.Level.Number}/${game.Levels.length}` != this.title){
      $("div.level-length").replaceWith(this.titleTemplate(game));
    }

    // Update level list for storm games
    if (this.isStorm){
      this.activeLevel = game.Level.LevelId;
      game.Levels.forEach(this.updateLevel, this);
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

  levelChanged: function (level){
    return JSON.stringify(level) != JSON.stringify(this.levels[level.LevelId]);
  },

  updateLevel: function (level){
    if (level.LevelId in this.levels){
      if (this.levelChanged(level))
        $(`#level-${level.LevelId}`).replaceWith(this.levelTemplate(level));
    } else {
      $("#level-list ul").append(this.levelTemplate(level))
    }

    this.levels[level.LevelId] = level;
  },

  updateSector: function (sector){
    if (sector.SectorId in this.sectors){
      if (this.sectorChanged(sector))
        $(`#sector-${sector.SectorId}`).replaceWith(this.sectorTemplate(sector));
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
      .addClass("level-length")
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
  },

  levelListTemplate: function(game){
    if (!this.isStorm) return "";

    return $("<div>")
      .attr("id", "level-list")
      .append(
        $("<a>")
          .addClass("navigation previous")
          .append("&laquo;")
          .click(this.moveCarousel)
          .mouseover(this.rollCarousel)
          .mouseout(this.unrollCarousel)
      )
      .append(
        $("<a>")
          .addClass("navigation next")
          .append("&raquo;")
          .click(this.moveCarousel)
          .mouseover(this.rollCarousel)
          .mouseout(this.unrollCarousel)
      )
      .append(
        $("<ul>")
      );
  },

  levelTemplate: function (level){
    return $("<li>")
      .addClass("level-block")
      .addClass(this.activeLevel == level.LevelId ? "level-active" : "")
      .addClass(level.Dismissed == true ? "level-dismissed" : "")
      .addClass(level.IsPassed == true ? "level-finished" : "")
      .attr("level-number", level.LevelNumber)
      .attr("level-id", level.LevelId)
      .append(
        $("<i>")
          .append(level.LevelNumber)
      )
      .append(
        $("<div>")
          .addClass("line")
      )
      .append(
        $("<p>")
          .append(level.LevelName)
      )
      .click(function(event){
        gameObj.setLevelHash(
          $(this).attr('level-id'),
          $(this).attr('level-number')
        );
        $(".level-block").removeClass("level-active");
        $(this).addClass("level-active");
        gameObj.doReload();
      });
  },

  rollCarousel: function (event){
    event.preventDefault();
    this.doRoll = setInterval(function(){ taskData.moveCarousel(event); }, 300);
  },

  unrollCarousel: function (event){
    event.preventDefault();
    clearInterval(this.doRoll);
  },

  carouselMaxMargin: function(){
    var max_width  = -400;
    $(".level-block").each(function(){ max_width += $(this).width(); });
    return max_width;
  },

  moveCarousel: function (event){
    event.preventDefault();

    var margin = parseInt($("#level-list ul").first().css("margin-left")) || 0;

    if (event.target.classList.contains('next')){
      margin -= 100;
    } else {
      margin += 100;
    }

    if (margin > 400 || Math.abs(margin) > this.carouselMaxMargin()) return;
    console.log(margin);
    $("#level-list ul").first().css("margin-left", `${margin}px`);
  },

  scrollToActive: function(){
    var id = $(".level-active").index(),
        margin = 400, i;
    $(`.level-block:lt(${id})`).each(function() {
      margin -= $(this).width();
    });

    if (margin > 300) margin = 299;
    if (margin < -1 * this.carouselMaxMargin()) margin = -1 * this.carouselMaxMargin();

    $("#level-list ul").css("margin-left", `${margin}px`);
  }
};
