'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import gsap from 'gsap'

// ── Style constants ────────────────────────────────────────────
const chipBlack: React.CSSProperties = {
  background: 'linear-gradient(135deg, #242424 0%, #0a0a0a 100%)',
  border: '1px solid #333',
  boxShadow: '4px 6px 15px rgba(0,0,0,0.7), inset 1px 1px 2px rgba(255,255,255,0.05)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  position: 'absolute',
  color: '#555',
  overflow: 'hidden',
}

const chipSilver: React.CSSProperties = {
  background: 'linear-gradient(135deg, #f3f4f6 0%, #9ca3af 100%)',
  border: '1px solid #d1d5db',
  boxShadow: '3px 5px 12px rgba(0,0,0,0.6)',
  position: 'absolute',
  display: 'flex',
  flexDirection: 'column',
  color: '#374151',
  padding: '4px',
}

const pcbLabel: React.CSSProperties = {
  position: 'absolute',
  color: '#81ad8a',
  fontSize: '9px',
  whiteSpace: 'nowrap',
  letterSpacing: '0.5px',
  zIndex: 10,
}

const glowDot: React.CSSProperties = {
  position: 'absolute',
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  background: '#fcd34d',
  boxShadow: '0 0 10px 2px rgba(245,158,11,0.8)',
  zIndex: 5,
}

const pinVBase: React.CSSProperties = {
  background: '#111',
  border: '1px solid #333',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  padding: '2px',
  boxShadow: '2px 2px 5px rgba(0,0,0,0.5)',
  position: 'absolute',
}

const pinVItem: React.CSSProperties = {
  width: '100%',
  height: '10%',
  background: 'linear-gradient(90deg, #fbbf24, #b45309)',
}

const pinHBase: React.CSSProperties = {
  background: '#111',
  border: '1px solid #333',
  display: 'flex',
  justifyContent: 'space-between',
  padding: '2px',
  boxShadow: '2px 2px 5px rgba(0,0,0,0.5)',
  position: 'absolute',
}

const pinHItem: React.CSSProperties = {
  height: '100%',
  width: '10%',
  background: 'linear-gradient(180deg, #fbbf24, #b45309)',
}

// ── Sub-components ─────────────────────────────────────────────
function PinV({ style, count }: { style: React.CSSProperties; count: number }) {
  return (
    <div style={{ ...pinVBase, ...style }}>
      {Array.from({ length: count }).map((_, i) => <div key={i} style={pinVItem} />)}
    </div>
  )
}

function PinH({ style, count }: { style: React.CSSProperties; count: number }) {
  return (
    <div style={{ ...pinHBase, ...style }}>
      {Array.from({ length: count }).map((_, i) => <div key={i} style={pinHItem} />)}
    </div>
  )
}

function IcPinsV({ side, pinCount = 4 }: { side: 'left' | 'right'; pinCount?: number }) {
  const s: React.CSSProperties = {
    position: 'absolute',
    width: '2px',
    height: '80%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    top: '10%',
  }
  if (side === 'left') s.left = '-2px'; else s.right = '-2px'
  return (
    <div style={s}>
      {Array.from({ length: pinCount }).map((_, i) => (
        <div key={i} style={{ width: '100%', height: '2px', background: '#d1d5db' }} />
      ))}
    </div>
  )
}

function SmdCGroup({ style, count }: { style: React.CSSProperties; count: number }) {
  return (
    <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', ...style }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ width: '100%', height: '8%', background: '#a38a6a', borderLeft: '2px solid #e5e7eb', borderRight: '2px solid #e5e7eb', boxShadow: '1px 2px 3px rgba(0,0,0,0.6)' }} />
      ))}
    </div>
  )
}

function SmdRGroup({ style, count }: { style: React.CSSProperties; count: number }) {
  return (
    <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', ...style }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ width: '100%', height: '10%', background: '#111', borderLeft: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb', boxShadow: '1px 2px 3px rgba(0,0,0,0.6)' }} />
      ))}
    </div>
  )
}

function ConnV({ style }: { style: React.CSSProperties }) {
  return (
    <div style={{ background: '#e5e7eb', border: '1px solid #9ca3af', boxShadow: '2px 3px 6px rgba(0,0,0,0.5)', position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 15, ...style }}>
      <div style={{ position: 'absolute', background: '#111', width: '4px', height: '80%' }} />
    </div>
  )
}

function ConnH({ style }: { style: React.CSSProperties }) {
  return (
    <div style={{ background: '#e5e7eb', border: '1px solid #9ca3af', boxShadow: '2px 3px 6px rgba(0,0,0,0.5)', position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 15, ...style }}>
      <div style={{ position: 'absolute', background: '#111', height: '4px', width: '80%' }} />
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────
export default function PCBView({ onClose, onSdInserted, initialSdInserted }: { onClose: () => void; onSdInserted?: (inserted: boolean) => void; initialSdInserted?: boolean }) {
  const wrapRef  = useRef<HTMLDivElement>(null)
  const sdRef    = useRef<HTMLDivElement>(null)
  const [sdInserted, setSdInserted] = useState(initialSdInserted ?? false)

  useEffect(() => {
    if (wrapRef.current) {
      gsap.fromTo(wrapRef.current,
        { opacity: 0, scale: 0.94 },
        { opacity: 1, scale: 1, duration: 0.45, ease: 'power3.out' }
      )
    }
  }, [])

  const handleClose = () => {
    if (!wrapRef.current) { onClose(); return }
    gsap.to(wrapRef.current, {
      opacity: 0, scale: 0.94, duration: 0.3, ease: 'power2.in',
      onComplete: onClose,
    })
  }

  const pcbRef       = useRef<HTMLDivElement>(null)
  const startPtr     = useRef({ x: 0, y: 0 })   // pointer at drag start
  const startXY      = useRef({ x: 0, y: 0 })   // card translate at drag start
  const currentXY    = useRef({ x: 0, y: 0 })   // live translate
  const isDraggingSd = useRef(false)

  const onSdPointerDown = useCallback((e: React.PointerEvent) => {
    if (sdInserted) return
    e.preventDefault()
    e.stopPropagation()
    isDraggingSd.current = true
    sdRef.current!.setPointerCapture(e.pointerId)
    startPtr.current = { x: e.clientX, y: e.clientY }
    startXY.current  = { ...currentXY.current }
    gsap.killTweensOf(sdRef.current)
  }, [sdInserted])

  const onSdPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingSd.current) return
    const dx = e.clientX - startPtr.current.x + startXY.current.x
    const dy = e.clientY - startPtr.current.y + startXY.current.y
    currentXY.current = { x: dx, y: dy }
    gsap.set(sdRef.current, { x: dx, y: dy })
  }, [])

  const onSdPointerUp = useCallback(() => {
    if (!isDraggingSd.current) return
    isDraggingSd.current = false

    const el  = sdRef.current!
    const pcb = pcbRef.current!
    const pcbRect = pcb.getBoundingClientRect()
    const elRect  = el.getBoundingClientRect()

    // Card center relative to PCB in %
    const cx = ((elRect.left + elRect.width  / 2) - pcbRect.left) / pcbRect.width  * 100
    const cy = ((elRect.top  + elRect.height / 2) - pcbRect.top)  / pcbRect.height * 100

    // Slot center: storage chip is at left:81%, top:10%-23% → center ~81%+3.75%, 16.5%
    const SLOT_CX = 84.75, SLOT_CY = 16.5
    const dist = Math.hypot(cx - SLOT_CX, cy - SLOT_CY)

    if (dist < 10) {
      // Compute translate needed to land card at slot position
      const slotPixX = pcbRect.left + SLOT_CX / 100 * pcbRect.width  - elRect.width  / 2
      const slotPixY = pcbRect.top  + 10       / 100 * pcbRect.height
      const snapX = currentXY.current.x + (slotPixX - elRect.left)
      const snapY = currentXY.current.y + (slotPixY - elRect.top)
      gsap.to(el, {
        x: snapX, y: snapY, duration: 0.2, ease: 'power3.out',
        onComplete: () => {
          currentXY.current = { x: snapX, y: snapY }
          setSdInserted(true)
          onSdInserted?.(true)
        },
      })
    } else {
      // Spring back to home (translate 0,0)
      gsap.to(el, {
        x: 0, y: 0, duration: 0.35, ease: 'back.out(1.8)',
        onComplete: () => { currentXY.current = { x: 0, y: 0 } },
      })
    }
  }, [onSdInserted])

  const handleSdEject = useCallback(() => {
    if (!sdInserted) return
    setSdInserted(false)
    onSdInserted?.(false)
    gsap.to(sdRef.current, {
      x: 0, y: 0, duration: 0.3, ease: 'back.out(1.6)',
      onComplete: () => { currentXY.current = { x: 0, y: 0 } },
    })
  }, [sdInserted, onSdInserted])

  return (
    <div
      ref={wrapRef}
      style={{
        position: 'absolute', inset: 0,
        borderRadius: 24, overflow: 'hidden',
        background: '#1e2023',
        boxShadow: 'inset 0 5px 25px rgba(0,0,0,0.9)',
        display: 'flex', flexDirection: 'column',
        padding: '20px 24px 16px',
        fontFamily: 'var(--font-jetbrains-mono), monospace',
        zIndex: 200, opacity: 0,
        gap: '12px',
      }}
    >

      {/* ── Top bar — flex row, no absolute overlap ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '16px',
        flexShrink: 0, zIndex: 30, position: 'relative',
      }}>
        {/* Close button */}
        <button
          onClick={handleClose}
          style={{
            background: '#f0f4f8', color: '#2c333a',
            fontSize: '11px', fontWeight: 700, padding: '10px 20px',
            borderRadius: '4px', flexShrink: 0,
            boxShadow: '0 4px 6px rgba(0,0,0,0.3), inset 0 1px 0 white',
            border: '1px solid #d1d5db',
            letterSpacing: '0.1em', cursor: 'pointer',
            fontFamily: 'inherit', transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#ffffff')}
          onMouseLeave={e => (e.currentTarget.style.background = '#f0f4f8')}
        >
          CLOSE HOUSING
        </button>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Green LED */}
        <div style={{
          width: '10px', height: '10px', borderRadius: '50%',
          background: '#4ade80', flexShrink: 0,
          boxShadow: '0 0 15px 2px #4ade80',
        }} />
      </div>

      {/* ── PCB Board ── */}
      <div ref={pcbRef} style={{
        flex: 1,
        background: '#1c3d24',
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '12px 12px',
        borderRadius: '12px',
        position: 'relative',
        boxShadow: 'inset 0 0 60px rgba(0,0,0,0.8), 0 10px 30px rgba(0,0,0,0.5)',
        border: '2px solid #2a5234',
        zIndex: 10,
        overflow: 'hidden',
      }}>

        {/* ── SVG traces — all connected to component positions ── */}
        {/*
          Component positions (% → viewBox 1000×600):
          J14_DIAG left top:  x=40–52,  y=60–144   → right edge x=52
          J14_DIAG left bot:  x=40–52,  y=300–384  → right edge x=52
          WIFI module:        x=80–180, y=84–150    → left x=80
          XZNETIC:            x=140–290,y=222–372   → right x=290, left x=140
          Memory:             x=400–475,y=168–348   → left x=400, right x=475
          Small IC top:       x=330–375,y=84–129    → right x=375, center y=106
          FPC V1:             x=530–542,y=216–270   → left x=530, center y=243
          FPC V2:             x=530–542,y=288–342   → left x=530, center y=315
          FPC H1:             x=480–535,y=480–492
          FPC H2:             x=565–620,y=480–492
          Small IC right mid: x=590–625,y=252–285   → left x=590
          J14_DIAG horiz:     x=630–695,y=84–96     → right x=695
          Storage:            x=810–885,y=60–138    → left x=810
          POWER_MGMT:         x=730–785,y=300–354   → right x=785
          DSP_AUDIO:          x=730–785,y=420–474   → right x=785
          J15_PWR:            x=950–962,y=228–300   → left x=950
          J16_PWR:            x=950–962,y=360–408   → left x=950
          J16_OTA:            x=950–962,y=450–510   → left x=950
          2O_HEADER:          x=100–190,y=480–492   → right x=190
          J15_PNR:            x=280–355,y=480–492   → left x=280
        */}
        <svg
          viewBox="0 0 1000 600"
          preserveAspectRatio="none"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2 }}
        >
          {/* ── Primary traces ── */}
          <g stroke="#649e6d" strokeWidth="2" fill="none" opacity="0.75">

            {/* J14_DIAG left top → WIFI module */}
            <path d="M 52 90  L 80 90" />
            <path d="M 52 105 L 80 105" />
            <path d="M 52 120 L 80 120" />

            {/* J14_DIAG left bottom → XZNETIC left */}
            <path d="M 52 318 L 100 318 L 100 262 L 140 262" />
            <path d="M 52 332 L 108 332 L 108 278 L 140 278" />
            <path d="M 52 346 L 116 346 L 116 297 L 140 297" />

            {/* WIFI module right → Small IC top left (data bus) */}
            <path d="M 180 100 L 280 100 L 280 106 L 330 106" />
            <path d="M 180 117 L 270 117 L 270 115 L 330 115" />

            {/* XZNETIC right → Memory module left */}
            <path d="M 290 248 L 340 248 L 340 210 L 400 210" />
            <path d="M 290 270 L 350 270 L 350 230 L 400 230" />
            <path d="M 290 297 L 360 297 L 360 258 L 400 258" />
            <path d="M 290 324 L 350 324 L 350 290 L 400 290" />

            {/* Small IC top right → Memory top */}
            <path d="M 375 95  L 420 95  L 420 168" />
            <path d="M 375 106 L 438 106 L 438 168" />

            {/* Memory right → FPC V1 */}
            <path d="M 475 220 L 530 220" />
            <path d="M 475 243 L 530 243" />
            <path d="M 475 266 L 530 266" />

            {/* Memory right → FPC V2 */}
            <path d="M 475 295 L 510 295 L 510 315 L 530 315" />
            <path d="M 475 316 L 506 316 L 506 330 L 530 330" />

            {/* FPC V2 right → Small IC right mid */}
            <path d="M 542 305 L 565 305 L 565 268 L 590 268" />
            <path d="M 542 320 L 572 320 L 572 278 L 590 278" />

            {/* J14_DIAG horiz right → Storage left */}
            <path d="M 695 87 L 810 87" />
            <path d="M 695 93 L 810 93" />

            {/* POWER_MGMT right → J15_PWR left */}
            <path d="M 785 312 L 860 312 L 860 245 L 950 245" />
            <path d="M 785 327 L 870 327 L 870 260 L 950 260" />
            <path d="M 785 342 L 880 342 L 880 278 L 950 278" />

            {/* DSP_AUDIO right → J16_PWR left */}
            <path d="M 785 432 L 855 432 L 855 372 L 950 372" />
            <path d="M 785 447 L 865 447 L 865 385 L 950 385" />

            {/* DSP_AUDIO right → J16_OTA left */}
            <path d="M 785 458 L 895 458 L 895 468 L 950 468" />
            <path d="M 785 465 L 902 465 L 902 480 L 950 480" />

            {/* POWER_MGMT left ← → DSP_AUDIO left (vertical bus) */}
            <path d="M 730 340 L 710 340 L 710 420 L 730 420" />
            <path d="M 730 354 L 716 354 L 716 434 L 730 434" />

            {/* XZNETIC bottom → 2O_HEADER */}
            <path d="M 190 372 L 190 445 L 130 445 L 130 480" />
            <path d="M 210 372 L 210 456 L 145 456 L 145 480" />
            <path d="M 230 372 L 230 462 L 160 462 L 160 480" />

            {/* 2O_HEADER right → J15_PNR left (bottom bus) */}
            <path d="M 190 484 L 280 484" />
            <path d="M 190 488 L 280 488" />

            {/* Small IC bottom → FPC H1 */}
            <path d="M 422 420 L 422 400 L 480 400 L 480 480" />
            <path d="M 440 420 L 440 408 L 510 408 L 510 480" />

            {/* FPC H2 right → Small IC right mid bottom */}
            <path d="M 620 486 L 650 486 L 650 420 L 625 420 L 625 278" />

          </g>

          {/* ── Secondary / fill traces ── */}
          <g stroke="#8abf94" strokeWidth="1" fill="none" opacity="0.35">
            {/* Corner fills */}
            <path d="M 50 60  L 50 30  L 80 30" />
            <path d="M 950 60 L 980 60 L 980 30 L 950 30" />
            <path d="M 50 540 L 50 570 L 80 570" />
            <path d="M 950 540 L 980 540 L 980 570 L 950 570" />
            {/* Long horizontal ground/power planes */}
            <path d="M 60 555 L 940 555" />
            <path d="M 60 45  L 940 45" />
          </g>

          {/* ── Via pads at trace junctions ── */}
          <g fill="#81ad8a" opacity="0.6">
            <circle cx="100" cy="262" r="3" />
            <circle cx="108" cy="278" r="3" />
            <circle cx="116" cy="297" r="3" />
            <circle cx="340" cy="210" r="3" />
            <circle cx="350" cy="230" r="3" />
            <circle cx="360" cy="258" r="3" />
            <circle cx="420" cy="168" r="3" />
            <circle cx="438" cy="168" r="3" />
            <circle cx="510" cy="315" r="3" />
            <circle cx="565" cy="268" r="3" />
            <circle cx="860" cy="245" r="3" />
            <circle cx="870" cy="260" r="3" />
            <circle cx="855" cy="372" r="3" />
            <circle cx="865" cy="385" r="3" />
            <circle cx="895" cy="458" r="3" />
            <circle cx="190" cy="445" r="3" />
            <circle cx="210" cy="456" r="3" />
            <circle cx="480" cy="400" r="3" />
            <circle cx="710" cy="340" r="3" />
            <circle cx="710" cy="420" r="3" />
          </g>
        </svg>

        {/* ── WIFI/BT MODULE KNB48 ── */}
        <div style={{ ...pcbLabel, top: '8%', left: '8%' }}>WIFI/BT MODULE<br />(KNB48)</div>
        <div style={{ ...chipSilver, top: '14%', left: '8%', width: '10%', height: '11%' }}>
          <div style={{ flex: 1, border: '1px solid #a1a1aa', background: '#d1d5db', padding: '4px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ opacity: 0.6, fontSize: '5px', lineHeight: 1.2, fontWeight: 700, color: '#1f2937' }}>KINETIC</span>
            <span style={{ opacity: 0.5, fontSize: '4px', lineHeight: 1.2, marginTop: '2px', color: '#374151' }}>
              WIFI/BT MODULE (KNB48)<br />REV.A 2023-11<br />FCC ID: 2A2...
            </span>
          </div>
        </div>

        {/* ── Small SMD group near WIFI ── */}
        <div style={{ position: 'absolute', display: 'flex', gap: '4px', top: '26%', left: '8%', width: '6%', height: '1.5%' }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ width: '33%', height: '100%', background: '#111', borderLeft: '1px solid #d1d5db', borderRight: '1px solid #d1d5db' }} />
          ))}
        </div>

        {/* ── J14_DIAG left edge (top) ── */}
        <div style={{ ...pcbLabel, top: '17%', left: '0.5%', transform: 'rotate(-90deg)', transformOrigin: 'center' }}>J14_DIAG</div>
        <PinV style={{ top: '10%', left: '4%', width: '1.2%', height: '14%' }} count={8} />

        {/* ── J14_DIAG left edge (bottom) ── */}
        <div style={{ ...pcbLabel, top: '58%', left: '0.5%', transform: 'rotate(-90deg)', transformOrigin: 'center' }}>J14_DIAG</div>
        <PinV style={{ top: '50%', left: '4%', width: '1.2%', height: '14%' }} count={8} />

        {/* ── XZNETIC_CORE X9 ── */}
        <div style={{ ...pcbLabel, top: '33%', left: '14%' }}>XZNETIC_CORE X9</div>
        <div style={{ ...chipBlack, top: '37%', left: '14%', width: '15%', height: '25%' }}>
          <div style={{ position: 'absolute', top: '8px', left: '12px', color: '#777', fontWeight: 700, fontSize: '10px' }}>XZNETIC_CORE X9</div>
          <div style={{ position: 'absolute', top: '24px', left: '12px', color: '#555', fontSize: '8px' }}>13-CORE</div>
          <div style={{ position: 'absolute', bottom: '8px', left: '12px', color: '#444', fontSize: '6px', lineHeight: 1.4 }}>
            KINETIC_CORE X9<br />REV 1.0 - SLK90E<br />// 70-300G
          </div>
        </div>

        {/* ── SMD columns beside XZNETIC ── */}
        <SmdCGroup style={{ top: '38%', left: '10.5%', width: '1.2%', height: '23%' }} count={8} />
        <SmdRGroup style={{ top: '38%', left: '8.5%', width: '0.8%', height: '23%' }} count={8} />

        {/* ── Memory pins below XZNETIC ── */}
        <div style={{ position: 'absolute', display: 'flex', gap: '8px', top: '65%', left: '16%', width: '10%', height: '2.5%' }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{
              width: '20%', height: '100%', background: '#111',
              borderTop: '1px solid white', borderBottom: '1px solid white',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '2px 0',
            }}>
              <div style={{ width: '100%', height: '1px', background: '#444' }} />
              <div style={{ width: '100%', height: '1px', background: '#444' }} />
            </div>
          ))}
        </div>

        {/* ── Small IC (top center) ── */}
        <div style={{ ...chipBlack, top: '14%', left: '33%', width: '4.5%', height: '7.5%' }}>
          <IcPinsV side="left" pinCount={4} />
          <IcPinsV side="right" pinCount={4} />
          <div style={{ position: 'absolute', width: '100%', height: '2px', background: '#333', top: '4px' }} />
          <div style={{ position: 'absolute', width: '100%', height: '2px', background: '#333', bottom: '4px' }} />
        </div>

        {/* ── SMD caps flanking small IC ── */}
        <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', gap: '4px', top: '14%', left: '29%', width: '1.5%', height: '7.5%' }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ width: '100%', height: '20%', background: '#a38a6a', borderLeft: '1px solid #ccc', borderRight: '1px solid #ccc' }} />
          ))}
        </div>
        <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', gap: '4px', top: '14%', left: '39%', width: '1.5%', height: '7.5%' }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ width: '100%', height: '20%', background: '#a38a6a', borderLeft: '1px solid #ccc', borderRight: '1px solid #ccc' }} />
          ))}
        </div>

        {/* ── Memory module KINETIC 64GB DDR5 ── */}
        <div style={{
          position: 'absolute', top: '28%', left: '40%', width: '7.5%', height: '30%',
          background: '#1a2b1e', border: '1px solid #2c4731',
          boxShadow: '0 5px 15px rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '2px', borderRadius: '1px',
        }}>
          <div style={{ width: '3px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '4px 0' }}>
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} style={{ width: '100%', height: '2px', background: '#d4af37' }} />
            ))}
          </div>
          <div style={{
            width: '75%', height: '80%', background: '#0d0d0d',
            border: '1px solid #222', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '2px',
          }}>
            <div style={{ color: '#5a6b5e', fontSize: '7px', transform: 'rotate(-90deg)', whiteSpace: 'nowrap', letterSpacing: '0.2em', fontWeight: 700, textAlign: 'center', lineHeight: 1.4 }}>
              KINETIC<br />// 64GB DDR5
            </div>
          </div>
          <div style={{ width: '3px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '4px 0' }}>
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} style={{ width: '100%', height: '2px', background: '#d4af37' }} />
            ))}
          </div>
        </div>

        {/* ── Small IC (bottom center) ── */}
        <div style={{ ...chipBlack, top: '70%', left: '40%', width: '4.5%', height: '7.5%' }}>
          <IcPinsV side="left" pinCount={4} />
          <IcPinsV side="right" pinCount={4} />
        </div>

        {/* ── FPC vertical connectors ── */}
        <ConnV style={{ top: '36%', left: '53%', width: '1.2%', height: '9%' }} />
        <ConnV style={{ top: '48%', left: '53%', width: '1.2%', height: '9%' }} />

        {/* ── FPC horizontal connectors ── */}
        <ConnH style={{ top: '80%', left: '48%', width: '5.5%', height: '2%' }} />
        <ConnH style={{ top: '80%', left: '56.5%', width: '5.5%', height: '2%' }} />

        {/* ── Rainbow ribbon cable (inside board, connecting FPC V1/V2 to right) ── */}
        <svg
          viewBox="0 0 1000 600"
          preserveAspectRatio="none"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 20 }}
        >
          <g fill="none" strokeWidth="4">
            <path stroke="#e65147" d="M 542 222 L 610 222 Q 625 222 625 237 L 625 420" />
            <path stroke="#e98d3e" d="M 542 232 L 605 232 Q 618 232 618 247 L 618 420" />
            <path stroke="#e6c23d" d="M 542 242 L 600 242 Q 611 242 611 257 L 611 420" />
            <path stroke="#58a356" d="M 542 297 L 595 297 Q 604 297 604 307 L 604 420" />
            <path stroke="#4088bc" d="M 542 307 L 590 307 Q 597 307 597 317 L 597 420" />
            <path stroke="#865c9c" d="M 542 317 L 585 317 Q 590 317 590 327 L 590 420" />
          </g>
        </svg>

        {/* ── Small IC (right mid) ── */}
        <div style={{ ...chipBlack, top: '42%', left: '59%', width: '3.5%', height: '5.5%' }}>
          <IcPinsV side="left" pinCount={3} />
          <IcPinsV side="right" pinCount={3} />
        </div>

        {/* ── STORAGE SD BUS ── */}
        <div style={{ ...pcbLabel, top: '5%', left: '81%', width: '8%', textAlign: 'center' }}>STORAGE<br />SD BUS</div>
        <div style={{ ...chipSilver, top: '10%', left: '81%', width: '7.5%', height: '13%', borderRadius: '4px 4px 0 0' }}>
          <div style={{
            position: 'absolute', bottom: 0, left: '10%', width: '80%', height: '20%',
            borderTop: '2px solid #888', background: '#c0c0c0',
            display: 'flex', justifyContent: 'space-between', padding: '0 4px',
          }}>
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{ width: '2px', height: '100%', background: '#555' }} />
            ))}
          </div>
        </div>

        {/* ── J14_DIAG horizontal pin header ── */}
        <div style={{ ...pcbLabel, top: '10%', left: '63%' }}>J14_DIAG</div>
        <PinH style={{ top: '14%', left: '63%', width: '6.5%', height: '2%' }} count={6} />

        {/* ── POWER_MGMT_IC KPN12 ── */}
        <div style={{ ...pcbLabel, top: '45%', left: '73%' }}>POWER_MGMT_IC<br />(KPN12)</div>
        <div style={{ ...chipBlack, top: '50%', left: '73%', width: '5.5%', height: '9%' }}>
          <IcPinsV side="left" pinCount={6} />
          <IcPinsV side="right" pinCount={6} />
        </div>

        {/* ── DSP_AUDIO KDA91 ── */}
        <div style={{ ...pcbLabel, top: '65%', left: '73%' }}>DSP_AUDIO<br />(KDA91)</div>
        <div style={{ ...chipBlack, top: '70%', left: '73%', width: '5.5%', height: '9%' }}>
          <IcPinsV side="left" pinCount={6} />
          <IcPinsV side="right" pinCount={6} />
        </div>

        {/* ── SMD caps right of ICs ── */}
        <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', gap: '4px', top: '50%', left: '80%', width: '1.2%', height: '9%' }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ width: '100%', height: '20%', background: '#a38a6a', borderLeft: '1px solid #ccc', borderRight: '1px solid #ccc' }} />
          ))}
        </div>
        <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', gap: '4px', top: '70%', left: '80%', width: '1.2%', height: '9%' }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ width: '100%', height: '20%', background: '#a38a6a', borderLeft: '1px solid #ccc', borderRight: '1px solid #ccc' }} />
          ))}
        </div>

        {/* ── J15_PWR right edge ── */}
        <div style={{ ...pcbLabel, top: '39%', left: '91.5%', transform: 'rotate(-90deg)', transformOrigin: 'center' }}>J15_PWR</div>
        <PinV style={{ top: '38%', left: '95%', width: '1.2%', height: '12%' }} count={6} />

        {/* ── J16_PWR right edge ── */}
        <div style={{ ...pcbLabel, top: '58%', left: '91.5%', transform: 'rotate(-90deg)', transformOrigin: 'center' }}>J16_PWR</div>
        <PinV style={{ top: '60%', left: '95%', width: '1.2%', height: '8%' }} count={4} />

        {/* ── J16_OTA right edge ── */}
        <div style={{ ...pcbLabel, top: '74%', left: '91.5%', transform: 'rotate(-90deg)', transformOrigin: 'center' }}>J16_OTA</div>
        <PinV style={{ top: '75%', left: '95%', width: '1.2%', height: '10%' }} count={5} />

        {/* ── 2O_HEADER_J12 bottom ── */}
        <div style={{ ...pcbLabel, top: '75%', left: '10%' }}>2O_HEADER_J12</div>
        <PinH style={{ top: '80%', left: '10%', width: '9%', height: '2%' }} count={8} />
        <div style={{ position: 'absolute', display: 'flex', gap: '4px', top: '84%', left: '10%', width: '9%', height: '1.5%' }}>
          <div style={{ width: '10%', height: '100%', background: '#a38a6a' }} />
          <div style={{ width: '10%', height: '100%', background: '#a38a6a' }} />
          <div style={{ width: '10%', height: '100%', background: '#a38a6a', marginLeft: '16px' }} />
          <div style={{ width: '10%', height: '100%', background: '#a38a6a' }} />
        </div>

        {/* ── J15_PWR bottom label ── */}
        <div style={{ ...pcbLabel, top: '85%', left: '28%' }}>J15_PWR</div>
        <PinH style={{ top: '80%', left: '28%', width: '7.5%', height: '2%' }} count={7} />

        {/* ── SD Card — draggable, home in empty space below J14_DIAG ── */}
        {!sdInserted && (
          <div
            ref={sdRef}
            onPointerDown={onSdPointerDown}
            onPointerMove={onSdPointerMove}
            onPointerUp={onSdPointerUp}
            title="Drag into SD slot"
            style={{
              position: 'absolute', left: '67%', top: '30%',
              width: '6%', zIndex: 30,
              cursor: 'grab', touchAction: 'none', userSelect: 'none',
            }}
          >
            <div style={{ position: 'relative', width: '100%', paddingBottom: '130%' }}>
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(160deg, #e8eaec 0%, #c8cacc 40%, #b0b4b8 100%)',
                borderRadius: '3px 3px 2px 2px',
                boxShadow: '2px 4px 10px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.7)',
                border: '1px solid #9aa0a6', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', top: 0, right: 0, width: '28%', height: '22%', background: 'linear-gradient(135deg, transparent 50%, #9aa0a6 50%)' }} />
                <div style={{
                  position: 'absolute', top: '8%', left: '8%', right: '8%', bottom: '30%',
                  background: 'linear-gradient(160deg, #f5f5f0 0%, #e8e4dc 100%)',
                  borderRadius: '2px', border: '0.5px solid #d0ccc4',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px',
                }}>
                  <span style={{ fontSize: '5px', fontFamily: 'var(--font-jetbrains-mono), monospace', color: '#6b5e4e', letterSpacing: '0.1em', fontWeight: 700 }}>PONYO</span>
                  <span style={{ fontSize: '4px', fontFamily: 'var(--font-jetbrains-mono), monospace', color: '#9a8e82', letterSpacing: '0.05em' }}>64GB</span>
                </div>
                <div style={{ position: 'absolute', bottom: 0, left: '4%', right: '4%', height: '26%', display: 'flex', gap: '2px', alignItems: 'flex-end', padding: '0 3px 2px' }}>
                  {[0,1,2,3,4,5,6].map(i => (
                    <div key={i} style={{ flex: 1, height: '80%', background: 'linear-gradient(180deg, #d4a843 0%, #b8922e 50%, #d4a843 100%)', borderRadius: '0 0 1px 1px' }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── SD inserted indicator — contacts peeking out below slot ── */}
        {sdInserted && (
          <div
            onClick={handleSdEject}
            title="Click to eject"
            style={{
              position: 'absolute', left: '81%', top: '23%',
              width: '7.5%', cursor: 'pointer', zIndex: 30,
            }}
          >
            <div style={{
              width: '100%', height: '10px',
              background: 'linear-gradient(160deg, #d0d3d6 0%, #b8bcbf 100%)',
              borderRadius: '0 0 3px 3px',
              border: '1px solid #9aa0a6', borderTop: 'none',
              display: 'flex', gap: '2px', alignItems: 'center', padding: '2px 4px',
              boxShadow: '0 3px 8px rgba(0,0,0,0.5)',
            }}>
              {[0,1,2,3,4,5,6].map(i => (
                <div key={i} style={{ flex: 1, height: '5px', background: 'linear-gradient(180deg, #d4a843 0%, #b8922e 60%, #d4a843 100%)', borderRadius: '0 0 1px 1px' }} />
              ))}
            </div>
          </div>
        )}

        {/* ── Glow dots at trace junctions / test points ── */}
        {[
          { top: '15%', left: '22%' },
          { top: '34%', left: '20%' },
          { top: '50%', left: '35%' },
          { top: '25%', left: '45%' },
          { top: '60%', left: '48%' },
          { top: '72%', left: '23%' },
          { top: '84%', left: '21%' },
          { top: '14%', left: '55%' },
          { top: '48%', left: '66%' },
          { top: '20%', left: '75%' },
          { top: '33%', left: '72%' },
          { top: '52%', left: '86%' },
          { top: '65%', left: '81%' },
          { top: '80%', left: '85%' },
          { top: '46%', left: '59%' },
          { top: '61%', left: '74%' },
        ].map((pos, i) => (
          <div key={i} style={{ ...glowDot, ...pos }} />
        ))}

      </div>

      {/* ── Bottom label ── */}
      <div style={{
        textAlign: 'center', color: '#4c5c68',
        fontSize: '9px', letterSpacing: '0.4em', fontWeight: 600, opacity: 0.8,
        flexShrink: 0,
      }}>
        KINETIC SYSTEM ARCHITECTURE // INTERNAL DATAPATH SCHEMATIC 04-0 FINAL
      </div>

    </div>
  )
}
