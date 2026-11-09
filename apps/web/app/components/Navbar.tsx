"use client"

import React from 'react'

import Image from 'next/image';
import Link from 'next/link';
import { useUser } from '@/contexts/userContext/userContext';
import { usePathname } from 'next/navigation';
import { Bell, ChevronRight, HelpCircle, LogOut, Menu, MessageSquare, Sparkles, X } from 'lucide-react';

function Navbar() {
  const { state, logout } = useUser()
  const user = state.user
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)
  const [profileOpen, setProfileOpen] = React.useState(false)
  const profileRef = React.useRef<HTMLDivElement>(null)
  const displayName = user?.profile?.firstName ? `${user.profile.firstName}${user.profile.lastName ? ' ' + user.profile.lastName : ''}` : (user?.email ?? null)
  const isEmployer = user?.accountType === 'EMPLOYER'
  const isAdmin = user?.accountType === 'ADMIN'
  // Candidates and admins share the "My account" menu; only its links differ
  const hasAccountMenu = !!user && !isEmployer

  React.useEffect(() => {
    if (!profileOpen) return
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [profileOpen])

  // Account menu (#49), reused in both navbars. Accessible menu button:
  // aria-expanded/aria-controls, Escape closes and returns focus, links close the menu.
  const accountLinks = isAdmin
    ? [
        { href: '/admin', label: 'Admin dashboard' },
        { href: '/settings', label: 'Settings' },
      ]
    : [
        { href: '/applications', label: 'My applications' },
        { href: '/recommended-jobs', label: 'Recommended jobs' },
        { href: '/saved-jobs', label: 'Saved jobs' },
        { href: '/profile', label: 'My profile' },
        { href: '/settings', label: 'Settings' },
      ]
  const menuButtonRef = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (!profileOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setProfileOpen(false)
        menuButtonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [profileOpen])

  const AccountControls = hasAccountMenu ? (
    <div ref={profileRef} style={{ position: 'relative' }}>
      <button
        ref={menuButtonRef}
        type="button"
        onClick={() => setProfileOpen(o => !o)}
        aria-expanded={profileOpen}
        aria-controls="account-menu"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0.75rem 0.3rem 0.3rem', borderRadius: '999px', border: '1px solid rgba(148,163,184,0.3)', background: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}
      >
        <span aria-hidden="true" style={{ width: '30px', height: '30px', borderRadius: '999px', background: 'linear-gradient(135deg, #07172e, #1d4ed8)', color: 'white', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: '0.75rem' }}>
          {(displayName ?? 'C').charAt(0).toUpperCase()}
        </span>
        My account
      </button>
      {profileOpen && (
        <div id="account-menu" style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', background: 'white', borderRadius: '12px', boxShadow: '0 8px 24px rgba(15,23,42,0.12)', border: '1px solid rgba(148,163,184,0.18)', padding: '0.5rem', minWidth: '230px', zIndex: 200 }}>
          <div style={{ padding: '0.4rem 0.6rem 0.6rem', borderBottom: '1px solid #f1f5f9', marginBottom: '0.35rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Signed in as</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a', wordBreak: 'break-all' }}>{user!.email}</div>
          </div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid' }}>
            {accountLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setProfileOpen(false)}
                  aria-current={pathname === l.href ? 'page' : undefined}
                  style={{ display: 'block', padding: '0.55rem 0.6rem', borderRadius: '8px', color: '#0f172a', textDecoration: 'none', fontWeight: pathname === l.href ? 800 : 500, background: pathname === l.href ? '#eff6ff' : 'transparent' }}
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <button type="button" onClick={() => { setProfileOpen(false); logout() }} style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 0.6rem', borderRadius: '8px', border: 'none', background: 'transparent', color: '#b91c1c', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}>
                <LogOut size={14} aria-hidden="true" /> Log out
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  ) : null

  // Browse jobs page: logo + account menu only; employers and visitors keep their usual navbar
  if (pathname === '/browse-jobs' && hasAccountMenu) {
    return (
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid rgba(148,163,184,0.18)', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(18px)', boxShadow: '0 1px 3px rgba(15,23,42,0.06)' }}>
        <div className="tp-container" style={{ padding: '0.75rem 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
            <Image src="/Logo.png" alt="TriMergePRO Logo" width={190} height={84} style={{ objectFit: 'contain', height: '2.4rem', width: 'auto' }} />
          </Link>
          {AccountControls}
        </div>
      </nav>
    )
  }

  const navLinks = [
    { href: '/browse-jobs', label: 'Browse Jobs' },
    { href: '/about', label: 'About' },
    { href: '/join-now', label: 'Candidates' },
    { href: 'mailto:careers@trimergeconsulting.com', label: 'Contact' },
  ]

  // Employer-specific slim navbar
  if (isEmployer && user) {
    return (
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid rgba(148,163,184,0.15)', background: 'white', boxShadow: '0 1px 3px rgba(15,23,42,0.06)' }}>
        <div className="tp-container" style={{ padding: '0.65rem 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
              <Image src="/Logo.png" alt="TriMergePRO Logo" width={190} height={84} style={{ objectFit: 'contain', height: '2.2rem', width: 'auto' }} />
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Link href="/employer-dashboard" className="tp-nav-link nav-emp-dash" style={{ fontSize: '0.875rem' }}>Dashboard</Link>
              <Link href="/talent-search" className="tp-nav-link" style={{ fontSize: '0.875rem' }}>Find talent</Link>
              <Link href="/settings" className="tp-nav-link nav-emp-dash" style={{ fontSize: '0.875rem' }}>Settings</Link>
              {/* <Link href="/help" className="tp-nav-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem', color: '#475569' }}>
                <HelpCircle size={15} />
                Help
              </Link>

              <button type="button" title="Notifications" style={{ padding: '0.5rem', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#475569', display: 'grid', placeItems: 'center' }}>
                <Bell size={17} />
              </button>

              <button type="button" title="Messages" style={{ padding: '0.5rem', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#475569', display: 'grid', placeItems: 'center' }}>
                <MessageSquare size={17} />
              </button> */}

              <div style={{ width: '1px', height: '1.5rem', background: 'rgba(148,163,184,0.25)', margin: '0 0.25rem' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.65rem', borderRadius: '8px', background: '#f8fafc', border: '1px solid rgba(148,163,184,0.15)' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '999px', background: 'linear-gradient(135deg, #07172e, #1d4ed8)', color: 'white', display: 'grid', placeItems: 'center', fontSize: '0.65rem', fontWeight: 800, flexShrink: 0 }}>
                  {(displayName ?? 'R').charAt(0).toUpperCase()}
                </div>
                <span className="nav-email" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.email}
                </span>
              </div>

              <button onClick={() => logout()} title="Logout" style={{ padding: '0.5rem', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b', display: 'grid', placeItems: 'center' }}>
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: '1px solid rgba(148, 163, 184, 0.18)',
        background: 'rgba(255,255,255,0.82)',
        backdropFilter: 'blur(18px)',
        boxShadow: '0 16px 38px -26px rgba(15,23,42,0.4)',
      }}
    >
      <div className="tp-container" style={{ padding: '1rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <Link href={isAdmin ? '/admin' : hasAccountMenu ? '/browse-jobs' : '/'} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
            <Image src="/Logo.png" alt="TriMergePRO Logo" width={190} height={84} style={{ objectFit: 'contain', height: '2.8rem', width: 'auto' }} />
          </Link>

          {!hasAccountMenu && (
            <div className="tp-nav-links" style={{ alignItems: 'center', gap: '0.35rem' }}>
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="tp-nav-link">
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* {!isCandidate && (
              <Link href="/employers" className="tp-nav-link hidden sm:inline-flex">
                Employers / Post Job
              </Link>
            )} */}
            {hasAccountMenu ? (
              AccountControls
            ) : user ? (
              <>
                <div style={{ display: 'none', alignItems: 'center', gap: '0.65rem', padding: '0.55rem 0.8rem', borderRadius: '999px', background: 'rgba(29,78,216,0.08)', color: 'var(--tp-primary-dark)' }} className="md:flex">
                  <span style={{ width: '0.55rem', height: '0.55rem', borderRadius: '999px', background: 'var(--tp-success)' }} />
                  <span style={{ fontWeight: 800, fontSize: '0.92rem' }}>{displayName}</span>
                </div>
                <button onClick={() => logout()} className="tp-btn-ghost" style={{ padding: '0.8rem 1rem' }}>
                  <LogOut size={16} />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="tp-btn-secondary nav-login-btn" style={{ padding: '0.8rem 1rem', whiteSpace: 'nowrap' }}>
                  Log In
                </Link>
                <Link href="/join-now" className="tp-btn-primary" style={{ padding: '0.8rem 1rem', whiteSpace: 'nowrap' }}>
                  Sign up
                  <ChevronRight size={16} />
                </Link>
              </>
            )}

            <button onClick={() => setOpen((current) => !current)} className="tp-btn-ghost tp-nav-toggle" aria-label="Toggle navigation" style={{ padding: '0.75rem' }}>
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {open && (
          <div className="tp-card-soft md:hidden tp-fade-up" style={{ marginTop: '0.9rem', padding: '0.85rem' }}>
            <div style={{ display: 'grid', gap: '0.4rem' }}>
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="tp-nav-link" onClick={() => setOpen(false)}>
                  {link.label}
                </Link>
              ))}
              {hasAccountMenu && accountLinks.map((l) => (
                <Link key={l.href} href={l.href} className="tp-nav-link" onClick={() => setOpen(false)}>
                  {l.label}
                </Link>
              ))}
              {!hasAccountMenu && (
                <Link href="/employers" className="tp-nav-link" onClick={() => setOpen(false)}>
                  Employers / Post Job
                </Link>
              )}
              {!user && (
                <Link href="/login" className="tp-nav-link" onClick={() => setOpen(false)}>
                  Log In
                </Link>
              )}
            </div>
            <div style={{ marginTop: '0.8rem', padding: '0.8rem', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(29,78,216,0.12), rgba(245,166,35,0.12))', color: 'var(--tp-ink)', display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
              <Sparkles size={16} color="var(--tp-primary)" />
              <span style={{ fontSize: '0.92rem', fontWeight: 700 }}>Built for talents and employers with a modern consulting-grade experience.</span>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar