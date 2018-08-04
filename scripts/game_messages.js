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
