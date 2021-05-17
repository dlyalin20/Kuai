const chatSocket = new WebSocket(
    'ws://'
    + window.location.host
    + '/ws/go/SearchNearby'
); 
var data;
var bizHash = new hashtable();

chatSocket.onmessage = function(e) {
    console.log(chatSocket);

    data = JSON.parse(e.data);
    if (data == "bad inputs"){
        alert("bad inputs")
    }else if(data == null || data.length == 0){
        alert("No results found")
    }else{
        bizHash = new hashtable();
        // array found: display the markers on the map
        // data[i].place_id ; data[i].lat, data[i].lon
        choices.html("");
        clearMarkers();
        for (let i = 0; i < data.length; i++){
            // choices.html("");
            let temp = new Business(data[i], null, null, function(){
                this.addHash(); //eventually adds hash
                this.pushDivDescription();             
            }, markers.length);
            // console.log(placeLocation);
            // createMarker(placeLocation);
            // queryService(data[i], placeResult, i)
            markers.push(temp);
        }
    }
};

chatSocket.onclose = function(e) {
    console.error('Chat socket closed unexpectedly');
};

// remove default para later
function queryDB( lat = 40.6237542, lon = -73.913696, radius = 10){
    console.log(lat, lon);
    if (chatSocket && chatSocket.readyState == 1){
        chatSocket.send(JSON.stringify({
            'radius': radius, //meters
            'lat': lat,
            'lon': lon
            })
        )
        
    }    
}
