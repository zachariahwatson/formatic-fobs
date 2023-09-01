import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { socket } from "../utils/io"
//import { io } from "socket.io-client"

export default function PrintQueue() {
    const [printJobs, setPrintJobs] = useState([])
    const [currentJob, setcurrentJob] = useState([])
    
    useEffect(() => {
        //const socket = io('http://localhost:3000')
        async function fetchData() {
            const res = await fetch('/api/getprintjobs')
            const printJobs = await res.json()
            //console.log(printJobs)
            setPrintJobs(printJobs)
        }
        fetchData()

        async function fetchCurrentJob() {
            const res = await fetch('/api/getcurrentjob')
            const currentJob = await res.json()
            //console.log(currentJob)
            setcurrentJob(currentJob)
        }
        fetchCurrentJob()

        socket.on('printjobs', (jobs) => {
            setPrintJobs(jobs)
        })

        socket.on('currentjob', (job) => {
            setcurrentJob(job)
        })

        return () => {
            socket.disconnect()
        }
    }, [])

    return (
        <div className="h-full pt-20 pb-4">
            <div className="w-full h-3/5 flex flex-col-reverse pt-1 justify-start">
                {printJobs.map((job, i) => {
                    return (
                        <motion.div 
                            className="h-1/3 rounded-3xl text-4xl outline-none shadow-lg shadow-white border border-white relative mt-4 flex justify-around p-4"
                            initial={{ opacity: 0, y: -100 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: .5, delay: .5 * i }}
                            exit={{ opacity: 0}}
                            key={job.ID}
                        >
                            <div className="flex flex-col-reverse font-n27-extralight justify-around text-3xl w-full h-full uppercase">
                                {job.Model.map((model) => {
                                    return (
                                        <motion.p 
                                            className="w-full flex" 
                                            initial={{ opacity: 0, y: -25 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: .5}}
                                            exit={{ opacity: 0}}
                                            key={model.User.ID}
                                        >
                                            <span className="w-1/2 truncate">@{model.User.ContactInfo}</span>
                                            <span className="w-1/2 text-right">TYPE_<span className="font-n27-regular">{model.Params.type}</span></span>
                                        </motion.p>
                                    )
                                })}
                            </div>
                        </motion.div>
                    )
                })}
            </div>
            <motion.div 
                className="w-full h-2/5 rounded-3xl text-4xl outline-none shadow-lg shadow-white border border-white mt-4 p-4"
                initial={{ opacity: 0}}
                animate={{ opacity: 1}}
                exit={{ opacity: 0}}
                transition={{ duration: .5}}
            >
                <div className="flex flex-col font-n27-extralight justify-around text-3xl w-full h-full uppercase">
                    {currentJob && currentJob.Model && currentJob.Model.map((model) => {
                        return (
                            <p className="w-full flex" key={model.User.ID}>
                                <span className="w-1/2 truncate">@{model.User.ContactInfo}</span>
                                <span className="w-1/2 text-right">TYPE_<span className="font-n27-regular">{model.Params.type}</span></span>
                            </p>
                        )
                    })}
                </div>
            </motion.div>
        </div>
    )
}

{/* <div className="flex flex-col font-n27-extralight justify-around text-3xl w-full">
                            <p>@TEST</p>
                            <p>@TEST</p>
                            <p>@TEST</p>
                            <p>@TEST</p>
                        </div> */}

                        