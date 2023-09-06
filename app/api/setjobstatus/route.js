import { prisma } from '../../utils/prisma'
import { socket } from '../../utils/io'
import { NextResponse } from 'next/server'

export async function POST(req) {
    const data = await req.json()

    //if changing status to PRINTING, change the current COMPLETED job to ARCHIVED
    if (data.status == 'PRINTING') {
        const searchResults = await prisma.print.updateMany({
            where: {
                Status: {
                    equals: 'COMPLETED'
                }
            },
            data: {
                Status: 'ARCHIVED'
            }
        })
    }

    const currentPrintJob = await prisma.print.update({
        where: { ID: data.jobID },
        data: {
            Status: data.status
        },
        include: {
            Model: {
                select: {
                    ID: true,
                    Params: true,
                    User: {
                        select: {
                            ContactInfo: true
                        }
                    }
                }
            }
        },
    })

    socket.emit('currentjob')
    socket.emit('printjobs')

    console.log('job status set')

    return NextResponse.json({ message: 'changed job status successfully' })
}