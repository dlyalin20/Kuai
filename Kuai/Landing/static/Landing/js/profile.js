var geocoder; 

function initialize() {
    geocoder = new google.maps.Geocoder()

    getLocation();
}