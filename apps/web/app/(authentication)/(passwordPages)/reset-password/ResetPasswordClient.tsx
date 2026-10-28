"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthShell } from '../../../components/ui/AuthShell'
import { Eye, EyeOff, KeyRound, Mail, ShieldCheck } from 'lucide-react'
import { useResetPassword } from '@/hooks/useResetPassword'

export default function ResetPasswordClient() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [email, setEmail] = useState(searchParams?.get('email') || '')
    const [otp, setOtp] = useState(searchParams?.get('otp') || '')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [localError, setLocalError] = useState<string | null>(null)
    const { reset, loading, error, success } = useResetPassword()

    useEffect(() => {
        const queryEmail = searchParams?.get('email') || ''
        const queryOtp = searchParams?.get('otp') || ''
        // defer updates
        const t = setTimeout(() => {
            if (queryEmail) setEmail(queryEmail)
            if (queryOtp) setOtp(queryOtp)
        }, 0)
        return () => clearTimeout(t)
    }, [searchParams])

    useEffect(() => {
        if (!success) return
        const timer = setTimeout(() => router.replace('/password-success'), 450)
        return () => clearTimeout(timer)
    }, [router, success])

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setLocalError(null)

        if (newPassword !== confirmPassword) {
            setLocalError('Passwords do not match.')
            return
        }

        if (!email || !otp) {
            setLocalError('Email and reset code are required.')
            return
        }

        await reset({ email, otp, newPassword })
    }

    return (
        <AuthShell
            eyebrow="Secure password reset"
            title="Create a new password in a secure step."
            subtitle="Use the reset code from your email to prove ownership and set a new password for your TriMergePro Careers account."
            bullets={[
                'The reset flow is aligned with the backend OTP endpoint.',
                'Use the email address tied to the account you want to recover.',
                'Once complete, you can return to login and sign in with your new credentials.',
            ]}
            footer={(
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link href="/forgot-password" className="tp-footer-link" style={{ fontWeight: 800, color: 'var(--tp-primary)' }}>
                        Request another code
                    </Link>
                    <Link href="/login" className="tp-footer-link" style={{ fontWeight: 800, color: 'var(--tp-primary)' }}>
                        Back to login
                    </Link>
                </div>
            )}
        >
            <form onSubmit={onSubmit} style={{ display: 'grid', gap: '1rem' }}>
                <div>
                    <div className="tp-kicker">Reset password</div>
                    <h2 style={{ margin: '0.35rem 0 0', fontSize: '2rem', letterSpacing: '-0.04em' }}>Enter your email, code, and new password.</h2>
                    <p className="tp-lead" style={{ marginTop: '0.6rem' }}>If your email contains a prefilled code or address, you can continue from there.</p>
                </div>

                <label style={{ display: 'grid', gap: '0.45rem' }}>
                    <span style={{ fontWeight: 800, color: 'var(--tp-ink)' }}>Email</span>
                    <div style={{ position: 'relative' }}>
                        <Mail size={16} color="var(--tp-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@email.com" className="tp-card" style={{ width: '100%', boxSizing: 'border-box', padding: '0.95rem 1rem 0.95rem 2.5rem', borderRadius: '16px', border: '1px solid rgba(148,163,184,0.2)' }} />
                    </div>
                </label>

                <label style={{ display: 'grid', gap: '0.45rem' }}>
                    <span style={{ fontWeight: 800, color: 'var(--tp-ink)' }}>Reset code</span>
                    <div style={{ position: 'relative' }}>
                        <KeyRound size={16} color="var(--tp-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                        <input value={otp} onChange={(e) => setOtp(e.target.value)} type="text" placeholder="6-digit code" className="tp-card" style={{ width: '100%', boxSizing: 'border-box', padding: '0.95rem 1rem 0.95rem 2.5rem', borderRadius: '16px', border: '1px solid rgba(148,163,184,0.2)' }} />
                    </div>
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.85rem' }}>
                    <label style={{ display: 'grid', gap: '0.45rem' }}>
                        <span style={{ fontWeight: 800, color: 'var(--tp-ink)' }}>New password</span>
                        <div style={{ position: 'relative' }}>
                            <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type={showPassword ? 'text' : 'password'} placeholder="New password *" className="tp-card" style={{ width: '100%', boxSizing: 'border-box', padding: '0.95rem 2.5rem 0.95rem 1rem', borderRadius: '16px', border: '1px solid rgba(148,163,184,0.2)' }} />
                            <button type="button" onClick={() => setShowPassword((current) => !current)} aria-label="Toggle new password visibility" style={{ position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--tp-muted)' }}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                        </div>
                    </label>

                    <label style={{ display: 'grid', gap: '0.45rem' }}>
                        <span style={{ fontWeight: 800, color: 'var(--tp-ink)' }}>Confirm password</span>
                        <div style={{ position: 'relative' }}>
                            <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm new password *" className="tp-card" style={{ width: '100%', boxSizing: 'border-box', padding: '0.95rem 2.5rem 0.95rem 1rem', borderRadius: '16px', border: '1px solid rgba(148,163,184,0.2)' }} />
                            <button type="button" onClick={() => setShowConfirmPassword((current) => !current)} aria-label="Toggle confirm password visibility" style={{ position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--tp-muted)' }}>{showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                        </div>
                    </label>
                </div>

                {localError && <div style={{ color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', padding: '0.85rem 1rem', borderRadius: '16px', fontWeight: 700 }}>{localError}</div>}
                {error && <div style={{ color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', padding: '0.85rem 1rem', borderRadius: '16px', fontWeight: 700 }}>{error}</div>}
                {success && <div style={{ color: '#166534', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.85rem 1rem', borderRadius: '16px', fontWeight: 700 }}>{success}</div>}

                <button type="submit" disabled={loading} className="tp-btn-primary" style={{ width: '100%', cursor: loading ? 'not-allowed' : 'pointer' }}>
                    {loading ? 'Resetting…' : 'Confirm new password'}
                    {!loading && <ShieldCheck size={16} />}
                </button>
            </form>
        </AuthShell>
    )
}
