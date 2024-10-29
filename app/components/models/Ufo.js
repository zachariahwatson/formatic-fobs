import React, { useRef, useEffect, useState } from "react"
import * as THREE from "three"
import ExportSTL from "../ExportSTL"
import map from "./../../utils/map"
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js"
import { MeshTransmissionMaterial } from "@react-three/drei"

export default function Ufo({ printButtonHit, MIDIinterface, printModel, params }) {
	const mesh = useRef()

	const extrudeOptions = {
		depth: 2,
		bevelSegments: 12,
	}

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
					case 4:
						return "PARABOLA"
					default:
						return "ROUND"
				}
			},
			get w() {
				return map(MIDIinterface[1].val, 0, 127, 6.67, ufoInterface.hull.w / 1.9)
			},
			get h() {
				return map(MIDIinterface[2].val, 0, 127, 5, 10)
			},
		},
		hull: {
			get type() {
				switch (Math.floor(map(MIDIinterface[3].val, 0, 127, 0, 6))) {
					case 0:
						return "UK_1981"
					case 1:
						return "USA_1950"
					case 2:
						return "UK_1978"
					case 3:
						return "RSA_1995"
					case 4:
						return "USA_1961"
					case 5:
						return "PNG_1959"
					case 6:
						return "USA_1967"
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
						return "TRI_LANDING_LEGS"
					case 5:
						return "LANDING_PEGS"
					case 6:
						return "LANDING_SPIKES"
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
						return "DOUBLE_RECTANGLES"
					case 3:
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

				//roundShape.moveTo(-r + 2, h)
				roundShape.moveTo(-r + 2, hullTop)
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

				const geometry = new THREE.ExtrudeGeometry(roundShape, extrudeOptions)

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

				const geometry = new THREE.ExtrudeGeometry(roundRectShape, extrudeOptions)

				return geometry
			},
			squishedRound(maxHullTopWidth) {
				const roundShape = new THREE.Shape()
				const w = Math.min(maxHullTopWidth, ufoInterface.cockpit.w)
				const r = w / 2
				const hullTop = Number(ufoInterface.hull.h) / 2 - 3
				const h = hullTop + Math.max(Number(ufoInterface.cockpit.h) - r, 0) + 2

				//roundShape.moveTo(-r + 2, h)
				roundShape.moveTo(-r + 2, hullTop)
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

				const geometry = new THREE.ExtrudeGeometry(roundShape, extrudeOptions)

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

				const geometry = new THREE.ExtrudeGeometry(trapezoidShape, extrudeOptions)

				return geometry
			},
			parabola(maxHullTopWidth) {
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

				const geometry = new THREE.ExtrudeGeometry(roundShape, extrudeOptions)

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
			almondHalved() {
				const almondHalvedShape = new THREE.Shape()
				const w = ufoInterface.hull.w
				const h = ufoInterface.hull.h

				const maxHullTopWidth = w / 2
				const maxHullMiddleWidth = w / 3
				const maxHullBottomWidth = w / 2

				almondHalvedShape.moveTo(-w / 2, h / 16)
				almondHalvedShape.bezierCurveTo(-w / 2, h / 16, -w / 3, h / 2, 0, h / 2)
				almondHalvedShape.bezierCurveTo(w / 3, h / 2, w / 2, h / 16, w / 2, h / 16)
				almondHalvedShape.lineTo(w / 2.25, h / 16)
				almondHalvedShape.lineTo(w / 2.25, -h / 16)
				almondHalvedShape.lineTo(w / 2, -h / 16)
				almondHalvedShape.bezierCurveTo(w / 2, -h / 16, w / 3, -h / 2, 0, -h / 2)
				almondHalvedShape.bezierCurveTo(-w / 3, -h / 2, -w / 2, -h / 16, -w / 2, -h / 16)
				almondHalvedShape.lineTo(-w / 2.25, -h / 16)
				almondHalvedShape.lineTo(-w / 2.25, h / 16)
				almondHalvedShape.lineTo(-w / 2, h / 16)
				almondHalvedShape.closePath()

				return {
					shape: almondHalvedShape,
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
			lumpy() {
				const lumpyShape = new THREE.Shape()
				const w = ufoInterface.hull.w
				const h = ufoInterface.hull.h

				const maxHullTopWidth = w / 3
				const maxHullMiddleWidth = w / 3
				const maxHullBottomWidth = w / 2

				lumpyShape.moveTo(-w / 2, 0)
				lumpyShape.bezierCurveTo(-w / 2, 0, -w / 2.5, h / 3.5, -w / 4, h / 3)
				lumpyShape.bezierCurveTo(-w / 5, h / 2, -w / 6, h / 2, -w / 6, h / 2)
				lumpyShape.lineTo(w / 6, h / 2)
				lumpyShape.bezierCurveTo(w / 6, h / 2, w / 5, h / 2, w / 4, h / 3)
				lumpyShape.bezierCurveTo(w / 2.5, h / 3.5, w / 2, 0, w / 2, 0)
				lumpyShape.bezierCurveTo(w / 2, 0, w / 3, -h / 2, 0, -h / 2)
				lumpyShape.bezierCurveTo(-w / 3, -h / 2, -w / 2, 0, -w / 2, 0)
				lumpyShape.closePath()

				return {
					shape: lumpyShape,
					maxHullTopWidth: maxHullTopWidth,
					maxHullMiddleWidth: maxHullMiddleWidth,
					maxHullBottomWidth: maxHullBottomWidth,
				}
			},
			steps() {
				const stepsShape = new THREE.Shape()
				const w = ufoInterface.hull.w
				const h = ufoInterface.hull.h

				const maxHullTopWidth = w / 1.9
				const maxHullMiddleWidth = w / 4
				const maxHullBottomWidth = w / 1.5

				stepsShape.moveTo(-w / 2, -h / 2)
				stepsShape.lineTo(-w / 2 + 1, -h / 6)
				stepsShape.lineTo(-w / 2 + 2.5, -h / 6)
				stepsShape.lineTo(-w / 2 + 2.5 + 1, h / 6)
				stepsShape.lineTo(-w / 2 + 5, h / 6)
				stepsShape.lineTo(-w / 2 + 5 + 1, h / 2)
				stepsShape.lineTo(w / 2 - 5 - 1, h / 2)
				stepsShape.lineTo(w / 2 - 5, h / 6)
				stepsShape.lineTo(w / 2 - 2.5 - 1, h / 6)
				stepsShape.lineTo(w / 2 - 2.5, -h / 6)
				stepsShape.lineTo(w / 2 - 1, -h / 6)
				stepsShape.lineTo(w / 2, -h / 2)
				stepsShape.closePath()

				return {
					shape: stepsShape,
					maxHullTopWidth: maxHullTopWidth,
					maxHullMiddleWidth: maxHullMiddleWidth,
					maxHullBottomWidth: maxHullBottomWidth,
				}
			},
			invertedCone() {
				const invertedConeShape = new THREE.Shape()
				const w = ufoInterface.hull.w
				const h = ufoInterface.hull.h

				const maxHullTopWidth = w / 2.25
				const maxHullMiddleWidth = w / 4
				const maxHullBottomWidth = w / 2

				invertedConeShape.moveTo(-w / 2, h / 3)
				invertedConeShape.bezierCurveTo(-w / 2, h / 3 + 1, -w / 4, h / 2, 0, h / 2)
				invertedConeShape.bezierCurveTo(w / 4, h / 2, w / 2, h / 3 + 1, w / 2, h / 3)
				invertedConeShape.bezierCurveTo(w / 2, h / 3 - 1, w / 4, -h / 2 + 1, w / 4, -h / 2 + 1)
				invertedConeShape.bezierCurveTo(w / 4, -h / 2 + 1, w / 8, -h / 2, 0, -h / 2)
				invertedConeShape.bezierCurveTo(-w / 8, -h / 2, -w / 4, -h / 2 + 1, -w / 4, -h / 2 + 1)
				invertedConeShape.bezierCurveTo(-w / 4, -h / 2 + 1, -w / 2, h / 3 - 1, -w / 2, h / 3)
				//invertedConeShape.bezierCurveTo(w / 2.5, h / 2, w / 3, -h / 4, w / 2, -h / 2)
				invertedConeShape.closePath()

				return {
					shape: invertedConeShape,
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

				const geometry = new THREE.ExtrudeGeometry(roundShape, extrudeOptions)

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

				const geometry = new THREE.ExtrudeGeometry(trapezoidShape, extrudeOptions)

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

				const geometry = new THREE.ExtrudeGeometry(roundShape, extrudeOptions)

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

				const geometry = new THREE.ExtrudeGeometry(landingLegsShape, extrudeOptions)

				return geometry
			},
			triLandingLegs(maxHullBottomWidth) {
				const triLandingLegsShape = new THREE.Shape()
				const w = maxHullBottomWidth
				const hullBottom = -Number(ufoInterface.hull.h) / 2 + 1.66
				const h = hullBottom - 5

				triLandingLegsShape.moveTo(-w / 2, hullBottom)
				triLandingLegsShape.lineTo(-w / 2 - 1, h + 1)
				triLandingLegsShape.lineTo(-w / 2 - 2, h + 1)
				triLandingLegsShape.lineTo(-w / 2 - 2, h)
				triLandingLegsShape.lineTo(-w / 2 + 2, h)
				triLandingLegsShape.lineTo(-w / 2 + 2, h + 1)
				triLandingLegsShape.lineTo(-w / 2 + 1, h + 1)
				triLandingLegsShape.lineTo(-w / 2 + 2, hullBottom - 0.5)

				triLandingLegsShape.lineTo(-1, hullBottom - 0.5)
				triLandingLegsShape.lineTo(-1, h + 1)
				triLandingLegsShape.lineTo(-2, h + 1)
				triLandingLegsShape.lineTo(-2, h)
				triLandingLegsShape.lineTo(2, h)
				triLandingLegsShape.lineTo(2, h + 1)
				triLandingLegsShape.lineTo(1, h + 1)
				triLandingLegsShape.lineTo(1, hullBottom)

				triLandingLegsShape.lineTo(w / 2 - 2, hullBottom - 0.5)
				triLandingLegsShape.lineTo(w / 2 - 1, h + 1)
				triLandingLegsShape.lineTo(w / 2 - 2, h + 1)
				triLandingLegsShape.lineTo(w / 2 - 2, h)
				triLandingLegsShape.lineTo(w / 2 + 2, h)
				triLandingLegsShape.lineTo(w / 2 + 2, h + 1)
				triLandingLegsShape.lineTo(w / 2 + 1, h + 1)
				triLandingLegsShape.lineTo(w / 2, hullBottom)

				triLandingLegsShape.closePath()

				const geometry = new THREE.ExtrudeGeometry(triLandingLegsShape, extrudeOptions)

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

				const geometry = new THREE.ExtrudeGeometry(landingPegsShape, extrudeOptions)

				return geometry
			},
			landingSpikes(maxHullBottomWidth) {
				const landingSpikes = new THREE.Shape()
				const w = maxHullBottomWidth
				const hullBottom = -Number(ufoInterface.hull.h) / 2 + 1.66
				const h = hullBottom - 5

				landingSpikes.moveTo(-w / 2, hullBottom)
				landingSpikes.lineTo(-w / 2 - 1, h)
				landingSpikes.lineTo(-w / 2 + 3, hullBottom - 0.5)

				landingSpikes.lineTo(w / 2 - 3, hullBottom - 0.5)
				landingSpikes.lineTo(w / 2 + 1, h)
				landingSpikes.lineTo(w / 2, hullBottom)

				landingSpikes.closePath()

				const geometry = new THREE.ExtrudeGeometry(landingSpikes, extrudeOptions)

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
					shape.arc(i, 0, 0.75, 0, Math.PI * 1.99)

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
					shape.arc(i, 0, 1.25, 0, Math.PI * 1.99)

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
					let h = 0.75

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
			doubleRectangles(maxHullMiddleWidth) {
				const doubleRectangles = []

				let idx = 0
				const c = 5
				for (let i = -maxHullMiddleWidth; i <= maxHullMiddleWidth; i += (maxHullMiddleWidth * 2) / (c - 1)) {
					const shape = new THREE.Shape()
					const w = maxHullMiddleWidth / 3
					let h = 0.5

					shape.moveTo(i - w / 2, -h / 2 + 0.75)
					shape.lineTo(i + w / 2, -h / 2 + 0.75)
					shape.lineTo(i + w / 2, h / 2 + 0.75)
					shape.lineTo(i - w / 2, h / 2 + 0.75)
					shape.closePath()

					doubleRectangles.push(shape) // Add the shape to the array
					idx++
				}

				for (let i = -maxHullMiddleWidth; i <= maxHullMiddleWidth; i += (maxHullMiddleWidth * 2) / (c - 1)) {
					const shape = new THREE.Shape()
					const w = maxHullMiddleWidth / 3
					let h = 0.5

					shape.moveTo(i - w / 2, -h / 2 - 0.75)
					shape.lineTo(i + w / 2, -h / 2 - 0.75)
					shape.lineTo(i + w / 2, h / 2 - 0.75)
					shape.lineTo(i - w / 2, h / 2 - 0.75)
					shape.closePath()

					doubleRectangles.push(shape) // Add the shape to the array
					idx++
				}

				return doubleRectangles
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
				case "RSA_1995":
					return ufoParts.hull.lumpy()
				case "USA_1961":
					return ufoParts.hull.almondHalved()
				case "PNG_1959":
					return ufoParts.hull.steps()
				case "USA_1967":
					return ufoParts.hull.invertedCone()
				default:
					return ufoParts.hull.almond()
			}
		},
		buildHull(shape, windows) {
			if (windows) {
				windows.forEach((window) => {
					shape.holes.push(window)
				})
			}

			const geometry = new THREE.ExtrudeGeometry(shape, extrudeOptions)
			return geometry
		},
		buildTech(maxHullBottomWidth) {
			switch (ufoInterface.tech.type) {
				case "SINGLE_PROBE":
					return ufoParts.tech.round()
				case "TRI_PROBE":
					if (["UK_1981", "RSA_1995", "USA_1961", "USA_1967"].includes(ufoInterface.hull.type)) {
						return ufoParts.tech.round(maxHullBottomWidth)
					} else {
						return ufoParts.tech.threeRound(maxHullBottomWidth)
					}
				case "COMPARTMENT":
					return ufoParts.tech.trapezoid(maxHullBottomWidth)
				case "LANDING_LEGS":
					return ufoParts.tech.landingLegs(maxHullBottomWidth)
				case "TRI_LANDING_LEGS":
					return ufoParts.tech.triLandingLegs(maxHullBottomWidth)
				case "LANDING_PEGS":
					return ufoParts.tech.landingPegs(maxHullBottomWidth)
				case "LANDING_SPIKES":
					return ufoParts.tech.landingSpikes(maxHullBottomWidth)
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
				case "DOUBLE_RECTANGLES":
					return ufoParts.windows.doubleRectangles(maxHullMiddleWidth)
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
			if (tech) {
				const ufo = BufferGeometryUtils.mergeGeometries([cockpit, hull, tech])
				return ufo
			}

			const ufo = BufferGeometryUtils.mergeGeometries([cockpit, hull])
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
				<meshPhongMaterial color={"white"} />
				{/* <MeshTransmissionMaterial transmissionSampler background={new THREE.Color("#FF0000")} /> */}
				{/* <meshMatcapMaterial /> */}
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
