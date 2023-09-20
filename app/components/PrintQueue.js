import { useEffect, useState } from "react"
import { motion } from "framer-motion"
//import  socket  from '../utils/io'
import { io } from "socket.io-client"
import ProgressBar from "./ProgressBar"

export default function PrintQueue() {
	const [printJobs, setPrintJobs] = useState([])
	const [currentJob, setcurrentJob] = useState([])
	const [progress, setProgress] = useState(0)

	useEffect(() => {
		const socket = io(`http://localhost:${process.env.NEXT_PUBLIC_PORT}`)
		async function fetchData() {
			const res = await fetch("/api/getprintjobs").catch((err) => {
				console.error(err)
			})
			const printJobs = await res.json()
			//console.log(printJobs)
			setPrintJobs(printJobs)
		}
		fetchData()

		async function fetchCurrentJob() {
			const res = await fetch("/api/getcurrentjob").catch((err) => {
				console.error(err)
			})
			const currentJob = await res.json()
			//console.log(currentJob)
			setcurrentJob(currentJob)
		}
		fetchCurrentJob()

		socket.on("printjobs", () => {
			console.log("socket: printjobs received")
			fetchData()
		})

		socket.on("currentjob", () => {
			console.log("socket: currentjob received")
			fetchCurrentJob()
		})

		socket.on("progress", (progress) => {
			console.log("socket: progress received")
			setProgress(progress)
		})

		return () => {
			console.log("socket: disconnected")
			socket.disconnect()
		}
	}, [])

	return (
		<div className="h-full">
			<div className="w-full h-4/6 flex flex-col-reverse justify-start">
				{printJobs.map((job, i) => {
					return (
						<div className="h-1/3 pb-4" key={job.ID}>
							<motion.div
								className="h-full rounded-3xl text-3xl outline-none shadow-lg shadow-white border border-white relative flex justify-around p-4 pt-14"
								initial={{ opacity: 0, y: -100 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: 0.5 * i }}
								exit={{ opacity: 0 }}
							>
								<div className="w-full bg-gradient-to-b from-black from-50% to-transparent absolute top-0 left-0 z-10 rounded-3xl">
									<p className="text-2xl px-4 pt-2">
										<span className="font-n27-extralight">STATUS_</span>
										<span className="font-n27-regular">{job.Status}</span>
										<span className="font-n27-regular float-right pt-1">
											{job.ID}
										</span>
										<span className="font-n27-extralight float-right pt-1">
											ID_
										</span>
									</p>
									<svg className="w-full h-10">
										<defs>
											<marker
												id="arrow"
												viewBox="0 0 10 10"
												refX="10"
												refY="5"
												markerWidth="6"
												markerHeight="6"
												orient="auto-start-reverse"
											>
												<path d="M 0 0 L 10 5 L 0 10 z" fill="#fff" />
											</marker>
										</defs>
										<line
											x1="0"
											y1="6"
											x2="100%"
											y2="6"
											stroke="#fff"
											strokeWidth="1.5"
											strokeDasharray="2,3"
											markerEnd="url(#arrow)"
											markerStart="url(#arrow)"
										/>
									</svg>
								</div>
								<div className="flex flex-col-reverse font-n27-extralight justify-around text-2xl w-full h-full uppercase">
									{job.Model.map((model) => {
										return (
											<motion.p
												className="w-full flex"
												initial={{ opacity: 0, y: -25 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ duration: 0.5 }}
												exit={{ opacity: 0 }}
												key={model.ID}
											>
												<span className="w-1/2 truncate">
													@{model.User.ContactInfo}
												</span>
												<span className="w-1/2 text-right">
													TYPE_
													<span className="font-n27-regular">
														{model.Params.type}
													</span>
												</span>
											</motion.p>
										)
									})}
								</div>
							</motion.div>
						</div>
					)
				})}
			</div>
			<div className="h-2/6">
				<motion.div
					className="w-full h-full rounded-3xl text-4xl outline-none shadow-lg shadow-white border border-white p-4 relative pt-20"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.5 }}
				>
					<div className="w-full h-28 bg-gradient-to-b from-black from-50% to-transparent absolute top-0 left-0 z-10 rounded-3xl">
						<p className="text-4xl mb-px px-4 pb-2 pt-4">
							<span className="font-n27-extralight">STATUS_</span>
							<span className="font-n27-regular">
								{currentJob && currentJob.Status
									? currentJob.Status
									: "WAITING"}
							</span>
							<span className="font-n27-regular float-right pt-1">
								{currentJob && currentJob.ID ? currentJob.ID : "NULL"}
							</span>
							<span className="font-n27-extralight float-right pt-1">ID_</span>
						</p>
						<svg className="w-full h-10">
							<defs>
								<marker
									id="arrow"
									viewBox="0 0 10 10"
									refX="10"
									refY="5"
									markerWidth="6"
									markerHeight="6"
									orient="auto-start-reverse"
								>
									<path d="M 0 0 L 10 5 L 0 10 z" fill="#fff" />
								</marker>
							</defs>
							<line
								x1="0"
								y1="6"
								x2="100%"
								y2="6"
								stroke="#fff"
								strokeWidth="1.5"
								strokeDasharray="2,3"
								markerEnd="url(#arrow)"
								markerStart="url(#arrow)"
							/>
						</svg>
					</div>
					<div className="flex flex-col font-n27-extralight justify-around text-3xl w-full h-3/4 uppercase">
						{currentJob &&
							currentJob.Model &&
							currentJob.Model.map((model) => {
								return (
									<p className="w-full flex" key={model.ID}>
										<span className="w-1/2 truncate">
											@{model.User.ContactInfo}
										</span>
										<span className="w-1/2 text-right">
											TYPE_
											<span className="font-n27-regular">
												{model.Params.type}
											</span>
										</span>
									</p>
								)
							})}
					</div>
					<div className="h-1/4">
						<ProgressBar progress={progress} />
					</div>
				</motion.div>
			</div>
		</div>
	)
}

{
	/* <div className="flex flex-col font-n27-extralight justify-around text-3xl w-full">
                            <p>@TEST</p>
                            <p>@TEST</p>
                            <p>@TEST</p>
                            <p>@TEST</p>
                        </div> */
}
