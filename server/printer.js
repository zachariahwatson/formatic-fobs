require("dotenv").config()
const { SerialPort } = require("serialport")
const { ReadlineParser } = require("@serialport/parser-readline")
const { readFile } = require("node:fs/promises")
//const printQueue = require('./../app/utils/io').default
const { spawn, exec } = require("child_process")
const { io } = require("socket.io-client")
const socket = io(`http://localhost:${process.env.NEXT_PUBLIC_PORT}`)
const fs = require("fs").promises

let port
let parser
let interval

const connectToPort = () =>
	new Promise((resolve) => {
		const attemptConnect = async () => {
			if (!port) {
				// Create a serial port instance
				port = new SerialPort({ path: process.env.COM, baudRate: 115200 }, function (err) {
					if (err) {
						console.error("\x1b[31m%s\x1b[0m", "error creating a serial port instance: ", err.message)
					}
				})

				parser = port.pipe(
					new ReadlineParser({ delimiter: "\n" }, function (err) {
						if (err) {
							console.error("\x1b[31m%s\x1b[0m", "error creating parser: ", err.message)
						}
					})
				)
			} else if (!port.isOpen) {
				// Attempt to open the port
				port.open(async (err) => {
					if (!err) {
						console.log("serialport: port has been reconnected.")

						console.log("resuming queue")
						const res = await fetch("http://localhost:3000/resumequeue", {
							method: "POST",
							headers: {
								"Content-Type": "application/json",
							},
						}).catch((err) => {
							console.error("\x1b[31m%s\x1b[0m", err)
						})
						if (!res.ok) {
							console.error("\x1b[31m%s\x1b[0m", "resume queue error: ", res.status)
						}

						clearInterval(interval)
						resolve()
						// Add any additional initialization or resuming logic here
					}
				})

				console.log("pausing queue")
				const res = await fetch("http://localhost:3000/pausequeue", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
				}).catch((err) => {
					console.error("\x1b[31m%s\x1b[0m", err)
				})
				if (!res.ok) {
					console.error("\x1b[31m%s\x1b[0m", "pause queue error: ", res.status)
				}

				console.log("serialport: waiting for printer to turn on...")
			} else {
				clearInterval(interval)
				console.log("serialport: printer connected!")

				console.log("resuming queue")
				const res = await fetch("http://localhost:3000/resumequeue", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
				}).catch((err) => {
					console.error("\x1b[31m%s\x1b[0m", err)
				})
				if (!res.ok) {
					console.error("\x1b[31m%s\x1b[0m", "resume queue error: ", res.status)
				}

				resolve()
			}
		}
		if (interval) {
			clearInterval(interval) // clear the previous interval
		}
		interval = setInterval(attemptConnect, 2000)
	})

connectToPort()

const checkPort = async () => {
	if (!port || !port.isOpen) {
		await connectToPort()
	}
}

const printPrintJob = async (printJob) => {
	try {
		console.log("serialport: starting print: ", printJob.data.ID)

		let gcodeQueueIndex = printJob.data.currentLine

		//console.log(printJob)

		const gcodePath = printJob.data.GCODEPath

		const data = await readFile(gcodePath, "utf8")

		//create array of lines
		const gcode = data.split("\n")
		const totalLength = gcode.length - 1
		let progress = 0
		let prev = progress
		socket.emit("progress", progress)

		await serialWriteAndOK(printJob, `M109 S${printJob.data.targetExtruderTemp}`)
		await serialWriteAndOK(printJob, `M190 S${printJob.data.targetBedTemp}`)

		while (gcodeQueueIndex <= gcode.length - 1) {
			//making sure gcode line is a valid command
			let line = gcode[gcodeQueueIndex].split(";")[0]
			if (line != "" && line != "\n") {
				await printJob.updateData({
					...printJob.data,
					currentLine: gcodeQueueIndex,
				})
				const vals = line.split(" ").map((part) => part.slice(1))

				if (line.includes("M104") || line.includes("M109")) {
					await printJob.updateData({
						...printJob.data,
						targetExtruderTemp: vals[1],
					})
				} else if (line.includes("M140") || line.includes("M190")) {
					await printJob.updateData({
						...printJob.data,
						targetBedTemp: vals[1],
					})
				} else if (line.includes("G1 Z")) {
					await printJob.updateData({
						...printJob.data,
						zPosition: [vals[1], vals[2]],
					})
				} else if (line.includes("M73")) {
					await printJob.updateProgress(vals[1])
					socket.emit("progress", vals[1])
				}

				await serialWriteAndOK(printJob, line)
			}

			gcodeQueueIndex++
		}

		await completePrint(printJob)

		console.log("serialport: done!")
	} catch (err) {
		throw err
	}
}

//send commands to 3d printer
const serialWriteAndOK = (job, message) =>
	new Promise(async (resolve, reject) => {
		try {
			const dataCheck = (data) => {
				console.log("printer: ", data.toString())
				if (data.includes("ok")) {
					//once the printer sends an 'ok', unmount the event listener so there aren't multiple instances from calling waitForOK() multiple times
					parser.off("data", dataCheck)
					parser.off("error", handleError)
					port.off("close", handleDisconnect)
					resolve(data)
				}
			}

			const handleError = (err) => {
				parser.off("data", dataCheck)
				parser.off("error", handleError)
				port.off("close", handleDisconnect)
				console.error("\x1b[31m%s\x1b[0m", "error when parsing data:", err.message)
				reject(err)
			}

			const handleDisconnect = async () => {
				//port.off('close', handleDisconnect)
				parser.off("data", dataCheck)
				await checkPort()
				console.log("serialport: use absolute coordinates")
				await serialWrite("G90")
				await waitForOK()
				console.log("serialport: extruder relative mode")
				await serialWrite("M83")
				await waitForOK()
				console.log("serialport: setting Z to 20")
				await serialWrite("G1 Z20 F1500")
				await waitForOK()
				console.log("serialport: homing x and y axis")
				await serialWrite("G28 X Y")
				await waitForOK()
				console.log("serialport: homing z axis")
				await serialWrite("G30 X40")
				await waitForOK()
				console.log("serialport: parking extruder")
				await serialWrite("G27")
				await waitForOK()
				console.log("serialport: resetting last target temperatures")
				await serialWrite(`M109 S${job.data.targetExtruderTemp}`)
				await waitForOK()
				await serialWrite(`M190 S${job.data.targetBedTemp}`)
				await waitForOK()
				if (job.data.zPosition) {
					console.log("serialport: setting Z position")
					await serialWrite(`G1 Z${job.data.zPosition[0]} F${job.data.zPosition[1] && job.data.zPosition[1]}`)
				}
				await waitForOK()
				console.log("serialport: resending serialWrite")
				parser.on("data", dataCheck)
				await serialWrite(message)
			}

			parser.on("data", dataCheck)
			parser.on("error", handleError)
			port.on("close", handleDisconnect)

			await serialWrite(message)

			console.log("parser: waiting for ok")
		} catch (err) {
			reject(err)
		}
	})

//send commands to 3d printer
const serialWrite = async (message) => {
	try {
		await checkPort()
		console.log("sent: ", message)
		await port.write(message + "\n", function (err) {
			if (err) {
				throw err
			}
		})
	} catch (err) {
		console.error("\x1b[31m%s\x1b[0m", "error writing to serial: ", err.message)
		throw err
	}
}

//promise that resolves after the parser receives an 'ok'
const waitForOK = () =>
	new Promise(async (resolve, reject) => {
		try {
			await checkPort()
			console.log("parser: waiting for ok")
			const dataCheck = (data) => {
				console.log("printer: ", data.toString())
				if (data == "ok") {
					//once the printer sends an 'ok', unmount the event listener so there aren't multiple instances from calling waitForOK() multiple times
					parser.off("data", dataCheck)
					parser.off("error", handleError)
					resolve(data)
				}
			}

			const handleError = (err) => {
				parser.off("data", dataCheck)
				parser.off("error", handleError)
				console.error("\x1b[31m%s\x1b[0m", "error when parsing data:", err.message)
				reject(err)
			}

			const handleDisconnect = async () => {
				await checkPort()
			}

			parser.on("data", dataCheck)
			parser.on("error", handleError)
			port.on("close", handleDisconnect)
		} catch (err) {
			console.error("\x1b[31m%s\x1b[0m", "error while waiting for OK: ", err.message)
			throw err
		}
	})

const completePrint = async (printJob) => {
	try {
		const res = await fetch("http://localhost/api/setjobstatus", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ jobID: printJob.data.ID, status: "COMPLETED" }),
		}).catch((err) => {
			console.error("\x1b[31m%s\x1b[0m", err)
			throw err
		})
		if (!res.ok) {
			console.error("\x1b[31m%s\x1b[0m", "finish job error: ", res.status)
			throw new Error(res.status)
		}

		//keep temps up between prints
		await serialWrite("M104 F S120")
		await serialWrite("M140 S60")

		//wait for user input
		await serialWriteAndOK(printJob, "M0 Click to begin next print")
		//await waitForOK()
	} catch (err) {
		console.error("\x1b[31m%s\x1b[0m", "error while completing print: ", err.message)
		throw err
	}
}

const slice = async (printJob) => {
	try {
		let content = `
		#!/bin/bash
		cd ${process.env.PRUSA_CLI_PATH} && ./PrusaSlicer --export-gcode --merge --load ${process.env.CFG_PATH}${process.env.PRUSA_INI} --output ${process.env.OUTPUTS_PATH}${printJob.ID}.gcode`

		printJob.Model.forEach((model) => {
			content += ` ${process.env.OUTPUTS_PATH}${model.ID}.stl`
		})

		await fs.writeFile("./slice.sh", content, { mode: 0o755 })

		const command = "./slice.sh"

		const childProcess = spawn(command, { shell: true })

		await new Promise((resolve, reject) => {
			childProcess.on("error", (err) => {
				console.error("\x1b[31m%s\x1b[0m", `slice: failed to start child process: ${err}`)
				reject(err)
			})

			childProcess.on("close", (code) => {
				if (code === 0) {
					console.log("slice: child process exited successfully")
					resolve()
				} else {
					console.error("\x1b[31m%s\x1b[0m", `slice: child process exited with code ${code}`)
					reject(new Error(`slice: Child process exited with code ${code}`))
				}
			})
		})

		const gcodePath = `${process.env.OUTPUTS_PATH}${printJob.ID}.gcode`
		const data = await readFile(gcodePath, "utf8")
		const gcode = data.split("\n")
		//get total time from gcode comments
		const totalTime = gcode
			.find((item) => item.includes("estimated printing time"))
			.split("=")[1]
			.trim()
		const totalSeconds =
			(parseInt(totalTime.split(" ")[0].replace(/\D/g, "")) + 2) * 60 +
			(parseInt(totalTime.split(" ")[1].replace(/\D/g, "")) + 30)
		const totalMinutes = Math.ceil(totalSeconds / 60)
		const totalMillis = totalSeconds * 1000

		const res = await fetch("http://localhost/api/addestimatedtime", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				jobID: printJob.ID,
				estimatedTime: totalMillis,
			}),
		}).catch((err) => {
			console.error("\x1b[31m%s\x1b[0m", err)
		})
		if (!res.ok) {
			console.error("\x1b[31m%s\x1b[0m", "add job queue error: ", res.status)
		}

		console.log("added estimated job time")
	} catch (err) {
		console.error("\x1b[31m%s\x1b[0m", "error slicing: ", err.message)
	}
}

function sleep(ms) {
	//for debug
	return new Promise((resolve) => setTimeout(resolve, ms))
}

module.exports = {
	connectToPort,
	checkPort,
	printPrintJob,
	serialWrite,
	slice,
}
