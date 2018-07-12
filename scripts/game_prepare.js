class GamePrepare {
  constructor (){
    // Prepare game menu
    $(".header li.mail").remove();
    $(".header li.discuss a").attr("target", "_blank");

    // Show level stat in dialog
    $(".levelstats a").click(showLevelStat);

    // Open link to announce in new tab
    $("a#lblGameTitle").attr("target", "_blank");

    // Replace Encounter logo
    $("a.logo").attr("target", "_blank");
    $("a.logo img").attr("src", chrome.extension.getURL("img/logo-96.png"));
  }

  initialize (storage){
    $("div.content").empty();
  }

  update (storage) {}
}
