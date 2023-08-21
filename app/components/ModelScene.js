import React, {useEffect, useState} from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import Cube from './models/Cube'
import Cone from './models/Cone'
import { dataHandler } from '../utils/dataHandler'

export default function ModelScene({MIDIdata}) {

  /////////////////////////////////////////////////////////////////////////////////
  //handle ALL midi data and shape parameters in a separate file, put function in here
  const {printButtonHit, shapeData} = dataHandler(MIDIdata)
  
  return (
    <div className="absolute w-screen h-screen left-0 top-0">
      <Canvas
        orthographic
        camera={{zoom: 37.5, position: [-20, 20, 20] }}
      >
        <ambientLight />
        <directionalLight intensity={3} position={[40, 30, 20]} />
          {(shapeData.type == 'cube') && <Cube position={[0, 0, 0]} shapeData={shapeData} printButtonHit={printButtonHit}/>}
          {(shapeData.type == 'cone') && <Cone position={[0, 0, 0]} shapeData={shapeData} printButtonHit={printButtonHit}/>}
        <OrbitControls />
      </Canvas>
    </div>
  )
}

//<Cube position={[0, 0, 0]} MIDIdata={MIDIdata} />

