require('dotenv').config()
const { SerialPort } = require('serialport')
const { ReadlineParser } = require('@serialport/parser-readline')
const { readFile } = require('node:fs/promises')
//const printQueue = require('./../app/utils/io').default
const { spawn } = require('child_process')
const { io } = require('socket.io-client')
const socket = io(`http://localhost:${process.env.NEXT_PUBLIC_PORT}`)

let port
let parser
let interval

const connectToPort = () => new Promise((resolve) => {
    const attemptConnect = () => {
        if (!port) {
            // Create a serial port instance
            port = new SerialPort({ path: process.env.COM, baudRate: 112500 }, function (err) {
                if (err) {
                    console.error('error creating a serial port instance: ', err.message)
                }
            })

            parser = port.pipe(new ReadlineParser({ delimiter: '\n' }, function (err) {
                if (err) {
                    console.error('error creating parser: ', err.message)
                }
            }))
        } else if (!port.isOpen) {
            // Attempt to open the port
            port.open((err) => {
                if (!err) {
                    console.log('serialport: port has been reconnected.')
                    clearInterval(interval)
                    resolve()
                    // Add any additional initialization or resuming logic here
                }
            })

            console.log('serialport: waiting for printer to turn on...')
        } else {
            clearInterval(interval)
            console.log('serialport: printer connected!')
            resolve()
        }
    }
    if (interval) {
        clearInterval(interval) // clear the previous interval
    }
    interval = setInterval(attemptConnect, 2000)
})

connectToPort()

const checkPort = async () => {
    if (!port || !port.isOpen) {
        await connectToPort()
    }
}

const printPrintJob = async (printJob) => {
    try {
        console.log('serialport: starting print: ', printJob.data.ID)

        let gcodeQueueIndex = printJob.data.currentLine

        const gcodePath = printJob.data.GCODEPath

        const data = await readFile(gcodePath, 'utf8')

        //create array of lines
        const gcode = data.split('\n')
        const totalLength = gcode.length - 1
        let progress = 0
        let prev = progress
        socket.emit('progress', progress)

        //get total time from gcode comments
        // totalTime = gcode.find(item => item.includes('estimated printing time')).split('=')[1].trim()
        // totalSeconds = parseInt(totalTime.split(' ')[0].replace(/\D/g, ''))*60 + parseInt(totalTime.split(' ')[1].replace(/\D/g, ''))

        await serialWriteAndOK(`M109 S${printJob.data.targetExtruderTemp}`)
        await serialWriteAndOK(`M190 S${printJob.data.targetBedTemp}`)

        while (gcodeQueueIndex <= gcode.length - 1) {

            //making sure gcode line is a valid command
            let line = gcode[gcodeQueueIndex].split(';')[0]
            if (line != "" && line != "\n") {
                await printJob.updateData({ ...printJob.data, currentLine: gcodeQueueIndex })
                if (line.includes('M104')) {
                    if (line.includes('120')) {
                        await printJob.updateData({ ...printJob.data, targetExtruderTemp: 120 })
                    } else if (line.includes('210')) {
                        await printJob.updateData({ ...printJob.data, targetExtruderTemp: 210 })
                    } else if (line.includes('205')) {
                        await printJob.updateData({ ...printJob.data, targetExtruderTemp: 205 })
                    } else {
                        await printJob.updateData({ ...printJob.data, targetExtruderTemp: 0 })
                    }
                }
                if (line.includes('M140')) {
                    if (line.includes('60')) {
                        await printJob.updateData({ ...printJob.data, targetBedTemp: 60 })
                    } else {
                        await printJob.updateData({ ...printJob.data, targetBedTemp: 0 })
                    }
                }
                //write to printer
                //console.log(line)
                //await sleep(5)
                await serialWriteAndOK(printJob, line)
                //wait for 'ok' command using promise
                //await waitForOK()
            }

            gcodeQueueIndex++
            prev = progress
            progress = Math.floor((gcodeQueueIndex / totalLength) * 100)
            if (prev != progress) {
                console.log(progress)
                await printJob.updateProgress(progress)
                socket.emit('progress', progress)
            }
        }

        await completePrint(printJob)

        //keep temps up between prints
        await serialWrite('M104 F S120')
        await serialWrite('M140 S60')
        console.log('serialport: done!')
    } catch (err) {
        throw err
    }
}

//send commands to 3d printer
const serialWriteAndOK = (job, message) => new Promise(async (resolve, reject) => {
    try {
        const dataCheck = (data) => {
            if (data == 'ok') {
                console.log('ok')
                //once the printer sends an 'ok', unmount the event listener so there aren't multiple instances from calling waitForOK() multiple times
                parser.off('data', dataCheck)
                parser.off('error', handleError)
                port.off('close', handleDisconnect)
                resolve(data)
            }
        }

        const handleError = (err) => {
            parser.off('data', dataCheck)
            parser.off('error', handleError)
            port.off('close', handleDisconnect)
            console.error('error when parsing data:', err.message)
            reject(err)
        }

        const handleDisconnect = async () => {
            //port.off('close', handleDisconnect)
            await checkPort()
            console.log('serialport: resetting last target temperatures')
            await serialWrite(`M109 S${job.data.targetExtruderTemp}`)
            await waitForOK()
            await serialWrite(`M190 S${job.data.targetBedTemp}`)
            await waitForOK()
            console.log('serialport: resending serialWrite')
            await serialWrite(message)
            await waitForOK()
        }

        parser.on('data', dataCheck)
        parser.on('error', handleError)
        port.on('close', handleDisconnect)

        await serialWrite(message)

        console.log('parser: waiting for ok')
    } catch (err) {
        reject(err)
    }
})


//send commands to 3d printer
const serialWrite = async (message) => {
    try {
        await checkPort()
        console.log(message)
        await port.write(message + '\n', function (err) {
            if (err) {
                throw err
            }
        })
    } catch (err) {
        console.error('error writing to serial: ', err.message)
        throw err
    }
}

//promise that resolves after the parser receives an 'ok'
const waitForOK = () => new Promise(async (resolve, reject) => {
    try {
        await checkPort()
        console.log('parser: waiting for ok')
        const dataCheck = (data) => {
            if (data == 'ok') {
                console.log('ok')
                //once the printer sends an 'ok', unmount the event listener so there aren't multiple instances from calling waitForOK() multiple times
                parser.off('data', dataCheck)
                parser.off('error', handleError)
                resolve(data)
            }
        }

        const handleError = (err) => {
            parser.off('data', dataCheck)
            parser.off('error', handleError)
            console.error('error when parsing data:', err.message)
            reject(err)
        }

        const handleDisconnect = async () => {
            await checkPort()
        }

        parser.on('data', dataCheck)
        parser.on('error', handleError)
        port.on('close', handleDisconnect)
    } catch (err) {
        console.error('error while waiting for OK: ', err.message)
        throw err
    }

})

const completePrint = async (printJob) => {
    try {
        const res = await fetch('http://localhost/api/setjobstatus', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ jobID: printJob.data.ID, status: 'COMPLETED' })
        }).catch(err => {
            console.error(err)
            throw err
        })
        if (!res.ok) {
            console.error('finish job error: ', res.status)
            throw new Error(res.status)
        }
        //wait for user input
        await serialWriteAndOK(printJob, 'M0 Click to begin next print')
        //await waitForOK()
    } catch (err) {
        console.error('error while completing print: ', err.message)
        throw err
    }
}

const slice = async (printJob) => {
    try {
        const command = process.env.PRUSA_CLI_PATH
        const args = [
            `--export-gcode`,
            `--merge`,
            `--load`,
            `./../cfg/test1.ini`,
            `--load`,
            `./../cfg/test2.ini`,
            `--load`,
            `./../cfg/test3.ini`,
            `--output`,
            `${printJob.ID}.gcode`,
        ]

        printJob.Model.forEach((model) => {
            args.push(`${model.ID}.stl`)
        })

        const childProcess = spawn(command, args, {
            stdio: "inherit",
            cwd: process.env.OUTPUTS_PATH,
        })

        await new Promise((resolve, reject) => {
            childProcess.on("error", (err) => {
                console.error(`failed to start child process: ${err}`)
                reject(err)
            })

            childProcess.on("close", (code) => {
                if (code === 0) {
                    console.log("child process exited successfully")
                    resolve()
                } else {
                    console.error(`child process exited with code ${code}`)
                    reject(new Error(`Child process exited with code ${code}`))
                }
            })
        })
    } catch (err) {
        console.error('error slicing: ', err.message)
    }
}


function sleep(ms) { //for debug
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
    connectToPort,
    checkPort,
    printPrintJob,
    serialWrite,
    slice,
}