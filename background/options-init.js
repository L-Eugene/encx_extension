chrome.runtime.onInstalled.addListener(
  function (details){
    if (details.reason == "install"){
      chrome.storage.local.set({
        "selectSentCode": true,
        "refreshRate": 5,
        "deniedDomains": ""
      });
    }
  }
);
