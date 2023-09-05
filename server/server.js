require('dotenv').config()
const express = require('express')
const next = require('next')
const { createServer } = require("http")
const { Server } = require("socket.io")
const printer = require('./printer')
const prisma = require('./../app/utils/prisma')
const fs = require('fs')
//const socket = require('./../app/utils/io')
const { io } = require('socket.io-client')
const queue = require('./queue')
const port = process.env.NEXT_PUBLIC_PORT

// creating the app either in production or dev mode 
const app = next({ dev: true })
const handle = app.getRequestHandler()
const socket = io(`http://localhost:${process.env.NEXT_PUBLIC_PORT}`)

const bedCount = 6

// running the app, async operation 
app.prepare().then(() => {
  const server = express()
  server.use(express.json({ limit: '10mb' }))
  server.use(express.urlencoded({ limit: '10mb', extended: true }))
  const http = createServer(server)
  const io = new Server(http)
  printer.init()
  printer.serialWrite('M300 S440 P200')

  io.on("connection", (socket) => {
    console.log(`${socket.id} connected, current clients: ${io.engine.clientsCount}`)
    socket.on('printjobs', () => {
      console.log('PRINTJOBS CALLED')
      socket.broadcast.emit('printjobs')
    })

    socket.on('currentjob', () => {
      console.log('CURRENTJOB CALLED')
      socket.broadcast.emit('currentjob')
    })
  })

  // queue.worker.on('completed', async (job) => {
  //   console.log('worker said its done')
  //   const currentPrintJob = await prisma.print.update({
  //     where: { ID: job.data.ID },
  //     data: {
  //       Status: 'COMPLETED'
  //     },
  //     include: { //includes the model as well as the user attached to it
  //       Model: {
  //         include: {
  //           User: true
  //         }
  //       }
  //     },
  //   })
  //   socket.emit('currentjob', currentPrintJob)
  // })

  server.get('/api/getcurrentjob', async (req, res) => {
    //query to find the latest model created that is also the current model
    const searchResults = await prisma.print.findFirst({
      where: {
        Status: 'PRINTING'
      },
      include: {
        Model: {
          select: {
            ID: true,
            Params: true,
            User: {
              select: {
                ContactInfo: true
              }
            }
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
          select: {
            ID: true,
            Params: true,
            User: {
              select: {
                ContactInfo: true
              }
            }
          }
        }
      },
      take: 3
    })
    res.json(searchResults)
  })

  server.post('/api/handletwittersubmit', async (req, res) => {
    //console.log('i hath been fetched')
    console.log('start')
    const data = req.body
    const twitter = data.twitterAccount.replace(/^@/, '')
    console.log('end')
    
    const user = await prisma.user.upsert({
      where: {
        ContactInfo: twitter
      },
      update: {
        Model: {
          create: {
          }
        }
      },
      create: {
        ContactInfo: twitter,
        Model: {
          create: {
          }
        }
      }
    })
    
    console.log('model created for given user')
    //console.log('model created for given user:\n', user)

    res.json({ redirectUrl: `/model/${twitter}` })
  })

  server.post('/api/cleardb', async () => {
    await prisma.model.deleteMany({})
    await prisma.user.deleteMany({})
    await prisma.print.deleteMany({})

    //update print jobs and current job on the client
    socket.emit('printjobs')

    //update print jobs and current job on the client
    socket.emit('currentjob')
  })

  server.post('/api/savetooutputs', async (req, res) => {
    //creates .stl file of model in the outputs folder

    const data = req.body
    const STLstring = data.STLstring
    const modelParams = data.modelParams

    //query to find the latest model created that is also the current model
    let model = await prisma.model.findFirst({
      where: {
        IsCurrentModel: true
      },
      orderBy: {
        TimeStamp: 'desc'
      }
    })

    //find the latest print job or create one if all are full
    let printJob = await prisma.print.findFirst({
      where: {
        Status: 'PENDING'
      },
      orderBy: {
        TimeStamp: 'asc'
      }
    }) || await prisma.print.create({})

    //update created model's STL path and add print job ID
    model = await prisma.model.update({
      where: { ID: model.ID },
      data: {
        Params: modelParams,
        STLPath: `${process.env.OUTPUTS_PATH}${model.ID}.stl`,
        IsCurrentModel: false,
        Print: {
          connect: {
            ID: printJob.ID
          }
        }
      },
    })

    //create .stl file
    fs.writeFile(process.env.OUTPUTS_PATH + `${model.ID}.stl`, STLstring, (err) => {
      if (err) {
        console.error('error creating file:', err)
      } else {
        console.log('file created successfully.')
      }
    })

    console.log('added .stl to model')
    //console.log('added .stl to model:\n', model)

    //update print job and check if it is full
    printJob = await prisma.print.update({
      where: { ID: printJob.ID },
      data: {
        Status: {
          set: (
            await prisma.model.count({ //query count of models in the print job to be used for comparison
              where: { PrintID: printJob.ID }
            })
          ) >= bedCount ? 'QUEUED' : 'PENDING'
        }
      },
      include: {
        Model: {
          select: {
            ID: true
          }
        }
      }
    })

    console.log('print job created or updated')
    //console.log('print job created or updated:\n', printJob)

    //check to see if the print job is full, and if so, slice all models
    if (printJob.Status == 'QUEUED') {
      printer.slice(printJob)
        .then(async () => {
          //add gcode path to print Job
          const updatedPrintJob = await prisma.print.update({
            where: { ID: printJob.ID },
            data: {
              GCODEPath: `${process.env.OUTPUTS_PATH}${printJob.ID}.gcode`
            }
          })

          console.log('gcode added to print job')
          //console.log('gcode added to print job:\n', updatedPrintJob)

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
              }
            })
            socket.emit('currentjob')
            socket.emit('printjobs')

            console.log('printing job')
            //console.log('printing job:\n', currentPrintJob)
            //socket.emit('printjob', currentPrintJob)
            //const job = await queue.printQueue.add(currentPrintJob.ID, currentPrintJob)
            //console.log(job)
          }
        })
        .catch((err) => {
          console.error("error:", err)
        })
    }

    //send printjobs to update print queue on the client
    socket.emit('printjobs')
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