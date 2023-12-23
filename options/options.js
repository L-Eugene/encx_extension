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

function saveOptions(e) {
  e.preventDefault();

  chrome.storage.local.set({
    "selectSentCode": document.querySelector("#selectSentCode").checked,
    "enableSound": document.querySelector("#enableSound").checked,
    "autoFocus": document.querySelector("#autoFocus").checked,
    "refreshRate": document.querySelector("#refreshRate").value,

    "hideDisclosedSectors": document.querySelector("#hideDisclosedSectors").checked,
    "hideCompleteBonuses": document.querySelector("#hideCompleteBonuses").checked,
    "showCompleteBonusTask": document.querySelector("#showCompleteBonusTask").checked,
    "showCompleteBonusCode": document.querySelector("#showCompleteBonusCode").checked,

    "defaultPageActionTab": document.querySelector("#defaultPageActionTab").value,

    "deniedDomains": deniedDomainList().join('|')
  });
}

function restoreOptions() {

  function setCurrentChoice(result) {
    document.querySelector("#selectSentCode").checked = result.selectSentCode;
    document.querySelector("#refreshRate").value = result.refreshRate;
    document.querySelector("#autoFocus").value = result.autoFocus;
    document.querySelector("#enableSound").checked = result.enableSound;

    document.querySelector("#hideDisclosedSectors").checked = result.hideDisclosedSectors;
    document.querySelector("#hideCompleteBonuses").checked = result.hideCompleteBonuses;
    document.querySelector("#showCompleteBonusTask").checked = result.showCompleteBonusTask;
    document.querySelector("#showCompleteBonusCode").checked = result.showCompleteBonusCode;

    document.querySelector("#defaultPageActionTab").value = result.defaultPageActionTab;

    result.deniedDomains.split("|").forEach(
      function(domain){ if (domain != "") addDeniedDomain(domain); }
    );
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  chrome.storage.local.get(
    {
      "selectSentCode": true,
      "refreshRate": 5,
      "autoFocus": true,
      "enableSound": true,

      "hideDisclosedSectors": false,
      "hideCompleteBonuses": false,
      "showCompleteBonusTask": false,
      "showCompleteBonusCode": false,

      "defaultPageActionTab": "engine",

      "deniedDomains": ""
    },
    setCurrentChoice
  )
}

function _domainTemplate(domain){
  var button = document.createElement("button");
  button.innerHTML = "-";
  button.addEventListener("click", deleteDeniedDomain);

  var text = document.createElement("span");
  text.textContent = domain;

  var block = document.createElement("div")
  block.className = "single-domain";
  block.append(button);
  block.append(text);

  return block;
}

function deniedDomainList(){
  var result = [], i;
  var elms = document.querySelectorAll(".single-domain span");
  for (i=0; i<elms.length; i++){
    result.push(elms[i].innerHTML);
  }
  return result;
}

function deleteDeniedDomain(e){
  e.preventDefault();

  e.target.parentNode.remove();

  saveOptions(e);
}

function addDeniedDomain(domain){
  document.querySelector("#denied-domains").append(
    _domainTemplate(domain)
  )
}

function addDeniedDomainBtn(e){
  e.preventDefault();
  var dom = document.querySelector("#addDomainName").value.toLowerCase();

  if (/^[a-zA-Z1-9\.\-]+(\.en\.cx|quest\.ua)$/.test(dom)){
    document.querySelector("#addDomainName").className = "";

    if (deniedDomainList().includes(dom)) return;

    addDeniedDomain(dom);
    document.querySelector("#addDomainName").value = "";
  } else {
    document.querySelector("#addDomainName").className = "errorneous";
  }

  saveOptions(e);
}

initLocalization();
document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelectorAll(".option").forEach(function(element){
  element.addEventListener("change", saveOptions);
});
document.querySelector("#addDomainButton").addEventListener("click", addDeniedDomainBtn)
