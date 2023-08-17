import React, { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import ExportSTL from '@/app/components/ExportSTL'


export default function Cube({MIDIdata, props}) {
  const mesh = useRef()
  const cube = useRef()
  const [cubeData, setcubeData] = useState({w: 0, h: 0, d: 0})

  //handle MIDIdata (put this in MIDIhandler util, return data and then do useState setter)
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
    //check to see if theres a geometry set up
    if (cube.current.geometry) {
        const geometry = new THREE.BoxGeometry(1 + cubeData.w, 1 + cubeData.d, 1 + cubeData.h)
        cube.current.geometry.dispose()
        cube.current.geometry = geometry
    }
  }, [1 + cubeData.w, 1 + cubeData.h, 1 + cubeData.d])

  return (
    <>
      <mesh {...props} ref={mesh}>
        {console.log('rendering1')}
        <boxGeometry ref={cube} args={[1 + cubeData.w, 1 + cubeData.d, 1 + cubeData.h]}/>
        <meshStandardMaterial color={'white'} />
      </mesh>
      <ExportSTL MIDIdata={MIDIdata} geometry={cube} mesh={mesh}/>
    </>
  )
}