import React, { useRef, useEffect, useState } from "react"
import * as THREE from "three"
import ExportSTL from "../ExportSTL"
import map from "./../../utils/map"

export default function Ufo({
	printButtonHit,
	MIDIinterface,
	printModel,
	params,
}) {
	const mesh = useRef()
	const cube = useRef()
	const materialRef = useRef(new THREE.MeshPhongMaterial({ color: 0xffffff }))

	const boxInterface = {
		w: {
			min: 2,
			max: 20,
			get val() {
				return map(MIDIinterface[0].val, 0, 127, this.min, this.max)
			},
		},
		d: {
			min: 2,
			max: 20,
			get val() {
				return map(MIDIinterface[1].val, 0, 127, this.min, this.max)
			},
		},
		h: {
			min: 2,
			max: 20,
			get val() {
				return map(MIDIinterface[2].val, 0, 127, this.min, this.max)
			},
		},
	}

	// Extract .val properties from boxInterface and set modelParams
	const modelParams = Object.fromEntries(
		Object.entries(boxInterface).map(([key, value]) => [key, value.val])
	)

	const colors = [
		new THREE.Color("rgb(255, 190, 11)"),
		new THREE.Color("rgb(251, 86, 7)"),
		new THREE.Color("rgb(255, 0, 110)"),
		new THREE.Color("rgb(131, 56, 236)"),
		new THREE.Color("rgb(58, 134, 255)"),
	]

	const transitionDuration = 10000 // Duration of color transition in milliseconds
	const colorCount = colors.length

	useEffect(() => {
		let startTime = Date.now()
		let colorIndex = 0

		const updateEmissiveColor = () => {
			const now = Date.now()
			const elapsed = now - startTime

			if (elapsed >= transitionDuration) {
				startTime = now
				colorIndex = (colorIndex + 1) % colorCount
			}

			const t = elapsed / transitionDuration
			const colorA = colors[colorIndex]
			const colorB = colors[(colorIndex + 1) % colorCount]
			const interpolatedColor = new THREE.Color().lerpColors(colorA, colorB, t)

			// Update the material emissive color
			materialRef.current.emissive = interpolatedColor

			requestAnimationFrame(updateEmissiveColor)
		}

		updateEmissiveColor()
	}, [])

	return (
		<>
			<mesh ref={mesh}>
				<boxGeometry
					ref={cube}
					args={[boxInterface.w.val, boxInterface.d.val, boxInterface.h.val]}
				/>
				<primitive object={materialRef.current} attach="material" />
			</mesh>
			<ExportSTL
				printButtonHit={printButtonHit}
				modelParams={modelParams}
				mesh={mesh}
				printModel={printModel}
				params={params}
			/>
		</>
	)
}
