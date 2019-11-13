/*
MIT License

Copyright (c) 2019 Eugene Lapeko

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

class GamePageAction extends GameManager {
  constructor(){
    super();

    // Enable pageAction
    chrome.runtime.sendMessage({ "message": "activate_icon" });

    // Getting and setting options for this game
    chrome.runtime.onMessage.addListener(
      $.proxy(this.gameOptionsListener, this)
    );
  }

  initialize(storage) {}

  update(storage) {}

  gameOptionsListener(msg, sender, response){
    if ((msg.from === 'page_action') && (msg.subject === 'get_options')) {
      var data = {
        "hide-disclosed-sectors": localStorage.getItem(`${this.storage.getGameId()}-hide-disclosed-sectors`) || false,
        "hide-complete-bonuses": localStorage.getItem(`${this.storage.getGameId()}-hide-complete-bonuses`) || false,
        "show-complete-bonus-task": localStorage.getItem(`${this.storage.getGameId()}-show-complete-bonus-task`) || false,
        "show-complete-bonus-code": localStorage.getItem(`${this.storage.getGameId()}-show-complete-bonus-code`) || false,
        "enable-sound": localStorage.getItem(`${this.storage.getGameId()}-enable-sound`) || false,
        "auto-focus": localStorage.getItem(`${this.storage.getGameId()}-auto-focus`) || true,
        "refresh-rate": localStorage.getItem(`${this.storage.getGameId()}-refresh-rate`),
        "domain": location.hostname
      };

      response(data);
    } else if ((msg.from === 'page_action') && (msg.subject === 'set_options')) {
      for (var key in msg.data){
        // disable-domain option is processed later
        if (key == 'disable-domain') continue;
        localStorage.setItem(`${this.storage.getGameId()}-${key}`, msg.data[key]);
      }

      // process disable-domain option
      chrome.storage.local.get(
        { 'deniedDomains': "" },
        (result) => {
          var domains = result.deniedDomains.split("|");
          if (domains.includes(location.hostname) != msg.data['disable-domain']){
            if (msg.data['disable-domain']) {
              // Add domain to disabled list
              domains.push(location.hostname);
            } else {
              // Exclude domain from disabled list
              domains = domains.filter((value) => { return value != location.hostname });
            }

            // Save updated value
            chrome.storage.local.set(
              { 'deniedDomains': domains.join('|') },
              () => {
                // Reload page. We just added or removed current domain to
                //   disabled domain list.
                location.reload();
              }
            );
          }

          if (!domains.includes(location.hostname)){
            // Mark all bonuses for update because tasks or codes can be
            // needed to print or to remove
            $(".bonus-block").attr("update-mark", true);

            this.storage.update({}, true);
          }
        }
      )
    }
  }
};
