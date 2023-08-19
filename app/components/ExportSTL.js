import { useState, useEffect } from 'react'
import * as THREE from 'three'
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter'
import { SaveToOutputs } from '../utils/actions'
import { useRouter } from 'next/navigation'


export default function ExportSTL({ MIDIdata, mesh }) {
  const router = useRouter()
  const [STLstring, setSTLstring] = useState('')
  const [printPressed, setPrintPressed] = useState(false)

  // listen for the 'print' button being pressed
  useEffect(() => {
    if (MIDIdata.id == 23 && MIDIdata.val == 127 && mesh.current && !printPressed) {

      //clone mesh to do translations because Prusaslicer's orientations are different from THREE.js
      const g = mesh.current.geometry.clone()
      const m = mesh.current.material.clone()
      g.rotateX(Math.PI / 2)

      //create STL text from model
      const newMesh = new THREE.Mesh(g, m)
      const exporter = new STLExporter()
      setSTLstring(exporter.parse(newMesh))

      setPrintPressed(true)
    }
  }, [MIDIdata, mesh, printPressed])

  useEffect(() => {
    if (STLstring) {
      //create STL file in specified location
      SaveToOutputs(STLstring)
      router.push('/')
    }
  }, [STLstring, router])
}