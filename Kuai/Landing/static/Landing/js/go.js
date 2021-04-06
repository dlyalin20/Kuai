// var autocomplete;
var UserPos;
const Google_Places_API_KEY = "jAIzaSyBzd999zA1_gyh7uB6KpUh-hBaYsl0vmIQ";
var map;
var service;
// we are targeting a location, bring out the busness popup
var targetingLocation = false;
// $( document ).ready(
var sessionToken;
var autocomplete;

const input = document.getElementById('search-input');
function initialize(){
    sessionToken = new google.maps.places.AutocompleteSessionToken();
    autocomplete = new google.maps.places.AutocompleteService();
    geocoder = new google.maps.Geocoder()
    if(!(targetID==="")){
        toggleSidePanel();
    }

    // main promise chain
    new Promise(function(resolve, reject){
        
        let keepSearching = true;
        //locations of markers to be drawn
        let listofMarkers = [];
        let pos;
        // get location for center of the map

        if(!(targetID==="")){ // targetID exists => we target the pos at the biz found
            pos = lockOn(targetID);
            if (pos){
                // if we found a valid location - stop
                listofMarkers.push(pos);
                keepSearching = false;
                targetingLocation = true;
            }
        }
        if(!(q==="")){ // query exists => change default input value
            console.log("query q= " + q + " targetID = " + targetID);
            input.value = q;
            // if we havent found the center location already
            if(keepSearching){
                // lets see if we can find a pos from the query
                pos, listofMarkers = search();
            }
        }
        
        else{
            console.log("No query sent in, Default to user position");
            getLocation().then(function(){
                pos = UserPos;
            });
            console.log("after: " + pos);
            
        }

        if (!(pos)){
            // all other methods of finding center location failed
            UserPos = {lat: 40.7180627, lng: -74.0161602} // default center location to stuyvesant
            pos = UserPos;            
        }

        // markers only have value if we found a biz or queryied
        resolve([pos, listofMarkers]);
        }).then(function(result){
            // init map
            initMap(result[0]);
            return(result[1]);
        }).then(function(result){
            // put down markers


        }).then(function(result){
            // set up event listeners
            // let infowindow;
            
            $('#search-submit').on('click', function(event){
                event.preventDefault();
                search();
            })
            $("#arrow").click(toggleSidePanel);
            //  getLocation();

        }).then(function(result){
            // set 

        });
            
    }
    // ) 


const options = {
    enableHighAccuracy: true,
    // timeout: 5000, // => default infinity // take as much time as you need
    maximumAge: 500,
};
//---- get location of user
async function getLocation(){
    var x=document.getElementById("show");
    if (navigator.geolocation){
            await navigator.geolocation.getCurrentPosition(updatePosition);
        }
    else{
        x.innerHTML="Geolocation is not supported by this browser.";
    }
    return "";
}
// updates the user's location
function updatePosition(position){
    UserPos = {lat: position.coords.latitude, lng: position.coords.longitude};
    console.log("after: " + UserPos);  
}
// return [firstpos, listofMarkers ]
function search() {
    
    advQuery = input.value;
    var request = {
        input: advQuery,
        fields: ["name", "geometry", "place_id"],
        sessionToken: sessionToken,
        // 
        };
    if (UserPos){
        console.log("Searching Near: " + UserPos);
        request["location"] = new google.maps.LatLng(UserPos);
        request["radius"]= 500;
    }
    if (advQuery){
        autocomplete.getPlacePredictions(
            request,
            displaySuggestions);
        function displaySuggestions(results){
            console.log(results);
            
            // lock on to this center point, and put down markers
            
            // // turn this in to plant markers function
            // htmlString = "";
            // for (let i = 0; i < results.length; i++) {
            //     createMarker(results[i]);
            //     htmlString += `<div class='option-items' location = `+results[0].geometry.location+`>
            //         ` + (i + 1) + '. ' + results[i].name + '|' + results[0].geometry.location +
            //         `
            //     </div>`;
            //     createMarker(results[i]);
            // }
            return [results[0], results];
        }
        
            }
};
    



var geocoder;
function queryGeocoder(targetID){
    if (targetID ){ //!= ""
    geocoder.geocode({ placeId: targetID }, (results, status) => {
        console.log('geocode start');
        
        if (status !== "OK" && results) {
        window.alert("Geocoder failed due to: " + status);
        return;
        }
    return results;
    });
    return null;
}
}

function lockOn(targetID){
    results= queryGeocoder(targetID);
    console.log(results);
    // Set the position of the marker using the place ID and location.
    if (results){
        targetingPlace = true;
        let pos = results[0].geometry.location
        map.setCenter(pos);
        createMarker(results[0]);
    }else{
        return null;
    }
}


    
    


function initMap(pos) {
    console.log("pos: " )   
    console.log(pos);
    //setting up map
    map = new google.maps.Map(document.getElementById('map'), {
    zoom: 18,
    center: pos,
    });

    //marker for current location
    var marker = new google.maps.Marker({position: pos, map: map});

    //temp info window
    infoWindow = new google.maps.InfoWindow;
    infoWindow.setPosition(pos);
    infoWindow.setContent('Location found.');
    infoWindow.open(map);

    //image for flags
    // var image = 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png';


    //to bounce
    function toggleBounce(markers) {
        if (markers.getAnimation() !== null) {
            markers.setAnimation(null);
        } else {
            markers.setAnimation(google.maps.Animation.BOUNCE);
        }
    }
//finding location of markers
    // var locations = [
    //     {lat: 40.71805863849005, lng: -74.01375605521697},
    // ]
    const labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    //all markers
    // var markers = [];
    // locations.forEach(function(location, i) {
    //     let newMarker = new google.maps.Marker({
    //     position: location,
    //     icon: image,
    //     label: labels[i],
    //     });
    //     newMarker.addListener('click', toggleBounce);
    //     markers.push(newMarker);
    // });
    
    console.log("test");

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