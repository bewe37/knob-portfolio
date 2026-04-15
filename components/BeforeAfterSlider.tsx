'use client'

import { useRef, useCallback, useEffect } from 'react'
import gsap from 'gsap'

interface BeforeAfterSliderProps {
  before: string
  after: string
  beforeLabel?: string
  afterLabel?: string
  accentColor?: string
}

export default function BeforeAfterSlider({
  before,
  after,
  beforeLabel = 'BEFORE',
  afterLabel  = 'AFTER',
  accentColor = 'rgba(120,200,120,0.9)',
}: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const clipRef      = useRef<HTMLDivElement>(null)
  const handleRef    = useRef<HTMLDivElement>(null)
  const pillRef      = useRef<HTMLDivElement>(null)
  const targetRef    = useRef(0.5)
  const rafRef       = useRef<number | null>(null)
  const dragging     = useRef(false)

  // Smooth spring loop
  useEffect(() => {
    let current = 0.5
    const tick = () => {
      rafRef.current = requestAnimationFrame(tick)
      current += (targetRef.current - current) * 0.14
      const pct = current * 100
      if (clipRef.current)   clipRef.current.style.width  = `${pct}%`
      if (handleRef.current) handleRef.current.style.left = `${pct}%`
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [])

  const setTarget = useCallback((clientX: number) => {
    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    targetRef.current = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
  }, [])

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true
    setTarget(e.clientX)
    gsap.to(pillRef.current, { scale: 1.15, duration: 0.2, ease: 'power2.out' })
    const onMove = (e: MouseEvent) => { if (dragging.current) setTarget(e.clientX) }
    const onUp   = () => {
      dragging.current = false
      gsap.to(pillRef.current, { scale: 1, duration: 0.35, ease: 'elastic.out(1, 0.5)' })
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [setTarget])

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    dragging.current = true
    setTarget(e.touches[0].clientX)
    const onMove = (e: TouchEvent) => { if (dragging.current) setTarget(e.touches[0].clientX) }
    const onEnd  = () => {
      dragging.current = false
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onEnd)
    }
    window.addEventListener('touchmove', onMove)
    window.addEventListener('touchend', onEnd)
  }, [setTarget])

  return (
    <div
      ref={containerRef}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      style={{
        position: 'relative',
        width: '100%',
        containerType: 'inline-size',
        userSelect: 'none',
        cursor: 'col-resize',
        borderRadius: 4,
        overflow: 'hidden',
        border: '1px solid rgba(120,200,120,0.12)',
      }}
    >
      {/* AFTER — base layer */}
      <img src={after} alt="after" draggable={false} style={{ display: 'block', width: '100%', height: 'auto' }} />

      {/* BEFORE — clipped layer */}
      <div
        ref={clipRef}
        style={{ position: 'absolute', inset: 0, width: '50%', overflow: 'hidden', pointerEvents: 'none' }}
      >
        <img src={before} alt="before" draggable={false} style={{ display: 'block', width: '100cqw', maxWidth: 'none', height: 'auto' }} />
      </div>

      {/* Divider */}
      <div
        ref={handleRef}
        style={{
          position: 'absolute', top: 0, bottom: 0, left: '50%',
          width: 1,
          background: `linear-gradient(to bottom, transparent, ${accentColor} 20%, ${accentColor} 80%, transparent)`,
          pointerEvents: 'none',
          filter: `drop-shadow(0 0 4px ${accentColor})`,
        }}
      >
        {/* Handle pill */}
        <div
          ref={pillRef}
          style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(8,10,12,0.92)',
            border: `1px solid ${accentColor}`,
            boxShadow: `0 0 12px ${accentColor}44, 0 2px 8px rgba(0,0,0,0.6)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
            <path d="M4.5 1.5L1.5 5L4.5 8.5" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9.5 1.5L12.5 5L9.5 8.5" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div style={{
        position: 'absolute', top: 10, left: 12,
        fontSize: 8, letterSpacing: 2.5,
        fontFamily: 'var(--font-jetbrains-mono), monospace',
        color: 'rgba(255,255,255,0.45)',
        pointerEvents: 'none',
        textShadow: '0 1px 3px rgba(0,0,0,0.8)',
      }}>
        {beforeLabel}
      </div>
      <div style={{
        position: 'absolute', top: 10, right: 12,
        fontSize: 8, letterSpacing: 2.5,
        fontFamily: 'var(--font-jetbrains-mono), monospace',
        color: 'rgba(255,255,255,0.45)',
        pointerEvents: 'none',
        textShadow: '0 1px 3px rgba(0,0,0,0.8)',
      }}>
        {afterLabel}
      </div>
    </div>
  )
}
