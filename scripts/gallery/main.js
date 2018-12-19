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

"use strict";

// Get gallery title: name, link to game and link to author.
function preloadTitle(params){
  return new Promise((resolve, reject) => {
    $.get(params["urls"]["header"])
      .done(
        (data) => {
          var html = sanitizeHTML(data);
          var result = $(html).find("td[nowrap=nowrap]").html();

          if (result != undefined){
            resolve($.extend({}, params, {"title": result}));
          } else {
            reject(new Error("No title exists."))
          }
        }
      );
  });
}

// Prepare hash with list of photos and list of stylesheets.
function prepareDataHash(params){
  return new Promise((resolve, reject) => {
    var result = $.extend({}, params);
    $.get(params["urls"]["preview"])
      .done((data) => {
        var html = sanitizeHTML(data);

        result["images"] = [];
        $(html).find("img").each(
          (ind, element) => { result["images"].push($(element).attr('src')); }
        );

        result["styles"] = [];
        var links = data.match(/\<link.*\>/g);
        for (var i=0; i<links.length; i++){
          if ($(links[i]).attr("rel") == "stylesheet"){
            result["styles"].push($(links[i]).attr("href"));
          }
        }

        resolve(result);
      });
  });
}

function sendComment(event){
  if (undefined === this) return;

  var glid = new URLSearchParams(window.location.search).get("glid");
  var pid = $(this).parents("div[data-name]").attr('data-name');

  var params = {
    "NewComment": $($(this).parents("table")[0]).find("textarea").val(),
    "AddComment.x": 42,
    "AddComment.y": 19
  };

  $.each(this.attributes, (i, a) => {
    if (a.name.substr(0, 2) == "__"){ params[a.name.toUpperCase()] = a.value; }
  });

  $.post(`${location.origin}/PhotoGalleryZoom.aspx?glid=${glid}&pid=${pid}`, params)
    .done((data) => { printComments(extractComments(data)); })
}

function removeComment(event){
  event.preventDefault();

  $.get(location.origin + $(this).attr('href'))
    .done((data) => { printComments(extractComments(data)); });
}

function loadComments(image){
  var params = {
    "glid": new URLSearchParams(window.location.search).get("glid"),
    "pid": image
  };

  return new Promise((resolve, reject) => {
    $.get( `${location.origin}/PhotoGalleryZoom.aspx`, params)
      .done((data) => {
        var result = extractComments(data);
        if (null !== result){
          resolve(result);
        } else {
          reject();
        }
      });
  });
}

function extractComments(data){
  var html = sanitizeHTML(data);

  if ($(html).find("div.hr").parents("table").length === 0) return null;

  var text = $($(html).find("div.hr").parents("table")[0])         // Select comments table
               .find("script").remove().end()                      // Remove all scripts
               .find("#enhlDeleteComment")
                 .removeAttr('id').addClass('removeComment').end() // Replace invalid ID with class
               .html().replace(/\&nbsp;/g, ' ');                   // Replace spaces

  var result = {
    "text": `<table>${text}</table>`,
    "parameters": $(html).find("input[type=hidden]").map((index, element) => {
      return {
        "name": $(element).attr("name"),
        "value": $(element).val()
      };
    })
  };

  return result;
}

function printComments(result){
  var scope = window.fotorama.data('fotorama').activeFrame.html;
  $(".gallery-comments", scope).html(null === result ? "" : result["text"]);

  var params = new URLSearchParams(location.search);
  params.set('pid', window.current_photo_name);
  $(".gallery-comments", scope).prepend(
    $("<a>", {
      "target": "_blank",
      "title": chrome.i18n.getMessage("sharePhotoLinkTooltip"),
      "href": location.origin + location.pathname + '?' + params.toString()
    })
    .append(
      $("<img>", { "src": chrome.extension.getURL("img/link.png") })
    )
  );

  if (null === result) return;

  $(".gallery-comments input", scope).on('click', sendComment);

  $.each(result["parameters"], (k, v) => {
    $(".gallery-comments input", scope).attr(v["name"], v["value"]);
  });

  $(".removeComment").on('click', removeComment)
}

function buildHTML(data){
  $("frameset").remove();

  $("html").append(
    $("<body>")
      .append(
        $("<p>")
          .addClass("gallery-title")
          .append(data["title"])
      )
      .append(
        $("<div>").addClass("fotorama")
      )
  );

  data["styles"].forEach((style) => {
    $("head").append(
      $("<link>", { "rel": "stylesheet", "href": style })
    );
  });

  markBodyWithBrowser();

  data["images"].forEach((photo) => {
    var filename = /\/([a-zA-Z0-9\.]*)$/.exec(photo)[1];
    $(".fotorama").append(
      $("<div>", { "data-thumb": photo, "data-name": filename })
        .addClass("gallery-flexible")
        .append(
          $("<img>", {"src": photo.replace('previews/', '')})
        )
        .append(
          $("<div>")
            .addClass("gallery-comments fotorama__select")
        )
    );
  });
}

function startFotorama(data){
  // get index of image from URL
  var index = data["images"].findIndex((element) => {
    return new RegExp(`${data["current"]}$`).test(element);
  });

  window.fotorama = $(".fotorama")
    .on(
      "fotorama:show",
      (e, fotorama, extra) => {
        if (window.current_photo_name == fotorama.activeFrame.name) return;
        window.current_photo_name = fotorama.activeFrame.name;

        loadComments(fotorama.activeFrame.name).then(
          (result) => { printComments(result); },
          () => { printComments(null); }
        );
      }
    )
    .fotorama({
      "nav": "thumbs",
      "navposition": "top",
      "auto": false,
      "height": "95%",
      "width": "100%",
      "startindex": index
    });
}

$(function(){
  window.current_photo_name = '';
  isDomainEnabled()
    .then(() => {
      var params = {
        "urls": {
          "header": location.origin + $("frame:eq(0)").attr('src'),
          "preview": location.origin + $("frame:eq(1)").attr('src'),
          "zoom": location.origin + $("frame:eq(2)").attr('src')
        }
      };
      $("frameset").remove();
      return preloadTitle(params);
    })
    .then((data) => {
      return prepareDataHash(
        $.extend(
          data,
          { "current": new URLSearchParams(window.location.search).get("pid") }
        )
      );
    })
    .then((data) => {
      buildHTML(data);
      startFotorama(data);
    });
});
