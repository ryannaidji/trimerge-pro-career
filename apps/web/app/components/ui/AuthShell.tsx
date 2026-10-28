"use client"

import type { ReactNode } from 'react'
import { CheckCircle2, Sparkles } from 'lucide-react'

type AuthShellProps = {
  eyebrow: string
  title: string
  subtitle: string
  bullets?: string[]
  groupsIntro?: string
  groupsTitle?: string
  groups?: { title: string; items: string[] }[]
  children: ReactNode
  footer?: ReactNode
}

export function AuthShell({ eyebrow, title, subtitle, bullets = [], groupsIntro, groupsTitle, groups, children, footer }: AuthShellProps) {
  return (
    <section style={{ padding: '2rem 0 5rem' }}>
      <div className="tp-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', gap: '1rem', alignItems: 'stretch' }}>
        <div className="auth-span-5" style={{ position: 'relative' }}>
          <div className="tp-card tp-float" style={{ position: 'relative', overflow: 'hidden', minHeight: '100%', padding: '2rem', background: 'linear-gradient(160deg, #07172e 0%, #1d4ed8 100%)', color: 'white' }}>
            <div style={{ position: 'absolute', inset: 'auto -4rem -4rem auto', width: '16rem', height: '16rem', borderRadius: '999px', background: 'rgba(255,255,255,0.08)', filter: 'blur(24px)' }} />
            <div style={{ position: 'relative', zIndex: 1, display: 'grid', gap: '1.15rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.55rem 0.9rem', borderRadius: '999px', background: 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 800, width: 'fit-content' }}>
                <Sparkles size={15} color="#f5a623" />
                {eyebrow}
              </div>
              <div style={{ maxWidth: '28rem' }}>
                <h1 style={{ margin: 0, fontSize: 'clamp(2.4rem, 5vw, 4.25rem)', lineHeight: 0.96, letterSpacing: '-0.05em' }}>{title}</h1>
                <p style={{ margin: '1rem 0 0', color: 'rgba(255,255,255,0.82)', lineHeight: 1.8, fontSize: '1.02rem' }}>{subtitle}</p>
              </div>
              {groupsIntro && (
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.82)', lineHeight: 1.7 }}>{groupsIntro}</p>
              )}
              {bullets.length > 0 && (
                <div style={{ display: 'grid', gap: '0.7rem' }}>
                  {bullets.map((bullet) => (
                    <div key={bullet} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.9rem 1rem', borderRadius: '18px', background: 'rgba(255,255,255,0.08)' }}>
                      <CheckCircle2 size={17} color="#93c5fd" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                      <span style={{ lineHeight: 1.6, color: 'rgba(255,255,255,0.88)' }}>{bullet}</span>
                    </div>
                  ))}
                </div>
              )}
              {groups && groups.length > 0 ? (
                <div style={{ padding: '1.1rem', borderRadius: '18px', background: 'rgba(255,255,255,0.06)' }}>
                  {groupsTitle && (
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.01em', marginBottom: '0.9rem' }}>{groupsTitle}</div>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1.1rem' }}>
                    {groups.map((group) => (
                      <div key={group.title}>
                        <div style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.72rem', fontWeight: 800, color: '#93c5fd', marginBottom: '0.5rem' }}>{group.title}</div>
                        <div style={{ display: 'grid', gap: '0.45rem' }}>
                          {group.items.map((item) => (
                            <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                              <span style={{ width: '0.35rem', height: '0.35rem', borderRadius: '999px', background: '#93c5fd', flexShrink: 0, marginTop: '0.45rem' }} />
                              <span style={{ lineHeight: 1.45, fontSize: '0.86rem', color: 'rgba(255,255,255,0.85)' }}>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : bullets.length === 0 && !groupsIntro ? (
                <div style={{ padding: '1rem 1.1rem', borderRadius: '18px', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.82)', lineHeight: 1.7 }}>
                  Our platform is designed to provide a seamless experience for both candidates and employers. As we continue to evolve, AI-powered capabilities will help streamline recruiting, improve candidate matching, and support better hiring decisions.
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="auth-span-7">
          <div className="tp-card-soft" style={{ padding: '1.5rem', minHeight: '100%' }}>
            {children}
            {footer ? <div style={{ marginTop: '1.25rem' }}>{footer}</div> : null}
          </div>
        </div>
      </div>
    </section>
  )
}
