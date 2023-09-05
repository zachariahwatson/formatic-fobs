// 'use server'

// import prisma from './utils/prisma'
// import { spawn } from 'child_process'
// import { revalidatePath } from 'next/cache'
// const fs = require('fs')
// import { useRouter } from 'next/navigation'
// import socket from './utils/io'
// //import { io } from 'socket.io-client'
// import { printQueue } from './utils/queue'

// export async function handleTwitterSubmit(formData) {
//     const user = await prisma.user.upsert({
//         where: {
//           ContactInfo: formData.get('twitterAccount')
//         },
//         update: {
//             Model: {
//                 create: {
//                 }
//             }
//         },
//         create: {
//             ContactInfo: formData.get('twitterAccount'),
//             Model: {
//                 create: {
//                 }
//             }
//         },
//         include : {
//             Model: true
//         }
//     })

//     console.log('model created for given user:\n', user)
// }

// export async function saveToOutputs(STLstring, modelParams) {
//     //const socket = io('http://localhost:3000')
//     //creates .stl file of model in the outputs folder
    
//     //query to find the latest model created that is also the current model
//     let model = await prisma.model.findFirst({
//         where: { 
//             IsCurrentModel: true      
//         },     
//         orderBy: {
//             TimeStamp: 'desc'
//         }
//     })

//     //find the latest print job or create one if all are full
//     let printJob = await prisma.print.findFirst({
//         where: { 
//             Status: 'PENDING' 
//         },
//         orderBy: { 
//             TimeStamp: 'asc' 
//         }
//     }) || await prisma.print.create({})

//     //update created model's STL path and add print job ID
//     model = await prisma.model.update({
//         where: { ID: model.ID },
//         data: {
//             Params: modelParams,
//             STLPath: `${process.env.OUTPUTS_PATH}${model.ID}.stl`,
//             IsCurrentModel: false,
//             Print: {
//                 connect: {
//                     ID: printJob.ID
//                 }
//             }
//         },
//     })

//     //create .stl file
//     fs.writeFile(process.env.OUTPUTS_PATH + `${model.ID}.stl`, STLstring, (err) => {
//         if (err) {
//             console.error('error creating file:', err)
//         } else {
//             console.log('file created successfully.')
//         }
//     })

//     console.log('added .stl to model:\n', model)
    
//     //update print job and check if it is full
//     printJob = await prisma.print.update({
//         where: { ID: printJob.ID },
//         data: {
//             Status: {
//                 set: (
//                     await prisma.model.count({ //query count of models in the print job to be used for comparison
//                         where: { PrintID: printJob.ID }
//                     })
//                 ) >= 4 ? 'QUEUED' : 'PENDING'
//             }
//         },
//         include: { //include model
//             Model: true
//         }
//     })

//     console.log('print job created or updated:\n', printJob)

//     //check to see if the print job is full, and if so, slice all models
//     if (printJob.Status == 'QUEUED') {
//         await slice(printJob)
//     }

//     //send printjobs to update print queue on the client
//     const sendPrintJobs = await prisma.print.findMany({
//         where: { 
//             Status: {
//                 in: ['PENDING', 'QUEUED']
//             }      
//         },     
//         orderBy: {
//             TimeStamp: 'asc'
//         },
//         include: { //includes the model as well as the user attached to it
//             Model: {
//                 include: {
//                     User: true
//                 }
//             }
//         },
//         take: 3
//     })
//     //console.log(sendPrintJobs[0].Model)

//     socket.emit('printjobs', sendPrintJobs)
// }

// export async function clearDB() {
//     await prisma.model.deleteMany({})
//     await prisma.user.deleteMany({})
//     await prisma.print.deleteMany({})

//     // console.log(await prisma.model.findMany({}))
//     // console.log(await prisma.user.findMany({}))
//     // console.log(await prisma.print.findMany({}))
    
// }

// export async function slice(printJob) {
//     //will be different for mac
//     const command = process.env.PRUSA_CLI_PATH
//     const args = [
//         `--export-gcode`, 
//         `--merge`,
//         `--load`, `./../cfg/test1.ini`,
//         `--load`, `./../cfg/test2.ini`, 
//         `--load`, `./../cfg/test3.ini`,
//         `--output`, `${printJob.ID}.gcode`
//     ]

//     printJob.Model.forEach((model) => {
//         args.push(`${model.ID}.stl`)
//     })

//     //programatically add these later
//     // const args = [
//     //     `--export-gcode`, 
//     //     `--merge`,
//     //     `--load`, `./../cfg/test1.ini`,
//     //     `--load`, `./../cfg/test2.ini`, 
//     //     `--load`, `./../cfg/test3.ini`, 
//     //     `cube1.stl`, `cube2.stl`, `cube3.stl`, 
//     // ]
//     //const args = ['--help-fff']

//     //spawn child process
//     const childProcess = spawn(command, args, { 
//         stdio: 'inherit', //inherit server cmd window
//         cwd: process.env.OUTPUTS_PATH , //cd to outputs folder
//     })

//     childProcess.on('error', (err) => {
//         console.error(`failed to start child process: ${err}`)
//     })

//     childProcess.on('close', async (code) => {
//         if (code === 0) {
//             console.log('child process exited successfully')

//             //add gcode path to print Job
//             const updatedPrintJob = await prisma.print.update({
//                 where: { ID: printJob.ID },
//                 data: {
//                     GCODEPath: `${process.env.OUTPUTS_PATH}${printJob.ID}.gcode`
//                 }
//             })

//             console.log('gcode added to print job:\n', updatedPrintJob)

//             const isPrinting = await prisma.print.count({
//                 where: {
//                 Status: 'PRINTING'
//                 }
//             })
        
//             if (isPrinting == 0) {
//                 //update print job status to printing
//                 const currentPrintJob = await prisma.print.update({
//                     where: { ID: printJob.ID },
//                     data: {
//                         Status: 'PRINTING'
//                     },
//                     include: { //includes the model as well as the user attached to it
//                         Model: {
//                             include: {
//                                 User: true
//                             }
//                         }
//                     },
//                 })
        
//                 socket.emit('currentjob', currentPrintJob)
        
//                 //update print jobs on the client
//                 const updatedPrintJobs = await prisma.print.findMany({
//                     where: { 
//                         Status: {
//                         in: ['PENDING', 'QUEUED']
//                         }     
//                     },     
//                     orderBy: {
//                         TimeStamp: 'asc'
//                     },
//                     include: { //includes the model as well as the user attached to it
//                         Model: {
//                             include: {
//                                 User: true
//                             }
//                         }
//                     },
//                     take: 3
//                 })
//                 socket.emit('printjobs', updatedPrintJobs)
        
//                 console.log('printing job:\n', currentPrintJob)
//                 //socket.emit('printjob', currentPrintJob)
//                 const job = await printQueue.add(currentPrintJob.ID, currentPrintJob)
//                 console.log(job)
//             }

//         } else {
//             console.error(`child process exited with code ${code}`)
//         }
//     })
// }