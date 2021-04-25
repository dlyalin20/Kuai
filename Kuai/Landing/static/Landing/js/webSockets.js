const chatSocket = new WebSocket(
    'ws://'
    + window.location.host
    + '/ws/go/test'
);        
chatSocket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    console.log(data.message);
    
};

chatSocket.onclose = function(e) {
    console.error('Chat socket closed unexpectedly');
};
var message = 'test'
chatSocket.onopen = function(e){
    chatSocket.send(JSON.stringify({
        'message': message
    }));
}
