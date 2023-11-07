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

class GameStorage {
  constructor() {
    // TODO: make workaround when we start from closed level
    this.levelHash = {
      LevelId: $(".aside input[name=LevelId]").val(),
      LevelNumber: $(".aside input[name=LevelNumber]").val()
    }

    // Last API bundle
    this.last = null;
    // Previous API bundle
    this.prev = null;

    // refresh timer handler
    this.timer = null;

    this.firstRun = true;

    this.callbackObjects = [];
    this.errorCallback = undefined;

    this.Errors = [];

    // Flag to show that we need an update
    this.needUpdate = false;
    if (this.isStormGame()) {
      addEventListener('popstate', (event) => {
        if (!event.state?.levelHash) {
          return;
        }
  
        const state = event.state.levelHash;
        this.changeLevel(state.LevelId, state.LevelNumber, true);
      });
    }
  }

  isGameOver(){
    return [6, 17].includes(parseInt(this.last.Event));
  }

  isError(){
    return 0 !== this.last.Event
  }

  isFirstLoad(){
    return this.firstRun;
  }

  _countPassedLevels(levels){
    var result = 0;
    levels.forEach(
      function (level){
        if (level.Dismissed || level.IsPassed) result = result + 1;
      }
    );
    return result;
  }

  // return true if it's time to play level-up sound
  isLevelUpMessageTime(){
    if (this.isFirstLoad()) return false;
    if (!this.isStormGame()) return this.isLevelUp();
    if (null === this.prev) return false;
    if (this.prev.Levels.length != this.last.Levels.length) return true;
    return this._countPassedLevels(this.prev.Levels) != this._countPassedLevels(this.last.Levels);
  }

  // Return true if LevelId changed since previous data update
  isLevelUp(){
    // This is first data update
    if (this.isGameOver() || this.prev === null) return true;

    // Do not update anything if we got error
    if (this.isError()) return false;

    return this.last.Level.LevelId != this.prev.Level.LevelId;
  }

  isLevelPassed(){
    return this.last.Level.IsPassed;
  }

  getEvent(){
    return this.last.Event;
  }

  getErrorBlock(){
    switch (this.last.Event){
      case 7:
      case 8:
      case 9:
        return encx_tpl.errorNotApplied();
      case 10:
        return encx_tpl.errorDoNotHaveTeam();
      case 11:
        return encx_tpl.errorNotInActiveStaff();
      case 13:
        return encx_tpl.errorPlayerLimitExceeded();
      default:
        return encx_tpl.errorUnknown(this.last.Event);
    }
  }

  // Execute all needed callbacks when data reloaded
  _doCallbacks(){
    /*
     * Initialize callback
     * Called on first run and on every LevelId change
     */
    if (this.isLevelUp()){
      this.prev = null;
      this.callbackObjects.forEach(
        function(obj){ obj.initialize(this); },
        this
      );
    }

    // Update callback is called on every data refresh
    this.callbackObjects.forEach(
      function(obj){ obj.update(this);  },
      this
    )
  }

  _doErrorCallback(){
    if (undefined === this.errorCallback) return;

    if (this.isGameOver()){
      location.reload(true);
    }

    if (this.isLevelUp()){
      this.errorCallback.initialize(this);
    }

    this.errorCallback.update(this);
  }

  _findObjectByKey(list, key, value){
    var i;
    for (i=0; i<list.length; i++){
      if (list[i][key] == value) return list[i];
    }
    return null;
  }

  //
  _getHash(type){
    var result = {};
    result[`${type}Action`] = {
      Answer: $(`input[name='${type}Action.Answer']`).val()
    };
    return result;
  }

  // Remove all objects from callback list
  clearCallbackObjects(){
    this.callbackObjects = [];
  }

  // add an objetc to callback list
  addCallbackObject(obj){
    obj.storage = this;
    this.callbackObjects.push(obj);
  }

  // Error callback is called always.
  // Other callbacks called only if data load been successful.
  setErrorCallback(obj){
    this.errorCallback = obj;
  }

  raiseAPIError(req, status){
    if (status == "parsererror"){
      if ($(req.responseText).find("form[action='/Login.aspx']").length){
        this.Errors.push(encx_tpl.errorNeedRelogin());
      } else if (req.responseText.includes("classified as robot's requests")) {
        this.Errors.push(encx_tpl.errorActAsBot());
      }
    }
    this._doErrorCallback();
  }

  storeAPI(data){
    this.prev = this.last;
    this.last = data;

    this.firstRun = null === this.prev;

    if (this.isError()) {
      this.Errors.push(this.getErrorBlock());
    } else if (!this.isGameOver()){
      this.levelHash = {
        LevelId: this.last.Level.LevelId,
        LevelNumber: this.last.Level.Number
      };
    }

    if (!this.isError()) {
      this._doCallbacks();
    }

    this._doErrorCallback();
  }

  // Return full data from API
  getGame(){
    return this.last;
  }

  // Return current level
  getLevel(){
    return this.last.Level;
  }

  getLevels(){
    return this.last.Levels;
  }

  getLevelIds(){
    return Array.from(this.getLevels()).map(function(elm){
      return elm.LevelId;
    });
  }

  // Return formatted text of given tasks
  getTaskText(id = 0){
    if (this.last.Level.Tasks.length-1 < id) return "";
    return this.last.Level.Tasks[id].TaskTextFormatted;
  }

  // Return list of level tasks
  getTasks(){
    return this.last.Level.Tasks;
  }

  _findHint(list, id){
    return this._findObjectByKey(list, "HelpId", id);
  }

  getBonuses(){
    return this.last.Level.Bonuses;
  }

  getCompletedBonusesData(){
    var result = [0, 0];
    this.last.Level.Bonuses.forEach(function(bonus){
      if (ENEXT.parseBoolean(bonus.IsAnswered)){
        result[0]++;
        result[1]+=parseInt(bonus.AwardTime);
      }
    });
    result[1] = ENEXT.convertTime(result[1]);
    return result;
  }

  isBonusNew(bid){
    if (null === this.prev) return true;
    return null === this._findBonus(this.prev.Level.Bonuses, bid);
  }

  bonusesAppeared(){
    return (this.prev.Level.Bonuses.length == 0) && (this.last.Level.Bonuses.length > 0)
  }

  bonusesDisappeared(){
    return (this.prev.Level.Bonuses.length > 0) && (this.last.Level.Bonuses.length == 0)
  }

  isHashChanged(prev, last, keys){
    var k;
    for (k in keys){
      if (prev[keys[k]] != last[keys[k]]) return true;
    }
    return false;
  }

  isBonusChanged(bid){
    if (null === this.prev) return true;
    return this.isHashChanged(
      this._findBonus(this.prev.Level.Bonuses, bid),
      this._findBonus(this.last.Level.Bonuses, bid),
      ["IsAnswered", "Help", "Task", "Name", "Number", "Expired"]
    );
  }

  _findBonus(list, bid){
    return this._findObjectByKey(list, "BonusId", bid);
  }

  getMessages(){
    return this.last.Level.Messages;
  }

  isMessageNew(mid){
    if (null === this.prev) return true;
    return null === this._findMessage(this.prev.Level.Messages, mid);
  }

  isMessageChanged(mid){
    if (null === this.prev) return true;
    return this.isHashChanged(
      this._findMessage(this.prev.Level.Messages, mid),
      this._findMessage(this.last.Level.Messages, mid),
      ["MessageText", "OwnerId", "OwnerLogin"]
    );
  }

  _findMessage(list, mid){
    return this._findObjectByKey(list, "MessageId", mid);
  }

  getHelps(){
    return this.last.Level.Helps;
  }

  getPenaltyHelps(){
    return this.last.Level.PenaltyHelps;
  }

  getAllHelps(){
    return this.getHelps().concat(this.getPenaltyHelps());
  }

  isHintNew(hid){
    if (null === this.prev) return true;

    return null === this._findHint(
      this.prev.Level.Helps.concat(this.prev.Level.PenaltyHelps),
      hid
    );
  }

  isHintChanged(hid){
    if (null === this.prev) return true;

    var l = this.last.Level.Helps.concat(this.last.Level.PenaltyHelps),
        p = this.prev.Level.Helps.concat(this.prev.Level.PenaltyHelps);

    return this.isHashChanged(
      this._findHint(l, hid),
      this._findHint(p, hid),
      ["Number", "HelpText", "PenaltyHelpState", "PenaltyComment", "PenaltyMessage"]
    );
  }

  // Return list of historical changes
  getHistoryActions(){
    return this.last.Level.MixedActions || [];
  }

  // Return EngineAction result;
  getEngineAction(){
    return this.last.EngineAction;
  }

  // Return level length
  getTimeout(){
    return this.last.Level.Timeout;
  }

  // Return seconds to timeout on current level
  getTimeoutSecondsRemain(){
    return this.last.Level.TimeoutSecondsRemain;
  }

  // Return true if list of historical actions changed since previous update
  isHistoryChanged(){
    if (
      this.prev === null ||
      !(0 in this.last.Level.MixedActions) ||
      !(0 in this.prev.Level.MixedActions)
    ) return true;
    return this.last.Level.MixedActions[0].ActionId != this.prev.Level.MixedActions[0].ActionId;
  }

  // Return true if level have code blockage
  isBlockage(){
    return this.last.Level.HasAnswerBlockRule == true;
  }

  // Return true if code field is blocked at the moment
  isBlocked(){
    return this.last.Level.BlockDuration > 0;
  }

  isStormGame(){
    return this.last.LevelSequence == 3;
  }

  // Return number of code attempts before block
  getBlockAttemtsNumber(){
    return this.last.Level.AttemtsNumber;
  }

  // Return attempts period
  getBlockAttemtsPeriod(){
    return this.last.Level.AttemtsPeriod;
  }

  // Return seconds left to be blocked
  getBlockDuration(){
    return this.last.Level.BlockDuration;
  }

  // Retirn textual version of "for whom block is"
  getBlockTargetText(){
    var result = "";
    switch (this.last.Level.BlockTargetId){
      case 1:
        result = chrome.i18n.getMessage("blockTargetPlayer");
        break;
      case 2:
        result = chrome.i18n.getMessage("blockTargetTeam");
        break;
    }
    return result;
  }

  getGameId(){
    if (null !== this.last) return this.last.GameId;
    return location.pathname.match(/\d+/)[0];
  }

  // Return current level ID
  getLevelId(){
    return this.last.Level.LevelId;
  }

  // Return total number of levels
  getLevelCount(){
    return this.last.Levels.length;
  }

  // Return current level Number
  getLevelNumber(){
    return this.last.Level.Number;
  }

  getSectorNumber(){
    return this.last.Level.Sectors.length;
  }

  getSectorsClosedNumber(){
    var result = 0;
    this.getSectors().forEach(function(sector){
      result += (sector.IsAnswered === true) ? 1 : 0;
    });
    return result;
  }

  getSectorsToClose(){
    return this.getSectorsLeft() + this.getSectorsClosedNumber();
  }

  getSectorsLeft(){
    return this.last.Level.SectorsLeftToClose;
  }

  getSectors(){
    return this.last.Level.Sectors;
  }

  getMyTeamURL(){
    return `${location.protocol}//${location.hostname}/Teams/TeamDetails.aspx`;
  }

  getBonusesURL(){
    return `${location.protocol}//${location.hostname}/GameBonusPenaltyTime.aspx?gid=${this.getGameId()}`
  }

  getCleanURL(){
    return `${location.protocol}//${location.hostname}${location.pathname}`;
  }

  getLevelURL(){
    return `${this.getCleanURL()}?json=1&rnd=${Math.random()}`;
  }

  getLevelStatURL(){
    return `${location.protocol}//${location.hostname}/LevelStat.aspx?level=${this.getLevelNumber()}&gid=${this.getGameId()}&rnd=${Math.random()}`;
  }

  _findSector(list, sid){
    return this._findObjectByKey(list, "SectorId", sid);
  }

  isSectorChanged(sid){
    if (null === this.prev) return true;
    return this.isHashChanged(
      this._findSector(this.last.Level.Sectors, sid),
      this._findSector(this.prev.Level.Sectors, sid),
      ["Order", "Name", "IsAnswered"]
    );
  }

  isSectorNew(sid){
    if (null === this.prev) return true;
    return null === this._findSector(this.prev.Level.Sectors, sid);
  }

  _findLevel(list, lid){
    return this._findObjectByKey(list, "LevelId", lid);
  }

  isLevelChanged(lid){
    if (null === this.prev) return true;
    return this.isHashChanged(
      this._findLevel(this.last.Levels, lid),
      this._findLevel(this.prev.Levels, lid),
      ["LevelNumber", "LevelName", "Dismissed", "IsPassed"]
    );
  }

  isLevelNew(lid){
    if (null === this.prev) return true;
    return null === this._findLevel(this.prev.Levels, lid);
  }

  sendCode( event ){
    event.preventDefault();

    event.data.storage.update(
      event.data.storage._getHash(event.data.type),
      true
    );

    // Select sent code only if option is set in extension config
    if (isOptionTrue(`${event.data.storage.getGameId()}-select-sent-code`)){
      $(event.target).find("input.placeholder").select();
    }
  }

  markForUpdate(){
    this.needUpdate = true;
  }

  updateIfNeeded(){
    if (this.needUpdate) this.update({}, true);
  }

  changeLevel(lid, ln, skipPush = false){
    this.levelHash.LevelId = lid;
    this.levelHash.LevelNumber = ln;

    if (this.isStormGame() && !skipPush) {
      const url = new URL(location);
      url.searchParams.set('level', ln);
      history.pushState({ levelHash: { ...this.levelHash } }, '', url);
    }

    this.update({}, true);
  }

  // get new API bundle
  update(data = {}, force = false){
    // Reset Error list
    this.Errors = [];

    // If reloaded manually, start refresh interval from now
    if (force && this.timer !== null) clearTimeout(this.timer);

    $.ajax(
      this.getLevelURL(),
      {
        dataType: "json",
        type: "POST",
        contentType: "application/json",
        context: this,
        success: this.storeAPI,
        error: this.raiseAPIError,
        data: JSON.stringify( $.extend({}, this.levelHash, data) )
      }
    );

    // get update rate from extension options
    var rate = localStorage.getItem(`${gameStorage.getGameId()}-refresh-rate`);
    this.timer = setTimeout(
      $.proxy(function(){ this.update(); }, this),
      1000 * rate
    );
    this.needUpdate = false;
  }
};
