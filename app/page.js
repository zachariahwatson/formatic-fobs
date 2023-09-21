/*TODO
  [x] set up stl export on button press
  [x] implement db
  [x] create one big midi handler js helper file
  [x] create print queue that waits for user input on the 3d printer screen before printing next print job
  [x] buy extra buildplate?
  [x] create print queue component that contains print job components with a preview of the model
  [x] create slicing process that puts multiple models on the same buildplate (use --marge header in prusaslicer cli)
  [ ] 3d print cover for midi controller
  [x] stickers - https://thestickybrand.com/products/try-out-our-vinyl-custom-stickers-for-a-limited-time-get-100-2-5custom-vinyl-die-cut-stickers-for-19-00
  [x] pretty everything up
  [x] create rainbow shader for models
  [x] create white gridline plane
  [ ] create ufo model
  [x] do exhibit simulation test
  [x] calibrate 3d printer
  [x] generate .ini file for prusaslicer cli
  [ ] static cmd info panel
*/
"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { useEffect, useRef, useState } from "react"
// import RandomText from './components/RandomText'

export default function Page() {
	const router = useRouter()
	const inputRef = useRef()
	const searchParams = useSearchParams()
	const [printModel, setPrintModel] = useState(true)
	const [timesUp, setTimesUp] = useState(false)

	const handleKeyDown = (event) => {
		if (event.key === "F1") {
			setPrintModel(true)
		} else if (event.key === "F2") {
			setPrintModel(false)
		}
	}

	const handleTwitterSubmit = async (e) => {
		e.preventDefault()
		const formData = new FormData(e.target)
		const res = await fetch("/api/handletwittersubmit", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				twitterAccount: formData.get("twitterAccount"),
				printModel: printModel,
			}),
		}).catch((err) => {
			console.error(err)
		})
		if (!res.ok) {
			console.error("handle twitter submit error: ", res.status)
		}
		const data = await res.json()
		router.push(data.redirectUrl)
	}

	useEffect(() => {
		async function fetchTimesUp() {
			const res = await fetch("http://localhost:3000/timesup").catch((err) => {
				console.error(err)
			})
			if (!res.ok) {
				console.error("get timesUp error: ", res.status)
			}
			const data = await res.json()
			setTimesUp(data.timesUp)
		}
		fetchTimesUp()

		inputRef.current.focus()

		window.addEventListener("keydown", handleKeyDown)

		return () => {
			window.removeEventListener("keydown", handleKeyDown)
		}
	}, [])

	//component that prompts user for twitter name and then executes handleTwitterSubmit() server action as well as redirects to dynamic model route for the specified user
	return (
		<>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 1 }}
				transition={{ duration: 1 }}
				className="flex justify-center h-full w-full items-center"
			>
				<form onSubmit={handleTwitterSubmit} className="flex flex-col gap-2 w-1/3">
					<label className="mb-2 text-5xl flex justify-center">
						<span className="font-n27-extralight">TWITTER_</span>
						<span className="font-n27-regular">USERNAME:</span>
					</label>
					<input
						type="text"
						name="twitterAccount"
						className={`rounded-2xl p-2 bg-black text-3xl outline-none shadow-lg shadow-white border border-white font-n27-regular lowercase`}
						ref={inputRef}
					/>
					{(timesUp === false && (
						<label className="mt-6 text-3xl text-center">
							<span className="font-n27-extralight">PRINT MODEL?</span>
							<span className="flex justify-evenly">
								<p className={printModel ? "font-n27-regular" : "font-n27-extralight text-neutral-500"}>F1 -&gt; YES</p>
								<p className={printModel ? "font-n27-extralight text-neutral-500" : "font-n27-regular"}>F2 -&gt; NO</p>
							</span>
						</label>
					)) || (
						<label className="mt-6 text-3xl text-center">
							<span className="font-n27-extralight">
								FYI: THE QUEUE IS FULL AND YOUR MODEL WILL NOT BE PRINTED BY THE END OF THIS ACTIVATION (sorry)
							</span>
						</label>
					)}
				</form>
			</motion.div>
		</>
	)
}

// onSubmit={(e) => {
//     //e.preventDefault()
//     //router.push('model/' + (e.target.elements.twitterAccount.value).replace(/^@/, ''))
// }}
