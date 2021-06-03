const chatSocket = new WebSocket(
    'ws://'
    + window.location.host
    + '/ws/go/SearchNearby'
); 
var data;
var bizHash = new hashtable();
var timerId;
chatSocket.onopen = function(){
    clearInterval(timerId);
}
chatSocket.onmessage = function(e) {
    // console.log(chatSocket);
    if (e.data.charAt(0) != "["){
        if (data == "bad inputs"){
            alert("bad inputs")
        }else{
            console.log(data);
        }
    }
    else{
        data = JSON.parse(e.data);
        if(data == null || data.length == 0){
            console.log("No results found");
        }else{
            console.log(data);
            bizHash = new hashtable();
            // array found: display the markers on the map
            // data[i].place_id ; data[i].lat, data[i].lon
            choices.html("");
            clearMarkers();
            for (let i = 0; i < data.length; i++){
                // choices.html("");
                let temp = new Business(data[i][0], null, null, function(){
                    this.addHash(); //eventually adds hash
                    this.pushDivDescription();             
                }, i, data[i][1]);
                // console.log(placeLocation);
                // createMarker(placeLocation);
                // queryService(data[i], placeResult, i)
                markers.push(temp);
            }
        }
    } 
};

chatSocket.onclose = function(e) {
    timerId = setInterval(function() {
      console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
      connect();
    }, 1000);
  };

// remove default para later
function queryDB( lat = 40.6237542, lon = -73.913696, nelat, nelon, swlat, swlon){
    console.log(lat, lon);
    if (chatSocket && chatSocket.readyState == 1){
        chatSocket.send(JSON.stringify({
            'lat': lat,
            'lon': lon,
            'nelat': nelat,
            'nelon': nelon,
            'swlat': swlat,
            'swlon': swlon,

            })
        )
        
    }    
}

async function waitTimeAvgData(OverallTime, placeID){
    data =  JSON.stringify({
        'finalData': true,
        'OverallTime': OverallTime,
        'placeID': placeID,
        })
    console.log(data);
    if (chatSocket && chatSocket.readyState == 1){
        chatSocket.send(data)
        
    } 
}