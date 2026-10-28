"use client"

// Fallback country dataset (kept at module scope so it's stable for hooks deps)
const FALLBACK_COUNTRIES: { country: string; cities?: string[] }[] = [
  { country: 'Nigeria', cities: ['Lagos', 'Abuja'] },
  { country: 'United States', cities: ['Austin', 'Miami', 'Remote'] },
]


import React, { useState, useEffect, useRef } from 'react';
// avoid useSearchParams (requires Suspense boundary) — read from window.location in effects instead
import { JobCard } from '@/app/components/ui/JobCard';
import { JobDetailDrawer } from '@/app/components/ui/JobDetailDrawer';
import { ApplicationWizard } from '@/app/components/ui/ApplicationWizard';
import { useGetJobs } from '@/hooks/useGetJobs';
import { useGetPublicJobs } from '@/hooks/useGetPublicJobs';
import { useCreateJob } from '@/hooks/useCreateJob';
import { useUser } from '@/contexts/userContext/userContext';

function BrowseJobs() {
  const {state} = useUser()



  // Job shape as actually returned by the public/authenticated jobs APIs
  interface Job {
    _id: string;
    id?: string;
    employerId?: string;
    title: string;
    description: string;
    requirements?: string;
    location?: string;
    employmentType?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | string;
    salaryMin?: number;
    salaryMax?: number;
    currency?: string;
    skills?: string[];
    benefits?: string[];
    applicationQuestions?: string[];
    status?: 'OPEN' | 'CLOSED' | 'DRAFT' | string;
    // department will be shown with a default for now
    department?: 'ENGINEERING' | 'MARKETING' | 'HR' | 'SALES' | 'DESIGN' | string;
    // Optional display fields used by the detail drawer
    isNew?: boolean;
    salary?: string;
    createdAt?: string;
    updatedAt?: string;
  }

  // Type for the detail drawer (subset/overlap of API job)
  type DrawerJob = {
    _id?: string;
    id?: string;
    employerId?: string;
    title?: string;
    department?: string;
    location?: string;
    status?: string;
    description?: string;
    requirements?: string;
    employmentType?: string;
    salary?: string;
    salaryMin?: number;
    salaryMax?: number;
    currency?: string;
    skills?: string[];
    benefits?: string[];
    applicationQuestions?: string[];
    createdAt?: string;
    updatedAt?: string;
  };

  type RankedJob = Job & {
    matchScore?: number;
    isTopMatch?: boolean;
  };

  const extractCandidateSkills = (profile: unknown): string[] => {
    if (!profile || typeof profile !== 'object') return [];
    const record = profile as Record<string, unknown>;
    const rawSkills = record.skills ?? record.skillset ?? record.stack;

    if (Array.isArray(rawSkills)) {
      return rawSkills
        .map((skill) => String(skill).trim())
        .filter(Boolean);
    }

    if (typeof rawSkills === 'string') {
      return rawSkills
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean);
    }

    return [];
  };

  const normalizeSkill = (value: string) => value.trim().toLowerCase();

  const SKILL_SUGGESTIONS = ['JavaScript','TypeScript','React','Node.js','Python','Django','AWS','Docker','Kubernetes','SQL','PostgreSQL','GraphQL','REST','CSS','HTML','Next.js','Tailwind CSS','Java','C#','Go']

  const calculateMatchScore = (job: Job, candidateSkills: string[]) => {
    const jobSkills = Array.isArray(job.skills) ? job.skills : [];
    if (candidateSkills.length === 0 || jobSkills.length === 0) return 0;

    const candidateSet = new Set(candidateSkills.map(normalizeSkill));
    const matchedSkills = jobSkills.filter((skill) => candidateSet.has(normalizeSkill(String(skill))));
    const uniqueJobSkills = new Set(jobSkills.map((skill) => normalizeSkill(String(skill))));

    if (uniqueJobSkills.size === 0) return 0;

    return Math.round((matchedSkills.length / uniqueJobSkills.size) * 100);
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [locationTerm, setLocationTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applyingToJob, setApplyingToJob] = useState<Job | null>(null);
  const { fetchJobs } = useGetJobs()
  const { fetchJobs: fetchPublicJobs, fetchJobById } = useGetPublicJobs()

  // Fetch full job detail before opening wizard so applicationQuestions are present
  async function handleApply() {
    if (!selectedJob) return;
    const jobId = String((selectedJob as { _id?: string; id?: string })._id ?? (selectedJob as { id?: string }).id ?? '');
    if (jobId) {
      const full = await fetchJobById(jobId);
      if (full) { setApplyingToJob(full as Job); return; }
    }
    setApplyingToJob(selectedJob);
  }

  const [jobs, setJobs] = useState<Job[] | null>(null)
  const [loadingJobs, setLoadingJobs] = useState(true)
  const { createJob, loading: creating, error: createError, setError: setCreateError } = useCreateJob()
  const [showCreateModal, setShowCreateModal] = useState(false)

  // form state for create job
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [requirements, setRequirements] = useState('')
  const [locationInput, setLocationInput] = useState('')
  type CountryInfo = { country: string; cities?: string[] }
  const [countriesData, setCountriesData] = useState<CountryInfo[] | null>(null)
  const [countriesLoading, setCountriesLoading] = useState(false)
  const [country, setCountry] = useState('')
  const [statesForCountry, setStatesForCountry] = useState<string[] | null>(null)
  const [_statesLoading, setStatesLoading] = useState(false)
  const [stateProvince, setStateProvince] = useState('')
  const [citiesForState, setCitiesForState] = useState<string[] | null>(null)
  const [_citiesLoading, setCitiesLoading] = useState(false)
  const [city, setCity] = useState('')

  // Salary slider bounds (numbers in local currency units)
  const SALARY_MIN = 0
  const SALARY_MAX = 300000
  const SALARY_STEP = 500
  const [salaryMinNum, setSalaryMinNum] = useState(30000)
  const [salaryMaxNum, setSalaryMaxNum] = useState(120000)
  const [activeThumb, setActiveThumb] = useState<'min' | 'max' | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)
  const activeThumbRef = useRef<'min' | 'max' | null>(null)
  const valueFromPointer = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect()
    if (!rect) return SALARY_MIN
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    const raw = SALARY_MIN + ratio * salaryRangeWidth
    const stepped = Math.round(raw / SALARY_STEP) * SALARY_STEP
    return Math.min(SALARY_MAX, Math.max(SALARY_MIN, stepped))
  }

  const onPointerMove = (e: PointerEvent) => {
    const thumb = activeThumbRef.current
    if (!thumb) return
    const val = valueFromPointer(e.clientX)
    if (thumb === 'min') {
      const newMin = Math.min(val, salaryMaxNum)
      setSalaryMinNum(newMin)
      setSalaryMin(String(newMin))
    } else {
      const newMax = Math.max(val, salaryMinNum)
      setSalaryMaxNum(newMax)
      setSalaryMax(String(newMax))
    }
  }

  const onPointerUp = () => {
    setActiveThumb(null)
    activeThumbRef.current = null
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
  }

  const onPointerDownTrack = (e: React.PointerEvent) => {
    const clientX = e.clientX
    const val = valueFromPointer(clientX)
    // choose nearest thumb
    const distMin = Math.abs(val - salaryMinNum)
    const distMax = Math.abs(val - salaryMaxNum)
    const thumb = distMin <= distMax ? 'min' : 'max'
    setActiveThumb(thumb)
    // set initial value
    if (thumb === 'min') {
      const newMin = Math.min(val, salaryMaxNum)
      setSalaryMinNum(newMin)
      setSalaryMin(String(newMin))
    } else {
      const newMax = Math.max(val, salaryMinNum)
      setSalaryMaxNum(newMax)
      setSalaryMax(String(newMax))
    }
    // attach global listeners
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }

  const startThumbDrag = (thumb: 'min' | 'max', e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      // ignore capture errors in older browsers
    }

    const val = valueFromPointer(e.clientX)
    setActiveThumb(thumb)
    activeThumbRef.current = thumb

    if (thumb === 'min') {
      const newMin = Math.min(val, salaryMaxNum)
      setSalaryMinNum(newMin)
      setSalaryMin(String(newMin))
    } else {
      const newMax = Math.max(val, salaryMinNum)
      setSalaryMaxNum(newMax)
      setSalaryMax(String(newMax))
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }

  // Skill suggestion UI state
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [suggestionIndex, setSuggestionIndex] = useState(-1)
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false)

  // Basic fallback if remote load fails
  const FALLBACK_COUNTRIES = [{ country: 'Nigeria', cities: ['Lagos', 'Abuja'] }, { country: 'United States', cities: ['Austin', 'Miami', 'Remote'] }]

  useEffect(() => {
    // Sync the textual location used by the backend
    if (!country) return
    if (stateProvince) {
      // defer to avoid synchronous setState within effect
      setTimeout(() => setLocationInput(city ? `${city}, ${stateProvince}, ${country}` : `${stateProvince}, ${country}`), 0)
    } else {
      setTimeout(() => setLocationInput(city ? `${city}, ${country}` : country), 0)
    }
  }, [country, stateProvince, city])

  useEffect(() => {
    // Load countries list when the create modal opens
    if (!showCreateModal) return
    if (countriesData || countriesLoading) return
    // defer loading state update to avoid synchronous setState in effect
    setTimeout(() => setCountriesLoading(true), 0)
    fetch('https://countriesnow.space/api/v0.1/countries')
      .then(res => res.json())
      .then((json) => {
        const list = Array.isArray(json?.data) ? json.data : null
        if (Array.isArray(list)) {
          const normalized = list.map((c: any) => ({ country: c.country, cities: Array.isArray(c.cities) ? c.cities : [] }))
          setCountriesData(normalized)
          if (normalized.length > 0) {
            setCountry(normalized[0].country)
            setCity(normalized[0].cities[0] ?? '')
          }
        } else {
          setCountriesData(FALLBACK_COUNTRIES)
          setCountry(FALLBACK_COUNTRIES[0].country)
          setCity(FALLBACK_COUNTRIES[0].cities[0])
        }
      })
      .catch(() => {
        setCountriesData(FALLBACK_COUNTRIES)
        setCountry(FALLBACK_COUNTRIES[0].country)
        setCity(FALLBACK_COUNTRIES[0].cities[0])
      })
      .finally(() => setTimeout(() => setCountriesLoading(false), 0))
  }, [showCreateModal, countriesData, countriesLoading])

  // When country changes, attempt to load administrative states for that country.
  useEffect(() => {
    if (!showCreateModal || !country) return
  setTimeout(() => setStatesLoading(true), 0)
  setStatesForCountry(null)
  setCitiesForState(null)
  setStateProvince('')

    fetch('https://countriesnow.space/api/v0.1/countries/states', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country }),
    })
      .then(res => res.json())
      .then((json) => {
        const states = json?.data?.states ?? json?.data ?? null
        if (Array.isArray(states) && states.length > 0) {
          const names = states.map((s: any) => (typeof s === 'string' ? s : s.name || s.state || ''))
          if (country === 'United States' && !names.includes('District of Columbia')) {
            names.push('District of Columbia')
            names.sort()
          }
          setStatesForCountry(names)
          setStateProvince(names[0] ?? '')
        } else {
          // No states available: fall back to country-level cities
          const cent = (countriesData ?? FALLBACK_COUNTRIES).find(c => c.country === country)
          setStatesForCountry(null)
          setCitiesForState(cent?.cities ?? null)
          setCity(cent?.cities?.[0] ?? '')
        }
      })
      .catch(() => {
        const cent = (countriesData ?? FALLBACK_COUNTRIES).find(c => c.country === country)
        setStatesForCountry(null)
        setCitiesForState(cent?.cities ?? null)
        setCity(cent?.cities?.[0] ?? '')
      })
    .finally(() => setTimeout(() => setStatesLoading(false), 0))
  }, [country, showCreateModal, countriesData])

  // When state/province changes, attempt to load cities for that state
  useEffect(() => {
    if (!showCreateModal || !country) return
    if (!stateProvince) return
    if (stateProvince === 'District of Columbia') {
      setCitiesForState(['District of Columbia'])
      setCity('District of Columbia')
      return
    }
  setTimeout(() => setCitiesLoading(true), 0)
  setCitiesForState(null)

    fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country, state: stateProvince }),
    })
      .then(res => res.json())
      .then((json) => {
        const cities = json?.data ?? json?.data?.cities ?? null
        if (Array.isArray(cities) && cities.length > 0) {
          setCitiesForState(cities)
          setCity(cities[0] ?? '')
        } else {
          // fallback to country-level cities
          const cent = (countriesData ?? FALLBACK_COUNTRIES).find(c => c.country === country)
          setCitiesForState(cent?.cities ?? null)
          setCity(cent?.cities?.[0] ?? '')
        }
      })
      .catch(() => {
        const cent = (countriesData ?? FALLBACK_COUNTRIES).find(c => c.country === country)
        setCitiesForState(cent?.cities ?? null)
        setCity(cent?.cities?.[0] ?? '')
      })
      .finally(() => setTimeout(() => setCitiesLoading(false), 0))
  }, [stateProvince, country, showCreateModal, countriesData])

  const DEPARTMENTS = ['Engineering', 'Marketing', 'HR', 'Sales', 'Design', 'Operations']
  const [employmentType, setEmploymentType] = useState<'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | string>('FULL_TIME')
  const [salaryMin, setSalaryMin] = useState<string>('')
  const [salaryMax, setSalaryMax] = useState<string>('')
  const [currency, setCurrency] = useState('USD')
  const [departmentInput, setDepartmentInput] = useState('')
  // skillsInput removed; using managed skills array instead
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState('')
  const [showSkillInput, setShowSkillInput] = useState(false)
  const [statusInput, setStatusInput] = useState<'OPEN' | 'CLOSED' | 'DRAFT' | string>('OPEN')

  // Ensure activeThumb is cleared if mouseup happens outside the input
  useEffect(() => {
    const onUp = () => setActiveThumb(null)
    window.addEventListener('mouseup', onUp)
    return () => window.removeEventListener('mouseup', onUp)
  }, [])

  const closeCreateModal = () => {
    setShowCreateModal(false)
    // reset form
    setTitle('')
    setDescription('')
    setRequirements('')
    setLocationInput('')
    // reset country/city to first available (fallback if not loaded)
    const first = (countriesData && countriesData.length > 0) ? countriesData[0] : (FALLBACK_COUNTRIES[0] ?? null)
    if (first) { setCountry(first.country); setCity((first as any).cities?.[0] ?? '') }
    setDepartmentInput('')
    setEmploymentType('FULL_TIME')
    setSalaryMin('')
    setSalaryMax('')
    setSalaryMinNum(30000)
    setSalaryMaxNum(120000)
    setSuggestions([])
    setSuggestionIndex(-1)
    setShowSkillSuggestions(false)
    setCurrency('USD')
    setSkills([])
    setNewSkill('')
    setStatusInput('OPEN')
    setCreateError(null)
  }

  const addSkill = () => {
    const s = newSkill.trim();
    if (!s) return;
    if (skills.includes(s)) {
      setNewSkill('');
      setShowSkillInput(false);
      return;
    }
    // prepend so newest appears first
    setSkills(prev => [s, ...prev]);
    setNewSkill('');
    setShowSkillInput(false);
  }

  const removeSkill = (s: string) => {
    setSkills(prev => prev.filter(x => x !== s));
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
  const skillsArray = skills.map(s => String(s).trim()).filter(Boolean)


    const payload = {
      title,
      description,
      department: departmentInput.toUpperCase(),
      requirements,
      location: locationInput,
      employmentType,
      salaryMin: Number(salaryMinNum) || 0,
      salaryMax: Number(salaryMaxNum) || 0,
      currency,
      skills: skillsArray,
      status: statusInput,
    }

    console.log(payload)

    const res = await createJob(payload)
    if (res) {
      // refresh jobs — the authenticated jobs endpoint returns { jobs, pagination }
      const refreshed = await fetchJobs({ page: 1, limit: 50 })
      const payloadJobs = (refreshed && typeof refreshed === 'object' && Array.isArray((refreshed as { jobs?: unknown }).jobs))
        ? (refreshed as { jobs: unknown[] }).jobs
        : []
      if (payloadJobs.length > 0) setJobs(payloadJobs as Job[])
      closeCreateModal()
    }
  }


  const candidateSkills = extractCandidateSkills(state.user?.profile);

  const rankedJobs: RankedJob[] = (jobs ?? []).map((job) => ({
    ...job,
    matchScore: calculateMatchScore(job, candidateSkills),
  }));

  const filteredJobs = rankedJobs.filter((job) => {
    const matchesSearch = (job.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = !locationTerm.trim() ||
      (job.location ?? '').toLowerCase().includes(locationTerm.trim().toLowerCase());

    return matchesSearch && matchesLocation;
  });

  // If there's no logged-in user, load public jobs. Otherwise use authenticated fetchJobs.
  // Re-runs whenever the search/location terms change so the homepage hero search
  // (q/where) and any in-page edits actually reach the server.
  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoadingJobs(true)
      const commonParams = {
        page: 1,
        limit: 50,
        search: searchTerm.trim() || undefined,
        location: locationTerm.trim() || undefined,
      }
      let res
      if (!state.user) {
        res = await fetchPublicJobs(commonParams)
      } else {
        res = await fetchJobs(commonParams)
      }
      if (!mounted) return

      // Both the authenticated and public jobs endpoints return { jobs, pagination }.
      const payload = (res && typeof res === 'object' && Array.isArray((res as { jobs?: unknown }).jobs))
        ? (res as { jobs: unknown[] }).jobs
        : []

      if (payload.length > 0) {
        setJobs(payload as Job[])
        setLoadingJobs(false)
        return
      }

      if (state.user) {
        // Authenticated call returned nothing — fall back to public jobs.
        const pub = await fetchPublicJobs(commonParams)
        const pubPayload = (pub && typeof pub === 'object' && Array.isArray((pub as { jobs?: unknown }).jobs))
          ? (pub as { jobs: unknown[] }).jobs
          : []
        if (!mounted) return
        setJobs(pubPayload as Job[])
      } else {
        setJobs([])
      }
      setLoadingJobs(false)
    }
    load()
    return () => { mounted = false }
  }, [state.user, searchTerm, locationTerm, fetchJobs, fetchPublicJobs])

  // If q/where query params are present (from the homepage hero search), prefill
  // the keyword and location search so they reach the server-side filter above.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const q = params.get('q')
    const where = params.get('where')
    if (q) setSearchTerm(q)
    if (where) setLocationTerm(where)
  }, [])

  // If a details query param is present, open that job once the list has loaded.
  // Falls back to fetching it directly by id if it isn't in the loaded batch
  // (e.g. it's outside the first page, or excluded by the current filters).
  useEffect(() => {
    // Read details param from the URL directly to avoid CSR bailout from next/navigation
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const details = params.get('details')
    if (!details) return
    if (jobs === null) return // list fetch hasn't resolved yet

    const found = jobs.find(j => String(j._id ?? j.id ?? j.title) === details)
    if (found) {
      // Defer to avoid synchronous setState inside effect (keeps parity with other effects)
      setTimeout(() => setSelectedJob(found), 0)
      return
    }

    let cancelled = false
    fetchJobById(details).then((job) => {
      if (cancelled || !job) return
      setSelectedJob(job as Job)
    })
    return () => { cancelled = true }
  }, [jobs, fetchJobById])

  const displayedJobs = filteredJobs

  // Salary slider positions (percent) for custom thumbs
  const salaryRangeWidth = SALARY_MAX - SALARY_MIN || 1
  const salaryMinPct = Math.round(((salaryMinNum - SALARY_MIN) / salaryRangeWidth) * 100)
  const salaryMaxPct = Math.round(((salaryMaxNum - SALARY_MIN) / salaryRangeWidth) * 100)

  return (
    <div className="flex-1 overflow-hidden" style={{ background: '#f8fafc', minHeight: '90vh' }}>
      <div className="tp-container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>

        {/* Page header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Career marketplace</p>
            <h1 style={{ margin: '0.2rem 0 0', fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)', letterSpacing: '-0.04em', color: '#0f172a', fontWeight: 800 }}>Browse jobs</h1>
          </div>
          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#64748b' }}>
            <span style={{ fontWeight: 800, color: '#1d4ed8', fontSize: '1.1rem' }}>{filteredJobs.length}</span>{' '}{filteredJobs.length === 1 ? 'job' : 'jobs'} found
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'row', gap: 32, alignItems: 'flex-start', height: '80vh' }}>
        {/* Left: Job List */}
  <div style={{ flex: '0 0 52%', minWidth: 0, maxWidth: '52%' }}>
          {/* Indeed-style dual search bar */}
          <div style={{ display: 'flex', alignItems: 'center', background: 'white', borderRadius: 14, border: '1px solid rgba(148,163,184,0.22)', boxShadow: '0 4px 24px -8px rgba(15,23,42,0.12)', marginBottom: 24, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', flex: 1, padding: '0.7rem 1rem', borderRight: '1px solid rgba(148,163,184,0.2)' }}>
              <svg style={{ width: 18, height: 18, color: '#94a3b8', marginRight: 8, flexShrink: 0 }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input
                type="text"
                placeholder="Job title, keywords, or company"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 15, color: '#0f172a' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', flex: 1, padding: '0.7rem 1rem' }}>
              <svg style={{ width: 18, height: 18, color: '#94a3b8', marginRight: 8, flexShrink: 0 }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
              <input
                type="text"
                placeholder="City, state, or remote"
                value={locationTerm}
                onChange={e => setLocationTerm(e.target.value)}
                style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 15, color: '#0f172a' }}
              />
            </div>
          </div>

          <div className="flex gap-10 flex-col overflow-y-scroll max-h-[70vh] tp-job-scroll" style={{ rowGap: 20, paddingBottom: "5rem", paddingRight: '0.5rem' }}>
            {/* top-match card removed — anonymous users now see public jobs, and personalized top-match is hidden */}
            {loadingJobs ? (
              <div style={{ padding: 32, textAlign: 'center', color: '#64748B' }}>Loading jobs...</div>
            ) : filteredJobs.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: '#64748B' }}>No jobs found</div>
            ) : (
              displayedJobs.map((job, index) => (
                // Map the API job object to the JobCard props. JobCard expects a few fields; ensure defaults.
                (() => {
                  const jobKey = String(job._id ?? job.id ?? `${job.title ?? 'job'}-${index}`)

                  return (
                <JobCard
                  key={jobKey}
                  id={job._id ?? job.id ?? jobKey}
                  title={job.title}
                  department={job.department ?? 'General'}
                  location={job.location ?? 'Remote'}
                  isNew={job.status === 'OPEN'}
                  description={job.description}
                  onClick={() => setSelectedJob(job as Job)}
                  fullWidth
                  matchScore={index === 0 && candidateSkills.length > 0 ? (job.matchScore ?? 0) : undefined}
                  isTopMatch={index === 0 && candidateSkills.length > 0}
                />
                  )
                })()
              ))
            )}
          </div>

          
        </div>

        {/* Right: Job Details Placeholder or Drawer */}
  <div className="hide-scrollbar" style={{ flex: '0 0 48%', minWidth: 0, maxWidth: '48%', borderRadius: 24, minHeight: 400, padding: 0, overflowY: 'auto', maxHeight: '70vh', display: selectedJob ? 'none' : 'block' }}>
          {!selectedJob && (
            <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: 0, minHeight: 420, display: 'grid', placeItems: 'center', padding: '2rem', background: 'white', borderRadius: '16px', border: '1px solid rgba(148,163,184,0.15)' }}>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>Select a job to view details</div>
                <div style={{ fontSize: '0.95rem', lineHeight: 1.65, color: '#64748b' }}>Open a listing to see the full description, skills, and available actions.</div>
                {state.user?.accountType === 'EMPLOYER' && (
                  <button onClick={() => setShowCreateModal(true)} className="tp-btn-primary" style={{ marginTop: '1.25rem' }}>
                    Create Job Posting
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* If a job is selected, show the details in a floating drawer (for now, you can later refactor to show inline) */}
        {selectedJob && (
          <div className="hide-scrollbar" style={{ flex: '0 0 48%', minWidth: 0, maxWidth: '48%', overflowY: 'auto', height: '83vh' }}>
            {
              // Map the selected job into the shape expected by JobDetailDrawer
            }
            <JobDetailDrawer
              job={selectedJob as DrawerJob}
              onClose={() => setSelectedJob(null)}
              onApply={() => { void handleApply(); }}
            />
          </div>
        )}
        </div>
      </div>

      {applyingToJob && (
        <ApplicationWizard
          job={applyingToJob as { _id?: string; id?: string; title?: string; department?: string; location?: string; applicationQuestions?: string[] }}
          onClose={() => setApplyingToJob(null)}
        />
      )}

      {showCreateModal && (
        <div style={{ position: 'fixed', top: '60px', inset: 0, background: 'rgba(2,6,23,0.48)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2rem', zIndex: 2000 }}>
          <div className="tp-card-soft" role="dialog" aria-modal="true" style={{ width: 820, background: 'linear-gradient(180deg, #ffffff, #fbfdff)', borderRadius: 20, padding: 28, maxHeight: '86vh', overflowY: 'auto', boxShadow: '0 40px 100px rgba(2,6,23,0.26)', border: '1px solid rgba(15,23,42,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.5rem', letterSpacing: '-0.04em', fontWeight: 800 }}>Create job posting</h2>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Fill in the job details below to publish a new listing.</p>
              </div>
              <button onClick={closeCreateModal} aria-label="Close create job" style={{ border: 'none', background: 'transparent', padding: '0.25rem', borderRadius: 8, cursor: 'pointer', color: '#94a3b8', fontSize: '1.1rem' }}>✕</button>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {/* shared styles for unfocused inputs */}
                {/** We'll inline focus handlers to switch background color */}
                <div style={{ gridColumn: '1 / span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: '#4A5568', marginBottom: '0.25rem' }}>
                    Job Title
                  </label>
                  <input required placeholder=' Job Title' value={title} onChange={e => setTitle(e.target.value)}
                    onFocus={e => (e.currentTarget.style.background = '#fff')}
                    onBlur={e => (e.currentTarget.style.background = '#f7f7fa')}
                    style={{ background: '#f7f7fa', border: '1px solid #E2E8F0', padding: 8, width: '100%', borderRadius: 6 }}
                  />
                </div>
                <div style={{ gridColumn: '1 / span 2', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', color: '#4A5568', marginBottom: '0.25rem' }}>Country</label>
                    <select
                      value={country}
                      onChange={e => { const sel = e.target.value; setCountry(sel); setStateProvince(''); setCitiesForState(null); setCity('') }}
                      aria-label="Select country"
                      style={{ width: '100%', border: '1px solid #E2E8F0', padding: 10, borderRadius: 8, background: '#fff', cursor: 'pointer', appearance: 'none' }}
                    >
                      {(countriesData ?? FALLBACK_COUNTRIES).map(c => (
                        <option key={c.country} value={c.country}>{c.country}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', color: '#4A5568', marginBottom: '0.25rem' }}>State / Province</label>
                    {statesForCountry ? (
                      <select
                        value={stateProvince}
                        onChange={e => setStateProvince(e.target.value)}
                        aria-label="Select state or province"
                        style={{ width: '100%', border: '1px solid #E2E8F0', padding: 10, borderRadius: 8, background: '#fff', cursor: 'pointer', appearance: 'none' }}
                      >
                        {statesForCountry.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    ) : (
                      <select
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        aria-label="Select city or location"
                        style={{ width: '100%', border: '1px solid #E2E8F0', padding: 10, borderRadius: 8, background: '#fff', cursor: 'pointer', appearance: 'none' }}
                      >
                        {((countriesData ?? FALLBACK_COUNTRIES).find(c => c.country === country)?.cities ?? []).map(ct => (
                          <option key={ct} value={ct}>{ct}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* If states are present, render a city selector based on the selected state */}
                  {statesForCountry && (
                    <div style={{ gridColumn: '1 / span 2' }}>
                      <label style={{ display: 'block', fontSize: '0.875rem', color: '#4A5568', marginBottom: '0.25rem' }}>City / Location</label>
                      <select
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        aria-label="Select city or location"
                        style={{ width: '100%', border: '1px solid #E2E8F0', padding: 10, borderRadius: 8, background: '#fff', cursor: 'pointer', appearance: 'none' }}
                      >
                        {(citiesForState ?? []).map(ct => (
                          <option key={ct} value={ct}>{ct}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', color: '#4A5568', marginBottom: '0.25rem' }}>
                      Department
                    </label>
                    <select value={departmentInput} onChange={e => setDepartmentInput(e.target.value)} aria-label="Select department"
                      onFocus={e => (e.currentTarget.style.boxShadow = '0 6px 18px rgba(59,130,246,0.08)')}
                      onBlur={e => (e.currentTarget.style.boxShadow = 'none')}
                      style={{ background: '#f7f7fa', border: '1px solid #E2E8F0', padding: 10, width: '100%', borderRadius: 8, cursor: 'pointer' }}
                    >
                      <option value="">Select department...</option>
                      {DEPARTMENTS.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ flex: '0 0 38%', position: 'relative' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', color: '#4A5568', marginBottom: '0.25rem' }}>Employment type</label>
                    <div style={{ position: 'relative' }}>
                      <select
                        value={employmentType}
                        onChange={e => setEmploymentType(e.target.value)}
                        aria-label="Employment Type"
                        onFocus={e => (e.currentTarget.style.boxShadow = '0 6px 18px rgba(59,130,246,0.12)')}
                        onBlur={e => (e.currentTarget.style.boxShadow = 'none')}
                        style={{
                          width: '100%',
                          border: '1px solid #E6EEF8',
                          padding: '10px 40px 10px 12px',
                          borderRadius: 10,
                          background: '#ffffff',
                          appearance: 'none',
                          WebkitAppearance: 'none',
                          MozAppearance: 'none',
                          outline: 'none',
                          cursor: 'pointer',
                          fontSize: 15,
                          boxShadow: '0 2px 6px rgba(2,6,23,0.04)'
                        }}
                      >
                        <option value='FULL_TIME'>Full time</option>
                        <option value='PART_TIME'>Part time</option>
                        <option value='CONTRACT'>Contract</option>
                        <option value='INTERNSHIP'>Internship</option>
                      </select>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </div>
                  </div>
                </div>
                <div style={{ gridColumn: '1 / span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: '#4A5568', marginBottom: '0.25rem' }}>
                    Salary Range
                  </label>
                  <div style={{ display: 'grid', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <input type="number" aria-label="Salary minimum" value={salaryMinNum} onChange={e => { const v = Number(e.target.value||0); setSalaryMinNum(Math.min(v, salaryMaxNum)); setSalaryMin(String(Math.min(v, salaryMaxNum))) }}
                        style={{ background: '#f7f7fa', border: '1px solid #E2E8F0', padding: 8, width: '30%', borderRadius: 6 }} />
                      <div style={{ flex: 1 }}>
                        <div ref={trackRef} onPointerDown={onPointerDownTrack} style={{ position: 'relative', height: 48, touchAction: 'none' }}>
                          <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', transform: 'translateY(-50%)', height: 8, borderRadius: 8, background: '#F1F5F9' }} />
                          <div style={{ position: 'absolute', left: `${salaryMinPct}%`, right: `${100 - salaryMaxPct}%`, top: '50%', transform: 'translateY(-50%)', height: 8, borderRadius: 8, background: 'linear-gradient(90deg,#60A5FA,#3B82F6)' }} />
                          {/* Custom thumbs with larger hitboxes */}
                          <button
                            type="button"
                            aria-label="Drag minimum salary"
                            onPointerDown={(e) => {
                              if ((e as any).button !== 0) return
                              startThumbDrag('min', e)
                            }}
                            style={{
                              position: 'absolute',
                              left: `calc(${salaryMinPct}% - 26px)`,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              width: 52,
                              height: 52,
                              border: 'none',
                              background: 'transparent',
                              padding: 0,
                              margin: 0,
                              cursor: 'grab',
                              touchAction: 'none',
                              zIndex: activeThumb === 'min' ? 4 : 2,
                            }}
                          >
                            <span aria-hidden style={{ position: 'absolute', left: 16, top: 16, width: 20, height: 20, borderRadius: '999px', background: 'white', border: '3px solid #2563EB', boxShadow: '0 6px 18px rgba(37,99,235,0.18)', pointerEvents: 'none' }} />
                          </button>
                          <button
                            type="button"
                            aria-label="Drag maximum salary"
                            onPointerDown={(e) => {
                              if ((e as any).button !== 0) return
                              startThumbDrag('max', e)
                            }}
                            style={{
                              position: 'absolute',
                              left: `calc(${salaryMaxPct}% - 26px)`,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              width: 52,
                              height: 52,
                              border: 'none',
                              background: 'transparent',
                              padding: 0,
                              margin: 0,
                              cursor: 'grab',
                              touchAction: 'none',
                              zIndex: activeThumb === 'max' ? 4 : 2,
                            }}
                          >
                            <span aria-hidden style={{ position: 'absolute', left: 16, top: 16, width: 20, height: 20, borderRadius: '999px', background: 'white', border: '3px solid #2563EB', boxShadow: '0 6px 18px rgba(37,99,235,0.18)', pointerEvents: 'none' }} />
                          </button>
                        </div>
                      </div>
                      <input type="number" aria-label="Salary maximum" value={salaryMaxNum} onChange={e => { const v = Number(e.target.value||0); setSalaryMaxNum(Math.max(v, salaryMinNum)); setSalaryMax(String(Math.max(v, salaryMinNum))) }}
                        style={{ background: '#f7f7fa', border: '1px solid #E2E8F0', padding: 8, width: '30%', borderRadius: 6 }} />
                    </div>
                    <div style={{ color: 'var(--tp-muted)', fontSize: 13 }}>You can drag the handles or type exact values.</div>
                  </div>
                </div>
                <div style={{ gridColumn: '1 / span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: '#4A5568', marginBottom: '0.25rem' }}>
                    Job Description
                  </label>
                  <input required placeholder='Job Description' value={description} onChange={e => setDescription(e.target.value)}
                    onFocus={e => (e.currentTarget.style.background = '#fff')}
                    onBlur={e => (e.currentTarget.style.background = '#f7f7fa')}
                    style={{ background: '#f7f7fa', border: '1px solid #E2E8F0', padding: 8, width: '100%', borderRadius: 6 }}
                  />
                </div>
                <div style={{ gridColumn: '1 / span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: '#4A5568', marginBottom: '0.25rem' }}>Skills</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      {skills.map((s) => (
                        <div key={s} style={{ background: '#F1F5F9', padding: '6px 10px', borderRadius: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span style={{ fontSize: 13 }}>{s}</span>
                          <button type='button' onClick={() => removeSkill(s)} style={{ background: 'transparent', border: 'none', color: '#1343bd', cursor: 'pointer' }}>×</button>
                        </div>
                      ))}

                      {/* plus button to show inline input */}
                      {!showSkillInput && (
                        <button type='button' onClick={() => setShowSkillInput(true)} style={{ background: '#fff', border: '1px dashed #CBD5E1', padding: '6px 10px', borderRadius: 8, cursor: 'pointer' }}>+</button>
                      )}

                      {showSkillInput && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 260 }}>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <input autoFocus placeholder='New skill' value={newSkill} onChange={e => {
                                const v = e.target.value; setNewSkill(v);
                                const filtered = SKILL_SUGGESTIONS.filter(s => s.toLowerCase().includes(v.toLowerCase()) && !skills.includes(s)).slice(0,8);
                                setSuggestions(filtered); setSuggestionIndex(-1); setShowSkillSuggestions(filtered.length > 0);
                              }}
                              onKeyDown={e => {
                                if (e.key === 'Enter') { e.preventDefault(); if (showSkillSuggestions && suggestionIndex >= 0) { setNewSkill(suggestions[suggestionIndex]); addSkill(); } else { addSkill(); } }
                                if (e.key === 'ArrowDown') { e.preventDefault(); setSuggestionIndex(i => Math.min((i+1), suggestions.length-1)); }
                                if (e.key === 'ArrowUp') { e.preventDefault(); setSuggestionIndex(i => Math.max((i-1), 0)); }
                                if (e.key === 'Escape') { setShowSkillSuggestions(false); }
                              }}
                              style={{ padding: '6px 8px', borderRadius: 6, background: '#fff', border: '1px solid #E2E8F0', flex: 1 }}
                            />
                            <button type='button' onClick={addSkill} style={{ padding: '6px 10px', borderRadius: 6, background: '#1e3a8a', color: 'white' }}>Add</button>
                            <button type='button' onClick={() => { setShowSkillInput(false); setNewSkill(''); setShowSkillSuggestions(false); }} style={{ padding: '6px 8px', borderRadius: 6, background: 'transparent', border: '1px solid #e5e7eb' }}>Cancel</button>
                          </div>
                          {showSkillSuggestions && suggestions.length > 0 && (
                            <div style={{ border: '1px solid #E2E8F0', borderRadius: 8, background: 'white', boxShadow: '0 6px 18px rgba(2,6,23,0.08)', maxHeight: 180, overflowY: 'auto' }}>
                              {suggestions.map((s, idx) => (
                                <div key={s} onMouseDown={e => { e.preventDefault(); setNewSkill(s); addSkill(); }}
                                  style={{ padding: '8px 10px', cursor: 'pointer', background: idx === suggestionIndex ? '#EEF2FF' : 'transparent' }}>
                                  {s}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>


              <div style={{ marginTop: 12 }}>
                <textarea placeholder='Requirements' value={requirements} onChange={e => setRequirements(e.target.value)} style={{ width: '100%', minHeight: 110, border: '1px solid #E2E8F0', padding: 12, borderRadius: 14, background: '#f8fafc' }} />
              </div>

              {createError && <div style={{ color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', padding: '0.85rem 1rem', borderRadius: 14, fontWeight: 700 }}>{createError}</div>}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
                <button type='button' onClick={closeCreateModal} className="tp-btn-secondary">Cancel</button>
                <button type='submit' className="tp-btn-primary">{creating ? 'Creating...' : 'Create Job'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default BrowseJobs;