const chatSocket = new WebSocket(
    'ws://'
    + window.location.host
    + '/ws/go/SearchNearby'
);        
chatSocket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    console.log(data.message);
    
};

chatSocket.onclose = function(e) {
    console.error('Chat socket closed unexpectedly');
};

chatSocket.onopen = function(e){
    chatSocket.send(JSON.stringify({
        'radius': 1000, //meters
        'lat': 40.6237542,
        'lon': -73.913696
    }));
}
