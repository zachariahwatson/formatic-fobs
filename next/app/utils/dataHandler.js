import { useState, useEffect } from "react";

export function dataHandler(MIDIdata) {
    const [type, setType] = useState('cube')
    const [printButtonHit, setprintButtonHit] = useState(false)

    //cube setup
    const minCubeVals = {w: 2, h: 2, d: 2}
    const [cubeData, setcubeData] = useState({type: 'cube', ...minCubeVals})

    //cone setup
    const minConeVals = {r: 2, h: 4, segments: 8}
    const [coneData, setConeData] = useState({type: 'cone', ...minConeVals})

    //cube listener
    useEffect(() => {
        if (type == 'cube') {
            if (MIDIdata.id == 1) {
                setcubeData((prev) => ({ ...prev, w: minCubeVals.w + MIDIdata.val/8 }))
            } else if (MIDIdata.id == 2) {
                setcubeData((prev) => ({ ...prev, h: minCubeVals.h + MIDIdata.val/8 }))
            } else if (MIDIdata.id == 3) {
                setcubeData((prev) => ({ ...prev, d: minCubeVals.d + MIDIdata.val/8 }))
            }
            console.log(cubeData)
        }
    }, [MIDIdata])

    //cone listener
    useEffect(() => {
        if (type == 'cone') {
            if (MIDIdata.id == 1) {
                setConeData((prev) => ({ ...prev, r: minConeVals.r + MIDIdata.val/8 }))
            } else if (MIDIdata.id == 2) {
                setConeData((prev) => ({ ...prev, h: minConeVals.h + MIDIdata.val/8 }))
            } else if (MIDIdata.id == 3) {
                setConeData((prev) => ({ ...prev, segments: minConeVals.segments + MIDIdata.val/8 }))
            }
            console.log(coneData)
        }
    }, [MIDIdata])

    //various buttons/knobs
    useEffect(() => {
        //assign first knob to select the model
        if (MIDIdata.id == 0) {
            if (MIDIdata.val < 64) {
                setType('cube')
            } else {
                setType('cone')
            }
        }
        //print button
        if (MIDIdata.id == 23 && MIDIdata.val == 127 && !printButtonHit) {
            setprintButtonHit(true)
        }
    }, [MIDIdata])

    return {
        printButtonHit: printButtonHit,
        shapeData: type == 'cube' ? cubeData : coneData
    }
}