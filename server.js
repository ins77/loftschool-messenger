const WebSocketServer = require('ws').Server;
const server = new WebSocketServer({ port: 3000 });
let connections = new Set();

server.on('connection', (socket) => {
    const id = Math.random();
    connections.add(socket);

	socket.on('message', (messageData) => {
        const message = JSON.parse(messageData);

        connections.forEach(connection => {            
            connection.send(JSON.stringify({...message, userId: id}));
        });
    });
    
    socket.on('close', () => {
        connections.delete(socket);
        socket.send(JSON.stringify({userId: id, type: 'disconnect'}));
    });
});



