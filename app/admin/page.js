"use client"

export default function Page() {
	const clearDB = async () => {
		const res = await fetch("/api/cleardb", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
		}).catch((err) => {
			console.error("\x1b[31m%s\x1b[0m", err)
		})
		if (!res.ok) {
			console.error("\x1b[31m%s\x1b[0m", "clear db error: ", res.status)
		}
	}

	const clearJobQueue = async () => {
		const res = await fetch("http://localhost:3000/clearjobqueue", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
		}).catch((err) => {
			console.error("\x1b[31m%s\x1b[0m", err)
		})
		if (!res.ok) {
			console.error("\x1b[31m%s\x1b[0m", "clear job queue error: ", res.status)
		}
	}

	const removeActiveJob = async () => {
		const res = await fetch("http://localhost:3000/removeactivejob", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
		}).catch((err) => {
			console.error("\x1b[31m%s\x1b[0m", err)
		})
		if (!res.ok) {
			console.error("\x1b[31m%s\x1b[0m", "remove active job error: ", res.status)
		}
	}

	const restartFailedJob = async () => {
		const res = await fetch("/api/restartfailedjob", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
		}).catch((err) => {
			console.error("\x1b[31m%s\x1b[0m", err)
		})
		if (!res.ok) {
			console.error("\x1b[31m%s\x1b[0m", "restart failed job error: ", res.status)
		}
	}

	const repopulateQueue = async () => {
		const res = await fetch("/api/repopulatequeue", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
		}).catch((err) => {
			console.error("\x1b[31m%s\x1b[0m", err)
		})
		if (!res.ok) {
			console.error("\x1b[31m%s\x1b[0m", "repopulate queue error: ", res.status)
		}
	}

	// const runPrinterInit = async () => {
	//     await fetch('http://localhost:3000/runprinterinit', {
	//         method: 'POST',
	//         headers: {
	//             'Content-Type': 'application/json',
	//         },
	//     })
	// }

	return (
		<>
			<h1 className="mx-4 mt-36 font-n27-bold">ADMIN PAGE</h1>
			<button className="mx-4 mt-8 border border-white font-n27-light rounded-md p-2" onClick={() => clearDB()}>
				clear db
			</button>
			<button className="mx-4 mt-8 border border-white font-n27-light rounded-md p-2" onClick={() => clearJobQueue()}>
				clear job queue
			</button>
			<button className="mx-4 mt-8 border border-white font-n27-light rounded-md p-2" onClick={() => removeActiveJob()}>
				remove active job
			</button>
			<button
				className="mx-4 mt-8 border border-white font-n27-light rounded-md p-2"
				onClick={() => restartFailedJob()}
			>
				restart failed job
			</button>
			<button className="mx-4 mt-8 border border-white font-n27-light rounded-md p-2" onClick={() => repopulateQueue()}>
				repopulate queue
			</button>
		</>
	)
}

//clear db
//start printer temp maintain
{
	/* <button className="mx-4 mt-8 border border-white font-n27-light rounded-md p-2" onClick={setTemps()}>set init printer temp</button> */
}
{
	/* <button className="mx-4 mt-8 border border-white font-n27-light rounded-md p-2" onClick={() => runPrinterInit()}>run printer init</button> */
}
