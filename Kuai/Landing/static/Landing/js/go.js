// var autocomplete;
var pos;
// https://stackoverflow.com/questions/12024629/bind-google-places-autocomplete-on-textbox-without-instantiating-a-google-map
function initialize() {
    const Google_Places_API_KEY = "jAIzaSyBzd999zA1_gyh7uB6KpUh-hBaYsl0vmIQ";
    var map;
    let service;
    
    if(!(q==="")){
        toggleSidePanel();
    }
    // let infowindow;
    const input = document.getElementById('search-input')
    var sessionToken = new google.maps.places.AutocompleteSessionToken();
    // var autocomplete = new google.maps.places.Autocomplete(
    //     /** @type {HTMLInputElement} */(input),
    //     { 
    //     // types that we will auto compelete for + search for
    //     types: ['establishment'],
    //     fields: ['place_id'] });
    var autocomplete = new google.maps.places.AutocompleteService();
    getLocation();
    $("#arrow").click(toggleSidePanel);
    function search() {
        
        advQuery = input.value;
        var request = {
            input: advQuery,
            // fields: ["name", "geometry", "place_id"],
            sessionToken: sessionToken,
            // 
          };
        if (pos){
            console.log(pos);
            request["location"] = new google.maps.LatLng(pos);
            request["radius"]= 500;
        }
        if (advQuery){
            autocomplete.getPlacePredictions(
                request,
                displaySuggestions);
            function displaySuggestions(results){
                console.log(results);
                htmlString = "";
                // for (let i = 0; i < results.length; i++) {
                // // createMarker(results[i]);
                //     htmlString += `<div class='option-items' location = `+results[0].geometry.location+`>
                //         ` + (i + 1) + '. ' + results[i].name + '|' + results[0].geometry.location +
                //         `
                //     </div>`;
                //     createMarker(results[i]);
                // }
            }
            // Place autocomplete written in server side code :head smack


            // $.getJSON('https://maps.googleapis.com/maps/api/place/autocomplete/json?input='+ advQuery+
            // '&types=establishment' + location + '&radius=500&key=' + Google_Places_API_KEY, null, gatherResults)

            // function gatherResults(data) { 
            //     var items = [];
            //     $.each( data, function( key, val ) {
            //         items.push(key + " : " + val);
            //     });
            //     console.log(items);
            //     return function(data){
            //     var p = data.results[0].geometry.location;
            //     var latlng = new google.maps.LatLng(p.lat, p.lng);
            //     var marker = new google.maps.Marker({
            //       position: latlng,
            //       title: adresa,
            //       map: map

                  
            //     }); 
            //     markers.push(marker); 
            //   }
            // }
        
            // service = new google.maps.places.PlacesService(map);
            // service.findPlaceFromQuery(request, (results, status) => {
            //     if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            //         console.log(results);
            //         var htmlString ="";
            //         for (let i = 0; i < results.length; i++) {
            //         // createMarker(results[i]);
            //             htmlString += `<div class='option-items' location = `+results[0].geometry.location+`>
            //                 ` + (i + 1) + '. ' + results[i].name + '|' + results[0].geometry.location +
            //                 `
            //             </div>`;
            //             createMarker(results[i]);
            //         }
            //         console.log(htmlString);
            //         $("#choices").html(htmlString)
            //         // set the center for the map to be the best search + apply markers
            //         map.setCenter(results[0].geometry.location);
                }
              };
        
    
    function createMarker(place) {
        if (!place.geometry || !place.geometry.location) return;
        const marker = new google.maps.Marker({
          map,
          position: place.geometry.location,
        });
        google.maps.event.addListener(marker, "click", () => {
          infowindow.setContent(place.name || "");
          infowindow.open(map);
        });
      }
    //---- get location of user//
    function getLocation(){
        var x=document.getElementById("show");
        if (navigator.geolocation){
            navigator.geolocation.getCurrentPosition(showPosition);
          }
        else{
          x.innerHTML="Geolocation is not supported by this browser.";
        }
        
    }
    const geocoder = new google.maps.Geocoder();

    function lockOn(targetID){
        
        if (targetID ){ //!= ""
        geocoder.geocode({ placeId: targetID }, (results, status) => {
          console.log('geocode start');
          targetingPlace = true;
          if (status !== "OK" && results) {
            window.alert("Geocoder failed due to: " + status);
            return;
          }
          
          // Set the position of the marker using the place ID and location.
          pos = results[0].geometry.location
          map.setCenter(pos);
          createMarker(results[0]);
        });
      }
    }
    function showPosition(position){
      
        if(!(q==="")){
            console.log("query q= " + q + " targetID = " + targetID);
            input.value = q;
            if(!(targetID==="")){
                pos = lockOn(targetID);
            }else{
                pos = {lat: position.coords.latitude, lng: position.coords.longitude};
                search();
            }
        }
        else{
            console.log("No query sent in, Default to user position");
            pos = {lat: position.coords.latitude, lng: position.coords.longitude};
            console.log("after: " + pos);
            
        }
        
        $('#search-submit').on('click', function(event){
            event.preventDefault();
            search();
        })
        initMap();
    }
        
        
    

    function initMap() {
        console.log("pos: " )   
        console.log(pos);
        //setting up map
        map = new google.maps.Map(document.getElementById('map'), {
        zoom: 18,
        center: pos,
    //     styles: [
    // {
    //     "elementType": "geometry",
    //     "stylers": [
    //     {
    //         "color": "#f5f5f5"
    //     }
    //     ]
    // },
    // {
    //     "elementType": "labels.icon",
    //     "stylers": [
    //     {
    //         "visibility": "off"
    //     }
    //     ]
    // },
    // {
    //     "elementType": "labels.text.fill",
    //     "stylers": [
    //     {
    //         "color": "#616161"
    //     }
    //     ]
    // },
    // {
    //     "elementType": "labels.text.stroke",
    //     "stylers": [
    //     {
    //         "color": "#f5f5f5"
    //     }
    //     ]
    // },
    // {
    //     "featureType": "administrative.land_parcel",
    //     "elementType": "labels.text.fill",
    //     "stylers": [
    //     {
    //         "color": "#bdbdbd"
    //     }
    //     ]
    // },
    // {
    //     "featureType": "poi",
    //     "elementType": "geometry",
    //     "stylers": [
    //     {
    //         "color": "#eeeeee"
    //     }
    //     ]
    // },
    // {
    //     "featureType": "poi",
    //     "elementType": "labels.text.fill",
    //     "stylers": [
    //     {
    //         "color": "#757575"
    //     }
    //     ]
    // },
    // {
    //     "featureType": "poi.park",
    //     "elementType": "geometry",
    //     "stylers": [
    //     {
    //         "color": "#e5e5e5"
    //     }
    //     ]
    // },
    // {
    //     "featureType": "poi.park",
    //     "elementType": "labels.text.fill",
    //     "stylers": [
    //     {
    //         "color": "#9e9e9e"
    //     }
    //     ]
    // },
    // {
    //     "featureType": "road",
    //     "elementType": "geometry",
    //     "stylers": [
    //     {
    //         "color": "#ffffff"
    //     }
    //     ]
    // },
    // {
    //     "featureType": "road.arterial",
    //     "elementType": "labels.text.fill",
    //     "stylers": [
    //     {
    //         "color": "#757575"
    //     }
    //     ]
    // },
    // {
    //     "featureType": "road.highway",
    //     "elementType": "geometry",
    //     "stylers": [
    //     {
    //         "color": "#dadada"
    //     }
    //     ]
    // },
    // {
    //     "featureType": "road.highway",
    //     "elementType": "labels.text.fill",
    //     "stylers": [
    //     {
    //         "color": "#616161"
    //     }
    //     ]
    // },
    // {
    //     "featureType": "road.local",
    //     "elementType": "labels.text.fill",
    //     "stylers": [
    //     {
    //         "color": "#9e9e9e"
    //     }
    //     ]
    // },
    // {
    //     "featureType": "transit.line",
    //     "elementType": "geometry",
    //     "stylers": [
    //     {
    //         "color": "#e5e5e5"
    //     }
    //     ]
    // },
    // {
    //     "featureType": "transit.station",
    //     "elementType": "geometry",
    //     "stylers": [
    //     {
    //         "color": "#eeeeee"
    //     }
    //     ]
    // },
    // {
    //     "featureType": "water",
    //     "elementType": "geometry",
    //     "stylers": [
    //     {
    //         "color": "#c9c9c9"
    //     }
    //     ]
    // },
    // {
    //     "featureType": "water",
    //     "elementType": "labels.text.fill",
    //     "stylers": [
    //     {
    //         "color": "#9e9e9e"
    //     }
    //     ]
    // }
    // ]
        });

        //marker for current location
        var marker = new google.maps.Marker({position: pos, map: map});

        //temp info window
        infoWindow = new google.maps.InfoWindow;
        infoWindow.setPosition(pos);
        infoWindow.setContent('Location found.');
        infoWindow.open(map);

        //image for flags
        var image = 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png';


        //to bounce
        function toggleBounce(markers) {
        if (markers.getAnimation() !== null) {
        markers.setAnimation(null);
        } else {
        markers.setAnimation(google.maps.Animation.BOUNCE);
        }
        }
    //      //finding location of markers
        var locations = [
            {lat: 40.71805863849005, lng: -74.01375605521697},
        ]
        const labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        //all markers
        var markers = [];
        locations.forEach(function(location, i) {
            let newMarker = new google.maps.Marker({
            position: location,
            icon: image,
            label: labels[i],
            });
            newMarker.addListener('click', toggleBounce);
            markers.push(newMarker);
        });
        
        console.log("test");

        }

}
var right_arrow = true;
function toggleSidePanel(params) {
    // slideToggle();
    right_arrow = !(right_arrow);
    if (right_arrow){
        $("#arrow").css("border-right", "20px solid #555")
        $("#arrow").css("border-left", "0")
        $("#searchAndOptions").show();

    }else{
        $("#arrow").css("border-right", "0")
        $("#arrow").css("border-left", "20px solid #555")
        $("#searchAndOptions").hide();

    }
}