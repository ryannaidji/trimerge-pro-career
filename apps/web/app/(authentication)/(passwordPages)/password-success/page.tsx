"use client"

import Link from 'next/link'
import React from 'react'
import { AuthShell } from '../../../components/ui/AuthShell'
import { CheckCircle2, LogIn } from 'lucide-react'

function Page() {
  return (  
        <AuthShell
            eyebrow="Password updated"
            title="You&apos;re ready to sign in again."
            subtitle="Your new password has been saved successfully. Use your updated credentials the next time you log in."
            bullets={[
                'The reset step has completed against the backend API.',
                'You can now return to login with your new password.',
                'Keep the experience fast and secure with the same session flow.',
            ]}
            footer={(
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--tp-muted)' }}>Everything is updated and ready.</span>
                    <Link href="/login" className="tp-footer-link" style={{ fontWeight: 800, color: 'var(--tp-primary)' }}>
                        Back to sign in
                    </Link>
                </div>
            )}
        >
            <div style={{ display: 'grid', gap: '1rem', textAlign: 'center' }}>
                <div style={{ display: 'grid', placeItems: 'center', width: '5rem', height: '5rem', borderRadius: '28px', marginInline: 'auto', background: 'linear-gradient(135deg, rgba(22,163,74,0.12), rgba(29,78,216,0.08))' }}>
                    <CheckCircle2 size={30} color="var(--tp-success)" />
                </div>
                <div>
                    <div className="tp-kicker">Success</div>
                    <h2 style={{ margin: '0.35rem 0 0', fontSize: '2rem', letterSpacing: '-0.04em' }}>Your password is now active.</h2>
                    <p className="tp-lead" style={{ marginTop: '0.6rem' }}>Click below to return to login and continue from there.</p>
                </div>
                <Link href="/login" className="tp-btn-primary" style={{ width: '100%' }}>
                    Back to sign in
                    <LogIn size={16} />
                </Link>
            </div>
        </AuthShell>
  )
}

export default Page