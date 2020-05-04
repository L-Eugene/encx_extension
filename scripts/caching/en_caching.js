/*
MIT License

Copyright (c) 2020 Eugene Lapeko

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

markBodyWithBrowser();

var GM_script = $("#Maps_divCanvas").closest("td").find("script").text();
if (GM_script != ''){
  // Get task coords from Google Maps init script
  var match = /GLatLng\(([0-9\.]+),\s*([0-9\.]+)\)/.exec(GM_script);
  var latitude  = match[1];
  var longitude = match[2];

  // Remove Google Map from page
  $("#Maps_divCanvas").closest("td").attr("id", "map-container").addClass('dark');
  $("#map-container").empty();

  // Put MapBox map instead
  L.mapbox.accessToken = 'pk.eyJ1IjoiZXVnZW5lLWwiLCJhIjoiY2s4YW84MnJuMDQ3dzNkbTMwYWxqZnFrOSJ9.FCnrYdEry-xHjPw-Y84aJQ';
  var map = L.mapbox.map('map-container')
      .setView([longitude, latitude], 9)
      .addLayer(L.mapbox.styleLayer('mapbox://styles/mapbox/dark-v10'))

  L.marker([longitude, latitude]).addTo(map);
}
