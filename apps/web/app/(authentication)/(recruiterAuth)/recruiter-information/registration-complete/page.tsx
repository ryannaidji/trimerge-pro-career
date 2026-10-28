"use client"

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { AuthShell } from '../../../../components/ui/AuthShell'
import { BadgeCheck, Building2 } from 'lucide-react'

export default function Page() {
    return (
        <AuthShell
            eyebrow="Employer onboarding complete"
            title="Your recruiter profile is ready."
            subtitle="You can now post roles, manage candidates, and work from the employer dashboard."
            bullets={[
                'Company and hiring details have been saved through the backend onboarding flow.',
                'You are ready to start posting and managing jobs.',
                'The employer dashboard is the next place to work from.',
            ]}
            footer={(
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--tp-muted)' }}>Everything is ready for hiring.</span>
                    <Link href="/employer-dashboard" className="tp-footer-link" style={{ fontWeight: 800, color: 'var(--tp-primary)' }}>
                        Go to dashboard
                    </Link>
                </div>
            )}
        >
            <div style={{ display: 'grid', gap: '1rem', textAlign: 'center' }}>
                <div style={{ display: 'grid', placeItems: 'center', width: '5rem', height: '5rem', borderRadius: 28, marginInline: 'auto', background: 'linear-gradient(135deg, rgba(29,78,216,0.12), rgba(245,166,35,0.12))' }}>
                    <BadgeCheck size={30} color="var(--tp-primary)" />
                </div>
                <div>
                    <div className="tp-kicker">Complete</div>
                    <h2 style={{ margin: '0.35rem 0 0', fontSize: '2rem', letterSpacing: '-0.04em' }}>Start hiring from a cleaner dashboard.</h2>
                    <p className="tp-lead" style={{ marginTop: '0.6rem' }}>Go to the employer dashboard to manage the next steps.</p>
                </div>
                <Link href="/employer-dashboard" className="tp-btn-primary" style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    Open dashboard
                    <Building2 size={16} />
                </Link>
            </div>
        </AuthShell>
    )
}
