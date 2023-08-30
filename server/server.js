const { createServer } = require("http")
const { Server } = require("socket.io")
const printer = require('./printer')
const prisma = require('./../next/app/utils/prisma').prisma

const httpServer = createServer()
const io = new Server(httpServer)
printer.init()
printer.serialWrite('M300 S440 P200')

io.on("connection", (socket) => {
  console.log(`${socket.id} connected, current clients: ${io.engine.clientsCount}`)
  socket.on('printjobs', (jobs) => {
    //console.log('print jobs sent to socket:\n', jobs)
    socket.broadcast.emit('printjobs',jobs)
  })

  //print printjob if there's no job printing
  socket.on('addjob', async (printJob) => {
    const isPrinting = await prisma.print.count({
      where: {
        Status: 'PRINTING'
      }
    })

    if (isPrinting == 0) {
      //update print job status to printing
      const currentPrintJob = await prisma.print.update({
        where: { ID: printJob.ID },
        data: {
            Status: 'PRINTING'
        },
        include: { //includes the model as well as the user attached to it
          Model: {
              include: {
                  User: true
              }
          }
        },
      })

      socket.broadcast.emit('currentjob', currentPrintJob)

      //update print jobs on the client
      const updatedPrintJobs = await prisma.print.findMany({
        where: { 
          Status: {
            in: ['PENDING', 'QUEUED']
          }     
        },     
        orderBy: {
            TimeStamp: 'asc'
        },
        include: { //includes the model as well as the user attached to it
            Model: {
                include: {
                    User: true
                }
            }
        },
        take: 3
      })
      //console.log(sendPrintJobs[0].Model)
      socket.broadcast.emit('printjobs', updatedPrintJobs)

      //print printjob
      printer.printPrintJob(printJob)
    }
  })
})

httpServer.listen(3000)