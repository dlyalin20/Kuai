const autocomplete_input = document.getElementById('search-input')
var autocomplete;
// https://stackoverflow.com/questions/12024629/bind-google-places-autocomplete-on-textbox-without-instantiating-a-google-map
function initialize() {
    autocomplete = new google.maps.places.Autocomplete(
        /** @type {HTMLInputElement} */(autocomplete_input),
        { 
        // types that we will auto compelete for + search for
        types: ['geocode', 'establishment'],
        fields: ['place_id'] });
    google.maps.event.addListener(autocomplete, 'place_changed', search);
    $('#search-submit').on('click', function(event){
        event.preventDefault();
        search();
    })
    
    function search() {
        const place = autocomplete.getPlace();
        console.log(place);
        if (place == undefined) {
            // User entered the name of a Place that was not suggested and
            // pressed the Enter key, or the Place Details request failed.
            //=> route to advanced search
            window.location.href = '/go?q=' + autocomplete_input.value;
          }
        // //   good this exists, go to go screen with this data
        else{
            console.log(place.place_id);
            window.location.href = '/go?q='+ autocomplete_input.value + '&id=' + place.place_id;
        }
    }
}