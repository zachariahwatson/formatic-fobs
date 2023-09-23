"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { socket } from "../utils/io"
import { motion } from "framer-motion"

export default function Page() {
	const router = useRouter()

	useEffect(() => {
		async function fetchTimesUp() {
			const res = await fetch("http://localhost:3000/timesup").catch((err) => {
				console.error(err)
			})
			if (!res.ok) {
				console.error("get timesUp error: ", res.status)
			}
			const data = await res.json()
			if (data.timesUp === false) {
				socket.emit("timesup")

				const timer = setTimeout(() => {
					router.push("/")
				}, 7500)

				return () => clearTimeout(timer)
			} else {
				router.push("/")
			}
		}
		fetchTimesUp()
	}, [])

	return (
		<motion.div
			className="flex justify-center items-center w-full h-full"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 1 }}
			transition={{ duration: 1 }}
		>
			<h1 className="mx-4 mt-36 font-n27-regular w-3/5 text-center">
				UNFORTUNATELY, PRINTING THIS MODEL WOULD EXCEED THE TIME AVAILABLE FOR THIS ACTIVATION. (sorry)
			</h1>
		</motion.div>
	)
}
