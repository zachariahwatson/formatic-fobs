const { Server } = require("socket.io")

const io = new Server(3000)

io.on("connection", (socket) => {
  console.log(`${socket.id} connected, current clients: ${io.engine.clientsCount}`)
  // socket.on('printjobs', (jobs) => {
  //   console.log('print jobs sent to socket:\n', jobs)
  //   socket.broadcast.emit('printjobs',jobs)
  // })
})