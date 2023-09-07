require('dotenv').config()
const { SerialPort } = require('serialport')
const { ReadlineParser } = require('@serialport/parser-readline')
const { readFile } = require('node:fs/promises')
//const printQueue = require('./../app/utils/io').default
const { spawn } = require('child_process')
// const { io } = require('socket.io-client')
// const socket = io()

let port
let parser

const init = async (restart) => {
    try {
        if (!port || restart) {
            // Create a serial port instance
            port = new SerialPort({ path: process.env.COM, baudRate: 112500 }, function (err) {
                if (err) {
                    console.error('error creating a serial port instance: ', err.message)
                } else {
                    console.log('connected to port')
                }
            })

            parser = port.pipe(new ReadlineParser({ delimiter: '\n' }, function (err) {
                if (err) {
                    console.error('error creating parser: ', err.message)
                }
            }))

            // parser.on('data', (data) => {
            //     console.log(data)
            // })
            //keep temps up between prints
            await serialWrite('M104 F S120')
            await serialWrite('M140 S60')
        }
    } catch (err) {
        console.error('error initializing printer: ', err.message)
    }

}


//send commands to 3d printer
const serialWrite = async (message) => {
    try {
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

const printPrintJob = async (printJob) => {
    try {
        console.log('starting print...')

        let gcodeQueueIndex = 0

        const gcodePath = printJob.GCODEPath

        const data = await readFile(gcodePath, 'utf8')

        //create array of lines
        const gcode = data.split('\n')
        const totalLength = gcode.length - 1
        let progress = 0
        let prev = progress

        //get total time from gcode comments
        // totalTime = gcode.find(item => item.includes('estimated printing time')).split('=')[1].trim()
        // totalSeconds = parseInt(totalTime.split(' ')[0].replace(/\D/g, ''))*60 + parseInt(totalTime.split(' ')[1].replace(/\D/g, ''))

        while (gcodeQueueIndex <= gcode.length - 1) {

            //making sure gcode line is a valid command
            let line = gcode[gcodeQueueIndex].split(';')[0]
            if (line != "" && line != "\n") {
                //write to printer
                //console.log(line)
                //await sleep(5)
                await serialWrite(line)
                //wait for 'ok' command using promise
                await waitForOK()
            }

            gcodeQueueIndex++
            prev = progress
            progress = Math.floor((gcodeQueueIndex / totalLength) * 100)
            if (prev != progress) console.log(progress)
        }

        await completePrint(printJob)

        //keep temps up between prints
        await serialWrite('M104 F S120')
        await serialWrite('M140 S60')
        console.log('done!')
    } catch (err) {
        throw err
    }
}

//promise that resolves after the parser receives an 'ok'
const waitForOK = () => new Promise((resolve, reject) => {
    const dataCheck = (data) => {
        if (data == 'ok') {
            console.log('ok')
            //once the printer sends an 'ok', unmount the event listener so there aren't multiple instances from calling waitForOK() multiple times
            parser.off('data', dataCheck)
            parser.off('error', handleError)
            port.off('close', handleError)
            resolve(data)
        }
    }

    const handleError = (err) => {
        parser.off('data', dataCheck)
        parser.off('error', handleError)
        port.off('close', handleError)
        console.error('waiting for OK error:', err.message)
        reject(err)
    }

    parser.on('data', dataCheck)
    parser.on('error', handleError)
    port.on('close', handleError)
})

const completePrint = async (printJob) => {
    try {
        const res = await fetch('http://localhost/api/setjobstatus', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ jobID: printJob.ID, status: 'COMPLETED' })
        }).catch(err => {
            console.error(err)
            throw err
        })
        if (!res.ok) {
            console.error('finish job error: ', res.status)
            throw new Error(res.status)
        }
        //wait for user input
        await serialWrite('M0 Click to begin next print')
        await waitForOK()
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
    init,
    printPrintJob,
    serialWrite,
    slice
}