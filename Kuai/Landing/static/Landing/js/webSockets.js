var chatSocket;

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
        request = JSON.parse(data);
        if (request.request == "updateWaitTimes"){
            BizHolder.setManyWaitTimes(request.data)
        }else if (request.request == "heatMapData"){
           //build heatmap
          data = request.data
            if (data == "NoData"){
                popAlert("No Data in this area")
            }else{
                //[[[xcor, ycor], weight], ...]
                var heatMapDataList = [];
                for(i in data){
                const weightedData = {
                    location:  new google.maps.LatLng(data[i][0][0], data[i][0][1]),
                    weight: data[i][1],
                }
                heatMapDataList.push(weightedData);
                }
                render_heatmap(heatMapDataList)
            }
        }
        else if (request.request == "message"){
            data = request.data;
            if (data == "bad inputs"){
                alert("bad inputs")
            }else if (data == "recieved-waittime"){
                alert("Review recieved, Bye!");
                nearbySearch();
            }
            else{
                console.log(data);
            }
        }
        else{
/*             data = JSON.parse(e.data);
            if(data == null || data.length == 0){
                console.log("No results found");
            }else{
                console.log(data);
                bizHash = new hashtable();
                // array found: display the markers on the map
                // data[i].place_id ; data[i].lat, data[i].lon
                choices.html("");
                // clearMarkers();
                for (let i = 0; i < data.length; i++){
                    const bizOptions = {
                        placeID: data[i][0],
                        array_index: i,
                    }
                    const x = new Business(bizOptions, function(){
                        this.addHash(); //eventually adds hash
                        this.pushDivDescription();
                    },  data[i][1]);
                    markers.push(x);

                }
            } */
        }
    };
    chatSocket.onclose = function(e) {
        timerId = setInterval(function() {
          console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
          connect();
        }, 2000);
      };
}

connect()
var timerId;


// remove default para later
function queryDB( lat = 40.6237542, lon = -73.913696, nelat, nelon, swlat, swlon, heat){
    if (chatSocket && chatSocket.readyState == 1){
        if (heat === "heat"){
            console.log(lat, lon);
            chatSocket.send(JSON.stringify({
                "request":"NearbySearch",
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
                "request":"NearbySearch",
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

/**
 * Ask server for wait time data for a series of locations
 * and/or cache location if location not in DB
 * @param {Array.<{location: LatLngObject, placeID: String}>} param Array of object for each location
 */
function getsetData(param){
    var data = JSON.stringify({
        "request":"getSetData",
        "data": param,
    });
    console.log(data);
    if (chatSocket && chatSocket.readyState == 1){
        chatSocket.send(data)
    }
}

async function waitTimeAvgData(OverallTime, place_id){
    var data =  JSON.stringify({
        'request': "submitWaitTime",
        'OverallTime': OverallTime,
        'place_id': place_id,
        })
    console.log(data);
    if (chatSocket && chatSocket.readyState == 1){
        chatSocket.send(data)

    }
}


/**
 * Displays msg in a html element
 */
function popAlert(msg){
    $("#msgBox").html(msg);
}
/**
 * closes msg
 */
function closeAlert(){
    $("#msgBox").html("");
}
