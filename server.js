// server.js
const express = require('express');
const http = require('http');
const socket = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socket(server);

let players = [];

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('🔌 Un joueur connecté :', socket.id);

    // Ajout du joueur
    players.push({ id: socket.id, name: null });

    socket.on('setName', (name) => {
        const player = players.find(p => p.id === socket.id);
        if (player) player.name = name;

        if (players.every(p => p.name)) {
            io.emit('allPlayers', players.map(p => p.name));
        }
    });

    socket.on('draw', () => {
        const chosen = players[Math.floor(Math.random() * players.length)];
        io.emit('result', chosen.name);
    });

    socket.on('disconnect', () => {
        console.log('❌ Déconnexion :', socket.id);
        players = players.filter(p => p.id !== socket.id);
        io.emit('reset');
    });
});

server.listen(3000, () => console.log('🚀 Serveur sur http://localhost:3000'));
