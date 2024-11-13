import React, { useRef, useEffect, useState } from "react"
import * as THREE from "three"
import ExportSTL from "../ExportSTL"
import map from "./../../utils/map"
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js"

export default function Ufo({ printButtonHit, MIDIinterface, printModel, params }) {
	const mesh = useRef()

	const ufoInterface = {
		cockpit: {
			get type() {
				switch (Math.floor(map(MIDIinterface[0].val, 0, 127, 0, 4))) {
					case 0:
						return "ROUND"
					case 1:
						return "ROUND_RECT"
					case 2:
						return "BELL"
					case 3:
						return "POD"
					default:
						return "ROUND"
				}
			},
			get w() {
				return map(MIDIinterface[1].val, 0, 127, 10, 40)
			},
			get h() {
				return map(MIDIinterface[2].val, 0, 127, 5, 10)
			},
		},
		hull: {
			get type() {
				switch (Math.floor(map(MIDIinterface[3].val, 0, 127, 0, 4))) {
					case 0:
						return "UK_1981"
					case 1:
						return "USA_1950"
					case 2:
						return "UK_1978"
					case 3:
						return "USA_1947"
					default:
						return "UK_1981"
				}
			},
			get w() {
				return map(MIDIinterface[4].val, 0, 127, 25, 35)
			},
			get h() {
				return map(MIDIinterface[5].val, 0, 127, 10, 15)
			},
		},
		tech: {
			get type() {
				switch (Math.floor(map(MIDIinterface[6].val, 0, 127, 0, 6))) {
					case 0:
						return "COMPARTMENT"
					case 1:
						return "TRI_PROBE"
					case 2:
						return "SINGLE_PROBE"
					case 3:
						return "LANDING_LEGS"
					case 4:
						return "LANDING_PEGS"
					case 5:
						return "NONE"
					default:
						return "COMPARTMENT"
				}
			},
		},
		windows: {
			get type() {
				switch (Math.floor(map(MIDIinterface[7].val, 0, 127, 0, 3))) {
					case 0:
						return "CIRCLES"
					case 1:
						return "RECTANGLES"
					case 2:
						return "THREE_CIRCLES"
					default:
						return "CIRCLES"
				}
			},
		},
	}

	const ufoParts = {
		cockpit: {
			round(maxHullTopWidth) {
				const roundShape = new THREE.Shape()
				const w = Math.min(maxHullTopWidth, ufoInterface.cockpit.w)
				const r = w / 2
				const hullTop = Number(ufoInterface.hull.h) / 2 - 3
				const h = hullTop + Math.max(Number(ufoInterface.cockpit.h) - r, 0) + 2

				roundShape.moveTo(-r + 2, h)
				roundShape.lineTo(-r + 2, hullTop)
				roundShape.lineTo(-r, hullTop)
				roundShape.lineTo(-r, h)

				for (let a = Math.PI; a >= 0; a -= Math.PI / 24) {
					roundShape.lineTo(Math.cos(a) * r, h + Math.sin(a) * r)
				}
				roundShape.lineTo(r, hullTop)
				roundShape.lineTo(r - 2, hullTop)
				roundShape.lineTo(r - 2, h)
				for (let a = 0; a <= Math.PI; a += Math.PI / 24) {
					roundShape.lineTo(Math.cos(a) * (r - 2), h + Math.sin(a) * (r - 2))
				}
				// roundShape.lineTo(-r + 2, hullTop)

				roundShape.closePath()

				const geometry = new THREE.ExtrudeGeometry(roundShape, {
					depth: 2,
					bevelEnabled: false,
				})

				return geometry
			},
			roundRect(maxHullTopWidth) {
				const roundRectShape = new THREE.Shape()
				const w = Math.min(maxHullTopWidth, ufoInterface.cockpit.w)
				const hullTop = Number(ufoInterface.hull.h) / 2 - 3
				const h = hullTop + Number(ufoInterface.cockpit.h) + 2

				roundRectShape.moveTo(-w / 2, hullTop)
				roundRectShape.lineTo(-w / 2, h)
				roundRectShape.bezierCurveTo(-w / 4, h + 1, w / 4, h + 1, w / 2, h)
				roundRectShape.lineTo(w / 2, hullTop)
				roundRectShape.lineTo(w / 2 - 2, hullTop)
				roundRectShape.lineTo(w / 2 - 2, h - 2)
				roundRectShape.bezierCurveTo(w / 4, h, -w / 4, h, -w / 2 + 2, h - 2)
				roundRectShape.lineTo(-w / 2 + 2, hullTop)

				roundRectShape.closePath()

				const geometry = new THREE.ExtrudeGeometry(roundRectShape, {
					depth: 2,
					bevelEnabled: false,
				})

				return geometry
			},
			squishedRound(maxHullTopWidth) {
				const roundShape = new THREE.Shape()
				const w = Math.min(maxHullTopWidth, ufoInterface.cockpit.w)
				const r = w / 2
				const hullTop = Number(ufoInterface.hull.h) / 2 - 3
				const h = hullTop + Math.max(Number(ufoInterface.cockpit.h) - r, 0) + 2

				roundShape.moveTo(-r + 2, h)
				roundShape.lineTo(-r + 2, hullTop)
				roundShape.lineTo(-r, hullTop)
				roundShape.lineTo(-r, h)

				for (let a = Math.PI; a >= 0; a -= Math.PI / 24) {
					roundShape.lineTo(Math.cos(a) * r, h + (Math.sin(a) * r) / 1.5)
				}
				roundShape.lineTo(r, hullTop)
				roundShape.lineTo(r - 2, hullTop)
				roundShape.lineTo(r - 2, h)
				for (let a = 0; a <= Math.PI; a += Math.PI / 24) {
					roundShape.lineTo(Math.cos(a) * (r - 2), h + (Math.sin(a) * (r - 2)) / 1.5)
				}
				// roundShape.lineTo(-r + 2, hullTop)

				roundShape.closePath()

				const geometry = new THREE.ExtrudeGeometry(roundShape, {
					depth: 2,
					bevelEnabled: false,
				})

				return geometry
			},
			trapezoid(maxHullTopWidth) {
				const trapezoidShape = new THREE.Shape()
				const w = Math.min(maxHullTopWidth, ufoInterface.cockpit.w)
				const hullTop = Number(ufoInterface.hull.h) / 2 - 3
				const h = hullTop + Number(ufoInterface.cockpit.h) + 1
				const r = 1

				trapezoidShape.moveTo(-w / 2, hullTop)
				trapezoidShape.lineTo(-w / 2.5, h)
				for (let a = Math.PI * 2; a >= Math.PI; a -= Math.PI / 24) {
					trapezoidShape.lineTo(Math.cos(a) * (r - 2), h + Math.sin(a) * (r - 2))
				}
				trapezoidShape.lineTo(w / 2.5, h)
				trapezoidShape.lineTo(w / 2, hullTop)
				trapezoidShape.lineTo(w / 2 - 2, hullTop)
				trapezoidShape.lineTo(w / 2.5 - 2, h - 2)
				trapezoidShape.lineTo(-w / 2.5 + 2, h - 2)
				trapezoidShape.lineTo(-w / 2 + 2, hullTop)
				// trapezoidShape.lineTo(w / 2 - 2, h - 2)
				// trapezoidShape.lineTo(-w / 2 + 2, hullTop)

				trapezoidShape.closePath()

				const geometry = new THREE.ExtrudeGeometry(trapezoidShape, {
					depth: 2,
					bevelEnabled: false,
				})

				return geometry
			},
		},

		hull: {
			almond() {
				const almondShape = new THREE.Shape()
				const w = ufoInterface.hull.w
				const h = ufoInterface.hull.h

				const maxHullTopWidth = w / 2
				const maxHullMiddleWidth = w / 3
				const maxHullBottomWidth = w / 2

				almondShape.moveTo(-w / 2, 0)
				almondShape.bezierCurveTo(-w / 2, 0, -w / 3, h / 2, 0, h / 2)
				almondShape.bezierCurveTo(w / 3, h / 2, w / 2, 0, w / 2, 0)
				almondShape.bezierCurveTo(w / 2, 0, w / 3, -h / 2, 0, -h / 2)
				almondShape.bezierCurveTo(-w / 3, -h / 2, -w / 2, 0, -w / 2, 0)
				almondShape.closePath()

				return {
					shape: almondShape,
					maxHullTopWidth: maxHullTopWidth,
					maxHullMiddleWidth: maxHullMiddleWidth,
					maxHullBottomWidth: maxHullBottomWidth,
				}
			},
			bell() {
				const bellShape = new THREE.Shape()
				const w = ufoInterface.hull.w
				const h = ufoInterface.hull.h

				const maxHullTopWidth = w / 2.25
				const maxHullMiddleWidth = w / 4
				const maxHullBottomWidth = w / 1.5

				bellShape.moveTo(-w / 2, -h / 2)
				bellShape.bezierCurveTo(-w / 3, -h / 4, -w / 2.5, h / 2, 0, h / 2)
				bellShape.bezierCurveTo(w / 2.5, h / 2, w / 3, -h / 4, w / 2, -h / 2)
				bellShape.closePath()

				return {
					shape: bellShape,
					maxHullTopWidth: maxHullTopWidth,
					maxHullMiddleWidth: maxHullMiddleWidth,
					maxHullBottomWidth: maxHullBottomWidth,
				}
			},
			stump() {
				const stumpShape = new THREE.Shape()
				const w = ufoInterface.hull.w
				const h = ufoInterface.hull.h

				const maxHullTopWidth = w / 1.98
				const maxHullMiddleWidth = w / 5.75
				const maxHullBottomWidth = w / 1.5

				stumpShape.moveTo(-w / 2, -h / 2)
				stumpShape.lineTo(-w / 2, -h / 2 + 1)
				stumpShape.bezierCurveTo(-w / 4, -h / 3, -w / 4, 0, -w / 4, h / 2)
				stumpShape.lineTo(w / 4, h / 2)
				stumpShape.bezierCurveTo(w / 4, 0, w / 4, -h / 3, w / 2, -h / 2 + 1)
				stumpShape.lineTo(w / 2, -h / 2)
				stumpShape.closePath()

				return {
					shape: stumpShape,
					maxHullTopWidth: maxHullTopWidth,
					maxHullMiddleWidth: maxHullMiddleWidth,
					maxHullBottomWidth: maxHullBottomWidth,
				}
			},
			cap() {
				const capShape = new THREE.Shape()
				const w = ufoInterface.hull.w
				const h = ufoInterface.hull.h

				const maxHullTopWidth = w / 1.98
				const maxHullMiddleWidth = w / 3.75
				const maxHullBottomWidth = w / 1.5

				capShape.moveTo(-w / 2, -h / 2)
				capShape.lineTo(-w / 2, -h / 2 + 1)
				capShape.lineTo(-w / 2 + 1, -h / 2 + 1)
				capShape.bezierCurveTo(-w / 2 + 1, h / 4, -w / 4, h / 2 - 1, -w / 4, h / 2 - 1)
				capShape.lineTo(-w / 4, h / 2)
				capShape.lineTo(w / 4, h / 2)
				capShape.lineTo(w / 4, h / 2 - 1)
				capShape.bezierCurveTo(w / 4, h / 2 - 1, w / 2 - 1, h / 4, w / 2 - 1, -h / 2 + 1)
				capShape.lineTo(w / 2, -h / 2 + 1)
				capShape.lineTo(w / 2, -h / 2)
				capShape.closePath()

				return {
					shape: capShape,
					maxHullTopWidth: maxHullTopWidth,
					maxHullMiddleWidth: maxHullMiddleWidth,
					maxHullBottomWidth: maxHullBottomWidth,
				}
			},
		},
		tech: {
			round() {
				const roundShape = new THREE.Shape()
				const w = 5
				const r = w / 2
				const hullBottom = -Number(ufoInterface.hull.h) / 2 + 1
				const h = hullBottom

				roundShape.moveTo(-r, h)
				for (let a = Math.PI * 2; a >= Math.PI; a -= Math.PI / 24) {
					roundShape.lineTo(Math.cos(a) * r, h + Math.sin(a) * r)
				}

				roundShape.closePath()

				const geometry = new THREE.ExtrudeGeometry(roundShape, {
					depth: 2,
					bevelEnabled: false,
				})

				return geometry
			},
			trapezoid(maxHullBottomWidth) {
				const trapezoidShape = new THREE.Shape()
				const w = maxHullBottomWidth
				const hullBottom = -Number(ufoInterface.hull.h) / 2 + 1.66
				const h = hullBottom - 3

				trapezoidShape.moveTo(-w / 2, hullBottom)
				trapezoidShape.lineTo(-w / 2.5, h)
				trapezoidShape.lineTo(w / 2.5, h)
				trapezoidShape.lineTo(w / 2, hullBottom)

				trapezoidShape.closePath()

				const geometry = new THREE.ExtrudeGeometry(trapezoidShape, {
					depth: 2,
					bevelEnabled: false,
				})

				return geometry
			},
			threeRound(maxHullBottomWidth) {
				const roundShape = new THREE.Shape()
				const w = maxHullBottomWidth
				const r = w / 8
				const hullBottom = -Number(ufoInterface.hull.h) / 2 + 1
				const h = hullBottom
				roundShape.moveTo(w / 2, h)
				for (let a = Math.PI * 2; a >= Math.PI; a -= Math.PI / 24) {
					roundShape.lineTo(w / 2 + Math.cos(a) * r, h + Math.sin(a) * r - 1)
				}
				for (let a = Math.PI * 2; a >= Math.PI; a -= Math.PI / 24) {
					roundShape.lineTo(Math.cos(a) * r, h + Math.sin(a) * r - 1)
				}
				for (let a = Math.PI * 2; a >= Math.PI; a -= Math.PI / 24) {
					roundShape.lineTo(-w / 2 + Math.cos(a) * r, h + Math.sin(a) * r - 1)
				}

				// roundShape.moveTo(r, h)
				// for (let a = Math.PI * 2; a >= Math.PI; a -= Math.PI / 24) {
				// 	roundShape.lineTo(w / 2 + Math.cos(a) * r, h + Math.sin(a) * r - 1)
				// }

				roundShape.closePath()

				const geometry = new THREE.ExtrudeGeometry(roundShape, {
					depth: 2,
					bevelEnabled: false,
				})

				return geometry
			},
			landingLegs(maxHullBottomWidth) {
				const landingLegsShape = new THREE.Shape()
				const w = maxHullBottomWidth
				const hullBottom = -Number(ufoInterface.hull.h) / 2 + 1.66
				const h = hullBottom - 5

				landingLegsShape.moveTo(-w / 2, hullBottom)
				landingLegsShape.lineTo(-w / 2 - 1, h + 1)
				landingLegsShape.lineTo(-w / 2 - 2, h + 1)
				landingLegsShape.lineTo(-w / 2 - 2, h)
				landingLegsShape.lineTo(-w / 2 + 2, h)
				landingLegsShape.lineTo(-w / 2 + 2, h + 1)
				landingLegsShape.lineTo(-w / 2 + 1, h + 1)
				landingLegsShape.lineTo(-w / 2 + 2, hullBottom - 0.5)

				landingLegsShape.lineTo(w / 2 - 2, hullBottom - 0.5)
				landingLegsShape.lineTo(w / 2 - 1, h + 1)
				landingLegsShape.lineTo(w / 2 - 2, h + 1)
				landingLegsShape.lineTo(w / 2 - 2, h)
				landingLegsShape.lineTo(w / 2 + 2, h)
				landingLegsShape.lineTo(w / 2 + 2, h + 1)
				landingLegsShape.lineTo(w / 2 + 1, h + 1)
				landingLegsShape.lineTo(w / 2, hullBottom)

				landingLegsShape.closePath()

				const geometry = new THREE.ExtrudeGeometry(landingLegsShape, {
					depth: 2,
					bevelEnabled: false,
				})

				return geometry
			},
			landingPegs(maxHullBottomWidth) {
				const landingPegsShape = new THREE.Shape()
				const w = maxHullBottomWidth / 2
				const hullBottom = -Number(ufoInterface.hull.h) / 2 + 1.66
				const h = hullBottom - 5

				landingPegsShape.moveTo(-w / 2 - 1, hullBottom)
				landingPegsShape.lineTo(-w / 2 - 1, h + 1)
				landingPegsShape.lineTo(-w / 2 - 2, h + 1)
				landingPegsShape.lineTo(-w / 2 - 2, h)
				landingPegsShape.lineTo(-w / 2 + 2, h)
				landingPegsShape.lineTo(-w / 2 + 2, h + 1)
				landingPegsShape.lineTo(-w / 2 + 1, h + 1)
				landingPegsShape.lineTo(-w / 2 + 1, hullBottom - 0.5)

				landingPegsShape.lineTo(w / 2 - 1, hullBottom - 0.5)
				landingPegsShape.lineTo(w / 2 - 1, h + 1)
				landingPegsShape.lineTo(w / 2 - 2, h + 1)
				landingPegsShape.lineTo(w / 2 - 2, h)
				landingPegsShape.lineTo(w / 2 + 2, h)
				landingPegsShape.lineTo(w / 2 + 2, h + 1)
				landingPegsShape.lineTo(w / 2 + 1, h + 1)
				landingPegsShape.lineTo(w / 2 + 1, hullBottom)

				landingPegsShape.closePath()

				const geometry = new THREE.ExtrudeGeometry(landingPegsShape, {
					depth: 2,
					bevelEnabled: false,
				})

				return geometry
			},
		},
		windows: {
			fiveCircles(maxHullMiddleWidth) {
				const circles = []

				for (let i = -maxHullMiddleWidth / 2; i <= maxHullMiddleWidth / 2; i += maxHullMiddleWidth / 4) {
					const shape = new THREE.Shape()

					// Define the shape's path (e.g., a simple rectangle)
					shape.moveTo(i, 0)
					shape.arc(i, 0, 0.75, 0, Math.PI * 2)

					circles.push(shape) // Add the shape to the array
				}

				return circles
			},
			threeCircles(maxHullMiddleWidth) {
				const circles = []

				for (let i = -maxHullMiddleWidth / 2; i <= maxHullMiddleWidth / 2; i += maxHullMiddleWidth / 2) {
					const shape = new THREE.Shape()

					// Define the shape's path (e.g., a simple rectangle)
					shape.moveTo(i, 0)
					shape.arc(i, 0, 1.25, 0, Math.PI * 2)

					circles.push(shape) // Add the shape to the array
				}

				return circles
			},
			rectangles(maxHullMiddleWidth) {
				const rectangles = []

				let idx = 0
				const c = 5
				for (let i = -maxHullMiddleWidth; i <= maxHullMiddleWidth; i += (maxHullMiddleWidth * 2) / (c - 1)) {
					const shape = new THREE.Shape()
					const w = maxHullMiddleWidth / 3
					let h = 0.5

					shape.moveTo(i - w / 2, -h / 2)
					shape.lineTo(i + w / 2, -h / 2)
					shape.lineTo(i + w / 2, h / 2)
					shape.lineTo(i - w / 2, h / 2)
					shape.closePath()

					rectangles.push(shape) // Add the shape to the array
					idx++
				}

				return rectangles
			},
		},
	}

	const ufo = {
		buildCockpit(maxHullTopWidth) {
			switch (ufoInterface.cockpit.type) {
				case "ROUND":
					return ufoParts.cockpit.round(maxHullTopWidth)
				case "ROUND_RECT":
					return ufoParts.cockpit.roundRect(maxHullTopWidth)
				case "BELL":
					return ufoParts.cockpit.trapezoid(maxHullTopWidth)
				case "POD":
					return ufoParts.cockpit.squishedRound(maxHullTopWidth)
				default:
					return ufoParts.cockpit.round(maxHullTopWidth)
			}
		},
		//to generate holes, create the hull geometry here - call ufoParts hull function to get the maxWindowsWidth and then make another function to generate the hull with holes using extrudeGeometry
		getHullParams() {
			switch (ufoInterface.hull.type) {
				case "USA_1950":
					return ufoParts.hull.bell()
				case "UK_1981":
					return ufoParts.hull.almond()
				case "UK_1978":
					return ufoParts.hull.cap()
				case "USA_1947":
					return ufoParts.hull.stump()
				default:
					return ufoParts.hull.almond()
			}
		},
		buildHull(shape, windows) {
			windows.forEach((window) => {
				shape.holes.push(window)
			})

			const geometry = new THREE.ExtrudeGeometry(shape, {
				depth: 2,
				bevelEnabled: false,
			})
			return geometry
		},
		buildTech(maxHullBottomWidth) {
			switch (ufoInterface.tech.type) {
				case "SINGLE_PROBE":
					return ufoParts.tech.round()
				case "TRI_PROBE":
					if (ufoInterface.hull.type === "UK_1981") {
						return ufoParts.tech.round(maxHullBottomWidth)
					} else {
						return ufoParts.tech.threeRound(maxHullBottomWidth)
					}
				case "COMPARTMENT":
					return ufoParts.tech.trapezoid(maxHullBottomWidth)
				case "LANDING_LEGS":
					return ufoParts.tech.landingLegs(maxHullBottomWidth)
				case "LANDING_PEGS":
					return ufoParts.tech.landingPegs(maxHullBottomWidth)
				default:
					return ufoParts.tech.trapezoid(maxHullBottomWidth)
			}
		},
		buildWindows(maxHullMiddleWidth) {
			switch (ufoInterface.windows.type) {
				case "CIRCLES":
					return ufoParts.windows.fiveCircles(maxHullMiddleWidth)
				case "RECTANGLES":
					return ufoParts.windows.rectangles(maxHullMiddleWidth)
				case "THREE_CIRCLES":
					return ufoParts.windows.threeCircles(maxHullMiddleWidth)
				default:
					return ufoParts.windows.fiveCircles(maxHullMiddleWidth)
			}
		},
		buildUfo() {
			const hullParams = this.getHullParams()
			const windows = this.buildWindows(hullParams.maxHullMiddleWidth)
			const hull = this.buildHull(hullParams.shape, windows)
			const cockpit = this.buildCockpit(hullParams.maxHullTopWidth)
			const tech = this.buildTech(hullParams.maxHullBottomWidth)
			const ufo = BufferGeometryUtils.mergeGeometries([cockpit, hull, tech])
			return ufo
		},
	}

	// Extract .val properties from boxInterface and set modelParams
	const modelParams = Object.fromEntries(Object.entries(ufoInterface).map(([key, value]) => [key, value]))

	useEffect(() => {
		if (mesh.current) {
			// Rotate the mesh by 90 degrees around the x-axis to make it lie flat
			mesh.current.rotation.x = -Math.PI / 2
		}
	}, [])

	return (
		<>
			<mesh ref={mesh} geometry={ufo.buildUfo()}>
				{/* <boxGeometry
					ref={cube}
					args={[ufoInterface.w.val, ufoInterface.d.val, ufoInterface.h.val]}
				/> */}
				<meshPhongMaterial color={"white"} />
				{/* <primitive object={materialRef.current} attach="material" /> */}
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
