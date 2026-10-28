"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthShell } from '../../../components/ui/AuthShell'
import { Mail, Send, TriangleAlert } from 'lucide-react'
import { useForgotPassword } from '@/hooks/useForgotPassword'

function Page() {
    const [email, setEmail] = useState('')
    const { send, loading, error, success } = useForgotPassword()
    const router = useRouter()

    useEffect(() => {
        if (!success) return
        const timer = setTimeout(() => {
            router.replace(`/reset-password?email=${encodeURIComponent(email)}`)
        }, 400)
        return () => clearTimeout(timer)
    }, [email, router, success])

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        await send({ email })
    }

  return (
        <AuthShell
            eyebrow="Account recovery"
            title="Send a reset code to your inbox."
            subtitle="Enter the email tied to your account and we’ll send the OTP needed to reset your password through the current backend flow."
            bullets={[
                'The reset step uses the existing auth endpoints and keeps the flow secure.',
                'If the address exists, TriMergePro will send a code to that inbox.',
                'After sending, you can continue to the reset password screen with the code you receive.',
            ]}
            footer={(
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link href="/login" className="tp-footer-link" style={{ fontWeight: 800, color: 'var(--tp-primary)' }}>
                        Back to login
                    </Link>
                    <span style={{ color: 'var(--tp-muted)' }}>Need a new account? <Link href="/join-now" className="tp-footer-link" style={{ fontWeight: 800, color: 'var(--tp-primary)' }}>Join now</Link></span>
                </div>
            )}
        >
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                <div>
                    <div className="tp-kicker">Forgot password</div>
                    <h2 style={{ margin: '0.35rem 0 0', fontSize: '2rem', letterSpacing: '-0.04em' }}>We’ll help you get back in safely.</h2>
                    <p className="tp-lead" style={{ marginTop: '0.6rem' }}>Enter the email address connected to your account.</p>
                </div>

                <label style={{ display: 'grid', gap: '0.45rem' }}>
                    <span style={{ fontWeight: 800, color: 'var(--tp-ink)' }}>Email address</span>
                    <div style={{ position: 'relative' }}>
                        <Mail size={16} color="var(--tp-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@email.com" className="tp-card" style={{ width: '100%', boxSizing: 'border-box', padding: '0.95rem 1rem 0.95rem 2.5rem', borderRadius: '16px', border: '1px solid rgba(148,163,184,0.2)' }} />
                    </div>
                </label>

                {error && <div style={{ color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', padding: '0.85rem 1rem', borderRadius: '16px', fontWeight: 700 }}>{error}</div>}
                {success && <div style={{ color: '#166534', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.85rem 1rem', borderRadius: '16px', fontWeight: 700 }}>{success}</div>}

                <button type="submit" disabled={loading} className="tp-btn-primary" style={{ width: '100%', cursor: loading ? 'not-allowed' : 'pointer' }}>
                    {loading ? 'Sending reset code…' : 'Send reset code'}
                    {!loading && <Send size={16} />}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--tp-muted)', fontSize: '0.92rem' }}>
                    <TriangleAlert size={16} color="var(--tp-accent)" />
                    If the email exists, the reset OTP will arrive shortly.
                </div>
            </form>
        </AuthShell>
  )
}

export default Page