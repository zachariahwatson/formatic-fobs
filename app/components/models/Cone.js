import React, { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import ExportSTL from '../ExportSTL'


export default function Cone({shapeData, printButtonHit, props}) {
  const mesh = useRef()
  const cone = useRef()

  //useFrame(() => (mesh.current.rotation.x = mesh.current.rotation.y += 0.01))

  useEffect(() => {
    //check to see if theres a geometry set up before modifying
    if (cone.current.geometry) {
        const geometry = new THREE.ConeGeometry(shapeData.r, shapeData.h, shapeData.segments)
        cone.current.geometry.dispose()
        cone.current.geometry = geometry
    }
  }, [shapeData])

  return (
    <>
      <mesh {...props} ref={mesh}>
        <coneGeometry ref={cone} args={[shapeData.r, shapeData.h, shapeData.segments]}/>
        <meshStandardMaterial color={'white'} />
      </mesh>
      <ExportSTL printButtonHit={printButtonHit} modelParams={shapeData} mesh={mesh}/>
    </>
  )
}