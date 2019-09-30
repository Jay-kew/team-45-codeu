/* Initialize map with three fixed markers*/
function createDefaultMap(){
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 1.34, lng: 103.8},
    zoom: 11
  });
}

function createMapWithDefaultMarkers(){
  createDefaultMap();
  createMarker(1.280547, 103.844502, 'Maxwell Food Centre', '1 Kadayanallur St 069184',
                'http://www.okoguide.com/upload/img/objects/Singapore/SINGAPORE_8282.jpg');
  createMarker(1.308398, 103.885808, 'Old Airport Road Food Centre', '51 Old Airport Rd, Singapore 390051',
                'https://sethlui.com/wp-content/uploads/2018/07/old-airport-road-food-centre-11-800x532.jpg');
  createMarker(1.331814, 103.938867, 'Bedok 85 Market', '85 Bedok North Street 4, Singapore 460085',
                'http://danielfooddiary.com/wp-content/uploads/2019/03/fengshan29.jpg');
}

function infoContent(title, address, img_url){
  var infoDiv = document.createElement('div');
  infoDiv.classList.add('info');
  var name = document.createElement('h1');
  name.innerHTML = title;
  var img = document.createElement('img');
  img.src = img_url;
  var addr = document.createElement('p');
  addr.innerHTML = 'Address: ' + address;
  infoDiv.appendChild(img);
  infoDiv.appendChild(name);
  infoDiv.appendChild(addr);
  return infoDiv;
}

/* Add landmark to map */
function createMarker(lat, lng, title, address, img_url) {
  const marker = new google.maps.Marker({
    position: {lat: lat, lng: lng},
    map: map,
    title: title
  });
  const infoWindow = new google.maps.InfoWindow({
    content: infoContent(title, address, img_url),
    maxWidth: 300
  });
  marker.addListener('click', function() {
    infoWindow.open(map, marker);
  });
}

function buildUI(){
  createMapWithDefaultMarkers();
}
