function initAutocomplete() {
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 1.34, lng: 103.8},
    zoom: 13
  });
  setCenterToCurrentLoc(map);

  var card = document.getElementById('pac-card');
  var input = document.getElementById('pac-input');
  var types = document.getElementById('type-selector');
  var strictBounds = document.getElementById('strict-bounds-selector');

  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(card);
  input.onkeypress = function(e) {
    var key = e.charCode || e.keyCode || 0;
    if (key == 13) {
      e.preventDefault();
    }
  };
  var autocomplete = new google.maps.places.Autocomplete(input);

  // Bind the map's bounds (viewport) property to the autocomplete object,
  // so that the autocomplete requests use the current map bounds for the
  // bounds option in the request.
  autocomplete.bindTo('bounds', map);

  // Set the data fields to return when the user selects a place.
  autocomplete.setFields(
      ['address_components', 'geometry', 'icon', 'name','place_id']);

  var infowindow = new google.maps.InfoWindow();
  var infowindowContent = document.getElementById('infowindow-content');
  infowindow.setContent(infowindowContent);
  var marker = new google.maps.Marker({
    map: map,
    anchorPoint: new google.maps.Point(0, -29)
  });

  autocomplete.addListener('place_changed', function() {
    infowindow.close();
    marker.setVisible(false);
    var place = autocomplete.getPlace();
    if (!place.geometry) {
      // User entered the name of a Place that was not suggested and
      // pressed the Enter key, or the Place Details request failed.
      window.alert("No details available for input: '" + place.name + "'");
      return;
    }

    // If the place has a geometry, then present it on a map.
    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport);
    } else {
      map.setCenter(place.geometry.location);
      map.setZoom(16);
    }
    marker.setPosition(place.geometry.location);
    marker.setVisible(true);

    var address = '';
    if (place.address_components) {
      address = [
        (place.address_components[0] && place.address_components[0].short_name || ''),
        (place.address_components[1] && place.address_components[1].short_name || ''),
        (place.address_components[2] && place.address_components[2].short_name || '')
      ].join(' ');
    }

    infowindowContent.children['place-icon'].src = place.icon;
    infowindowContent.children['place-name'].textContent = place.name;
    infowindowContent.children['place-address'].textContent = address;
    infowindow.open(map, marker);

    if (document.getElementsByName("lat").length != 0){
      replaceLocationInfo(place);
    }
    else{
      addLocationInfoToForm(place);
    }
    showLocationChosen(place.name);

  });

  // Sets a listener on a radio button to change the filter type on Places
  // Autocomplete.
  function setupClickListener(id, types) {
    var radioButton = document.getElementById(id);
    radioButton.addEventListener('click', function() {
      autocomplete.setTypes(types);
    });
  }

  setupClickListener('changetype-all', []);
  setupClickListener('changetype-address', ['address']);
  setupClickListener('changetype-establishment', ['establishment']);
  setupClickListener('changetype-geocode', ['geocode']);

  document.getElementById('use-strict-bounds')
      .addEventListener('click', function() {
        console.log('Checkbox clicked! New state=' + this.checked);
        autocomplete.setOptions({strictBounds: this.checked});
      });
}


function setCenterToCurrentLoc(map){
  var infoWindow = new google.maps.InfoWindow();
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      infoWindow.setPosition(pos);
      infoWindow.setContent('Current Location Detected');
      infoWindow.open(map);
      map.setCenter(pos);
      currentPos = pos;
    }, function() {
      handleLocationError(map, true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(map, false, infoWindow, map.getCenter());
  }
}

function handleLocationError(map, browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
  infoWindow.open(map);
}

function addLocationInfoToForm(place){
  var latInput = document.createElement("input");
  latInput.setAttribute("type", "hidden");
  latInput.setAttribute("name", "lat");
  latInput.setAttribute("value", place.geometry.location.lat());

  var lngInput = document.createElement("input");
  lngInput.setAttribute("type", "hidden");
  lngInput.setAttribute("name", "lng");
  lngInput.setAttribute("value", place.geometry.location.lng());

  var nameInput = document.createElement("input");
  nameInput.setAttribute("type", "hidden");
  nameInput.setAttribute("name", "location_name");
  nameInput.setAttribute("value", place.name);

  var idInput = document.createElement("input");
  idInput.setAttribute("type", "hidden");
  idInput.setAttribute("name", "location_id");
  idInput.setAttribute("value", place.place_id);

  document.getElementById("message-form").appendChild(latInput);
  document.getElementById("message-form").appendChild(lngInput);
  document.getElementById("message-form").appendChild(nameInput);
  document.getElementById("message-form").appendChild(idInput);
}

function replaceLocationInfo(place){
  document.getElementsByName("lat")[0].value = place.geometry.location.lat();
  document.getElementsByName("lng")[0].value = place.geometry.location.lng();
  document.getElementsByName("location_name")[0].value = place.name;
  document.getElementsByName("location_id")[0].value = place.place_id;
}

function showLocationChosen(name){
  var message = document.getElementById('location-message');
  message.innerHTML = "Location Chosen: " + name;
  message.classList.remove('hidden');
}

function loadMarkdownEditor() {
  let simplemde = new SimpleMDE({
    autoDownloadFontAwesome: true,
  	autosave: {
  		enabled: true,
  		uniqueId: "message "
  	},
  	element: document.getElementById("message-input"),
  	forceSync: true,
  	status: false
  });
}

function preventAutoSubmit() {
  document.getElementById("submit").onkeypress = function(e) {
    var key = e.charCode || e.keyCode || 0;
    if (key == 13) {
      e.preventDefault();
    }
  };
}

/** Fetches data and populates the UI of the page. */
function buildUI() {
  initAutocomplete();
  loadMarkdownEditor();
  preventAutoSubmit();
}