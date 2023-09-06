import { prisma } from './../../utils/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
    //query to find the latest model created that is also the current model
    const searchResults = await prisma.print.findMany({
        where: {
            Status: {
                in: ['PENDING', 'QUEUED']
            }
        },
        orderBy: {
            TimeStamp: 'asc'
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
        take: 3
    })
    return NextResponse.json(searchResults)
}