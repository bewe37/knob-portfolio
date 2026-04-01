'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

const RAMP = ' .,:;i1tfLCG08@#'
const COLS = 38
const ROWS = 22

function imgToAscii(img: HTMLImageElement): string[] {
  const canvas  = document.createElement('canvas')
  canvas.width  = COLS
  canvas.height = ROWS
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0, COLS, ROWS)
  const { data } = ctx.getImageData(0, 0, COLS, ROWS)
  const lines: string[] = []
  for (let row = 0; row < ROWS; row++) {
    let line = ''
    for (let col = 0; col < COLS; col++) {
      const i     = (row * COLS + col) * 4
      const alpha = data[i + 3]
      const lum   = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
      if (alpha < 80 || lum > 210) {
        line += ' '
        continue
      }
      const inverted = 255 - lum
      line += RAMP[Math.floor((inverted / 255) * (RAMP.length - 1))]
    }
    lines.push(line)
  }
  return lines
}

interface Props {
  onDone: () => void
  screenColor: string
  screenGlow: string
}

export function LoadingScreen({ onDone, screenColor, screenGlow }: Props) {
  const wrapRef      = useRef<HTMLDivElement>(null)
  const scanRef      = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const onDoneRef    = useRef(onDone)
  onDoneRef.current  = onDone

  const [ascii, setAscii] = useState<string[]>([])
  const didAnimate = useRef(false)

  useEffect(() => {
    const img   = new Image()
    img.src     = '/paw.jpg'
    img.onerror = () => onDoneRef.current()
    img.onload  = () => setAscii(imgToAscii(img))
  }, [])

  useEffect(() => {
    if (!ascii.length || didAnimate.current) return
    if (!containerRef.current || !scanRef.current || !wrapRef.current) return
    didAnimate.current = true

    const chars   = Array.from(containerRef.current.querySelectorAll<HTMLElement>('.asc-char'))
    const scan    = scanRef.current
    const wrap    = wrapRef.current
    const totalW  = containerRef.current.offsetWidth
    const SCAN_DUR = 1.8
    const colDelay = SCAN_DUR / COLS

    gsap.set(chars, { opacity: 0 })
    gsap.set(scan, { opacity: 1, left: 0 })

    const tweens: gsap.core.Tween[] = []

    chars.forEach((span) => {
      const col       = parseInt(span.dataset.col ?? '0')
      const finalChar = span.dataset.char ?? ' '
      const delay     = col * colDelay
      const proxy     = { t: 0 }

      const tw = gsap.to(proxy, {
        t: 1,
        duration: 0.45,
        delay,
        ease: 'power1.out',
        onStart() { gsap.set(span, { opacity: 1 }) },
        onUpdate() {
          span.textContent = proxy.t < 0.65
            ? RAMP[Math.floor(Math.random() * RAMP.length)]
            : finalChar
        },
        onComplete() { span.textContent = finalChar },
      })
      tweens.push(tw)
    })

    const cont = containerRef.current
    gsap.set(cont, { transformOrigin: 'bottom center' })

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(wrap, {
          opacity: 0,
          duration: 0.4,
          ease: 'power1.in',
          onComplete: () => { onDoneRef.current() },
        })
      },
    })

    tl.to(scan, { left: totalW, duration: SCAN_DUR, ease: 'none' }, 0)
    // Wave left → right after scan finishes
    tl.to(cont, { rotation:  14, duration: 0.22, ease: 'power2.out' })
    tl.to(cont, { rotation: -12, duration: 0.28, ease: 'sine.inOut' })
    tl.to(cont, { rotation:  10, duration: 0.26, ease: 'sine.inOut' })
    tl.to(cont, { rotation:  -7, duration: 0.24, ease: 'sine.inOut' })
    tl.to(cont, { rotation:   4, duration: 0.22, ease: 'sine.inOut' })
    tl.to(cont, { rotation:   0, duration: 0.35, ease: 'elastic.out(1, 0.45)' })
    tl.to({}, { duration: 0.3 })

    return () => {
      tl.kill()
      tweens.forEach(tw => tw.kill())
    }
  }, [ascii])

  return (
    <div
      ref={wrapRef}
      style={{
        position:       'absolute',
        inset:          0,
        zIndex:         5,
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        gap:            10,
        background:     'transparent',
      }}
    >
      <div ref={containerRef} style={{ position: 'relative' }}>
        {/* Neon scan bar — vertical, sweeps left → right */}
        <div
          ref={scanRef}
          style={{
            position:      'absolute',
            top:           -4,
            bottom:        -4,
            left:          0,
            width:         2,
            opacity:       0,
            background:    screenColor,
            boxShadow:     `0 0 6px 3px ${screenGlow}, 0 0 18px 7px ${screenGlow}`,
            zIndex:        2,
            pointerEvents: 'none',
          }}
        />
        <pre
          style={{
            fontFamily:    'var(--font-jetbrains-mono), "JetBrains Mono", monospace',
            fontSize:      '8px',
            lineHeight:    '1.15',
            letterSpacing: '0.06em',
            color:         screenColor,
            textShadow:    `0 0 6px ${screenGlow}`,
            userSelect:    'none',
            margin:        0,
            opacity:       0.8,
          }}
        >
          {ascii.map((line, row) => (
            <div key={row} className="asc-row">
              {Array.from(line).map((ch, col) => (
                <span
                  key={col}
                  className="asc-char"
                  data-col={String(col)}
                  data-char={ch}
                >{ch}</span>
              ))}
            </div>
          ))}
        </pre>
      </div>

      <div style={{
        fontFamily:    'var(--font-jetbrains-mono), "JetBrains Mono", monospace',
        fontSize:      '8px',
        letterSpacing: '0.28em',
        color:         screenColor,
        textShadow:    `0 0 6px ${screenGlow}`,
        opacity:       0.5,
        textTransform: 'uppercase',
      }}>
        BOOTING . . .
      </div>
    </div>
  )
}
