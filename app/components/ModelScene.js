import React, {useEffect, useState} from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import Cube from './models/Cube'
import Cone from './models/Cone'
import { dataHandler } from '../utils/dataHandler'
import { motion as motion3d } from 'framer-motion-3d'

export default function ModelScene({MIDIdata}) {

  const {printButtonHit, shapeData} = dataHandler(MIDIdata)
  
  return (
    <div className="w-full h-full">
      <Canvas
        orthographic
        camera={{zoom: 37.5, position: [-20, 20, 20] }}
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
  )
}

//<Cube position={[0, 0, 0]} MIDIdata={MIDIdata} />

{/* <div className="absolute w-screen h-screen left-0 top-0 -z-10"></div> */}

