# html5-realtime-multiplayer
html5 realtime multiplayer taking place on a single server with multiple players duking it out.

# Tools
* NodeJS (server)
* npm (library installer, comes with nodejs)
* Atom (text editor)
* Google chrome (client)

# Project Folder Structure
* app.js (main entry point, load all other files, init server)

* package.json (desc of server, libs using)

* node_modules (contains all libs we have, not modded manually)
  * express
  * socket.io

* server (contains all logic of game)
  * serverFile1.js
  * serverFile2.js

* client (accessable by the client)
  * js
    * clientFile1.js
    * clientFile2.js
    * sharedFile1.js
    * sharedFile2.js
  * img
    * myImg1.png
    * myImg2.png
  * index.html

* File Communication (Express)
  Client asks server for a file (Ex: playerImg.png)
<DOMAIN><PORT><FILE>

* Package communication (Socket.io)
  Client sends data to server (Ex: Input)
  Server sends data to client (Ex: Monster position)

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
