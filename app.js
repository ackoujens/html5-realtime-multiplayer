/* ****************************************************** #
#               html5 realtime multiplayer                #
#                 written by Jens Ackou                   #
# ******************************************************* */

// EXPRESS
var express = require('express')
var app = express();
var serv = require('http').Server(app);

// query = nothing
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/client/index.html');
});
// query = client
app.use('/client', express.static(__dirname + '/client'));

serv.listen(2000);
console.log('Server initiated');

// WEBSOCKETS
// create list of sockets
var SOCKET_LIST = {};

var io = require('socket.io')(serv,{});               // loads file -> inits it -> returns io object
io.sockets.on('connection', function(socket){         // if there is a connection -> following function will be ran
  socket.id = Math.random();                          // create random socket ID
  socket.x = 0;                                       // assign x and y params to the socket
  socket.y = 0;
  SOCKET_LIST[socket.id] = socket;                    // add socket to the SOCKET_LIST
  console.log('Socket ' + socket.id + ' connected');

  socket.on('Message to server', function(){          // receiving message
    console.log('Client message received')
  });

  socket.on('Sending data to server', function(data){ // receiving message with attribute
    console.log('Data contents ' + data.contents);
  });

  socket.emit('serverMsg', {                          // sending a message with attribute
    msg:'This is a message from the server'
  });

  socket.on('buttonclick', function(data){            // reveiving message with 2 attributes (handled by btn)
    console.log('Player ' + data.playernum + ' has clicked on the button: ' + data.btntype);
  });
});

// LOOP every 1000ms/25
setInterval(function(){
  for(var i in SOCKET_LIST){
    var socket = SOCKET_LIST[i];
    socket.x++;
    socket.y++;
    socket.emit('newPosition', {
      x:socket.x,
      y:socket.y
    });
  }
}, 1000/25);
