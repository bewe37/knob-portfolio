'use client'

import { useEffect, useRef } from 'react'
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
export default function PCBView({ onClose }: { onClose: () => void }) {
  const wrapRef = useRef<HTMLDivElement>(null)

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

  return (
    <div
      ref={wrapRef}
      style={{
        position: 'absolute', inset: 0,
        borderRadius: 24, overflow: 'hidden',
        background: '#1e2023',
        boxShadow: 'inset 0 5px 25px rgba(0,0,0,0.9)',
        display: 'flex', flexDirection: 'column',
        padding: '32px 32px 20px',
        fontFamily: 'var(--font-jetbrains-mono), monospace',
        zIndex: 200, opacity: 0,
      }}
    >

      {/* ── Top bar ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 30, position: 'relative', flexShrink: 0 }}>
        <button
          onClick={handleClose}
          style={{
            background: '#f0f4f8', color: '#2c333a',
            fontSize: '12px', fontWeight: 700, padding: '12px 24px',
            borderRadius: '4px',
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
        <div style={{
          width: '10px', height: '10px', borderRadius: '50%',
          background: '#4ade80',
          boxShadow: '0 0 15px 2px #4ade80',
        }} />
      </div>

      {/* ── Terminal info box ── */}
      <div style={{
        position: 'absolute', top: '8%', left: '50%', transform: 'translateX(-50%)',
        width: '65%', maxWidth: '800px',
        background: '#16181a',
        border: '1px solid #2c3036',
        borderRadius: '4px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
        zIndex: 30,
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '10px 20px', color: '#6d7b85', fontSize: '10px', letterSpacing: '0.1em', borderBottom: '1px solid #2c3036' }}>
          PRIMARY_INTERFACE_DISPLAY_REV_4.0
        </div>
        <div style={{ padding: '16px 20px', color: '#8a98a3', fontSize: '11px', lineHeight: 1.6, letterSpacing: '0.05em', height: '90px' }}>
          REV 4.0 // ARCH 04-0 // DIAG EXT<br />
          NEVRORS INC B x 5-8<br />
          PRIMARY_INTERFACE_REV.4.0<br />
          TECHNICALPROCESSOR
        </div>
      </div>

      {/* ── Rainbow ribbon cable ── */}
      <div style={{
        position: 'absolute', top: '21%', left: '50%', transform: 'translateX(-50%)',
        width: '55px', height: '7%', zIndex: 20,
        boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
        background: 'linear-gradient(to right, #e65147 0%, #e65147 16%, #e98d3e 16%, #e98d3e 33%, #e6c23d 33%, #e6c23d 50%, #58a356 50%, #58a356 66%, #4088bc 66%, #4088bc 83%, #865c9c 83%, #865c9c 100%)',
      }} />

      {/* ── White connector at top of ribbon ── */}
      <div style={{
        position: 'absolute', top: '21%', left: '50%', transform: 'translateX(-50%)',
        width: '65px', height: '8px',
        background: '#e5e7eb', border: '1px solid #9ca3af',
        zIndex: 30, borderRadius: '2px 2px 0 0',
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
        display: 'flex', justifyContent: 'center', alignItems: 'flex-end', paddingBottom: '1px',
      }}>
        <div style={{ width: '90%', height: '3px', background: '#111' }} />
      </div>

      {/* ── PCB Board ── */}
      <div style={{
        flex: 1,
        marginTop: '11%', marginBottom: '40px', marginLeft: '1%', marginRight: '1%',
        background: '#1c3d24',
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '12px 12px',
        borderRadius: '12px',
        position: 'relative',
        boxShadow: 'inset 0 0 60px rgba(0,0,0,0.8), 0 10px 30px rgba(0,0,0,0.5)',
        border: '2px solid #2a5234',
        zIndex: 10,
      }}>

        {/* ── SVG traces background ── */}
        <svg viewBox="0 0 1000 600" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
          <g stroke="#649e6d" strokeWidth="2" fill="none" opacity="0.6">
            <path d="M 160 270 L 220 270 L 260 230 L 320 230" />
            <path d="M 160 280 L 220 280 L 260 240 L 320 240" />
            <path d="M 160 290 L 220 290 L 260 250 L 320 250" />
            <path d="M 160 300 L 220 300 L 260 260 L 320 260" />
            <path d="M 160 310 L 220 310 L 260 270 L 320 270" />
            <path d="M 160 320 L 220 320 L 260 280 L 320 280" />
            <path d="M 280 340 L 330 340 L 360 300 L 400 300" />
            <path d="M 280 350 L 330 350 L 360 310 L 400 310" />
            <path d="M 280 360 L 330 360 L 360 320 L 400 320" />
            <path d="M 280 370 L 330 370 L 360 330 L 400 330" />
            <path d="M 200 460 L 200 500 L 160 540 L 130 540" />
            <path d="M 210 460 L 210 500 L 170 540 L 140 540" />
            <path d="M 220 460 L 220 500 L 180 540 L 150 540" />
            <path d="M 480 250 L 530 250" />
            <path d="M 480 260 L 530 260" />
            <path d="M 480 270 L 530 270" />
            <path d="M 480 280 L 530 280" />
            <path d="M 480 290 L 530 290" />
            <path d="M 480 300 L 530 300" />
            <path d="M 640 480 L 640 440 L 680 400 L 730 400" />
            <path d="M 650 480 L 650 440 L 690 400 L 730 400" />
            <path d="M 660 480 L 660 440 L 700 400 L 730 400" />
            <path d="M 670 480 L 670 440 L 710 400 L 730 400" />
            <path d="M 780 280 L 810 250 L 810 130 L 840 100" />
            <path d="M 790 280 L 820 250 L 820 130 L 850 100" />
            <path d="M 320 120 L 450 120 L 480 150 L 700 150 L 730 120 L 820 120" />
            <path d="M 120 150 L 250 150 L 280 180 L 350 180" />
            <path d="M 80 520 L 250 520 L 280 490 L 450 490 L 480 520 L 850 520" />
            <path d="M 300 560 L 500 560 L 530 530 L 700 530 L 730 560 L 920 560" />
          </g>
          <g stroke="#8abf94" strokeWidth="1" fill="none" opacity="0.4">
            <path d="M 50 80 L 100 80 L 120 100" />
            <path d="M 60 400 L 100 400 L 120 420" />
            <path d="M 900 200 L 950 200 L 970 220" />
            <path d="M 880 350 L 930 350 L 950 370" />
            <path d="M 750 480 L 800 480 L 820 500" />
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
        <div style={{ ...pcbLabel, top: '25%', left: '3%', transform: 'rotate(-90deg)', transformOrigin: 'left' }}>J14_DIAG</div>
        <PinV style={{ top: '10%', left: '4%', width: '1.2%', height: '14%' }} count={8} />

        {/* ── J14_DIAG left edge (bottom) ── */}
        <div style={{ ...pcbLabel, top: '65%', left: '3%', transform: 'rotate(-90deg)', transformOrigin: 'left' }}>J14_DIAG</div>
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
            border: '1px solid #222',
            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '2px',
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

        {/* ── SVG ribbon cable foreground ── */}
        <svg viewBox="0 0 1000 600" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 20 }}>
          <g fill="none" strokeWidth="5">
            <path stroke="#e65147" d="M 542 292 L 610 292 Q 625 292, 625 307 L 625 480" />
            <path stroke="#e98d3e" d="M 542 297 L 605 297 Q 619 297, 619 307 L 619 480" />
            <path stroke="#e6c23d" d="M 542 302 L 600 302 Q 613 302, 613 307 L 613 480" />
            <path stroke="#58a356" d="M 542 307 L 595 307 Q 607 307, 607 312 L 607 480" />
            <path stroke="#4088bc" d="M 542 312 L 590 312 Q 601 312, 601 317 L 601 480" />
            <path stroke="#865c9c" d="M 542 317 L 585 317 Q 595 317, 595 322 L 595 480" />
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
        <div style={{ ...pcbLabel, top: '50%', left: '93%', transform: 'rotate(-90deg)', transformOrigin: 'left' }}>J15_PWR</div>
        <PinV style={{ top: '38%', left: '95%', width: '1.2%', height: '12%' }} count={6} />

        {/* ── J16_PWR right edge ── */}
        <div style={{ ...pcbLabel, top: '68%', left: '93%', transform: 'rotate(-90deg)', transformOrigin: 'left' }}>J16_PWR</div>
        <PinV style={{ top: '60%', left: '95%', width: '1.2%', height: '8%' }} count={4} />

        {/* ── J16_OTA right edge ── */}
        <div style={{ ...pcbLabel, top: '84%', left: '93%', transform: 'rotate(-90deg)', transformOrigin: 'left' }}>J16_OTA</div>
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

        {/* ── J15_PNR bottom ── */}
        <div style={{ ...pcbLabel, top: '85%', left: '28%' }}>J15_PNR</div>
        <PinH style={{ top: '80%', left: '28%', width: '7.5%', height: '2%' }} count={7} />

        {/* ── Glow dots ── */}
        {[
          { top: '15%', left: '22%' }, { top: '34%', left: '20%' },
          { top: '50%', left: '35%' }, { top: '25%', left: '45%' },
          { top: '60%', left: '48%' }, { top: '72%', left: '23%' },
          { top: '84%', left: '21%' }, { top: '14%', left: '55%' },
          { top: '48%', left: '66%' }, { top: '20%', left: '75%' },
          { top: '33%', left: '72%' }, { top: '52%', left: '86%' },
          { top: '65%', left: '81%' }, { top: '80%', left: '85%' },
          { top: '46%', left: '59%' }, { top: '61%', left: '74%' },
        ].map((pos, i) => (
          <div key={i} style={{ ...glowDot, ...pos }} />
        ))}

      </div>

      {/* ── Bottom label ── */}
      <div style={{
        position: 'absolute', bottom: '12px', left: 0, width: '100%',
        textAlign: 'center', color: '#4c5c68',
        fontSize: '9px', letterSpacing: '0.4em', fontWeight: 600, opacity: 0.8,
        zIndex: 20,
      }}>
        KINETIC SYSTEM ARCHITECTURE // INTERNAL DATAPATH SCHEMATIC 04-0 FINAL
      </div>

    </div>
  )
}
