var TILE_SIZE = 256;

/**
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 */
// https://stackoverflow.com/a/6274381
function shuffle(a) {
  var j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
}

// Normalize the -500 500 coordinates to 0 256
function normalizeTo256(x, y) {
  return new google.maps.Point((x + 500) / 1000 * 256, (y + 500) / 1000 * 256);
};

// The mapping between latitude, longitude and pixels is defined by the web
// mercator projection.
function project(latLng) {
  var siny = Math.sin(latLng.lat() * Math.PI / 180);

  // Truncating to 0.9999 effectively limits latitude to 89.189. This is
  // about a third of a tile past the edge of the world tile.
  siny = Math.min(Math.max(siny, -0.9999), 0.9999);

  return new google.maps.Point(
    TILE_SIZE * (0.5 + latLng.lng() / 360),
    TILE_SIZE * (0.5 - Math.log((1 + siny) / (1 - siny)) / (4 * Math.PI)));
};

// Inverse function of the project funtion to find the coordinates as if they're in real life
function inverseProject(point) {
  var a = (Math.pow(Math.E, (4 * Math.PI * (0.5 - point.y / TILE_SIZE))) - 1) / (Math.pow(Math.E, (4 * Math.PI * (0.5 - point.y / TILE_SIZE))) + 1);
  a = Math.min(Math.max(a, -0.9999), 0.9999);
  a = (180 * Math.asin(a)) / Math.PI;
  return new google.maps.LatLng(a, 360 * (point.x / 256 - 0.5));
};

// Create the info windows for each city
function createInfoWindowContent(cityName, latLng, mernatoir, story, cityNumber) {
  return [
    cityName,
    '<img border=\"0\" src=\"./Flags/Flag (' + cityNumber + ').png\" width=\"90\" height=\"60\">',
    '<img border=\"0\" src=\"./Medieval/City (' + cityNumber + ').jpg\" width=\"300\" height=\"200\">',
    'LatLng: ' + latLng,
    'Mernatoir Coordinate: ' + mernatoir,
    story
  ].join('<br>');
};

// Info window events
function make_callback(map, point, city, infowindow, story, cityNumber) {
  return function() {
    infowindow.setContent(createInfoWindowContent(point.title, point.position,
      new google.maps.Point(city.cx.baseVal.value, city.cy.baseVal.value), story.replace(/placeholder/g, point.title), cityNumber));
    var infoMap = infowindow.getMap();
    if (infoMap !== null && typeof infoMap !== "undefined") {
      infowindow.close();
    } else {
      infowindow.open(map, point);
    }
  };
}

// Add the markers and the info windows in to the map
function setMarkers(map, cityNames, cities, cityLatLng, cityNumbers, stories, markers, infoWindows) {
  var image = {
    url: './transparentIcon.png',
    size: new google.maps.Size(40, 40),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(20, 20)
  };

  var shape = {
    coords: [1, 1, 39, 39],
    type: 'rect'
  };

  for (var i = 0; i < cityLatLng.length; i++) {
    markers.push(new google.maps.Marker({
      position: {
        lat: cityLatLng[i].lat(),
        lng: cityLatLng[i].lng()
      },
      map: map,
      icon: image,
      shape: shape,
      title: cityNames[i].innerHTML
    }));

    infoWindows.push(new google.maps.InfoWindow());
    // Add event listeners to each info window
    google.maps.event.addListener(markers[i], 'click', make_callback(map,
      markers[i], cities[i], infoWindows[i], stories[cityNumbers[i]], cityNumbers[i]));
  }
}
