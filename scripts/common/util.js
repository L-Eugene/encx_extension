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

"use strict";

// Remove unneeded elements from HTML to allow jQuery to parse it.
function sanitizeHTML(html){
  return html.replace(/^[\s\S]*<body.*?>|<\/body>[\s\S]*$/ig, '')
}

function snakeToCamelCase(str){
  return str.replace(
    /[-_][a-zA-Z]+/g,
    function(word, index){ return word.charAt(1).toUpperCase() + word.slice(2).toLowerCase(); }
  );
}

function markBodyWithBrowser(){
  $("body").addClass(
    /firefox/.test(navigator.userAgent.toLowerCase())
      ? "ff"
      : "gc"
  )
  .addClass("extension");
}

// Get data from chrome.storage.local and return Promise
function getStorageLocal(request){
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(
      request,
      (result) => { resolve(result); }
    );
  });
}

function isOptionTruePromise(optionName){
  return new Promise((resolve, reject) => {
    isOptionTrue(optionName) ? resolve() : reject();
  });
}

function isOptionTrue(optionName, defaultVal = false){
  var val = localStorage.getItem(optionName);
  if (val == null || val == undefined) val = defaultVal;
  return ENEXT.parseBoolean(val);
}

// Check if current domain is in disable list or not
function isDomainEnabled(){
  return getStorageLocal({ 'deniedDomains': "" })
    .then(
      function(result){
        var domains = result.deniedDomains.split("|");
        return new Promise((resolve, reject) => {
          if (domains.includes(location.hostname)){
            reject(new Error("Disabled domain"))
          } else {
            resolve();
          }
        });
      }
    );
}
