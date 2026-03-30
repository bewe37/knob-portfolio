'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import gsap from 'gsap'
import PCBView from './PCBView'
import { LoadingScreen } from './LoadingScreen'
import SmiskiKeychain from './SmiskiKeychain'

// ── Portfolio data ────────────────────────────────────────
const SECTIONS = [
  {
    id: 'ABT-00',
    title: 'Georgius Bryan',
    tech: 'PRODUCT DESIGNER',
    desc: "Powerful tools shouldn't require a PhD to operate. That's the gap I close :)",
  },
  {
    id: 'PRJ-01',
    title: 'AMD | Conversational AI',
    tech: 'PRODUCT DESIGN / DESIGN SYSTEM DESIGNER',
    desc: 'Shaping AMD Software next-gen experience from the inside, including the design system powering it all.',
  },
  {
    id: 'PRJ-02',
    title: 'Safe Software | Annotation Tools',
    tech: 'PRODUCT DESIGN',
    desc: 'Rethinking how technical users document and annotate complex data workflows.',
  },
  {
    id: 'PRJ-03',
    title: 'Fix the 6ix | Gift Card Tracker',
    tech: 'PRODUCT DESIGN',
    desc: 'Designing the internal dashboard that helped a non-profit manage its gift card distribution.',
  },
  {
    id: 'PRJ-04',
    title: 'SPATIAL UI',
    tech: 'THREE.JS / REACT / GSAP',
    desc: 'Immersive 3D spatial interface for a data exploration platform. Real-time orbital simulations, procedural geometry, and gesture-driven navigation.',
  },
  {
    id: 'COM-05',
    title: "LET'S CONNECT",
    tech: 'AVAILABLE FOR WORK',
    desc: 'Open to full-time and contract roles in product design and frontend engineering.\nbryanwinata112@gmail.com\nlinkedin.com/in/gbryanw',
  },
]

// ── Rich detail data for the overlay ─────────────────────
const SECTION_DETAILS = [
  {
    overview: "UI/UX designer and frontend developer with 4+ years crafting high-fidelity digital experiences. Specializing in spatial computing, skeuomorphic interfaces, and performance-first web applications. Every pixel is intentional.",
    role: "Product Designer & FE Dev",
    year: "2020 — Present",
    specs: [
      { label: "PRIMARY STACK", value: "React / Next.js" },
      { label: "DESIGN TOOLS", value: "Figma / Spline" },
      { label: "ANIMATION", value: "GSAP / Framer" },
      { label: "SPECIALTY", value: "WebGL / Shaders" },
    ],
    process: "I start from user research and systems thinking — mapping out interaction models before touching any tool. Every project goes through low-fidelity wireframes, high-fidelity prototypes, and staged implementation with continuous testing against real hardware.",
    outcomes: "Delivered 12+ production applications across fintech, gaming, and SaaS verticals. Consistent record of shipping pixel-perfect interfaces that exceed design specifications and delight users.",
  },
  {
    overview: "Real-time GPU performance overlay built specifically for AMD Radeon hardware. Renders live telemetry — clock speeds, temperature, VRAM utilization, and frame timing — with sub-millisecond rendering latency at 60fps.",
    role: "Solo Developer",
    year: "2024",
    specs: [
      { label: "FRAMEWORK", value: "React / Vite" },
      { label: "RENDERING", value: "WebGL / Canvas 2D" },
      { label: "PERF TARGET", value: "< 0.3ms per frame" },
      { label: "REFRESH RATE", value: "60 Hz telemetry" },
    ],
    process: "Profiled every render path to eliminate jank on the critical path. OffscreenCanvas and Web Workers push GPU data processing entirely off the main thread. Animated charts use a custom ring-buffer architecture to avoid GC pressure.",
    outcomes: "Zero dropped frames at 60fps on mid-range hardware. Deployed to 200+ beta users with an average gaming session length of 3.2 hours. Memory footprint under 12MB across all visual layers.",
  },
  {
    overview: "Contributed to Safe Software's product modernization initiative — evaluating and refining the redesigned FME Platform after UI components were shipped by engineering. Work spanned icon library handoff, post-redesign accessibility auditing, annotation feature design, and laying the foundation for a formal design system that emerged directly from the pain of doing handoff without one.",
    role: "Product Designer",
    year: "2024",
    specs: [
      { label: "SCOPE",            value: "Icon Handoff + UX Audit" },
      { label: "WCAG TARGET",      value: "AA Compliant" },
      { label: "ICONS DELIVERED",  value: "47+ components" },
      { label: "SURFACE",          value: "Web + Desktop (FME)" },
    ],
    process: "",
    outcomes: "",
    sections: [
      {
        label: "ICONOGRAPHY REDESIGN",
        images: ["/IconographRebranding.png", "/IconRebrandingResult.png"],
        body: "Led the handoff of a comprehensive icon library redesign spanning 47+ icons aligned to FME Platform's modernized visual language. Each icon was delivered across three scales — 16px, 24px, and 32px — with optical compensation to ensure pixel-precise rendering at each size. Defined SVG export specifications and integration guidelines coordinated directly with the engineering team, covering stroke normalization, fill rules, and named layer conventions for automation.",
      },
      {
        label: "FEATURE ENHANCEMENT — ANNOTATION TOOLS",
        body: "Designed a contextual annotation layer for FME's workspace canvas — enabling users to place notes, grouping labels, and inline documentation directly within complex data transformation pipelines. Prior to this, documentation lived entirely outside the workspace in separate files, creating a context gap for new contributors and making pipeline review sessions slower. The annotation system surfaces context exactly where the work happens, reducing onboarding friction and keeping spatial reasoning intact during reviews.",
      },
      {
        label: "DESIGN SYSTEM",
        body: "The iconography handoff surfaced a systemic problem: without a shared token layer, every component handoff required manual cross-referencing between Figma frames and the engineering codebase — a slow, error-prone process that did not scale. Initiated the FME Design System foundation with semantic tokens for color, spacing, typography, and iconography, each with a 1:1 mapping to CSS custom properties via a lightweight codegen step. The icon token layer connects directly to the iconography redesign work, ensuring that every icon variant is referenceable by name rather than by asset path — eliminating the most common class of handoff errors.",
      },
    ],
  },
  {
    overview: "End-to-end design system and component library for a multi-product fintech platform, covering web, mobile, and email surfaces. Built a unified semantic token architecture that bridges Figma and production code.",
    role: "Lead Designer",
    year: "2023",
    specs: [
      { label: "COMPONENTS", value: "120+ primitives" },
      { label: "TOKEN LAYERS", value: "Primitive → Semantic" },
      { label: "MODE SUPPORT", value: "Dark + Light + HC" },
      { label: "TOOLING", value: "Figma + Storybook" },
    ],
    process: "Started with a full audit of 4 existing product codebases, extracting the implicit patterns already in use. Formalized them into a semantic token system where Figma variables map 1:1 to CSS custom properties via a CI/CD codegen pipeline.",
    outcomes: "Reduced new feature design time by 60%. Engineering team reported 40% faster component integration. Adopted across 3 product squads within 6 months of launch. Zero visual regressions in 8 months post-launch.",
  },
  {
    overview: "Immersive 3D spatial interface built for a scientific data exploration platform. Procedurally generated geometry, real-time orbital mechanics, and a gesture-first navigation model — all running at 60fps in-browser with Three.js.",
    role: "Solo Developer",
    year: "2025",
    specs: [
      { label: "RENDERER", value: "Three.js / WebGL" },
      { label: "ANIMATION", value: "GSAP / Custom springs" },
      { label: "GEOMETRY", value: "Procedural / instanced" },
      { label: "TARGET", value: "60fps desktop + tablet" },
    ],
    process: "Started with a physics simulation of orbital bodies, then built the UI layer on top — treating the 3D scene as the primary navigation surface rather than a background decoration. All geometry is instanced for draw-call efficiency.",
    outcomes: "Sustained 60fps on mid-range GPUs with 10,000+ instanced meshes. Navigation latency under 16ms on all tested devices. Selected as a featured experiment on Three.js Journey community showcase.",
  },
  {
    overview: "Open for full-time and contract engagements in product design and frontend engineering. Experienced with early-stage startups moving fast and established product teams managing complex systems at scale.",
    role: "Open to Offers",
    year: "2026",
    specs: [
      { label: "AVAILABILITY", value: "Immediate" },
      { label: "ENGAGEMENT", value: "Full-time / Contract" },
      { label: "TIMEZONE", value: "UTC+8  (flex overlap)" },
      { label: "REMOTE", value: "Yes — preferred" },
    ],
    process: "Every engagement begins with a discovery call to understand your product vision, users, and constraints. I can slot into your existing workflow as an embedded designer/dev, or drive a greenfield project end-to-end from research to ship.",
    outcomes: "Let's build something worth showing off.\n\nbryanwinata112@gmail.com\nlinkedin.com/in/gbryanw",
  },
]

// ── Video for slot 4 (PRJ-04) ──
const VIDEO_URL = '/HowlsVideo.mp4'

const NUM          = SECTIONS.length
const TOTAL_ARC    = 240
const STEP         = TOTAL_ARC / (NUM - 1)   // 60° per position
const START_OFFSET = -120                     // arc: -120° → +120°

// ── Draw concentric machined-metal rings onto a canvas ────
function drawMetalKnob(canvas: HTMLCanvasElement) {
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
  base.addColorStop(0,   '#626c76')  // gunmetal highlight
  base.addColorStop(0.28,'#424c56')  // mid gunmetal
  base.addColorStop(0.62,'#28323a')  // deep gunmetal
  base.addColorStop(1,   '#141c22')  // near-black rim
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
function Bolt({ style, onClick, active }: { style: React.CSSProperties; onClick?: () => void; active?: boolean }) {
  return (
    <div
      onClick={onClick}
      title={active ? 'Bolt loosened' : 'Click to loosen'}
      style={{
        position: 'absolute', width: 22, height: 22, borderRadius: '50%',
        background: active
          ? 'linear-gradient(145deg, #2a2420 0%, #1c1814 100%)'
          : 'linear-gradient(145deg, #3c444c 0%, #242a30 100%)',
        boxShadow: active
          ? 'inset 2px 2px 5px rgba(0,0,0,0.65), inset -1px -1px 2px rgba(255,255,255,0.07), 0 0 9px rgba(234,63,36,0.4)'
          : '2px 3px 8px rgba(0,0,0,0.75), -1px -1px 3px rgba(60,80,100,0.12), inset 1px 1px 1px rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s, background 0.2s',
        ...style,
      }}
    >
      <div style={{ position: 'relative', width: 9, height: 9 }}>
        <div style={{ position:'absolute', top:'50%', left:0, right:0, height:1.5, marginTop:-0.75, background: active ? 'rgba(180,120,80,0.45)' : 'rgba(80,100,118,0.35)', borderRadius:1 }} />
        <div style={{ position:'absolute', left:'50%', top:0, bottom:0, width:1.5, marginLeft:-0.75, background: active ? 'rgba(180,120,80,0.45)' : 'rgba(80,100,118,0.35)', borderRadius:1 }} />
      </div>
    </div>
  )
}

// ── Component ─────────────────────────────────────────────
export default function HardwareBoard() {
  const [activeIndex,   setActiveIndex]   = useState(0)
  const [phosphorGreen, setPhosphorGreen] = useState(true)
  const [isZoomed,      setIsZoomed]      = useState(false)
  const [clickedBolts,  setClickedBolts]  = useState<Set<string>>(new Set())
  const [showPCB,       setShowPCB]       = useState(false)
  const [torontoTime,   setTorontoTime]   = useState('')
  const [showDog,       setShowDog]       = useState(false)
  const [dogFrame,      setDogFrame]      = useState(0)
  const [dogMode,       setDogMode]       = useState<'walk'|'jump'>('walk')
  const [isPoweredOn,       setIsPoweredOn]       = useState(false)
  const [bootingUp,         setBootingUp]         = useState(false)
  const [isPolaroidZoomed,  setIsPolaroidZoomed]  = useState(false)

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
  const hasBootedRef          = useRef(false)  // corgi boot plays once only
  const polaroidRef           = useRef<HTMLDivElement>(null)
  const polaroidOverlayRef    = useRef<HTMLDivElement>(null)
  const polaroidCardRef       = useRef<HTMLDivElement>(null)

  // ── Metal canvas
  useEffect(() => {
    if (metalCanvasRef.current) drawMetalKnob(metalCanvasRef.current)
  }, [])

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
    }
  }, [isPoweredOn])

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

  // ── Escape key to close
  useEffect(() => {
    if (!isZoomed) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleUnzoom() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isZoomed])

  const handleZoom = useCallback(() => {
    if (activeIdxRef.current === 4) return
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

  // ── Polaroid hover
  const handlePolaroidEnter = useCallback(() => {
    if (!polaroidRef.current) return
    gsap.to(polaroidRef.current, {
      y: -14, scale: 1.07, rotation: 3,
      boxShadow: '6px 18px 40px rgba(0,0,0,0.45)',
      duration: 0.35, ease: 'power2.out',
    })
  }, [])

  const handlePolaroidLeave = useCallback(() => {
    if (!polaroidRef.current) return
    gsap.to(polaroidRef.current, {
      y: 0, scale: 1, rotation: 0,
      boxShadow: 'none',
      duration: 0.45, ease: 'elastic.out(1, 0.6)',
    })
  }, [])

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
  }, [isPolaroidZoomed])

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

  // Keep ref in sync so pointer handlers always read current power state
  useEffect(() => { isPoweredOnRef.current = isPoweredOn }, [isPoweredOn])

  const changeSection = useCallback((idx: number) => {
    if (!isPoweredOnRef.current) return          // block all actions when off
    if (activeIdxRef.current === idx) return
    const prev = activeIdxRef.current
    activeIdxRef.current = idx
    setActiveIndex(idx)
    animateAudioBars()
    animKey.current++
    if (idx  === 4) window.dispatchEvent(new Event('video-active'))
    if (prev === 4) window.dispatchEvent(new Event('video-inactive'))
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
  const screenColor = phosphorGreen ? '#33ff66' : '#c07e18'
  const screenGlow  = phosphorGreen ? 'rgba(51,255,102,0.28)' : 'rgba(192,126,24,0.25)'

  const handleBootDone = useCallback(() => setBootingUp(false), [])

  const goToSection = useCallback((idx: number) => {
    changeSection(idx)
    snapToIndex(idx)
  }, [changeSection, snapToIndex])

  const handleBoltClick = useCallback((id: string) => {
    setClickedBolts(prev => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      if (next.size === 4) {
        // Small delay for the last bolt animation to register visually
        setTimeout(() => setShowPCB(true), 300)
      }
      return next
    })
  }, [])

  // Modal colors — same phosphor tint as the main CRT screen
  const modalRGB   = phosphorGreen ? '51,255,102' : '192,126,24'
  const amber      = screenColor
  const amberDim   = `rgba(${modalRGB},0.72)`
  const amberFaint = `rgba(${modalRGB},0.12)`
  const amberLabel = `rgba(${modalRGB},0.38)`

  return (
    <div style={{
      width: 920, height: 640,
      background: 'linear-gradient(145deg, #22282e 0%, #191d22 42%, #111418 100%)',
      borderRadius: 24,
      boxShadow: '40px 50px 80px rgba(0,0,0,0.80), -5px -5px 16px rgba(50,70,90,0.10), inset 0 1px 0 rgba(255,255,255,0.055), inset 1px 1px 2px rgba(255,255,255,0.025), inset -2px -2px 8px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,0,0,0.85)',
      display: 'grid',
      gridTemplateRows: 'auto 1fr',
      padding: 40,
      gap: 32,
      position: 'relative',
    }}>
      {/* ── Anodized micro-grain noise ──────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 24, overflow: 'hidden',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.80' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        opacity: 0.072,
        pointerEvents: 'none', zIndex: 0,
        mixBlendMode: 'overlay',
      }} />
      {/* ── Horizontal brushed-aluminum grain lines ─────────── */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 24, overflow: 'hidden',
        backgroundImage: 'repeating-linear-gradient(to bottom, rgba(255,255,255,0.016) 0px, rgba(255,255,255,0.016) 1px, rgba(0,0,0,0.028) 1px, rgba(0,0,0,0.028) 3px)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      {/* ── Raking light — upper-left catchlight ────────────── */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 24,
        background: 'radial-gradient(ellipse 60% 50% at 10% 8%, rgba(255,255,255,0.065) 0%, rgba(255,255,255,0.018) 45%, transparent 80%)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      {/* ── Smiski keychain — hangs below bottom-right ──────── */}
      <SmiskiKeychain />

      {/* Corner bolts — click all 4 to open housing */}
      <Bolt style={{ top: 18, left: 18 }}   active={clickedBolts.has('tl')} onClick={() => handleBoltClick('tl')} />
      <Bolt style={{ top: 18, right: 18 }}  active={clickedBolts.has('tr')} onClick={() => handleBoltClick('tr')} />
      <Bolt style={{ bottom: 18, left: 18 }}  active={clickedBolts.has('bl')} onClick={() => handleBoltClick('bl')} />
      <Bolt style={{ bottom: 18, right: 18 }} active={clickedBolts.has('br')} onClick={() => handleBoltClick('br')} />

      {/* ── SCREEN BEZEL ──────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(155deg, #202830 0%, #161c22 50%, #0e1216 100%)',
        borderRadius: 18, padding: 16,
        boxShadow: '0 6px 20px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.065), inset 0 -1px 0 rgba(0,0,0,0.6), inset 2px 0 4px rgba(255,255,255,0.03), inset -2px 0 4px rgba(0,0,0,0.45)',
        position: 'relative',
      }}>
        <div
          className="screen-tv"
          onClick={handleZoom}
          style={{
            background: '#080a0c', height: 260, borderRadius: 10,
            position: 'relative', overflow: 'hidden',
            boxShadow: 'inset 0 12px 28px rgba(0,0,0,0.95), inset 0 0 0 1px rgba(0,0,0,1), 0 0 0 1px rgba(255,255,255,0.04)',
            display: 'flex', flexDirection: 'column', padding: 24,
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
          <div ref={mainScreenBlackoutRef} style={{ position:'absolute', inset:0, background:'#080a0c', borderRadius:10, pointerEvents:'none', zIndex:20 }} />

          {bootingUp ? (
            <LoadingScreen
              onDone={handleBootDone}
              screenColor={screenColor}
              screenGlow={screenGlow}
            />
          ) : activeIndex === 4 ? (
            /* ── Video mode — fills the screen, CRT effects sit on top ── */
            /* overflow:hidden clips the TikTok watermark at the bottom */
            <div key="video" style={{ position:'absolute', inset:0, overflow:'hidden', borderRadius:10, zIndex:0 }}>
              <video
                src={VIDEO_URL}
                autoPlay
                loop
                muted={false}
                playsInline
                style={{
                  position:'absolute',
                  top:0, left:0,
                  width:'100%',
                  /* Scale height ~15% taller so the bottom watermark is pushed out of the clipping container */
                  height:'115%',
                  objectFit:'cover',
                  objectPosition:'top',
                }}
              />
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

              {/* Audio viz */}
              <div style={{ display:'flex', gap:3, alignItems:'flex-end', height:24 }}>
                {Array.from({ length: 28 }).map((_, i) => (
                  <div key={i} ref={el => { audioBarsRef.current[i] = el }}
                    style={{ width:6, height:4, background:screenColor, opacity:0.8, borderRadius:1, flexShrink:0, transition:'background 0.3s' }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── PCB EASTER EGG ────────────────────────────────── */}
      {showPCB && (
        <PCBView onClose={() => {
          setShowPCB(false)
          setClickedBolts(new Set())
        }} />
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
              className="crt-scrollable crt-flicker"
              style={{
                color: amber,
                fontFamily: 'var(--font-jetbrains-mono), monospace',
                textShadow: `0 0 10px rgba(${modalRGB},0.22)`,
              }}
            >
              {/* ── Two-column layout: sticky sidebar + scrollable content */}
              <div style={{ display:'flex', gap:0, alignItems:'flex-start', minHeight:'100%' }}>

                {/* ── LEFT SIDEBAR — sticky */}
                <div style={{
                  position:'sticky', top:0,
                  width:280, flexShrink:0,
                  paddingRight:36,
                  paddingTop:4,
                  borderRight:`1px solid ${amberFaint}`,
                }}>
                  {/* ID badge */}
                  <span style={{
                    fontSize:9, letterSpacing:2.5, color:amberLabel,
                    border:`1px solid ${amberFaint}`, padding:'2px 8px', borderRadius:2,
                    display:'inline-block', marginBottom:20,
                  }}>{section.id}</span>

                  {/* Project title */}
                  <div style={{ fontSize:24, fontWeight:700, lineHeight:1.25, letterSpacing:-0.3, color:amber, marginBottom:10 }}>
                    {section.title}
                  </div>

                  {/* Sub-heading — tech */}
                  <div style={{ fontSize:10, letterSpacing:1.5, color:amberLabel, lineHeight:1.6, marginBottom:28 }}>
                    {section.tech}
                  </div>

                  {/* Trace divider */}
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:24 }}>
                    <div style={{ width:4, height:4, borderRadius:1, background:`rgba(${modalRGB},0.4)`, flexShrink:0 }} />
                    <div style={{ flex:1, height:1, background:`linear-gradient(90deg, ${amberFaint}, transparent)` }} />
                  </div>

                  {/* Meta rows */}
                  {([
                    { label:'ROLE', value: details.role },
                    { label:'YEAR', value: details.year },
                  ] as {label:string;value:string}[]).map(({ label, value }) => (
                    <div key={label} style={{ marginBottom:18 }}>
                      <div style={{ fontSize:8, letterSpacing:3, color:amberLabel, marginBottom:5 }}>▪ {label}</div>
                      <div style={{ fontSize:12, color:amberDim, lineHeight:1.5 }}>{value}</div>
                    </div>
                  ))}

                  {/* Bottom trace */}
                  <div style={{ marginTop:32, display:'flex', alignItems:'center', gap:6 }}>
                    <div style={{ flex:1, height:1, background:`linear-gradient(90deg, transparent, ${amberFaint})` }} />
                    <div style={{ width:4, height:4, borderRadius:1, background:`rgba(${modalRGB},0.4)`, flexShrink:0 }} />
                  </div>

                  {/* Footer hint */}
                  <div style={{ marginTop:16, fontSize:9, letterSpacing:2, color:`rgba(${modalRGB},0.22)` }}>
                    [ESC] CLOSE
                  </div>
                </div>

                {/* ── RIGHT CONTENT — scrolls naturally */}
                <div style={{ flex:1, minWidth:0, paddingLeft:36 }}>

                  {/* Hero image placeholder */}
                  <div style={{
                    height:210, border:`1px solid ${amberFaint}`, borderRadius:4,
                    background:`rgba(${modalRGB},0.02)`, position:'relative', marginBottom:20, overflow:'hidden',
                  }}>
                    {[{top:6,left:6},{top:6,right:6},{bottom:6,left:6},{bottom:6,right:6}].map((pos, i) => (
                      <div key={i} style={{
                        position:'absolute', width:12, height:12,
                        borderTop: i < 2 ? `1px solid ${amberFaint}` : 'none',
                        borderBottom: i >= 2 ? `1px solid ${amberFaint}` : 'none',
                        borderLeft: (i===0||i===2) ? `1px solid ${amberFaint}` : 'none',
                        borderRight: (i===1||i===3) ? `1px solid ${amberFaint}` : 'none',
                        ...pos,
                      }} />
                    ))}
                    <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, letterSpacing:3, color:`rgba(${modalRGB},0.2)` }}>
                      [ PREVIEW ]
                    </div>
                  </div>

                  {/* Overview text */}
                  <p style={{ fontSize:13, lineHeight:1.95, color:amber, letterSpacing:0.2, marginBottom:20, whiteSpace:'pre-line' }}>
                    {details.overview}
                  </p>

                  {/* 2-col spec cards */}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:32 }}>
                    {details.specs.map(({ label, value }) => (
                      <div key={label} style={{
                        background:`rgba(${modalRGB},0.03)`, border:`1px solid ${amberFaint}`,
                        borderRadius:3, padding:'11px 14px', display:'flex', flexDirection:'column', gap:6,
                      }}>
                        <span style={{ fontSize:8, letterSpacing:2.5, color:amberLabel }}>▪ {label}</span>
                        <span style={{ fontSize:12, color:amber, letterSpacing:0.2, lineHeight:1.3 }}>{value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Custom sections OR default PROCESS + OUTCOMES */}
                  {(details as Record<string,any>).sections ? (
                    ((details as Record<string,any>).sections as Array<{label:string;body?:string;items?:string[];image?:string;images?:string[]}>).map((sec, si, arr) => (
                      <div key={si} style={{ marginBottom: si < arr.length - 1 ? 36 : 52 }}>

                        {/* Section header */}
                        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
                          <div style={{ width:4, height:4, background:`rgba(${modalRGB},0.5)`, borderRadius:1, flexShrink:0 }} />
                          <span style={{ fontSize:9, letterSpacing:3.5, color:amberLabel }}>{sec.label}</span>
                          <div style={{ flex:1, height:1, background:`linear-gradient(90deg, ${amberFaint}, transparent)` }} />
                        </div>

                        {/* Body text */}
                        {sec.body && (
                          <p style={{ fontSize:13, lineHeight:1.95, color:amberDim, letterSpacing:0.1, marginBottom: (sec.items || sec.image || sec.images) ? 16 : 0 }}>
                            {sec.body}
                          </p>
                        )}

                        {/* Bullet items */}
                        {sec.items && (
                          <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom: (sec.image || sec.images) ? 16 : 0 }}>
                            {sec.items.map((item, ii) => (
                              <div key={ii} style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
                                <div style={{ width:3, height:3, background:`rgba(${modalRGB},0.55)`, borderRadius:1, flexShrink:0, marginTop:7 }} />
                                <p style={{ fontSize:13, lineHeight:1.9, color:amberDim, letterSpacing:0.1 }}>{item}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Single image */}
                        {sec.image && !sec.images && (
                          <div style={{ border:`1px solid ${amberFaint}`, borderRadius:4, overflow:'hidden' }}>
                            <img src={sec.image} alt={sec.label} style={{ display:'block', width:'100%', height:'auto' }} />
                          </div>
                        )}

                        {/* Multiple images — stacked */}
                        {sec.images && sec.images.map((src: string, ii: number) => (
                          <div key={ii} style={{ border:`1px solid ${amberFaint}`, borderRadius:4, marginBottom: ii < sec.images!.length - 1 ? 12 : 0, overflow:'hidden' }}>
                            <img src={src} alt={`${sec.label} ${ii + 1}`} style={{ display:'block', width:'100%', height:'auto' }} />
                          </div>
                        ))}

                      </div>
                    ))
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
            style={{ opacity: 0 }}
          >
            {/* Zoomed polaroid body */}
            <div style={{
              width: 320,
              background: '#f5f2ec',
              padding: '18px 18px 56px 18px',
              boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 8px 20px rgba(0,0,0,0.3)',
            }}>
              <div style={{ position: 'relative', overflow: 'hidden', height: 300 }}>
                <img
                  src="/nyc.jpg"
                  alt="NYC – Employees Only"
                  style={{
                    width: '100%', height: '100%',
                    objectFit: 'cover', objectPosition: 'center',
                    display: 'block',
                    filter: 'sepia(0.38) saturate(0.72) brightness(0.84) contrast(0.88)',
                  }}
                />
                <div style={{
                  position: 'absolute', inset: 0, pointerEvents: 'none',
                  background: 'radial-gradient(ellipse 88% 82% at 50% 50%, transparent 45%, rgba(30,20,10,0.38) 100%)',
                }} />
                <div style={{
                  position: 'absolute', inset: 0, pointerEvents: 'none',
                  background: 'rgba(210,180,120,0.10)', mixBlendMode: 'multiply',
                }} />
              </div>
              <div style={{
                marginTop: 14, textAlign: 'center',
                fontFamily: 'var(--font-caveat), "Caveat", cursive',
                fontWeight: 600, color: '#3a3020',
                textShadow: '0.3px 0.3px 0 rgba(20,12,0,0.12)',
              }}>
                <div style={{ fontSize: 26, letterSpacing: '0.2px', lineHeight: 1.2 }}>
                  nyc – employees only
                </div>
                <div style={{ fontSize: 18, opacity: 0.62, marginTop: 4, letterSpacing: '0.3px' }}>
                  summer 2025
                </div>
              </div>
            </div>
            {/* Close hint */}
            <div style={{
              marginTop: 16, textAlign: 'center',
              fontFamily: 'var(--font-jetbrains-mono), monospace',
              fontSize: 10, letterSpacing: 2, color: 'rgba(255,255,255,0.28)',
            }}>
              CLICK ANYWHERE TO CLOSE
            </div>
          </div>
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
            background:'linear-gradient(145deg, #3a4248 0%, #252c32 45%, #181c20 100%)',
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
              <canvas ref={metalCanvasRef} style={{ position:'absolute', inset:0, width:'100%', height:'100%', borderRadius:'50%', pointerEvents:'none', opacity: isPoweredOn ? 1 : 0.08, transition:'opacity 0.5s' }} />
              <div ref={rotatorRef} className="knob-rotator">
                <div className="knob-grip" />
                <div className="knob-indicator" />
              </div>
            </div>
            {/* Power-off overlay — last child so it renders above knob; dims entire assembly */}
            <div style={{ position:'absolute', inset:0, borderRadius:'50%', pointerEvents:'none', zIndex:20, transition:'opacity 0.5s', opacity: isPoweredOn ? 0 : 0.82, background:'rgba(8,10,12,0.9)' }} />
          </div>
        </div>

        {/* COL 2 — Sticky note + Polaroid */}
        <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap: 20 }}>
          {/* Subtle paper grain — low opacity, no texture distortion */}
          <svg style={{ position:'absolute', width:0, height:0, overflow:'hidden' }} aria-hidden>
            <defs>
              <filter id="paper-grain" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
                <feTurbulence type="fractalNoise" baseFrequency="0.72 0.68" numOctaves="3" seed="5" stitchTiles="stitch" result="noise" />
                <feColorMatrix type="saturate" values="0" in="noise" result="gray" />
                <feComponentTransfer in="gray" result="dimGray">
                  <feFuncR type="linear" slope="0.18" intercept="0.41"/>
                  <feFuncG type="linear" slope="0.18" intercept="0.41"/>
                  <feFuncB type="linear" slope="0.18" intercept="0.41"/>
                </feComponentTransfer>
                <feBlend in="SourceGraphic" in2="dimGray" mode="multiply" result="out" />
                <feComposite in="out" in2="SourceGraphic" operator="in" />
              </filter>
            </defs>
          </svg>

          <div style={{
            position: 'relative',
            width: 152,
            background: 'linear-gradient(160deg, #fefce8 0%, #fef3c7 55%, #fde68a 100%)',
            borderRadius: 2,
            padding: '24px 15px 18px',
            transform: 'rotate(-4deg) translateY(14px)',
            filter: 'url(#paper-grain)',
            boxShadow: [
              '2px 3px 6px rgba(0,0,0,0.18)',
              '5px 8px 20px rgba(0,0,0,0.15)',
              'inset 0 1px 0 rgba(255,255,255,0.60)',
              'inset 1px 0 0 rgba(255,255,255,0.35)',
            ].join(', '),
          }}>
            {/* Ruled lines */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: 2, pointerEvents: 'none', zIndex: 0,
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(120,160,200,0.10) 20px, rgba(120,160,200,0.10) 21px)',
              backgroundPositionY: '30px',
            }} />
            {/* Wrinkle 1 — diagonal crease upper-left to mid */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: 2, pointerEvents: 'none', zIndex: 1,
              background: [
                /* shadow side of crease */
                'linear-gradient(128deg, transparent 28%, rgba(0,0,0,0.045) 33%, transparent 36%)',
                /* highlight side of crease */
                'linear-gradient(128deg, transparent 33%, rgba(255,255,255,0.18) 36%, transparent 39%)',
              ].join(', '),
            }} />
            {/* Wrinkle 2 — shallow horizontal crease near bottom third */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: 2, pointerEvents: 'none', zIndex: 1,
              background: [
                'linear-gradient(182deg, transparent 62%, rgba(0,0,0,0.035) 65%, transparent 67%)',
                'linear-gradient(182deg, transparent 65%, rgba(255,255,255,0.13) 67%, transparent 69%)',
              ].join(', '),
            }} />
            {/* Corner curl shadow */}
            <div style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 32, height: 32,
              background: 'linear-gradient(225deg, rgba(0,0,0,0.12) 0%, transparent 65%)',
              borderRadius: '0 0 2px 0',
              pointerEvents: 'none', zIndex: 3,
            }} />
            {/* Tape */}
            <div style={{
              position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%) rotate(0.8deg)',
              width: 52, height: 23,
              background: 'linear-gradient(180deg, rgba(255,255,255,0.50) 0%, rgba(238,235,205,0.42) 100%)',
              backdropFilter: 'blur(2px)',
              borderRadius: 2,
              boxShadow: '0 1px 4px rgba(0,0,0,0.12), inset 0 1px 1px rgba(255,255,255,0.75)',
              zIndex: 4,
            }} />
            {/* Text */}
            <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
              <div style={{
                fontFamily: 'var(--font-caveat), "Caveat", cursive',
                fontSize: 18,
                lineHeight: 1.45,
                color: '#2e2510',
                fontWeight: 600,
                textShadow: '0.4px 0.5px 0 rgba(30,20,5,0.15)',
              }}>
                Rotate dial to<br />browse projects
              </div>
            </div>
          </div>

          {/* ── Polaroid ── */}
          <div
            ref={polaroidRef}
            onMouseEnter={handlePolaroidEnter}
            onMouseLeave={handlePolaroidLeave}
            onClick={handlePolaroidZoom}
            style={{
              position: 'relative',
              transform: 'rotate(5.5deg) translateY(-10px)',
              flexShrink: 0,
              cursor: 'pointer',
            }}
          >
            {/* Tape on top of polaroid */}
            <div style={{
              position: 'absolute',
              top: -12, left: '50%',
              transform: 'translateX(-50%) rotate(-1.4deg)',
              width: 58, height: 22,
              background: 'linear-gradient(180deg, rgba(255,255,255,0.48) 0%, rgba(238,235,205,0.40) 100%)',
              backdropFilter: 'blur(2px)',
              borderRadius: 2,
              boxShadow: '0 1px 4px rgba(0,0,0,0.12), inset 0 1px 1px rgba(255,255,255,0.72)',
              zIndex: 5,
            }} />

            {/* Polaroid body */}
            <div style={{
              width: 145,
              background: '#f5f2ec',
              padding: '9px 9px 24px 9px',
              boxShadow: [
                '3px 6px 18px rgba(0,0,0,0.32)',
                '1px 2px 5px rgba(0,0,0,0.18)',
                'inset 0 0 0 0.5px rgba(0,0,0,0.06)',
              ].join(', '),
            }}>
              {/* Photo */}
              <div style={{
                position: 'relative',
                overflow: 'hidden',
                height: 138,
              }}>
                {/* Vintage colour grading */}
                <img
                  src="/nyc.jpg"
                  alt="NYC – Employees Only"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                    display: 'block',
                    filter: 'sepia(0.38) saturate(0.72) brightness(0.84) contrast(0.88)',
                  }}
                />
                {/* Faded-edge vignette — simulates old print bleed */}
                <div style={{
                  position: 'absolute', inset: 0, pointerEvents: 'none',
                  background: 'radial-gradient(ellipse 88% 82% at 50% 50%, transparent 45%, rgba(30,20,10,0.38) 100%)',
                }} />
                {/* Warm colour cast overlay */}
                <div style={{
                  position: 'absolute', inset: 0, pointerEvents: 'none',
                  background: 'rgba(210,180,120,0.10)',
                  mixBlendMode: 'multiply',
                }} />
              </div>

              {/* Handwritten caption */}
              <div style={{
                marginTop: 6,
                textAlign: 'center',
                fontFamily: 'var(--font-caveat), "Caveat", cursive',
                fontWeight: 600,
                color: '#3a3020',
                textShadow: '0.3px 0.3px 0 rgba(20,12,0,0.12)',
              }}>
                <div style={{ fontSize: 17, letterSpacing: '0.2px', lineHeight: 1.2 }}>
                  nyc – employees only
                </div>
                <div style={{ fontSize: 13, opacity: 0.62, marginTop: 2, letterSpacing: '0.3px' }}>
                  summer 2025
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* COL 3 — Aux controls */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:28, paddingRight:8, gridColumn: 3 }}>
          {/* Skeuomorphic clock screen */}
          <div style={{
            background: 'linear-gradient(160deg, #1e252c 0%, #141a1f 55%, #0d1115 100%)',
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
              background: '#030507',
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
                <div style={{ fontSize:6.5, letterSpacing:3, color:screenColor, opacity:0.45, marginBottom:5, textTransform:'uppercase' }}>
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
                position:'absolute', inset:0, background:'#030507',
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
                background: 'linear-gradient(135deg, #1e2226 0%, #161a1e 50%, #0e1214 100%)',
                boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.8), inset 0 -1px 2px rgba(255,255,255,0.05), 2px 3px 8px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)',
                position:'relative',
              }}
            >
              {/* Thumb */}
              <div
                className={undefined}
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
                <div style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: isPoweredOn
                    ? 'radial-gradient(circle at 35% 30%, #ff6666 0%, #ee1122 45%, #aa0010 100%)'
                    : 'radial-gradient(circle at 35% 30%, #6b1a1e 0%, #3d0c0f 55%, #220608 100%)',
                  boxShadow: isPoweredOn
                    ? '0 0 4px 1px rgba(255,30,40,0.9), 0 0 10px 3px rgba(200,10,20,0.55), inset 0 1px 1px rgba(255,140,140,0.5)'
                    : 'inset 0 1px 2px rgba(0,0,0,0.6), inset 0 -1px 1px rgba(255,60,60,0.08)',
                  transition: 'background 0.35s, box-shadow 0.35s',
                  flexShrink: 0,
                }} />
              </div>
            </div>
          </div>

          {/* Speaker grille slats */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(6, 6px)', gap:7 }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} style={{
                width:6, height:22, borderRadius:1, overflow:'hidden', position:'relative',
                background: 'linear-gradient(180deg, #44505a 0%, #0e1214 16%, #06080a 50%, #0e1214 84%, #44505a 100%)',
                boxShadow: '1px 0 0 rgba(255,255,255,0.08), -1px 0 0 rgba(0,0,0,0.75), 0 1px 0 rgba(255,255,255,0.07), 0 -1px 0 rgba(255,255,255,0.07)',
              }}>
                {/* Mesh screen — visible inside the dark slot */}
                <div style={{
                  position:'absolute', inset:'17% 0 17%',
                  backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.045) 0px, rgba(255,255,255,0.045) 1px, transparent 1px, transparent 2px), repeating-linear-gradient(90deg, rgba(255,255,255,0.045) 0px, rgba(255,255,255,0.045) 1px, transparent 1px, transparent 2px)',
                  backgroundSize: '2px 2px',
                }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
