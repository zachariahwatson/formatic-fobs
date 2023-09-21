import React, { useEffect, useState, useRef } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import Cube from "./models/Cube"
import Cone from "./models/Cone"
import Ufo from "./models/Ufo"
import { DataHandler } from "../utils/DataHandler"
import { motion as motion3d } from "framer-motion-3d"
import { motion, AnimatePresence } from "framer-motion"
export default function ModelScene({ MIDIdata, printModel, params }) {
	const [modelID, setModelID] = useState("0")

	useEffect(() => {
		async function fetchData() {
			const res = await fetch("/api/getmodel").catch((err) => {
				console.error(err)
			})
			//console.log(res)
			const model = await res.json()
			setModelID(model.ID)
		}
		fetchData()
	}, [])

	const lines = [
		`WELCOME, @${params.id.toUpperCase()}`,
		"USE THE KNOBS AND BUTTONS BEFORE YOU TO FORMULATE A FOB.",
		"PRESS THE ‘PRINT’ BUTTON ONCE YOU’RE SATISFIED TO MAKE IT A REALITY.",
		"YOUR BASE MODEL WILL BE PRESENTED SHORTLY.",
	]
	const ufoParams = [
		"COCKPIT_TYPE",
		"COCKPIT_WDTH",
		"COCKPIT_HGHT",
		"HULL_TYPE",
		"HULL_WDTH",
		"HULL_HGHT",
		"MODULE_TYPE",
		"WINDOWS_TYPE",
	]

	// const lineTimes = [
	//   3000,
	//   4000,
	//   5000,
	//   4000
	// ]

	const lineTimes = [0, 0, 0, 0]

	const { printButtonHit, shapeData, MIDIinterface } = DataHandler(MIDIdata)
	const [currentLineIndex, setCurrentLineIndex] = useState(0)
	//console.log(MIDIdata, MIDIinterface)

	useEffect(() => {
		if (currentLineIndex < lines.length) {
			const timeoutId = setTimeout(() => {
				setCurrentLineIndex(currentLineIndex + 1)
			}, lineTimes[currentLineIndex])
			return () => clearTimeout(timeoutId)
		}
	}, [currentLineIndex, lines.length])

	return (
		<>
			<div className="h-full w-full relative">
				<motion.div
					initial={{ opacity: 0 }}
					animate={{
						opacity: [0, 0.2, 0, 0.4, 0, 0.4, 0, 0.8, 0.2, 0.6, 0.6, 0.2, 1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
						transition: { duration: 1, delay: /*18*/ 0 },
					}}
				>
					<p className="absolute px-4 py-2 left-0 top-28 text-3xl">
						<span className="font-n27-extralight">CONTROL_</span>
						<span className="font-n27-regular uppercase">@{params.id}</span>
					</p>
					<p className="absolute px-4 py-2 right-0 top-28 text-3xl">
						<span className="font-n27-extralight">ID_</span>
						<span className="font-n27-regular">{modelID}</span>
					</p>
					<div className="flex justify-between flex-row items-center absolute w-full bottom-0 gap-4 px-4 py-2 text-xl">
						{Object.values(MIDIinterface).map((knob, index) => {
							return (
								<p key={index}>
									<span className="font-n27-extralight">
										{index + 1}_{ufoParams[index]}_
									</span>
									<span className="font-n27-regular">
										{knob.isRandom ? "RND" : ((knob.val / 127) * 100).toFixed(0)}
									</span>
								</p>
							)
						})}
					</div>
				</motion.div>
				<AnimatePresence>
					{currentLineIndex < lines.length && (
						<motion.div
							key={currentLineIndex}
							initial={{ opacity: 0, y: 50 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -50, transition: { duration: 0.5 } }}
							transition={{ duration: 1, delay: 0.5 }}
							className="text-4xl text-center font-n27-regular absolute top-1/2 left-0 w-full"
						>
							{lines[currentLineIndex]}
						</motion.div>
					)}
				</AnimatePresence>
			</div>
			<div className="w-full h-full rounded-3xl absolute top-0 left-0">
				<Canvas orthographic camera={{ zoom: 30, position: [0, 20, 0] }} className="rounded-3xl">
					<ambientLight />
					<directionalLight intensity={5} position={[0, 35, 10]} castShadow color="#fcebc9" />
					<motion3d.group
						animate={{
							y: [5, 2, 0],
							z: [-50, 0, 0],
							rotateX: [Math.PI / 8, -Math.PI / 8, 0],
						}}
						transition={{
							duration: 2,
							delay: /*17*/ 0,
						}}
					>
						{/* {(shapeData.type == 'cube') && <Cube position={[0, 0, 0]} shapeData={shapeData} printButtonHit={printButtonHit} params={params} />}
            {(shapeData.type == 'cone') && <Cone position={[0, 0, 0]} shapeData={shapeData} printButtonHit={printButtonHit} params={params} />} */}
						<Ufo
							position={[0, 0, 0]}
							shapeData={shapeData}
							printButtonHit={printButtonHit}
							MIDIinterface={MIDIinterface}
							params={params}
							printModel={printModel}
							receiveShadow // Enable shadow receiving
							castShadow // Enable shadow casting
						/>
					</motion3d.group>
					<OrbitControls />
				</Canvas>
			</div>
		</>
	)
}

//<Cube position={[0, 0, 0]} MIDIdata={MIDIdata} />

{
	/* <div className="absolute w-screen h-screen left-0 top-0 -z-10"></div> */
}

{
	/* <motion3d.group
            animate={{y: [-50,0]}}
            transition={{
              duration: 1,
              delay: 20
            }}
          >
            <Grid visible infiniteGrid={true} position={[0,-20,0]} sectionColor={'#666666'} fadeDistance={100} fadeStrength={3}/>
          </motion3d.group> */
}

{
	/* <div className="flex justify-center items-center h-full w-full absolute top-0 left-0 z-10">
        <motion.svg 
          className="h-full w-full"
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0,.2,0,.4,0,.4,0,.8,.2,.6,.6,.2,1,.2,.3,.4,.5,.6,.7,.8,.9,1],
            transition: { duration: 1, delay: 18 }
          }}
        >
          <circle cx="50%" cy="50%" r="25%" stroke="#fff" strokeWidth="1" fill="none" opacity=".2"/>
          <line x1="25%" y1="50%" x2="32.5%" y2="50%" stroke="#fff" strokeWidth="1" opacity=".2"/>
          <line x1="67.5%" y1="50%" x2="75%" y2="50%" stroke="#fff" strokeWidth="1" opacity=".2"/>
        </motion.svg>
      </div> */
}
