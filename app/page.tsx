'use client'

import { useState, useEffect } from 'react'
import HardwareBoard from '@/components/HardwareBoard'
import AsciiBackground from '@/components/AsciiBackground'

// Total visual bounding box: board width × (board height + smiski below)
const BOARD_W = 920
const BOARD_H = 858

export default function Home() {
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const update = () => {
      setScale(Math.min(
        1,
        (window.innerWidth  - 48) / BOARD_W,
        (window.innerHeight - 48) / BOARD_H
      ))
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return (
    <>
      <AsciiBackground />
      <main
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          perspective: 1000,
        }}
      >
        {/*
          zoom (not transform: scale) shrinks the layout box too,
          so the browser centers the already-scaled dimensions —
          no overflow, no clipping, smiski always visible.
        */}
        <div style={{
          zoom: scale,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
        }}>
          <HardwareBoard />
        </div>
      </main>
    </>
  )
}
