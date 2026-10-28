"use client"
// Link removed (unused)
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRecruiterOnboardingStepThree } from '@/hooks/useRecruiterOnboardingStepThree'
import { AuthShell } from '../../../../components/ui/AuthShell'
import { ArrowRight } from 'lucide-react'

function Page() {
    const router = useRouter()
        const { submit, loading, error } = useRecruiterOnboardingStepThree()
    const [companyOverview, setCompanyOverview] = useState('')
    const [benefitsAndOpportunities, setBenefitsAndOpportunities] = useState('')
    const [primaryHiringNeeds, setPrimaryHiringNeeds] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const payload = { companyOverview, benefitsAndOpportunities, primaryHiringNeeds }
        const result = await submit(payload)
        if (result) {
                        router.push('/recruiter-information/registration-complete')
        }
    }

    return (
        <AuthShell
            eyebrow="Employer onboarding"
            title="Explain the company story and what you are hiring for."
            subtitle="This final recruiter step turns the profile into something useful for candidates and keeps the onboarding aligned with the backend contract."
            bullets={[
                'Share the company overview, benefits, and hiring needs in a structured way.',
                'These details help the platform present richer employer profiles.',
                'Finish this screen and the recruiter account is ready to use.',
            ]}
            footer={<span style={{ color: 'var(--tp-muted)' }}>Step 2 of 3</span>}
        >
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                <div>
                    <div className="tp-kicker">Hiring profile</div>
                    <h2 style={{ margin: '0.35rem 0 0', fontSize: '2rem', letterSpacing: '-0.04em' }}>Tell candidates why they should care.</h2>
                    <p className="tp-lead" style={{ marginTop: '0.6rem' }}>A clear profile improves the recruiting experience later on.</p>
                </div>

                <label style={{ display: 'grid', gap: '0.45rem' }}>
                    <span style={{ fontWeight: 800, color: 'var(--tp-ink)' }}>Company overview</span>
                    <textarea
                        value={companyOverview}
                        onChange={(e) => setCompanyOverview(e.target.value)}
                        name='companyOverview'
                        placeholder='Briefly describe your company, mission, and workplace culture (max 800 characters).'
                        className="tp-card"
                        style={{ width: '100%', minHeight: '8rem', resize: 'vertical', boxSizing: 'border-box', padding: '1rem', borderRadius: '18px', border: '1px solid rgba(148,163,184,0.2)' }}
                    />
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.85rem' }}>
                    <label style={{ display: 'grid', gap: '0.45rem' }}>
                        <span style={{ fontWeight: 800, color: 'var(--tp-ink)' }}>Benefits and opportunities</span>
                        <textarea
                            value={benefitsAndOpportunities}
                            onChange={(e) => setBenefitsAndOpportunities(e.target.value)}
                            name='benefitsAndOpportunities'
                            placeholder='Flexible PTO, health benefits, remote options, career growth'
                            className="tp-card"
                            style={{ width: '100%', minHeight: '7rem', resize: 'vertical', boxSizing: 'border-box', padding: '1rem', borderRadius: '18px', border: '1px solid rgba(148,163,184,0.2)' }}
                        />
                    </label>

                    <label style={{ display: 'grid', gap: '0.45rem' }}>
                        <span style={{ fontWeight: 800, color: 'var(--tp-ink)' }}>Primary hiring needs</span>
                        <textarea
                            value={primaryHiringNeeds}
                            onChange={(e) => setPrimaryHiringNeeds(e.target.value)}
                            name='primaryHiringNeeds'
                            placeholder='Teams, skills, and roles you want to hire for'
                            className="tp-card"
                            style={{ width: '100%', minHeight: '7rem', resize: 'vertical', boxSizing: 'border-box', padding: '1rem', borderRadius: '18px', border: '1px solid rgba(148,163,184,0.2)' }}
                        />
                    </label>
                </div>

                {error && <div style={{ color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', padding: '0.85rem 1rem', borderRadius: '16px', fontWeight: 700 }}>{error}</div>}

                <button disabled={loading} className="tp-btn-primary" style={{ width: '100%', cursor: loading ? 'not-allowed' : 'pointer' }}>
                    {loading ? 'Saving…' : 'Save and continue'}
                    {!loading && <ArrowRight size={16} />}
                </button>
            </form>
        </AuthShell>
  )
}

export default Page