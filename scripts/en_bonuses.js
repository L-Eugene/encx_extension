var bonusData = {
  bonuses: {},

  initialize: function (bonuses){
    $("div.content").append("<div id='bonuses'></div>");
  },

  update: function (bonuses){
    $(".bonus-block").attr("delete-mark", true);
    bonuses.forEach(this.updateBonus, this);
    $(".bonus-block[delete-mark=true]").each(
      function (){
        delete bonusData.bonuses[$(this).attr("id-numeric")];
        $(this).remove();
      }
    );
  },

  bonusInfoTemplate: function(bonus){
    return $("<span>")
      .addClass("color_sec")
      .append(`(${ENEXT.convertTimestamp(bonus.Answer.AnswerDateTime.Value)} `)
      .append(
        $("<a>")
          .attr("href", `/userdetails.aspx?uid=${bonus.Answer.UserId}`)
          .attr("target", "_blank")
          .append(bonus.Answer.Login)
      )
      .append(", награда ")
      .append(
        ENEXT.convertTime(bonus.AwardTime)
      )
      .append(")");
  },

  tabHeaderTemplate: function (title, href){
    return $("<li>")
      .append(
        $("<a>")
          .attr("href", href)
          .append(title)
      );
  },

  tabBodyTemplate: function (id, text, clas=''){
    return $("<div>")
      .attr("id", id)
      .append(
        $("<p>")
          .addClass(clas)
          .append(text)
      )
  },

  bonusOpenTemplate: function (bonus){
    return $("<div>")
      .addClass("tabs")
      .append(
        $("<ul>")
          .append(
            this.tabHeaderTemplate("Подсказка", `#bonus-${bonus.BonusId}-hint`)
          )
          .append(
            this.tabHeaderTemplate("Задание", `#bonus-${bonus.BonusId}-task`)
          )
          .append(
            this.tabHeaderTemplate("Ответ", `#bonus-${bonus.BonusId}-answer`)
          )
      )
      .append(
        this.tabBodyTemplate(`bonus-${bonus.BonusId}-hint`, bonus.Help)
      )
      .append(
        this.tabBodyTemplate(`bonus-${bonus.BonusId}-task`, bonus.Task)
      )
      .append(
        this.tabBodyTemplate(
          `bonus-${bonus.BonusId}-answer`,
          bonus.Answer.Answer,
          "color_correct"
        )
      );
  },

  bonusClosedTemplate: function (bonus){
    return $("<div>")
      .addClass("tabs")
      .append(
        $("<ul>")
          .append(
            this.tabHeaderTemplate("Задание", `#bonus-${bonus.BonusId}-task`)
          )
      )
      .append(
        this.tabBodyTemplate(`bonus-${bonus.BonusId}-task`, bonus.Task)
      )
  },

  bonusTemplate: function(bonus){
    return $("<div>")
      .addClass("bonus-block")
      .attr("id", `bonus-${bonus.BonusId}`)
      .attr("id-numeric", bonus.BonusId)
      .attr("delete-mark", false)
      .css("order", bonus.Number)
      .append(
        $("<h3>")
          .addClass(bonus.IsAnswered ? "color_correct" : "color_bonus")
          .append(`Бонус ${bonus.Number}: ${bonus.Name}&nbsp;`)
          .append(
            bonus.IsAnswered
              ? $("<span>")
                  .addClass("color_sec")
                  .append(this.bonusInfoTemplate(bonus))
              : ""
          )
      )
      .append(
        bonus.IsAnswered
          ? this.bonusOpenTemplate(bonus)
          : this.bonusClosedTemplate(bonus)
      )
      .append(
        $("<div>").addClass("spacer")
      );
  },

  bonusChanged: function(bonus){
    return JSON.stringify(this.bonuses[bonus.BonusId]) != JSON.stringify(bonus);
  },

  updateBonus: function (bonus){
    if (bonus.BonusId in this.bonuses){
      if (this.bonusChanged(bonus))
        $(`div#bonus-${bonus.BonusId}`).replaceWith(this.bonusTemplate(bonus));
    } else {
      $("div#bonuses").append(this.bonusTemplate(bonus));
    }

    $(`#bonus-${bonus.BonusId}`).attr("delete-mark", false);
    $(`#bonus-${bonus.BonusId} .tabs`).tabs();
    this.bonuses[bonus.BonusId] = bonus;
  }
};

