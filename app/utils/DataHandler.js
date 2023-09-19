import { useState, useEffect, useRef } from "react"

export function DataHandler(MIDIdata) {
	const [printButtonHit, setPrintButtonHit] = useState(false)
	const intervalMap = useRef({})

	const [MIDIinterface, setMIDIinterface] = useState({
		0: { val: 0, lastUserVal: 0, isRandom: false },
		1: { val: 0, lastUserVal: 0, isRandom: false },
		2: { val: 0, lastUserVal: 0, isRandom: false },
		3: { val: 0, lastUserVal: 0, isRandom: false },
		4: { val: 0, lastUserVal: 0, isRandom: false },
		5: { val: 0, lastUserVal: 0, isRandom: false },
		6: { val: 0, lastUserVal: 0, isRandom: false },
		7: { val: 0, lastUserVal: 0, isRandom: false },
	})

	useEffect(() => {
		if (MIDIdata.id === 23 && MIDIdata.val === 127 && !printButtonHit) {
			setPrintButtonHit(true)
		}
	}, [MIDIdata])

	useEffect(() => {
		if (MIDIdata && MIDIdata.id !== undefined && MIDIdata.id <= 15) {
			const isRandomButton = MIDIdata.id >= 8
			const id = isRandomButton ? MIDIdata.id - 8 : MIDIdata.id

			if (isRandomButton === true && MIDIdata.val === 1) {
				if (MIDIinterface[id].isRandom === false) {
					MIDIinterface[id].isRandom = true
					let rand1 = Math.random() * 10
					let rand2 = Math.random()

					const interval = setInterval(() => {
						setMIDIinterface((prev) => ({
							...prev,
							[id]: {
								...prev[id],
								val:
									rand1 < 0.5
										? ((Math.sin((Date.now() / 1000) * rand2) + 1) / 2) * 127
										: ((Math.cos((Date.now() / 1000) * rand2) + 1) / 2) * 127,
								isRandom: true,
							},
						}))
					}, 16)

					intervalMap.current[id] = interval
				}
			} else if (isRandomButton === true && MIDIdata.val === 0) {
				setMIDIinterface((prev) => ({
					...prev,
					[id]: {
						...prev[id],
						val: prev[id].lastUserVal,
						isRandom: false,
					},
				}))
				if (intervalMap.current[id]) {
					clearInterval(intervalMap.current[id])
					delete intervalMap.current[id]
				}
			} else if (MIDIinterface[id].isRandom === false) {
				setMIDIinterface((prev) => ({
					...prev,
					[id]: {
						...prev[id],
						val: MIDIdata.val,
						lastUserVal: MIDIdata.val,
					},
				}))
			}
		}
	}, [MIDIdata])

	// Return the relevant state from the ref
	return {
		printButtonHit: printButtonHit,
		MIDIinterface: MIDIinterface,
	}
}

// import { useState, useEffect, useRef } from "react"

// export function DataHandler(MIDIdata) {
// 	const [printButtonHit, setPrintButtonHit] = useState(false)
// 	const intervalMap = useRef({})

// 	const [MIDIinterface, setMIDIinterface] = useState({
// 		0: { val: 0, lastUserVal: 0, isRandom: false },
// 		1: { val: 0, lastUserVal: 0, isRandom: false },
// 		2: { val: 0, lastUserVal: 0, isRandom: false },
// 		3: { val: 0, lastUserVal: 0, isRandom: false },
// 		4: { val: 0, lastUserVal: 0, isRandom: false },
// 		5: { val: 0, lastUserVal: 0, isRandom: false },
// 		6: { val: 0, lastUserVal: 0, isRandom: false },
// 		7: { val: 0, lastUserVal: 0, isRandom: false },
// 	})

// 	useEffect(() => {
// 		if (MIDIdata.id === 23 && MIDIdata.val === 127 && !printButtonHit) {
// 			setPrintButtonHit(true)
// 		}
// 	}, [MIDIdata])

// 	useEffect(() => {
// 		if (MIDIdata && MIDIdata.id !== undefined) {
// 			const isRandomButton = MIDIdata.id >= 8
// 			const id = isRandomButton ? MIDIdata.id - 8 : MIDIdata.id

// 			if (isRandomButton && MIDIdata.val === 1) {
// 				if (!MIDIinterfaceRef.current[id].isRandom) {
// 					MIDIinterfaceRef.current[id].isRandom = true
// 					let rand1 = Math.random() * 10
// 					let rand2 = Math.random()

// 					const interval = setInterval(() => {
// 						// Update the MIDIinterfaceRef directly using the ref
// 						MIDIinterfaceRef.current[id] = {
// 							...MIDIinterfaceRef.current[id],
// 							val:
// 								rand1 < 0.5
// 									? ((Math.sin((Date.now() / 1000) * rand2) + 1) / 2) * 127
// 									: ((Math.cos((Date.now() / 1000) * rand2) + 1) / 2) * 127,
// 							isRandom: true, // Set isRandom to true when random button is pressed
// 						}
// 					}, 10)

// 					intervalMap.current[id] = interval
// 				}
// 			} else if (isRandomButton && MIDIdata.val === 0) {
// 				MIDIinterfaceRef.current[id].isRandom = false
// 				MIDIinterfaceRef.current[id].val =
// 					MIDIinterfaceRef.current[id].lastUserVal
// 				if (intervalMap.current[id]) {
// 					clearInterval(intervalMap.current[id])
// 					delete intervalMap.current[id]
// 				}
// 			} else if (MIDIinterfaceRef.current[id].isRandom === false) {
// 				console.log("huh")
// 				// Allow manual knob adjustments when the random button is not pressed
// 				MIDIinterfaceRef.current[id].val = MIDIdata.val
// 				MIDIinterfaceRef.current[id].lastUserVal = MIDIdata.val
// 			}
// 		}
// 	}, [MIDIdata])

// 	// Return the relevant state from the ref
// 	return {
// 		printButtonHit: printButtonHit,
// 		MIDIinterface: MIDIinterfaceRef.current,
// 		shapeData: { type: "blah", p1: 0, p2: 0, p3: 0 },
// 	}
// }

// import { useState, useEffect, useRef } from "react";

// export function DataHandler(MIDIdata) {
//   const [type, setType] = useState("cube");
//   const [printButtonHit, setprintButtonHit] = useState(false);
//   const intervalMap = useRef({});
//   const MIDIdataRef = useRef(MIDIdata);
//   MIDIdataRef.current = MIDIdata
//   const isRandomButtonRef = useRef(null);
//   //console.log(intervalMap)

//   //testin
//   const [MIDIinterface, setMIDIinterface] = useState({
//     0: {
//       val: 0,
//       isRandom: false,
//     },
//     1: {
//       val: 0,
//       isRandom: false,
//     },
//     2: {
//       val: 0,
//       isRandom: false,
//     },
//     3: {
//       val: 0,
//       isRandom: false,
//     },
//     4: {
//       val: 0,
//       isRandom: false,
//     },
//     5: {
//       val: 0,
//       isRandom: false,
//     },
//     6: {
//       val: 0,
//       isRandom: false,
//     },
//     7: {
//       val: 0,
//       isRandom: false,
//     },
//   });

//   //ignore these
//   //cube setup
//   const minCubeVals = { w: 2, h: 2, d: 2 };
//   const [cubeData, setcubeData] = useState({ type: "cube", ...minCubeVals });

//   //cone setup
//   const minConeVals = { r: 2, h: 4, segments: 8 };
//   const [coneData, setConeData] = useState({ type: "cone", ...minConeVals });

//   //various buttons/knobs
//   useEffect(() => {
//     //assign first knob to select the model
//     if (MIDIdata.id == 0) {
//       if (MIDIdata.val < 64) {
//         setType("cube");
//       } else {
//         setType("cone");
//       }
//     }
//     //print button
//     if (MIDIdata.id == 23 && MIDIdata.val == 127 && !printButtonHit) {
//       setprintButtonHit(true);
//     }
//   }, [MIDIdata]);

//   useEffect(() => {
//     if (MIDIdata && MIDIdata.id !== undefined) {
//       const isRandomButton = MIDIdata.id >= 8;
//       isRandomButtonRef.current = isRandomButton;
//       const id = isRandomButton ? MIDIdata.id - 8 : MIDIdata.id;
//       if (isRandomButton && MIDIdata.val == 1) {
//         let rand1 = Math.random() * 10;
//         let rand2 = Math.random();

//         // Generate a sine wave for val
//         const interval = setInterval(() => {
//           setMIDIinterface((prevData) => ({
//             ...prevData,
//             [id]: {
//               ...prevData[id],
//               val:
//                 rand1 < 0.5
//                   ? ((Math.sin((Date.now() / 1000) * rand2) + 1) / 2) * 127
//                   : ((Math.cos((Date.now() / 1000) * rand2) + 1) / 2) * 127, // Calculate sine wave values
//               isRandom: MIDIdata.val == 1,
//             },
//           }));
//         }, 10); // Update the sine wave value every 100 milliseconds

//         // Store the interval in the map
//         intervalMap.current[id] = interval;
//       } else if (!MIDIinterface[id].isRandom) {
//         setMIDIinterface((prevData) => {
//           if (intervalMap.current[id]) {
//             clearInterval(intervalMap.current[id]);
//             delete intervalMap.current[id];
//           }
//           return {
//             ...prevData,
//             [id]: {
//               ...prevData[id],
//               val: MIDIdata.val,
//             },
//           };
//         });
//       }
//     }
//     // Clean up all intervals on component unmount
//     return () => {
//       console.log(isRandomButtonRef.current)
//       console.log(MIDIdata.val == 0)
//       console.log(intervalMap.current[MIDIdata.id >= 8 ? MIDIdata.id - 8 : MIDIdata.id])
//       if (MIDIdata.id >= 8 && MIDIdata.val == 0 && intervalMap.current[MIDIdata.id >= 8 ? MIDIdata.id - 8 : MIDIdata.id]) {
//         console.log('test')
//         clearInterval(intervalMap.current[MIDIdata.id >= 8 ? MIDIdata.id - 8 : MIDIdata.id]);
//       }
//     };
//   }, [MIDIdata]);

//   return {
//     printButtonHit: printButtonHit,
//     shapeData: type == "cube" ? cubeData : coneData,
//     MIDIinterface: MIDIinterface,
//   };
// }
