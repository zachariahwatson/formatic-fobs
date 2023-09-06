import { prisma } from './../../utils/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
    //query to find the latest model created that is also the current model
    const searchResults = await prisma.print.findFirst({
        where: {
            Status: 'PRINTING'
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
    return NextResponse.json(searchResults)
}