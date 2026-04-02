'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import gsap from 'gsap'
import { SECTIONS, SECTION_DETAILS } from '@/lib/portfolioData'

const GREEN  = '#33ff66'
const DIM    = 'rgba(51,255,102,0.82)'
const FAINT  = 'rgba(51,255,102,0.14)'
const LABEL  = 'rgba(51,255,102,0.55)'
const RGB    = '51,255,102'

// ── Case study overlay ────────────────────────────────────
function CaseStudy({ index, onClose }: { index: number; onClose: () => void }) {
  const section = SECTIONS[index]
  const details = SECTION_DETAILS[index]
  const wrapRef = useRef<HTMLDivElement>(null)
  const [lightbox, setLightbox] = useState<string | null>(null)

  useEffect(() => {
    if (wrapRef.current) {
      gsap.fromTo(wrapRef.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.32, ease: 'power3.out' }
      )
    }
    // lock body scroll
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const close = useCallback(() => {
    if (!wrapRef.current) { onClose(); return }
    gsap.to(wrapRef.current, {
      opacity: 0, y: 16, duration: 0.22, ease: 'power2.in',
      onComplete: onClose,
    })
  }, [onClose])

  // ESC key
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [close])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(4,6,8,0.97)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Sticky header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px',
        borderBottom: `1px solid ${FAINT}`,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 9, letterSpacing: 2.5, color: LABEL }}>
            SYS.PORTFOLIO.OS — {section.id}
          </span>
          <span style={{ fontSize: 14, fontWeight: 700, color: GREEN, letterSpacing: -0.2 }}>
            {section.title}
          </span>
        </div>
        <button
          onClick={close}
          style={{
            background: 'none', border: `1px solid ${FAINT}`, borderRadius: 4,
            color: LABEL, fontFamily: 'var(--font-jetbrains-mono), monospace',
            fontSize: 9, letterSpacing: 2, padding: '6px 10px', cursor: 'pointer',
          }}
        >
          [ CLOSE ]
        </button>
      </div>

      {/* Scrollable content */}
      <div
        ref={wrapRef}
        style={{
          flex: 1, overflowY: 'auto', overflowX: 'hidden',
          padding: '24px 20px 48px',
          fontFamily: 'var(--font-jetbrains-mono), monospace',
          color: GREEN,
        }}
      >
        {/* Cover image */}
        {details.cover && (
          <div style={{ borderRadius: 6, overflow: 'hidden', border: `1px solid ${FAINT}`, marginBottom: 20 }}
            onClick={() => setLightbox(details.cover)}>
            <img src={details.cover} alt={section.title}
              style={{ display: 'block', width: '100%', height: 'auto', opacity: 0.85 }} />
          </div>
        )}

        {/* Meta row */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
          {[{ label: 'ROLE', value: details.role }, { label: 'YEAR', value: details.year }].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 8, letterSpacing: 2.5, color: LABEL }}>▪ {label}</span>
              <span style={{ fontSize: 12, color: DIM }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Specs */}
        {details.specs?.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
            {details.specs.map(({ label, value }: { label: string; value: string }) => (
              <div key={label} style={{
                background: `rgba(${RGB},0.03)`, border: `1px solid ${FAINT}`,
                borderRadius: 3, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 5,
              }}>
                <span style={{ fontSize: 8, letterSpacing: 2, color: LABEL }}>▪ {label}</span>
                <span style={{ fontSize: 11, color: GREEN }}>{value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Overview */}
        <p style={{ fontSize: 13, lineHeight: 1.85, color: GREEN, marginBottom: 24, whiteSpace: 'pre-line' }}>
          {details.overview}
        </p>

        {/* Sections */}
        {details.sections?.map((sec: Record<string, any>, si: number) => (
          <div key={si} style={{ marginBottom: 28 }}>
            {/* Section label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 4, height: 4, background: `rgba(${RGB},0.5)`, borderRadius: 1, flexShrink: 0 }} />
              <span style={{ fontSize: 9, letterSpacing: 3, color: LABEL }}>{sec.label}</span>
              <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${FAINT}, transparent)` }} />
            </div>

            {/* Body */}
            {sec.body && (
              <p style={{ fontSize: 13, lineHeight: 1.85, color: DIM, marginBottom: 12, whiteSpace: 'pre-line' }}>
                {Array.isArray(sec.body) ? sec.body.join('\n') : sec.body}
              </p>
            )}

            {/* Experience rows */}
            {sec.experience && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {sec.experience.map((exp: { company: string; role: string; period: string }, ei: number, arr: unknown[]) => (
                  <div key={ei} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                    paddingTop: 12, paddingBottom: 12,
                    borderBottom: ei < arr.length - 1 ? `1px solid rgba(${RGB},0.08)` : 'none',
                    gap: 12,
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: DIM }}>{exp.company}</span>
                      <span style={{ fontSize: 11, color: `rgba(${RGB},0.6)` }}>{exp.role}</span>
                    </div>
                    <span style={{ fontSize: 10, color: LABEL, flexShrink: 0 }}>{exp.period}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Contact links */}
            {sec.contacts && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {sec.contacts.map((c: { platform: string; handle: string; href: string }, ci: number, arr: unknown[]) => (
                  <div key={ci} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    paddingTop: 12, paddingBottom: 12,
                    borderBottom: ci < arr.length - 1 ? `1px solid rgba(${RGB},0.08)` : 'none',
                  }}>
                    <span style={{ fontSize: 9, letterSpacing: 2, color: LABEL }}>{c.platform}</span>
                    <a href={c.href} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 12, color: DIM, textDecoration: 'none' }}>
                      {c.handle}
                    </a>
                  </div>
                ))}
              </div>
            )}

            {/* Images */}
            {sec.images && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: sec.videos ? 12 : 0 }}>
                {sec.images.map((src: string, ii: number) => (
                  <div key={ii} style={{ border: `1px solid ${FAINT}`, borderRadius: 4, overflow: 'hidden' }}
                    onClick={() => setLightbox(src)}>
                    <img src={src} alt={`${sec.label} ${ii + 1}`}
                      style={{ display: 'block', width: '100%', height: 'auto' }} />
                  </div>
                ))}
              </div>
            )}

            {/* Videos */}
            {sec.videos && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {sec.videos.map((src: string, ii: number) => (
                  <div key={ii} style={{ border: `1px solid ${FAINT}`, borderRadius: 4, overflow: 'hidden' }}>
                    <video src={src} autoPlay loop muted playsInline
                      style={{ display: 'block', width: '100%', height: 'auto' }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Contacts at root level (COM-05) */}
        {details.contacts && !details.sections && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {details.contacts.map((c: { platform: string; handle: string; href: string }, ci: number, arr: unknown[]) => (
              <div key={ci} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                paddingTop: 14, paddingBottom: 14,
                borderBottom: ci < arr.length - 1 ? `1px solid rgba(${RGB},0.08)` : 'none',
              }}>
                <span style={{ fontSize: 9, letterSpacing: 2, color: LABEL }}>{c.platform}</span>
                <a href={c.href} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 12, color: DIM, textDecoration: 'none' }}>
                  {c.handle}
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{ borderTop: `1px solid ${FAINT}`, paddingTop: 16, marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 9, letterSpacing: 2, color: `rgba(${RGB},0.35)` }}>SYS.PORTFOLIO.OS</span>
          <span style={{ fontSize: 9, letterSpacing: 2, color: `rgba(${RGB},0.35)` }}>{section.id}</span>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{
          position: 'fixed', inset: 0, zIndex: 300,
          background: 'rgba(0,0,0,0.92)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }}>
          <img src={lightbox} alt="enlarged" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
        </div>
      )}
    </div>
  )
}

// ── Card ──────────────────────────────────────────────────
function SectionCard({ index, onOpen }: { index: number; onOpen: () => void }) {
  const section = SECTIONS[index]
  const isContact = index === SECTIONS.length - 1
  const cardRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={cardRef}
      onClick={isContact ? undefined : onOpen}
      style={{
        border: `1px solid ${FAINT}`,
        borderRadius: 8,
        padding: '20px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        cursor: isContact ? 'default' : 'pointer',
        background: 'rgba(51,255,102,0.02)',
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none',
      }}
    >
      {/* ID + tech row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          fontSize: 9, letterSpacing: 2.5, color: LABEL,
          border: `1px solid ${FAINT}`, padding: '2px 7px', borderRadius: 2,
        }}>{section.id}</span>
        <span style={{ fontSize: 9, letterSpacing: 1.5, color: LABEL }}>{section.tech}</span>
      </div>

      {/* Title */}
      <div style={{ fontSize: 18, fontWeight: 700, color: GREEN, letterSpacing: -0.3, lineHeight: 1.2 }}>
        {section.title}
      </div>

      {/* Desc */}
      <p style={{ fontSize: 12, lineHeight: 1.75, color: DIM, whiteSpace: 'pre-line' }}>
        {section.desc}
      </p>

      {/* Contact links inline for last card */}
      {isContact && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginTop: 4 }}>
          {[
            { platform: 'Resume',   handle: 'view resume',              href: 'https://drive.google.com/file/d/1E8AUWkgri9AAHSLil1fQK9KBzZUQbtnK/view?usp=sharingt' },
            { platform: 'Email',    handle: 'bryanwinata112@gmail.com', href: 'mailto:bryanwinata112@gmail.com' },
            { platform: 'LinkedIn', handle: 'linkedin.com/in/gbryanw',  href: 'https://linkedin.com/in/gbryanw' },
            { platform: 'X',        handle: '@gbryanwt',                href: 'https://x.com/gbryanwt' },
          ].map((c, ci, arr) => (
            <div key={ci} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              paddingTop: 11, paddingBottom: 11,
              borderBottom: ci < arr.length - 1 ? `1px solid rgba(${RGB},0.08)` : 'none',
            }}>
              <span style={{ fontSize: 9, letterSpacing: 2, color: LABEL }}>{c.platform}</span>
              <a href={c.href} target="_blank" rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                style={{ fontSize: 11, color: DIM, textDecoration: 'none' }}>
                {c.handle}
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Open cue */}
      {!isContact && (
        <div style={{
          fontSize: 9, letterSpacing: 2, color: `rgba(${RGB},0.4)`,
          display: 'flex', alignItems: 'center', gap: 6, marginTop: 2,
        }}>
          <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${FAINT}, transparent)` }} />
          TAP TO OPEN
        </div>
      )}
    </div>
  )
}

// ── Main mobile view ──────────────────────────────────────
export default function MobileView() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1,
      overflowY: 'auto', overflowX: 'hidden',
      fontFamily: 'var(--font-jetbrains-mono), monospace',
      color: GREEN,
    }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px',
        background: 'rgba(4,6,8,0.88)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${FAINT}`,
        zIndex: 10,
      }}>
        <span style={{ fontSize: 9, letterSpacing: 3, color: LABEL }}>SYS.PORTFOLIO.OS</span>
        <span style={{ fontSize: 9, letterSpacing: 2, color: `rgba(${RGB},0.35)` }}>MOBILE MODE</span>
      </div>

      {/* Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '20px 16px 48px' }}>
        {SECTIONS.map((_, i) => (
          <SectionCard key={i} index={i} onOpen={() => setOpenIndex(i)} />
        ))}
      </div>

      {/* Case study overlay */}
      {openIndex !== null && (
        <CaseStudy index={openIndex} onClose={() => setOpenIndex(null)} />
      )}
    </div>
  )
}
