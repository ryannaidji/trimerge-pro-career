"use client"

import { useRegister } from '@/hooks/useRegister';
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import { AuthShell } from '../../components/ui/AuthShell';
import { ChevronRight, Eye, EyeOff, Mail } from 'lucide-react';

export default function JoinNowClient() {
    const { register, loading, error, setError } = useRegister();
    const router = useRouter();
    const searchParams = useSearchParams();

    const initialRole: 'Candidate' = 'Candidate';

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [terms, setTerms] = useState(false);
    const [updates, setUpdates] = useState(false);
    const [role] = useState<'Candidate'>('Candidate');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);


    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLocalError(null);

        const trimmedName = username.trim();
        const trimmedEmail = email.trim();

        if (!trimmedName || !trimmedEmail || !password || !confirmPassword) {
            setLocalError('Complete all required fields to continue.');
            return;
        }

        if (!terms) {
            setLocalError('You must accept the Terms and Conditions to continue.');
            return;
        }

        if (password.length < 8) {
            setLocalError('Use at least 8 characters for your password.');
            return;
        }

        if (password !== confirmPassword) {
            setLocalError('Passwords do not match.');
            return;
        }

        const data = {
            fullName: trimmedName,
            email: trimmedEmail,
            password,
            confirmPassword,
            agreeToTerms: terms,
            updates,
            role,
        } as const;

        const result = await register(data);
        if (result) {
            router.replace('/email-sent?email=' + encodeURIComponent(trimmedEmail) + '&role=' + encodeURIComponent(role));
        }
    };

    useEffect(() => {
        if (!error && !localError) return;
        const t = setTimeout(() => {
            setError(null);
            setLocalError(null);
        }, 3500);
        return () => clearTimeout(t);
    }, [error, localError, setError]);

    return (
        <AuthShell
            eyebrow="Join TriMergePro Careers"
            title="Create your account and get started."
            subtitle="Choose whether you're looking for opportunities or hiring talent, then create your account to get started."
            bullets={[
                'Candidate and employer paths stay separate from the first step.',
                'Email verification is required before onboarding continues.',
                'Your registration is processed securely.',
            ]}
            groupsTitle="Why Sign Up?"
            groups={[
                {
                    title: 'Candidates',
                    items: [
                        'Build your professional profile',
                        'Upload your resume and credentials',
                        'Apply to opportunities in one click',
                        'Track every application in one place',
                    ],
                },
                {
                    title: 'Employers',
                    items: [
                        'Post open positions',
                        'Review and manage applicants',
                        'Streamline your recruiting activity',
                        'Connect with qualified talent',
                    ],
                },
            ]}
            footer={(
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link href="/login" className="tp-footer-link" style={{ fontWeight: 800, color: 'var(--tp-primary)' }}>
                        Already have an account? Log in
                    </Link>
                    <span style={{ color: 'var(--tp-muted)' }}>Step 1 of 3</span>
                </div>
            )}
        >
            <form onSubmit={onSubmit} style={{ display: 'grid', gap: '1rem' }}>
                <div>
                    <div className="tp-kicker">Create account</div>
                    <h2 style={{ margin: '0.35rem 0 0', fontSize: '2rem', letterSpacing: '-0.04em' }}>Start with your role and keep moving.</h2>
                    <p className="tp-lead" style={{ marginTop: '0.6rem' }}>We&apos;ll send you to the right verification and onboarding flow once your account is created.</p>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                        <span className="tp-chip" style={{ background: 'rgba(29,78,216,0.08)', color: 'var(--tp-primary)' }}>Step 1: Account</span>
                        <span className="tp-chip" style={{ background: 'rgba(255,95,31,0.08)', color: 'var(--tp-accent)' }}>Step 2: Verify email</span>
                        <span className="tp-chip" style={{ background: 'rgba(15,23,42,0.05)', color: 'var(--tp-ink)' }}>Step 3: Onboarding</span>
                    </div>
                </div>

                <div style={{ display: 'grid', gap: '1rem' }}>
                    <label style={{ display: 'grid', gap: '0.45rem' }}>
                        <span style={{ fontWeight: 800, color: 'var(--tp-ink)' }}>Full name</span>
                        <input type='text' placeholder='Full name *' value={username} onChange={(e) => setUsername(e.target.value)} className="tp-card" style={{ width: '100%', boxSizing: 'border-box', padding: '0.95rem 1rem', borderRadius: '16px', border: '1px solid rgba(148,163,184,0.2)' }} />
                    </label>

                    <label style={{ display: 'grid', gap: '0.45rem' }}>
                        <span style={{ fontWeight: 800, color: 'var(--tp-ink)' }}>Email</span>
                        <div style={{ position: 'relative' }}>
                            <Mail size={16} color="var(--tp-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                            <input type='email' placeholder='Email *' value={email} onChange={(e) => setEmail(e.target.value)} className="tp-card" style={{ width: '100%', boxSizing: 'border-box', padding: '0.95rem 1rem 0.95rem 2.5rem', borderRadius: '16px', border: '1px solid rgba(148,163,184,0.2)' }} />
                        </div>
                    </label>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.85rem' }}>
                        <label style={{ display: 'grid', gap: '0.45rem' }}>
                            <span style={{ fontWeight: 800, color: 'var(--tp-ink)' }}>Password</span>
                            <div style={{ position: 'relative' }}>
                                <input type={showPassword ? 'text' : 'password'} placeholder='Password *' value={password} onChange={(e) => setPassword(e.target.value)} className="tp-card" style={{ width: '100%', boxSizing: 'border-box', padding: '0.95rem 2.5rem 0.95rem 1rem', borderRadius: '16px', border: '1px solid rgba(148,163,184,0.2)' }} />
                                <button type="button" onClick={() => setShowPassword((current) => !current)} aria-label="Toggle password visibility" style={{ position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--tp-muted)' }}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                            </div>
                        </label>
                        <label style={{ display: 'grid', gap: '0.45rem' }}>
                            <span style={{ fontWeight: 800, color: 'var(--tp-ink)' }}>Confirm password</span>
                            <div style={{ position: 'relative' }}>
                                <input type={showConfirmPassword ? 'text' : 'password'} placeholder='Confirm password *' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="tp-card" style={{ width: '100%', boxSizing: 'border-box', padding: '0.95rem 2.5rem 0.95rem 1rem', borderRadius: '16px', border: '1px solid rgba(148,163,184,0.2)' }} />
                                <button type="button" onClick={() => setShowConfirmPassword((current) => !current)} aria-label="Toggle confirm password visibility" style={{ position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--tp-muted)' }}>{showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                            </div>
                        </label>
                    </div>
                </div>

                <div style={{ display: 'grid', gap: '0.8rem' }}>
                    <label style={{ display: 'flex', gap: '0.7rem', alignItems: 'flex-start', color: 'var(--tp-muted)', fontSize: '0.95rem', lineHeight: 1.55 }}>
                        <input type='checkbox' id='terms' name='terms' checked={terms} onChange={(e) => setTerms(e.target.checked)} style={{ marginTop: '0.2rem' }} />
                        I agree to the Terms and Conditions.
                    </label>

                    <label style={{ display: 'flex', gap: '0.7rem', alignItems: 'flex-start', color: 'var(--tp-muted)', fontSize: '0.95rem', lineHeight: 1.55 }}>
                        <input type='checkbox' id='updates' name='updates' checked={updates} onChange={(e) => setUpdates(e.target.checked)} style={{ marginTop: '0.2rem' }} />
                        I&apos;d like to receive updates, job opportunities, and news from TriMergePro.
                    </label>
                </div>

                {(localError || error) && <div style={{ color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', padding: '0.85rem 1rem', borderRadius: '16px', fontWeight: 700 }}>{localError || error}</div>}

                <div style={{ fontSize: '0.92rem', color: 'var(--tp-muted)', lineHeight: 1.6 }}>
                    Password must be at least 8 characters. We will send you to email verification after registration.
                </div>

                <button type='submit' disabled={loading} className="tp-btn-primary" style={{ width: '100%', cursor: loading ? 'not-allowed' : 'pointer' }}>
                    {loading ? 'Creating account…' : 'Create account'}
                    {!loading && <ChevronRight size={16} />}
                </button>
            </form>
        </AuthShell>
    )
}
