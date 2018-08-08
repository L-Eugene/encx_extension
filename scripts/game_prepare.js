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

class GamePrepare extends GameManager {
  constructor (){
    super();

    $("body").addClass(
      /firefox/.test(navigator.userAgent.toLowerCase())
        ? "ff"
        : "gc"
    );

    // Prepare game menu
    $(".header li.mail").remove();
    $(".header li.discuss a").attr("target", "_blank");

    // Show level stat in dialog
    $(".levelstats a").click(showLevelStat);

    // Open link to announce in new tab
    $("a#lblGameTitle").attr("target", "_blank");

    // Replace Encounter logo
    $("a.logo").attr("target", "_blank");
  }

  initialize (storage){
    this.storage = storage;

    // Add plugin config button
    $(".enext-options").remove();
    $(".header ul")
      .append(
        $("<li>")
          .addClass("enext-options")
          .attr(
            "style",
            `background-image: url(${chrome.extension.getURL("img/menu.png")})`
          )
          .append(
            $("<a>")
              .append($("<i>"))
              .append($("<span>").append(chrome.i18n.getMessage("menuConfig")))
              .click(showGameConfig)
          )
      )
      .before(
        this._gameConfigDialogTemplate()
      );
    this._prepareConfigDialog();

    $("div.content").empty();
  }

  update (storage) {
    // Restart
    chrome.storage.local.get(
      'deniedDomains',
      function (result){
        if ((result.deniedDomains || "").split("|").includes(location.hostname)){
          location.reload();
        }
      }
    );
  }

  _gameConfigDialogTemplate(){
    return $("<div>")
      .addClass("game-config-box")
      .attr("id", "game-config-dialog")
      .attr("title", chrome.i18n.getMessage("optionsGameConfigDialog"))
      .append(
        $("<table>")
          .append(
            $("<tr>")
              .append(
                $("<td>")
                  .append(
                    $("<input>")
                      .attr("id", "hide-disclosed-sectors")
                      .attr("type", "checkbox")
                      .attr("checked", false)
                      .change(
                        { storage: this.storage },
                        this.gameConfigDialogUpdate
                      )
                  )
              )
              .append(
                $("<td>")
                  .append(
                    $("<label>")
                      .attr("for", "hide-disclosed-sectors")
                      .append(chrome.i18n.getMessage("optionsHideDisclosedSectors"))
                  )
              )
          )
        .append(
          $("<tr>")
            .append(
              $("<td>")
                .append(
                  $("<input>")
                    .attr("id", "hide-complete-bonuses")
                    .attr("type", "checkbox")
                    .attr("checked", false)
                    .change(
                      { storage: this.storage },
                      this.gameConfigDialogUpdate
                    )
                )
            )
            .append(
              $("<td>")
                .append(
                  $("<label>")
                    .attr("for", "hide-complete-bonuses")
                    .append(chrome.i18n.getMessage("optionsHideCompleteBonuses"))
                )
            )
        )
      )
      .hide();
  }

  _prepareConfigDialog(){
    $("#game-config-dialog").dialog({
        autoOpen: false,
        buttons: [
          {
            text: chrome.i18n.getMessage("buttonOk"),
            click: this.gameConfigDialogClose
          }
        ],
        close: this.gameConfigDialogClose
    });

    var val;
    val = localStorage.getItem(`${this.storage.getGameId()}-hide-disclosed-sectors`);
    if (val === null) val = false;
    $("#hide-disclosed-sectors").prop('checked', ENEXT.parseBoolean(val));

    val = localStorage.getItem(`${this.storage.getGameId()}-hide-complete-bonuses`);
    if (val === null) val = false;
    $("#hide-complete-bonuses").prop('checked', ENEXT.parseBoolean(val));
  }

  gameConfigDialogClose(e){
    $("#game-config-dialog").dialog("close")
  }

  gameConfigDialogUpdate(e){
    localStorage.setItem(
      `${e.data.storage.getGameId()}-${$(e.target).attr("id")}`,
      $(e.target).prop('checked')
    )
    // TODO: save to storage
  }
}
