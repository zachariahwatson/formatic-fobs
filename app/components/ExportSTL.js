'use client'

import * as THREE from 'three'
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter'
import { saveAs } from 'file-saver'
import { SaveToOutputs, Slice } from '../utils/actions'

export default function ExportSTL({ MIDIdata, mesh }) {
  console.log(MIDIdata.val)
  if (MIDIdata.id == 23 && MIDIdata.val == 127 && mesh.current) {
    const g = mesh.current.geometry.clone()
    const m = mesh.current.material.clone()
    g.rotateX(Math.PI/2)
    const newMesh = new THREE.Mesh(g, m)
    const exporter = new STLExporter()
    const stlString = exporter.parse(newMesh)
    //console.log(stlString)
    //const blob = new Blob([stlString], { type: 'text/plain' })
    SaveToOutputs(stlString)
    //Slice([])
    // Save the STL file
    //saveAs(blob, 'cube.stl')
  }
}