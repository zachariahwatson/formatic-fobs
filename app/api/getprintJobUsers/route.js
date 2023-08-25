import { prisma } from "../../utils/prisma"
import { NextResponse } from 'next/server'

export async function GET(jobID) {
    //query to find the latest model created that is also the current model
    const searchResults = await prisma.model.findMany({
        where: { 
            IsCurrentModel: true      
        },     
        orderBy: {
            TimeStamp: 'desc'
        },
        take: 1
    })
    const model = searchResults[0]
    return NextResponse.json(model)
}