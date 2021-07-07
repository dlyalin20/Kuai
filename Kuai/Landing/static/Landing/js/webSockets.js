var chatSocket;
connect()
function connect(){
    chatSocket = new WebSocket(
        'ws://'
        + window.location.host
        + '/ws/go/SearchNearby'
    ); 
    chatSocket.onopen = function(){
        clearInterval(timerId);
    }
    chatSocket.onmessage = function(e) {
        // console.log(chatSocket);
        var data = e.data;
        if (data.charAt(0) != "["){
            if (data.charAt(0) == 'h'){
              data = data.slice(4);
              data = JSON.parse(data);
            //[[], ]
              for(i in data){
                data[i][0][0]
                data[i][0][1]
                data[i][1]
              }
            }
            else if (data == "bad inputs"){
                alert("bad inputs")
            }else if (data == "recieved-waittime"){
                alert("Review recieved, Bye!");
                nearbySearch();
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
                    let temp = new Business(data[i][0], i,null, null, function(){
                        this.addHash(); //eventually adds hash
                        this.pushDivDescription();
                    },  data[i][1]);
                    // console.log(placeLocation);
                    // createMarker(placeLocation);
                    // queryService(data[i], placeResult, i)
                    markers.push(temp);
                }
            }
        } 
    };
    
    // chatSocket.onclose = function(e) {
    //     timerId = setInterval(function() {
    //       console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
    //       connect();
    //     }, 2000);
    //   };
}

var data;
var bizHash = new hashtable();
var timerId;


// remove default para later
function queryDB( lat = 40.6237542, lon = -73.913696, nelat, nelon, swlat, swlon, heat){
    if (chatSocket && chatSocket.readyState == 1){
        if (heat === "heat"){
            console.log(lat, lon);
            chatSocket.send(JSON.stringify({
                'lat': lat,
                'lon': lon,
                'nelat': nelat,
                'nelon': nelon,
                'swlat': swlat,
                'swlon': swlon,
                'heat': 't',
                })
            )
        }else{
            console.log(lat, lon);
            chatSocket.send(JSON.stringify({
                'lat': lat,
                'lon': lon,
                'nelat': nelat,
                'nelon': nelon,
                'swlat': swlat,
                'swlon': swlon,
                "heat" : 'f',
                })
            )
            
        }    
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

