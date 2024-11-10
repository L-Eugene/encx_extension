/*
MIT License

Copyright (c) 2018-2020 Eugene Lapeko

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

    markBodyWithBrowser();

    // Prepare game menu
    $(".header li.mail").remove();
    $(".header li.discuss a").attr("target", "_blank");

    // Show level stat in dialog
    $(".levelstats a").click($.proxy(this.showLevelStat, this));

    // Open link to announce in new tab
    $("a#lblGameTitle").attr("target", "_blank");

    // Replace Encounter logo
    $("a.logo").attr("target", "_blank");

    this.userUpdateTime = 0;
  }

  initialize (storage){
    if (storage.isFirstLoad()){
      // Add history button
      $(".header ul .enext-history").remove();
      $(".header ul")
        .append(
          $("<li>")
            .addClass("enext-history")
            .append(
              $("<a>")
                .append($("<i>"))
                .append($("<span>").append(chrome.i18n.getMessage("menuHistory")))
                .click(
                  {
                    gamePrepare: this,
                    storage: storage
                  },
                  this.showGameHistory
                )
            )
        )
        .before(
          this._gameHistoryDialogTemplate()
        );
      this._prepareHistoryDialog();

      // Add bonuses and penalty button
      $(".header ul .enext-bonuses").remove();
      $(".header ul")
        .append(
          $("<li>")
            .addClass("enext-bonuses")
            .append(
              $("<a>")
                .append($("<i>"))
                .append(
                  $("<span>").append(chrome.i18n.getMessage("menuBonuses"))
                )
                .attr("href", storage.getBonusesURL())
                .attr("target", "_blank")
            )
        );
    }

    this.updateUserInfo(storage);

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

    if (storage.isLevelUpMessageTime()){
      this.playSound("audio/levelup.mp3");
    }
  }

  showLevelStat(event){
    event.preventDefault();

    $("<div>")
      .attr("id", "level-stat-dialog")
      .attr("title", chrome.i18n.getMessage("levelStatTitle"))
      .append(
        $("<iframe>")
          .attr("src", this.storage.getLevelStatURL())
          .attr("frameborder", 0)
          .attr("marginwidth", 0)
          .attr("marginheight", 0)
      )
      .dialog({
        autoOpen: true,
        modal: false,
        width: 700,
        height: 420,
        close: function (){
          $(".levelstats div#level-stat-dialog").remove();
        }
      });
  }

  /**
   * 
   * @param {GameStorage} storage 
   * @returns 
   */
  updateUserInfo(storage) {
    const game = storage.getGame();
    $('div.header').append(
      encx_tpl.userinfoBlock({
        user: game.Login,
        team: game.TeamName,
        teamId: game.TeamId,
      })
    );
  }

  _historyLevelList(){
    var result = [];
    this.storage.getLevels().forEach(function(element){
      result.push(`<option value="${element.LevelId}">${element.LevelNumber}: ${element.LevelName}</option>`);
    });
    return result.join("\n");
  }

  _gameHistoryDialogTemplate(){
    return `
    <div class="game-history-box" id="game-history-dialog" title="${chrome.i18n.getMessage("optionsGameHistoryDialog")}">
      <textarea id="game-history-download-csv"></textarea>
      <table>
        <tr>
          <td>
            ${chrome.i18n.getMessage("titleLevel")}:
            <select id="game-history-level"></select>
          </td>
          <td>
            ${chrome.i18n.getMessage("titlePlayer")}:
            <select id="game-history-player"></select>
          </td>
        </tr>
        <tr>
          <td colspan=2>
            <input id="game-history-filter" placeholder="${chrome.i18n.getMessage("optionsGameHistoryDialog_partOfCode")}">
          </td>
        </tr>
        <tr>
          <td colspan=2><ul id="game-history-codes"></ul></td>
        </tr>
      </table>
    </div>
    `;
  }

  _fillHistoryForm(e){
    if (e.type === "click"){
      // Prepare level list
      $("#game-history-level option").remove();
      $("#game-history-level").append(
        `<option value="All">${chrome.i18n.getMessage("titleAny")}</option>`
      );
      e.data.storage.getLevels().forEach(function (level){
        $("#game-history-level").append(
          `<option value="${level.LevelId}">
          ${level.LevelNumber}: ${level.LevelName}
          </option>`
        );
      });
      $("#game-history-level").val(e.data.storage.getLevel().LevelId);

      $("#game-history-filter").val("");
    }

    if (e.target.id !== "game-history-player"){
      // Prepare player list
      $("#game-history-player option").remove();
      $("#game-history-player").append(
        `<option value="All">${chrome.i18n.getMessage("titleAny")}</option>`
      );
      localDB.openIndexedDB().then((openDB) => {
        var db = localDB.getStoreIndexedDB(openDB);
        var levels = $("#game-history-level").val() === "All"
          ? e.data.storage.getLevelIds()
          : [parseInt($("#game-history-level").val())];
        var added = [];
        db.store.index("UserId").openCursor(null, "next").onsuccess = function(event){
          var cursor = event.target.result;
          if (cursor){
            if (
              levels.includes(cursor.value.LevelId) &&
              !added.includes(cursor.key)
              /*
              Prevent adding same name twice
              Cannot use "nextunique" as record LevelId can be from another game
              */
            ){
              $("#game-history-player").append(
                `<option value="${cursor.key}">${cursor.value.Login}</option>`
              );
              added.push(cursor.key);
            }
            cursor.continue();
          }
        }
      });
    }

    localDB.openIndexedDB().then((codeDB) => {
      var db = localDB.getStoreIndexedDB(codeDB);
      var levels = $("#game-history-level").val() === "All"
        ? e.data.storage.getLevelIds()
        : [parseInt($("#game-history-level").val())];
      $("#game-history-codes li").remove();

      // Create CSV header
      $("#game-history-download-csv").text("LevelNumber,Login,Time,Type,Answer,IsCorrect\n");

      db.store.openCursor().onsuccess = function(event){
        var cursor = event.target.result;
        if (cursor){
          if (
            // Level from this game or single selected
            levels.includes(cursor.value.LevelId) &&
            // Player, who sent some codes or single selected
            (
              $("#game-history-player").val() === "All" ||
              parseInt($("#game-history-player").val()) === cursor.value.UserId
            ) &&
            // Code contains given string
            cursor.value.Answer.toLowerCase().includes(
              $("#game-history-filter").val().toLowerCase()
            )
          ){
            // Put code to form list
            $("#game-history-codes").append(
              encx_tpl.historicActionTemplate(cursor.value)
            );

            // Put code to csv
            $("#game-history-download-csv").text(
              $("#game-history-download-csv").text() +
              `"${cursor.value.LevelNumber}","${cursor.value.Login}","${cursor.value.LocDateTime}","${cursor.value.Kind == 2 ? 'Bonus' : 'Code'}","${cursor.value.Answer}","${cursor.value.IsCorrect}"\n`
            );
          }
          cursor.continue();
        } else {
          // Scroll to top of history list
          $("#game-history-codes").scrollTop(0);
        }
      }
    });
  }

  _prepareHistoryDialog(){
    $("#game-history-dialog").dialog({
        autoOpen: false,
        buttons: [
          {
            text: chrome.i18n.getMessage("buttonDownload"),
            click: this.gameHistoryDialogDownload
          },
          {
            text: chrome.i18n.getMessage("buttonOk"),
            click: this.gameHistoryDialogClose
          }
        ],
        width: 'auto',
        close: this.gameHistoryDialogClose
    });

    $("#game-history-level").change(
      { storage: this.storage },
      this._fillHistoryForm
    );
    $("#game-history-player").change(
      { storage: this.storage },
      this._fillHistoryForm
    );
    $("#game-history-filter").keyup(
      { storage: this.storage },
      this._fillHistoryForm
    )
  }

  gameHistoryDialogClose(e){
    $("#game-history-dialog").dialog("close");
  }

  gameHistoryDialogDownload(e){
    var element = document.createElement('a');

    element.setAttribute(
      'href',
      URL.createObjectURL(
        new Blob(
          [$("#game-history-download-csv").text()],
          {type: "text/csv"}
        )
      )
    );
    element.setAttribute('download', 'game_monitoring.csv');

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  showGameHistory(e){
    e.data.gamePrepare._fillHistoryForm(e);

    $("#game-history-dialog").dialog("open");
  }
}
