/* ****************************************************** #
#               html5 realtime multiplayer                #
#                 written by Jens Ackou                   #
# ******************************************************* */

// EXPRESS
var express = require('express')
var app = express();
var serv = require('http').Server(app);

app.get('/', function(req, res) {                     // query = empty
  res.sendFile(__dirname + '/client/index.html');
});                                                   // query = "/client"
app.use('/client', express.static(__dirname + '/client'));
serv.listen(2000);                                    // server will be hosted on port 2000

// WEBSOCKETS
var SOCKET_LIST = {};                                 // create LIST of SOCKETS
var PLAYER_LIST = {};

// PLAYER
var Player = function(id){
  var self = {
    x:250,
    y:250,
    id:id,
    number:"" + Math.floor(10 * Math.random())
  }
  return self;
}

var io = require('socket.io')(serv,{});               // loads file -> inits it -> returns io object
io.sockets.on('connection', function(socket){         // if there is a connection -> following function will be ran
  socket.id = Math.random();
  SOCKET_LIST[socket.id] = socket;                    // add socket to the SOCKET_LIST
  console.log('Socket ' + socket.id + ' connected');

  var player = Player(socket.id);
  PLAYER_LIST[socket.id] = player;

  // automatically remove disconnecting players
  socket.on('disconnect', function(socket){
    delete SOCKET_LIST[socket.id];
    delete PLAYER_LIST[socket.id];
  });

  socket.on('buttonclick', function(data){            // reveiving message with 2 attributes (handled by btn)
    console.log('Player ' + data.playernum + ' has clicked on the button: ' + data.btntype);
  });
});

// LOOP every 1000ms / 25
setInterval(function(){
  var pack = [];                      // create a package to send to the client
  for(var i in PLAYER_LIST){          // for EACH socket in SOCKET_LIST
    var player = PLAYER_LIST[i];      // fetch Socket i
    player.x++;                       // increment X of socket i
    player.y++;                       // increment Y of socket i
    pack.push({                       // push x & y DATA of EACH socket into the package
      x:player.x,
      y:player.y,
      number:player.number
    });
  }

  for(var i in SOCKET_LIST){          // for EACH socket in SOCKET_LIST
    var socket = SOCKET_LIST[i];      // fetch Socket i
    socket.emit('newPositions', pack);// emit new positions of socket i
  }

}, 1000/25);
