require('dotenv').config()
const { createServer } = require("http")
const { Server } = require("socket.io")
const printer = require('./printer')
const { Worker } = require('bullmq')

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

  socket.on('stats', (stats) => {
    socket.broadcast.emit('stats',stats)
  })

  //print printjob if there's no job printing
  // socket.on('printjob', (printJob) => {
  //   //print printjob
  //   printer.printPrintJob(printJob)
  // })
})

const printWorker = new Worker('print-queue', async (job)=>{
  await printer.printPrintJob(job.data)
}, 
{ 
  connection: {
    host: 'localhost',
    port: 6379
  }
})

printWorker.on('completed', async (job) => {
  // const res = await fetch('http://localhost/api/jobdone', {
  //     method: 'POST',
  //     headers: {
  //         'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify(job.data),
  // })
  // const updatedPrintJob = await res.json()
  // socket.broadcast.emit('currentjob', updatedPrintJob)
  console.log('joe mama')
})

console.log(printWorker)

httpServer.listen(3000)