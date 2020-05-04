/*
MIT License

Copyright (c) 2019-2020 Eugene Lapeko

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

class GameLevelListManager extends GameManager {
  constructor(){
    super();
    this.activeLevel = -1;
  }

  initialize(storage){
    if (storage.isStormGame()){
      this.activeLevel = storage.getLevelId();
      $("div.content")
        .append(this._levelListTemplate(storage.getGame()));
      $('#level-list').on('init', (e, slick) => {
        console.log(e, slick);
        $('body').on('mouseover', '.slick-arrow', (e) => {
          $(e.currentTarget).attr('autoscroll', true);
          var Interval = setInterval(
            () => {
              switch ($(e.currentTarget).attr('aria-label')){
                case 'Previous':
                  $('#level-list').slick('slickPrev');
                  break;
                case 'Next':
                  $('#level-list').slick('slickNext');
                  break;
              }

              if ($(e.currentTarget).attr('autoscroll') == undefined){
                clearInterval(Interval);
              }
            },
            250
          );
        });
        $('body').on('mouseout', '.slick-arrow', (e) => {
          $(e.currentTarget).removeAttr('autoscroll');
        });
      })
      $('#level-list').slick({
        slidesToShow: 9,
        slidesToScroll: 5,
        variableWidth: true,
        waitForAnimate: false,
        speed: 150,
        centerMode: true
      });
    }
  }

  update(storage){
    if (storage.isStormGame()){
      storage.getLevels().forEach(
        function(level){
          if (this.storage.isLevelNew(level.LevelId)){
            $("#level-list").slick('slickAdd', this._levelTemplate(level))
          } else if (this.storage.isLevelChanged(level.LevelId)) {
            var index = parseInt($(`#level-${level.LevelId}`).attr('data-slick-index'));
            $("#level-list").slick('slickRemove', index);
            $("#level-list").slick('slickAdd', this._levelTemplate(level), index, true);
          }
        },
        this
      );

      if (storage.isLevelUp()){
        this._scrollToActive();
      }
    }
  }

  _scrollToActive (){
    var index = parseInt($(`.level-active`).attr('data-slick-index'));

    $("#level-list").slick('slickGoTo', index, true);
  }

  _levelListTemplate (game){
    return $("<div>")
      .attr("id", "level-list")
  }

  _levelTemplate (level){
    return $("<div>")
      .addClass("level-block")
      .addClass(this.activeLevel == level.LevelId ? "level-active" : "")
      .addClass(level.Dismissed == true ? "level-dismissed" : "")
      .addClass(level.IsPassed == true ? "level-finished" : "")
      .attr("level-number", level.LevelNumber)
      .attr("level-id", level.LevelId)
      .attr("id", `level-${level.LevelId}`)
      .append(
        $("<i>")
          .append(level.LevelNumber)
      )
      .append(
        $("<div>")
          .addClass("line")
      )
      .append(
        $("<p>")
          .append(level.LevelName)
      )
      .click(
        { storage: this.storage },
        function(event){
          $(".level-block").removeClass("level-active");
          $(this).addClass("level-active");
          event.data.storage.changeLevel(
            $(this).attr('level-id'),
            $(this).attr('level-number')
          )
        }
      );
  }
};
