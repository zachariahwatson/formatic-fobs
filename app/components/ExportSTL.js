'use client'

import { useState } from 'react'
import * as THREE from 'three'
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter'
import { saveAs } from 'file-saver'
import { SaveToOutputs, Slice } from '../utils/actions'
import TwitterPrompt from './TwitterPrompt'


export default function ExportSTL({ MIDIdata, mesh }) {
  console.log('rendering2')
  const [STLstring, setSTLstring] = useState('')
  //console.log(MIDIdata.val)
  if (MIDIdata.id == 23 && MIDIdata.val == 127 && mesh.current) {
    const g = mesh.current.geometry.clone()
    const m = mesh.current.material.clone()
    g.rotateX(Math.PI/2)
    const newMesh = new THREE.Mesh(g, m)
    const exporter = new STLExporter()
    setSTLstring(exporter.parse(newMesh))
    //console.log(STLstring)
    //const blob = new Blob([STLstring], { type: 'text/plain' })
    SaveToOutputs(cookies.get('twitterAccount'), STLstring)
    //Slice([])
    // Save the STL file
    //saveAs(blob, 'cube.stl')
  }
}


////////////////////////////its because TwitterPrompt is inside a R3F Canvas element