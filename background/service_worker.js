/*
MIT License

Copyright (c) 2023 Eugene Lapeko

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
SOFTWARE.*/

chrome.runtime.onInstalled.addListener(
    function (details){
      if (details.reason == "install"){
        chrome.storage.local.set({
          "selectSentCode": true,
          "refreshRate": 5,
          "autoFocus": true,
          "enableSound": true,
  
          "hideDisclosedSectors": false,
          "hideCompleteBonuses": false,
          "showCompleteBonusTask": false,
  
          "deniedDomains": ""
        });
      }
    }
);

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.message === "activate_icon") {
        chrome.pageAction.show(sender.tab.id);
      }
    }
);

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.scripts) {
    try {
      chrome.scripting.executeScript({
        target: { tabId: sender.tab.id },
        func: attachToDOM,
        world: 'MAIN',
        args: [request.scripts],
      });
    } catch {
      // looks like we are in firefox
      // try without `world`
      chrome.scripting.executeScript({
        target: { tabId: sender.tab.id },
        func: attachToDOM,
        args: [request.scripts],
      });
    }
  }
});

/**
 * Attaches script to DOM
 * @param {{text?: string, src?: string, id: string}[]} value Script definition to attach to DOM
 */
function attachToDOM(value) {
  value.forEach((script) => {
    const tag = document.createElement('script');
    if (script.text) {
      tag.textContent = script.text;
    } else if (script.src) {
      tag.src = script.src;
    }
    const target = document.getElementById(script.id);
    target.appendChild(tag);
  });
}
