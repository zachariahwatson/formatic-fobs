'use client'

import './globals.css'
import PrintQueue from './components/PrintQueue'
import { motion } from 'framer-motion'
import Barcode from './components/Barcode'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import Link from 'next/link'

export const metadata = {
  title: 'Formatic Fobs',
  description: 'By Zachariah Watson',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <title>Formatic Fobs</title>
      <body>
        <svg className="h-full w-10 absolute" viewBox="0 -5 10 5">
          <path d="M 0 0 l 0 5 l 10 -5 l -10 -5 z" fill="#fff" />
        </svg>
        <svg className="h-full w-10 absolute right-0" viewBox="0 -5 10 5">
          <path d="M 0 0 l 0 5 l 10 -5 l -10 -5 z" fill="#fff" transform="scale(-1,1) translate(-10,0)" />
        </svg>
        <div className="flex w-screen h-screen px-10 pt-10 pb-12">
          <div className={`w-3/4 rounded-3xl text-4xl outline-none shadow-lg shadow-white border border-white relative`}>
            <div className="w-full h-28 bg-gradient-to-b from-black from-50% to-transparent absolute top-0 left-0 z-10 rounded-3xl">
              <Link href="/"><p className="text-7xl px-6 pt-4 pb-2"><span className="font-copula">formatic</span><span className="font-waffold">FOBS</span></p></Link>
              <Barcode value="zchwtsn.com" />
              <svg className="w-full h-10">
                <defs>
                  <marker
                    id="arrow"
                    viewBox="0 0 10 10"
                    refX="10"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#fff" />
                  </marker>
                </defs>
                <line x1="0" y1="5" x2="100%" y2="5" stroke="#fff" strokeWidth="1.5" strokeDasharray="2,3" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
              </svg>
            </div>
            <div className="rounded-3xl absolute w-full h-full top-0 left-0 -z-10">
              <Canvas
                orthographic
                camera={{ zoom: 37.5, position: [-20, 20, 20] }}
                className="rounded-3xl"
              >
                <ambientLight />
                <directionalLight intensity={3} position={[40, 30, 20]} />
                <Grid visible infiniteGrid={true} position={[0, -20, 0]} sectionColor={'#666666'} fadeDistance={100} fadeStrength={3} />
              </Canvas>
            </div>
            {children}
          </div>
          <div className="flex flex-col items-center justify-center w-12">
            <svg className="h-full w-10">
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="5"
                  refY="10"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#fff" />
                </marker>
              </defs>
              <line x1="19" y1="0" x2="19" y2="100%" stroke="#fff" strokeWidth="1.5" strokeDasharray="2,3" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
            </svg>
          </div>
          <div className="w-1/4 rounded-3xl p-5 bg-black text-4xl outline-none shadow-lg shadow-white border border-white relative">
            <div className="w-full h-28 bg-gradient-to-b from-black from-50% to-transparent absolute top-0 left-0 z-10 rounded-3xl">
              <p className="text-6xl mb-px px-6 pb-2 pt-6"><span className="font-n27-extralight">PRINT_</span><span className="font-n27-regular">QUEUE</span></p>
              <svg className="w-full h-10">
                <defs>
                  <marker
                    id="arrow"
                    viewBox="0 0 10 10"
                    refX="10"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#fff" />
                  </marker>
                </defs>
                <line x1="0" y1="6" x2="100%" y2="6" stroke="#fff" strokeWidth="1.5" strokeDasharray="2,3" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
              </svg>
            </div>
            <PrintQueue />
          </div>
        </div>
      </body>
    </html>
  )
}
