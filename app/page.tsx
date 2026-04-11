'use client'

import { useState, useEffect } from 'react'
import HardwareBoard from '@/components/HardwareBoard'
import MobileView from '@/components/MobileView'
import AsciiBackground from '@/components/AsciiBackground'

const BOARD_W = 920
const BOARD_H = 858
const MOBILE_BP = 768

export default function Home() {
  const [isMobile,    setIsMobile]    = useState(false)
  const [scale,       setScale]       = useState(1)
  const [isDark,      setIsDark]      = useState(false)
  const [isOverlay,   setIsOverlay]   = useState(false)

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

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  return (
    <>
      {/* Dark mode overlay — fades over the light body background */}
      {!isMobile && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
          background: [
            'radial-gradient(ellipse 55% 22% at 50% 0%, rgba(100,120,180,0.13) 0%, transparent 100%)',
            'radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(0,0,0,0.75) 100%)',
            'radial-gradient(ellipse 130% 110% at 50% 44%, #0d1116 0%, #090c10 40%, #050709 100%)',
          ].join(', '),
          opacity: isDark ? 1 : 0,
          transition: 'opacity 0.7s ease',
        }} />
      )}

      {!isMobile && <AsciiBackground isDark={isDark} />}


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
            <HardwareBoard isDark={isDark} onOverlayChange={setIsOverlay} onDarkToggle={() => setIsDark(d => !d)} />
          </div>
        </main>
      )}
    </>
  )
}
