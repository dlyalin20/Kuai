// var autocomplete;
var UserPos;
const Google_Places_API_KEY = "jAIzaSyBzd999zA1_gyh7uB6KpUh-hBaYsl0vmIQ";
const MINQUERYZOOM = 17;
var map;
// we are targeting a location, bring out the busness popup
var targetingLocation = false;
// $( document ).ready(
var sessionToken;
var autocomplete;
var previousSearch = q;
var markers = new Array(); // type: custom class busness
const choices = $("#choices");
var levelOfDepth = 0;

const options = {
    enableHighAccuracy: true,
    // timeout: 5000, // => default infinity // take as much time as you need
    maximumAge: 500,
};
var service; // only to be called after maps is initialized

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
const csrftoken = getCookie('csrftoken');
const input = document.getElementById('search-input');
var lastsend;
function initialize() {
    autocomplete = new google.maps.places.AutocompleteService();
    geocoder = new google.maps.Geocoder()
    if (!(targetID === "")) {
        toggleSidePanel();
    }
    getLocation();
}

function mainLoop(position) {
    if (position) {
        UserPos = { lat: position.coords.latitude, lng: position.coords.longitude };
        console.log("UserPos: " + UserPos.toString());
    }
    // main promise chain
    new Promise(function (resolve, reject) { // try target placeid
        console.log("Finding center of map");
        result = {
            target: false,
            markers: [],
            keepSearching: true,
            // targetingLocation: false,
        };
        if (!(targetID === "")) { // targetID exists => we target the pos at the biz found
            lockOn(targetID, pos => {
                if (pos) {
                    // if we found a valid location - stop
                    result.target = pos;
                    let listofMarkers = [pos];
                    result.keepSearching = false;
                    result.markers = listofMarkers;
                    resolve(result);
                } else {
                    resolve(result);
                }
            });

        }
        else {
            resolve(result);
        }

    }).then(function (result) { // try query
        if (!(q === "")) { // query exists => change default input value
            console.log("query q= " + q + " targetID = " + targetID);
            input.value = q;

            if (result.keepSearching) { // if we havent found the center location already
                // lets see if we can find a pos from the query
                return new Promise(function (accept, reject) {
                    search(
                        // push this call back function to it to modify the data
                        function (pos, markers) {
                            queryGeocoder(pos.place_id,
                                targetLocation => {
                                    targetLocation = targetLocation.geometry.location
                                    console.log("query target location: ");
                                    console.log(targetLocation);
                                    if (targetLocation) {
                                        // if we found a valid location - stop
                                        result.target = targetLocation
                                        result.markers = markers
                                        result.keepSearching = false;
                                        // targetingLocation = true;
                                        accept(result);
                                    }
                                    else {
                                        // bad query no results found => dont change result
                                        console.log("bad query no results found");
                                        accept(result);
                                    }
                                })


                        });
                }).then(res => {
                    return (result);
                })
            }
            else {
                // we found the center point already, just what we have
                return (result);
            }
        } else {
            // query does not exist, just take what we have
            return (result);
        }

    }).then(function (result) { // try user pos
        if (result.keepSearching) {
            console.log("No query sent in, Default to user position");
            result.keepSearching = false;
            result.target = UserPos;
            console.log("after: ");
            console.log(UserPos);
        }
        return result;

    }).then(function (result) { // default to stuy
        // all other methods of finding center location failed
        if (result.keepSearching) {
            console.log("all other methods of finding center location failed");

            UserPos = { lat: 40.7178149, lng: -74.0138422 } // default center location to stuyvesant
            result.target = UserPos;
        }
        return result;
    }).then(function (result) { //init map
        initMap(result);
        service = new google.maps.places.PlacesService(map);
        return (result);
    }).then(result => { //plot the markers
        console.table(result);
        // plot markers
        if (result.markers && result.markers.length > 0) {
            choices.html("");
            clearMarkers();
            for (let i = 0; i < result.markers.length; i++){
                // choices.html("");
                let temp = new Business(result.markers[i], i, null, null, function(){
                    this.pushDivDescription();             
                });
                // console.log(placeLocation);
                // createMarker(placeLocation);
                // queryService(data[i], placeResult, i)
                markers.push(temp);
            }
        }
        return true;
    }).then(function (result) { //set up event listeners
        // set up event listeners
        // let infowindow;
        map.addListener("idle", () => {
            start_nearbySearch();
            console.log("zoom: " + map.getZoom());
        });
        map.addListener("center_changed", () => {
            stoptimer();
        });
        $('#search-submit').click(function (event) { // Gives search results
            console.log("test");
            event.preventDefault();
            search((x, y) => {
                queryGeocoder(x.place_id,
                    targetLocation => {

                        targetLocation = targetLocation.geometry.location
                        map.setCenter(targetLocation);
                    })
                if (y) {
                    if (input.value != previousSearch) {
                        previousSearch = input.value
                        plotListMarkers(y);
                    }

                };

            });
        })
        $("#arrow").click(toggleSidePanel); // toggles side panel
        loadDirections(); // load directions
        return true;
    })
}

/*
Input in a array of elements
    - geometry
        -location
    - name
*/
function createTemps(result = lastsend) {
    if (result != lastsend) {
        var data = JSON.stringify(result);
        console.log(data);

        $.ajax({
            headers: { "X-CSRFToken": csrftoken },
            type: "POST",
            url: window.location.pathname,
            // The key needs to match your method's input parameter (case-sensitive).
            data: data,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (data) {
                console.log(data);
            },
            error: function (errMsg) {
                console.log(errMsg);
            }
        });
    }
}
var pastZoom, pastCenter;
var timer; // timer object to stop the nearby search if center changed

function stoptimer(){
    clearTimeout(timer);
}

function nearbySearch(){
    //do nearybySearch after 3 seconds
    var mapbounds = map.getBounds();
    var ne = mapbounds.getNorthEast();
    var sw = mapbounds.getSouthWest();
    // new google.maps.Marker({
    //     position: ne
    // }).setMap(map);
    // new google.maps.Marker({
    //     position: sw
    // }).setMap(map);
    const MARGINOFERROR = 0.0025;
    var nelat = ne.lat() + MARGINOFERROR;
    var nelon = ne.lng() + MARGINOFERROR;
    var swlat = sw.lat() - MARGINOFERROR;
    var swlon = sw.lng() - MARGINOFERROR;
    console.log(nelat, nelon, swlat, swlon);
    console.log("query from local db");
    let center = map.center;
    queryDB(center.lat(), center.lng(), nelat, nelon, swlat, swlon);
    levelOfDepth++;
    console.log(mapbounds);
    // console.log("query from nearby search");
    let request = {
        bounds: mapbounds,
        // add ranked by changed by options
        // rankBy: google.maps.places.RankBy.DISTANCE,
        // edit the type by options
        type: "restaurant",
    }
    const locations = service.nearbySearch(request, (result, status)=>{
        if (status == google.maps.places.PlacesServiceStatus.OK){
            placeResultsToMarkers(result);
            //only take xy coords and place id
            var myResults = [];
            result && result.map(v => {
                let coords = v.geometry.location;     
                let placeID = v.place_id;           
                myResults.push({ coords, placeID });
            })
            createTemps(myResults);
            lastsend = myResults;
        }
    }); 
}
function start_nearbySearch() { //plots the nearby locations
    mapzoom = map.getZoom()
    if (service && mapzoom > MINQUERYZOOM && pastZoom != mapzoom || map.center != pastCenter) {
        stoptimer();
        timer = setTimeout(function() {
            nearbySearch();
          }, 3000);
    }
}

async function placeResultsToMarkers(results,) {
    // choices.html("");
    // clearMarkers();
    var pointer = 0;
    for (let index = 0; index < results.length; index++) {
        const element = results[index];
        // createMarker(element);
        // placeResult(element, index);
        if (!(await bizHash.doesExistorAdd(element.place_id, markers.length))) {
            x = new Business(element.place_id, markers.length, element.geometry.location, element.name, async function () {
                this.pushDivDescription();
            });
            markers.push(x);
        }
    }
}

// take array of objects
/*element
    - geometry
        -location
    - name
*/
// return [firstpos, listofMarkers ]
function search(callback) {
    sessionToken = new google.maps.places.AutocompleteSessionToken();
    advQuery = input.value;
    var request = {
        input: advQuery,
        fields: ["name", "geometry", "place_id"],
        sessionToken: sessionToken,
        // 
    };
    if (UserPos) {
        console.log("Searching Near: " + UserPos);
        request["location"] = new google.maps.LatLng(UserPos);
        request["radius"] = 500;
    }
    if (advQuery) {
        console.log("run search");
        autocomplete.getPlacePredictions(
            request,
            function (results) {
                console.table(results);
                // lock on to this center point, and put down markers
                return callback(results[0], results);
            },
            // fail
            function (err) {
                console.log(err);
                return callback(false, false);
            }
        )

    }
    else {
        console.log("no input value");
        return callback(false, false);

    }
};


//---- get location of user
function getLocation() {
    var x = document.getElementById("show");
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(mainLoop, function error(msg) { console.log(msg); }, options);
    }
    else {
        x.innerHTML = "Geolocation is not supported by this browser.";
        mainLoop(false);
    }

}

// updates the user's location
function updatePosition(position) {
    UserPos = { lat: position.coords.latitude, lng: position.coords.longitude };
    console.log("after: " + UserPos);
}
var geocoder;
// input placeid
// returns a results object that you can send a callback into to manipulate
function queryGeocoder(targetID, callback) {
    if (targetID) { //!= ""
        geocoder.geocode({ placeId: targetID }, (results, status) => {
            console.log('geocode start');
            if (status !== "OK" && results) {
                window.alert("Geocoder failed due to: " + status);
                callback(false);
            }
            console.log(results[0]);
            callback(results[0]);
        });


    }
    else {
        console.log("no target id");
        callback(false);
    }
}

function lockOn(targetID, callback) {
    queryGeocoder(targetID, results => {
        console.log(results);
        // Set the position of the marker using the place ID and location.
        if (results) {
            targetingPlace = true;
            let pos = results.geometry.location
            callback(pos);
        } else {
            callback(null);
        }
    });
}

function initMap(result) {
    console.log("pos: ")
    console.log(result.target);
    //setting up map
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 18,
        center: result.target,
    });

    //marker for current location
    var marker = new google.maps.Marker({ position: result.target, map: map });

    //temp info window
    infoWindow = new google.maps.InfoWindow;
    infoWindow.setPosition(result.target);
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


}

var right_arrow = true;
function toggleSidePanel(params) {
    // slideToggle();
    right_arrow = !(right_arrow);
    if (right_arrow) {
        $("#arrow").css("border-right", "20px solid #555")
        $("#arrow").css("border-left", "0")
        $("#searchAndOptions").show();

    } else {
        $("#arrow").css("border-right", "0")
        $("#arrow").css("border-left", "20px solid #555")
        $("#searchAndOptions").hide();

    }
}


// redo later
//input: list of place results taken in from initial search query
//post-condition: plotted markers and result divs
// results.place_id
async function plotListMarkers(results) {
    // choices.html("");
    // turn this in to plant markers function
    for (let i = 0; i < results.length; i++) {
        await new Promise(function (accept, reject) {
            const start = markers.length;
            var pointer = 0;
            for (let i = 0; i < data.length; i++) {
                // choices.html("");
                new Business(results[i].place_id, start + pointer, null, null, async function () {
                    if (!await this.testHash()) {
                        this.pushDivDescription();
                        markers.push(temp);
                        pointer++;
                    }
                });
                // console.log(placeLocation);
                // createMarker(placeLocation);
                // queryService(data[i], placeResult, i)
                // markers.push(temp);
            }
            // queryService(results[i].place_id, function (thisMarkerLocation){
            //     if (thisMarkerLocation){
            //         console.log(thisMarkerLocation);
            //         createMarker(thisMarkerLocation);
            //         newChoice = $(`<div class='option-items' location = `+thisMarkerLocation.geometry.location+`>
            //             ` + (i + 1) + '. ' + thisMarkerLocation.name + '|' + thisMarkerLocation.geometry.location +
            //             `</div>`).on("click", function(){
            //                 map.setCenter(thisMarkerLocation.geometry.location)
            //             });  
            //         accept(choices.append(newChoice));

            //     }else{
            //         accept();
            //     }

            // });
        })
    }
}

function createMarker(place) {
    if (!place.geometry || !place.geometry.location) return;
    const marker = new google.maps.Marker({
        map,
        position: place.geometry.location,
    });
    infowindow = new google.maps.InfoWindow;

}
function clearMarkers() {
    for (var i = 0; i < markers.length; i++) {
        markers[i].hideMarker();

    }
    markers = new Array();
    bizHash = new hashtable();
}
