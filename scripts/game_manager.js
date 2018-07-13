// Base class for all managers
class GameManager {
  _timerTemplate(seconds, text = chrome.i18n.getMessage("timerWillBeIn")){
    return $("<span>")
      .append(text)
      .append(
        $("<span>")
          .addClass("countdown-timer")
          .attr("seconds-left", seconds)
          .append(ENEXT.convertTime(seconds))
      );
  }
};
