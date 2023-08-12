'use client'

import { useEffect} from 'react'

export default function Page({data}) {
  
  useEffect(() => {
    //do three.js stuff
  }, []);

  return (
      <>
          <p>MIDI Data: ID: {data[0]}, Value: {data[1]}</p>
      </>
  );
}

