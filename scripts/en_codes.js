// Methods to work with code/bonus fields and code history.
var codeFields = {
  getCodeHash: function (){
    return JSON.stringify({
      LevelID: $('input[name="LevelId"]').val(),
      LevelAction: {
        Answer: $('input#Answer[name="LevelAction.Answer"]').val()
      }
    });
  },

  getBonusHash: function (){
    return JSON.stringify({
      LevelID: $('input[name="LevelId"]').val(),
      BonusAction: {
        Answer: $('input#BonusAnswer[name="BonusAction.Answer"]').val()
      }
    });
  },

  actionTemplate: function (action){
    return $('<li>')
      .addClass(action.IsCorrect ? 'correct' : '' )
      .append(action.LocDateTime)
      .append('&nbsp;')
      .append(
        $('<a>')
          .attr('href', '/userdetails.aspx?uid=' + action.UserId)
          .append(action.Login)
      )
      .append('&nbsp;')
      .append(
        $('<span>').addClass(
          // data.Level.MixedActions[any].Kind:
          //   1 - code
          //   2 - bonus
          action.IsCorrect ? 
            'color_' + (action.Kind == 1 ? 'correct' : 'bonus') : ''
        ).append(action.Answer)
      );
  },

  addHistoricCode: function (action, id, array){
    $('ul.history').append(this.actionTemplate(action));
  },

  updateCodeHistory: function (actions){
    $('ul.history').empty();
    actions.forEach(this.addHistoricCode, this);
  }

};

