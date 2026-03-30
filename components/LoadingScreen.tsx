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
      // Transparent pixels or near-white background → space (invisible)
      if (alpha < 80 || lum > 210) {
        line += ' '
        continue
      }
      // Invert: dark corgi body → dense chars, light areas → sparse
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
  // Stable ref for onDone — never stale, never triggers re-runs
  const onDoneRef    = useRef(onDone)
  onDoneRef.current  = onDone

  const [ascii, setAscii] = useState<string[]>([])
  const didAnimate = useRef(false)

  // Load image once on mount only
  useEffect(() => {
    const img   = new Image()
    img.src     = '/corgi2.png'
    img.onerror = () => onDoneRef.current()
    img.onload  = () => setAscii(imgToAscii(img))
  }, []) // empty deps — run once

  // Animate when ascii is ready — also runs once
  useEffect(() => {
    if (!ascii.length || didAnimate.current) return
    if (!containerRef.current || !scanRef.current || !wrapRef.current) return
    didAnimate.current = true

    const rows    = containerRef.current.querySelectorAll<HTMLElement>('.asc-row')
    const scan    = scanRef.current
    const wrap    = wrapRef.current
    const totalH  = containerRef.current.offsetHeight
    const SCAN_DUR = 1.8

    gsap.set(rows, { opacity: 0 })
    gsap.set(scan, { opacity: 1, top: 0 })

    const scrambleTweens = Array.from(rows).map((row, rowIdx) => {
      const finalText = ascii[rowIdx] ?? ''
      const charCount = finalText.length
      const proxy     = { t: 0 }
      const delay     = rowIdx * (SCAN_DUR / ROWS)

      return gsap.to(proxy, {
        t: charCount,
        duration: 0.55,
        delay,
        ease: 'power1.out',
        onUpdate() {
          const resolved = Math.floor(proxy.t)
          let txt = finalText.slice(0, resolved)
          for (let c = resolved; c < charCount; c++) {
            txt += RAMP[Math.floor(Math.random() * RAMP.length)]
          }
          row.textContent = txt
        },
        onComplete() { row.textContent = finalText },
      })
    })

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(wrap, {
          opacity: 0,
          duration: 0.4,
          ease: 'power1.in',
          onComplete: () => onDoneRef.current(),
        })
      },
    })

    tl.to(scan, { top: totalH, duration: SCAN_DUR, ease: 'none' }, 0)
    tl.to(rows, {
      opacity: 1,
      duration: 0.15,
      stagger: { each: SCAN_DUR / ROWS, from: 'start' },
      ease: 'none',
    }, 0)
    tl.to({}, { duration: 0.6 })

    return () => {
      tl.kill()
      scrambleTweens.forEach(tw => tw.kill())
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
        {/* Neon scan bar */}
        <div
          ref={scanRef}
          style={{
            position:      'absolute',
            left:          -4,
            right:         -4,
            height:        2,
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
          {ascii.map((line, i) => (
            <div key={i} className="asc-row">{line}</div>
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
