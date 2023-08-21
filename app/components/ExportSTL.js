import { useState, useEffect, useTransition } from 'react'
import * as THREE from 'three'
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter'
import { saveToOutputs } from '../actions'
import { useRouter } from 'next/navigation'


export default function ExportSTL({ printButtonHit, modelParams, mesh }) {
  const router = useRouter()
  const [STLstring, setSTLstring] = useState('')
  
  const [isPending, startTransition] = useTransition()

  // listen for the 'print' button being pressed
  useEffect(() => {
    if (printButtonHit && mesh.current) {

      //clone mesh to do translations because Prusaslicer's orientations are different from THREE.js
      const g = mesh.current.geometry.clone()
      const m = mesh.current.material.clone()
      g.rotateX(Math.PI / 2)

      //create STL text from model
      const newMesh = new THREE.Mesh(g, m)
      const exporter = new STLExporter()
      setSTLstring(exporter.parse(newMesh))
    }
  }, [printButtonHit])

  useEffect(() => {
    if (STLstring) {
      startTransition(() => {
        //create STL file in specified location
        saveToOutputs(STLstring, modelParams)
        router.push('/')
      })
    }
  }, [STLstring])
}