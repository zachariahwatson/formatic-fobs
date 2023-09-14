import { prisma } from '../../utils/prisma'
import { socket } from '../../utils/io'
import { NextResponse } from 'next/server'

export async function POST() {

    const errorJob = await prisma.print.findFirst({
        where: {
            Status: {
                in: ['ERROR', 'PRINTING']
            }
        },
    })

    if (errorJob) {
        const res = await fetch('http://localhost:3000/restartfailedjob', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(errorJob)
        }).catch(err => {
            console.error(err)
        })
        if (!res.ok) {
            console.error('restart job error: ', res.status)
        }
    } else {
        console.log('prisma: no error or printing job found')
    }

    return NextResponse.json({ message: 'restarting job' })
}