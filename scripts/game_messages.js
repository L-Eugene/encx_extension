class GameMessagesManager extends GameManager {
  initialize(storage){
    this.storage = storage

    $(".globalmess").remove();
    $(".header").after(
      $("<p>")
        .addClass("globalmess")
        .hide()
    );
  }

  update(storage){
    $(".message-block").attr("delete-mark", true);
    storage.getMessages().forEach(
      function(message){
        if (this.storage.isMessageNew(message.MessageId)){
          $(".globalmess").append(this._messageTemplate(message));
        } else if (this.storage.isMessageChanged(message.MessageId)){
          $(`#message-${message.MessageId}`).replaceWith(this._messageTemplate(message));
        }

        $(`#message-${message.MessageId}`).attr("delete-mark", false);
      },
      this
    );
    $(".message-block[delete-mark=true]").remove();

    if (storage.getMessages().length > 0) {
      $(".globalmess").show();
    } else {
      $(".globalmess").hide();
    }
  }

  _messageTemplate(message){
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
