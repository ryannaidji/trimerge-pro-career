"use client"

import Link from 'next/link'
import { Globe, Mail, MapPin, Phone } from "lucide-react";
import { useUser } from '@/contexts/userContext/userContext'
import { usePathname } from 'next/navigation'

function Footer() {
  const year = new Date().getFullYear()
  const { state } = useUser()
  const pathname = usePathname()
  const isRecruiter = state.user?.accountType === 'EMPLOYER'

  const isLoggedInCandidate = !!state.user && !isRecruiter

  if (isLoggedInCandidate) return null
  if (pathname === '/browse-jobs') return null

  if (isRecruiter) {
    return (
      <footer style={{ borderTop: '1px solid rgba(148, 163, 184, 0.18)', background: 'rgba(255,255,255,0.72)' }}>
        <div className="tp-container" style={{ padding: '0.85rem 0', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--tp-muted)' }}>
          <span>© {year} TriMergePro Careers. All rights reserved.</span>
          <span>TriMergePRO Careers is a workforce and recruiting platform designed to connect talent, employers, and opportunities through technology-driven solutions.</span>
        </div>
      </footer>
    )
  }

  return (
    <footer style={{ marginTop: '4rem', borderTop: '1px solid rgba(148, 163, 184, 0.18)', background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(18px)' }}>
      <div className="tp-container" style={{ padding: '3rem 0 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', gap: '1.5rem' }}>
          <div className="auth-span-5">
            <div style={{ display: 'grid', gap: '0.9rem' }}>
              <div style={{ display: 'grid', gap: '0.55rem', color: 'var(--tp-muted)', fontSize: '0.95rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Mail size={16} /> careers@trimergeconsulting.com</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Phone size={16} /> (305) 940-5344</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><MapPin size={16} /> Miami, FL</div>
                <a href="https://www.trimergeconsulting.com" target="_blank" rel="noopener noreferrer" className="tp-footer-link" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--tp-muted)' }}><Globe size={16} /> www.TriMergeConsulting.com</a>
                <a href="https://www.trimergepro.com" target="_blank" rel="noopener noreferrer" className="tp-footer-link" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--tp-muted)' }}><Globe size={16} /> www.TriMergePRO.com</a>
                <a
                  href="https://www.linkedin.com/showcase/trimergepro/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tp-footer-link"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    color: 'var(--tp-muted)'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  Follow TriMergePRO on LinkedIn
                </a>
              </div>
            </div>
          </div>

          <div className="auth-span-7">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(9rem, 1fr))', gap: '1.5rem' }}>
              {[
                // { title: 'Employers', links: [{ href: '/employers', label: 'Post a Job' }, { href: '/login', label: 'Employer Log In' }] },
                { title: 'Job Seekers', links: [{ href: '/browse-jobs', label: 'Browse Jobs' }, { href: '/join-now', label: 'Create Profile' }, { href: '/login', label: 'Log In' }] },
                { title: 'Company', links: [{ href: '/about', label: 'About Us' }, { href: 'mailto:careers@trimergeconsulting.com', label: 'Contact Us' }] },
                { title: 'Support', links: [{ href: '/forgot-password', label: 'Forgot Password' }, { href: 'privacy-policy', label: 'Privacy Policy' }, { href: 'terms-of-use', label: 'Terms of Use' }, { href: 'accessibility-statement', label: 'Accessibility' }] },
              ].map((column) => (
                <div key={column.title}>
                  <div className="tp-kicker" style={{ marginBottom: '0.8rem' }}>{column.title}</div>
                  <div style={{ display: 'grid', gap: '0.55rem' }}>
                    {column.links.map((link) => (
                      link.href === '#' ? (
                        <a key={link.label} href="#" onClick={(e) => e.preventDefault()} className="tp-footer-link">
                          {link.label}
                        </a>
                      ) : (
                        <Link key={link.label} href={link.href} className="tp-footer-link">
                          {link.label}
                        </Link>
                      )
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(148, 163, 184, 0.16)', color: 'var(--tp-muted)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '0.75rem', fontSize: '0.92rem' }}>
          <span>© {year} TriMergePro Careers. All rights reserved.</span>
          <span>TriMergePRO Careers is a workforce and recruiting platform designed to connect talent, employers, and opportunities through technology-driven solutions.</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer