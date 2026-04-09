'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import gsap from 'gsap'
import PCBView from './PCBView'
import { LoadingScreen } from './LoadingScreen'
import SmiskiKeychain from './SmiskiKeychain'
import { SECTIONS, SECTION_DETAILS } from '@/lib/portfolioData'


// ── Video URLs ──
const VIDEO_HOWLS = '/HowlsVideo.mp4'
const VIDEO_PONYO = '/Ponyoo.mp4'

const NUM          = SECTIONS.length
const TOTAL_ARC    = 240
const STEP         = TOTAL_ARC / (NUM - 1)   // 60° per position
const START_OFFSET = -120                     // arc: -120° → +120°

// ── Draw concentric machined-metal rings onto a canvas ────
function drawMetalKnob(canvas: HTMLCanvasElement, isDark = false) {
  const SIZE = 160
  canvas.width  = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const cx = SIZE / 2, cy = SIZE / 2, r = SIZE / 2

  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, r - 0.5, 0, Math.PI * 2)
  ctx.clip()

  // Base — clear gunmetal gray, centered radial lighting
  const base = ctx.createRadialGradient(cx * 0.72, cy * 0.65, 0, cx, cy, r)
  base.addColorStop(0,   isDark ? '#8a8a94' : '#aaaab4')  // neutral highlight
  base.addColorStop(0.28,isDark ? '#606068' : '#808088')  // mid neutral
  base.addColorStop(0.62,isDark ? '#3a3a42' : '#545460')  // deep neutral
  base.addColorStop(1,   isDark ? '#1a1a20' : '#2e2e36')  // near-black rim
  ctx.fillStyle = base
  ctx.fillRect(0, 0, SIZE, SIZE)

  // Circular spin texture — lathe-turned concentric bands
  for (let ring = 1; ring < r - 1; ring += 1.0) {
    const t     = ring / r
    const band  = Math.sin(ring * 3.8) * 22 + Math.sin(ring * 8.4) * 7
    const base_b = 138 + (1 - t) * 32
    const ch    = Math.round(base_b + band)
    const a     = 0.14 + (1 - t) * 0.10
    ctx.strokeStyle = `rgba(${ch - 5},${ch},${ch + 6},${a})`
    ctx.lineWidth   = 0.65
    ctx.beginPath()
    ctx.arc(cx, cy, ring, 0, Math.PI * 2)
    ctx.stroke()
  }

  // Edge vignette — convex cylinder depth falloff
  const edge = ctx.createRadialGradient(cx, cy, r * 0.42, cx, cy, r)
  edge.addColorStop(0,   'transparent')
  edge.addColorStop(0.60,'rgba(0,0,0,0.14)')
  edge.addColorStop(1,   'rgba(0,0,0,0.70)')
  ctx.fillStyle = edge
  ctx.fillRect(0, 0, SIZE, SIZE)

  // Specular — cool blue-white catchlight across the spin texture
  const spec = ctx.createLinearGradient(cx * 0.38, cy * 0.32, cx * 1.30, cy * 1.38)
  spec.addColorStop(0,   'rgba(190,215,240,0.18)')
  spec.addColorStop(0.32,'rgba(190,215,240,0.05)')
  spec.addColorStop(1,   'transparent')
  ctx.fillStyle = spec
  ctx.fillRect(0, 0, SIZE, SIZE)

  ctx.restore()
}

// ── CRT WebGL overlay ─────────────────────────────────────
function initCRT(canvas: HTMLCanvasElement): (() => void) | null {
  const glRaw = canvas.getContext('webgl', { alpha: true })
  if (!glRaw) return null
  const gl = glRaw

  const vs = `
    attribute vec2 position; varying vec2 vUv;
    void main() { vUv = position * 0.5 + 0.5; vUv.y = 1.0 - vUv.y; gl_Position = vec4(position, 0.0, 1.0); }
  `
  const fs = `
    precision highp float;
    varying vec2 vUv; uniform float uTime; uniform vec2 uRes;
    float rand(vec2 n) { return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453); }
    void main() {
      vec2 uv = vUv;
      vec2 curve = uv - 0.5; float dist = length(curve);
      uv += curve * (dist * dist) * 0.1;
      if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) { gl_FragColor = vec4(0.0); return; }
      float scanline = sin(uv.y * uRes.y * 0.8 - uTime * 5.0) * 0.04;
      float noise    = (rand(uv * uTime) - 0.5) * 0.05;
      float vignette = 1.0 - smoothstep(0.35, 1.0, dist);
      gl_FragColor   = vec4(vec3(scanline + noise) * vignette, vignette * 0.8);
    }
  `
  function mkS(type: number, src: string) {
    const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); return s
  }
  const prog = gl.createProgram()!
  gl.attachShader(prog, mkS(gl.VERTEX_SHADER, vs))
  gl.attachShader(prog, mkS(gl.FRAGMENT_SHADER, fs))
  gl.linkProgram(prog); gl.useProgram(prog)
  const buf = gl.createBuffer()!
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW)
  const pos = gl.getAttribLocation(prog, 'position')
  gl.enableVertexAttribArray(pos); gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0)
  const tL = gl.getUniformLocation(prog, 'uTime')
  const rL = gl.getUniformLocation(prog, 'uRes')
  let raf: number; const t0 = performance.now()
  function render() {
    const w = canvas.clientWidth, h = canvas.clientHeight
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0,0,w,h) }
    const t = (performance.now() - t0) / 1000
    gl.uniform1f(tL, t); gl.uniform2f(rL, canvas.width, canvas.height)
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE)
    gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLES, 0, 6)
    raf = requestAnimationFrame(render)
  }
  raf = requestAnimationFrame(render)
  return () => cancelAnimationFrame(raf)
}

// ── Corner bolt ───────────────────────────────────────────
const Bolt = React.forwardRef<HTMLDivElement, { style: React.CSSProperties; onClick?: () => void; active?: boolean }>(
  function Bolt({ style, onClick, active }, ref) {
    return (
      <div
        ref={ref}
        onClick={onClick}
        title={active ? 'Bolt loosened' : 'Click to loosen'}
        style={{
          position: 'absolute', width: 22, height: 22, borderRadius: '50%',
          /* Chrome base — light top-left, dark bottom-right */
          background: 'linear-gradient(140deg, #d4d9de 0%, #9aa0a8 32%, #636c75 62%, #3e474f 100%)',
          boxShadow: '2px 4px 10px rgba(0,0,0,0.85), inset 0 1px 2px rgba(255,255,255,0.6), inset 0 -1px 2px rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          overflow: 'hidden',
          ...style,
        }}
      >
        {/* Radial brush marks — machined surface texture */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: `repeating-conic-gradient(
            from 0deg,
            rgba(255,255,255,0.07) 0deg 1.5deg,
            rgba(0,0,0,0.06)      1.5deg 3deg
          )`,
          pointerEvents: 'none',
        }} />
        {/* Slot — horizontal + vertical */}
        <div style={{ position: 'relative', width: 9, height: 9, zIndex: 1 }}>
          <div style={{ position:'absolute', top:'50%', left:0, right:0, height:1.5, marginTop:-0.75, background:'rgba(20,26,32,0.75)', borderRadius:1, boxShadow:'0 0.5px 0 rgba(255,255,255,0.22)' }} />
          <div style={{ position:'absolute', left:'50%', top:0, bottom:0, width:1.5, marginLeft:-0.75, background:'rgba(20,26,32,0.75)', borderRadius:1, boxShadow:'0.5px 0 0 rgba(255,255,255,0.22)' }} />
        </div>
      </div>
    )
  }
)

// ── Component ─────────────────────────────────────────────
export default function HardwareBoard({ isDark = false, onOverlayChange }: { isDark?: boolean; onOverlayChange?: (open: boolean) => void }) {
  const [activeIndex,   setActiveIndex]   = useState(0)
  const [phosphorGreen, setPhosphorGreen] = useState(true)
  const [isZoomed,      setIsZoomed]      = useState(false)
  const [clickedBolts,  setClickedBolts]  = useState<Set<string>>(new Set())
  const boltRefs = useRef<Record<string, HTMLDivElement | null>>({ tl: null, tr: null, bl: null, br: null })
  const [showPCB,       setShowPCB]       = useState(false)
  const [sdCard,        setSdCard]        = useState<'ponyo' | 'howls' | null>(null)
  const [torontoTime,   setTorontoTime]   = useState('')
  const [showDog,       setShowDog]       = useState(false)
  const [dogFrame,      setDogFrame]      = useState(0)
  const [dogMode,       setDogMode]       = useState<'walk'|'jump'>('walk')
  const [isPoweredOn,       setIsPoweredOn]       = useState(false)
  const [bootingUp,         setBootingUp]         = useState(false)
  const [isPolaroidZoomed,  setIsPolaroidZoomed]  = useState(false)
  const [lightboxSrc,       setLightboxSrc]       = useState<string | null>(null)
  const [termLines, setTermLines] = useState<{type:'sys'|'in'|'out'|'err', text:string}[]>([
    {type:'sys', text:'SYS.PORTFOLIO.OS v2.1.0'},
    {type:'sys', text:'ready. type "help" for commands.'},
  ])
  const [termInput, setTermInput] = useState('')

  useEffect(() => {
    onOverlayChange?.(isZoomed || lightboxSrc !== null)
  }, [isZoomed, lightboxSrc, onOverlayChange])
  const [tocVisible,        setTocVisible]        = useState(false)
  const [activeSec,         setActiveSec]         = useState(-1)
  const [unlockedSet,       setUnlockedSet]       = useState<Set<number>>(new Set())
  const [pwInput,           setPwInput]           = useState('')
  const [pwError,           setPwError]           = useState(false)
  const crtScrollableRef = useRef<HTMLDivElement>(null)
  const sectionElsRef    = useRef<(HTMLDivElement | null)[]>([])
  const metaRowsRef      = useRef<HTMLDivElement>(null)
  const tocPanelRef      = useRef<HTMLDivElement>(null)
  const tocContainerRef  = useRef<HTMLDivElement>(null)

  const knobRef        = useRef<HTMLDivElement>(null)
  const rotatorRef     = useRef<HTMLDivElement>(null)
  const metalCanvasRef = useRef<HTMLCanvasElement>(null)
  const isDragging     = useRef(false)
  const startAngleRef  = useRef(0)
  const currentRot     = useRef(START_OFFSET)
  const activeIdxRef   = useRef(0)
  const springTween    = useRef<gsap.core.Tween | null>(null)

  const crtRef           = useRef<HTMLCanvasElement>(null)
  const overlayRef       = useRef<HTMLDivElement>(null)
  const tvCrtRef         = useRef<HTMLDivElement>(null)
  const audioBarsRef     = useRef<(HTMLDivElement | null)[]>([])
  const animKey          = useRef(0)
  const screenBlackoutRef     = useRef<HTMLDivElement>(null)
  const ledRingRef            = useRef<HTMLDivElement>(null)
  const mainScreenBlackoutRef = useRef<HTMLDivElement>(null)
  const isPoweredOnRef        = useRef(false)
  const sdCardRef             = useRef<'ponyo' | 'howls' | null>(null)
  const hasBootedRef          = useRef(false)  // corgi boot plays once only
  const polaroidRef           = useRef<HTMLDivElement>(null)
  const polaroidOverlayRef    = useRef<HTMLDivElement>(null)
  const polaroidCardRef       = useRef<HTMLDivElement>(null)
  const termScrollRef         = useRef<HTMLDivElement>(null)
  const termInputRef          = useRef<HTMLInputElement>(null)

  const screenTextRef     = useRef<HTMLDivElement>(null)
  const screenImgRef      = useRef<HTMLDivElement>(null)
  const screenHoveredRef  = useRef(false)

  // ── Metal canvas — redraw when mode changes
  useEffect(() => {
    if (metalCanvasRef.current) drawMetalKnob(metalCanvasRef.current, isDark)
  }, [isDark])

  // ── Board CRT WebGL
  useEffect(() => {
    if (!crtRef.current) return
    const cleanup = initCRT(crtRef.current)
    return () => cleanup?.()
  }, [])

  // ── Power on/off animations
  useEffect(() => {
    const blackout     = screenBlackoutRef.current
    const mainBlackout = mainScreenBlackoutRef.current
    if (!blackout) return

    if (isPoweredOn) {
      gsap.killTweensOf(blackout)
      if (mainBlackout) gsap.killTweensOf(mainBlackout)
      const tl = gsap.timeline()

      // Both screens start opaque
      tl.set(blackout, { opacity: 1 })
      if (mainBlackout) tl.set(mainBlackout, { opacity: 1 }, '<')

      if (!hasBootedRef.current) {
        // First power-on: only flicker the clock screen — main screen stays black the whole time
        tl.to(blackout, { opacity: 0, duration: 0.07, ease: 'none', repeat: 6, yoyo: true })
        tl.to(blackout, { opacity: 0, duration: 0.15, ease: 'power2.out' })
        // Pause while clock is visible, main stays dark
        tl.to({}, { duration: 0.4 })
        // Mount LoadingScreen, then fade main screen in
        tl.call(() => { hasBootedRef.current = true; setBootingUp(true) })
        tl.to({}, { duration: 0.08 })
        if (mainBlackout) tl.to(mainBlackout, { opacity: 0, duration: 0.35, ease: 'power2.out' })
      } else {
        // Subsequent power-ons: flicker both screens normally
        tl.to(blackout,     { opacity: 0, duration: 0.07, ease: 'none', repeat: 6, yoyo: true })
        if (mainBlackout) tl.to(mainBlackout, { opacity: 0, duration: 0.07, ease: 'none', repeat: 6, yoyo: true }, '<0.05')
        tl.to(blackout,     { opacity: 0, duration: 0.15, ease: 'power2.out' })
        if (mainBlackout) tl.to(mainBlackout, { opacity: 0, duration: 0.15, ease: 'power2.out' }, '<')
      }
    } else {
      // Shut down: kill boot, black out both screens
      setBootingUp(false)
      gsap.killTweensOf(blackout)
      if (mainBlackout) gsap.killTweensOf(mainBlackout)
      gsap.to(blackout,     { opacity: 1, duration: 0.12, ease: 'power2.in' })
      if (mainBlackout) gsap.to(mainBlackout, { opacity: 1, duration: 0.12, ease: 'power2.in' })
      if (activeIdxRef.current === 5) window.dispatchEvent(new Event('video-inactive'))
    }
  }, [isPoweredOn])

  // ── Reset TOC when overlay opens/closes or project changes
  useEffect(() => {
    sectionElsRef.current = []
    setTocVisible(false)
    setActiveSec(-1)
    setPwInput('')
    setPwError(false)
    if (isZoomed) {
      requestAnimationFrame(() => {
        if (tocContainerRef.current && metaRowsRef.current)
          gsap.set(tocContainerRef.current, { height: metaRowsRef.current.scrollHeight })
        if (tocPanelRef.current)
          gsap.set(tocPanelRef.current, { opacity: 0, y: 8 })
      })
    }
  }, [activeIndex, isZoomed])

  // ── GSAP animate between meta ↔ TOC
  useEffect(() => {
    const meta      = metaRowsRef.current
    const toc       = tocPanelRef.current
    const container = tocContainerRef.current
    if (!meta || !toc || !container) return
    if (tocVisible) {
      gsap.to(container, { height: toc.scrollHeight, duration: 0.4, ease: 'power3.inOut' })
      gsap.to(meta, { opacity: 0, y: -8, duration: 0.2, ease: 'power2.in' })
      gsap.to(toc,  { opacity: 1, y: 0,  duration: 0.35, delay: 0.15, ease: 'power3.out' })
    } else {
      gsap.to(container, { height: meta.scrollHeight, duration: 0.4, ease: 'power3.inOut' })
      gsap.to(toc,  { opacity: 0, y: 8,  duration: 0.2, ease: 'power2.in' })
      gsap.to(meta, { opacity: 1, y: 0,  duration: 0.35, delay: 0.15, ease: 'power3.out' })
    }
  }, [tocVisible])

  // ── TOC scroll tracking
  useEffect(() => {
    if (!isZoomed) return
    const el = crtScrollableRef.current
    if (!el) return
    const hasTOC = (details as Record<string,any>).specs?.length > 0
    const onScroll = () => {
      setTocVisible(hasTOC && el.scrollTop > 180)
      // Near bottom → activate last section
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 60) {
        setActiveSec(sectionElsRef.current.length - 1)
        return
      }
      const mid = el.scrollTop + el.clientHeight * 0.4
      let found = -1
      sectionElsRef.current.forEach((secEl, i) => {
        if (secEl && secEl.offsetTop <= mid) found = i
      })
      setActiveSec(found)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [isZoomed, activeIndex])

  const scrollToSection = (i: number) => {
    const container = crtScrollableRef.current
    const el = sectionElsRef.current[i]
    if (!container || !el) return
    container.scrollTo({ top: el.offsetTop - 16, behavior: 'smooth' })
  }

  // ── Toronto clock
  useEffect(() => {
    const tick = () => setTorontoTime(
      new Date().toLocaleTimeString('en-CA', { timeZone: 'America/Toronto', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
    )
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  // ── Pixel dog — walks across every 10s for 4s
  useEffect(() => {
    let outer: ReturnType<typeof setTimeout>
    let inner: ReturnType<typeof setTimeout>
    let frameInterval: ReturnType<typeof setInterval>
    const schedule = () => {
      outer = setTimeout(() => {
        setDogFrame(0)
        setDogMode(Math.random() < 0.5 ? 'walk' : 'jump')
        setShowDog(true)
        frameInterval = setInterval(() => setDogFrame(f => f ^ 1), 220)
        inner = setTimeout(() => {
          setShowDog(false)
          clearInterval(frameInterval)
          schedule()
        }, 4000)
      }, 10000)
    }
    schedule()
    return () => { clearTimeout(outer); clearTimeout(inner); clearInterval(frameInterval) }
  }, [])

  // ── Zoom in animation (runs after overlay mounts)
  useEffect(() => {
    if (!isZoomed || !overlayRef.current || !tvCrtRef.current) return
    gsap.fromTo(overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.3, ease: 'power2.out' }
    )
    gsap.fromTo(tvCrtRef.current,
      { scale: 0.9, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.4, ease: 'power3.out', delay: 0.05 }
    )
  }, [isZoomed])

  // ── Escape key to close overlay or lightbox
  useEffect(() => {
    if (!isZoomed && !lightboxSrc) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (lightboxSrc) setLightboxSrc(null)
      else handleUnzoom()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isZoomed, lightboxSrc]) // eslint-disable-line react-hooks/exhaustive-deps -- handleUnzoom is stable (useCallback [])

  const handleZoom = useCallback(() => {
    if (activeIdxRef.current === 5) return
    if (activeIdxRef.current === SECTIONS.length - 1) return
    setIsZoomed(true)
  }, [])

  const handleUnzoom = useCallback(() => {
    if (!overlayRef.current || !tvCrtRef.current) { setIsZoomed(false); return }
    gsap.to(tvCrtRef.current, { scale: 0.9, opacity: 0, duration: 0.25, ease: 'power2.in' })
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in',
      delay: 0.05,
      onComplete: () => setIsZoomed(false),
    })
  }, [])

  // ── Polaroid hover — fan from bottom-left pivot
  const handlePolaroidEnter = useCallback(() => {
    if (!polaroidRef.current) return
    const cards = polaroidRef.current.querySelectorAll<HTMLDivElement>(':scope > div')
    // back card fans out the most, front stays near upright
    if (cards[0]) gsap.to(cards[0], { rotation: -30, duration: 0.4, ease: 'power2.out' })
    if (cards[1]) gsap.to(cards[1], { rotation: -15, duration: 0.4, ease: 'power2.out', delay: 0.04 })
    if (cards[2]) gsap.to(cards[2], { rotation: 0,   duration: 0.4, ease: 'power2.out', delay: 0.08 })
  }, [])

  const handlePolaroidLeave = useCallback(() => {
    if (!polaroidRef.current) return
    const cards = polaroidRef.current.querySelectorAll<HTMLDivElement>(':scope > div')
    if (cards[0]) gsap.to(cards[0], { rotation: 2, duration: 0.5, ease: 'elastic.out(1, 0.6)', delay: 0.08 })
    if (cards[1]) gsap.to(cards[1], { rotation: 2, duration: 0.5, ease: 'elastic.out(1, 0.6)', delay: 0.04 })
    if (cards[2]) gsap.to(cards[2], { rotation: 2, duration: 0.5, ease: 'elastic.out(1, 0.6)' })
  }, [])

  // ── Screen hover — soft crossfade reveal
  const handleScreenEnter = useCallback(() => {
    const idx = activeIdxRef.current
    if (!isPoweredOnRef.current || idx === 0 || idx === 5) return
    const cover = (SECTION_DETAILS[idx] as Record<string, any>)?.screenCover
    if (!cover) return
    const textEl = screenTextRef.current
    const imgEl  = screenImgRef.current
    if (!textEl || !imgEl) return
    screenHoveredRef.current = true
    gsap.killTweensOf([textEl, imgEl])
    gsap.timeline()
      .to(textEl, { opacity: 0, duration: 0.2, ease: 'power2.inOut' })
      .fromTo(imgEl,
        { opacity: 0, scale: 1.04 },
        { opacity: 1, scale: 1, duration: 0.32, ease: 'power2.out' }, '<0.08')
  }, [])

  const handleScreenLeave = useCallback(() => {
    if (!screenHoveredRef.current) return
    screenHoveredRef.current = false
    const textEl = screenTextRef.current
    const imgEl  = screenImgRef.current
    if (!textEl || !imgEl) return
    gsap.killTweensOf([textEl, imgEl])
    gsap.timeline()
      .to(imgEl,  { opacity: 0, scale: 1.02, duration: 0.2, ease: 'power2.inOut' })
      .set(imgEl, { scale: 1 })
      .to(textEl, { opacity: 1, duration: 0.28, ease: 'power2.out' }, '<0.06')
  }, [])

  // Reset on section change or power-off
  useEffect(() => {
    screenHoveredRef.current = false
    gsap.killTweensOf([screenTextRef.current, screenImgRef.current])
    if (screenTextRef.current) gsap.set(screenTextRef.current, { clearProps: 'opacity' })
    if (screenImgRef.current)  gsap.set(screenImgRef.current,  { opacity: 0, scale: 1 })
  }, [activeIndex])

  useEffect(() => {
    if (!isPoweredOn) {
      screenHoveredRef.current = false
      gsap.killTweensOf([screenTextRef.current, screenImgRef.current])
      if (screenTextRef.current) gsap.set(screenTextRef.current, { clearProps: 'opacity' })
      if (screenImgRef.current)  gsap.set(screenImgRef.current,  { opacity: 0, scale: 1 })
    }
  }, [isPoweredOn])

  // ── Polaroid zoom in
  useEffect(() => {
    if (!isPolaroidZoomed || !polaroidOverlayRef.current || !polaroidCardRef.current) return
    gsap.fromTo(polaroidOverlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.3, ease: 'power2.out' }
    )
    gsap.fromTo(polaroidCardRef.current,
      { scale: 0.82, opacity: 0, y: 24 },
      { scale: 1, opacity: 1, y: 0, duration: 0.45, ease: 'power3.out', delay: 0.05 }
    )
  }, [isPolaroidZoomed])

  // ── Escape closes polaroid zoom
  useEffect(() => {
    if (!isPolaroidZoomed) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handlePolaroidUnzoom() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isPolaroidZoomed]) // eslint-disable-line react-hooks/exhaustive-deps -- handlePolaroidUnzoom is stable (useCallback [])

  const handlePolaroidZoom = useCallback(() => setIsPolaroidZoomed(true), [])

  const handlePolaroidUnzoom = useCallback(() => {
    if (!polaroidOverlayRef.current || !polaroidCardRef.current) { setIsPolaroidZoomed(false); return }
    gsap.to(polaroidCardRef.current, { scale: 0.82, opacity: 0, y: 24, duration: 0.28, ease: 'power2.in' })
    gsap.to(polaroidOverlayRef.current, {
      opacity: 0, duration: 0.3, ease: 'power2.in', delay: 0.06,
      onComplete: () => setIsPolaroidZoomed(false),
    })
  }, [])

  // ── Helpers
  const applyRotation = useCallback((deg: number) => {
    if (!rotatorRef.current) return
    rotatorRef.current.style.transform = `rotate(${deg}deg)`
    rotatorRef.current.style.setProperty('--angle', `${deg}deg`)
  }, [])

  const getPointerAngle = useCallback((e: { clientX: number; clientY: number }) => {
    if (!knobRef.current) return 0
    const rect = knobRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width  / 2
    const cy = rect.top  + rect.height / 2
    return Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI) + 90
  }, [])

  const animateAudioBars = useCallback(() => {
    audioBarsRef.current.forEach(bar => {
      if (!bar) return
      gsap.killTweensOf(bar)
      gsap.to(bar, {
        height: Math.random() * 22 + 4,
        duration: 0.08,
        ease: 'none',
        onComplete: () => { gsap.to(bar, { height: 4, duration: 0.35, ease: 'power2.out' }) },
      })
    })
  }, [])

  // Keep refs in sync so callbacks always read current state
  useEffect(() => { isPoweredOnRef.current = isPoweredOn }, [isPoweredOn])
  useEffect(() => { sdCardRef.current = sdCard }, [sdCard])

  // Fire video-active/inactive when card is inserted or removed while already on section 4
  useEffect(() => {
    if (activeIndex !== 5 || !isPoweredOnRef.current) return
    if (sdCard !== null) {
      window.dispatchEvent(new Event('video-active'))
    } else {
      window.dispatchEvent(new Event('video-inactive'))
    }
  }, [sdCard])

  const changeSection = useCallback((idx: number) => {
    if (!isPoweredOnRef.current) return          // block all actions when off
    if (activeIdxRef.current === idx) return
    const prev = activeIdxRef.current
    activeIdxRef.current = idx
    setActiveIndex(idx)
    animateAudioBars()
    animKey.current++
    if (idx  === 5 && sdCardRef.current !== null) window.dispatchEvent(new Event('video-active'))
    if (prev === 5) window.dispatchEvent(new Event('video-inactive'))
  }, [animateAudioBars])

  const snapToIndex = useCallback((idx: number) => {
    const target = START_OFFSET + idx * STEP
    currentRot.current = target
    springTween.current?.kill()
    const proxy = { angle: parseFloat(rotatorRef.current?.style.getPropertyValue('--angle') ?? `${target}`) }
    springTween.current = gsap.to(proxy, {
      angle: target,
      duration: 0.7,
      ease: 'elastic.out(1, 0.45)',
      onUpdate: () => applyRotation(proxy.angle),
    })
  }, [applyRotation])

  // ── Knob drag
  useEffect(() => {
    const knob = knobRef.current
    if (!knob) return

    applyRotation(START_OFFSET)

    const onDown = (e: MouseEvent) => {
      e.preventDefault()
      isDragging.current = true
      document.body.style.cursor = 'grabbing'
      startAngleRef.current = getPointerAngle(e) - currentRot.current
    }

    const onMove = (e: MouseEvent) => {
      if (!isDragging.current) return
      springTween.current?.kill()
      let newRot = getPointerAngle(e) - startAngleRef.current
      const delta = newRot - currentRot.current
      if (delta >  180) newRot -= 360
      if (delta < -180) newRot += 360
      newRot = Math.max(START_OFFSET - 20, Math.min(START_OFFSET + TOTAL_ARC + 20, newRot))
      currentRot.current = newRot
      applyRotation(newRot)
      const nearest = Math.max(0, Math.min(NUM - 1, Math.round((newRot - START_OFFSET) / STEP)))
      changeSection(nearest)
    }

    const onUp = () => {
      if (!isDragging.current) return
      isDragging.current = false
      document.body.style.cursor = ''
      snapToIndex(activeIdxRef.current)
    }

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      isDragging.current = true
      startAngleRef.current = getPointerAngle(e.touches[0]) - currentRot.current
    }

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging.current) return
      springTween.current?.kill()
      let newRot = getPointerAngle(e.touches[0]) - startAngleRef.current
      const delta = newRot - currentRot.current
      if (delta >  180) newRot -= 360
      if (delta < -180) newRot += 360
      newRot = Math.max(START_OFFSET - 20, Math.min(START_OFFSET + TOTAL_ARC + 20, newRot))
      currentRot.current = newRot
      applyRotation(newRot)
      const nearest = Math.max(0, Math.min(NUM - 1, Math.round((newRot - START_OFFSET) / STEP)))
      changeSection(nearest)
    }

    const onTouchEnd = () => {
      if (!isDragging.current) return
      isDragging.current = false
      snapToIndex(activeIdxRef.current)
    }

    knob.addEventListener('mousedown', onDown)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    knob.addEventListener('touchstart', onTouchStart, { passive: false })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd)

    return () => {
      knob.removeEventListener('mousedown', onDown)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      knob.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [applyRotation, getPointerAngle, changeSection, snapToIndex])

  const section     = SECTIONS[activeIndex]
  const details     = SECTION_DETAILS[activeIndex]
  const screenCover = (details as Record<string, any>)?.screenCover as string | undefined
  const screenColor = phosphorGreen ? '#33ff66' : '#c07e18'
  const screenGlow  = phosphorGreen ? 'rgba(51,255,102,0.28)' : 'rgba(192,126,24,0.25)'

  const handleBootDone = useCallback(() => setBootingUp(false), [])

  const goToSection = useCallback((idx: number) => {
    changeSection(idx)
    snapToIndex(idx)
  }, [changeSection, snapToIndex])

  // ── Terminal auto-scroll
  useEffect(() => {
    if (termScrollRef.current) termScrollRef.current.scrollTop = termScrollRef.current.scrollHeight
  }, [termLines])

  // ── Terminal command handler
  const handleTermSubmit = useCallback((e?: React.KeyboardEvent) => {
    if (e && e.key !== 'Enter') return
    const cmd = termInput.trim().toLowerCase()
    if (!cmd) return

    const next: {type:'sys'|'in'|'out'|'err', text:string}[] = [
      ...termLines,
      { type: 'in', text: `> ${cmd}` },
    ]

    if (cmd === 'help') {
      next.push(
        { type: 'out', text: 'available commands:' },
        { type: 'out', text: '  ls            list all sections' },
        { type: 'out', text: '  open <id>     navigate to section' },
        { type: 'out', text: '  whoami        about bryan' },
        { type: 'out', text: '  contact       contact info' },
        { type: 'out', text: '  photos        open photo gallery' },
        { type: 'out', text: '  clear         clear terminal' },
      )
    } else if (cmd === 'ls') {
      SECTIONS.forEach(s => next.push({ type: 'out', text: `  ${s.id.padEnd(8)} ${s.title}` }))
    } else if (cmd.startsWith('open ')) {
      const id = cmd.slice(5).trim().toUpperCase()
      const idx = SECTIONS.findIndex(s => s.id === id)
      if (idx === -1) {
        next.push({ type: 'err', text: `not found: "${id}". run "ls" to list sections.` })
      } else {
        goToSection(idx)
        next.push({ type: 'out', text: `loading ${SECTIONS[idx].id} — ${SECTIONS[idx].title}` })
      }
    } else if (cmd === 'whoami') {
      next.push(
        { type: 'out', text: 'georgius bryan winata' },
        { type: 'out', text: 'product designer' },
        { type: 'out', text: 'amd · safe software · vosyn' },
        { type: 'out', text: 'based in toronto, on' },
      )
    } else if (cmd === 'contact') {
      next.push(
        { type: 'out', text: 'email     bryanwinata112@gmail.com' },
        { type: 'out', text: 'linkedin  linkedin.com/in/gbryanw' },
        { type: 'out', text: 'x         @gbryanwt' },
      )
    } else if (cmd === 'photos') {
      setIsPolaroidZoomed(true)
      next.push({ type: 'out', text: 'opening photo gallery...' })
    } else if (cmd === 'clear') {
      setTermLines([{ type: 'sys', text: 'terminal cleared.' }])
      setTermInput('')
      return
    } else {
      next.push({ type: 'err', text: `unknown command: "${cmd}". try "help".` })
    }

    setTermLines(next)
    setTermInput('')
  }, [termInput, termLines, goToSection])

  const handleBoltClick = useCallback((id: string) => {
    setClickedBolts(prev => {
      if (prev.has(id)) return prev  // already loosened, ignore

      const el = boltRefs.current[id]
      if (el) {
        // Unscrew: bolt spins CCW and rises out of the surface (scale up = lifting)
        const nudge = { tl: { x:-4, y:-4 }, tr: { x:4, y:-4 }, bl: { x:-4, y:4 }, br: { x:4, y:4 } }[id] ?? { x:0, y:0 }
        gsap.timeline()
          .to(el, { rotation: -200, duration: 0.2, ease: 'power3.in' })
          .to(el, { rotation: -150, scale: 1.18, x: nudge.x, y: nudge.y, duration: 0.38, ease: 'elastic.out(1.2, 0.45)' })
          .to(el, { boxShadow: '0 8px 20px rgba(0,0,0,0.75), inset 0 1px 2px rgba(255,255,255,0.55), inset 0 -1px 2px rgba(0,0,0,0.45)', duration: 0.2 }, '<0.1')
      }

      const next = new Set(prev)
      next.add(id)

      if (next.size === 4) {
        // All loosened — fly off to corners then open PCB
        setTimeout(() => {
          const fly = [
            { id: 'tl', x: -80, y: -80 }, { id: 'tr', x: 80, y: -80 },
            { id: 'bl', x: -80, y: 80 },  { id: 'br', x: 80, y: 80 },
          ]
          fly.forEach(({ id: bid, x, y }, i) => {
            const el = boltRefs.current[bid]
            if (!el) return
            gsap.to(el, { x, y, rotation: '-=540', scale: 0.3, opacity: 0, duration: 0.45, ease: 'power2.in', delay: i * 0.04 })
          })
          setTimeout(() => setShowPCB(true), 350)
        }, 120)
      }

      return next
    })
  }, [])

  const resetBolts = useCallback(() => {
    setClickedBolts(new Set())
    Object.values(boltRefs.current).forEach(el => {
      if (el) gsap.to(el, { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(1.4)' })
    })
  }, [])

  const handlePasswordSubmit = useCallback(() => {
    if (pwInput === (SECTION_DETAILS[activeIndex] as any).password) {
      setUnlockedSet(prev => new Set([...prev, activeIndex]))
      setPwInput('')
      setPwError(false)
    } else {
      setPwError(true)
      setPwInput('')
    }
  }, [pwInput, activeIndex])

  // Modal colors — same phosphor tint as the main CRT screen
  const modalRGB   = phosphorGreen ? '51,255,102' : '192,126,24'
  const amber      = screenColor
  const amberDim   = `rgba(${modalRGB},0.82)`
  const amberFaint = `rgba(${modalRGB},0.14)`
  const amberLabel = `rgba(${modalRGB},0.55)`

  return (
    <div style={{
      width: 920, height: 640,
      background: isDark
        ? 'linear-gradient(175deg, #303034 0%, #262628 22%, #1e1e22 50%, #161618 75%, #101012 100%)'
        : 'linear-gradient(175deg, #565658 0%, #484848 22%, #3c3c40 50%, #323236 75%, #28282c 100%)',
      borderRadius: 24,
      boxShadow: isDark
        ? [
            '0 0 0 1px rgba(255,255,255,0.06)',
            '0 8px 24px rgba(0,0,0,0.55)',
            '20px 32px 60px rgba(0,0,0,0.65)',
            'inset 0 1px 0 rgba(255,255,255,0.14)',
            'inset 0 -1px 0 rgba(0,0,0,0.55)',
            'inset 1px 0 0 rgba(255,255,255,0.05)',
            'inset -1px 0 0 rgba(0,0,0,0.3)',
          ].join(', ')
        : [
            '0 0 0 1px rgba(0,0,0,0.55)',
            '0 6px 18px rgba(0,0,0,0.22)',
            '20px 32px 60px rgba(0,0,0,0.38)',
            'inset 0 1px 0 rgba(255,255,255,0.16)',
            'inset 0 -1px 0 rgba(0,0,0,0.45)',
            'inset 1px 0 0 rgba(255,255,255,0.06)',
            'inset -1px 0 0 rgba(0,0,0,0.25)',
          ].join(', '),
      display: 'grid',
      gridTemplateRows: 'auto 1fr',
      padding: 40,
      gap: 32,
      position: 'relative',
    }}>
      {/* ── Upper catchlight — diffuse overhead light on metal ── */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 24,
        background: 'radial-gradient(ellipse 85% 40% at 50% 0%, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.04) 55%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      {/* ── Left-edge specular — directional light catch ─────── */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 24,
        background: 'linear-gradient(to right, rgba(255,255,255,0.09) 0px, rgba(255,255,255,0.04) 2px, rgba(255,255,255,0.01) 8px, transparent 28px)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      {/* ── Right-edge shadow ────────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 24,
        background: 'linear-gradient(to left, rgba(0,0,0,0.22) 0px, transparent 32px)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      {/* ── Top bevel — machined chamfer ─────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 24,
        background: 'linear-gradient(to bottom, rgba(255,255,255,0.32) 0px, rgba(255,255,255,0.10) 1px, rgba(255,255,255,0.02) 6px, transparent 18px)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      {/* ── Bottom AO ────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 24,
        background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0px, rgba(0,0,0,0.18) 40px, transparent 100px)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      {/* ── Centre spot — slight depth falloff from middle ───── */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 24,
        background: 'radial-gradient(ellipse 70% 60% at 50% 42%, transparent 40%, rgba(0,0,0,0.18) 100%)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      {/* ── Smiski keychain — hangs below bottom-right ──────── */}
      <SmiskiKeychain isDark={isDark} />

      {/* Corner bolts — click all 4 to open housing */}
      <Bolt ref={el => { boltRefs.current.tl = el }} style={{ top: 18, left: 18 }}   active={clickedBolts.has('tl')} onClick={() => handleBoltClick('tl')} />
      <Bolt ref={el => { boltRefs.current.tr = el }} style={{ top: 18, right: 18 }}  active={clickedBolts.has('tr')} onClick={() => handleBoltClick('tr')} />
      <Bolt ref={el => { boltRefs.current.bl = el }} style={{ bottom: 18, left: 18 }}  active={clickedBolts.has('bl')} onClick={() => handleBoltClick('bl')} />
      <Bolt ref={el => { boltRefs.current.br = el }} style={{ bottom: 18, right: 18 }} active={clickedBolts.has('br')} onClick={() => handleBoltClick('br')} />

      {/* ── SCREEN BEZEL ──────────────────────────────────── */}
      <div style={{
        background: isDark
          ? 'linear-gradient(155deg, #181819 0%, #111113 50%, #0a0a0c 100%)'
          : 'linear-gradient(155deg, #323236 0%, #28282c 50%, #202024 100%)',
        borderRadius: 18, padding: 16,
        boxShadow: '0 8px 24px rgba(0,0,0,0.7), 0 2px 6px rgba(0,0,0,0.5), inset 0 2px 8px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.04)',
        position: 'relative',
      }}>
        <div
          className="screen-tv"
          onClick={handleZoom}
          onMouseEnter={handleScreenEnter}
          onMouseLeave={handleScreenLeave}
          style={{
            background: '#090909', height: 260, borderRadius: 10,
            position: 'relative', overflow: 'hidden',
            boxShadow: 'inset 0 12px 28px rgba(0,0,0,0.95), inset 0 0 0 1px rgba(0,0,0,1), 0 0 0 1px rgba(255,255,255,0.04)',
            fontFamily: 'var(--font-jetbrains-mono), monospace',
            color: screenColor, textShadow: `0 0 8px ${screenGlow}`,
            transition: 'color 0.3s, text-shadow 0.3s',
            cursor: 'pointer',
          }}>
          {/* CRT phosphor green haze — simulates active tube */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 'inherit',
            background: 'radial-gradient(ellipse 88% 72% at 50% 52%, rgba(8,88,24,0.13) 0%, rgba(4,52,12,0.07) 58%, transparent 100%)',
            pointerEvents: 'none', zIndex: 1, mixBlendMode: 'screen',
          }} />
          {/* LCD sub-pixel RGB structure — microscopic panel grid */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 'inherit',
            backgroundImage: [
              'repeating-linear-gradient(to right,',
              '  rgba(255,52,52,0.19) 0px,  rgba(255,52,52,0.19) 1px,',
              '  rgba(52,255,52,0.19) 1px,  rgba(52,255,52,0.19) 2px,',
              '  rgba(52,52,255,0.19) 2px,  rgba(52,52,255,0.19) 3px,',
              '  transparent 3px, transparent 4px',
              '),',
              'repeating-linear-gradient(to bottom,',
              '  rgba(0,0,0,0.07) 0px, rgba(0,0,0,0.07) 1px,',
              '  transparent 1px, transparent 3px',
              ')',
            ].join(''),
            pointerEvents: 'none', zIndex: 6,
            mixBlendMode: 'overlay', opacity: 0.60,
          }} />
          {/* Glare */}
          <div style={{
            position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.015) 38%, transparent 39%)',
            pointerEvents: 'none', zIndex: 12, transform: 'rotate(-5deg)',
          }} />
          {/* CRT curvature — edge barrel-darkening + curved-glass arc highlight */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 'inherit',
            background: [
              /* barrel-shadow: darkens all four edges, lightest at centre */
              'radial-gradient(ellipse 90% 80% at 50% 50%, transparent 55%, rgba(0,0,0,0.38) 100%)',
              /* curved-glass arc: a faint bright crescent at the top-centre */
              'radial-gradient(ellipse 60% 28% at 50% -6%, rgba(255,255,255,0.07) 0%, transparent 70%)',
            ].join(', '),
            pointerEvents: 'none', zIndex: 13,
          }} />
          {/* CRT WebGL scanline/noise */}
          <canvas ref={crtRef} style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:10, mixBlendMode:'screen', opacity:0.6 }} />
          {/* Flicker overlay */}
          <div className="board-flicker" />
          {/* Main screen power-off blackout */}
          <div ref={mainScreenBlackoutRef} style={{ position:'absolute', inset:0, background:'#090909', borderRadius:10, pointerEvents:'none', zIndex:20 }} />

          {/* ── Text layer ── */}
          <div ref={screenTextRef} style={{
            position: 'absolute', inset: 0, padding: 24, zIndex: 2,
            display: 'flex', flexDirection: 'column',
          }}>
            {bootingUp ? (
              <LoadingScreen
                onDone={handleBootDone}
                screenColor={screenColor}
                screenGlow={screenGlow}
              />
            ) : activeIndex === 5 ? (
              <div key={animKey.current} className="screen-fade" style={{ position:'absolute', inset:0, overflow:'hidden', borderRadius:10, zIndex:0, background:'#000', display:'flex', alignItems:'center', justifyContent:'center' }}>
                {sdCard && isPoweredOn ? (
                  <>
                    <video
                      src={sdCard === 'ponyo' ? VIDEO_PONYO : VIDEO_HOWLS}
                      autoPlay loop muted={false} playsInline
                      style={{ position:'absolute', top:'50%', left:0, transform:'translateY(-50%)', width:'100%', height:'115%', objectFit:'cover', objectPosition:'center' }}
                    />
                    <div style={{ position:'absolute', bottom:10, left:12, fontFamily:'var(--font-jetbrains-mono), monospace', fontSize:9, letterSpacing:'0.08em', color:'rgba(255,255,255,0.5)', pointerEvents:'none', zIndex:5 }}>
                      @stvlightss
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign:'center', fontFamily:'var(--font-jetbrains-mono), monospace', pointerEvents:'none' }}>
                    <div style={{ fontSize:13, letterSpacing:3, color:screenColor, opacity:0.75, marginBottom:10, textTransform:'uppercase', textShadow:`0 0 10px ${screenGlow}` }}>NO MEDIA</div>
                    <div style={{ fontSize:10, letterSpacing:2, color:screenColor, opacity:0.45, lineHeight:1.9, textTransform:'uppercase', textShadow:`0 0 6px ${screenGlow}` }}>
                      Click the screws to open<br />hardware panel &amp; insert SD card
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Header */}
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, letterSpacing:2, opacity:0.7, marginBottom:24, textTransform:'uppercase' }}>
                  <span>SYS.PORTFOLIO.OS</span>
                  <span style={{ fontWeight: 700 }}>{section.id}</span>
                </div>

                {/* Content */}
                <div key={animKey.current} className="screen-fade" style={{ flexGrow:1, display:'flex', flexDirection:'column', justifyContent:'center' }}>
                  <div style={{ fontSize:32, fontWeight:700, marginBottom:8, letterSpacing:-0.5 }}>{section.title}</div>
                  <div style={{ fontSize:11, opacity:0.6, marginBottom:16, letterSpacing:1 }}>{section.tech}</div>
                  <div style={{ fontSize:14, lineHeight:1.6, maxWidth:'80%', opacity:0.9, whiteSpace:'pre-line' }}>{section.desc}</div>
                </div>

                {/* Audio viz + click hint */}
                <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between' }}>
                  <div style={{ display:'flex', gap:3, alignItems:'flex-end', height:24 }}>
                    {Array.from({ length: 28 }).map((_, i) => (
                      <div key={i} ref={el => { audioBarsRef.current[i] = el }}
                        style={{ width:6, height:4, background:screenColor, opacity:0.8, borderRadius:1, flexShrink:0, transition:'background 0.3s' }}
                      />
                    ))}
                  </div>
                  {activeIndex < 5 && (
                    <div style={{
                      fontSize: 10, letterSpacing: '0.18em', fontWeight: 700,
                      color: screenColor, opacity: 0.75,
                      fontFamily: 'var(--font-jetbrains-mono), monospace',
                      whiteSpace: 'nowrap', paddingBottom: 2,
                    }}>
                      [ CLICK TO OPEN ]
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* ── Cover image hover layer — above LCD grid (z:6), below CRT canvas (z:10) ── */}
          <div ref={screenImgRef} style={{
            position: 'absolute', inset: 0, zIndex: 7,
            overflow: 'hidden', borderRadius: 10,
            opacity: 0,
          }}>
            {screenCover && (
              <>
                <img src={screenCover} alt="" style={{
                  width: '100%', height: '100%',
                  objectFit: 'cover', display: 'block',
                  filter: 'brightness(0.80) saturate(0.88)',
                }} />
                {/* Bottom info overlay */}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  padding: '52px 24px 22px',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.90) 0%, transparent 100%)',
                  fontFamily: 'var(--font-jetbrains-mono), monospace',
                }}>
                  <div style={{ fontSize: 9, letterSpacing: 2.5, color: screenColor, opacity: 0.55, marginBottom: 6, textTransform: 'uppercase', textShadow: `0 0 8px ${screenGlow}` }}>
                    {section.id}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.5, color: screenColor, textShadow: `0 0 18px ${screenGlow}` }}>
                    {section.title}
                  </div>
                </div>
              </>
            )}
          </div>

        </div>
      </div>

      {/* ── PCB EASTER EGG ────────────────────────────────── */}
      {showPCB && (
        <PCBView
          onClose={() => { setShowPCB(false); resetBolts() }}
          onSdInserted={setSdCard}
          initialSdCard={sdCard}
        />
      )}

      {/* ── TV OVERLAY ────────────────────────────────────── */}
      {isZoomed && (
        <div
          ref={overlayRef}
          className="tv-overlay"
          onClick={handleUnzoom}
          style={{ opacity: 0 }}
        >
          <div
            ref={tvCrtRef}
            className="tv-crt-large"
            onClick={e => e.stopPropagation()}
            style={{
              opacity: 0,
              boxShadow: `0 0 0 1px rgba(${modalRGB},0.22), 0 0 50px rgba(${modalRGB},0.08), 0 0 120px rgba(${modalRGB},0.04), inset 0 0 80px rgba(0,0,0,0.75)`,
            }}
          >
            {/* Scanlines */}
            <div className="crt-scanlines" />
            {/* Curve vignette */}
            <div className="crt-curve" />

            {/* Scrollable content */}
            <div
              ref={crtScrollableRef}
              className="crt-scrollable crt-flicker"
              style={{
                color: amber,
                fontFamily: 'var(--font-jetbrains-mono), monospace',
                textShadow: `0 0 10px rgba(${modalRGB},0.22)`,
              }}
            >
              {/* ── Two-column layout: sticky sidebar + scrollable content */}
              <div style={{ display:'flex', gap:0, alignItems:'flex-start', minHeight:'100%', justifyContent:'center' }}>

                {/* ── LEFT SIDEBAR — sticky */}
                <div style={{
                  position:'sticky', top:0,
                  width:240, flexShrink:0,
                  paddingRight:28,
                  paddingTop:4,
                  borderRight:`1px solid ${amberFaint}`,
                }}>
                  {/* ID badge */}
                  <span style={{
                    fontSize:10, letterSpacing:2.5, color:amberLabel,
                    border:`1px solid ${amberFaint}`, padding:'2px 8px', borderRadius:2,
                    display:'inline-block', marginBottom:20,
                  }}>{section.id}</span>

                  {/* Project title */}
                  <div style={{ fontSize:20, fontWeight:700, lineHeight:1.3, letterSpacing:-0.3, color:amber, marginBottom:10 }}>
                    {section.title}
                  </div>

                  {/* Sub-heading — tech */}
                  <div style={{ fontSize:11, letterSpacing:1.5, color:amberLabel, lineHeight:1.6, marginBottom:28 }}>
                    {section.tech}
                  </div>

                  {/* Trace divider */}
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:24 }}>
                    <div style={{ width:4, height:4, borderRadius:1, background:`rgba(${modalRGB},0.4)`, flexShrink:0 }} />
                    <div style={{ flex:1, height:1, background:`linear-gradient(90deg, ${amberFaint}, transparent)` }} />
                  </div>

                  {/* Meta rows / TOC */}
                  <div ref={tocContainerRef} style={{ position:'relative', overflow:'hidden' }}>
                    {/* Meta rows */}
                    <div ref={metaRowsRef} style={{ position:'absolute', top:0, left:0, width:'100%' }}>
                      {([
                        { label:'ROLE', value: details.role },
                        { label:'YEAR', value: details.year },
                      ] as {label:string;value:string}[]).map(({ label, value }) => (
                        <div key={label} style={{ marginBottom:18 }}>
                          <div style={{ fontSize:10, letterSpacing:2.5, color:amberLabel, marginBottom:5 }}>▪ {label}</div>
                          <div style={{ fontSize:13, color:amberDim, lineHeight:1.5 }}>{value}</div>
                        </div>
                      ))}
                    </div>
                    {/* TOC */}
                    <div ref={tocPanelRef} style={{ position:'absolute', top:0, left:0, width:'100%', opacity:0 }}>
                      {((details as Record<string,any>).sections as Array<{label:string}> | undefined)?.map((sec, i) => (
                        <div
                          key={i}
                          onClick={() => scrollToSection(i)}
                          style={{ cursor:'pointer', display:'flex', alignItems:'center', gap:8, marginBottom:13 }}
                        >
                          <div style={{ width: activeSec === i ? 12 : 4, height:1, flexShrink:0, background: activeSec === i ? amber : `rgba(${modalRGB},0.2)`, transition:'width 0.2s ease, background 0.2s ease' }} />
                          <span style={{ fontSize: activeSec === i ? 10 : 9, letterSpacing: activeSec === i ? 1.5 : 2, fontWeight: activeSec === i ? 600 : 400, color: activeSec === i ? amber : `rgba(${modalRGB},0.3)`, lineHeight:1.4, transition:'all 0.2s ease' }}>{sec.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom trace */}
                  <div style={{ marginTop:32, display:'flex', alignItems:'center', gap:6 }}>
                    <div style={{ flex:1, height:1, background:`linear-gradient(90deg, transparent, ${amberFaint})` }} />
                    <div style={{ width:4, height:4, borderRadius:1, background:`rgba(${modalRGB},0.4)`, flexShrink:0 }} />
                  </div>

                  {/* Footer hint */}
                  <div style={{ marginTop:16, fontSize:10, letterSpacing:2, color:`rgba(${modalRGB},0.35)` }}>
                    [ESC] CLOSE
                  </div>
                </div>

                {/* ── RIGHT CONTENT — scrolls naturally */}
                <div style={{ flex:1, minWidth:0, paddingLeft:28, maxWidth:780 }}>

                  {/* Cover image */}
                  {(details as Record<string,any>).cover && (
                    <div style={{ borderRadius:6, marginBottom:16, border:`1px solid ${amberFaint}`, overflow:'hidden', cursor:'zoom-in' }} onClick={() => setLightboxSrc((details as Record<string,any>).cover)}>
                      <img
                        src={(details as Record<string,any>).cover}
                        alt={section.title}
                        style={{ display:'block', width:'100%', height:'auto', opacity:0.85 }}
                      />
                    </div>
                  )}

                  {/* Overview text */}
                  <p style={{ fontSize:13, lineHeight:1.8, color:amber, letterSpacing:0.2, marginBottom:14, whiteSpace:'pre-line' }}>
                    {details.overview}
                  </p>

                  {/* 2-col spec cards */}
                  {details.specs?.length > 0 && (
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:20 }}>
                      {details.specs.map(({ label, value }: { label: string; value: string }) => (
                        <div key={label} style={{
                          background:`rgba(${modalRGB},0.03)`, border:`1px solid ${amberFaint}`,
                          borderRadius:3, padding:'11px 14px', display:'flex', flexDirection:'column', gap:6,
                        }}>
                          <span style={{ fontSize:8, letterSpacing:2.5, color:amberLabel }}>▪ {label}</span>
                          <span style={{ fontSize:12, color:amber, letterSpacing:0.2, lineHeight:1.3 }}>{value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Custom sections OR default PROCESS + OUTCOMES */}
                  {(details as Record<string,any>).sections ? (
                    ((details as Record<string,any>).sections as Array<{label:string;title?:string;body?:string;items?:string[];image?:string;images?:string[];videos?:string[];experience?:{company:string;role:string;period:string}[];contacts?:{platform:string;handle:string;href:string}[];contents?:{title?:string;body?:string;image?:string;images?:string[];videos?:string[]}[];cards?:{icon:string;title:string;body:string}[];stat?:{value:string;label:string;body:string}}>).map((sec, si, arr) => {
                      const renderBlock = (blk: {title?:string;body?:string;image?:string;images?:string[];videos?:string[]}, bi: number) => (
                        <div key={bi} style={{ marginBottom: 36 }}>
                          {blk.title && <div style={{ fontSize:16, fontWeight:700, color:amber, marginBottom:8, letterSpacing:-0.3, lineHeight:1.25 }}>{blk.title}</div>}
                          {blk.body && <p style={{ fontSize:13, lineHeight:1.8, color:amberDim, letterSpacing:0.1, marginBottom:10 }}>{blk.body}</p>}
                          {blk.image && (
                            <div style={{ border:`1px solid ${amberFaint}`, borderRadius:4, marginBottom: blk.videos ? 10 : 0, overflow:'hidden', cursor:'zoom-in' }} onClick={() => setLightboxSrc(blk.image!)}>
                              <img src={blk.image} alt={blk.title ?? ''} style={{ display:'block', width:'100%', height:'auto' }} />
                            </div>
                          )}
                          {blk.images && (
                            <div style={{ marginBottom: blk.videos ? 10 : 0 }}>
                              {blk.images.map((src, ii) => (
                                <div key={ii} style={{ border:`1px solid ${amberFaint}`, borderRadius:4, marginBottom: ii < blk.images!.length - 1 ? 8 : 0, overflow:'hidden', cursor:'zoom-in' }} onClick={() => setLightboxSrc(src)}>
                                  <img src={src} alt={`${blk.title ?? ''} ${ii+1}`} style={{ display:'block', width:'100%', height:'auto' }} />
                                </div>
                              ))}
                            </div>
                          )}
                          {blk.videos && (
                            <div>
                              {blk.videos.map((src, ii) => (
                                <div key={ii} style={{ border:`1px solid ${amberFaint}`, borderRadius:4, marginBottom: ii < blk.videos!.length - 1 ? 8 : 0, overflow:'hidden' }}>
                                  <video src={src} autoPlay loop muted playsInline style={{ display:'block', width:'100%', height:'auto' }} />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                      return (
                      <div key={si} ref={el => { sectionElsRef.current[si] = el }} style={{ marginBottom: si < arr.length - 1 ? 20 : 28 }}>

                        {/* Section header */}
                        <div style={{ marginBottom:14 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
                            <span style={{ fontSize:9, letterSpacing:2.5, color:amberLabel }}>{sec.label}</span>
                            <div style={{ flex:1, height:1, background:`linear-gradient(90deg, ${amberFaint}, transparent)` }} />
                          </div>
                          {sec.title && <div style={{ fontSize:16, fontWeight:700, letterSpacing:-0.3, color:amber, lineHeight:1.25 }}>{sec.title}</div>}
                        </div>

                        {/* Stat callout */}
                        {sec.stat && (
                          <div style={{ margin:'0 0 16px', padding:'16px', border:`1px solid ${amberFaint}`, borderRadius:4, background:`rgba(${modalRGB},0.025)` }}>
                            <div style={{ fontSize:36, fontWeight:700, color:amber, letterSpacing:-1, lineHeight:1 }}>{sec.stat.value}</div>
                            <div style={{ fontSize:9, letterSpacing:2.5, color:amberLabel, marginTop:4, marginBottom:8, textTransform:'uppercase' }}>{sec.stat.label}</div>
                            <p style={{ fontSize:12, lineHeight:1.7, color:amberDim, letterSpacing:0.1, margin:0 }}>{sec.stat.body}</p>
                          </div>
                        )}

                        {/* Top-level body */}
                        {sec.body && (
                          <p style={{ fontSize:13, lineHeight:1.8, color:amberDim, letterSpacing:0.1, marginBottom:12 }}>
                            {sec.body}
                          </p>
                        )}

                        {/* Experience rows */}
                        {sec.experience && (
                          <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
                            {sec.experience.map((exp: {company:string;role:string;period:string}, ei: number, arr: unknown[]) => (
                              <div key={ei} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:10, paddingBottom:10, borderBottom: ei < arr.length - 1 ? `1px solid rgba(${modalRGB},0.08)` : 'none' }}>
                                <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
                                  <span style={{ fontSize:13, fontWeight:600, color:amberDim, letterSpacing:0.2 }}>{exp.company}</span>
                                  <span style={{ fontSize:11, color:`rgba(${modalRGB},0.6)`, letterSpacing:0.5 }}>{exp.role}</span>
                                </div>
                                <span style={{ fontSize:11, fontFamily:'monospace', color:`rgba(${modalRGB},0.55)`, letterSpacing:0.5, flexShrink:0, marginLeft:16 }}>{exp.period}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Feature cards */}
                        {sec.cards && (
                          <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:12 }}>
                            {sec.cards.map((card: {icon:string;title:string;body:string}, ci: number) => (
                              <div key={ci} style={{
                                border:`1px solid ${amberFaint}`,
                                borderRadius:4,
                                padding:'14px 16px',
                                background:`rgba(${modalRGB},0.025)`,
                              }}>
                                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                                  <span style={{ fontSize:12, color:amber, opacity:0.7 }}>{card.icon}</span>
                                  <span style={{ fontSize:12, fontWeight:600, color:amber, letterSpacing:0.3 }}>{card.title}</span>
                                </div>
                                <p style={{ fontSize:12, lineHeight:1.7, color:amberDim, letterSpacing:0.1, margin:0 }}>{card.body}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Contact links */}
                        {sec.contacts && (
                          <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
                            {sec.contacts.map((c: {platform:string;handle:string;href:string}, ci: number, arr: unknown[]) => (
                              <div key={ci} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:10, paddingBottom:10, borderBottom: ci < arr.length - 1 ? `1px solid rgba(${modalRGB},0.08)` : 'none' }}>
                                <span style={{ fontSize:10, letterSpacing:2, color:amberLabel }}>{c.platform}</span>
                                <a href={c.href} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                                  style={{ fontSize:12, color:amberDim, textDecoration:'none', letterSpacing:0.3, transition:'color 0.15s' }}
                                  onMouseEnter={e => (e.currentTarget.style.color = amber)}
                                  onMouseLeave={e => (e.currentTarget.style.color = amberDim)}
                                >{c.handle}</a>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Bullet items */}
                        {sec.items && (
                          <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:12 }}>
                            {sec.items.map((item, ii) => (
                              <div key={ii} style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
                                <div style={{ width:3, height:3, background:`rgba(${modalRGB},0.55)`, borderRadius:1, flexShrink:0, marginTop:7 }} />
                                <p style={{ fontSize:13, lineHeight:1.9, color:amberDim, letterSpacing:0.1 }}>{item}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Top-level images / videos (when no content blocks) */}
                        {!sec.contents && renderBlock({ body: undefined, images: sec.image && !sec.images ? undefined : sec.images, videos: sec.videos }, -1)}
                        {sec.image && !sec.images && !sec.contents && (
                          <div style={{ border:`1px solid ${amberFaint}`, borderRadius:4, overflow:'hidden', cursor:'zoom-in' }} onClick={() => setLightboxSrc(sec.image!)}>
                            <img src={sec.image} alt={sec.label} style={{ display:'block', width:'100%', height:'auto' }} />
                          </div>
                        )}

                        {/* Multiple content blocks */}
                        {sec.contents && sec.contents.map((blk, bi) => renderBlock(blk, bi))}

                      </div>
                    )})
                  ) : (
                    <>
                      {/* PROCESS */}
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
                        <div style={{ width:4, height:4, background:`rgba(${modalRGB},0.5)`, borderRadius:1, flexShrink:0 }} />
                        <span style={{ fontSize:9, letterSpacing:3.5, color:amberLabel }}>PROCESS</span>
                        <div style={{ flex:1, height:1, background:`linear-gradient(90deg, ${amberFaint}, transparent)` }} />
                      </div>
                      <div style={{ height:175, border:`1px solid ${amberFaint}`, borderRadius:4, background:`rgba(${modalRGB},0.02)`, position:'relative', marginBottom:16, overflow:'hidden' }}>
                        {[{top:6,left:6},{top:6,right:6},{bottom:6,left:6},{bottom:6,right:6}].map((pos, i) => (
                          <div key={i} style={{ position:'absolute', width:12, height:12, borderTop: i<2?`1px solid ${amberFaint}`:'none', borderBottom: i>=2?`1px solid ${amberFaint}`:'none', borderLeft: (i===0||i===2)?`1px solid ${amberFaint}`:'none', borderRight: (i===1||i===3)?`1px solid ${amberFaint}`:'none', ...pos }} />
                        ))}
                        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, letterSpacing:3, color:`rgba(${modalRGB},0.2)` }}>[ IMG ]</div>
                      </div>
                      <p style={{ fontSize:13, lineHeight:1.95, color:amberDim, letterSpacing:0.1, marginBottom:32 }}>{details.process}</p>

                      {/* OUTCOMES */}
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
                        <div style={{ width:4, height:4, background:`rgba(${modalRGB},0.5)`, borderRadius:1, flexShrink:0 }} />
                        <span style={{ fontSize:9, letterSpacing:3.5, color:amberLabel }}>OUTCOMES</span>
                        <div style={{ flex:1, height:1, background:`linear-gradient(90deg, ${amberFaint}, transparent)` }} />
                      </div>
                      <div style={{ height:175, border:`1px solid ${amberFaint}`, borderRadius:4, background:`rgba(${modalRGB},0.02)`, position:'relative', marginBottom:16, overflow:'hidden' }}>
                        {[{top:6,left:6},{top:6,right:6},{bottom:6,left:6},{bottom:6,right:6}].map((pos, i) => (
                          <div key={i} style={{ position:'absolute', width:12, height:12, borderTop: i<2?`1px solid ${amberFaint}`:'none', borderBottom: i>=2?`1px solid ${amberFaint}`:'none', borderLeft: (i===0||i===2)?`1px solid ${amberFaint}`:'none', borderRight: (i===1||i===3)?`1px solid ${amberFaint}`:'none', ...pos }} />
                        ))}
                        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, letterSpacing:3, color:`rgba(${modalRGB},0.2)` }}>[ IMG ]</div>
                      </div>
                      <p style={{ fontSize:13, lineHeight:1.95, color:amberDim, letterSpacing:0.1, marginBottom:52, whiteSpace:'pre-line' }}>{details.outcomes}</p>
                    </>
                  )}

                  {/* ── Password gate */}
                  {(details as any).password && !unlockedSet.has(activeIndex) && (
                    <div style={{ marginTop: 8, marginBottom: 32 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
                        <div style={{ width:4, height:4, background:`rgba(${modalRGB},0.5)`, borderRadius:1, flexShrink:0 }} />
                        <span style={{ fontSize:9, letterSpacing:2.5, color:amberLabel }}>NDA — ENTER PASSWORD TO UNLOCK</span>
                        <div style={{ flex:1, height:1, background:`linear-gradient(90deg, ${amberFaint}, transparent)` }} />
                      </div>
                      {(details as any).passwordDesc && (
                        <p style={{ fontSize:13, lineHeight:1.8, color:amberDim, letterSpacing:0.1, marginBottom:16 }}>{(details as any).passwordDesc}</p>
                      )}
                      <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                        <input
                          type="password"
                          value={pwInput}
                          onChange={e => { setPwInput(e.target.value); setPwError(false) }}
                          onKeyDown={e => e.key === 'Enter' && handlePasswordSubmit()}
                          placeholder="••••••••"
                          style={{
                            background: 'transparent',
                            border: `1px solid ${pwError ? 'rgba(255,70,50,0.7)' : amberFaint}`,
                            borderRadius: 3, padding: '8px 14px',
                            color: amber,
                            fontFamily: 'var(--font-jetbrains-mono), monospace',
                            fontSize: 13, letterSpacing: 3,
                            outline: 'none', width: 200,
                            transition: 'border-color 0.2s',
                          }}
                        />
                        <button
                          onClick={handlePasswordSubmit}
                          style={{
                            background: `rgba(${modalRGB},0.07)`,
                            border: `1px solid ${amberFaint}`,
                            borderRadius: 3, padding: '8px 16px',
                            color: amber,
                            fontFamily: 'var(--font-jetbrains-mono), monospace',
                            fontSize: 9, letterSpacing: 2.5,
                            cursor: 'pointer',
                          }}
                        >
                          UNLOCK
                        </button>
                      </div>
                      {pwError && (
                        <div style={{ marginTop: 10, fontSize: 10, letterSpacing: 1.5, color: 'rgba(255,70,50,0.85)' }}>
                          ACCESS DENIED
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Locked sections — shown after correct password */}
                  {(details as any).password && unlockedSet.has(activeIndex) && (
                    ((details as any).lockedSections as Array<any>)?.map((sec: any, si: number, arr: any[]) => (
                      <div key={`locked-${si}`} style={{ marginBottom: si < arr.length - 1 ? 20 : 28 }}>
                        <div style={{ marginBottom:14 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
                            <span style={{ fontSize:9, letterSpacing:2.5, color:amberLabel }}>{sec.label}</span>
                            <div style={{ flex:1, height:1, background:`linear-gradient(90deg, ${amberFaint}, transparent)` }} />
                          </div>
                          {sec.title && <div style={{ fontSize:16, fontWeight:700, letterSpacing:-0.3, color:amber, lineHeight:1.25 }}>{sec.title}</div>}
                        </div>
                        {sec.body && <p style={{ fontSize:13, lineHeight:1.8, color:amberDim, letterSpacing:0.1, marginBottom:12 }}>{sec.body}</p>}
                      </div>
                    ))
                  )}

                  {/* Footer */}
                  <div style={{ borderTop:`1px solid ${amberFaint}`, paddingTop:20, display:'flex', justifyContent:'space-between' }}>
                    <span style={{ fontSize:9, letterSpacing:2.5, color:amberLabel }}>SYS.PORTFOLIO.OS — {section.id}</span>
                    <span style={{ fontSize:9, letterSpacing:2.5, color:amberLabel }}>PRESS [ESC] TO CLOSE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── POLAROID ZOOM OVERLAY ─────────────────────────── */}
      {isPolaroidZoomed && (
        <div
          ref={polaroidOverlayRef}
          onClick={handlePolaroidUnzoom}
          style={{
            position: 'absolute', inset: 0, borderRadius: 24, zIndex: 50,
            background: 'rgba(8,10,12,0.82)',
            backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'zoom-out',
            opacity: 0,
          }}
        >
          <div
            ref={polaroidCardRef}
            onClick={e => e.stopPropagation()}
            style={{ opacity: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}
          >
            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-end' }}>
              {[
                { src: '/austria.jpg',  caption: 'austria - salzburg',     sub: 'winter 2023', rot: -6, filter: 'sepia(0.5) saturate(0.6) brightness(0.8)' },
                { src: '/nyc.jpg',      caption: 'nyc – employees only',   sub: 'summer 2025', rot: 0,  filter: 'sepia(0.38) saturate(0.72) brightness(0.84) contrast(0.88)' },
                { src: '/korea.jpg',    caption: 'seoul - gwanjang market', sub: 'winter 2025', rot: 5,  filter: 'sepia(0.2) saturate(0.85) brightness(0.88)' },
              ].map(({ src, caption, sub, rot, filter }) => (
                <div
                  key={src}
                  onMouseEnter={e => {
                    gsap.to(e.currentTarget, {
                      y: -14, scale: 1.05, rotation: rot * 0.3,
                      boxShadow: '0 40px 70px rgba(0,0,0,0.7), 0 8px 20px rgba(0,0,0,0.35)',
                      transformPerspective: 700,
                      duration: 0.28, ease: 'power2.out',
                    })
                    const flash = e.currentTarget.querySelector<HTMLDivElement>('.polaroid-flash')
                    if (flash) flash.style.opacity = '1'
                  }}
                  onMouseMove={e => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const dx = (e.clientX - (rect.left + rect.width  / 2)) / (rect.width  / 2)
                    const dy = (e.clientY - (rect.top  + rect.height / 2)) / (rect.height / 2)
                    gsap.to(e.currentTarget, {
                      rotateX: -dy * 14,
                      rotateY:  dx * 14,
                      transformPerspective: 700,
                      duration: 0.4, ease: 'power3.out',
                    })
                    const flash = e.currentTarget.querySelector<HTMLDivElement>('.polaroid-flash')
                    if (flash) {
                      const x = ((e.clientX - rect.left) / rect.width)  * 100
                      const y = ((e.clientY - rect.top)  / rect.height) * 100
                      flash.style.background = `radial-gradient(circle 110px at ${x}% ${y}%, rgba(255,248,215,0.20) 0%, transparent 68%)`
                    }
                  }}
                  onMouseLeave={e => {
                    gsap.to(e.currentTarget, {
                      y: 0, scale: 1, rotation: rot,
                      rotateX: 0, rotateY: 0,
                      boxShadow: '0 24px 48px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.2)',
                      transformPerspective: 700,
                      duration: 0.55, ease: 'elastic.out(1, 0.6)',
                    })
                    const flash = e.currentTarget.querySelector<HTMLDivElement>('.polaroid-flash')
                    if (flash) flash.style.opacity = '0'
                  }}
                  style={{
                    width: 200,
                    background: '#f5f2ec',
                    padding: '12px 12px 24px 12px',
                    boxShadow: '0 24px 48px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.2)',
                    transform: `rotate(${rot}deg)`,
                    flexShrink: 0,
                    cursor: 'default',
                    willChange: 'transform',
                  }}
                  onClick={e => e.stopPropagation()}
                >
                  <div style={{ position: 'relative', overflow: 'hidden', height: 188 }}>
                    <img src={src} alt={caption} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block', filter }} />
                    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 88% 82% at 50% 50%, transparent 45%, rgba(30,20,10,0.38) 100%)' }} />
                  </div>
                  <div style={{ marginTop: 10, textAlign: 'center', fontFamily: '"Caveat", cursive', fontWeight: 600, color: '#3a3020' }}>
                    <div style={{ fontSize: 15, lineHeight: 1.2 }}>{caption}</div>
                    <div style={{ fontSize: 13, opacity: 0.62, marginTop: 2 }}>{sub}</div>
                  </div>
                  <div className="polaroid-flash" style={{
                    position: 'absolute', inset: 0,
                    pointerEvents: 'none', zIndex: 7, opacity: 0,
                    transition: 'opacity 0.3s ease',
                    mixBlendMode: 'screen',
                  }} />
                </div>
              ))}
            </div>
            <div style={{
              fontFamily: 'var(--font-jetbrains-mono), monospace',
              fontSize: 10, letterSpacing: 3, color: 'rgba(255,255,255,0.55)',
            }}>
              CLICK ANYWHERE TO CLOSE
            </div>
          </div>
        </div>
      )}

      {/* ── IMAGE LIGHTBOX ───────────────────────────────────── */}
      {lightboxSrc && (
        <div
          onClick={() => setLightboxSrc(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 99999,
            background: 'rgba(4,5,6,0.92)',
            backdropFilter: 'blur(18px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'zoom-out',
            animation: 'screenFadeIn 0.18s ease-out both',
          }}
        >
          <button
            onClick={() => setLightboxSrc(null)}
            style={{
              position: 'absolute', top: 20, right: 20,
              width: 32, height: 32,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: 8,
              color: 'rgba(255,255,255,0.7)',
              fontSize: 14, lineHeight: 1,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.15)'; (e.currentTarget as HTMLButtonElement).style.color = '#fff' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.7)' }}
          >
            ✕
          </button>
          <img
            src={lightboxSrc}
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '90vw', maxHeight: '88vh',
              objectFit: 'contain',
              borderRadius: 6,
              boxShadow: '0 32px 80px rgba(0,0,0,0.8)',
              cursor: 'default',
              display: 'block',
            }}
          />
        </div>
      )}

      {/* ── CONTROLS AREA — 3 columns: dial | selector | aux ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        alignItems: 'center',
        height: '100%',
      }}>

        {/* COL 1 — Dial */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
          <div style={{
            width:220, height:220, borderRadius:'50%',
            background: isDark
              ? 'linear-gradient(145deg, #222226 0%, #18181c 45%, #101014 100%)'
              : 'linear-gradient(145deg, #3e3e44 0%, #323238 45%, #28282e 100%)',
            boxShadow:'6px 10px 28px rgba(0,0,0,0.85), -2px -3px 8px rgba(80,100,120,0.07), inset 3px 3px 8px rgba(255,255,255,0.045), inset -3px -3px 8px rgba(0,0,0,0.7), inset 0 0 0 1px rgba(255,255,255,0.04)',
            display:'flex', justifyContent:'center', alignItems:'center', position:'relative',
          }}>
            {/* LED dots in 240° arc */}
            <div ref={ledRingRef} style={{ position:'absolute', width:'100%', height:'100%', borderRadius:'50%', pointerEvents:'none' }}>
              {SECTIONS.map((_, i) => {
                const angleDeg = START_OFFSET + i * STEP
                const rad = (angleDeg - 90) * (Math.PI / 180)
                const x = Math.cos(rad) * 90, y = Math.sin(rad) * 90
                const isActive = i === activeIndex
                return (
                  <div key={i} style={{
                    position:'absolute', width:6, height:6, borderRadius:'50%',
                    top:'50%', left:'50%', marginTop:-3, marginLeft:-3,
                    transform:`translate(${x}px, ${y}px)`,
                    background: (isActive && isPoweredOn) ? '#ea3f24' : '#1a1e24',
                    boxShadow: (isActive && isPoweredOn) ? '0 0 10px #ea3f24, 0 0 5px #ea3f24, 0 0 2px rgba(234,63,36,0.8)' : 'inset 1px 1px 2px rgba(0,0,0,0.85)',
                    transition:'background 0.3s, box-shadow 0.3s',
                  }} />
                )
              })}
            </div>

            {/* Metal knob */}
            <div ref={knobRef} style={{
              width:160, height:160, borderRadius:'50%', position:'relative',
              cursor:'grab', flexShrink:0,
              boxShadow:'10px 14px 30px rgba(0,0,0,0.9), -4px -4px 12px rgba(80,105,130,0.12), 0 0 0 1.5px rgba(255,255,255,0.09), 0 0 0 3px rgba(0,0,0,0.6)',
            }}>
              <canvas ref={metalCanvasRef} style={{ position:'absolute', inset:0, width:'100%', height:'100%', borderRadius:'50%', pointerEvents:'none' }} />
              <div ref={rotatorRef} className="knob-rotator">
                <div className="knob-grip" />
                <div className={isPoweredOn ? 'knob-indicator' : 'knob-indicator knob-off'} />
              </div>
            </div>
          </div>
        </div>

        {/* COL 2 — Section buttons + Terminal */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', paddingBottom: 32 }}>

          {/* ── Unified control module ── */}
          <div style={{
            background: isDark
              ? 'linear-gradient(160deg, #181819 0%, #111113 55%, #0a0a0c 100%)'
              : 'linear-gradient(160deg, #303034 0%, #262628 55%, #1e1e20 100%)',
            borderRadius: 7,
            padding: '10px 9px 9px',
            boxShadow: [
              'inset 0 1px 0 rgba(255,255,255,0.07)',
              'inset 0 -1px 0 rgba(0,0,0,0.85)',
              'inset 1px 0 0 rgba(255,255,255,0.04)',
              'inset -1px 0 0 rgba(0,0,0,0.65)',
              '4px 6px 18px rgba(0,0,0,0.8)',
              '0 0 0 1px rgba(0,0,0,0.9)',
            ].join(', '),
            display: 'flex',
            gap: 9,
          }}>

            {/* ── Section selector panel ── */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Engraved label */}
              <div style={{ fontSize: 6, letterSpacing: 3, color: 'rgba(255,255,255,0.14)', fontFamily: 'var(--font-jetbrains-mono), monospace', textAlign: 'center', marginBottom: 7, textTransform: 'uppercase' }}>
                Sections
              </div>
              {/* Button stack — no gaps, separated by hairlines */}
              <div style={{
                borderRadius: 4,
                overflow: 'hidden',
                boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.9), 0 0 0 0.5px rgba(255,255,255,0.05)',
              }}>
                {SECTIONS.map((s, i) => {
                  const isActive = i === activeIndex
                  return (
                    <div
                      key={s.id}
                      onClick={() => goToSection(i)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '7px 10px',
                        cursor: 'pointer',
                        background: isActive
                          ? 'linear-gradient(180deg, #0d1f10 0%, #091408 100%)'
                          : 'linear-gradient(180deg, #1c1c20 0%, #141416 100%)',
                        borderBottom: i < SECTIONS.length - 1 ? '1px solid rgba(0,0,0,0.7)' : 'none',
                        borderTop: i > 0 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                        boxShadow: isActive
                          ? 'inset 0 1px 3px rgba(0,0,0,0.6)'
                          : 'inset 0 1px 0 rgba(255,255,255,0.04)',
                        transition: 'background 0.15s',
                        userSelect: 'none',
                        minWidth: 92,
                      }}
                    >
                      {/* LED hole */}
                      <div style={{
                        width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                        background: isActive
                          ? 'radial-gradient(circle at 38% 35%, #88ffaa, #22dd55)'
                          : 'radial-gradient(circle at 38% 35%, #1a1e1a, #0a0c0a)',
                        boxShadow: isActive
                          ? '0 0 5px #33ff66, 0 0 10px rgba(51,255,102,0.45), inset 0 -1px 1px rgba(0,0,0,0.3)'
                          : 'inset 0 1px 2px rgba(0,0,0,0.95), inset 0 0 0 0.5px rgba(0,0,0,0.8)',
                        transition: 'all 0.2s',
                      }} />
                      <span style={{
                        fontFamily: 'var(--font-jetbrains-mono), monospace',
                        fontSize: 9,
                        letterSpacing: 1.8,
                        color: isActive ? 'rgba(51,255,102,0.85)' : 'rgba(255,255,255,0.28)',
                        textShadow: isActive ? '0 0 8px rgba(51,255,102,0.35)' : 'none',
                        transition: 'all 0.2s',
                        fontWeight: 700,
                      }}>
                        {s.id}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* ── Terminal panel ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {/* Engraved label */}
              <div style={{ fontSize: 6, letterSpacing: 3, color: 'rgba(255,255,255,0.14)', fontFamily: 'var(--font-jetbrains-mono), monospace', textAlign: 'center', textTransform: 'uppercase' }}>
                Terminal
              </div>

              {/* CRT screen — recessed bezel */}
              <div style={{
                background: '#060808',
                borderRadius: 4,
                padding: '4px',
                boxShadow: [
                  'inset 0 0 0 1px rgba(0,0,0,1)',
                  'inset 0 3px 14px rgba(0,0,0,0.98)',
                  'inset 0 0 40px rgba(0,0,0,0.6)',
                ].join(', '),
              }}>
                <div style={{
                  background: '#020402',
                  borderRadius: 2,
                  width: 180,
                  height: 156,
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  {/* Scanlines */}
                  <div style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3,
                    backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.16) 0px, rgba(0,0,0,0.16) 1px, transparent 1px, transparent 2px)',
                  }} />
                  {/* Phosphor bloom */}
                  <div style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
                    background: 'radial-gradient(ellipse 85% 65% at 50% 48%, rgba(8,58,20,0.35) 0%, transparent 100%)',
                  }} />
                  {/* Glass glare */}
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: '30%', pointerEvents: 'none', zIndex: 4,
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.022) 0%, transparent 100%)',
                    borderRadius: '2px 2px 0 0',
                  }} />
                  {/* Output */}
                  <div
                    ref={termScrollRef}
                    className="term-scroll"
                    style={{
                      position: 'absolute', inset: 0, zIndex: 2,
                      padding: '8px 9px 5px',
                      overflowY: 'auto',
                      display: 'flex', flexDirection: 'column', gap: 0,
                    }}
                  >
                    {termLines.map((line, i) => (
                      <div key={i} style={{
                        fontFamily: 'var(--font-jetbrains-mono), monospace',
                        fontSize: 8.5,
                        lineHeight: 1.6,
                        whiteSpace: 'pre',
                        color: line.type === 'in'  ? 'rgba(51,255,102,1)'
                             : line.type === 'err' ? 'rgba(255,90,70,0.9)'
                             : line.type === 'sys' ? 'rgba(51,255,102,0.38)'
                             : 'rgba(51,255,102,0.68)',
                        textShadow: '0 0 7px rgba(51,255,102,0.28)',
                      }}>{line.text}</div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Input — recessed into housing */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: '#060808',
                borderRadius: 4,
                padding: '5px 9px',
                boxShadow: [
                  'inset 0 2px 5px rgba(0,0,0,0.9)',
                  'inset 0 0 0 1px rgba(0,0,0,0.8)',
                  '0 0.5px 0 rgba(255,255,255,0.04)',
                ].join(', '),
              }}>
                <span style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', fontSize: 9, color: 'rgba(51,255,102,0.5)', flexShrink: 0, textShadow: '0 0 6px rgba(51,255,102,0.25)' }}>{'>'}</span>
                <input
                  ref={termInputRef}
                  value={termInput}
                  onChange={e => setTermInput(e.target.value)}
                  onKeyDown={handleTermSubmit}
                  spellCheck={false}
                  autoComplete="off"
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontFamily: 'var(--font-jetbrains-mono), monospace',
                    fontSize: 9,
                    color: 'rgba(51,255,102,0.95)',
                    caretColor: '#33ff66',
                    textShadow: '0 0 6px rgba(51,255,102,0.3)',
                    width: 150,
                  }}
                />
              </div>
            </div>

          </div>
        </div>

        {/* COL 3 — Aux controls */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:28, paddingRight:8, gridColumn: 3 }}>
          {/* Skeuomorphic clock screen */}
          <div style={{
            background: isDark
              ? 'linear-gradient(160deg, #181819 0%, #111113 55%, #0a0a0c 100%)'
              : 'linear-gradient(160deg, #303034 0%, #262628 55%, #1e1e20 100%)',
            borderRadius: 7,
            padding: '5px 6px 7px',
            boxShadow: [
              'inset 0 1px 0 rgba(255,255,255,0.07)',
              'inset 0 -1px 0 rgba(0,0,0,0.85)',
              'inset 1px 0 0 rgba(255,255,255,0.04)',
              'inset -1px 0 0 rgba(0,0,0,0.65)',
              '3px 4px 14px rgba(0,0,0,0.75)',
              '0 0 0 1px rgba(0,0,0,0.9)',
            ].join(', '),
          }}>
            {/* Screen face */}
            <div style={{
              background: '#040404',
              borderRadius: 4,
              padding: '9px 13px 10px',
              position: 'relative',
              overflow: 'hidden',
              width: 148, height: 62,
              display: 'flex', alignItems: 'center',
              boxShadow: [
                'inset 0 0 0 1px rgba(0,0,0,1)',
                'inset 0 3px 16px rgba(0,0,0,0.98)',
                'inset 0 0 40px rgba(0,0,0,0.5)',
              ].join(', '),
            }}>
              {/* Scanlines */}
              <div style={{
                position:'absolute', inset:0, pointerEvents:'none', zIndex:2,
                backgroundImage:'repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 1px, transparent 2px)',
              }} />
              {/* Phosphor ambient glow */}
              <div style={{
                position:'absolute', inset:0, pointerEvents:'none', zIndex:1,
                background: `radial-gradient(ellipse 85% 65% at 50% 50%, ${phosphorGreen ? 'rgba(6,52,18,0.3)' : 'rgba(52,32,6,0.25)'} 0%, transparent 100%)`,
                transition: 'background 0.3s',
              }} />
              {/* Clock — always rendered, dimmed when dog is on screen */}
              <div style={{ position:'relative', zIndex:3, fontFamily:'var(--font-jetbrains-mono), monospace', opacity: showDog ? 0 : 1, transition:'opacity 0.15s' }}>
                <div style={{ fontSize:6.5, letterSpacing:3, color:screenColor, opacity:0.45, marginBottom:5, textTransform:'uppercase', fontWeight:700 }}>
                  TOR · LOCAL
                </div>
                <div style={{
                  fontSize:20, letterSpacing:1.5, color:screenColor,
                  textShadow:`0 0 14px ${screenGlow}, 0 0 5px ${screenGlow}`,
                  fontVariantNumeric:'tabular-nums', lineHeight:1,
                }}>
                  {torontoTime}
                </div>
              </div>
              {/* Dog — randomly walks or jumps each appearance */}
              {showDog && (
                <div style={{
                  position:'absolute', zIndex:5, pointerEvents:'none',
                  top:'50%', marginTop:-18,
                  ...(dogMode === 'walk'
                    ? { animation:'dogWalkRight 3.8s linear forwards' }
                    : { left:'50%', marginLeft:-28, animation:'dogJump 0.6s ease-in-out infinite' }
                  ),
                }}>
                  <div style={ dogMode === 'walk' ? { animation:'dogBounce 0.55s ease-in-out infinite' } : {} }>
                    <pre style={{
                      margin:0, padding:0,
                      fontSize:8.5, lineHeight:1.35, letterSpacing:0.5,
                      color: screenColor, textShadow:`0 0 6px ${screenGlow}`,
                      fontFamily:'var(--font-jetbrains-mono), monospace',
                      whiteSpace:'pre',
                    }}>
                      {dogFrame === 0
                        ? ` ∧_∧  \n(${phosphorGreen?'●':'◉'}ω${phosphorGreen?'●':'◉'})─\n ∪ ∪  `
                        : ` ∧_∧  \n(${phosphorGreen?'●':'◉'}ω${phosphorGreen?'●':'◉'})─\n ∩ ∩  `}
                    </pre>
                  </div>
                </div>
              )}
              {/* Glass glare */}
              <div style={{
                position:'absolute', top:0, left:0, right:0, height:'38%',
                background:'linear-gradient(180deg, rgba(255,255,255,0.028) 0%, transparent 100%)',
                pointerEvents:'none', zIndex:4, borderRadius:'4px 4px 0 0',
              }} />
              {/* Power-off blackout — animated by GSAP */}
              <div ref={screenBlackoutRef} style={{
                position:'absolute', inset:0, background:'#040404',
                borderRadius:4, pointerEvents:'none', zIndex:7,
              }} />
            </div>
          </div>

          {/* Power toggle */}
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ fontSize:10, fontWeight:700, letterSpacing:2.5, color:'rgba(255,255,255,0.45)', textTransform:'uppercase', textShadow:'0 1px 2px rgba(0,0,0,0.9)', fontFamily:'var(--font-jetbrains-mono), monospace' }}>
              Power
            </span>
            <div
              onClick={() => setIsPoweredOn(p => !p)}
              style={{
                width:60, height:30, borderRadius:15, cursor:'pointer', flexShrink:0,
                background: isDark
                  ? 'linear-gradient(135deg, #28282e 0%, #1e1e24 50%, #16161c 100%)'
                  : 'linear-gradient(135deg, #484850 0%, #3a3a42 50%, #2e2e36 100%)',
                boxShadow: 'inset 0 3px 8px rgba(0,0,0,0.85), inset 0 1px 3px rgba(0,0,0,0.6), inset 0 -1px 0 rgba(255,255,255,0.06), 2px 3px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.10)',
                position:'relative',
              }}
            >
              {/* Thumb */}
              <div
                style={{
                  position:'absolute', top:3, left:3, width:24, height:24, borderRadius:'50%',
                  background: 'radial-gradient(circle at 38% 32%, #2a1014 0%, #160a0c 55%, #0c0608 100%)',
                  boxShadow: isPoweredOn
                    ? 'inset 0 1px 2px rgba(255,255,255,0.08), inset 0 -1px 1px rgba(0,0,0,0.6), 0 2px 6px rgba(0,0,0,0.75)'
                    : undefined,
                  transform: isPoweredOn ? 'translateX(30px)' : 'translateX(0)',
                  transition:'transform 0.28s cubic-bezier(0.34,1.56,0.64,1)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                }}
              >
                {/* LED indicator dot */}
                {/* LED indicator dot */}
                <div className={isPoweredOn ? '' : 'led-standby'} style={{
                  width: 9, height: 9, borderRadius: '50%',
                  background: isPoweredOn
                    ? 'radial-gradient(circle at 35% 30%, #ff6666 0%, #ee1122 45%, #aa0010 100%)'
                    : 'radial-gradient(circle at 35% 30%, #c82030 0%, #8a1018 55%, #4a0008 100%)',
                  boxShadow: isPoweredOn
                    ? '0 0 4px 1px rgba(255,30,40,0.9), 0 0 10px 3px rgba(200,10,20,0.55), inset 0 1px 1px rgba(255,140,140,0.5)'
                    : undefined,
                  transition: 'background 0.35s',
                  flexShrink: 0,
                }} />
              </div>
            </div>
          </div>

          {/* Speaker — perforated dot grille in recessed panel */}
          <div style={{
            background: isDark ? '#141418' : '#242428',
            borderRadius: 7,
            padding: '10px 12px',
            boxShadow: [
              'inset 0 2px 6px rgba(0,0,0,0.6)',
              'inset 0 0 0 1px rgba(0,0,0,0.4)',
              '0 1px 0 rgba(255,255,255,0.07)',
            ].join(', '),
          }}>
            <svg
              viewBox="0 0 100 26"
              width="100"
              height="26"
              style={{ display: 'block' }}
            >
              {Array.from({ length: 3 }).flatMap((_, row) =>
                Array.from({ length: 14 }).map((_, col) => {
                  const cx = 5 + col * 7
                  const cy = 5 + row * 8
                  return (
                    <g key={`${row}-${col}`}>
                      <circle cx={cx} cy={cy - 0.5} r={2.5} fill="rgba(0,0,0,0.6)"/>
                      <circle cx={cx} cy={cy} r={2} fill="#282830"/>
                      <circle cx={cx + 0.3} cy={cy + 1.8} r={0.75} fill="rgba(255,255,255,0.22)"/>
                    </g>
                  )
                })
              )}
            </svg>
          </div>
        </div>
      </div>

    </div>
  )
}
