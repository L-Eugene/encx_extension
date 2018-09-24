chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.message === "activate_icon") {
      chrome.pageAction.show(sender.tab.id);
    }
  }
);
