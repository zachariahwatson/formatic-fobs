// require('dotenv').config()
// const { createServer } = require("http")
// const { Server } = require("socket.io")
// const printer = require('./printer')
// const { Worker } = require('bullmq')

// const httpServer = createServer()
// const io = new Server(httpServer)
// printer.init()
// printer.serialWrite('M300 S440 P200')

// io.on("connection", (socket) => {
//   console.log(`${socket.id} connected, current clients: ${io.engine.clientsCount}`)
//   socket.on('printjobs', (jobs) => {
//     socket.broadcast.emit('printjobs',jobs)
//   })

//   socket.on('currentjob', (job) => {
//     socket.broadcast.emit('currentjob',job)
//   })

//   //print printjob if there's no job printing
//   // socket.on('printjob', (printJob) => {
//   //   //print printjob
//   //   printer.printPrintJob(printJob)
//   // })
// })

// const printWorker = new Worker('print-queue', async (job)=>{
//   await printer.printPrintJob(job.data)
// }, 
// { 
//   connection: {
//     host: 'localhost',
//     port: 6379
//   }
// })

// console.log(printWorker)

// httpServer.listen(3000)

require('dotenv').config()
const express = require('express')
const next = require('next')
const { createServer } = require("http")
const { Server } = require("socket.io")
const printer = require('./printer')
const { Worker } = require('bullmq')
const prisma  = require('./../app/utils/prisma')

const port = process.env.NEXT_PUBLIC_PORT

// creating the app either in production or dev mode 
const app = next({ dev: true })
const handle = app.getRequestHandler()

// running the app, async operation 
app.prepare().then(() => {
  const server = express()
  const http = createServer(server)
  const io = new Server(http)

  io.on("connection", (socket) => {
    console.log(`${socket.id} connected, current clients: ${io.engine.clientsCount}`)
    socket.on('printjobs', (jobs) => {
      socket.broadcast.emit('printjobs', jobs)
    })

    socket.on('currentjob', (job) => {
      socket.broadcast.emit('currentjob', job)
    })

    //print printjob if there's no job printing
    // socket.on('printjob', (printJob) => {
    //   //print printjob
    //   printer.printPrintJob(printJob)
    // })
  })

  server.get('/api/getcurrentjob', async (req, res) => { 
    //query to find the latest model created that is also the current model
    const searchResults = await prisma.print.findFirst({
      where: { 
        Status: 'PRINTING'   
      },     
      include: {
        Model: {
          include: {
            User: true
          }
        }
      },
    })
    res.json(searchResults)
  })

  server.get('/api/getmodel', async (req, res) => {
    //query to find the latest model created that is also the current model
    const model = await prisma.model.findFirst({
      where: { 
          IsCurrentModel: true      
      },     
      orderBy: {
          TimeStamp: 'desc'
      }
    })
    res.json(model)
  })

  server.get('/api/getprintjobs', async (req, res) => { 
    //query to find the latest model created that is also the current model
    const searchResults = await prisma.print.findMany({
      where: { 
          Status: {
              in: ['PENDING', 'QUEUED']
          }    
      },     
      orderBy: {
          TimeStamp: 'asc'
      },
      include: {
          Model: {
              include: {
                  User: true
              }
          }
      },
      take: 3
    })
    res.json(searchResults)
  })

  server.post('/api/handletwittersubmit', async (req, res) => { 
    console.log('i hath been fetched')

    const data = req.body

    const user = await prisma.user.upsert({
      where: {
        ContactInfo: data.twitterAccount
      },
      update: {
          Model: {
              create: {
              }
          }
      },
      create: {
          ContactInfo: data.twitterAccount,
          Model: {
              create: {
              }
          }
      },
      include : {
          Model: true
      }
    })

    console.log('model created for given user:\n', user)
    res.json({ message: 'twitter submit POST request received' })
  })
  
  // redirecting all requests to Next.js 
  server.all('*', (req, res) => {
    return handle(req, res)
  })

  http.listen(port, (err) => {
    if (err) throw err
    console.log(`Running on port ${port}, url: http://localhost:${port}`)
  })
})