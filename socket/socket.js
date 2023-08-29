const express = require("express")
const { createServer } = require("http")
const { Server } = require("socket.io")

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer)

io.on("connection", (socket) => {
  console.log(`${socket.id} connected, current clients: ${io.engine.clientsCount}`)
  socket.on('printjobs', (jobs) => {
    console.log('print jobs sent to socket:\n', jobs)
    socket.broadcast.emit('printjobs',jobs)
  })
})

httpServer.listen(3000)