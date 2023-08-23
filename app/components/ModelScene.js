import React, {useEffect, useState} from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import Cube from './models/Cube'
import Cone from './models/Cone'
import { dataHandler } from '../utils/dataHandler'
import { motion as motion3d } from 'framer-motion-3d'
import { motion } from 'framer-motion'

export default function ModelScene({MIDIdata}) {

  const {printButtonHit, shapeData} = dataHandler(MIDIdata)
  
  return (
    <>
      <div className="flex justify-center items-center h-full w-full absolute top-0 left-0 z-10">
        <motion.svg 
          className="h-full w-full"
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0,.2,0,.4,0,.4,0,.8,.2,.6,.6,.2,1,.2,.3,.4,.5,.6,.7,.8,.9,1],
            transition: { duration: 1, delay: 2 }
          }}
        >
          <circle cx="50%" cy="50%" r="25%" stroke="#fff" strokeWidth="1" fill="none" opacity=".2"/>
          <line x1="25%" y1="50%" x2="32.5%" y2="50%" stroke="#fff" strokeWidth="1" opacity=".2"/>
          <line x1="67.5%" y1="50%" x2="75%" y2="50%" stroke="#fff" strokeWidth="1" opacity=".2"/>
        </motion.svg>
      </div>
      <div className="w-full h-full rounded-3xl">
        <Canvas
          orthographic
          camera={{zoom: 37.5, position: [-20, 20, 20] }}
          className="rounded-3xl"
        >
          <ambientLight />
          <directionalLight intensity={3} position={[40, 30, 20]} />
          <motion3d.group
            animate={{y: [5,2,0], z: [-50,0,0], rotateX: [Math.PI/8, -Math.PI/8, 0]}}
            transition={{
              duration: 2
            }}
          >
            {(shapeData.type == 'cube') && <Cube position={[0, 0, 0]} shapeData={shapeData} printButtonHit={printButtonHit}/>}
            {(shapeData.type == 'cone') && <Cone position={[0, 0, 0]} shapeData={shapeData} printButtonHit={printButtonHit}/>}
          </motion3d.group>
          <motion3d.group
            animate={{y: [-50,0]}}
            transition={{
              duration: 1,
            }}
          >
            <Grid visible infiniteGrid={true} position={[0,-20,0]} sectionColor={'#666666'} fadeDistance={100} fadeStrength={3}/>
          </motion3d.group>
          <OrbitControls />
        </Canvas>
      </div>
    </>
  )
}

//<Cube position={[0, 0, 0]} MIDIdata={MIDIdata} />

{/* <div className="absolute w-screen h-screen left-0 top-0 -z-10"></div> */}

