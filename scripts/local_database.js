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
      db.tx = openDB.transaction

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
        }
      ]

      for(var i=event.oldVersion; i<migrations.length; i++){
        migrations[i].call(db);
      }
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

  // Get first available ActionId
  storeLastAction(action){
    var openDB = this.openIndexedDB();

    openDB.onsuccess = function(){
      var db = localDB.getStoreIndexedDB(openDB);

      var keys = db.store.getAllKeys(IDBKeyRange.upperBound(100000));
      keys.onsuccess = function(){
        action.ActionId = 1;
        if (keys.result.length > 0){
          action.ActionId = keys.result.sort().pop() + 1;
        }

        localDB.storeActions([ action ]);
      }
    }
  },

  // Append new actions to database
  storeActions(actions){
    var openDB = this.openIndexedDB();

    openDB.onsuccess = function(){
      var db = localDB.getStoreIndexedDB(openDB);

      Object.keys(actions).forEach(function(action_key){
        var action = actions[action_key];
        if (0 === action.ActionId){
          localDB.storeLastAction(action)
        } else {
          var record = db.store.get(action.ActionId);

          record.onsuccess = function(){
            if (record.result === undefined){
              db.store.put(action);
            }
          };
        }
      });

      db.tx.oncomplete = function(){
        db.result.close();
      };
    }
  }
}
