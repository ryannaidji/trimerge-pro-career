"use client"

import Link from 'next/link'
import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useResendEmail } from '@/hooks/useResendEmail'
import { AuthShell } from '../../../components/ui/AuthShell'
import { AlertTriangle, RotateCcw } from 'lucide-react'

export default function EmailExpiredClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { resend, loading, error } = useResendEmail()
  const email = searchParams?.get('email') || ''
  const role = searchParams?.get('role') || 'Candidate'

  return (
    <AuthShell
      eyebrow="Verification expired"
      title="That email verification link is no longer valid."
      subtitle="Verification links expire to keep the onboarding process secure. Request a fresh verification email and continue from there."
      bullets={[
        'Use the resend flow to generate a new onboarding code.',
        'Keep the same email address and role that you used when signing up.',
        'Once you verify again, you can continue directly into onboarding.',
      ]}
      footer={(
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/join-now" className="tp-footer-link" style={{ fontWeight: 800, color: 'var(--tp-primary)' }}>
            Back to sign up
          </Link>
          <Link href="/login" className="tp-footer-link" style={{ fontWeight: 800, color: 'var(--tp-primary)' }}>
            Back to login
          </Link>
        </div>
      )}
    >
      <div style={{ display: 'grid', gap: '1rem', textAlign: 'center' }}>
        <div style={{ display: 'grid', placeItems: 'center', width: '5rem', height: '5rem', borderRadius: '28px', marginInline: 'auto', background: 'linear-gradient(135deg, rgba(245,166,35,0.16), rgba(29,78,216,0.08))' }}>
          <AlertTriangle size={30} color="var(--tp-accent)" />
        </div>
        <div>
          <div className="tp-kicker">Action required</div>
          <h2 style={{ margin: '0.35rem 0 0', fontSize: '2rem', letterSpacing: '-0.04em' }}>Request a new verification email.</h2>
          <p className="tp-lead" style={{ marginTop: '0.6rem' }}>If you have access to your inbox, we can send another onboarding message right away.</p>
        </div>

        {error && <div style={{ color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', padding: '0.85rem 1rem', borderRadius: '16px', fontWeight: 700 }}>{error}</div>}

        <button
          onClick={async () => {
            if (!email) {
              router.replace('/join-now')
              return
            }
            await resend({ email })
            router.replace(`/email-sent?email=${encodeURIComponent(email)}&role=${encodeURIComponent(role)}`)
          }}
          disabled={loading}
          className="tp-btn-primary"
          style={{ width: '100%', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Resending…' : 'Resend verification email'}
          {!loading && <RotateCcw size={16} />}
        </button>
      </div>
    </AuthShell>
  )
}
