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

var tabId;

function sendMessage(data, callback = undefined){
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, data, callback);
  });
}

function initValues(data){
  chrome.storage.local.get(
    { 'deniedDomains': "" },
    (result) => {
      // disable-domain is calculated here, not sent from game page script
      data["disable-domain"] = result.deniedDomains.split("|").includes(data["domain"]);

      // hostname is sent from page to get it's domain
      // no need to set it somewhere on menu
      delete data["domain"];

      for (var key in data){
        switch (document.querySelector(`#${key}`).type){
          case 'checkbox':
            document.querySelector(`#${key}`).checked = (data[key] == "true" || data[key] == true);
            break;
          case 'number':
            document.querySelector(`#${key}`).value = data[key];
            break;
        }
      }
    }
  )
}

function saveValues(){
  var result = {};

  // Collect checkbox options
  var objects = document.querySelectorAll("li input[type=checkbox]");
  for (var key in objects){
    if (undefined !== objects[key].id)
      result[objects[key].id] = objects[key].checked;
  }

  // Collect numeric options
  objects = document.querySelectorAll("li input[type=number]");
  for (var key in objects){
    if (undefined !== objects[key].id)
      result[objects[key].id] = objects[key].value;
  }

  sendMessage({
    from: 'page_action',
    subject: 'set_options',
    data: result
  });
}

window.addEventListener('DOMContentLoaded', function () {
  sendMessage(
    { from: 'page_action', subject: 'get_options' },
    initValues
  )
});

initLocalization();

document.querySelectorAll("li input[type=checkbox]").forEach(function (object){
  object.addEventListener("change", saveValues);
});
document.querySelectorAll("li input[type=number]").forEach(function (object){
  object.addEventListener("change", saveValues);
});
