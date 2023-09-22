"use client"

import { useEffect, useState } from "react"
import ModelScene from "./../../components/ModelScene"
import { motion } from "framer-motion"
import { useSearchParams } from "next/navigation"
// import RandomText from '@/app/components/RandomText';

export default function Page({ params }) {
	const [MIDIdata, setMidiData] = useState([0, 0])
	const searchParams = useSearchParams()
	const printModel = searchParams.get("printModel")

	useEffect(() => {
		let midiInput = null

		//set up MIDI functionality
		navigator
			.requestMIDIAccess()
			.then((midiAccess) => {
				console.log(midiAccess)
				console.log("navitagor: MIDI access request succeeded")
				midiInput = midiAccess.inputs.values().next().value
				midiInput.onmidimessage = handleMIDIMessage
				//handle MIDI messages and process data before emitting
				function handleMIDIMessage(message) {
					//process the MIDI message and convert it to a suitable format
					const rawMIDIdata = message.data
					processMIDIdata(rawMIDIdata)
				}
				//process MIDI data
				function processMIDIdata(rawMIDIdata) {
					const id = rawMIDIdata[1]
					const val = rawMIDIdata[2]
					const processedData = { id: id, val: val }
					setMidiData(processedData)
				}
			})
			.catch((err) => {
				console.error("MIDI access request failed: " + err)
			})
	}, [])

	console.log(MIDIdata)

	return (
		<>
			<ModelScene MIDIdata={MIDIdata} params={params} printModel={printModel} />
		</>
	)
}

/* <motion.div
      initial={{ opacity: 0}}
      animate={{ opacity: 1}}
      transition={{ duration: 1, delay: 2 }}>
        <h1 className="font-black text-8xl p-5">{params.id}</h1>
      </motion.div> */

//   <div>
//   <p className="absolute px-6 py-4 left-0 top-28"><span className="font-n27-extralight">CONTROL_</span><span className="font-n27-regular">USERNAME:</span></p>
// </div>
