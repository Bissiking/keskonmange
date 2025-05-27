const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const rooms = {};

app.use(express.static('public'));

io.on('connection', (socket) => {
  socket.on('joinRoom', ({ roomId, name }) => {
    socket.join(roomId);
    if (!rooms[roomId]) rooms[roomId] = { players: [], reason: "le repas" };

    rooms[roomId].players.push({ id: socket.id, name });
    io.to(roomId).emit('updatePlayers', rooms[roomId].players.map(p => p.name));
  });

  socket.on('setReason', ({ roomId, reason }) => {
    if (rooms[roomId]) rooms[roomId].reason = reason;
  });

  socket.on('draw', (roomId) => {
    const room = rooms[roomId];
    if (room && room.players.length > 0) {
      const chosen = room.players[Math.floor(Math.random() * room.players.length)];
      io.to(roomId).emit('result', { name: chosen.name, reason: room.reason });
    }
  });

  socket.on('disconnect', () => {
    for (const roomId in rooms) {
      rooms[roomId].players = rooms[roomId].players.filter(p => p.id !== socket.id);
      io.to(roomId).emit('updatePlayers', rooms[roomId].players.map(p => p.name));
    }
  });
});

server.listen(3000, () => console.log('🚀 Serveur lancé sur http://localhost:3000'));