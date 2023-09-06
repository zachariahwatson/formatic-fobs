import { prisma } from './../../utils/prisma'
import { socket }  from './../../utils/io'
import { NextResponse } from 'next/server'

export async function POST() {
    await prisma.model.deleteMany({})
    await prisma.user.deleteMany({})
    await prisma.print.deleteMany({})

    //update print jobs and current job on the client
    socket.emit('printjobs')

    //update print jobs and current job on the client
    socket.emit('currentjob')
    return NextResponse.json({message: 'cleared db successfully'})
}