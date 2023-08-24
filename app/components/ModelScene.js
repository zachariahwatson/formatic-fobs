import React, {useEffect, useState} from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text3D, Center } from '@react-three/drei'
import Cube from './models/Cube'
import Cone from './models/Cone'
import { dataHandler } from '../utils/dataHandler'
import { motion as motion3d } from 'framer-motion-3d'
import { motion, AnimatePresence } from 'framer-motion'



export default function ModelScene({MIDIdata, params}) {
  const [modelID, setModelID] = useState('0')

  console.log(typeof modelID)

  useEffect(() => {
    async function fetchData() {
      const res = await fetch('./../../api')
      const model = await res.json()
      setModelID(model.ID)
    }
    fetchData()
  }, [])

  const lines = [
    `WELCOME, @${params.id.toUpperCase()}`,
    'USE THE KNOBS AND BUTTONS BEFORE YOU TO FORMULATE A FOB.',
    "PRESS THE ‘PRINT’ BUTTON ONCE YOU’RE SATISFIED TO MAKE IT A REALITY.",
    'YOUR BASE MODEL WILL BE PRESENTED SHORTLY.',
  ]
  
  const lineTimes = [
    3000,
    4000,
    5000,
    4000
  ]

  const {printButtonHit, shapeData} = dataHandler(MIDIdata)
  const [currentLineIndex, setCurrentLineIndex] = useState(0)

  useEffect(() => {
    if (currentLineIndex < lines.length) {
      const timeoutId = setTimeout(() => {
        setCurrentLineIndex(currentLineIndex + 1)
      }, lineTimes[currentLineIndex])
      return () => clearTimeout(timeoutId)
    }
  }, [currentLineIndex])
  
  return (
    <>
      <div className="h-full w-full relative">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0,.2,0,.4,0,.4,0,.8,.2,.6,.6,.2,1,.2,.3,.4,.5,.6,.7,.8,.9,1],
            transition: { duration: 1, delay: 18 }
          }}
        >
          <p className="absolute px-4 py-2 left-0 top-28 text-3xl"><span className="font-n27-extralight">CONTROL_</span><span className="font-n27-regular uppercase">@{params.id}</span></p>
          <p className="absolute px-4 py-2 right-0 top-28 text-3xl"><span className="font-n27-extralight">ID_</span><span className="font-n27-regular">{modelID}</span></p>
          <div className="flex justify-between flex-row items-center absolute w-full bottom-0 gap-4 px-4 py-2">
            <p className="text-3xl"><span className="font-n27-extralight">TYPE_</span><span className="font-n27-regular uppercase">{shapeData.type}</span></p>
            <p className="text-3xl"><span className="font-n27-extralight">PARAM1_</span><span className="font-n27-regular">{Object.values(shapeData)[1].toFixed(3)}</span></p>
            <p className="text-3xl"><span className="font-n27-extralight">PARAM2_</span><span className="font-n27-regular">{Object.values(shapeData)[2].toFixed(3)}</span></p>
            <p className="text-3xl"><span className="font-n27-extralight">PARAM3_</span><span className="font-n27-regular">{Object.values(shapeData)[3].toFixed(3)}</span></p>
          </div>
        </motion.div>
        <AnimatePresence>
          {currentLineIndex < lines.length && (
            <motion.div
              key={currentLineIndex}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.5 } }}
              transition={{ duration: 1, delay: 0.5 }}
              className="text-4xl text-center font-n27-regular absolute top-1/2 left-0 w-full"
            >
              {lines[currentLineIndex]}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="w-full h-full rounded-3xl absolute top-0 left-0">
        <Canvas
          orthographic
          camera={{zoom: 37.5, position: [-20, 20, 20] }}
          className="rounded-3xl"
        >
          <Center position={[0, 0, 10]}>
            <Text3D font="/fonts/Inter_Thin_Regular.json" rotation={[-Math.PI/2,0,0]} height={.2}>
              {params.id}
            </Text3D>
          </Center>
          <ambientLight />
          <directionalLight intensity={3} position={[40, 30, 20]} />
          <motion3d.group
            animate={{y: [5,2,0], z: [-50,0,0], rotateX: [Math.PI/8, -Math.PI/8, 0]}}
            transition={{
              duration: 2,
              delay: 17
            }}
          >
            {(shapeData.type == 'cube') && <Cube position={[0, 0, 0]} shapeData={shapeData} printButtonHit={printButtonHit}/>}
            {(shapeData.type == 'cone') && <Cone position={[0, 0, 0]} shapeData={shapeData} printButtonHit={printButtonHit}/>}
          </motion3d.group>
          <OrbitControls />
        </Canvas>
      </div>
    </>
  )
}

//<Cube position={[0, 0, 0]} MIDIdata={MIDIdata} />

{/* <div className="absolute w-screen h-screen left-0 top-0 -z-10"></div> */}

{/* <motion3d.group
            animate={{y: [-50,0]}}
            transition={{
              duration: 1,
              delay: 20
            }}
          >
            <Grid visible infiniteGrid={true} position={[0,-20,0]} sectionColor={'#666666'} fadeDistance={100} fadeStrength={3}/>
          </motion3d.group> */}

{/* <div className="flex justify-center items-center h-full w-full absolute top-0 left-0 z-10">
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
      </div> */}

