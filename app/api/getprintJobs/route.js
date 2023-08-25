import { prisma } from "../../utils/prisma"
import { NextResponse } from 'next/server'

export async function GET() {
    //query to find the latest model created that is also the current model
    const searchResults = await prisma.print.findMany({
        where: { 
            Progress: 0     
        },     
        orderBy: {
            TimeStamp: 'asc'
        },
        take: 3
    })
    const response = NextResponse.json(searchResults)
    response.headers.set('Cache-Control', 'no-store')
    return response
}