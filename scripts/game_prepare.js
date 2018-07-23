class GamePrepare extends GameManager {
  constructor (){
    super();

    // Prepare game menu
    $(".header li.mail").remove();
    $(".header li.discuss a").attr("target", "_blank");

    // Show level stat in dialog
    $(".levelstats a").click(showLevelStat);

    // Open link to announce in new tab
    $("a#lblGameTitle").attr("target", "_blank");

    // Replace Encounter logo
    $("a.logo").attr("target", "_blank");
    $("a.logo img").attr("src", chrome.extension.getURL("img/logo-96.png"));
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
