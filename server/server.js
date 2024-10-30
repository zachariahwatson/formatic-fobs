const express = require("express")
const { createServer } = require("http")
const { Server } = require("socket.io")
const printer = require("./printer")
const queue = require("./queue")
const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, { cors: "*" })
let state = {
	timesUp: false,
}

app.use(express.json())

io.on("connection", (socket) => {
	console.log(`${socket.id} connected, current clients: ${io.engine.clientsCount}`)
	socket.on("printjobs", () => {
		try {
			console.log("socket: sending print jobs")
			socket.broadcast.emit("printjobs")
		} catch (err) {
			console.error("\x1b[31m%s\x1b[0m", "error handling printjobs:", err)
		}
	})

	socket.on("currentjob", () => {
		try {
			console.log("socket: sending current job")
			socket.broadcast.emit("currentjob")
		} catch (err) {
			console.error("\x1b[31m%s\x1b[0m", "error handling printjobs:", err)
		}
	})

	socket.on("progress", (progress) => {
		try {
			console.log("socket: sending progress")
			socket.broadcast.emit("progress", progress)
		} catch (err) {
			console.error("\x1b[31m%s\x1b[0m", "error emitting progress:", err)
		}
	})

	socket.on("timesup", async () => {
		try {
			if (state.timesUp === false) {
				console.log("socket: received times up")
				console.log("queue: closing worker...")
				queue.worker.close()
				state.timesUp = true
				console.log("timesup: ", state.timesUp)
			}
		} catch (err) {
			console.error("\x1b[31m%s\x1b[0m", "error in timesup socket listener:", err)
		}
	})
})

app.post("/slice", async (req, res) => {
	const data = req.body
	await printer.slice(data).catch((error) => {
		console.error("\x1b[31m%s\x1b[0m", "slice error: ", error)
		res.sendStatus(500)
	})
	res.sendStatus(200)
})

app.post("/clearjobqueue", async (req, res) => {
	await queue.printQueue.obliterate().catch((err) => {
		console.error("\x1b[31m%s\x1b[0m", "error obliterating queue: ", err)
		res.sendStatus(500)
	})
	console.log("queue: cleared job queue")
	res.sendStatus(200)
})

app.post("/pausequeue", async (req, res) => {
	await queue.printQueue.pause().catch((err) => {
		console.error("\x1b[31m%s\x1b[0m", "error pausing queue: ", err)
		res.sendStatus(500)
	})
	console.log("queue: paused queue")
	res.sendStatus(200)
})

app.post("/resumequeue", async (req, res) => {
	await queue.printQueue.resume().catch((err) => {
		console.error("\x1b[31m%s\x1b[0m", "error resuming queue: ", err)
		res.sendStatus(500)
	})
	console.log("queue: resuming queue")
	res.sendStatus(200)
})

app.post("/removeactivejob", async (req, res) => {
	const activeJobs = await queue.printQueue.getJobs(["active"]).catch((err) => {
		console.error("\x1b[31m%s\x1b[0m", "error removing active job: ", err)

		res.sendStatus(500)
	})
	if (activeJobs.length > 0) {
		for (const job of activeJobs) {
			await job.remove()
			console.log(`queue: removed active job with ID ${job.id}`)
		}
	} else {
		console.log("queue: no active jobs found")
	}
	res.sendStatus(200)
})

app.post("/restartfailedjob", async (req, res) => {
	console.log("worker: attempting job restart...")
	const data = req.body
	console.log("worker: checking printer port")
	await printer.checkPort().catch((err) => {
		console.error("\x1b[31m%s\x1b[0m", "check port error: ", err)
		throw err
	})
	await queue.printQueue
		.add(
			data.ID,
			{
				...data,
				currentLine: 0,
				targetExtruderTemp: 0,
				targetBedTemp: 0,
				zPosition: null,
			},
			{ priority: 1 }
		)
		.catch((err) => {
			console.error("\x1b[31m%s\x1b[0m", "error adding job to queue: ", err)
			res.sendStatus(500)
		})
	console.log("queue: job restarted: ", data.ID)
	res.sendStatus(200)
})

app.get("/timesup", (req, res) => {
	try {
		res.json({ timesUp: state.timesUp })
	} catch (err) {
		console.error("\x1b[31m%s\x1b[0m", err)
		res.status(500).json({ message: "Server error" })
	}
})

// app.post('/runprinterinit', async (req, res) => {
//   try {
//     printer.init()
//   } catch (err) {
//     console.error('\x1b[31m%s\x1b[0m','error initializing printer:', err)
//     res.sendStatus(500)
//   }
//   console.log('printer initialized')
//   res.sendStatus(200)
// })

app.post("/addjob", async (req, res) => {
	const data = req.body
	await queue.printQueue
		.add(data.ID, {
			...data,
			currentLine: 0,
			targetExtruderTemp: 0,
			targetBedTemp: 0,
			zPosition: null,
		})
		.catch((err) => {
			console.error("\x1b[31m%s\x1b[0m", "error adding job to queue: ", err)
			res.sendStatus(500)
		})
	console.log("queue: job queued")
	res.sendStatus(200)
})

app.use((err, req, res, next) => {
	console.error("\x1b[31m%s\x1b[0m", "express error handler:", err)
	res.status(500).send("Internal Server Error")
})

// if (queue.worker) {
queue.worker.on("completed", async (job) => {
	console.log("worker: job completed, setting status to ARCHIVED")
	const res = await fetch("http://localhost/api/setjobstatus", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ jobID: job.data.ID, status: "ARCHIVED" }),
	}).catch((err) => {
		console.error("\x1b[31m%s\x1b[0m", err)
		throw err
	})
	if (!res.ok) {
		console.error("\x1b[31m%s\x1b[0m", "re-queueing failed job error: ", res.status)
		throw new Error(res.status)
	}
	job.updateData({ ...job.data, Status: "ARCHIVED" })
})

queue.worker.on("failed", async (job) => {
	//await job.remove()
	console.log("worker: job failed, setting status to ERROR")
	const res = await fetch("http://localhost/api/setjobstatus", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ jobID: job.data.ID, status: "ERROR" }),
	}).catch((err) => {
		console.error("\x1b[31m%s\x1b[0m", err)
		throw err
	})
	if (!res.ok) {
		console.error("\x1b[31m%s\x1b[0m", "re-queueing failed job error: ", res.status)
		throw new Error(res.status)
	}
	job.updateData({
		...job.data,
		Status: "ERROR",
		currentLine: 0,
		targetExtruderTemp: 0,
		targetBedTemp: 0,
		zPosition: null,
	})
})

queue.worker.on("waiting", async (job) => {
	console.log("worker: job waiting, setting status to QUEUED")
	const res = await fetch("http://localhost/api/setjobstatus", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ jobID: job.data.ID, status: "QUEUED" }),
	}).catch((err) => {
		console.error("\x1b[31m%s\x1b[0m", err)
		throw err
	})
	if (!res.ok) {
		console.error("\x1b[31m%s\x1b[0m", "setting job status to QUEUED error: ", res.status)
		throw new Error(res.status)
	}
	job.updateData({
		...job.data,
		Status: "QUEUED",
		currentLine: 0,
		targetExtruderTemp: 0,
		targetBedTemp: 0,
		zPosition: null,
	})
})

queue.worker.on("stalled", async (jobID) => {
	const job = await queue.printQueue.getJob(jobID).catch((err) => {
		console.error("\x1b[31m%s\x1b[0m", "error getting stalled job from job id: ", err)
	})
	console.log("worker: job stalled, setting status to QUEUED")
	const res = await fetch("http://localhost/api/setjobstatus", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ jobID: job.data.ID, status: "QUEUED" }),
	}).catch((err) => {
		console.error("\x1b[31m%s\x1b[0m", err)
		throw err
	})
	if (!res.ok) {
		console.error("\x1b[31m%s\x1b[0m", "setting job status to stalled error: ", res.status)
		throw new Error(res.status)
	}
	job.updateData({
		...job.data,
		Status: "QUEUED",
		currentLine: 0,
		targetExtruderTemp: 0,
		targetBedTemp: 0,
		zPosition: null,
	})
})

queue.worker.on("error", async (job) => {
	console.error("\x1b[31m%s\x1b[0m", "worker: job error")
	job.updateData({
		...job.data,
		Status: "ERROR",
		currentLine: 0,
		targetExtruderTemp: 0,
		targetBedTemp: 0,
		zPosition: null,
	})
})

queue.worker.on("active", async (job) => {
	console.log("worker: job active")
	job.updateData({ ...job.data, Status: "PRINTING" })
})
// }

httpServer.listen(3000)
