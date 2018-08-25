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

var localDB = {
  // initialize storages
  openIndexedDB(){
    var openDB = indexedDB.open("Codes", 2);

    openDB.onupgradeneeded = function(event) {
      var db = {};
      db.result = openDB.result;

      if (event.oldVersion >= 1){
        db.result.deleteObjectStore("Actions");
      }

      db.store = db.result.createObjectStore("Actions", {keyPath: "ActionId"});

      db.store.createIndex("LevelId", "LevelId", { unique: false });
      db.store.createIndex("Answer", "Answer", { unique: false });
      db.store.createIndex("UserId", "UserId", { unique: false });
    };

    return openDB;
  },

  // Prepare indexes
  getStoreIndexedDB(openDB){
    var db = {};
    db.result = openDB.result;
    db.tx = db.result.transaction("Actions", "readwrite");
    db.store = db.tx.objectStore("Actions");
    db.ind = {
      level_id: db.store.index("LevelId"),
      answer: db.store.index("Answer"),
      user_id: db.store.index("UserId")
    };

    return db;
  },

  // Append new actions to database
  storeActions(actions){
    var openDB = this.openIndexedDB();

    openDB.onsuccess = function(){
      var db = localDB.getStoreIndexedDB(openDB);

      Object.keys(actions).forEach(function(action_key){
        var action = actions[action_key];
        var record = db.store.get(action.ActionId);

        record.onsuccess = function(){
          if (record.result === undefined){
            db.store.put(action);
          }
        };
      });

      db.tx.oncomplete = function(){
        db.result.close();
      };
    }
  }
}
