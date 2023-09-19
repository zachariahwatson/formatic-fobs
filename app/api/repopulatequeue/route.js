import { prisma } from "../../utils/prisma"
import { socket } from "../../utils/io"
import { NextResponse } from "next/server"

export async function POST() {
	const jobs = await prisma.print.findMany({
		where: {
			Status: {
				in: ["PRINTING", "QUEUED"],
			},
		},
		orderBy: {
			TimeStamp: "desc",
		},
	})

	await jobs.forEach(async (job) => {
		const res = await fetch("http://localhost:3000/addjob", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(job),
		}).catch((err) => {
			console.error(err)
		})
		if (!res.ok) {
			console.error("add job queue error: ", res.status)
		}
	})

	return NextResponse.json({ message: "repopulated job queue" })
}
