"use client"

import React from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { AuthShell } from '../../components/ui/AuthShell'
import { MailCheck, RotateCcw } from 'lucide-react'

export default function LinkSentClient() {
    const searchParams = useSearchParams()
    const email = searchParams?.get('email') || ''

    return (
        <AuthShell
            eyebrow="Reset link sent"
            title="Check your inbox for the password reset details."
            subtitle={`If ${email || 'your email'} is registered, we sent a reset message with the next steps.`}
            bullets={[
                'Use the code or link from the email to continue resetting your password.',
                'If you do not see the message, check spam or try the reset request again.',
                'You can return to login once your new password has been set.',
            ]}
            footer={(
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link href="/forgot-password" className="tp-footer-link" style={{ fontWeight: 800, color: 'var(--tp-primary)' }}>
                        Try again
                    </Link>
                    <Link href="/login" className="tp-footer-link" style={{ fontWeight: 800, color: 'var(--tp-primary)' }}>
                        Back to login
                    </Link>
                </div>
            )}
        >
            <div style={{ display: 'grid', gap: '1rem', textAlign: 'center' }}>
                <div style={{ display: 'grid', placeItems: 'center', width: '5rem', height: '5rem', borderRadius: '28px', marginInline: 'auto', background: 'linear-gradient(135deg, rgba(29,78,216,0.12), rgba(245,166,35,0.12))' }}>
                    <MailCheck size={30} color="var(--tp-primary)" />
                </div>
                <div>
                    <div className="tp-kicker">What to do next</div>
                    <h2 style={{ margin: '0.35rem 0 0', fontSize: '2rem', letterSpacing: '-0.04em' }}>Open the email and copy the OTP into the reset form.</h2>
                    <p className="tp-lead" style={{ marginTop: '0.6rem' }}>If the message does not arrive in a few minutes, request another reset code.</p>
                </div>
                <Link href="/forgot-password" className="tp-btn-primary" style={{ width: '100%' }}>
                    Request another code
                    <RotateCcw size={16} />
                </Link>
            </div>
        </AuthShell>
    )
}
