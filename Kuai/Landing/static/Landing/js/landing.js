var autocomplete;
// https://stackoverflow.com/questions/12024629/bind-google-places-autocomplete-on-textbox-without-instantiating-a-google-map
function initialize() {
    autocomplete = new google.maps.places.Autocomplete(
        /** @type {HTMLInputElement} */(document.getElementById('search-input')),
        { types: ['geocode'] });
    google.maps.event.addListener(autocomplete, 'place_changed', function() {
        
    });
}