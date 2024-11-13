// import express from 'express'
// const app = express()
// import path from 'path';
// const __dirname = path.resolve()
// import spawn from 'child_process'
// import fs from 'fs'
// import { SerialPort } from 'serialport'
// import { ReadlineParser}  from '@serialport/parser-readline'
// import logUpdate from 'log-update'
// import chalk from 'chalk'

// app.use(express.static(__dirname + '/public'))

// app.listen(3000, () =>
//   console.log(chalk.gray('Visit http://127.0.0.1:3000'))
// );

// // const command = 'prusa-slicer-console.exe'
// // const args = ['-g', './models/box.stl', '--load', './cfg/test1.ini', '--load', './cfg/test2.ini', '--load', './cfg/test3.ini', '--output', './models/box.gcode']

/* Slic3r can be used as a command line tool and provides great flexibility so that you can perform operations in batch or as part of more complex workflows. The general syntax is: slic3r [ ACTION ] [ OPTIONS ] [ model1.stl model2.stl ... ]1. If multiple models are supplied, the requested action will be performed separately for each one1. You can use the --merge option to arrange and then merge the given models into a single one, thus the action will be performed once1. If the --dont-arrange option is supplied, models will be merged at their original coordinates1.

If you want to auto-arrange multiple .stl models in the Slic3r CLI, you can use the --merge option without the --dont-arrange option. For example, you can use the following command: slic3r --merge model1.stl model2.stl model3.stl. This will arrange and then merge the given models into a single one.*/

// // const childProcess = spawn(command, args, { stdio: 'inherit' })

// const gcodePath = './models/box.gcode'
// let action, tempData, extruderTemp, extruderTarget, bedTemp, bedTarget, progress, totalTime, totalSeconds, startTime, minutes, seconds
// let timer = 0

// // Create a serial port instance
// const port = new SerialPort({path: 'COM3', baudRate: 112500 }, function (err) {
//   if (err) {
//     return console.log('Error creating a serial port instance: ', err.message)
//   }
// })

// //send commands to 3d printer
// const serialWrite = (message) => {
//   port.write(message+'\n', function (err) {
//     if (err) {
//       return console.log('Error when writing to serial port: ', err.message)
//     }
//   })
// }

// // Create a parser event listener
// const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }))
// //handle printer notifications
// //set temps to auto report
// serialWrite('M155 S1')

// parser.on('data', (data, error) => {
//   //console.log(data)
//   if (error) {
//     return console.log('Error receiving data: ', err.message)
//   }
//   if (data.search('action:') != -1) {
//     action = data.split(/ (.*)/)[1].trim()
//     if (data.search('Print') != -1) {
//       timer = Math.floor((Date.now() - startTime) / 1000)
//     } else if (data.search('Ready') != -1) {
//       timer = 0
//     }
//   } else if (data.search('T:') != -1) {
//     tempData = data.trim().split(' ')
//     extruderTemp = parseInt(tempData[0].split(':')[1])
//     extruderTarget = parseInt(tempData[1].split('/')[1])
//     bedTemp = parseInt(tempData[2].split(':')[1])
//     bedTarget = parseInt(tempData[3].split('/')[1])
//   }
//   minutes = Math.floor(timer / 60);
//   seconds = timer % 60;
//   progress = (timer / totalSeconds) * 100
// })

// const frames = ['---','-- -','- -  -','-  -     -','-  -      -','-  -      -','--   -','---','-- -','---'];
// let index = 0
// setInterval(() => {
//   const frame = frames[index = ++index % frames.length]
//   logUpdate(
// `${frame}
// ${chalk.hex('#FF8800').bold('Temps')} | Nozzle: ${extruderTemp}/${extruderTarget} C | Bed: ${bedTemp}/${bedTarget} C
// ${frame}
// ${chalk.hex('#FF8800').bold('Status')} | ${action == undefined ? 'No notifications yet' : action}
// ${frame}
// ${chalk.hex('#FF8800').bold('Progress')} | ${minutes}m ${seconds}s/~${totalTime} | ${Math.round(progress)}%
// ${frame}`
//   )
// },200)

// //once connected, print gcode file
// port.on('open', (error) => {
//   if (error) {
//     return console.log('Error opening port: ', err.message)
//   }

//   console.log(chalk.green.bold('Connected to serial port'))

//   let gcodeQueueIndex = 0

//   //promise that resolves after the parser receives an 'ok'
//   const waitForOK = () => new Promise((resolve) => {
//     const dataCheck = (data) => {
//       if (data == 'ok') {
//         //once the printer sends an 'ok', unmount the event listener so there aren't multiple instances from calling waitForOK() multiple times
//         parser.off('data',dataCheck)
//         resolve(data)
//       }
//     }
//     parser.on('data', dataCheck)
//   })

//   //timer start time
//   startTime = Date.now()

//   //read gcode file
//   fs.readFile(gcodePath, 'utf8', async (err, data) => {
//     if (err) {
//       console.error('\x1b[31m%s\x1b[0m',err)
//     }
//     //create array of lines
//     let gcode = data.split('\n')

//     //get total time from gcode comments
//     totalTime = gcode.find(item => item.includes('estimated printing time')).split('=')[1].trim()
//     totalSeconds = parseInt(totalTime.split(' ')[0].replace(/\D/g, ''))*60 + parseInt(totalTime.split(' ')[1].replace(/\D/g, ''))

//     while (gcodeQueueIndex <= gcode.length-1) {
//       //making sure gcode line is a valid command
//       let line = gcode[gcodeQueueIndex].split(';')[0]
//       if(line != "" && line != "\n") {
//         //write to printer
//         //console.log(line)
//         serialWrite(line)
//         //wait for 'ok' command using promise
//         await waitForOK()
//       }
//       gcodeQueueIndex++
//     }
//     console.log('done!')
//   })
// })
