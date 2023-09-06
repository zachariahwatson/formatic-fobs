import { prisma } from './../../utils/prisma'
import { socket } from './../../utils/io'
import { NextResponse } from 'next/server'
const fs = require('fs')
const bedCount = 4

export async function POST(req) {
    //creates .stl file of model in the outputs folder
    const data = await req.json()
    const STLstring = data.STLstring
    const modelParams = data.modelParams

    //query to find the latest model created that is also the current model
    let model = await prisma.model.findFirst({
        where: {
            IsCurrentModel: true
        },
        orderBy: {
            TimeStamp: 'desc'
        }
    })

    //find the latest print job or create one if all are full
    let printJob = await prisma.print.findFirst({
        where: {
            Status: 'PENDING'
        },
        orderBy: {
            TimeStamp: 'asc'
        }
    }) || await prisma.print.create({})

    //update created model's STL path and add print job ID
    model = await prisma.model.update({
        where: { ID: model.ID },
        data: {
            Params: modelParams,
            STLPath: `${process.env.OUTPUTS_PATH}${model.ID}.stl`,
            IsCurrentModel: false,
            Print: {
                connect: {
                    ID: printJob.ID
                }
            }
        },
    })

    //create .stl file
    fs.writeFile(process.env.OUTPUTS_PATH + `${model.ID}.stl`, STLstring, (err) => {
        if (err) {
            console.error('error creating file:', err)
        } else {
            console.log('file created successfully.')
        }
    })

    console.log('added .stl to model')
    //console.log('added .stl to model:\n', model)

    //update print job and check if it is full
    printJob = await prisma.print.update({
        where: { ID: printJob.ID },
        data: {
            Status: {
                set: (
                    await prisma.model.count({ //query count of models in the print job to be used for comparison
                        where: { PrintID: printJob.ID }
                    })
                ) >= bedCount ? 'QUEUED' : 'PENDING'
            }
        },
        include: {
            Model: {
                select: {
                    ID: true
                }
            }
        }
    })

    console.log('print job created or updated')
    //console.log('print job created or updated:\n', printJob)

    //check to see if the print job is full, and if so, slice all models
    if (printJob.Status == 'QUEUED') {
        //printer.slice(printJob)
        const res = await fetch('http://localhost:3000/slice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(printJob)
        })
        if (!res.ok) {
            console.error('save to outputs error: ', res.status)
        }

        //add gcode path to print Job
        const updatedPrintJob = await prisma.print.update({
            where: { ID: printJob.ID },
            data: {
                GCODEPath: `${process.env.OUTPUTS_PATH}${printJob.ID}.gcode`
            }
        })

        console.log('gcode added to print job')
        //console.log('gcode added to print job:\n', updatedPrintJob)

        // const isPrinting = await prisma.print.count({
        //     where: {
        //         Status: 'PRINTING'
        //     }
        // })

        // if (isPrinting == 0) {
        //     //update print job status to printing
        //     const currentPrintJob = await prisma.print.update({
        //         where: { ID: printJob.ID },
        //         data: {
        //             Status: 'PRINTING'
        //         }
        //     })
        //     socket.emit('currentjob')
        //     socket.emit('printjobs')
        //     console.log('printing job')
        //     //console.log('printing job:\n', currentPrintJob)
        //     //socket.emit('printjob', currentPrintJob)
        //     //const job = await queue.printQueue.add(currentPrintJob.ID, currentPrintJob)
        //     //console.log(job)
        // }
        const jobRes = await fetch('http://localhost:3000/addjob', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedPrintJob)
        })
        if (!jobRes.ok) {
            console.error('add job queue error: ', jobRes.status)
        }
    }

    //send printjobs to update print queue on the client
    socket.emit('printjobs')
    return NextResponse.json({ message: 'saved to outputs successfully' })
}