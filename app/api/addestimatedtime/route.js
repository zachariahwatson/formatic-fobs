import { prisma } from "../../utils/prisma"
import { socket } from "../../utils/io"
import { NextResponse } from "next/server"

export async function POST(req) {
	const data = await req.json()

	const currentPrintJob = await prisma.print.update({
		where: { ID: data.jobID },
		data: {
			EstimatedTime: data.estimatedTime,
		},
	})

	socket.emit("printjobs")

	console.log("prisma: job eta set")

	return NextResponse.json({ message: "added job eta successfully" })
}
