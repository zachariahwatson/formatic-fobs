import React, { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import ExportSTL from '../ExportSTL'


export default function Cube({shapeData, printButtonHit, props}) {
  const mesh = useRef()
  const cube = useRef()

  //useFrame(() => (mesh.current.rotation.x = mesh.current.rotation.y += 0.01))

  useEffect(() => {
    //check to see if theres a geometry set up before modifying
    if (cube.current.geometry) {
        const geometry = new THREE.BoxGeometry(shapeData.w, shapeData.d, shapeData.h)
        cube.current.geometry.dispose()
        cube.current.geometry = geometry
    }
  }, [shapeData])

  return (
    <>
      <mesh {...props} ref={mesh}>
        <boxGeometry ref={cube} args={[shapeData.w, shapeData.d, shapeData.h]}/>
        <meshPhongMaterial color={'white'} />
      </mesh>
      <ExportSTL printButtonHit={printButtonHit} modelParams={shapeData} mesh={mesh}/>
    </>
  )
}