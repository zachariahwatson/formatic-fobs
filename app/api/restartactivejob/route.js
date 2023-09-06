import { prisma } from '../../utils/prisma'
import { socket } from '../../utils/io'
import { NextResponse } from 'next/server'

export async function POST() {

    const errorJob = await prisma.print.findFirst({
        where: {
            Status: {
                equals: 'ERROR'
            }
        },
    })

    if (errorJob) {
        const res = await fetch('http://localhost:3000/restartactivejob', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(errorJob)
        })
        if (!res.ok) {
            console.error('restart job error: ', res.status)
        }
    } else {
        console.log('no error job found')
    }

    return NextResponse.json({ message: 'restarting job' })
}