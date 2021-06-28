var geocoder; 
var map;
function initialize() {
    geocoder = new google.maps.Geocoder()

    getLocation();
}


function getLocation() {
    const options = {
        enableHighAccuracy: true,
        // timeout: 5000, // => default infinity // take as much time as you need
        maximumAge: 500,
    };
    var x = document.getElementById("show");
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(mainLoop, function error(msg) { console.log(msg); }, options);
    }
    else {
        x.innerHTML = "Geolocation is not supported by this browser.";
        mainLoop();
    }

}

// @param location - location of User
function mainLoop(hasLocation){
    if (hasLocation != null){
        initMap({ lat: hasLocation.coords.latitude, lng: hasLocation.coords.longitude })
    }else if(true){ // display the last wait time entry coords
    
    }else{
        // display stuyvesant
        initMap({ lat: 40.7178149, lng: -74.0138422 })
    }

}

function initMap(center){
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 18,
        center: center,
    });
    var marker = new google.maps.Marker({ position: center, map: map });

}