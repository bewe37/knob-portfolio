'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import gsap from 'gsap'
import { SECTIONS, SECTION_DETAILS } from '@/lib/portfolioData'
import VideoPlayer from './VideoPlayer'
import BeforeAfterSlider from './BeforeAfterSlider'

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
  const [lightboxVideo, setLightboxVideo] = useState<string | null>(null)
  const [unlocked, setUnlocked] = useState(false)
  const [pwInput, setPwInput] = useState('')
  const [pwError, setPwError] = useState(false)

  useEffect(() => {
    if (wrapRef.current) {
      gsap.fromTo(wrapRef.current,
        { opacity: 0, y: 60, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: 'expo.out', clearProps: 'scale' }
      )
    }
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const close = useCallback(() => {
    if (!wrapRef.current) { onClose(); return }
    gsap.to(wrapRef.current, {
      opacity: 0, y: 40, scale: 0.97, duration: 0.3, ease: 'power3.in',
      onComplete: onClose,
    })
  }, [onClose])

  // ESC key
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (lightboxVideo) { setLightboxVideo(null); return }
        if (lightbox) { setLightbox(null); return }
        close()
      }
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [close, lightbox, lightboxVideo])

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
            flexShrink: 0, whiteSpace: 'nowrap',
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
        {details.sections?.map((sec: Record<string, any>, si: number) => {
          const renderBlock = (blk: Record<string, any>, bi: number) => (
            <div key={bi} style={{ marginBottom: 32 }}>
              {blk.title && <div style={{ fontSize: 16, fontWeight: 700, color: GREEN, marginBottom: 8, letterSpacing: -0.3, lineHeight: 1.25 }}>{blk.title}</div>}
              {blk.body && <p style={{ fontSize: 13, lineHeight: 1.85, color: DIM, marginBottom: 10, whiteSpace: 'pre-line' }}>{Array.isArray(blk.body) ? blk.body.join('\n') : blk.body}</p>}
              {blk.image && (
                <div style={{ border: `1px solid ${FAINT}`, borderRadius: 4, overflow: 'hidden', marginBottom: blk.videos ? 10 : 0 }} onClick={() => setLightbox(blk.image)}>
                  <img src={blk.image} alt={blk.title ?? ''} style={{ display: 'block', width: '100%', height: 'auto' }} />
                </div>
              )}
              {blk.images && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: blk.videos ? 10 : 0 }}>
                  {blk.images.map((src: string, ii: number) => (
                    <div key={ii} style={{ border: `1px solid ${FAINT}`, borderRadius: 4, overflow: 'hidden' }} onClick={() => setLightbox(src)}>
                      <img src={src} alt={`${blk.title ?? ''} ${ii + 1}`} style={{ display: 'block', width: '100%', height: 'auto' }} />
                    </div>
                  ))}
                </div>
              )}
              {blk.videos && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {blk.videos.map((src: string, ii: number) => (
                    <div key={ii} style={{ border: `1px solid ${FAINT}`, borderRadius: 4, overflow: 'hidden', cursor: 'zoom-in' }} onClick={() => setLightboxVideo(src)}>
                      <video src={src} autoPlay loop muted playsInline style={{ display: 'block', width: '100%', height: 'auto', pointerEvents: 'none' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
          return (
          <div key={si} style={{ marginBottom: 28 }}>
            {/* Section label + title */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <span style={{ fontSize: 9, letterSpacing: 2.5, color: LABEL }}>{sec.label}</span>
                <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${FAINT}, transparent)` }} />
              </div>
              {sec.title && <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.3, color: GREEN, lineHeight: 1.25 }}>{sec.title}</div>}
            </div>

            {/* Top-level body */}
            {sec.body && <p style={{ fontSize: 13, lineHeight: 1.85, color: DIM, marginBottom: 12, whiteSpace: 'pre-line' }}>{Array.isArray(sec.body) ? sec.body.join('\n') : sec.body}</p>}

            {/* Experience rows */}
            {sec.experience && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {sec.experience.map((exp: { company: string; role: string; period: string }, ei: number, arr: unknown[]) => (
                  <div key={ei} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: 12, paddingBottom: 12, borderBottom: ei < arr.length - 1 ? `1px solid rgba(${RGB},0.08)` : 'none', gap: 12 }}>
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
                  <div key={ci} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, paddingBottom: 12, borderBottom: ci < arr.length - 1 ? `1px solid rgba(${RGB},0.08)` : 'none' }}>
                    <span style={{ fontSize: 9, letterSpacing: 2, color: LABEL }}>{c.platform}</span>
                    <a href={c.href} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: DIM, textDecoration: 'none' }}>{c.handle}</a>
                  </div>
                ))}
              </div>
            )}

            {/* Top-level images/videos (no content blocks) */}
            {!sec.contents && renderBlock({ images: sec.images, videos: sec.videos }, -1)}

            {/* Multiple content blocks */}
            {sec.contents && sec.contents.map((blk: Record<string, any>, bi: number) => renderBlock(blk, bi))}
          </div>
        )})}


        {/* Password gate */}
        {(details as any).password && !unlocked && (
          <div style={{ marginTop: 8, marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 4, height: 4, background: `rgba(${RGB},0.5)`, borderRadius: 1, flexShrink: 0 }} />
              <span style={{ fontSize: 9, letterSpacing: 2.5, color: LABEL }}>NDA — ENTER PASSWORD TO UNLOCK</span>
              <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${FAINT}, transparent)` }} />
            </div>
            {(details as any).passwordDesc && (
              <p style={{ fontSize: 13, lineHeight: 1.8, color: DIM, marginBottom: 16 }}>{(details as any).passwordDesc}</p>
            )}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input
                type="password"
                value={pwInput}
                onChange={e => { setPwInput(e.target.value); setPwError(false) }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    if (pwInput === (details as any).password) { setUnlocked(true) }
                    else { setPwError(true) }
                  }
                }}
                placeholder="••••••••"
                style={{
                  background: 'transparent',
                  border: `1px solid ${pwError ? 'rgba(255,70,50,0.7)' : FAINT}`,
                  borderRadius: 3, padding: '8px 14px',
                  color: GREEN,
                  fontFamily: 'var(--font-jetbrains-mono), monospace',
                  fontSize: 13, letterSpacing: 3,
                  outline: 'none', flex: 1,
                  transition: 'border-color 0.2s',
                }}
              />
              <button
                onClick={() => {
                  if (pwInput === (details as any).password) { setUnlocked(true) }
                  else { setPwError(true) }
                }}
                style={{
                  background: `rgba(${RGB},0.07)`,
                  border: `1px solid ${FAINT}`,
                  borderRadius: 3, padding: '8px 16px',
                  color: GREEN,
                  fontFamily: 'var(--font-jetbrains-mono), monospace',
                  fontSize: 9, letterSpacing: 2.5,
                  cursor: 'pointer', flexShrink: 0,
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

        {/* Locked sections — shown after correct password */}
        {(details as any).password && unlocked && (
          ((details as any).lockedSections as Array<any>)?.map((sec: any, si: number) => {
            const renderLockedBlock = (blk: any, bi: number) => (
              <div key={bi} style={{ marginBottom: 28 }}>
                {blk.highlight ? (
                  <div style={{ border: `1px solid ${FAINT}`, borderRadius: 4, padding: '12px 14px', background: `rgba(${RGB},0.04)`, marginBottom: 8 }}>
                    {blk.title && <div style={{ fontSize: 13, fontWeight: 700, color: GREEN, marginBottom: 4 }}>{blk.title}</div>}
                    {blk.body && <p style={{ fontSize: 12, lineHeight: 1.7, color: DIM, margin: 0 }}>{blk.body}</p>}
                  </div>
                ) : (
                  <>
                    {blk.title && <div style={{ fontSize: 16, fontWeight: 700, color: GREEN, marginBottom: 8, letterSpacing: -0.3, lineHeight: 1.25 }}>{blk.title}</div>}
                    {blk.body && <p style={{ fontSize: 13, lineHeight: 1.85, color: DIM, marginBottom: 12 }}>{blk.body}</p>}
                    {blk.beforeAfter && (
                      <div style={{ marginBottom: 8 }}>
                        <BeforeAfterSlider before={blk.beforeAfter.before} after={blk.beforeAfter.after} beforeLabel={blk.beforeAfter.beforeLabel} afterLabel={blk.beforeAfter.afterLabel} accentColor={GREEN} />
                      </div>
                    )}
                    {blk.image && (
                      <div style={{ border: `1px solid ${FAINT}`, borderRadius: 4, marginBottom: 8, overflow: 'hidden', cursor: 'zoom-in' }} onClick={() => setLightbox(blk.image)}>
                        <img src={blk.image} alt={blk.title ?? ''} style={{ display: 'block', width: '100%', height: 'auto' }} />
                      </div>
                    )}
                    {blk.videos && blk.videos.map((src: string, vi: number) => (
                      <div key={vi} style={{ border: `1px solid ${FAINT}`, borderRadius: 4, marginBottom: 8, overflow: 'hidden', cursor: 'zoom-in' }} onClick={() => setLightboxVideo(src)}>
                        <video src={src} autoPlay loop muted playsInline style={{ display: 'block', width: '100%', height: 'auto', pointerEvents: 'none' }} />
                      </div>
                    ))}
                  </>
                )}
              </div>
            )
            return (
              <div key={`locked-${si}`} style={{ marginBottom: 28 }}>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <span style={{ fontSize: 9, letterSpacing: 2.5, color: LABEL }}>{sec.label}</span>
                    <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${FAINT}, transparent)` }} />
                  </div>
                  {sec.title && <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.3, color: GREEN, lineHeight: 1.25 }}>{sec.title}</div>}
                </div>
                {sec.body && <p style={{ fontSize: 13, lineHeight: 1.85, color: DIM, marginBottom: 12 }}>{sec.body}</p>}
                {sec.image && (
                  <div style={{ border: `1px solid ${FAINT}`, borderRadius: 4, marginBottom: 8, overflow: 'hidden', cursor: 'zoom-in' }} onClick={() => setLightbox(sec.image)}>
                    <img src={sec.image} alt={sec.title ?? ''} style={{ display: 'block', width: '100%', height: 'auto' }} />
                  </div>
                )}
                {sec.bento && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 16 }}>
                    {sec.bento.map((item: any, bi: number) => (
                      <div
                        key={bi}
                        onClick={() => { if (item.image) setLightbox(item.image); else if (item.video) setLightboxVideo(item.video) }}
                        style={{
                          gridColumn: item.span === 2 ? 'span 2' : 'span 1',
                          height: item.span === 2 ? 'auto' : 160,
                          borderRadius: 4, overflow: 'hidden',
                          border: `1px solid ${FAINT}`,
                          cursor: (item.image || item.video) ? 'zoom-in' : 'default',
                          position: 'relative',
                        }}
                      >
                        {item.image && <img src={item.image} alt={item.label ?? ''} style={{ display: 'block', width: '100%', height: item.span === 2 ? 'auto' : '100%', objectFit: 'cover' }} />}
                        {item.video && <video src={item.video} autoPlay loop muted playsInline style={{ display: 'block', width: '100%', height: item.span === 2 ? 'auto' : '100%', objectFit: 'cover', pointerEvents: 'none' }} />}
                        {item.label && (
                          <div style={{
                            position: 'absolute', bottom: 0, left: 0, right: 0,
                            padding: '16px 8px 6px',
                            background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
                            fontSize: 8, letterSpacing: 2, color: 'rgba(255,255,255,0.6)',
                            fontFamily: 'var(--font-jetbrains-mono), monospace',
                            pointerEvents: 'none',
                          }}>
                            {item.label}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {sec.contents && sec.contents.map((blk: any, bi: number) => renderLockedBlock(blk, bi))}
              </div>
            )
          })
        )}

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

      {/* Image Lightbox */}
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

      {/* Video Lightbox */}
      {lightboxVideo && (
        <div onClick={() => setLightboxVideo(null)} style={{
          position: 'fixed', inset: 0, zIndex: 300,
          background: 'rgba(0,0,0,0.92)',
          backdropFilter: 'blur(16px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }}>
          <VideoPlayer
            src={lightboxVideo}
            accentColor={GREEN}
            accentRGB={RGB}
            onClose={() => setLightboxVideo(null)}
          />
        </div>
      )}
    </div>
  )
}

// ── Card ──────────────────────────────────────────────────
function SectionCard({ index, onOpen }: { index: number; onOpen: () => void }) {
  const section = SECTIONS[index]
  const details = SECTION_DETAILS[index]
  const cover   = (details as Record<string, any>).cover as string | undefined
  const isContact = index === SECTIONS.length - 1
  const cardRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={cardRef}
      onClick={isContact ? undefined : onOpen}
      style={{
        border: `1px solid ${FAINT}`,
        borderRadius: 8,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        cursor: isContact ? 'default' : 'pointer',
        background: 'rgba(51,255,102,0.02)',
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none',
      }}
    >
      {/* Thumbnail */}
      {cover && !isContact && (
        <div style={{ width: '100%', position: 'relative', flexShrink: 0 }}>
          <img
            src={cover}
            alt={section.title}
            style={{ width: '100%', height: 'auto', maxHeight: 220, objectFit: 'cover', display: 'block', opacity: 0.75, filter: 'saturate(0.7) brightness(0.85)' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(4,6,8,0.9) 100%)' }} />
        </div>
      )}

      {/* Content */}
      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
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
            { platform: 'Resume',   handle: 'maa resume',              href: 'https://drive.google.com/file/d/1E8AUWkgri9AAHSLil1fQK9KBzZUQbtnK/view?usp=sharing' },
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
    </div>
  )
}

const TERMINAL_ENTRIES = [
  { cmd: 'whoami',            out: 'georgius_bryan — casual golfer, occasional vibe-coder' },
  { cmd: 'my philosophy.txt', out: "i believe every pixel has feelings, and it is my job to make sure none of them feel misaligned." },
  { cmd: 'ls skills/',        out: 'product_design/ design_systems'},
  { cmd: 'cat status.txt',    out: 'open to full-time roles. weird ideas welcome.' },
  { cmd: 'ping creativity',   out: 'reply from brain: time=0ms  TTL=∞' },
]

// ── Mini terminal ─────────────────────────────────────────
function Terminal() {
  const [step, setStep] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [phase, setPhase] = useState<'typing'|'idle'>('idle')
  const tweenRef = useRef<gsap.core.Tween | null>(null)
  const outputRef = useRef<HTMLDivElement>(null)

  const run = useCallback(() => {
    if (phase === 'typing') return
    const entry = TERMINAL_ENTRIES[step % TERMINAL_ENTRIES.length]
    setStep(s => s + 1)
    setDisplayed('')
    setPhase('typing')
    const proxy = { n: 0, text: entry.out }
    tweenRef.current = gsap.to(proxy, {
      n: proxy.text.length,
      duration: proxy.text.length * 0.028,
      ease: 'none',
      onUpdate() { setDisplayed(proxy.text.slice(0, Math.floor(proxy.n))) },
      onComplete() { setDisplayed(proxy.text); setPhase('idle') },
    })
  }, [phase, step])

  useEffect(() => () => { tweenRef.current?.kill() }, [])

  const entry = TERMINAL_ENTRIES[(step === 0 ? 0 : (step - 1)) % TERMINAL_ENTRIES.length]
  const nextCmd = TERMINAL_ENTRIES[step % TERMINAL_ENTRIES.length].cmd

  return (
    <div
      onClick={run}
      style={{
        position: 'relative',
        border: `1px solid ${FAINT}`,
        borderRadius: 6,
        padding: '14px 16px',
        cursor: 'pointer',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        background: 'rgba(51,255,102,0.02)',
      }}
    >
      {/* Ran command */}
      {step > 0 && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
            <span style={{ color: LABEL, fontSize: 10 }}>$</span>
            <span style={{ color: GREEN, fontSize: 11 }}>{entry.cmd}</span>
          </div>
          <div ref={outputRef} style={{ fontSize: 12, lineHeight: 1.7, color: DIM, paddingLeft: 16 }}>
            {displayed}{phase === 'typing' && <span style={{ display:'inline-block', width:6, height:11, background:GREEN, verticalAlign:'middle', marginLeft:2 }} />}
          </div>
        </div>
      )}

      {/* Next prompt */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', opacity: phase === 'typing' ? 0.3 : 1 }}>
        <span style={{ color: LABEL, fontSize: 10 }}>$</span>
        <span style={{ color: `rgba(51,255,102,0.45)`, fontSize: 11 }}>{nextCmd}</span>
        {phase === 'idle' && <span style={{ display:'inline-block', width:6, height:11, background:`rgba(51,255,102,0.5)`, verticalAlign:'middle' }} />}
      </div>

      {/* Tap hint */}
      <div style={{
        position: 'absolute', bottom: 10, right: 12,
        fontSize: 8, letterSpacing: 2, color: `rgba(51,255,102,0.25)`,
      }}>
        TAP TO RUN
      </div>
    </div>
  )
}

// ── Blinking cursor ───────────────────────────────────────
function Cursor() {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (!ref.current) return
    const tl = gsap.timeline({ repeat: -1 })
    tl.to(ref.current, { opacity: 0, duration: 0, delay: 0.55 })
      .to(ref.current, { opacity: 1, duration: 0, delay: 0.45 })
    return () => { tl.kill() }
  }, [])
  return <span ref={ref} style={{ display: 'inline-block', width: 8, height: 13, background: GREEN, verticalAlign: 'middle', marginLeft: 2 }} />
}

// ── Main mobile view ──────────────────────────────────────
export default function MobileView() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  // Projects only (skip ABT-00 and COM-05 — handled separately)
  const projectIndices = SECTIONS
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => s.id.startsWith('PRJ') && !s.desktopOnly)
    .map(({ i }) => i)

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1,
      overflowY: 'auto', overflowX: 'hidden',
      fontFamily: 'var(--font-jetbrains-mono), monospace',
      color: GREEN,
      background: '#06090b',
    }}>

      {/* ── Hero / ABT ── */}
      <div style={{
        padding: '48px 20px 36px',
        borderBottom: `1px solid ${FAINT}`,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Faint grid lines */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: `linear-gradient(${FAINT} 1px, transparent 1px), linear-gradient(90deg, ${FAINT} 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          opacity: 0.35,
        }} />

        {/* System badge */}
        <div style={{ fontSize: 9, letterSpacing: 3, color: LABEL, marginBottom: 20, position: 'relative' }}>
          SYS.PORTFOLIO.OS — ABT-00
        </div>

        {/* Name */}
        <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: -1, color: GREEN, lineHeight: 1.1, marginBottom: 6, position: 'relative' }}>
          Georgius Bryan<Cursor />
        </div>

        {/* Role */}
        <div style={{ fontSize: 11, letterSpacing: 3, color: LABEL, marginBottom: 20, position: 'relative' }}>
          PRODUCT DESIGNER
        </div>

        {/* Trace divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, position: 'relative' }}>
          <div style={{ width: 4, height: 4, borderRadius: 1, background: `rgba(${RGB},0.4)` }} />
          <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${FAINT}, transparent)` }} />
        </div>

        {/* Tagline */}
        <p style={{ fontSize: 13, lineHeight: 1.85, color: DIM, marginBottom: 24, position: 'relative' }}>
          {SECTIONS[0].desc}
        </p>

        {/* Interactive terminal */}
        <Terminal />
      </div>

      {/* ── Project cards ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {/* Section label */}
        <div style={{ padding: '16px 20px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 9, letterSpacing: 3, color: LABEL }}>WORK</span>
          <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${FAINT}, transparent)` }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '0 16px 16px' }}>
          {projectIndices.map(i => (
            <SectionCard key={i} index={i} onOpen={() => setOpenIndex(i)} />
          ))}
        </div>
      </div>

      {/* ── Contact section ── */}
      {(() => {
        const contacts = (SECTION_DETAILS[0].sections as any[])
          ?.find((s: any) => s.contacts)?.contacts as { platform: string; handle: string; href: string }[] | undefined
        if (!contacts) return null
        return (
          <div style={{ padding: '0 16px 56px' }}>
            <div style={{ padding: '16px 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 9, letterSpacing: 3, color: LABEL }}>CONTACT</span>
              <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${FAINT}, transparent)` }} />
            </div>
            <div style={{
              border: `1px solid ${FAINT}`,
              borderRadius: 8,
              overflow: 'hidden',
              background: 'rgba(51,255,102,0.02)',
            }}>
              <div style={{ padding: '14px 18px 4px' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: GREEN, marginBottom: 4 }}>Say hello</div>
                <p style={{ fontSize: 12, lineHeight: 1.75, color: DIM }}>
                  Open to full-time roles — reach out any time.
                </p>
              </div>
              <div style={{ padding: '4px 18px 14px' }}>
                {contacts.map((c, ci) => (
                  <div key={ci} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    paddingTop: 12, paddingBottom: 12,
                    borderBottom: ci < contacts.length - 1 ? `1px solid rgba(${RGB},0.08)` : 'none',
                  }}>
                    <span style={{ fontSize: 9, letterSpacing: 2, color: LABEL }}>{c.platform}</span>
                    <a href={c.href} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 11, color: DIM, textDecoration: 'none' }}>
                      {c.handle}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      })()}

      {/* Case study overlay */}
      {openIndex !== null && (
        <CaseStudy index={openIndex} onClose={() => setOpenIndex(null)} />
      )}
    </div>
  )
}
