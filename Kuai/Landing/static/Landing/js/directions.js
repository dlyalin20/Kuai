const directionsRenderer = new google.maps.DirectionsRenderer();
const directionsService = new google.maps.DirectionsService();
var calculatedRoute;

$('#all-directions-panel').hide();


function initializeDirections(){
    directionsRenderer.setMap(map);
    directionsRenderer.setPanel(document.getElementById("all-directions-panel"));
}
//input: Business object 
async function load_route_to_biz(biz) { //figure out the route to the biz 
    const popup = $("#popup");
    popup.find('#popup_travel_time').attr('data-val', "Loading");
    popup.find('#popup_total_time').attr('data-val', "N/A");
    if (UserPos) {
        directionsService.route(
            {//options
                origin: { location: UserPos }, // start at the user's location
                destination: { placeId: biz.placeID }, // end at biz
                travelMode: google.maps.TravelMode.WALKING, //add more methods of transport later
            },
            (response, status) => {
                if (status === "OK") {
                    calculatedRoute = response;
                    // calculate the wait time 
                    totalduration = 0; // duration in seconds
                    for (i in calculatedRoute.routes[0].legs){
                        // console.log(i);
                        // console.log(calculatedRoute.routes[0].legs[i]);
                        totalduration += calculatedRoute.routes[0].legs[i].duration.value;
                    }
                    finalduration = Math.round(totalduration / 60);
                    popup.find('#popup_travel_time').attr('data-val', finalduration);
                    $('#all-directions-panel').show();
                    directionsRenderer.setDirections(response);
                    if (finalduration && biz.waitTime != "N/A"){
                        popup.find('#popup_total_time').attr('data-val', finalduration + biz.waitTime);
                    }
                } else {
                    window.alert("Directions request failed due to " + status);
                }
            }
        );
    } else {
        alert('Cannot calculate distance without user location')
        popup.find('#popup_travel_time').attr('data-val', "N/A");
    }

}