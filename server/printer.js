require('dotenv').config()
const { SerialPort } = require('serialport')
const { ReadlineParser } = require('@serialport/parser-readline')
const fs = require('fs')
//const printQueue = require('./../app/utils/io').default
const { spawn } = require('child_process')
// const { io } = require('socket.io-client')
// const socket = io()

//debug
const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
})


let port
let parser

const init = () => {
    if (!port) {
        // Create a serial port instance
        port = new SerialPort({ path: process.env.COM, baudRate: 112500 }, function (err) {
            if (err) {
                return console.log('error creating a serial port instance: ', err.message)
            } else {
                console.log('connected to port')
            }
        })

        parser = port.pipe(new ReadlineParser({ delimiter: '\n' }))
    }
    //keep temps up between prints
    serialWrite('M104 F S120')
    serialWrite('M140 S60')
}


//send commands to 3d printer
const serialWrite = (message) => {
    port.write(message + '\n', function (err) {
        if (err) {
            return console.log('Error when writing to serial port: ', err.message)
        }
    })
}

const printPrintJob = (printJob) => {

    console.log('starting print...')

    let gcodeQueueIndex = 0

    //promise that resolves after the parser receives an 'ok'
    const waitForOK = () => new Promise((resolve) => {
        const dataCheck = (data) => {
            if (data == 'ok') {
                //once the printer sends an 'ok', unmount the event listener so there aren't multiple instances from calling waitForOK() multiple times
                parser.off('data', dataCheck)
                resolve(data)
            }
        }
        parser.on('data', dataCheck)
    })

    const gcodePath = printJob.GCODEPath

    //read gcode file
    fs.readFile(gcodePath, 'utf8', async (err, data) => {
        if (err) {
            console.error(err)
        }
        //create array of lines
        let gcode = data.split('\n')
        const totalLength = gcode.length - 1
        let progress = 0
        let prev = progress

        //get total time from gcode comments
        // totalTime = gcode.find(item => item.includes('estimated printing time')).split('=')[1].trim()
        // totalSeconds = parseInt(totalTime.split(' ')[0].replace(/\D/g, ''))*60 + parseInt(totalTime.split(' ')[1].replace(/\D/g, ''))

        //wait for user input
        //serialWrite('M0 Click to continue')
        // rl.question("Enter to continue: ", () => {
        //     rl.close()
        // })

        while (gcodeQueueIndex <= gcode.length - 1) {
            //making sure gcode line is a valid command
            let line = gcode[gcodeQueueIndex].split(';')[0]
            if (line != "" && line != "\n") {
                //write to printer
                //console.log(line)
                await sleep(5)
                //serialWrite(line)
                //wait for 'ok' command using promise
                //await waitForOK()
            }
            gcodeQueueIndex++
            prev = progress
            progress = Math.floor((gcodeQueueIndex / totalLength) * 100)
            if (prev != progress) console.log(progress)
        }
        console.log('done!')

        //keep temps up between prints
        //serialWrite('M104 F S120')
        //serialWrite('M140 S60')
    })
}

const slice = (printJob) => {
    return new Promise((resolve, reject) => {
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
                reject(code)
            }
        })
    })
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