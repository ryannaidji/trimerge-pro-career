"use client"

import { useUser } from '@/contexts/userContext/userContext';
import { useLogin } from '@/hooks/useLogin';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { AuthShell } from '../../components/ui/AuthShell';
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';

function LoginPage() {
  const { login, loading, error, setError } = useLogin(); 
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, setError]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const user = await login({ email, password });

    if (!user) return;

    const resolvedUser = (user as { user?: { accountType?: string; isVerified?: boolean; profile?: { firstName?: string }; email?: string; status?: string } }).user ?? (user as { accountType?: string; isVerified?: boolean; profile?: { firstName?: string }; email?: string; status?: string });
    const accountType = (resolvedUser?.accountType || '').toLowerCase();
    const isVerified = resolvedUser?.isVerified !== false;

    if (!isVerified) {
      router.replace(`/email-sent?email=${encodeURIComponent(email)}&role=${encodeURIComponent(resolvedUser?.accountType || 'Candidate')}`);
      return;
    }

    const hasProfile = Boolean(resolvedUser?.profile && Object.keys(resolvedUser.profile).length > 0);

    if (accountType === 'candidate') {
      router.replace(hasProfile ? '/browse-jobs' : '/personal-information/step-one');
      return;
    }

    if (accountType === 'recruiter' || accountType === 'employer') {
      router.replace(hasProfile ? '/employer-dashboard' : '/recruiter-information/step-one');
      return;
    }

    router.replace('/browse-jobs');
  }

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Secure Access for Candidates & Employers"
      subtitle="Sign in to access your personalized dashboard, manage your profile, apply for opportunities, or manage your recruiting activities."
      groupsTitle="Login to Get Started"
      groups={[
        {
          title: 'Candidates',
          items: [
            'Track job applications',
            'Update your professional profile',
            'Upload resumes and credentials',
            'Discover new opportunities',
          ],
        },
        {
          title: 'Employers',
          items: [
            'Post positions',
            'Review applicants',
            'Manage recruiting activity',
            'Connect with qualified talent',
          ],
        },
      ]}
      footer={(
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/forgot-password" className="tp-footer-link" style={{ fontWeight: 800, color: 'var(--tp-primary)' }}>
            Forgot password?
          </Link>
          <span style={{ color: 'var(--tp-muted)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/join-now" className="tp-footer-link" style={{ fontWeight: 800, color: 'var(--tp-primary)' }}>
              Join now
            </Link>
          </span>
        </div>
      )}
    >
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: '1rem' }}>
        <div>
          <div className="tp-kicker">Log in</div>
          <h2 style={{ margin: '0.35rem 0 0', fontSize: '2rem', letterSpacing: '-0.04em' }}>Access your account</h2>
          <p className="tp-lead" style={{ marginTop: '0.6rem' }}>Use the same email you registered with to continue.</p>
        </div>

        <label style={{ display: 'grid', gap: '0.45rem' }}>
          <span style={{ fontWeight: 800, color: 'var(--tp-ink)' }}>Email</span>
          <div style={{ position: 'relative' }}>
            <Mail size={16} color="var(--tp-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              id="email"
              placeholder="you@email.com"
              required
              className="tp-card"
              style={{ width: '100%', boxSizing: 'border-box', padding: '0.95rem 1rem 0.95rem 2.5rem', borderRadius: '16px', border: '1px solid rgba(148,163,184,0.2)', outline: 'none', boxShadow: 'none' }}
            />
          </div>
        </label>

        <label style={{ display: 'grid', gap: '0.45rem' }}>
          <span style={{ fontWeight: 800, color: 'var(--tp-ink)' }}>Password</span>
          <div style={{ position: 'relative' }}>
            <LockKeyhole size={16} color="var(--tp-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? 'text' : 'password'}
              id="password"
              placeholder="••••••••"
              required
              className="tp-card"
              style={{ width: '100%', boxSizing: 'border-box', padding: '0.95rem 3rem 0.95rem 2.5rem', borderRadius: '16px', border: '1px solid rgba(148,163,184,0.2)', outline: 'none', boxShadow: 'none' }}
            />
            <button type="button" onClick={() => setShowPassword((current) => !current)} aria-label="Toggle password visibility" style={{ position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--tp-muted)' }}>
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </label>

        {error && <div style={{ color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', padding: '0.85rem 1rem', borderRadius: '16px', fontWeight: 700 }}>{error}</div>}

        <button type="submit" disabled={loading} className="tp-btn-primary" style={{ width: '100%', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Logging in…' : 'Log in'}
          {!loading && <ArrowRight size={16} />}
        </button>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <span className="tp-chip" style={{ background: 'rgba(22,163,74,0.1)', color: 'var(--tp-success)' }}>
            <LockKeyhole size={14} />
            Secure Login
          </span>
        </div>
      </form>
    </AuthShell>
  );
}

export default LoginPage;