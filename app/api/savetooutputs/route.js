import { prisma } from "../../utils/prisma"
import { NextResponse } from 'next/server'
import { socket } from './../../utils/io'
const fs = require('fs')


export async function POST(req) {
    console.log('hi')
    // const { STLstring, modelParams } = req.body

    // //creates .stl file of model in the outputs folder
    
    // //query to find the latest model created that is also the current model
    // let model = await prisma.model.findFirst({
    //     where: { 
    //         IsCurrentModel: true      
    //     },     
    //     orderBy: {
    //         TimeStamp: 'desc'
    //     }
    // })

    // //find the latest print job or create one if all are full
    // let printJob = await prisma.print.findFirst({
    //     where: { 
    //         Status: 'filling' 
    //     },
    //     orderBy: { 
    //         TimeStamp: 'asc' 
    //     }
    // }) || await prisma.print.create({ 
    //     data: { 
    //         Status: 'filling' 
    //     }
    // })

    // //update created model's STL path and add print job ID
    // model = await prisma.model.update({
    //     where: { ID: model.ID },
    //     data: {
    //         Params: modelParams,
    //         STLPath: `${process.env.OUTPUTS_PATH}${model.ID}.stl`,
    //         IsCurrentModel: false,
    //         Print: {
    //             connect: {
    //                 ID: printJob.ID
    //             }
    //         }
    //     },
    // })

    // console.log('added .stl to model:\n', model)
    
    // //update print job and check if it is full
    // printJob = await prisma.print.update({
    //     where: { ID: printJob.ID },
    //     data: {
    //         Status: {
    //             set: (
    //                 await prisma.model.count({ //query count of models in the print job to be used for comparison
    //                     where: { PrintID: printJob.ID }
    //                 })
    //             ) >= 4 ? 'full' : 'filling'
    //         }
    //     },
    //     include: { //includes model but only the model ID because of the select thingy
    //         Model: {
    //             select: {
    //                 ID: true
    //             }
    //         }
    //     }
    // })

    // console.log('print job created or updated:\n', printJob)

    // //create .stl file
    // fs.writeFile(process.env.OUTPUTS_PATH + `${model.ID}.stl`, STLstring, (err) => {
    //     if (err) {
    //         console.error('error creating file:', err)
    //     } else {
    //         console.log('file created successfully.')
    //     }
    // })

    // //send printjobs to update print queue
    // const sendPrintJobs = await prisma.print.findMany({
    //     where: { 
    //         Progress: 0     
    //     },     
    //     orderBy: {
    //         TimeStamp: 'asc'
    //     },
    //     include: { //includes the model as well as the user attached to it
    //         Model: {
    //             include: {
    //                 User: true
    //             }
    //         }
    //     },
    //     take: 3
    // })
    // console.log(sendPrintJobs[0].Model)

    // socket.broadcast.emit('printjobs', sendPrintJobs)

    // Return an empty response with a 204 No Content status code
    const res = NextResponse.next()
    res.status(204)
    return res
}