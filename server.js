const server = require('http').createServer();

const io = require("socket.io")(server, {
    transports: ["websocket", "polling"]
});

const users = {}

const messages = []

const textingUsers = {}

io.on('connection', client => {
    client.on('username', username => {
        const user = {
            name: username,
            id: client.id,
        }
        users[client.id] = user;
        io.emit('connected', user);
        io.emit('users', Object.values(users))
        io.emit('getAllMessages', messages)
    });

    client.on('send', message => {
        const messageObj = {
            text: message,
            user: users[client.id],
            date: new Date()
        }
        io.emit('message', messageObj)
        messages.push(messageObj)
    })

    client.on('typing', data => {
        data.typing ? textingUsers[data.user.id] = data.user : delete textingUsers[data.user.id]
        client.broadcast.emit('getTypingUsers', Object.values(textingUsers))
    })

    client.on('disconnect', () => {
        delete users[client.id];
        io.emit('disconnected', client.id)
    })
})

server.listen(3000)