'use client'

import { useRef, useEffect, useCallback } from 'react'
import gsap from 'gsap'

const BALL_R    = 5.5
const CONNECTOR = 6
const LINK_UNIT = BALL_R * 2 + CONNECTOR
const NUM_BALLS = 6
const CHAIN_W   = BALL_R * 2 + 6
const CHAIN_H   = NUM_BALLS * LINK_UNIT + BALL_R * 2
const FIGURE_PX = 96

export default function SmiskiKeychain() {
  const swingRef   = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const lastX      = useRef(0)
  const velX       = useRef(0)
  const idleTl     = useRef<gsap.core.Timeline | null>(null)

  // ── Idle pendulum ───────────────────────────────────────────
  const startIdle = useCallback(() => {
    if (!swingRef.current) return
    gsap.set(swingRef.current, { transformOrigin: '50% 0px' })
    idleTl.current = gsap.timeline({ repeat: -1 })
    idleTl.current
      .to(swingRef.current, { rotation:  7, duration: 2.4, ease: 'sine.inOut' })
      .to(swingRef.current, { rotation: -7, duration: 2.4, ease: 'sine.inOut' })
      .to(swingRef.current, { rotation:  0, duration: 1.5, ease: 'sine.inOut' })
      .to(swingRef.current, { rotation:  0, duration: 2.0 })
  }, [])

  const stopIdle = useCallback(() => {
    idleTl.current?.kill()
    idleTl.current = null
    gsap.killTweensOf(swingRef.current)
  }, [])

  useEffect(() => {
    startIdle()
    return () => { idleTl.current?.kill() }
  }, [startIdle])

  // ── Drag to swing ───────────────────────────────────────────
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    stopIdle()
    isDragging.current = true
    lastX.current = e.clientX
    velX.current  = 0
    swingRef.current!.setPointerCapture(e.pointerId)
  }, [stopIdle])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current || !swingRef.current) return
    const dx = e.clientX - lastX.current
    velX.current  = dx
    lastX.current = e.clientX
    const cur  = gsap.getProperty(swingRef.current, 'rotation') as number
    const next = Math.max(-42, Math.min(42, cur - dx * 0.4))
    gsap.set(swingRef.current, { rotation: next, transformOrigin: '50% 0px' })
  }, [])

  const onPointerUp = useCallback(() => {
    if (!isDragging.current) return
    isDragging.current = false
    const vel  = velX.current
    const cur  = gsap.getProperty(swingRef.current!, 'rotation') as number
    const flung = Math.max(-42, Math.min(42, cur - vel * 3.5))
    gsap.to(swingRef.current, {
      rotation: flung, duration: 0.22, ease: 'power2.out',
      transformOrigin: '50% 0px',
      onComplete: () => gsap.to(swingRef.current, {
        rotation: 0, duration: 1.8, ease: 'elastic.out(1, 0.32)',
        transformOrigin: '50% 0px',
        onComplete: startIdle,
      }),
    })
  }, [startIdle])

  return (
    <div style={{
      position: 'absolute',
      top: '100%',
      right: 80,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      zIndex: 10,
      pointerEvents: 'none',
    }}>
      {/* Mounting nub */}
      <div style={{
        width: 14, height: 14,
        borderRadius: '50%',
        marginTop: -5,
        flexShrink: 0,
        background: 'linear-gradient(145deg, #4e5862 0%, #252c34 100%)',
        boxShadow: '0 2px 6px rgba(0,0,0,0.75), inset 0 1px 2px rgba(255,255,255,0.18)',
      }} />

      {/* Swingable part — chain + figure as one unit */}
      <div
        ref={swingRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          cursor: 'grab',
          userSelect: 'none',
          touchAction: 'none',
          pointerEvents: 'auto',
        }}
      >
        {/* Chain SVG */}
        <svg
          width={CHAIN_W}
          height={CHAIN_H}
          viewBox={`0 0 ${CHAIN_W} ${CHAIN_H}`}
          overflow="visible"
          style={{ display: 'block' }}
        >
          <defs>
            <radialGradient id="sk-ball" cx="32%" cy="28%" r="68%">
              <stop offset="0%"   stopColor="#e2ddd2"/>
              <stop offset="38%"  stopColor="#aaa49a"/>
              <stop offset="75%"  stopColor="#787068"/>
              <stop offset="100%" stopColor="#504a42"/>
            </radialGradient>
            <linearGradient id="sk-conn" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#5c5850"/>
              <stop offset="45%"  stopColor="#a8a49c"/>
              <stop offset="100%" stopColor="#5c5850"/>
            </linearGradient>
          </defs>

          {Array.from({ length: NUM_BALLS }).map((_, i) => {
            const cx = CHAIN_W / 2
            const cy = i * LINK_UNIT + BALL_R + 2
            return (
              <g key={i}>
                {/* Connector — draw for ALL balls including last, so chain extends to figure */}
                <rect
                  x={cx - 2} y={cy + BALL_R - 1}
                  width={4}  height={CONNECTOR + 2}
                  rx={1.5}   fill="url(#sk-conn)"
                />
                <circle cx={cx} cy={cy} r={BALL_R} fill="url(#sk-ball)"/>
                <circle cx={cx - 2} cy={cy - 2} r={1.6} fill="rgba(255,255,255,0.60)"/>
              </g>
            )
          })}
        </svg>

        {/* Smiski — negative margin closes the gap entirely */}
        <img
          src="/smik.png"
          alt="Smiski"
          style={{
            width: FIGURE_PX,
            display: 'block',
            marginTop: -(CONNECTOR + BALL_R + 4),
            filter: 'saturate(1.8) contrast(1.05)',
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  )
}
