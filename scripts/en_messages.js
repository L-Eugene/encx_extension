var messagesData = {
  messages: {},

  initialize: function(messages){
    this.messages = {};

    $(".globalmess").remove();
    $(".header").after(
      $("<p>")
        .addClass("globalmess")
        .hide()
    );
  },

  update: function(messages){
    $(".message-block").attr("delete-mark", true);
    messages.forEach(this.updateMessage, this);
    $(".message-block[delete-mark=true]").each(
      function (){
        delete messagesData.messages[$(this).attr("id-numeric")];
        $(this).remove();
      }
    );

    if (messages.length > 0) {
      $(".globalmess").show();
    } else {
      $(".globalmess").hide();
    }
  },

  updateMessage: function (message){
    if (message.MessageId in this.messages){
      $(`#message-${message.MessageId}`)
        .replaceWith(this.messageTemplate(message));
    } else {
      $(".globalmess").append(this.messageTemplate(message));
    }

    $(`#message-${message.MessageId}`).attr("delete-mark", false);
    this.messages[message.MessageId] = message;
  },

  messageTemplate: function(message){
    return $("<div>")
      .addClass("message-block")
      .attr("id", `message-${message.MessageId}`)
      .attr("id-numeric", message.MessageId)
      .attr("delete-mark", false)
      .append(
        $('<a>')
          .attr('href', `/userdetails.aspx?uid=${message.OwnerId}`)
          .append(message.OwnerLogin)
      )
      .append(
        $("<span>")
          .append(":")
      )
      .append(message.WrappedText)
      .append(
        $("<br>")
      );
  }
}
