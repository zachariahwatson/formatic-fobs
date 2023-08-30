const { createServer } = require("http")
const { Server } = require("socket.io")
const printer = require('./printer')

const httpServer = createServer()
const io = new Server(httpServer)
printer.init()
printer.serialWrite('M300 S440 P200')

io.on("connection", (socket) => {
  console.log(`${socket.id} connected, current clients: ${io.engine.clientsCount}`)
  socket.on('printjobs', (jobs) => {
    socket.broadcast.emit('printjobs',jobs)
  })

  socket.on('currentjob', (job) => {
    socket.broadcast.emit('currentjob',job)
  })

  //print printjob if there's no job printing
  socket.on('printjob', (printJob) => {
    //print printjob
    printer.printPrintJob(printJob)
  })
})

httpServer.listen(3000)