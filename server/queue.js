const { Queue, Worker, Job } = require('bullmq')
const printer = require('./printer')

printer.init()

let printQueue
let worker

if (!printQueue) {
    printQueue = new Queue('print-queue', { connection: {
        host: 'localhost',
        port: 6379
    }})
}

if (!worker) {
    worker = new Worker('print-queue', (job) => {
        //printer.printPrintJob(job.data)
    })
    
}

module.exports = {
    printQueue,
    worker
}