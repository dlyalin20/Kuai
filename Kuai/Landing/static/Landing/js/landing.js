const autocomplete_input = document.getElementById('search-input')
var autocomplete;
// https://stackoverflow.com/questions/12024629/bind-google-places-autocomplete-on-textbox-without-instantiating-a-google-map
function initialize() {
    autocomplete = new google.maps.places.Autocomplete(
        /** @type {HTMLInputElement} */(autocomplete_input),
        { types: ['geocode'], fields: ['place_id', 'name', 'types'] });
    google.maps.event.addListener(autocomplete, 'place_changed', search);
    $('#search-submit').on('click', function(event){
        event.preventDefault();
        search();
    })
    
    function search() {
        const place = autocomplete.getPlace();
        console.log(place);
        console.log(JSON.stringify(place));
        var fd = new FormData();
        var target;
        if (place == undefined) {
            // User entered the name of a Place that was not suggested and
            // pressed the Enter key, or the Place Details request failed.
            // window.alert("No details available for input: '" + place.name + "'");
            // fd.append('q', autocomplete_input.value );
            // target = "search"
            window.location.href = '/search?q=' + autocomplete_input.value;
          }
        //   good this exists, go to go screen with this data
        else{
            console.log(place.place_id);
            var fd = new FormData();
            fd.append('id', place.place_id);
            target = "go"
        }
        
        $.ajax({ 
            type: "GET",
            url : target,
            // url:'', 
            data : fd,
            async : false, // we are leaving this page
            processData: false,
            contentType: "multipart/form-data",
            success : function(result){
                console.log(result);
            }
        });
    }
}