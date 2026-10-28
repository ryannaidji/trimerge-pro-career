"use client"

import { useState } from 'react'
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react'
import { useCreateJob } from '@/hooks/useCreateJob'

type Form = {
  title: string
  department: string
  employmentType: string
  location: string
  isRemote: boolean
  description: string
  requirements: string
  skills: string[]
  salaryMin: string
  salaryMax: string
  currency: string
  status: string
}

const DEPARTMENTS = [
  { value: 'ENGINEERING', label: 'Engineering' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'HR', label: 'Human Resources' },
  { value: 'SALES', label: 'Sales' },
  { value: 'DESIGN', label: 'Design' },
]

const EMP_TYPES = [
  { value: 'FULL_TIME', label: 'Full-time', desc: 'Regular, permanent position' },
  { value: 'PART_TIME', label: 'Part-time', desc: 'Less than 40 hours/week' },
  { value: 'CONTRACT', label: 'Contract', desc: 'Fixed-term engagement' },
  { value: 'INTERNSHIP', label: 'Internship', desc: 'Training-focused role' },
]

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'NGN']

const labelSt: React.CSSProperties = {
  display: 'block',
  fontSize: '0.82rem',
  fontWeight: 700,
  color: 'var(--tp-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginBottom: '0.5rem',
}

const inputSt: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '0.9rem 1rem',
  borderRadius: '14px',
  border: '1px solid rgba(148,163,184,0.2)',
  background: '#f8fafc',
  fontSize: '1rem',
  fontFamily: 'inherit',
  outline: 'none',
}

export default function PostJobModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { createJob, loading, error, setError } = useCreateJob()
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [form, setForm] = useState<Form>({
    title: '',
    department: 'ENGINEERING',
    employmentType: '',
    location: '',
    isRemote: false,
    description: '',
    requirements: '',
    skills: [],
    salaryMin: '',
    salaryMax: '',
    currency: 'USD',
    status: 'OPEN',
  })
  const [skillInput, setSkillInput] = useState('')

  const upd = (key: keyof Form, value: Form[keyof Form]) =>
    setForm((p) => ({ ...p, [key]: value }))

  const addSkill = () => {
    const s = skillInput.trim()
    if (s && !form.skills.includes(s)) upd('skills', [...form.skills, s])
    setSkillInput('')
  }

  const removeSkill = (s: string) => upd('skills', form.skills.filter((x) => x !== s))

  const handleSubmit = async () => {
    setError(null)
    const result = await createJob({
      title: form.title,
      description: form.description,
      requirements: form.requirements,
      location: form.isRemote ? 'Remote' : form.location || 'Remote',
      employmentType: form.employmentType,
      department: form.department,
      ...(form.salaryMin && { salaryMin: Number(form.salaryMin) }),
      ...(form.salaryMax && { salaryMax: Number(form.salaryMax) }),
      currency: form.currency,
      skills: form.skills,
      status: form.status,
    })
    if (result != null) onSuccess()
  }

  const step1Valid = form.title.trim().length > 0 && form.employmentType !== ''
  const step2Valid = form.description.trim().length >= 20
  const canContinue = (step === 1 && !step1Valid) || (step === 2 && !step2Valid)

  const formatEmpType = (v: string) =>
    v.replace('_', ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase())

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.52)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '580px', background: 'white', borderRadius: '24px', boxShadow: '0 40px 100px rgba(2,6,23,0.32)', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>

        {/* ── Header ── */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(148,163,184,0.12)', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--tp-muted)' }}>
              Step {step} of 4
            </span>
            <button type="button" onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '0.35rem', borderRadius: '8px', color: 'var(--tp-muted)', display: 'grid', placeItems: 'center' }}>
              <X size={18} />
            </button>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {([1, 2, 3, 4] as const).map((s) => (
              <div key={s} style={{ flex: 1, height: '4px', borderRadius: '99px', background: s <= step ? '#1d4ed8' : '#e2e8f0', transition: 'background 0.25s' }} />
            ))}
          </div>
        </div>

        {/* ── Content ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.75rem 1.5rem' }}>

          {/* STEP 1 — The basics */}
          {step === 1 && (
            <div style={{ display: 'grid', gap: '1.35rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.65rem', letterSpacing: '-0.04em' }}>Start with the basics</h2>
                <p style={{ margin: '0.4rem 0 0', color: 'var(--tp-muted)', fontSize: '0.93rem' }}>Helps candidates find your posting quickly.</p>
              </div>

              <div>
                <label style={labelSt}>Job title</label>
                <input
                  autoFocus
                  value={form.title}
                  onChange={(e) => upd('title', e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                  style={{ ...inputSt, fontSize: '1.05rem' }}
                />
              </div>

              <div>
                <label style={labelSt}>Employment type</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                  {EMP_TYPES.map((t) => (
                    <div
                      key={t.value}
                      role="button"
                      tabIndex={0}
                      onClick={() => upd('employmentType', t.value)}
                      onKeyDown={(e) => e.key === 'Enter' && upd('employmentType', t.value)}
                      style={{
                        padding: '0.9rem 1rem',
                        borderRadius: '14px',
                        border: form.employmentType === t.value ? '2px solid #1d4ed8' : '1.5px solid rgba(148,163,184,0.22)',
                        background: form.employmentType === t.value ? 'rgba(29,78,216,0.05)' : 'white',
                        cursor: 'pointer',
                        userSelect: 'none',
                        transition: 'border 0.15s, background 0.15s',
                      }}
                    >
                      <div style={{ fontWeight: 800, fontSize: '0.93rem', color: form.employmentType === t.value ? '#1d4ed8' : 'var(--tp-ink)' }}>{t.label}</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--tp-muted)', marginTop: '0.18rem' }}>{t.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label style={labelSt}>Department</label>
                <select
                  value={form.department}
                  onChange={(e) => upd('department', e.target.value)}
                  style={{ ...inputSt, cursor: 'pointer' }}
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelSt}>Location</label>
                <input
                  value={form.location}
                  onChange={(e) => upd('location', e.target.value)}
                  placeholder="e.g. New York, NY"
                  disabled={form.isRemote}
                  style={{ ...inputSt, opacity: form.isRemote ? 0.45 : 1 }}
                />
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.6rem', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 700, color: 'var(--tp-muted)' }}>
                  <input
                    type="checkbox"
                    checked={form.isRemote}
                    onChange={(e) => upd('isRemote', e.target.checked)}
                    style={{ accentColor: '#1d4ed8', width: '1rem', height: '1rem' }}
                  />
                  This is a fully remote position
                </label>
              </div>
            </div>
          )}

          {/* STEP 2 — Description */}
          {step === 2 && (
            <div style={{ display: 'grid', gap: '1.35rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.65rem', letterSpacing: '-0.04em' }}>Describe the role</h2>
                <p style={{ margin: '0.4rem 0 0', color: 'var(--tp-muted)', fontSize: '0.93rem' }}>Give candidates a clear picture of day-to-day work.</p>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                  <label style={{ ...labelSt, marginBottom: 0 }}>Job description</label>
                  <span style={{ fontSize: '0.75rem', color: form.description.length < 20 ? '#dc2626' : 'var(--tp-muted)' }}>
                    {form.description.length} chars {form.description.length < 20 ? `(${20 - form.description.length} more needed)` : ''}
                  </span>
                </div>
                <textarea
                  autoFocus
                  value={form.description}
                  onChange={(e) => upd('description', e.target.value)}
                  placeholder="What will this person do day-to-day? What makes this role exciting? What impact will they have?"
                  rows={6}
                  style={{ ...inputSt, resize: 'vertical', minHeight: '130px' }}
                />
              </div>

              <div>
                <label style={labelSt}>
                  Requirements{' '}
                  <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: '0.78rem' }}>(optional)</span>
                </label>
                <textarea
                  value={form.requirements}
                  onChange={(e) => upd('requirements', e.target.value)}
                  placeholder="Years of experience, specific skills, education, certifications, etc."
                  rows={4}
                  style={{ ...inputSt, resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={labelSt}>
                  Skills{' '}
                  <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: '0.78rem' }}>(optional — press Enter or comma to add)</span>
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', padding: '0.6rem 0.8rem', borderRadius: '14px', border: '1px solid rgba(148,163,184,0.2)', background: '#f8fafc', minHeight: '3rem', cursor: 'text' }}>
                  {form.skills.map((s) => (
                    <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#dbeafe', color: '#1e3a8a', fontWeight: 700, fontSize: '0.8rem', padding: '0.22rem 0.6rem', borderRadius: '999px' }}>
                      {s}
                      <button type="button" onClick={() => removeSkill(s)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#1e3a8a', padding: 0, lineHeight: 1, fontSize: '1rem' }}>×</button>
                    </span>
                  ))}
                  <input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill() }
                    }}
                    placeholder={form.skills.length === 0 ? 'e.g. React, TypeScript, Node.js…' : '+ more'}
                    style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.88rem', flex: 1, minWidth: '120px', padding: '0.1rem 0' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 — Compensation */}
          {step === 3 && (
            <div style={{ display: 'grid', gap: '1.35rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.65rem', letterSpacing: '-0.04em' }}>Set the compensation</h2>
                <p style={{ margin: '0.4rem 0 0', color: 'var(--tp-muted)', fontSize: '0.93rem' }}>Jobs with salary info get significantly more applicants.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 0.55fr', gap: '0.75rem' }}>
                <div>
                  <label style={labelSt}>Min salary</label>
                  <input
                    type="number"
                    value={form.salaryMin}
                    onChange={(e) => upd('salaryMin', e.target.value)}
                    placeholder="60,000"
                    style={inputSt}
                  />
                </div>
                <div>
                  <label style={labelSt}>Max salary</label>
                  <input
                    type="number"
                    value={form.salaryMax}
                    onChange={(e) => upd('salaryMax', e.target.value)}
                    placeholder="90,000"
                    style={inputSt}
                  />
                </div>
                <div>
                  <label style={labelSt}>Currency</label>
                  <select value={form.currency} onChange={(e) => upd('currency', e.target.value)} style={{ ...inputSt, cursor: 'pointer' }}>
                    {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={labelSt}>Listing status</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                  {[
                    { value: 'OPEN', label: 'Publish now', desc: 'Live and accepting applications immediately' },
                    { value: 'DRAFT', label: 'Save as draft', desc: 'Save and publish when you are ready' },
                  ].map((s) => (
                    <div
                      key={s.value}
                      role="button"
                      tabIndex={0}
                      onClick={() => upd('status', s.value)}
                      onKeyDown={(e) => e.key === 'Enter' && upd('status', s.value)}
                      style={{
                        padding: '0.9rem 1rem',
                        borderRadius: '14px',
                        border: form.status === s.value ? '2px solid #1d4ed8' : '1.5px solid rgba(148,163,184,0.22)',
                        background: form.status === s.value ? 'rgba(29,78,216,0.05)' : 'white',
                        cursor: 'pointer',
                        userSelect: 'none',
                        transition: 'border 0.15s, background 0.15s',
                      }}
                    >
                      <div style={{ fontWeight: 800, fontSize: '0.93rem', color: form.status === s.value ? '#1d4ed8' : 'var(--tp-ink)' }}>{s.label}</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--tp-muted)', marginTop: '0.18rem' }}>{s.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4 — Review */}
          {step === 4 && (
            <div style={{ display: 'grid', gap: '1.25rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.65rem', letterSpacing: '-0.04em' }}>Review & post</h2>
                <p style={{ margin: '0.4rem 0 0', color: 'var(--tp-muted)', fontSize: '0.93rem' }}>Double-check before publishing.</p>
              </div>

              <div className="tp-card-soft" style={{ padding: '1.25rem', display: 'grid', gap: '1rem' }}>

                {/* Job header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: '1.3rem', letterSpacing: '-0.03em' }}>{form.title || '—'}</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.6rem' }}>
                      {form.employmentType && (
                        <span className="tp-chip">{formatEmpType(form.employmentType)}</span>
                      )}
                      {form.department && (
                        <span className="tp-chip">{form.department.charAt(0) + form.department.slice(1).toLowerCase()}</span>
                      )}
                      <span className="tp-chip" style={{ background: form.status === 'OPEN' ? '#dcfce7' : '#fef9c3', color: form.status === 'OPEN' ? '#166534' : '#854d0e' }}>
                        {form.status === 'OPEN' ? 'Publishing now' : 'Saving as draft'}
                      </span>
                    </div>
                    <div style={{ marginTop: '0.45rem', fontSize: '0.86rem', color: 'var(--tp-muted)', fontWeight: 600 }}>
                      📍 {form.isRemote ? 'Remote' : form.location || 'Location not set'}
                    </div>
                  </div>
                  <button type="button" onClick={() => setStep(1)} style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1d4ed8', background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.2rem 0.5rem', borderRadius: '6px', flexShrink: 0 }}>Edit</button>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid rgba(148,163,184,0.15)', margin: 0 }} />

                {/* Compensation */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--tp-muted)', marginBottom: '0.3rem' }}>Compensation</div>
                    <div style={{ fontWeight: 700, color: 'var(--tp-ink)' }}>
                      {form.salaryMin || form.salaryMax
                        ? `${form.currency} ${Number(form.salaryMin || 0).toLocaleString()} – ${Number(form.salaryMax || 0).toLocaleString()}`
                        : 'Not specified'}
                    </div>
                  </div>
                  <button type="button" onClick={() => setStep(3)} style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1d4ed8', background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>Edit</button>
                </div>

                {form.skills.length > 0 && (
                  <>
                    <hr style={{ border: 'none', borderTop: '1px solid rgba(148,163,184,0.15)', margin: 0 }} />
                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--tp-muted)', marginBottom: '0.5rem' }}>Skills</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {form.skills.map((s) => (
                          <span key={s} className="tp-chip" style={{ background: '#dbeafe', color: '#1e3a8a' }}>{s}</span>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <hr style={{ border: 'none', borderTop: '1px solid rgba(148,163,184,0.15)', margin: 0 }} />

                {/* Description preview */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--tp-muted)', marginBottom: '0.4rem' }}>Description</div>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--tp-ink)', lineHeight: 1.65, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
                      {form.description || '—'}
                    </p>
                  </div>
                  <button type="button" onClick={() => setStep(2)} style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1d4ed8', background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.2rem 0.5rem', borderRadius: '6px', flexShrink: 0 }}>Edit</button>
                </div>
              </div>

              {error && (
                <div style={{ color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', padding: '0.75rem 1rem', borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem' }}>
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div style={{ padding: '1.1rem 1.5rem', borderTop: '1px solid rgba(148,163,184,0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3 | 4)}
              className="tp-btn-secondary"
              style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <ArrowLeft size={15} /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3 | 4)}
              disabled={canContinue}
              className="tp-btn-primary"
              style={{ cursor: canContinue ? 'not-allowed' : 'pointer', opacity: canContinue ? 0.5 : 1, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              Continue <ArrowRight size={15} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="tp-btn-primary"
              style={{ cursor: loading ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              {loading ? 'Posting…' : 'Post Job'} {!loading && <Check size={15} />}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
