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
function preloadTitle(){
  return new Promise((resolve, reject) => {
    $(window.frames[0].document).ready(function(){
      var result = $("td[nowrap=nowrap]", window.frames[0].document).html();

      if (result != undefined){
        resolve(result);
      } else {
        reject(new Error("No title exists."))
      }
    });
  });
}

// Prepare hash with list of photos and list of stylesheets.
function prepareDataHash(initial = {}){
  return new Promise((resolve, reject) => {
    var result = $.extend({}, initial);

    $(window.frames[1].document).ready(function(){
      result["images"] = [];
      $("img", window.frames[1].document).each(
        (ind, element) => { result["images"].push($(element).attr('src')); }
      );

      result["styles"] = [];
      $("head link[rel=stylesheet]", window.frames[1].document).each(
        (ind, element) => { result["styles"].push($(element).attr('href')); }
      );

      resolve(result);
    });
  });
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
    $(".fotorama").append(
      $("<a>", { "href": photo.replace('previews/', '') })
        .append($("<img>", { "src": photo }))
    );
  });
}

function startFotorama(data){
  // get index of image from URL
  var index = data["images"].findIndex((element) => {
    return new RegExp(`${data["current"]}$`).test(element);
  });

  $(".fotorama").fotorama({
    "nav": "thumbs",
    "navposition": "top",
    "auto": false,
    "height": "95%",
    "width": "100%",
    "startindex": index
  });
}

$(function(){
  isDomainEnabled()
    .then(() => {
      $("frameset").hide();
      return preloadTitle();
    })
    .then((title) => {
      var current = new URLSearchParams(window.location.search).get("pid");
      return prepareDataHash({
        "title": title,
        "current": current
      });
    })
    .then((data) => {
      buildHTML(data);
      startFotorama(data);
    });
});
