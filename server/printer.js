const { SerialPort } = require('serialport')
const { ReadlineParser} = require('@serialport/parser-readline')
const fs = require('fs')

let port
let parser

const init = () => {
    if (!port) {
        // Create a serial port instance
        port = new SerialPort({ path: 'COM3', baudRate: 112500 }, function (err) {
            if (err) {
                return console.log('error creating a serial port instance: ', err.message)
            } else {
                console.log('connected to port')
            }
        })

        parser = port.pipe(new ReadlineParser({ delimiter: '\n' }))
    }
}


//send commands to 3d printer
const serialWrite = (message) => {
    port.write(message+'\n', function (err) {
      if (err) {
        return console.log('Error when writing to serial port: ', err.message)
      }
    })
}

const printPrintJob = (printJob) => { //for testing
    console.log('starting print...')

    let gcodeQueueIndex = 0

    //promise that resolves after the parser receives an 'ok'
    const waitForOK = () => new Promise((resolve) => {
        const dataCheck = (data) => {
            if (data == 'ok') {
                //once the printer sends an 'ok', unmount the event listener so there aren't multiple instances from calling waitForOK() multiple times
                parser.off('data',dataCheck)
                resolve(data)
            }
        }
        parser.on('data', dataCheck)
    })

    const gcodePath = `${process.env.OUTPUTS_PATH}${printJob.ID}.gcode`

    //read gcode file
    fs.readFile(gcodePath, 'utf8', async (err, data) => {
        if (err) {
            console.error(err)
        }
        //create array of lines
        let gcode = data.split('\n')

        //get total time from gcode comments
        // totalTime = gcode.find(item => item.includes('estimated printing time')).split('=')[1].trim()
        // totalSeconds = parseInt(totalTime.split(' ')[0].replace(/\D/g, ''))*60 + parseInt(totalTime.split(' ')[1].replace(/\D/g, ''))

        while (gcodeQueueIndex <= gcode.length-1) {
            //making sure gcode line is a valid command
            let line = gcode[gcodeQueueIndex].split(';')[0]
            if(line != "" && line != "\n") {
                //write to printer
                console.log(line)
                serialWrite(line)
                //wait for 'ok' command using promise
                await waitForOK()
            }
            gcodeQueueIndex++
        }
        console.log('done!')
    })
}

module.exports = {
    init,
    printPrintJob,
    serialWrite
}