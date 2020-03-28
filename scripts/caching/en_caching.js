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
