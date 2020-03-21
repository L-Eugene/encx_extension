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
  odb_cache: undefined,

  // initialize storages
  openIndexedDB(){
    return new Promise((resolve, reject) => {
      if (localDB.odb_cache != undefined && localDB.odb_cache.readyState != "done"){
        resolve(localDB.odb_cache);
        return;
      }

      var openDB = indexedDB.open("Codes", 3);

      openDB.onupgradeneeded = function(event) {
        var db = {};
        db.result = openDB.result;
        db.tx = openDB.transaction;

        var migrations = [
          // Migrate from version 0 to version 1
          function(){
            this.result.createObjectStore("Actions", {keyPath: "ActionId"});
          },

          // Migrate from version 1 to version 2
          function(){
            var store = this.tx.objectStore("Actions");

            store.createIndex("LevelId", "LevelId", { unique: false });
            store.createIndex("Answer", "Answer", { unique: false });
            store.createIndex("UserId", "UserId", { unique: false });
          },

          // Migrate from version 2 to version 3
          // Add uppercase field for code comparision
          function(){
            var store = this.tx.objectStore("Actions");

            store.openCursor().onsuccess = function(event){
              var cursor = event.target.result;
              if (!cursor) return;

              var value = cursor.value;
              // Adding capitalized answer to impelement case-insensibility
              value.AnswerCaps = value.Answer.toUpperCase();

              event.target.source.put(value);

              cursor.continue();
            }

            store.createIndex("AnswerCaps", "AnswerCaps", { unique: false });
          }
        ]

        for(var i=event.oldVersion; i<migrations.length; i++){
          migrations[i].call(db);
        }
      };

      openDB.onsuccess = function(event) {
        localDB.odb_cache = event.target.result;
        resolve(localDB.odb_cache);
      }

      openDB.onerror = function(event){
        reject(event.target.result);
      }
    });
  },

  // Prepare indexes
  getStoreIndexedDB(openDB){
    var db = {};
    db.result = openDB;
    db.tx = db.result.transaction("Actions", "readwrite");
    db.store = db.tx.objectStore("Actions");

    return db;
  },

  // Append new actions to database
  storeActions(actions){
    this.openIndexedDB().then((openDB) => {
      var db = localDB.getStoreIndexedDB(openDB);

      Object.keys(actions).forEach(function(action_key){
        var action = actions[action_key];

        // Adding capitalized answer to impelement case-insensibility
        action.AnswerCaps = action.Answer.toUpperCase();
        if (0 === action.ActionId){
          // Last action of level
          var keys = db.store.getAllKeys(IDBKeyRange.upperBound(100000));
          keys.onsuccess = function(){
            action.ActionId = 1;
            if (keys.result.length > 0){
              action.ActionId = keys.result.sort().pop() + 1;
            }
            db.store.put(action);
          }
        } else {
          var record = db.store.get(action.ActionId);

          record.onsuccess = function(){
            if (record.result === undefined){
              db.store.put(action);
            }
          };
        }
      });
    });
  }
}
