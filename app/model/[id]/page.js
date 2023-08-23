'use client'

import { useEffect, useState } from 'react'
import ModelScene from './../../components/ModelScene';
import { motion } from 'framer-motion';
// import RandomText from '@/app/components/RandomText';

export default function Page({ params }) {
  const [MIDIdata, setMidiData] = useState([0,0])

  useEffect(() => {
    //set up MIDI functionality
    navigator.requestMIDIAccess()
      .then((midiAccess) => {
        console.log('MIDI access request succeeded')
        const midiInput = midiAccess.inputs.values().next().value
        midiInput.onmidimessage = handleMIDIMessage
        //handle MIDI messages and process data before emitting
        function handleMIDIMessage(message) {
          //process the MIDI message and convert it to a suitable format
          const rawMIDIdata = message.data
          processMIDIdata(rawMIDIdata)
        }
        //process MIDI data
        function processMIDIdata(rawMIDIdata) {
          const id = rawMIDIdata[1]
          const val = rawMIDIdata[2]
          const processedData = {id: id, val: val}
          setMidiData(processedData)
        }
      })
      .catch((err) => {
        console.error('MIDI access request failed: ' + err)
      })
    }, [])

  return (
    <>
      <ModelScene MIDIdata={MIDIdata}/>
    </>
  )
}

/* <motion.div
      initial={{ opacity: 0}}
      animate={{ opacity: 1}}
      transition={{ duration: 1, delay: 2 }}>
        <h1 className="font-black text-8xl p-5">{params.id}</h1>
      </motion.div> */