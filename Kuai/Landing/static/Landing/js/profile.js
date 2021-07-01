var geocoder; 
var map;
var markers = [];

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
    makeBusinesses(userHistory, markers).then(function(){
        linkMarkerToButtons(userHistory, markers, ".HistoryButtons")
        $(".HistoryName").each(async function(i, obj){
            index = await bizHash.getIndex(userHistory[i])// find the index of the placeID in the marker array
            parent = markers[index];
            let parentName = await parent.getName()
            $(this).html(String(parentName));
            });
    });
        
    
}


/**Creates display and adds Business objects from placeIDs to array
 * @param {String[]} place_ids list of place ids
 * @param {Business[]} markerarray list of Businesses
 * @param {function(Business)} callback callback run after the Business object is created
 }}
 */
async function makeBusinesses(place_ids, markerarray){
    for (i in place_ids){
        if (!(await bizHash.doesExistorAdd(place_ids[i], markerarray.length))) {
            let parent = new Business( place_ids[i],markerarray.length , null, null, function(){
                this.showMarker(); // show marker 
            }, );
            markerarray.push(parent);    
        }

    }
}

/**
 * Links markers to buttons of a certain class
 * @param {String[]} place_ids list of place ids
 * @param {Business[]} markerarray 
 * @param {String} targetString String of the class - starting with . (ex ".HistoryButtons")
 */
function linkMarkerToButtons(place_ids, markerarray, targetString){
    $(targetString).each(function(i, obj){
        $(this).click(async function(){
            const PlaceID = place_ids[i];
            index = await bizHash.getIndex(PlaceID)// find the index of the placeID in the marker array
            parent = markerarray[index];
            parent.goTo(); // center on marker
            
        })
    }); 
    
}
