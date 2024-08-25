const express = require('express');
const { createServer } = require('node:http');
const { Server } = require('socket.io');
let playerCount = 0;
let players = [false, false, false, false];

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use('/', express.static('game'));

io.on('connection', (socket) => {
  playerCount++;
  let playerId = null;
  for(let i = 0; i < playerCount; i++) {
    if(!players[i]) {
      players[i] = true;
      playerId = i + 1;
      break;
    }
  }
  socket.emit('player', playerId);
  socket.on('ballData', (a) => {
    socket.broadcast.emit('ballRecieve', a);
  })
  socket.on('disconnect', () => {
    playerCount--;
    players[playerId - 1] = false;
    socket.broadcast.emit('ballDelete', playerId);
  });
});

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});
