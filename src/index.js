const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { 
    generateMessage,
    generateLocationMessage
} = require('./utils/messages')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

let count = 0

io.on('connection', (socket) => {
    console.log('New WebSocket Connection');

    socket.emit('message', generateMessage('Welcome!'))

    socket.broadcast.emit('message', generateMessage('A new user has joined!'))

    socket.on('sendMessage', (sentMessage, cb) => {
        const filter = new Filter()

        if(filter.isProfane(sentMessage)) {
            return cb('Profanity is not allowed')
        }

        io.emit('message', generateMessage(sentMessage))
        cb()
    })

    socket.on('disconnect', () => {
        io.emit('message', generateMessage('A user has left!'))
    })

    socket.on('sendLocation', (location, cb) => {
        io.emit('locationMessage', generateLocationMessage(location))    
        cb()
    })

    // socket.emit('countUpdated', count)

    // socket.on('increment', () => {
    //     count++
    //     io.emit('countUpdated', count)
    // })
})

server.listen(port, () => {
    console.log(`Listening on port ${port}`)
})