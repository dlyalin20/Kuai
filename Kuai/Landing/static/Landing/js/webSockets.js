const chatSocket = new WebSocket(
    'ws://'
    + window.location.host
    + '/ws/go/SearchNearby'
); 
var data;
var bizHash = new hashtable();

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
            alert("No results found")
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