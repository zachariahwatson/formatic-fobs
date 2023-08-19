/*TODO
  [x] set up stl export on button press
  [ ] implement db
  [ ] create print queue that waits for user input before printing next print job
  [ ] create print queue component that contains print job components with a preview of the model
  [ ] create slicing process that puts multiple models on the same buildplate (use --marge header in prusaslicer cli)
  [ ] twitter api to dm people model is ready?
  [ ] 3d print cover for midi controller
  [ ] stickers - https://thestickybrand.com/products/try-out-our-vinyl-custom-stickers-for-a-limited-time-get-100-2-5custom-vinyl-die-cut-stickers-for-19-00
  [ ] pretty everything up
  [ ] create rainbow shader for models
  [ ] create white gridline plane
  [ ] maybe lighting shader?
  [ ] create ufo model
  [ ] create cactus model
  [ ] create landscape model
  [ ] do exhibit simulation test
  [ ] test on tvs
  [ ] calibrate 3d printer
  [ ] generate .ini file for prusaslicer cli
*/

'use client'

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
import { useEffect, useState } from 'react'
import ModelScene from './components/ModelScene';
import TwitterPrompt from './components/TwitterPrompt';

export default async function Page() {
  const [MIDIdata, setMidiData] = useState([0,0])
  const [showModelScene, setShowModelScene] = useState(false)
  const [twitterAccount, setTwitterAccount] = useState('')
  const modelSceneCheck = await prisma.model.findMany({
    where: { 
      IsCurrentModel: false      
    },     
    orderBy: {
      TimeStamp: 'desc'
    },
    take: 1
  })
  const currentModel = modelSceneCheck[0]
  if (currentModel)

  useEffect(() => {
    //set up MIDI functionality
    navigator.requestMIDIAccess()
      .then((midiAccess) => {
        console.log('MIDI access request succeeded')
        const midiInput = midiAccess.inputs.values().next().value;
        midiInput.onmidimessage = handleMIDIMessage;
        //handle MIDI messages and process data before emitting
        function handleMIDIMessage(message) {
          //process the MIDI message and convert it to a suitable format
          const rawMIDIdata = message.data;
          processMIDIdata(rawMIDIdata);
        }
        //process MIDI data
        function processMIDIdata(rawMIDIdata) {
          const id = rawMIDIdata[1]
          const val = rawMIDIdata[2]
          const processedData = {id: id, val: val};
          setMidiData(processedData)
        }
      })
      .catch((err) => {
        console.error('MIDI access request failed: ' + err)
      })
    }, []);

  return (
    //r3f model or twitter prompt
    <>
      {!showModelScene && (
        <TwitterPrompt setShowModelScene={setShowModelScene} setTwitterAccount={setTwitterAccount}/>
      )}
      {showModelScene && (
        <>
        <h1>Hi {twitterAccount}</h1>
        <ModelScene MIDIdata={MIDIdata}/>
        </>
      )}
    </>
  )
}
// {!showModelScene && (
//   <TwitterPrompt setShowModelScene={setShowModelScene} setTwitterAccount={setTwitterAccount}/>
// )}
// {showModelScene && (
//   <>
//   <h1>Hi {twitterAccount}</h1>
//   <ModelScene MIDIdata={MIDIdata}/>
//   </>
// )}