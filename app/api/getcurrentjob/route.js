import { prisma } from "../../utils/prisma"
import { NextResponse } from 'next/server'

export async function GET() {
    //query to find the latest model created that is also the current model
    const searchResults = await prisma.print.findFirst({
        where: { 
            Status: 'PRINTING'   
        },     
        include: {
            Model: {
                include: {
                    User: true
                }
            }
        },
    })

    const response = NextResponse.json(searchResults)
    response.headers.set('Cache-Control', 'no-store')
    return response
}