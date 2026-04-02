'use client'

import { useState, useEffect } from 'react'
import HardwareBoard from '@/components/HardwareBoard'
import MobileView from '@/components/MobileView'
import AsciiBackground from '@/components/AsciiBackground'

const BOARD_W = 920
const BOARD_H = 858
const MOBILE_BP = 768

export default function Home() {
  const [isMobile, setIsMobile] = useState(false)
  const [scale,    setScale]    = useState(1)

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      setIsMobile(w < MOBILE_BP)
      setScale(Math.min(
        1,
        (w - 48) / BOARD_W,
        (window.innerHeight - 48) / BOARD_H,
      ))
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return (
    <>
      <AsciiBackground />
      {isMobile ? (
        <MobileView />
      ) : (
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
          <div style={{
            zoom: scale,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingBottom: 218,
          }}>
            <HardwareBoard />
          </div>
        </main>
      )}
    </>
  )
}
