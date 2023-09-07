const { Queue, Worker } = require('bullmq')
const printer = require('./printer')

printer.init()

const printQueue = new Queue('print-queue', {
    connection: {
        host: 'localhost',
        port: 6379
    }
})

const worker = new Worker('print-queue', async (job) => {
    try {
        //update print job status to printing
        const res = await fetch('http://localhost/api/setjobstatus', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ jobID: job.data.ID, status: 'PRINTING' })
        }).catch(err => {
            console.error(err)
            throw err
        })
        if (!res.ok) {
            console.error('set job status error: ', res.status)
        }

        await printer.printPrintJob(job.data).catch(async (err) => {
            const res = await fetch('http://localhost/api/setjobstatus', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ jobID: job.data.ID, status: 'ERROR' })
            }).catch(err => {
                console.error(err)
                throw err
            })
            if (!res.ok) {
                console.error('error changing status to error: ', res.status)
            }
            console.error('printer error: ', err)
            printer.error = true
            await printQueue.pause()
            console.log('paused queue')
            throw err
        })
    } catch (err) {
        throw err
    }
})

module.exports = {
    printQueue,
    worker
}