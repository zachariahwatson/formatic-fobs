import { useState, useEffect, useTransition, useRef } from 'react'
import * as THREE from 'three'
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter'
import { saveToOutputs } from '../actions'
import { useRouter } from 'next/navigation'
import { useThree } from '@react-three/fiber'
import { Text3D } from '@react-three/drei'
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js'

export default function ExportSTL({ printButtonHit, modelParams, mesh, params }) {
  const { gl } = useThree()
  const router = useRouter()
  const [STLstring, setSTLstring] = useState('')
  const [isPending, startTransition] = useTransition()
  const textRef = useRef()

  // listen for the 'print' button being pressed
  useEffect(() => {
    if (printButtonHit && mesh.current && textRef.current) {
      //clone meshes to do translations and rotations because Prusaslicer's orientations are different from THREE.js (x,z,y) vs (x,y,z)
      const g = mesh.current.geometry.clone().toNonIndexed()
      //rotate to correct orientation
      g.rotateX(Math.PI / 2)
      //compute bounding box to position text
      g.computeBoundingBox()
      const box = g.boundingBox
      //compute bounding box to center text
      textRef.current.geometry.computeBoundingBox()
      const tBox = textRef.current.geometry.boundingBox
      const matrix = new THREE.Matrix4().makeTranslation(-((Math.abs(tBox.min.x)+Math.abs(tBox.max.x))/2), box.min.y-10, box.min.z)
      const gText = textRef.current.geometry.clone()
      gText.applyMatrix4(matrix)

      const merged = BufferGeometryUtils.mergeGeometries([g, gText])

      //console.log(merged)

      //create STL text from model
      const newMesh = new THREE.Mesh(merged, mesh.current.material)
      const exporter = new STLExporter()
      setSTLstring(exporter.parse(newMesh))
    }
  }, [printButtonHit])

  useEffect(() => {
    if (STLstring) {
      startTransition(() => {
        //create STL file in specified location
        saveToOutputs(STLstring, modelParams)
      })
      gl.dispose()
      router.push('/')
    }
  }, [STLstring])

  return (
    <Text3D ref={textRef} position={[0, 0, 0]} font={'/fonts/Saira_Condensed_Light_Regular.json'} size={5} height={.2} visible={false}>
      @{params.id.toUpperCase()}
    </Text3D>
  )
}



//ADD TEXT ON EXPORT AND UTILIZE MESH BOUNDING BOX TO FIGURE OUT WHERE TO PLACE IT
//WRAP SHAPES IN MOTION DIV FUNCTION AND EXIT TRANSITION WHEN PRINTBUTTONHIT IS TRUE, ADD DELAY HERE