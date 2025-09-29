// server/server.js
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] }
});

const CHAT_ROOM = 'chat_principal';

io.on('connection', (socket) => {
    console.log(`Usuário conectado: ${socket.id}`);
    socket.join(CHAT_ROOM);

    // Retransmite a mensagem para os outros na sala
    socket.on('sendMessage', (messageData) => {
        socket.to(CHAT_ROOM).emit('receiveMessage', messageData);
    });

    // Retransmite a chave pública para os outros na sala
    socket.on('sharePublicKey', (keyData) => {
        socket.to(CHAT_ROOM).emit('receivePublicKey', keyData);
    });

    socket.on('disconnect', () => {
        console.log(`Usuário desconectado: ${socket.id}`);
    });
});

const PORT = 4000;
server.listen(PORT, () => console.log(`Servidor de chat rodando na porta ${PORT}`));