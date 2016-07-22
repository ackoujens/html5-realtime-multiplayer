// EXPRESS
var express = require('express')
var app = express();
var serv = require('http').Server(app);

// Query = nothing
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/client/index.html');
});
// Query = client
app.use('/client', express.static(__dirname + '/client'));

serv.listen(2000);
console.log('Server initiated');


// WEBSOCKETS
var io = require('socket.io')(serv,{}); // loads file, inits it, returns io object
io.sockets.on('connection', function(socket){ // if there is a connection, following function will be ran
  console.log('Socket connected');

  socket.on('Message to server', function(){ // receiving message and responding
    console.log('Client message received')
  });

  socket.on('Sending data to server', function(data){ // receiving message and responding
    console.log('Data contents ' + data.contents);
  });

  socket.emit('serverMsg', {
    msg:'This is a message from the server'
  });

  socket.on('buttonclick', function(data){
    console.log('Player ' + data.playernum + ' has clicked on the button: ' + data.btntype);
  });
});
