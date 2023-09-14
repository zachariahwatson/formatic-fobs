import { useEffect, useState } from "react"
import { motion } from "framer-motion"
//import  socket  from '../utils/io'
import { io } from "socket.io-client"

export default function PrintQueue() {
    const [printJobs, setPrintJobs] = useState([])
    const [currentJob, setcurrentJob] = useState([])
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const socket = io(`http://localhost:${process.env.NEXT_PUBLIC_PORT}`)
        async function fetchData() {
            const res = await fetch('/api/getprintjobs').catch(err => {
                console.error(err)
            })
            const printJobs = await res.json()
            //console.log(printJobs)
            setPrintJobs(printJobs)
        }
        fetchData()

        async function fetchCurrentJob() {
            const res = await fetch('/api/getcurrentjob').catch(err => {
                console.error(err)
            })
            const currentJob = await res.json()
            //console.log(currentJob)
            setcurrentJob(currentJob)
        }
        fetchCurrentJob()

        socket.on('printjobs', () => {
            console.log('socket: printjobs received')
            fetchData()
        })

        socket.on('currentjob', () => {
            console.log('socket: currentjob received')
            fetchCurrentJob()
        })

        socket.on('progress', (progress) => {
            console.log('socket: progress received')
            setProgress(progress)
        })

        return () => {
            console.log('socket: disconnected')
            socket.disconnect()
        }
    }, [])

    return (
        <div className="h-full">
            <div className="w-full h-3/5 flex flex-col-reverse justify-start">
                {printJobs.map((job, i) => {
                    return (
                        <div className="h-1/3 pb-4">
                            <motion.div
                                className="h-full rounded-3xl text-4xl outline-none shadow-lg shadow-white border border-white relative flex justify-around p-4"
                                initial={{ opacity: 0, y: -100 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: .5, delay: .5 * i }}
                                exit={{ opacity: 0 }}
                                key={job.ID}
                            >
                                <div className="flex flex-col-reverse font-n27-extralight justify-around text-2xl w-full h-full uppercase">
                                    {job.Model.map((model) => {
                                        return (
                                            <motion.p
                                                className="w-full flex"
                                                initial={{ opacity: 0, y: -25 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: .5 }}
                                                exit={{ opacity: 0 }}
                                                key={model.ID}
                                            >
                                                <span className="w-1/2 truncate">@{model.User.ContactInfo}</span>
                                                <span className="w-1/2 text-right">TYPE_<span className="font-n27-regular">{model.Params.type}</span></span>
                                            </motion.p>
                                        )
                                    })}
                                </div>
                            </motion.div>
                        </div>
                    )
                })}
            </div>
            <div className="h-2/5">
                <motion.div
                    className="w-full h-full rounded-3xl text-4xl outline-none shadow-lg shadow-white border border-white p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: .5 }}
                >
                    <div>{currentJob && currentJob.Status}</div>
                    <div>{currentJob && progress}</div>
                    <div className="flex flex-col font-n27-extralight justify-around text-3xl w-full h-full uppercase">
                        {currentJob && currentJob.Model && currentJob.Model.map((model) => {
                            return (
                                <p className="w-full flex" key={model.ID}>
                                    <span className="w-1/2 truncate">@{model.User.ContactInfo}</span>
                                    <span className="w-1/2 text-right">TYPE_<span className="font-n27-regular">{model.Params.type}</span></span>
                                </p>
                            )
                        })}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

{/* <div className="flex flex-col font-n27-extralight justify-around text-3xl w-full">
                            <p>@TEST</p>
                            <p>@TEST</p>
                            <p>@TEST</p>
                            <p>@TEST</p>
                        </div> */}

