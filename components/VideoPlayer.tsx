'use client'

import { useRef, useState, useEffect, useCallback } from 'react'

interface VideoPlayerProps {
  src: string
  accentColor: string
  accentRGB: string
  onClose: () => void
}

function formatTime(s: number): string {
  if (!isFinite(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

export default function VideoPlayer({ src, accentColor, accentRGB, onClose }: VideoPlayerProps) {
  const videoRef    = useRef<HTMLVideoElement>(null)
  const fillRef     = useRef<HTMLDivElement>(null)
  const thumbRef    = useRef<HTMLDivElement>(null)
  const timeRef     = useRef<HTMLSpanElement>(null)

  const [playing, setPlaying] = useState(true)
  const [muted,   setMuted]   = useState(false)
  const [showControls, setShowControls] = useState(true)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const faint  = `rgba(${accentRGB},0.15)`
  const dim    = `rgba(${accentRGB},0.6)`
  const bright = accentColor

  // Update scrubber + time display directly on the DOM — no re-render
  const rafRef = useRef<number | null>(null)
  const tick = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    const pct = v.duration ? (v.currentTime / v.duration) * 100 : 0
    if (fillRef.current)  fillRef.current.style.width  = `${pct}%`
    if (thumbRef.current) thumbRef.current.style.left  = `${pct}%`
    if (timeRef.current)  timeRef.current.textContent  =
      `${formatTime(v.currentTime)} / ${formatTime(v.duration)}`
    rafRef.current = requestAnimationFrame(tick)
  }, [])

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [tick])

  const resetHideTimer = useCallback(() => {
    setShowControls(true)
    if (hideTimer.current) clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setShowControls(false), 2800)
  }, [])

  useEffect(() => {
    resetHideTimer()
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current) }
  }, [resetHideTimer])

  const togglePlay = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) { v.play(); setPlaying(true) }
    else          { v.pause(); setPlaying(false) }
    resetHideTimer()
  }, [resetHideTimer])

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === ' ' || e.key === 'k') { e.preventDefault(); togglePlay() }
      if (e.key === 'm') { setMuted(m => { if (videoRef.current) videoRef.current.muted = !m; return !m }) }
      if (e.key === 'ArrowRight') { if (videoRef.current) videoRef.current.currentTime += 5 }
      if (e.key === 'ArrowLeft')  { if (videoRef.current) videoRef.current.currentTime -= 5 }
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose, togglePlay])

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current
    if (!v || !v.duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    v.currentTime = ((e.clientX - rect.left) / rect.width) * v.duration
    resetHideTimer()
  }

  return (
    <div
      onMouseMove={resetHideTimer}
      onClick={e => e.stopPropagation()}
      style={{
        position: 'relative',
        maxWidth: '90vw',
        maxHeight: '88vh',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 8,
        overflow: 'hidden',
        boxShadow: `0 0 0 1px ${faint}, 0 40px 100px rgba(0,0,0,0.9), 0 0 60px rgba(${accentRGB},0.06)`,
      }}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={src}
        autoPlay
        playsInline
        muted={muted}
        onEnded={() => setPlaying(false)}
        onClick={togglePlay}
        style={{ display: 'block', maxWidth: '90vw', maxHeight: 'calc(88vh - 48px)', cursor: 'pointer' }}
      />

      {/* Controls bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          padding: '28px 14px 12px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          opacity: showControls ? 1 : 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: showControls ? 'auto' : 'none',
          fontFamily: 'var(--font-jetbrains-mono), monospace',
        }}
      >
        {/* Scrubber */}
        <div
          onClick={seek}
          style={{
            height: 3,
            background: faint,
            borderRadius: 2,
            cursor: 'pointer',
            position: 'relative',
          }}
        >
          <div ref={fillRef} style={{
            position: 'absolute', top: 0, left: 0, bottom: 0,
            width: '0%',
            background: bright,
            borderRadius: 2,
            boxShadow: `0 0 6px ${bright}`,
          }} />
          <div ref={thumbRef} style={{
            position: 'absolute', top: '50%', left: '0%',
            transform: 'translate(-50%, -50%)',
            width: 10, height: 10,
            borderRadius: '50%',
            background: bright,
            boxShadow: `0 0 8px ${bright}`,
          }} />
        </div>

        {/* Bottom row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            style={{
              background: 'none', border: 'none', padding: 0,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 24, height: 24,
            }}
          >
            {playing ? <PauseIcon color={bright} /> : <PlayIcon color={bright} />}
          </button>

          {/* Mute */}
          <button
            onClick={() => { setMuted(m => { if (videoRef.current) videoRef.current.muted = !m; return !m }); resetHideTimer() }}
            style={{
              background: 'none', border: 'none', padding: 0,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 22, height: 22,
            }}
          >
            {muted ? <MuteIcon color={dim} /> : <SoundIcon color={bright} />}
          </button>

          {/* Time — updated directly via ref */}
          <span ref={timeRef} style={{ fontSize: 9, letterSpacing: 1.5, color: dim, userSelect: 'none' }}>
            0:00 / 0:00
          </span>
        </div>
      </div>

      {/* Centre play overlay when paused */}
      {!playing && (
        <div
          onClick={togglePlay}
          style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <div style={{
            width: 52, height: 52,
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.6)',
            border: `1px solid ${faint}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <PlayIcon color={bright} size={20} />
          </div>
        </div>
      )}
    </div>
  )
}

function PlayIcon({ color, size = 14 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <polygon points="3,1 15,8 3,15" fill={color} />
    </svg>
  )
}

function PauseIcon({ color, size = 14 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="2" y="1" width="4.5" height="14" rx="1" fill={color} />
      <rect x="9.5" y="1" width="4.5" height="14" rx="1" fill={color} />
    </svg>
  )
}

function SoundIcon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <polygon points="1,5 5,5 9,2 9,14 5,11 1,11" fill={color} />
      <path d="M11 5.5 C12.5 6.5 12.5 9.5 11 10.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M12.5 3.5 C15 5 15 11 12.5 12.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </svg>
  )
}

function MuteIcon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <polygon points="1,5 5,5 9,2 9,14 5,11 1,11" fill={color} />
      <line x1="11" y1="6" x2="15" y2="10" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="15" y1="6" x2="11" y2="10" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}
