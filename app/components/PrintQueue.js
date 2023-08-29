import { useEffect, useState } from "react"
import { motion } from "framer-motion"
//import { socket } from "../utils/io"
import { io } from "socket.io-client"

export default function PrintQueue() {
    const [printJobs, setPrintJobs] = useState([])
    
    useEffect(() => {
        const socket = io('http://localhost:3000')
        async function fetchData() {
            const res = await fetch('/api/getprintjobs')
            const printJobs = await res.json()
            console.log(printJobs)
            setPrintJobs(printJobs)
        }
        fetchData()

        socket.on('printjobs', (jobs) => {
            setPrintJobs(jobs)
        })

        return () => {
            socket.disconnect()
          }
    }, [])

    return (
        <div className="h-full pt-20 pb-4">
            <motion.div 
                className="w-full h-3/5 flex flex-col-reverse pt-1 justify-start"
                transition={{ staggerChildren: 0.5 }}
            >
                {printJobs.map((job, i) => {
                    return (
                        <motion.div 
                            className="h-1/3 rounded-3xl text-4xl outline-none shadow-lg shadow-white border border-white relative mt-4 flex justify-around p-4"
                            initial={{ opacity: 0, y: -100 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: .5, delay: .5 * i }}
                            key={job.ID}
                        >
                            <div className="flex flex-col font-n27-extralight justify-around text-3xl w-full h-full uppercase">
                                {job.Model.map((model) => {
                                    return (
                                        <p className="w-full flex" key={model.User.ID}>
                                            <span className="w-1/2 truncate">@{model.User.ContactInfo}</span>
                                            <span className="w-1/2 text-right">TYPE_<span className="font-n27-regular">{model.Params.type}</span></span>
                                        </p>
                                    )
                                })}
                            </div>
                        </motion.div>
                    )
                })}
            </motion.div>
            <div className="w-full h-2/5 rounded-3xl text-4xl outline-none shadow-lg shadow-white border border-white mt-4">
            
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

                        