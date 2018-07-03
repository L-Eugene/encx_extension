var bonusData = {
  sortNeeded: false,
  bonuses: {},

  initialize: function (bonuses){
    $('div.content').append('<div id="bonuses"></div>');
  },

  update: function (bonuses){
    bonuses.forEach(this.updateBonus, this);

    if (this.sortNeeded){
      ENEXT.sortDOM('div#bonuses', 'div.bonus-block');
      this.sortNeeded = false;
    }
  },

  bonusInfoTemplate: function(bonus){
    return $('<span>')
      .addClass('color_sec')
      .append(`(${ENEXT.convertTimestamp(bonus.Answer.AnswerDateTime.Value)} `)
      .append(
        $('<a>')
          .attr('href', `/userdetails.aspx?uid=${bonus.Answer.UserId}`)
          .attr('target', '_blank')
          .append(bonus.Answer.Login)
      )
      .append(', награда ')
      .append(
        ENEXT.convertTime(bonus.AwardTime)
      )
      .append(')');
  },

  bonusTemplate: function(bonus){
    return $('<div>')
      .addClass('bonus-block')
      .attr('id', `bonus-${bonus.BonusId}`)
      .attr('sort-value', bonus.Number)
      .append(
        $('<h3>')
          .addClass(bonus.IsAnswered ? 'color_correct' : 'color_bonus')
          .append(`Бонус ${bonus.Number}: ${bonus.Name}&nbsp;`)
          .append(
            bonus.IsAnswered
              ? $('<span>')
                  .addClass('color_sec')
                  .append(this.bonusInfoTemplate(bonus))
              : ''
          )
      )
      .append(
        $('<p>')
          .append(
            bonus.IsAnswered
              ? $('<span>')
                  .append('Ответ:&nbsp;')
                  .append(
                    $('<span>')
                      .addClass('color_correct')
                      .append(bonus.Answer.Answer)
                  )
              : ''
          )
      )
      .append(
        bonus.IsAnswered
          ? $('<p>').append(bonus.Help)
          : $('<p>').append(bonus.Task)
      )
      .append(
        $('<div>').addClass('spacer')
      );
  },

  bonusChanged: function(bonus){
    return JSON.stringify(this.bonuses[bonus.BonusId]) != JSON.stringify(bonus);
  },

  updateBonus: function (bonus){
    if (bonus.BonusId in this.bonuses){
      if (this.bonusChanged(bonus)){
        $(`div#bonus-${bonus.BonusId}`).replaceWith(this.bonusTemplate(bonus));
        this.sortNeeded = true;
      }
    } else {
      $('div#bonuses').append(this.bonusTemplate(bonus));
      this.sortNeeded = true;
    }

    this.bonuses[bonus.BonusId] = bonus;
  }
};

