function createMap(){
    document.getElementById('map').style.height = '500px';
    map = new google.maps.Map(document.getElementById('map'), {
            //the map is initially set to have a view of Singapore
            center: {lat: 1.34, lng: 103.83},
            zoom: 11
        });
    showHeatMap(map);
}

function showHeatMap(map){
    fetch('/Location').then((response) => {
        return response.json();
    }).then((locations) => {
        heatMapData = locations.map(function(cur, index, arr){
            if(index < 10) {
                createMarker(map, cur, index + 1);
            }
            return {location: new google.maps.LatLng(cur.lat,cur.lng), weight: cur.count};
        });
        var heatmap = new google.maps.visualization.HeatmapLayer({
            data: heatMapData
        });
        heatmap.setMap(map);
    });
}

function createMarker(map, location, rank){
    const marker = new google.maps.Marker({
        position: {lat: location.lat, lng: location.lng},
        title: location.name,
        label: String(location.count),
        map: map
    });

    var infoWindowContent = document.createElement("div");
    infoWindowContent.classList.add('info');

    var title = document.createElement("h1");
    title.appendChild(createLocationLink(location));
    infoWindowContent.appendChild(title);

    var visitCount = document.createElement("h2");
    visitCount.appendChild(document.createTextNode(location.count + " visits by our users!"));
    infoWindowContent.appendChild(visitCount);

    const infoWindow = new google.maps.InfoWindow({
        content: infoWindowContent,
        maxWidth: 300
    });

    marker.addListener('click', ()=>{
        infoWindow.open(map, marker);
    });
}

function createLocationLink(location) {
    var locationLink = document.createElement("a");
    if(typeof location.id == 'undefined') {
        locationLink.href = "/feed.html";
    } else{
        locationLink.href = "/feed.html?locationid="+location.id+"&name="+location.name;
    }
    locationLink.classList.add('locationLink');
    locationLink.innerHTML = location.name;
    return locationLink;
}
