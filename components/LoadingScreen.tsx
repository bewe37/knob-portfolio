'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

interface Props {
  onDone: () => void
  screenColor: string
  screenGlow: string
}

const TARGET = 'BOOTING'

export function LoadingScreen({ onDone, screenColor, screenGlow }: Props) {
  const wrapRef      = useRef<HTMLDivElement>(null)
  const letterRefs   = useRef<(HTMLSpanElement | null)[]>([])
  const barFillRef   = useRef<HTMLDivElement>(null)
  const pctRef       = useRef<HTMLSpanElement>(null)
  const onDoneRef    = useRef(onDone)
  onDoneRef.current  = onDone

  useEffect(() => {
    const wrap    = wrapRef.current
    const barFill = barFillRef.current
    const pct     = pctRef.current
    if (!wrap || !barFill || !pct) return

    const letters = letterRefs.current
    const len     = TARGET.length

    // Shuffle lock order
    const order = Array.from({ length: len }, (_, i) => i)
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]]
    }

    const locked    = new Array(len).fill(false)
    const intervals: ReturnType<typeof setInterval>[] = []

    // All letters flicker at random phase/speed
    letters.forEach((el, i) => {
      if (!el) return
      el.style.opacity     = '0.08'
      el.style.textShadow  = 'none'
      el.style.color       = screenColor
      el.style.transition  = 'none'

      const tick = 60 + Math.random() * 60      // 60–120ms per letter
      const iv = setInterval(() => {
        if (locked[i]) return
        const on = Math.random() > 0.42
        el.style.opacity    = on ? String(0.12 + Math.random() * 0.45) : '0.05'
        el.style.textShadow = on ? `0 0 8px ${screenGlow}` : 'none'
      }, tick)
      intervals.push(iv)
    })

    // Lock letters one-by-one in shuffled order
    let lockIdx = 0
    const LOCK_DELAY = 370

    const lockTimer = setInterval(() => {
      if (lockIdx >= len) {
        clearInterval(lockTimer)
        // All locked — pause then fade out
        setTimeout(() => {
          gsap.to(wrap, {
            opacity: 0, duration: 0.4, ease: 'power1.in',
            onComplete: () => onDoneRef.current(),
          })
        }, 620)
        return
      }

      const idx = order[lockIdx]
      locked[idx] = true
      const el = letters[idx]

      if (el) {
        // Flash to near-white, then settle to screen color
        el.style.transition = 'none'
        el.style.opacity    = '1'
        el.style.color      = '#ffffff'
        el.style.textShadow = `0 0 6px #fff, 0 0 18px ${screenGlow}, 0 0 40px ${screenGlow}`

        // Settle back to phosphor color after flash
        setTimeout(() => {
          el.style.transition = 'color 0.25s ease, text-shadow 0.35s ease'
          el.style.color      = screenColor
          el.style.textShadow = `0 0 10px ${screenGlow}, 0 0 28px ${screenGlow}`
        }, 80)
      }

      // Progress bar + percentage
      const progress = ((lockIdx + 1) / len) * 100
      gsap.to(barFill, { width: `${progress}%`, duration: 0.28, ease: 'power2.out' })
      pct.textContent = `${Math.round(progress)}%`

      lockIdx++
    }, LOCK_DELAY)

    return () => {
      intervals.forEach(clearInterval)
      clearInterval(lockTimer)
      gsap.killTweensOf([wrap, barFill])
    }
  }, [screenColor, screenGlow])

  return (
    <div
      ref={wrapRef}
      style={{
        position: 'absolute', inset: 0, zIndex: 5,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 18,
      }}
    >
      {/* Letters */}
      <div style={{ display: 'flex', gap: '0.15em' }}>
        {TARGET.split('').map((char, i) => (
          <span
            key={i}
            ref={el => { letterRefs.current[i] = el }}
            style={{
              fontFamily: 'var(--font-jetbrains-mono), "JetBrains Mono", monospace',
              fontSize: 28, fontWeight: 700,
              color: screenColor,
              userSelect: 'none',
              display: 'inline-block',
              minWidth: '0.72em', textAlign: 'center',
            }}
          >
            {char}
          </span>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
        <div style={{
          width: 164, height: 2, borderRadius: 2,
          background: 'rgba(255,255,255,0.10)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div
            ref={barFillRef}
            style={{
              position: 'absolute', left: 0, top: 0, bottom: 0,
              width: '0%', borderRadius: 2,
              background: screenColor,
              boxShadow: `0 0 5px 2px ${screenGlow}`,
            }}
          />
        </div>
        <span
          ref={pctRef}
          style={{
            fontFamily: 'var(--font-jetbrains-mono), monospace',
            fontSize: 10, letterSpacing: '0.12em',
            color: screenColor, opacity: 0.55,
            userSelect: 'none',
          }}
        >
          0%
        </span>
      </div>
    </div>
  )
}
