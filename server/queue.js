const { Queue, Worker} = require('bullmq')
const printer = require('./printer')

printer.init()

const printQueue = new Queue('print-queue', {
    connection: {
        host: 'localhost',
        port: 6379
    }
})

const worker = new Worker('print-queue', async (job) => {
    //update print job status to printing
    const res = await fetch('http://localhost/api/setjobstatus', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobID: job.data.ID, status: 'PRINTING' })
    })
    if (!res.ok) {
        console.error('set job status error: ', res.status)
    }
    return new Promise((resolve, reject) => {
        printer.printPrintJob(job.data, async (err) => {
            if (err) {
                const res = await fetch('http://localhost/api/setjobstatus', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ jobID: job.data.ID, status: 'ERROR' })
                })
                if (!res.ok) {
                    console.error('error changing status to error: ', res.status)
                } else {
                    console.error('printer error: ', err)
                }
                reject(err)
            } else {
                resolve()
            }
        })
    })
})

module.exports = {
    printQueue,
    worker
}