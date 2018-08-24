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

    this.userUpdateTime = 0;
  }

  initialize (storage){
    this.storage = storage;

    if (storage.isLevelUp() && !storage.isFirstLoad()){
      this.playSound("audio/levelup.mp3");
    }

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

    // Add plugin config button
    $(".enext-options").remove();
    $(".header ul")
      .append(
        $("<li>")
          .addClass("enext-options")
          .append(
            $("<a>")
              .append($("<i>"))
              .append($("<span>").append(chrome.i18n.getMessage("menuConfig")))
              .click(this.showGameConfig)
          )
      )
      .before(
        this._gameConfigDialogTemplate()
      );
    this._prepareConfigDialog();

    this.updateUserInfo(storage, true);

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

    this.updateUserInfo(storage);
  }

  updateUserInfo(storage, force = false){
    // Refresh every minute
    if (
      !force &&
      (Date.now() - this.userUpdateTime) < 1000 * 60
    ) return;

    // Display player info
    $.get(
      storage.getMyTeamURL(),
      function(result){
        var userinfo = $(result)
            .find("#tblUserBox tr:first td:first a[href='/UserDetails.aspx']");

        var teaminfo = $(result).find("a#lnkTeamName");
        if (0 === teaminfo.length){
          teaminfo = [ encx_tpl.singleTeamLink(storage.getMyTeamURL()) ];
        }

        var mailinfo = $(result).find("#spanUnreadMails");
        $(mailinfo[0]).show();
        if ($(mailinfo[0]).find("a").text() === ""){
          $(mailinfo[0]).find("a").text("0");
        }

        $("div.header .userinfo").remove();
        $("div.header")
          .append(encx_tpl.userinfoBlock({
            "user": userinfo[0],
            "team": teaminfo[0],
            "mail": mailinfo[0]
          }));
        $("div.userinfo a").attr("target", "_blank");
      }
    );

    this.userUpdateTime = Date.now();
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
    val = localStorage.getItem(`${this.storage.getGameId()}-hide-disclosed-sectors`) || false;
    $("#hide-disclosed-sectors").prop('checked', ENEXT.parseBoolean(val));

    val = localStorage.getItem(`${this.storage.getGameId()}-hide-complete-bonuses`) || false;
    $("#hide-complete-bonuses").prop('checked', ENEXT.parseBoolean(val));
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
      var openDB = localDB.openIndexedDB();
      openDB.onsuccess = function(){
        var db = localDB.getStoreIndexedDB(openDB);
        var levels = $("#game-history-level").val() === "All"
          ? e.data.storage.getLevelIds()
          : [parseInt($("#game-history-level").val())];
        var added = [];
        db.ind.user_id.openCursor(null, "next").onsuccess = function(event){
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
      };
    }

    var codeDB = localDB.openIndexedDB();
    codeDB.onsuccess = function(){
      var db = localDB.getStoreIndexedDB(codeDB);
      var levels = $("#game-history-level").val() === "All"
        ? e.data.storage.getLevelIds()
        : [parseInt($("#game-history-level").val())];
      $("#game-history-codes li").remove();

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
            // Code starts with given string
            cursor.value.Answer.toLowerCase().startsWith(
              $("#game-history-filter").val().toLowerCase()
            )
          ){
            $("#game-history-codes").append(
              encx_tpl.historicActionTemplate(cursor.value)
            );
          }
          cursor.continue();
        }
      }
    }
  }

  _prepareHistoryDialog(){
    $("#game-history-dialog").dialog({
        autoOpen: false,
        buttons: [
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

  gameConfigDialogClose(e){
    $("#game-config-dialog").dialog("close");
  }

  gameHistoryDialogClose(e){
    $("#game-history-dialog").dialog("close");
  }

  gameConfigDialogUpdate(e){
    localStorage.setItem(
      `${e.data.storage.getGameId()}-${$(e.target).attr("id")}`,
      $(e.target).prop('checked')
    )
  }

  showGameConfig(e){
    $("#game-config-dialog").dialog("open");
  }

  showGameHistory(e){
    e.data.gamePrepare._fillHistoryForm(e);

    $("#game-history-dialog").dialog("open");
  }
}
