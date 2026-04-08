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
    if (isDark) {
      document.body.style.backgroundColor = '#07090c'
      document.body.style.backgroundImage = [
        'radial-gradient(ellipse 55% 22% at 50% 0%, rgba(100,120,180,0.13) 0%, transparent 100%)',
        'radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(0,0,0,0.75) 100%)',
        'radial-gradient(ellipse 130% 110% at 50% 44%, #0d1116 0%, #090c10 40%, #050709 100%)',
      ].join(', ')
      document.body.style.backgroundSize = '100% 100%, 100% 100%, 100% 100%'
      document.body.style.backgroundRepeat = 'no-repeat, no-repeat, no-repeat'
    } else {
      document.body.style.backgroundColor = ''
      document.body.style.backgroundImage = ''
      document.body.style.backgroundSize = ''
      document.body.style.backgroundRepeat = ''
    }
  }, [isDark])

  return (
    <>
      {!isMobile && <AsciiBackground isDark={isDark} />}

      {/* Dark mode toggle — top right */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsDark(d => !d)}
        onKeyDown={e => e.key === 'Enter' && setIsDark(d => !d)}
        style={{
          position: 'fixed', top: 18, right: 18, zIndex: 1000,
          display: 'flex', alignItems: 'center', gap: 8,
          cursor: 'pointer', userSelect: 'none',
          padding: '6px 10px 6px 10px',
          borderRadius: 20,
          background: isDark ? 'rgba(18,24,32,0.90)' : 'rgba(200,214,226,0.85)',
          backdropFilter: 'blur(10px)',
          border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(255,255,255,0.65)',
          boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.55)' : '0 2px 8px rgba(0,0,0,0.14)',
          opacity: isOverlay ? 0 : 1,
          pointerEvents: isOverlay ? 'none' : 'auto',
          transition: 'background 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease, opacity 0.2s ease',
        }}
      >
        <span style={{
          fontFamily: 'var(--font-jetbrains-mono), monospace',
          fontSize: 9, letterSpacing: 2,
          color: isDark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.38)',
          textTransform: 'uppercase',
          transition: 'color 0.3s',
        }}>
          {isDark ? 'light' : 'dark'}
        </span>
        <div style={{
          width: 32, height: 16, borderRadius: 8, position: 'relative', flexShrink: 0,
          background: isDark ? '#2e3f56' : '#a8b8c6',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.35)',
          transition: 'background 0.35s ease',
        }}>
          <div style={{
            position: 'absolute', top: 2, left: 2,
            width: 12, height: 12, borderRadius: '50%',
            background: isDark ? '#6090b8' : '#eef3f8',
            transform: isDark ? 'translateX(16px)' : 'translateX(0)',
            transition: 'transform 0.28s cubic-bezier(0.34,1.56,0.64,1), background 0.3s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.28)',
          }} />
        </div>
      </div>

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
            <HardwareBoard isDark={isDark} onOverlayChange={setIsOverlay} />
          </div>
        </main>
      )}
    </>
  )
}
