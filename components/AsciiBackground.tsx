'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

const LEVELS       = [' ', '.', ':', '+', '=', 'x', 'o', '#', '@']
const CELL         = 18
const TARGET_FPS   = 20
const FRAME_MS     = 1000 / TARGET_FPS
const BASE_OPACITY = 0.05
const PEAK_OPACITY = 0.68
const MOUSE_RADIUS = 140
const DECAY        = 0.91        // slower decay — trails linger longer
const MAX_EMBERS   = 20

interface Ember {
  x: number; y: number; size: number; opacity: number
  speed: number; wobble: number; wobblePhase: number; hue: number
}

interface Ripple {
  x: number; y: number; r: number; maxR: number; speed: number
}

export default function AsciiBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let cols = 0, rows = 0
    let heat: Float32Array
    let base: Uint8Array
    let mouse       = { x: -9999, y: -9999 }
    let frameTime   = 0
    const videoMode = { t: 0 }
    const embers: Ember[]  = []
    const ripples: Ripple[] = []

    const img = new Image()
    img.src = '/bgimage.jpg'

    function spawnEmber() {
      if (embers.length >= MAX_EMBERS) return
      embers.push({
        x: Math.random() * canvas!.width, y: canvas!.height + 8,
        size: 0.6 + Math.random() * 2.8, opacity: 0,
        speed: 0.55 + Math.random() * 1.9,
        wobble: 12 + Math.random() * 30,
        wobblePhase: Math.random() * Math.PI * 2,
        hue: 18 + Math.random() * 30,
      })
      const e = embers[embers.length - 1]
      const life = 3.5 + Math.random() * 4
      gsap.timeline()
        .to(e, { opacity: 0.55 + Math.random() * 0.45, duration: 0.4, ease: 'power1.out' })
        .to(e, { opacity: 0, duration: life, ease: 'power2.in' })
        .call(() => { const i = embers.indexOf(e); if (i !== -1) embers.splice(i, 1) })
    }

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
      cols = Math.ceil(canvas.width  / CELL) + 1
      rows = Math.ceil(canvas.height / CELL) + 1
      const n = cols * rows
      heat = new Float32Array(n)
      base = new Uint8Array(n)
      for (let i = 0; i < n; i++) base[i] = Math.random() < 0.5 ? 0 : 1
      ctx.font         = `${Math.round(CELL * 0.75)}px "JetBrains Mono", monospace`
      ctx.textAlign    = 'center'
      ctx.textBaseline = 'middle'
    }

    const onMove  = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY }
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999 }

    const onClick = (e: MouseEvent) => {
      ripples.push({
        x: e.clientX, y: e.clientY,
        r: 0, maxR: Math.hypot(canvas.width, canvas.height) * 0.72,
        speed: 320,
      })
    }

    let raf: number
    let lastSpawn = 0

    const render = (timestamp: number) => {
      raf = requestAnimationFrame(render)

      const elapsed = timestamp - frameTime
      if (elapsed < FRAME_MS) return
      const dt = Math.min(elapsed, 50)
      frameTime = timestamp

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const t = videoMode.t

      // ── Video mode ──────────────────────────────────────────
      if (t > 0 && img.complete) {
        ctx.save()
        ctx.globalAlpha = t
        ctx.filter = 'brightness(0.68) sepia(0.35) contrast(1.06)'
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        ctx.filter = 'none'

        ctx.globalAlpha = t * 0.22
        ctx.fillStyle   = 'rgba(160,80,18,1)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        const vgr = ctx.createRadialGradient(
          canvas.width * 0.5, canvas.height * 0.52, 0,
          canvas.width * 0.5, canvas.height * 0.52, Math.hypot(canvas.width, canvas.height) * 0.58
        )
        vgr.addColorStop(0, 'rgba(60,25,5,0)')
        vgr.addColorStop(0.5, 'rgba(12,6,2,0.18)')
        vgr.addColorStop(1, 'rgba(4,2,1,0.72)')
        ctx.globalAlpha = t
        ctx.fillStyle   = vgr
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.globalAlpha = 1
        ctx.restore()

        if (timestamp - lastSpawn > (120 - t * 80)) { spawnEmber(); lastSpawn = timestamp }

        for (const e of embers) {
          e.y -= e.speed * (dt / 16)
          e.x += Math.sin(timestamp * 0.001 + e.wobblePhase) * e.wobble * (dt / 800)
          if (e.opacity < 0.01) continue
          const glow = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.size * 3.5)
          glow.addColorStop(0,   `hsla(${e.hue}, 95%, 70%, ${e.opacity})`)
          glow.addColorStop(0.4, `hsla(${e.hue + 8}, 90%, 55%, ${e.opacity * 0.55})`)
          glow.addColorStop(1,   `hsla(${e.hue + 15}, 80%, 40%, 0)`)
          ctx.save()
          ctx.globalAlpha = t
          ctx.beginPath(); ctx.arc(e.x, e.y, e.size * 3.5, 0, Math.PI * 2)
          ctx.fillStyle = glow; ctx.fill()
          ctx.globalAlpha = t * e.opacity
          ctx.beginPath(); ctx.arc(e.x, e.y, e.size * 0.7, 0, Math.PI * 2)
          ctx.fillStyle = `hsl(${e.hue - 5}, 100%, 88%)`; ctx.fill()
          ctx.restore()
        }
      }

      // ── ASCII layer ─────────────────────────────────────────
      if (t < 1) {
        const alpha1t = 1 - t

        // ── Process ripples → heat cells at the wavefront ──
        for (let i = ripples.length - 1; i >= 0; i--) {
          const rip = ripples[i]
          rip.r += rip.speed * (dt / 1000)
          if (rip.r > rip.maxR) { ripples.splice(i, 1); continue }

          const bandW = CELL * 2.2
          const col0 = Math.max(0, ((rip.x - rip.r - bandW) / CELL) | 0)
          const col1 = Math.min(cols - 1, Math.ceil((rip.x + rip.r + bandW) / CELL))
          const row0 = Math.max(0, ((rip.y - rip.r - bandW) / CELL) | 0)
          const row1 = Math.min(rows - 1, Math.ceil((rip.y + rip.r + bandW) / CELL))

          for (let row = row0; row <= row1; row++) {
            for (let col = col0; col <= col1; col++) {
              const cx   = col * CELL + CELL / 2
              const cy   = row * CELL + CELL / 2
              const dist = Math.hypot(cx - rip.x, cy - rip.y)
              const diff = Math.abs(dist - rip.r)
              if (diff < bandW) {
                const strength = (1 - diff / bandW) * (1 - rip.r / rip.maxR) * 1.1
                const idx = row * cols + col
                if (strength > heat[idx]) heat[idx] = strength
              }
            }
          }
        }

        // ── Mouse heat ──────────────────────────────────────
        const mcol = (mouse.x / CELL) | 0
        const mrow = (mouse.y / CELL) | 0
        const rad  = Math.ceil(MOUSE_RADIUS / CELL)

        for (let r = Math.max(0, mrow - rad); r <= Math.min(rows - 1, mrow + rad); r++) {
          for (let c = Math.max(0, mcol - rad); c <= Math.min(cols - 1, mcol + rad); c++) {
            const idx  = r * cols + c
            const cx   = c * CELL + CELL / 2
            const cy   = r * CELL + CELL / 2
            const dist = Math.hypot(cx - mouse.x, cy - mouse.y)
            if (dist < MOUSE_RADIUS) {
              const v = 1 - dist / MOUSE_RADIUS
              if (v > heat[idx]) heat[idx] = v
            }
          }
        }

        // ── Decay ───────────────────────────────────────────
        for (let i = 0; i < heat.length; i++) {
          if (heat[i] > 0.001) heat[i] *= DECAY
          else heat[i] = 0
        }

        // ── Pass 1: cold cells ──────────────────────────────
        ctx.fillStyle = `rgba(80,100,115,${BASE_OPACITY * alpha1t})`
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            if (heat[r * cols + c] > 0.01) continue
            ctx.fillText(LEVELS[base[r * cols + c]], c * CELL + CELL / 2, r * CELL + CELL / 2)
          }
        }

        // ── Pass 2: hot cells ───────────────────────────────
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const idx = r * cols + c
            const h   = heat[idx]
            if (h <= 0.01) continue
            const a       = (BASE_OPACITY + h * (PEAK_OPACITY - BASE_OPACITY)) * alpha1t
            const charIdx = Math.min(LEVELS.length - 1, base[idx] + Math.round(h * (LEVELS.length - 2)))
            ctx.fillStyle = `rgba(80,100,115,${a})`
            ctx.fillText(LEVELS[charIdx], c * CELL + CELL / 2, r * CELL + CELL / 2)
          }
        }
      }
    }

    const onVideoActive   = () => { gsap.killTweensOf(videoMode); gsap.to(videoMode, { t: 1, duration: 2.5, ease: 'power2.inOut' }) }
    const onVideoInactive = () => {
      gsap.killTweensOf(videoMode); gsap.to(videoMode, { t: 0, duration: 1.5, ease: 'power2.inOut' })
      for (const e of embers) gsap.killTweensOf(e); embers.length = 0
    }

    resize()
    window.addEventListener('resize',         resize)
    window.addEventListener('mousemove',      onMove)
    window.addEventListener('mouseleave',     onLeave)
    window.addEventListener('click',          onClick)
    window.addEventListener('video-active',   onVideoActive)
    window.addEventListener('video-inactive', onVideoInactive)
    raf = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(raf)
      gsap.killTweensOf(videoMode)
      for (const e of embers) gsap.killTweensOf(e)
      window.removeEventListener('resize',         resize)
      window.removeEventListener('mousemove',      onMove)
      window.removeEventListener('mouseleave',     onLeave)
      window.removeEventListener('click',          onClick)
      window.removeEventListener('video-active',   onVideoActive)
      window.removeEventListener('video-inactive', onVideoInactive)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}
    />
  )
}
