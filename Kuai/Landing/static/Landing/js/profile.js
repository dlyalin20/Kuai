var geocoder; 
var map;
var markers = [];
var bizHash = new hashtable();
var service;
// Starting Function
function initialize() {
    console.log(userHistory);
    geocoder = new google.maps.Geocoder()

    getLocation();
}

/** Function that finds User Pos
 */
function getLocation() {
    const options = {
        enableHighAccuracy: true,
        // timeout: 5000, // => default infinity // take as much time as you need
        maximumAge: 500,
    };
    var x = document.getElementById("show");
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(initMap, function error(msg) { 
            console.log(msg); 
            initMap();
        }, options);
    }
    else {
        x.innerHTML = "Geolocation is not supported by this browser.";
        initMap();
    }

}


/** Function that starts up the map
 * 
 * @param {GeolocationPosition} center Location of the User or null
 */
function initMap(center){
    if (center != null){
        googleCenter = {lat: center.coords.latitude, lng: center.coords.longitude};
        map = new google.maps.Map(document.getElementById('map'), {
            zoom: 18,
            center: googleCenter,
        });
        var marker = new google.maps.Marker({ position: googleCenter, map: map });
    }else{
        map = new google.maps.Map(document.getElementById('map'), {
            zoom: 18,
            center:{ lat: 40.7178149, lng: -74.0138422 }
        });
    }
    service = new google.maps.places.PlacesService(map);
    makeBusinesses(userHistory);
}


/**Creates and display Business objects from placeIDs, linking them to go-to buttons
 * @param {String[]} place_ids list of place ids
 */
function makeBusinesses(place_ids){
    for (i in place_ids){

        let temp = new Business( place_ids[i], null, null, function(){
            this.addHash(); //eventually adds hash        
            this.showMarker(); // show marker 
        }, i );
        markers.push(temp);
    }
}