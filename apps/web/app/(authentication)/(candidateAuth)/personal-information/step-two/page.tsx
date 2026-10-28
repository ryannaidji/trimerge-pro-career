"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { useCandidateOnboardingStepThree } from '@/hooks/useCandidateOnboardingStepThree'
import { AuthShell } from '../../../../components/ui/AuthShell'
import { ArrowRight } from 'lucide-react'

function Page() {
    const router = useRouter()
    const { submit, loading, error } = useCandidateOnboardingStepThree()
    const [skillsText, setSkillsText] = React.useState('')
    const [professionalSummary, setProfessionalSummary] = React.useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        // convert skills string to array by comma and always send an array
        const skillsPayload = (skillsText || '').split(',').map(s => s.trim()).filter(Boolean)
        const payload = {
            skills: skillsPayload,
            professionalSummary,
        }

        const result = await submit(payload)
        if (result) {
            router.replace('/personal-information/registration-complete')
        }
    }

    return (
        <AuthShell
          eyebrow="Candidate onboarding"
          title="Turn your experience into a stronger profile."
          subtitle="This is the final candidate step before completion. Skills and summary data flow straight into the current backend onboarding API."
          bullets={[
            'Add skills the recruiter search can understand.',
            'Write a concise summary that clarifies your strongest experience.',
            'Finish this step and your candidate profile will be ready to use.',
          ]}
          footer={<span style={{ color: 'var(--tp-muted)' }}>Step 2 of 3</span>}
        >
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <div className="tp-kicker">Skills and summary</div>
              <h2 style={{ margin: '0.35rem 0 0', fontSize: '2rem', letterSpacing: '-0.04em' }}>Show recruiters the value you bring.</h2>
              <p className="tp-lead" style={{ marginTop: '0.6rem' }}>Keep it focused and easy to scan.</p>
            </div>

            <label style={{ display: 'grid', gap: '0.45rem' }}>
              <span style={{ fontWeight: 800, color: 'var(--tp-ink)' }}>Skills</span>
              <textarea name='skills' value={skillsText} onChange={(e) => setSkillsText(e.target.value)} placeholder="Search or add skills (e.g., Python, AutoCAD, Project Management)" className="tp-card" style={{ width: '100%', minHeight: '9rem', resize: 'vertical', boxSizing: 'border-box', padding: '1rem', borderRadius: '18px', border: '1px solid rgba(148,163,184,0.2)' }} />
            </label>

            <label style={{ display: 'grid', gap: '0.45rem' }}>
              <span style={{ fontWeight: 800, color: 'var(--tp-ink)' }}>Professional summary</span>
              <textarea name='professionalSummary' value={professionalSummary} onChange={(e) => setProfessionalSummary(e.target.value)} placeholder="Professional Summary *" className="tp-card" style={{ width: '100%', minHeight: '12rem', resize: 'vertical', boxSizing: 'border-box', padding: '1rem', borderRadius: '18px', border: '1px solid rgba(148,163,184,0.2)' }} />
            </label>

            {error && <div style={{ color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', padding: '0.85rem 1rem', borderRadius: '16px', fontWeight: 700 }}>{error}</div>}

            <button onClick={handleSubmit} disabled={loading} className="tp-btn-primary" style={{ width: '100%', cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Saving…' : 'Save and continue'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>
        </AuthShell>
  )
}

export default Page