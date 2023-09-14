const { Queue, Worker } = require('bullmq')
const printer = require('./printer')

//printer.init()

const printQueue = new Queue('print-queue', {
    connection: {
        host: 'localhost',
        port: 6379
    },
    defaultJobOptions: {
        attempts: 5,
        backoff: {
            type: 'fixed',
            delay: 5000,
        },
    },
})

const worker = new Worker('print-queue', async (job) => {
    try {
        console.log('worker: checking port before next job...')
        await printer.checkPort().catch(err => {
            console.error('check port error: ', err)
            throw err
        })
        console.log('worker: processing next job...')
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

        await printer.printPrintJob(job).catch(async (err) => {
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
            throw err
        })
    } catch (err) {
        await printQueue.pause()
        console.log('queue: paused queue')
        throw err
    }
})

module.exports = {
    printQueue,
    worker
}