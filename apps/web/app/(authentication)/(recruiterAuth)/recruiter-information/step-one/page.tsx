"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRecruiterOnboardingStepTwo } from '@/hooks/useRecruiterOnboardingStepTwo'
import { AuthShell } from '../../../../components/ui/AuthShell'
import { Select } from '../../../../components/ui/Select'
import { ArrowRight, Building2, Globe, MapPin, UserCircle2 } from 'lucide-react'
import { COMPANY_INDUSTRY_OPTIONS, COMPANY_SIZE_OPTIONS, US_STATES } from './constants'

function Page() {
  const router = useRouter()
  const { submit, loading, error } = useRecruiterOnboardingStepTwo()

  const [companyName, setCompanyName] = useState('')
  const [companyWebsite, setCompanyWebsite] = useState('')
  const [industry, setIndustry] = useState('')
  const [companySize, setCompanySize] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [locationError, setLocationError] = useState<string | null>(null)
  const [yourRole, setYourRole] = useState('')
  const [jobTitle, setJobTitle] = useState('')

  const combinedLocation = city.trim() && state ? `${city.trim()}, ${state}` : city.trim()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!state) {
      setLocationError('Please select a state')
      return
    }
    setLocationError(null)
    const payload = { companyName, companyWebsite, industry, companySize, location: combinedLocation, yourRole, jobTitle }
    const result = await submit(payload)
    if (result) {
      // proceed to next step or dashboard
      router.push('/recruiter-information/step-two')
    }
  }

  return (
        <AuthShell
            eyebrow="Employer onboarding"
            title="Give your hiring team a strong starting point."
            subtitle="We capture the company basics first so the remaining onboarding steps can focus on hiring goals and job creation."
            bullets={[
                'Share company details once and reuse them across the platform.',
                'The recruiter flow stays aligned with the existing backend onboarding endpoints.',
                'A clean company profile makes posting and managing roles easier later.',
            ]}
            footer={<span style={{ color: 'var(--tp-muted)' }}>Step 1 of 3</span>}
        >
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                <div>
                    <div className="tp-kicker">Company basics</div>
                    <h2 style={{ margin: '0.35rem 0 0', fontSize: '2rem', letterSpacing: '-0.04em' }}>Tell us about the organization.</h2>
                    <p className="tp-lead" style={{ marginTop: '0.6rem' }}>These details help shape the employer profile.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.85rem' }}>
                    <label style={{ display: 'grid', gap: '0.45rem' }}>
                        <span style={{ fontWeight: 800, color: 'var(--tp-ink)' }}>Company name</span>
                        <div style={{ position: 'relative' }}>
                            <Building2 size={16} color="var(--tp-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                            <input required value={companyName} onChange={(e) => setCompanyName(e.target.value)} type="text" placeholder="Company name *" className="tp-card" style={{ width: '100%', boxSizing: 'border-box', padding: '0.95rem 1rem 0.95rem 2.5rem', borderRadius: '16px', border: '1px solid rgba(148,163,184,0.2)' }} />
                        </div>
                    </label>

                    <label style={{ display: 'grid', gap: '0.45rem' }}>
                        <span style={{ fontWeight: 800, color: 'var(--tp-ink)' }}>Company website</span>
                        <div style={{ position: 'relative' }}>
                            <Globe size={16} color="var(--tp-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                            <input required value={companyWebsite} onChange={(e) => setCompanyWebsite(e.target.value)} type="text" placeholder="https://www.company.com" className="tp-card" style={{ width: '100%', boxSizing: 'border-box', padding: '0.95rem 1rem 0.95rem 2.5rem', borderRadius: '16px', border: '1px solid rgba(148,163,184,0.2)' }} />
                        </div>
                    </label>

                    <label style={{ display: 'grid', gap: '0.45rem' }}>
                        <span style={{ fontWeight: 800, color: 'var(--tp-ink)' }}>Industry</span>
                        <Select
                            value={industry}
                            onValueChange={setIndustry}
                            ariaLabel="Company industry"
                            placeholder="Select industry *"
                            options={COMPANY_INDUSTRY_OPTIONS.map((v) => ({ value: v, label: v }))}
                            triggerClassName="tp-card"
                            triggerStyle={{ width: '100%', boxSizing: 'border-box', padding: '0.95rem 1rem', borderRadius: '16px', border: '1px solid rgba(148,163,184,0.2)' }}
                        />
                    </label>

                    <label style={{ display: 'grid', gap: '0.45rem' }}>
                        <span style={{ fontWeight: 800, color: 'var(--tp-ink)' }}>Company size</span>
                        <Select
                            value={companySize}
                            onValueChange={setCompanySize}
                            ariaLabel="Company size"
                            placeholder="Select company size"
                            options={COMPANY_SIZE_OPTIONS.map((v) => ({ value: v, label: `${v} employees` }))}
                            triggerClassName="tp-card"
                            triggerStyle={{ width: '100%', boxSizing: 'border-box', padding: '0.95rem 1rem', borderRadius: '16px', border: '1px solid rgba(148,163,184,0.2)' }}
                        />
                    </label>

                    <label style={{ display: 'grid', gap: '0.45rem' }}>
                        <span style={{ fontWeight: 800, color: 'var(--tp-ink)' }}>City</span>
                        <div style={{ position: 'relative' }}>
                            <MapPin size={16} color="var(--tp-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                            <input required value={city} onChange={(e) => setCity(e.target.value)} type="text" placeholder="City *" className="tp-card" style={{ width: '100%', boxSizing: 'border-box', padding: '0.95rem 1rem 0.95rem 2.5rem', borderRadius: '16px', border: '1px solid rgba(148,163,184,0.2)' }} />
                        </div>
                    </label>

                    <label style={{ display: 'grid', gap: '0.45rem' }}>
                        <span style={{ fontWeight: 800, color: 'var(--tp-ink)' }}>State</span>
                        <Select
                            value={state}
                            onValueChange={setState}
                            ariaLabel="State"
                            placeholder="Select state"
                            options={US_STATES.map((s) => ({ value: s.code, label: s.name }))}
                            triggerClassName="tp-card"
                            triggerStyle={{ width: '100%', boxSizing: 'border-box', padding: '0.95rem 1rem', borderRadius: '16px', border: '1px solid rgba(148,163,184,0.2)' }}
                        />
                        {locationError && <div style={{ color: '#b91c1c', fontWeight: 700 }}>{locationError}</div>}
                    </label>

                    <label style={{ display: 'grid', gap: '0.45rem' }}>
                        <span style={{ fontWeight: 800, color: 'var(--tp-ink)' }}>Your role</span>
                        <div style={{ position: 'relative' }}>
                            <UserCircle2 size={16} color="var(--tp-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                            <input required value={yourRole} onChange={(e) => setYourRole(e.target.value)} type="text" placeholder="Your role *" className="tp-card" style={{ width: '100%', boxSizing: 'border-box', padding: '0.95rem 1rem 0.95rem 2.5rem', borderRadius: '16px', border: '1px solid rgba(148,163,184,0.2)' }} />
                        </div>
                    </label>

                    <label style={{ display: 'grid', gap: '0.45rem' }}>
                        <span style={{ fontWeight: 800, color: 'var(--tp-ink)' }}>Job title</span>
                        <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} type="text" placeholder="Job title" className="tp-card" style={{ width: '100%', boxSizing: 'border-box', padding: '0.95rem 1rem', borderRadius: '16px', border: '1px solid rgba(148,163,184,0.2)' }} />
                    </label>
                </div>

                {error && <div style={{ color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', padding: '0.85rem 1rem', borderRadius: '16px', fontWeight: 700 }}>{error}</div>}

                <button disabled={loading} type="submit" className="tp-btn-primary" style={{ width: '100%', cursor: loading ? 'not-allowed' : 'pointer' }}>
                    {loading ? 'Saving…' : 'Save and continue'}
                    {!loading && <ArrowRight size={16} />}
                </button>
            </form>
        </AuthShell>
  )
}

export default Page
