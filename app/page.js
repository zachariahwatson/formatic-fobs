'use client'

import ModelScene from './../components/ModelScene'
import { useEffect, useState } from 'react'

export default function Page() {
  const [MIDIdata, setMidiData] = useState([0,0])

  useEffect(() => {
  
      // Set up MIDI functionality
      navigator.requestMIDIAccess()
        .then((midiAccess) => {
          console.log('MIDI access request succeeded')
          const midiInput = midiAccess.inputs.values().next().value;
          midiInput.onmidimessage = handleMIDIMessage;
          // Function to handle MIDI messages and process data before emitting
          function handleMIDIMessage(message) {
            // Process the MIDI message and convert it to a suitable format (e.g., JSON)
            const rawMIDIdata = message.data; // Raw MIDI data
            const processedMIDIdata = processMIDIdata(rawMIDIdata); // Processed MIDI data
          }
  
          //Function to process MIDI data
          function processMIDIdata(rawMIDIdata) {
            // Process the raw MIDI data and convert it into a structured format
            const id = rawMIDIdata[1]
            const val = rawMIDIdata[2]
            const processedData = [id,val];
            setMidiData(processedData)
            return processedData;
          }
        })
        .catch((err) => {
          console.error('MIDI access request failed: ' + err)
        })
      // Clean up
      return () => {
        socket.disconnect(); // Disconnect socket.io when the component unmounts
      };
    }, []);

  return (
      <>
          <h1>control page</h1><br/>
          <ModelScene data={MIDIdata}/>
      </>
  )
}