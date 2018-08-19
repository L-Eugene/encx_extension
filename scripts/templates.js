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

class Templates {
  /*
  Template for historic action record.

  Input:
  {
    "ActionId",
    "LevelId",
    "LevelNumber",
    "UserId",
    "Kind" (1 - code, 2 - bonus),
    "Login",
    "Answer",
    "AnswForm",
    "EnterDateTime":{"Value":63670223431353},
    "LocDateTime",
    "IsCorrect",
    "Award",
    "LocAward",
    "Penalty"
  }
  */
  historicActionTemplate(action){
    return $('<li>')
      .addClass(action.IsCorrect ? 'correct' : '' )
      .append(action.LocDateTime)
      .append('&nbsp;')
      .append(
        $('<a>')
          .attr('href', '/userdetails.aspx?uid=' + action.UserId)
          .append(action.Login)
      )
      .append('&nbsp;')
      .append(
        $('<span>').addClass(
          // data.Level.MixedActions[any].Kind:
          //   1 - code
          //   2 - bonus
          action.IsCorrect ?
            'color_' + (action.Kind == 1 ? 'correct' : 'bonus') : ''
        ).append(action.Answer)
      );
  }
};

var encx_tpl = new Templates();
