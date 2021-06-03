const directionsRenderer = new google.maps.DirectionsRenderer();
const directionsService = new google.maps.DirectionsService();
function loadDirections(){
  directionsRenderer.setMap(map);
  directionsRenderer.setPanel(document.getElementById("all-directions"));
}

function calc_display_route_to_biz(end) {
    if (UserPos){
        directionsService.route(
          {
            origin: {location:start}, // start at the user's location
            destination: {placeID: end}, // end at biz
            travelMode: google.maps.TravelMode.WALKING, //add more methods of transport later
          },
          (response, status) => {
            if (status === "OK") {
              directionsRenderer.setDirections(response);
            } else {
              window.alert("Directions request failed due to " + status);
            }
          }
        );
    }else{
        alert('Cannot calculate distance without user location')
    }

}