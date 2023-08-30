import { prisma } from "../../utils/prisma"
import { NextResponse } from 'next/server'

export async function GET() {
    console.log('im getting called???')
    //query to find the latest model created that is also the current model
    const model = await prisma.model.findFirst({
        where: { 
            IsCurrentModel: true      
        },     
        orderBy: {
            TimeStamp: 'desc'
        }
    })
    return NextResponse.json(model)
}