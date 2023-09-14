const express = require("express")
const { createServer } = require("http")
const { Server } = require("socket.io")
const printer = require('./printer')
const queue = require('./queue')
//console.log(queue.printQueue.getFailed())
const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, { cors: '*' })

app.use(express.json())

io.on("connection", (socket) => {
  console.log(`${socket.id} connected, current clients: ${io.engine.clientsCount}`)
  socket.on('printjobs', () => {
    try {
      console.log('socket: sending print jobs')
      socket.broadcast.emit('printjobs')
    } catch (err) {
      console.error('error handling printjobs:', err)
    }
  })

  socket.on('currentjob', () => {
    try {
      console.log('socket: sending current job')
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
  console.log('queue: cleared job queue')
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
      console.log(`queue: removed active job with ID ${job.id}`)
    }
  } else {
    console.log('queue: no active jobs found')
  }
  res.sendStatus(200)
})

app.post('/restartfailedjob', async (req, res) => {
  console.log('worker: attempting job restart...')
  const data = req.body
  console.log('worker: checking printer port')
  await printer.checkPort().catch(err => {
    console.error('check port error: ', err)
    throw err
  })
  await queue.printQueue.add(data.ID, { ...data, currentLine: 0, targetExtruderTemp: 0, targetBedTemp: 0 }, { priority: 1 }).catch(err => {
    console.error('error adding job to queue: ', err)
    res.sendStatus(500)
  })
  console.log('queue: job restarted: ', data.ID)
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
  await queue.printQueue.add(data.ID, { ...data, currentLine: 0, targetExtruderTemp: 0, targetBedTemp: 0 }).catch(err => {
    console.error('error adding job to queue: ', err)
    res.sendStatus(500)
  })
  console.log('queue: job queued')
  res.sendStatus(200)
})

app.use((err, req, res, next) => {
  console.error('express error handler:', err)
  res.status(500).send('Internal Server Error')
})

if (queue.worker) {
  queue.worker.on('completed', async (job) => {
    console.log('worker: job completed')
  })

  queue.worker.on('failed', async (job) => {
    //await job.remove()
    console.log('worker: job failed')
    // const res = await fetch('http://localhost:3000/restartfailedjob', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(job.data)
    // }).catch(err => {
    //   console.error(err)
    // })
    // if (!res.ok) {
    //   console.error('restart job error: ', res.status)
    // }
  })
}


httpServer.listen(3000)