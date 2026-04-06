'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

interface Props {
  onDone: () => void
  screenColor: string
  screenGlow: string
}

const TARGET = 'BOOTING'
const CHARS  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!#$%&@?'
const rand   = () => CHARS[Math.floor(Math.random() * CHARS.length)]

export function LoadingScreen({ onDone, screenColor, screenGlow }: Props) {
  const wrapRef      = useRef<HTMLDivElement>(null)
  const scanRef      = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef      = useRef<HTMLDivElement>(null)
  const onDoneRef    = useRef(onDone)
  onDoneRef.current  = onDone

  useEffect(() => {
    const cont = containerRef.current
    const scan = scanRef.current
    const wrap = wrapRef.current
    const text = textRef.current
    if (!cont || !scan || !wrap || !text) return

    // Start fully scrambled
    const current = Array.from({ length: TARGET.length }, rand)
    text.textContent = current.join('')
    gsap.set(cont, { rotation: -20, transformOrigin: 'center center' })
    gsap.set(scan, { opacity: 0 })

    // Phase 1: scramble, locking letters left-to-right
    const locked   = new Array(TARGET.length).fill(false)
    let lockedCount = 0
    let frame       = 0
    const FRAMES_PER_LOCK = 4 // lock one letter every 4 ticks (~200ms)

    const scramble = setInterval(() => {
      frame++
      for (let i = 0; i < TARGET.length; i++) {
        current[i] = locked[i] ? TARGET[i] : rand()
      }
      text.textContent = current.join('')

      if (frame % FRAMES_PER_LOCK === 0 && lockedCount < TARGET.length) {
        locked[lockedCount] = true
        lockedCount++
      }

      if (lockedCount === TARGET.length) {
        clearInterval(scramble)
        text.textContent = TARGET
        startScanPhase()
      }
    }, 50)

    function startScanPhase() {
      const totalW = cont!.offsetWidth
      gsap.set(scan, { opacity: 1, left: 0 })

      const tl = gsap.timeline({
        onComplete: () => {
          gsap.to(wrap, {
            opacity: 0, duration: 0.45, ease: 'power1.in',
            onComplete: () => onDoneRef.current(),
          })
        },
      })

      // Scan sweeps across crooked text
      tl.to(scan, { left: totalW, duration: 1.8, ease: 'none' }, 0)

      // First attempt — almost makes it, violently snaps back
      tl.to(cont, { rotation: -2,  duration: 0.3,  ease: 'power3.out' })
      tl.to(cont, { rotation: -17, duration: 0.35, ease: 'elastic.out(1.2, 0.4)' })

      // Dramatic hesitation
      tl.to({}, { duration: 0.35 })

      // Second attempt — full 360 spin, slams straight
      tl.to(cont, { rotation: 360, duration: 0.75, ease: 'power2.inOut' })
      tl.set(cont, { rotation: 0 })

      // Pause then fade
      tl.to({}, { duration: 0.65 })
    }

    return () => {
      clearInterval(scramble)
      gsap.killTweensOf([cont, scan, wrap])
    }
  }, [])

  return (
    <div
      ref={wrapRef}
      style={{
        position: 'absolute', inset: 0, zIndex: 5,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'transparent',
      }}
    >
      <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
        {/* Scan bar */}
        <div
          ref={scanRef}
          style={{
            position: 'absolute', top: -6, bottom: -6, left: 0, width: 2,
            opacity: 0, background: screenColor,
            boxShadow: `0 0 6px 3px ${screenGlow}, 0 0 18px 7px ${screenGlow}`,
            zIndex: 2, pointerEvents: 'none',
          }}
        />
        <div
          ref={textRef}
          style={{
            fontFamily: 'var(--font-jetbrains-mono), "JetBrains Mono", monospace',
            fontSize: '28px', fontWeight: 700, letterSpacing: '0.18em',
            color: screenColor,
            textShadow: `0 0 12px ${screenGlow}, 0 0 32px ${screenGlow}`,
            userSelect: 'none',
          }}
        />
      </div>
    </div>
  )
}
