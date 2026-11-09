"use client"

import React from 'react'
import { useRouter } from 'next/navigation';
import { useCandidateOnboardingStepTwo } from '@/hooks/useCandidateOnboardingStepTwo';
import { AuthShell } from '../../../../components/ui/AuthShell';
import { Select } from '../../../../components/ui/Select';
import { ArrowRight, FileUp, Globe, MapPin, Phone, UserRound } from 'lucide-react';
import { COUNTRY_DIAL_CODES, US_STATES, YEARS_OF_EXPERIENCE_OPTIONS } from './constants';
import { API_URL } from '@/app/util/apiUrl';

// Map a number of years to the experience ranges offered in the form
function toExperienceOption(years?: string): string {
    const n = Number(years);
    if (!years || Number.isNaN(n)) return '';
    if (n <= 2) return '0-2';
    if (n <= 5) return '3-5';
    if (n <= 8) return '6-8';
    if (n <= 15) return '9-15';
    return '16 and up';
}

type ResumeSuggestions = {
    phoneNumber?: string;
    linkedinUrl?: string;
    jobTitleOrDesiredRole?: string;
    yearsOfExperience?: string;
    skills?: string[];
    professionalSummary?: string;
};

function Page() {
    const router = useRouter();
    const { submit, loading, error } = useCandidateOnboardingStepTwo();

    // form fields
    const [countryIso2, setCountryIso2] = React.useState(COUNTRY_DIAL_CODES[0].iso2);
    const [phoneNumber, setPhoneNumber] = React.useState('');
    const [city, setCity] = React.useState('');
    const [state, setState] = React.useState('');
    const [jobTitleOrDesiredRole, setJobTitleOrDesiredRole] = React.useState('');
    const [yearsOfExperience, setYearsOfExperience] = React.useState('');
    const [linkedinUrl, setLinkedinUrl] = React.useState('');
    const [resumeFile, setResumeFile] = React.useState<File | null>(null);
    const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
    const [prefillStatus, setPrefillStatus] = React.useState<string>('');

    // Resume pre-fill (#34): the API extracts suggestions with simple rules (no AI, nothing stored).
    // Only empty fields are filled, and the candidate can edit everything before continuing.
    const handleResumeChange = async (file: File | null) => {
        setResumeFile(file);
        setPrefillStatus('');
        if (!file) return;
        let token: string | null = null;
        try { token = localStorage.getItem('tm_token'); } catch { /* storage unavailable */ }
        if (!token) return;
        setPrefillStatus('Reading your resume…');
        try {
            const fd = new FormData();
            fd.append('resume', file);
            const res = await fetch(`${API_URL}/api/v1/resumes/parse`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
            if (!res.ok) { setPrefillStatus(''); return; }
            const { suggestions } = (await res.json()) as { suggestions: ResumeSuggestions };
            const filled: string[] = [];
            if (suggestions.phoneNumber && !phoneNumber) { setPhoneNumber(suggestions.phoneNumber.replace(/^\+?1[\s.-]?/, '')); filled.push('phone'); }
            if (suggestions.jobTitleOrDesiredRole && !jobTitleOrDesiredRole) { setJobTitleOrDesiredRole(suggestions.jobTitleOrDesiredRole); filled.push('job title'); }
            const exp = toExperienceOption(suggestions.yearsOfExperience);
            if (exp && !yearsOfExperience) { setYearsOfExperience(exp); filled.push('experience'); }
            if (suggestions.linkedinUrl && !linkedinUrl) { setLinkedinUrl(suggestions.linkedinUrl); filled.push('LinkedIn'); }
            // Skills and summary are offered on the next step
            try {
                sessionStorage.setItem('tm_resume_suggestions', JSON.stringify({ skills: suggestions.skills ?? [], professionalSummary: suggestions.professionalSummary ?? '' }));
            } catch { /* storage unavailable */ }
            setPrefillStatus(filled.length
                ? `We filled in ${filled.join(', ')} from your resume. Please check them.`
                : '');
        } catch {
            setPrefillStatus('');
        }
    };

    const sanitizedPhoneDigits = React.useMemo(() => phoneNumber.replace(/[^\d]/g, ''), [phoneNumber]);
    const countryDialCode = React.useMemo(
        () => COUNTRY_DIAL_CODES.find((c) => c.iso2 === countryIso2)?.dialCode ?? COUNTRY_DIAL_CODES[0].dialCode,
        [countryIso2]
    );
    const combinedPhoneNumber = React.useMemo(
        () => (sanitizedPhoneDigits ? `${countryDialCode}${sanitizedPhoneDigits}` : ''),
        [countryDialCode, sanitizedPhoneDigits]
    );
    const combinedLocation = React.useMemo(
        () => (city.trim() && state ? `${city.trim()}, ${state}` : city.trim()),
        [city, state]
    );

    // derive payload and validation with useMemo (no setState in effects)
    const payload = React.useMemo(() => ({
        phoneNumber: combinedPhoneNumber,
        location: combinedLocation,
        jobTitleOrDesiredRole,
        yearsOfExperience,
        linkedinUrl,
    }), [combinedPhoneNumber, combinedLocation, jobTitleOrDesiredRole, yearsOfExperience, linkedinUrl]);

    const isValid = React.useMemo(() => {
        return (
            sanitizedPhoneDigits !== '' &&
            city.trim() !== '' &&
            state !== '' &&
            jobTitleOrDesiredRole.trim() !== '' &&
            (YEARS_OF_EXPERIENCE_OPTIONS as readonly string[]).includes(yearsOfExperience)
        );
    }, [sanitizedPhoneDigits, city, state, jobTitleOrDesiredRole, yearsOfExperience]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // per-field validation
        const errors: Record<string, string> = {};
        if (sanitizedPhoneDigits === '') errors.phoneNumber = 'Phone number is required';
        if (city.trim() === '') errors.city = 'City is required';
        if (state === '') errors.state = 'State is required';
        if (jobTitleOrDesiredRole.trim() === '') errors.jobTitleOrDesiredRole = 'Job title or desired role is required';
        if (!(YEARS_OF_EXPERIENCE_OPTIONS as readonly string[]).includes(yearsOfExperience)) {
            errors.yearsOfExperience = 'Please select your years of experience';
        }
        // optional: validate linkedin format if provided
        if (linkedinUrl.trim() !== '') {
            try {
                // simple validation
                new URL(linkedinUrl);
            } catch {
                errors.linkedinUrl = 'Please enter a valid URL';
            }
        }

        setFieldErrors(errors);
        if (Object.keys(errors).length > 0) return;

        let result = null;
        if (resumeFile) {
            const fd = new FormData();
            fd.append('phoneNumber', payload.phoneNumber);
            fd.append('location', payload.location);
            fd.append('jobTitleOrDesiredRole', payload.jobTitleOrDesiredRole);
            fd.append('yearsOfExperience', payload.yearsOfExperience);
            if (payload.linkedinUrl.trim()) fd.append('linkedinUrl', payload.linkedinUrl.trim());
            fd.append('resume', resumeFile, resumeFile.name);
            result = await submit(fd);
        } else {
            result = await submit(payload);
        }
        if (result) {
            router.replace('/personal-information/step-two');
        }
    };

    return (
                <AuthShell
                    eyebrow="Candidate onboarding"
                    title="Shape the profile recruiters will actually see."
                    subtitle="This first onboarding step captures the essentials so the backend can build a strong candidate profile and move you to the next stage."
                    bullets={[
                        'Add your contact details, desired role, and location in one pass.',
                        'Upload your resume to keep the profile aligned with the backend flow.',
                        'We keep the journey focused on matching you with relevant jobs faster.',
                    ]}
                    footer={<span style={{ color: 'var(--tp-muted)' }}>Step 1 of 3</span>}
                >
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                        <div>
                            <div className="tp-kicker">Candidate profile</div>
                            <h2 style={{ margin: '0.35rem 0 0', fontSize: '2rem', letterSpacing: '-0.04em' }}>Tell us the basics.</h2>
                            <p className="tp-lead" style={{ marginTop: '0.6rem' }}>You can complete the whole profile in a couple of quick steps.</p>
                        </div>

                        <label style={{ display: 'grid', gap: '0.45rem' }}>
                            <span style={{ fontWeight: 800, color: 'var(--tp-ink)' }}>Phone number <span style={{ color: '#b91c1c' }}>*</span></span>
                            <div className="tp-card" style={{ display: 'flex', alignItems: 'stretch', width: '100%', boxSizing: 'border-box', borderRadius: '16px', border: '1px solid rgba(148,163,184,0.2)', overflow: 'hidden' }}>
                                <Select
                                    value={countryIso2}
                                    onValueChange={setCountryIso2}
                                    ariaLabel="Country dial code"
                                    options={COUNTRY_DIAL_CODES.map((c) => ({ value: c.iso2, label: `${c.dialCode} ${c.iso2}` }))}
                                    triggerStyle={{ height: '100%', padding: '0.95rem 0.75rem 0.95rem 1rem', border: 'none', background: 'transparent', fontWeight: 700, color: 'var(--tp-ink)' }}
                                />
                                <div style={{ position: 'relative', flex: 1 }}>
                                    <Phone size={16} color="var(--tp-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                                    <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} type="tel" placeholder="Phone number" style={{ width: '100%', boxSizing: 'border-box', padding: '0.95rem 1rem 0.95rem 2.5rem', border: 'none', background: 'transparent' }} />
                                </div>
                            </div>
                            {fieldErrors.phoneNumber && <div style={{ color: '#b91c1c', fontWeight: 700 }}>{fieldErrors.phoneNumber}</div>}
                        </label>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.85rem' }}>
                            <label style={{ display: 'grid', gap: '0.45rem' }}>
                                <span style={{ fontWeight: 800, color: 'var(--tp-ink)' }}>City <span style={{ color: '#b91c1c' }}>*</span></span>
                                <div style={{ position: 'relative' }}>
                                    <MapPin size={16} color="var(--tp-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                                    <input value={city} onChange={(e) => setCity(e.target.value)} type="text" placeholder="City" className="tp-card" style={{ width: '100%', boxSizing: 'border-box', padding: '0.95rem 1rem 0.95rem 2.5rem', borderRadius: '16px', border: '1px solid rgba(148,163,184,0.2)' }} />
                                </div>
                                {fieldErrors.city && <div style={{ color: '#b91c1c', fontWeight: 700 }}>{fieldErrors.city}</div>}
                            </label>

                            <label style={{ display: 'grid', gap: '0.45rem' }}>
                                <span style={{ fontWeight: 800, color: 'var(--tp-ink)' }}>State <span style={{ color: '#b91c1c' }}>*</span></span>
                                <Select
                                    value={state}
                                    onValueChange={setState}
                                    ariaLabel="State"
                                    placeholder="Select state"
                                    options={US_STATES.map((s) => ({ value: s.code, label: s.name }))}
                                    triggerClassName="tp-card"
                                    triggerStyle={{ width: '100%', boxSizing: 'border-box', padding: '0.95rem 1rem', borderRadius: '16px', border: '1px solid rgba(148,163,184,0.2)' }}
                                />
                                {fieldErrors.state && <div style={{ color: '#b91c1c', fontWeight: 700 }}>{fieldErrors.state}</div>}
                            </label>
                        </div>

                        <label style={{ display: 'grid', gap: '0.45rem' }}>
                            <span style={{ fontWeight: 800, color: 'var(--tp-ink)' }}>Desired role <span style={{ color: '#b91c1c' }}>*</span></span>
                            <div style={{ position: 'relative' }}>
                                <UserRound size={16} color="var(--tp-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                                <input value={jobTitleOrDesiredRole} onChange={(e) => setJobTitleOrDesiredRole(e.target.value)} type="text" placeholder="Job title / desired role" className="tp-card" style={{ width: '100%', boxSizing: 'border-box', padding: '0.95rem 1rem 0.95rem 2.5rem', borderRadius: '16px', border: '1px solid rgba(148,163,184,0.2)' }} />
                            </div>
                            {fieldErrors.jobTitleOrDesiredRole && <div style={{ color: '#b91c1c', fontWeight: 700 }}>{fieldErrors.jobTitleOrDesiredRole}</div>}
                        </label>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.85rem' }}>
                            <label style={{ display: 'grid', gap: '0.45rem' }}>
                                <span style={{ fontWeight: 800, color: 'var(--tp-ink)' }}>Years of experience <span style={{ color: '#b91c1c' }}>*</span></span>
                                <Select
                                    value={yearsOfExperience}
                                    onValueChange={setYearsOfExperience}
                                    ariaLabel="Years of experience"
                                    placeholder="Select range"
                                    options={YEARS_OF_EXPERIENCE_OPTIONS.map((opt) => ({ value: opt, label: `${opt} years` }))}
                                    triggerClassName="tp-card"
                                    triggerStyle={{ width: '100%', boxSizing: 'border-box', padding: '0.95rem 1rem', borderRadius: '16px', border: '1px solid rgba(148,163,184,0.2)' }}
                                />
                                {fieldErrors.yearsOfExperience && <div style={{ color: '#b91c1c', fontWeight: 700 }}>{fieldErrors.yearsOfExperience}</div>}
                            </label>

                            <label style={{ display: 'grid', gap: '0.45rem' }}>
                                <span style={{ fontWeight: 800, color: 'var(--tp-ink)' }}>LinkedIn URL</span>
                                <div style={{ position: 'relative' }}>
                                    <Globe size={16} color="var(--tp-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                                    <input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} type="text" placeholder="https://www.linkedin.com" className="tp-card" style={{ width: '100%', boxSizing: 'border-box', padding: '0.95rem 1rem 0.95rem 2.5rem', borderRadius: '16px', border: '1px solid rgba(148,163,184,0.2)' }} />
                                </div>
                                {fieldErrors.linkedinUrl && <div style={{ color: '#b91c1c', fontWeight: 700 }}>{fieldErrors.linkedinUrl}</div>}
                            </label>
                        </div>

                        <div style={{ display: 'grid', gap: '0.65rem' }}>
                            <span style={{ fontWeight: 800, color: 'var(--tp-ink)' }}>Resume</span>
                            <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => { void handleResumeChange(e.target.files?.[0] ?? null); }} style={{ display: 'none' }} id="resume-upload" />
                            <label htmlFor="resume-upload" style={{ display: 'grid', gap: '0.75rem', padding: '1rem', borderRadius: '18px', border: '1px dashed rgba(29,78,216,0.35)', background: 'rgba(29,78,216,0.04)', cursor: 'pointer' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: '2.6rem', height: '2.6rem', borderRadius: '16px', background: 'rgba(29,78,216,0.1)', color: 'var(--tp-primary)', display: 'grid', placeItems: 'center' }}>
                                        <FileUp size={16} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 800, color: 'var(--tp-ink)' }}>Upload your resume</div>
                                        <div style={{ color: 'var(--tp-muted)', fontSize: '0.92rem' }}>PDF or DOCX, up to 5 MB. We can pre-fill your profile from it.</div>
                                    </div>
                                </div>
                                {resumeFile ? <div style={{ color: 'var(--tp-primary)', fontWeight: 800 }}>{resumeFile.name}</div> : <div style={{ color: 'var(--tp-muted)' }}>Click to choose a file</div>}
                            </label>
                            {prefillStatus && <p role="status" style={{ margin: 0, color: '#1e3a8a', fontSize: '0.9rem' }}>{prefillStatus}</p>}
                        </div>

                        {error && <div role="alert" style={{ color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', padding: '0.85rem 1rem', borderRadius: '16px', fontWeight: 700 }}>{error}</div>}

                        <button type="submit" disabled={!isValid || loading} className="tp-btn-primary" style={{ width: '100%', cursor: loading ? 'not-allowed' : 'pointer' }}>
                            {loading ? 'Saving…' : 'Save and continue'}
                            {!loading && <ArrowRight size={16} />}
                        </button>
                    </form>
                </AuthShell>
    );
}

export default Page
