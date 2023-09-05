const { io } = require('socket.io-client')

let socket

if (!socket) {
    socket = io(`http://localhost:${process.env.NEXT_PUBLIC_PORT}`)
}

module.exports = socket