const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { 
    generateMessage,
    generateLocationMessage
} = require('./utils/messages')
const {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

let count = 0

io.on('connection', (socket) => {
    console.log('New WebSocket Connection');

    socket.on('join', ({username, room}, cb) => {
        const { error, user } = addUser({
            id: socket.id,
            username,
            room
        })

        if (error) {
            return cb(error)
        }
        console.log(user);

        socket.join(user.room)

        socket.emit('message', generateMessage('Admin','Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined ${room}`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        cb()
    })

    socket.on('sendMessage', (sentMessage, cb) => {
        const user = getUser(socket.id)
        const filter = new Filter()

        if(filter.isProfane(sentMessage)) {
            return cb('Profanity is not allowed')
        }

        io.to(user.room).emit('message', generateMessage(user.username, sentMessage))
        cb()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('message', generateMessage(user.username, `${user.username} has left the room`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
    
        }
    })

    socket.on('sendLocation', (location, cb) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, location))    
        cb()
    })
})

server.listen(port, () => {
    console.log(`Listening on port ${port}`)
})