import { prisma } from "../../utils/prisma"
import { NextResponse } from 'next/server'

export async function POST(req) {
    const data = await req.json()

    const updatedPrintJob = await prisma.print.update({
        where: { 
            ID: data.printJob.ID    
        },  
        data: {
            Progress: data.progress
        },
        include: {
            Model: {
                include: {
                    User: true
                }
            }
        }
    })
    const response = NextResponse.json(updatedPrintJob)
    response.headers.set('Cache-Control', 'no-store')
    return response
}