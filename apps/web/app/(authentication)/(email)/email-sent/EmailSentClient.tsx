"use client"

import { useResendEmail } from '@/hooks/useResendEmail';
import { useVerifyEmail } from '@/hooks/useVerifyEmail';
import React, { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/contexts/userContext/userContext';
import { AuthShell } from '../../../components/ui/AuthShell';
import { ArrowRight, RotateCcw } from 'lucide-react';
import Link from 'next/link';

export default function EmailSentClient()  {
    const [code, setCode] = React.useState(['', '', '', '', '', '']);
    const inputsRef = React.useRef<Array<HTMLInputElement | null>>([]);
    const {setUser } = useUser()
    const { resend, loading: resendLoading, error: resendError } = useResendEmail();
    const {verify, loading: verifying, error: verifyError, setError} = useVerifyEmail();
    const router = useRouter();
    const searchParams = useSearchParams();
    const emailFromQuery = searchParams?.get('email') || '';
    const roleFromQuery = searchParams?.get('role') || '';
    const [message, setMessage] = React.useState<string | null>(null);

    const callVerify = async () => {
        // assemble otp
        const otp = code.join('');
        if (otp.length !== code.length) {
            setMessage('Please enter the complete verification code.');
            return;
        }
        setMessage(null);
        const result = await verify({ email: emailFromQuery, otp });
        setUser(result)

        if (result) {
            router.replace(`/email-verified?email=${encodeURIComponent(emailFromQuery)}&role=${encodeURIComponent(roleFromQuery || 'Candidate')}`);
            return;
        }
    }


    useEffect(()=>{
        setTimeout(() => {
            if(verifyError) {
                setError(null);
            }
        }, 3000);
    }, [verifyError, setError]);

    useEffect(() => {
        setTimeout(() => {
            if (resendError) {
                setError(null);
            }
        }, 3000);
    }, [resendError, setError]);

    useEffect(() => {
        setTimeout(() => {
            if (message) {
                setMessage(null);
            }
        }, 3000);
    }, [message]);

    const focusInput = (idx: number) => {
        const el = inputsRef.current[idx];
        if (el) el.focus();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
        const val = e.target.value.replace(/\D/g, ''); // only digits
        if (!val) {
            const newCode = [...code];
            newCode[idx] = '';
            setCode(newCode);
            return;
        }

        // if user typed/pasted multiple digits into one box, take first and distribute via paste handler
        const char = val[0];
        const newCode = [...code];
        newCode[idx] = char;
        setCode(newCode);
        // move focus to next
        if (idx < inputsRef.current.length - 1) {
            focusInput(idx + 1);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
        if (e.key === 'Backspace') {
            if (code[idx]) {
                // clear current value
                const newCode = [...code];
                newCode[idx] = '';
                setCode(newCode);
            } else if (idx > 0) {
                // move back
                focusInput(idx - 1);
                const newCode = [...code];
                newCode[idx - 1] = '';
                setCode(newCode);
            }
        } else if (e.key === 'ArrowLeft' && idx > 0) {
            focusInput(idx - 1);
        } else if (e.key === 'ArrowRight' && idx < inputsRef.current.length - 1) {
            focusInput(idx + 1);
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const paste = e.clipboardData.getData('text') || '';
        const digits = paste.replace(/\D/g, '').slice(0, code.length);
        if (!digits) return;
        const newCode = [...code];
        for (let i = 0; i < digits.length; i++) {
            newCode[i] = digits[i];
        }
        setCode(newCode);
        // focus the next empty or last filled
        const nextIndex = Math.min(digits.length, code.length - 1);
        focusInput(nextIndex);
    };

    return (
        <AuthShell
            eyebrow="Verify your account"
            title="Enter the six-digit code to continue."
            subtitle={`We sent a verification code to ${emailFromQuery || 'your email address'}. Finish this step and we will route you into the correct onboarding path.`}
            bullets={[
                'Keep the code handy from the email you received.',
                'Verification continues into the current candidate or employer onboarding flow.',
                'If the code expires, you can request a new one without leaving the page.',
            ]}
            footer={(
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--tp-muted)' }}>Need a different account? You can log out and start over.</span>
                    <Link href="/login" className="tp-footer-link" style={{ fontWeight: 800, color: 'var(--tp-primary)' }}>
                        Back to login
                    </Link>
                </div>
            )}
        >
            <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                    <div className="tp-kicker">Verification</div>
                    <h2 style={{ margin: '0.35rem 0 0', fontSize: '2rem', letterSpacing: '-0.04em' }}>Check your inbox and paste the code here.</h2>
                    <p className="tp-lead" style={{ marginTop: '0.6rem' }}>The code should be six digits long and tied to {roleFromQuery || 'your account'}.</p>
                </div>

                <div onPaste={handlePaste} style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: '0.6rem' }}>
                    {code.map((c, i) => (
                        <input
                            key={i}
                            ref={(el: HTMLInputElement | null) => {
                                inputsRef.current[i] = el
                                return undefined
                            }}
                            inputMode='numeric'
                            pattern='\d*'
                            maxLength={1}
                            aria-label={`digit-${i + 1}`}
                            value={c}
                            onChange={(e) => handleChange(e, i)}
                            onKeyDown={(e) => handleKeyDown(e, i)}
                            className="tp-card"
                            style={{ width: '100%', aspectRatio: '1 / 1', textAlign: 'center', fontSize: '1.2rem', fontWeight: 800, borderRadius: '18px', border: '1px solid rgba(148,163,184,0.2)', outline: 'none' }}
                        />
                    ))}
                </div>

                <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {verifyError && <div style={{ color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', padding: '0.85rem 1rem', borderRadius: '16px', fontWeight: 700 }}>{verifyError}</div>}
                    {message && <div style={{ color: '#166534', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.85rem 1rem', borderRadius: '16px', fontWeight: 700 }}>{message}</div>}
                    {resendError && <div style={{ color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', padding: '0.85rem 1rem', borderRadius: '16px', fontWeight: 700 }}>{resendError}</div>}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem' }}>
                    <button onClick={callVerify} disabled={verifying} className="tp-btn-primary" style={{ flex: '1 1 16rem', cursor: verifying ? 'not-allowed' : 'pointer' }}>
                        {verifying ? 'Verifying…' : 'Verify account'}
                        {!verifying && <ArrowRight size={16} />}
                    </button>
                    <button
                        onClick={async () => {
                            setMessage(null)
                            if (!emailFromQuery) {
                                setMessage('No email available to resend to.')
                                return
                            }
                            const res = await resend({ email: emailFromQuery })
                            if (res) {
                                setMessage('Verification email resent. Check your inbox.')
                            }
                        }}
                        disabled={resendLoading}
                        className="tp-btn-secondary"
                        style={{ flex: '1 1 14rem', cursor: resendLoading ? 'not-allowed' : 'pointer' }}
                    >
                        {resendLoading ? 'Resending…' : 'Resend code'}
                        <RotateCcw size={16} />
                    </button>
                </div>
            </div>
        </AuthShell>
    )
}
