const express = require("express")
const { createServer } = require("http")
const { Server } = require("socket.io")
const printer = require('./printer')
printer.init()
const queue = require('./queue')
const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, { cors: '*' })

app.use(express.json())

io.on("connection", (socket) => {
  console.log(`${socket.id} connected, current clients: ${io.engine.clientsCount}`)
  socket.on('printjobs', () => {
    try {
      console.log('sending print jobs')
      socket.broadcast.emit('printjobs')
    } catch (err) {
      console.error('error handling printjobs:', err)
    }
  })

  socket.on('currentjob', () => {
    try {
      console.log('sending current job')
      socket.broadcast.emit('currentjob')
    } catch (err) {
      console.error('error handling printjobs:', err)
    }
  })
})

app.post('/slice', async (req, res) => {
  const data = req.body
  await printer.slice(data).catch((error) => {
    console.error('slice error: ', error)
    res.sendStatus(500)
  })
  res.sendStatus(200)
})

app.post('/clearjobqueue', async (req, res) => {
  await queue.printQueue.obliterate().catch(err => {
    console.error('error obliterating queue: ', err)
    res.sendStatus(500)
  })
  console.log('cleared job queue')
  res.sendStatus(200)
})

app.post('/removeactivejob', async (req, res) => {
  const activeJobs = await queue.printQueue.getJobs(['active']).catch(err => {
    console.error('error removing active job: ', err)
    
    res.sendStatus(500)
  })
  if (activeJobs.length > 0) {
    for (const job of activeJobs) {
      await job.remove()
      console.log(`removed active job with ID ${job.id}`)
    }
  } else {
    console.log('no active jobs found')
  }
  res.sendStatus(200)
})

app.post('/restartactivejob', async (req, res) => {
  const data = req.body
  await printer.init(true)
  await queue.printQueue.add(data.ID, data, { priority: 1 }).catch(err => {
    console.error('error adding job to queue: ', err)
    res.sendStatus(500)
  })
  console.log('job restarted')
  await queue.printQueue.resume()
  console.log('queue resumed')
  res.sendStatus(200)
})

// app.post('/runprinterinit', async (req, res) => {
//   try {
//     printer.init()
//   } catch (err) {
//     console.error('error initializing printer:', err)
//     res.sendStatus(500)
//   }
//   console.log('printer initialized')
//   res.sendStatus(200)
// })

app.post('/addjob', async (req, res) => {
  const data = req.body
  await queue.printQueue.add(data.ID, data).catch(err => {
    console.error('error adding job to queue: ', err)
    res.sendStatus(500)
  })
  console.log('job queued')
  res.sendStatus(200)
})

app.use((err, req, res, next) => {
  console.error('express error handler:', err)
  res.status(500).send('Internal Server Error')
})

queue.worker.on('completed', async (job) => {
  console.log('worker said its done')

})

queue.worker.on('error', async (job) => {
  console.log('worker error')

})

httpServer.listen(3000)