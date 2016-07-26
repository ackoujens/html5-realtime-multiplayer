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
serv.listen(3000);                                    // server will be hosted on port 2000

// WEBSOCKETS
var SOCKET_LIST = {};                                 // create LIST of SOCKETS

// ENTITY
var Entity = function(){
  var self = {
    x:250,
    y:250,
    spdX:0,
    spdY:0,
    id:""
  }
  self.update = function(){
    self.updatePosition();
  }

  self.updatePosition = function(){
    self.x += this.spdX;
    self.y += this.spdY;
  }
  return self;
}

// PLAYER
var Player = function(id){
  var self = Entity();
  self.id = id;
  self.number = "" + Math.floor(10 * Math.random());
  self.pressingRight = false;
  self.pressingLeft = false;
  self.pressingUp = false;
  self.pressingDown = false;
  self.maxSpd = 1;

  var super_update = self.update;
  self.update = function(){
    self.updateSpd();
    super_update();
  }

  self.updateSpd = function(){
    if(self.pressingRight)
      self.spdX += self.maxSpd;
    else if(self.pressingLeft)
      self.spdX -= self.maxSpd;
    else
      self.spdX = 0;

    if(self.pressingUp)
      self.spdY -= self.maxSpd;
    else if(self.pressingDown)
      self.spdY += self.maxSpd;
    else
      self.spdY = 0;
  }
  Player.list[id] = self;
  console.log('Player ' + id + ' created');
  return self;
}
Player.list = {};

Player.onConnect = function(socket){
  var player = Player(socket.id);
  socket.on('keyPress', function(data){
    if(data.inputId === 'left')
      player.pressingLeft = data.state;
    if(data.inputId === 'right')
      player.pressingRight = data.state;
    if(data.inputId === 'up')
      player.pressingUp = data.state;
    if(data.inputId === 'down')
      player.pressingDown = data.state;
  });
}

Player.onDisconnect = function(socket){
  var i = socket.id;
  console.log('Player ' + i + ' disconnected');
  delete Player.list[socket.id];
}

Player.update = function(){
  var pack = [];                      // create a package to send to the client
  for(var i in Player.list){          // for EACH socket in SOCKET_LIST
    var player = Player.list[i];      // fetch Socket i
    player.update();
    pack.push({                       // push x & y DATA of EACH socket into the package
      x:player.x,
      y:player.y,
      number:player.number
    });
  }
  return pack;
}


var io = require('socket.io')(serv,{});               // loads file -> inits it -> returns io object
io.sockets.on('connection', function(socket){         // if there is a connection -> following function will be ran
  socket.id = Math.random();
  SOCKET_LIST[socket.id] = socket;                    // add socket to the SOCKET_LIST
  console.log('Socket ' + socket.id + ' connected');

  Player.onConnect(socket);

  // automatically remove disconnecting players
  socket.on('disconnect', function(){
    var i = socket.id;
    console.log('Player ' + i + ' disconnected');
    delete SOCKET_LIST[socket.id];
    Player.onDisconnect(socket);
  });

  socket.on('buttonclick', function(data){            // reveiving message with 2 attributes (handled by btn)
    console.log('Player ' + data.playernum + ' has clicked on the button: ' + data.btntype);
  });
});

// LOOP every 1000ms / 25
setInterval(function(){
  var pack = Player.update();
  for(var i in SOCKET_LIST){          // for EACH socket in SOCKET_LIST
    var socket = SOCKET_LIST[i];      // fetch Socket i
    socket.emit('newPositions', pack);// emit new positions of socket i
  }
}, 1000/25);
