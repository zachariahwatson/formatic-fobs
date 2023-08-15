import React from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import Cube from './models/Cube'

export default function ModelScene({MIDIdata}) {
  return (
    <div className="absolute w-screen h-screen left-0 top-0">
      <Canvas
        orthographic
        camera={{ zoom: 150, position: [-20, 20, 20] }}
      >
        <ambientLight />
        <directionalLight intensity={3} position={[40, 30, 20]} />
        <Cube position={[0, 0, 0]} MIDIdata={MIDIdata} />
        <OrbitControls />
      </Canvas>
    </div>
  )
}

