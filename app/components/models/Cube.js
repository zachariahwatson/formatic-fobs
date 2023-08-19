import React, { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import ExportSTL from '../ExportSTL'


export default function Cube({MIDIdata, props}) {
  const mesh = useRef()
  const cube = useRef()
  const [cubeData, setcubeData] = useState({w: 0, h: 0, d: 0})

  //handle MIDIdata, assign knobs to different parameters
  useEffect(() => {
    if (MIDIdata.id == 0) {
        if (MIDIdata.val > 0) {
            setcubeData((prev) => ({ ...prev, w: MIDIdata.val/32 }))
        }
    } else if (MIDIdata.id == 1) {
        if (MIDIdata.val > 0) {
            setcubeData((prev) => ({ ...prev, h: MIDIdata.val/32 }))
        }
    } else if (MIDIdata.id == 2) {
        if (MIDIdata.val > 0) {
            setcubeData((prev) => ({ ...prev, d: MIDIdata.val/32 }))
        }
    }
  }, [MIDIdata])

  //useFrame(() => (mesh.current.rotation.x = mesh.current.rotation.y += 0.01))

  useEffect(() => {
    //check to see if theres a geometry set up before modifying
    if (cube.current.geometry) {
        const geometry = new THREE.BoxGeometry(1 + cubeData.w, 1 + cubeData.d, 1 + cubeData.h)
        cube.current.geometry.dispose()
        cube.current.geometry = geometry
    }
  }, [cubeData.w, cubeData.h, cubeData.d])

  return (
    <>
      <mesh {...props} ref={mesh}>
        <boxGeometry ref={cube} args={[1 + cubeData.w, 1 + cubeData.d, 1 + cubeData.h]}/>
        <meshStandardMaterial color={'white'} />
      </mesh>
      <ExportSTL MIDIdata={MIDIdata} geometry={cube} mesh={mesh}/>
    </>
  )
}