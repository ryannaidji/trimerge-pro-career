"use client"

import Link from 'next/link'
import React from 'react'
import { AuthShell } from '../../../../components/ui/AuthShell'
import { BadgeCheck, BriefcaseBusiness } from 'lucide-react'

function Page() {
  return (  
        <AuthShell
            eyebrow="Candidate onboarding complete"
            title="Your profile is ready to go."
            subtitle="You can now browse opportunities, connect with recruiters, and use the profile you just built across the platform."
            bullets={[
                'Your candidate profile has been saved through the existing backend flow.',
                'You can begin browsing jobs and applying immediately.',
                'The next best step is to review opportunities and complete your applications.',
            ]}
            footer={(
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--tp-muted)' }}>Everything is stored and ready.</span>
                    <Link href="/browse-jobs" className="tp-footer-link" style={{ fontWeight: 800, color: 'var(--tp-primary)' }}>
                        Go to jobs
                    </Link>
                </div>
            )}
        >
            <div style={{ display: 'grid', gap: '1rem', textAlign: 'center' }}>
                <div style={{ display: 'grid', placeItems: 'center', width: '5rem', height: '5rem', borderRadius: '28px', marginInline: 'auto', background: 'linear-gradient(135deg, rgba(29,78,216,0.12), rgba(245,166,35,0.12))' }}>
                    <BadgeCheck size={30} color="var(--tp-primary)" />
                </div>
                <div>
                    <div className="tp-kicker">Complete</div>
                    <h2 style={{ margin: '0.35rem 0 0', fontSize: '2rem', letterSpacing: '-0.04em' }}>Ready to explore roles.</h2>
                    <p className="tp-lead" style={{ marginTop: '0.6rem' }}>Move into the jobs area and start applying.</p>
                </div>
                <Link href="/browse-jobs" className="tp-btn-primary" style={{ width: '100%' }}>
                    Browse jobs
                    <BriefcaseBusiness size={16} />
                </Link>
            </div>
        </AuthShell>
  )
}

export default Page