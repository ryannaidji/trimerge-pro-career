"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { BriefcaseBusiness, Building2, ChevronLeft, ChevronRight, Pencil, Plus, Trash2, Users, X } from 'lucide-react';
import { useUser } from '@/contexts/userContext/userContext';
import useGetEmployer from '@/hooks/useGetEmployer';
import { useGetJobs } from '@/hooks/useGetJobs';
import { useUpdateEmployerProfile } from '@/hooks/useUpdateEmployerProfile';
import { useUpdateJob } from '@/hooks/useUpdateJob';
import { useDeleteJob } from '@/hooks/useDeleteJob';
import { useCreateJob } from '@/hooks/useCreateJob';
import { Select } from '../../components/ui/Select';
import { COMPANY_INDUSTRY_OPTIONS, COMPANY_SIZE_OPTIONS } from '../../(authentication)/(recruiterAuth)/recruiter-information/step-one/constants';
import CandidateOverviewClient from '../candidate-overview/CandidateOverviewClient';

type CountryInfo = { country: string; cities?: string[] }
const FALLBACK_COUNTRIES: CountryInfo[] = [
  { country: 'Nigeria', cities: ['Lagos', 'Abuja'] },
  { country: 'United States', cities: ['Austin', 'Miami', 'Remote'] },
]

const QUESTION_GROUPS = [
  {
    title: 'Work Authorization',
    questions: [
      { id: 'workAuthUS',   label: 'Are you legally authorized to work in the United States?',                     hint: 'Yes / No' },
      { id: 'sponsorship',  label: 'Will you now or in the future require employer sponsorship for employment?',   hint: 'Yes / No' },
    ],
  },
  {
    title: 'Availability',
    questions: [
      { id: 'startDate', label: 'Earliest Available Start Date',   hint: 'Date picker' },
      { id: 'travel',    label: 'Are you willing to travel?',      hint: 'Yes / No — if yes, % up to 10 / 25 / 50 / 75 / 100' },
    ],
  },
  {
    title: 'Security',
    questions: [
      { id: 'backgroundCheck',   label: 'Are you able to successfully complete a background investigation if required?', hint: 'Yes / No' },
      { id: 'securityClearance', label: 'Do you currently possess an active security clearance?',                        hint: 'None / Public Trust / Secret / Top Secret / TS/SCI' },
    ],
  },
  {
    title: 'Experience',
    questions: [
      { id: 'yearsOfExperience', label: 'Years of Experience',           hint: 'Number input' },
      { id: 'education',         label: 'Highest Level of Education',    hint: 'Dropdown' },
      { id: 'certifications',    label: 'Certifications',                hint: 'Text field' },
    ],
  },
  {
    title: 'Government Contract',
    questions: [
      { id: 'willingOnsite',       label: 'Are you willing to work onsite if required?',                                                           hint: 'Yes / No' },
      { id: 'willingRelocate',     label: 'Are you willing to relocate?',                                                                          hint: 'Yes / No' },
      { id: 'essentialFunctions',  label: 'Are you able to perform the essential functions of this position with or without reasonable accommodation?', hint: 'Yes / No' },
    ],
  },
];

const VOLUNTARY_QUESTIONS = [
  {
    id: 'veteranStatus',
    label: 'Protected Veteran Status',
    hint: 'I identify as one or more protected veteran classifications / I am not a protected veteran / I choose not to answer',
  },
];

const BENEFIT_GROUPS = [
  {
    title: 'Health & Wellness',
    items: ['Medical Insurance','Dental Insurance','Vision Insurance','Prescription Drug Coverage','Health Savings Account (HSA)','Flexible Spending Account (FSA)','Employee Assistance Program (EAP)','Wellness Program'],
  },
  {
    title: 'Financial Benefits',
    items: ['401(k) Retirement Plan','Employer 401(k) Match','Life Insurance','Short-Term Disability Insurance','Long-Term Disability Insurance','Performance Bonus','Referral Bonus'],
  },
  {
    title: 'Paid Time Off',
    items: ['Paid Time Off (PTO)','Paid Holidays','Sick Leave','Bereavement Leave','Jury Duty Leave','Military Leave','Parental Leave'],
  },
  {
    title: 'Professional Development',
    items: ['Tuition Reimbursement','Professional Development Assistance','Certification Reimbursement','Continuing Education Support','Conference Attendance'],
  },
  {
    title: 'Work-Life Balance',
    items: ['Flexible Work Schedule','Hybrid Work Environment','Remote Work Opportunities','Flexible Hours'],
  },
  {
    title: 'Additional Benefits',
    items: ['Employee Discounts','Commuter Benefits','Parking Provided','Cell Phone Reimbursement','Home Office Stipend','Travel Reimbursement','Company Laptop/Equipment Provided'],
  },
];
const BENEFIT_VARIES = 'Benefits Vary by Position';

const parseSectionFromText = (text: string, marker: string): string => {
  const idx = text.indexOf(marker);
  if (idx === -1) return '';
  const start = idx + marker.length;
  const next = text.indexOf('[', start);
  return (next === -1 ? text.slice(start) : text.slice(start, next)).trim();
};

type Tab = 'jobs' | 'applications' | 'company';
type JobRecord = {
  id?: number | string;
  _id?: string;
  title?: string;
  department?: string;
  location?: string;
  status?: string;
  description?: string;
  requirements?: string;
  employmentType?: string;
  workArrangement?: string;
  workSchedule?: string;
  salaryMin?: number;
  salaryMax?: number;
  hourlyMin?: number;
  hourlyMax?: number;
  salaryType?: string;
  currency?: string;
  skills?: string[];
  applicationQuestions?: string[];
  benefits?: string[];
  employerId?: string;
};

const tabMeta: Array<{ id: Tab; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = [
  { id: 'jobs', label: 'Jobs', icon: BriefcaseBusiness },
  { id: 'applications', label: 'Candidates', icon: Users },
  { id: 'company', label: 'Company', icon: Building2 },
];

function RichTextArea({
  value,
  onChange,
  placeholder,
  minHeight = 160,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef(value);
  const [isEmpty, setIsEmpty] = useState(!value);

  // Populate on mount
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = value || '';
      valueRef.current = value;
      setIsEmpty(!value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync when value changes externally (e.g. loading a draft or clearing the form)
  useEffect(() => {
    if (editorRef.current && value !== valueRef.current) {
      editorRef.current.innerHTML = value || '';
      valueRef.current = value;
      setIsEmpty(!value);
    }
  }, [value]);

  const exec = (cmd: string, arg?: string) => {
    editorRef.current?.focus();
    // execCommand is deprecated but is the only zero-dependency cross-browser approach
    document.execCommand(cmd, false, arg ?? undefined);
  };

  const tbBtn = (label: React.ReactNode, title: string, fn: () => void) => (
    <button
      key={title}
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); fn(); }}
      style={{ padding: '0.22rem 0.5rem', borderRadius: '6px', border: '1px solid rgba(148,163,184,0.22)', background: 'white', color: '#475569', fontSize: '0.77rem', fontWeight: 600, cursor: 'pointer', lineHeight: 1.35, display: 'inline-flex', alignItems: 'center' }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ border: '1px solid rgba(148,163,184,0.25)', borderRadius: '10px', overflow: 'hidden', background: 'white' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '0.28rem', padding: '0.42rem 0.7rem', background: '#f1f5f9', borderBottom: '1px solid rgba(148,163,184,0.18)', flexWrap: 'wrap', alignItems: 'center' }}>
        {tbBtn(<strong>B</strong>, 'Bold', () => exec('bold'))}
        {tbBtn(<em style={{ fontStyle: 'italic' }}>I</em>, 'Italic', () => exec('italic'))}
        {tbBtn(<u>U</u>, 'Underline', () => exec('underline'))}
        <div style={{ width: 1, height: 15, background: 'rgba(148,163,184,0.35)', margin: '0 0.1rem', flexShrink: 0 }} />
        {tbBtn('• Bullet list', 'Bullet list', () => exec('insertUnorderedList'))}
        {tbBtn('1. Numbered', 'Numbered list', () => exec('insertOrderedList'))}
        <div style={{ width: 1, height: 15, background: 'rgba(148,163,184,0.35)', margin: '0 0.1rem', flexShrink: 0 }} />
        {tbBtn('¶ Paragraph', 'Paragraph block', () => exec('formatBlock', 'p'))}
        {tbBtn('✕ Clear', 'Clear formatting', () => exec('removeFormat'))}
      </div>
      {/* Editable area with placeholder */}
      <div style={{ position: 'relative' }}>
        {isEmpty && placeholder && (
          <div style={{ position: 'absolute', top: '0.85rem', left: '1rem', color: '#94a3b8', pointerEvents: 'none', fontSize: '1rem', lineHeight: 1.6, zIndex: 0 }}>
            {placeholder}
          </div>
        )}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          className="rte-editor"
          onInput={(e) => {
            const el = e.target as HTMLDivElement;
            const html = el.innerHTML;
            const text = el.innerText?.trim() ?? '';
            const empty = !text || html === '<br>';
            valueRef.current = empty ? '' : html;
            setIsEmpty(empty);
            onChange(empty ? '' : html);
          }}
          style={{ minHeight, padding: '0.85rem 1rem', outline: 'none', fontFamily: 'inherit', fontSize: '1rem', lineHeight: 1.65, color: '#0f172a', background: 'white', position: 'relative', zIndex: 1 }}
        />
      </div>
    </div>
  );
}

export function EmployerDashboard() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as Tab | null) ?? 'jobs';
  const initialJobId = searchParams.get('jobId') ?? '';

  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [selectedJobId, setSelectedJobId] = useState(initialJobId);
  const { state } = useUser();
  const { data: userData, refetch } = useGetEmployer();
  const { fetchJobs } = useGetJobs();
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const { update: updateProfile, loading: updateLoading, error: updateError } = useUpdateEmployerProfile();
  const { updateJob, loading: updatingJob, error: updateJobError, setError: setUpdateJobError } = useUpdateJob();
  const { deleteJob, loading: deletingJob } = useDeleteJob();
  const [refreshKey, setRefreshKey] = useState(0);
  const [appCounts, setAppCounts] = useState<Record<string, number>>({});
  const { createJob, loading: creating, error: createError, setError: setCreateError } = useCreateJob();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [createStep, setCreateStep] = useState(0);
  const [enabledQuestions, setEnabledQuestions] = useState<Record<string, boolean>>({});
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([]);
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const draftLocationRef = useRef<{ country: string; state: string; city: string } | null>(null);
  const [stepError, setStepError] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    positionSummary: '',
    keyResponsibilities: '',
    minQualifications: '',
    preferredQualifications: '',
    workArrangement: 'ONSITE',
    workSchedule: '',
    employmentType: 'FULL_TIME',
    department: 'ENGINEERING',
    status: 'OPEN',
    salaryType: 'ANNUAL',
    salaryMin: '',
    salaryMax: '',
    hourlyMin: '',
    hourlyMax: '',
    skills: '',
  });
  const [locationCountry, setLocationCountry] = useState('');
  const [locationState, setLocationState] = useState('');
  const [locationCity, setLocationCity] = useState('');
  const [countriesData, setCountriesData] = useState<CountryInfo[] | null>(null);
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [statesForCountry, setStatesForCountry] = useState<string[] | null>(null);
  const [citiesForState, setCitiesForState] = useState<string[] | null>(null);
  // Edit modal location
  const [editLocCountry, setEditLocCountry] = useState('');
  const [editLocState, setEditLocState] = useState('');
  const [editLocCity, setEditLocCity] = useState('');
  const [editStatesForCountry, setEditStatesForCountry] = useState<string[] | null>(null);
  const [editCitiesForState, setEditCitiesForState] = useState<string[] | null>(null);
  const [editingJob, setEditingJob] = useState<JobRecord | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editJobForm, setEditJobForm] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    employmentType: 'FULL_TIME',
    department: 'ENGINEERING',
    status: 'OPEN',
    salaryMin: '',
    salaryMax: '',
    skills: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    companyName: '',
    companyWebsite: '',
    industry: '',
    companySize: '',
    yourRole: '',
    companyOverview: '',
    benefitsAndOpportunities: '',
    primaryHiringNeeds: '',
  });

  const profile = (userData as Record<string, unknown> | null)?.['profile'] ?? {};
  const profileRecord = profile as Record<string, unknown>;
  const companyName = String(profileRecord['companyName'] ?? 'Your company');
  const companyWebsite = String(profileRecord['companyWebsite'] ?? 'Add website');
  const industry = String(profileRecord['industry'] ?? 'Industry');
  const companySize = String(profileRecord['companySize'] ?? 'N/A');
  const recruiterRole = String(profileRecord['yourRole'] ?? profileRecord['role'] ?? 'Recruiter');
  const companyOverview = String(profileRecord['companyOverview'] ?? 'Add a short overview so candidates know what your team does.');
  const benefits = String(profileRecord['benefitsAndOpportunities'] ?? 'Add benefits, perks, and what makes your company stand out.');

  const memoPrimaryHiringNeeds = useMemo(() => {
    const primaryHiringNeeds = profileRecord['primaryHiringNeeds'] ?? [];
    return Array.isArray(primaryHiringNeeds)
      ? primaryHiringNeeds.map(String)
      : primaryHiringNeeds ? [String(primaryHiringNeeds)] : [];
  }, [profileRecord]);

  useEffect(() => {
    let mounted = true;

    const loadJobs = async () => {
      const response = await fetchJobs({ page: 1, limit: 100 });
      if (!mounted) return;

      const payload = Array.isArray(response)
        ? response
        : Array.isArray((response as { data?: unknown[] } | null)?.data)
          ? (response as { data: JobRecord[] }).data
          : Array.isArray((response as { jobs?: unknown[] } | null)?.jobs)
            ? (response as { jobs: JobRecord[] }).jobs
            : Array.isArray((response as { items?: unknown[] } | null)?.items)
              ? (response as { items: JobRecord[] }).items
              : [];

      setJobs(payload as JobRecord[]);
      setLoadingJobs(false);
    };

    loadJobs();
    return () => { mounted = false; };
  }, [fetchJobs, refreshKey]);

  const employerJobs = useMemo(() => {
    const userId = String(state.user?.id ?? '');
    return jobs.filter((job) => {
      if (!userId) return true;
      if (job.employerId && String(job.employerId) !== userId) return false;
      return true;
    });
  }, [jobs, state.user?.id]);

  useEffect(() => {
    if (!selectedJobId && employerJobs.length > 0) {
      setSelectedJobId(String(employerJobs[0].id ?? employerJobs[0]._id ?? ''));
    }
  }, [employerJobs, selectedJobId]);

  const selectedJob = useMemo(() => {
    if (!selectedJobId) return employerJobs[0] ?? null;
    return employerJobs.find((job) => String(job.id ?? job._id ?? '') === selectedJobId) ?? employerJobs[0] ?? null;
  }, [employerJobs, selectedJobId]);

  useEffect(() => {
    if (employerJobs.length === 0) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('tm_token') : null;
    Promise.all(
      employerJobs.map(async (job) => {
        const id = String(job.id ?? job._id ?? '');
        if (!id) return [id, 0] as const;
        try {
          const res = await fetch(
            `https://trimerge-pro-career.onrender.com/api/v1/applications/job/${encodeURIComponent(id)}?page=1&limit=100`,
            { headers: { Authorization: token ? `Bearer ${token}` : '' } }
          );
          if (!res.ok) return [id, 0] as const;
          const data = await res.json().catch(() => ({}));
          const count = data?.total ?? data?.pagination?.total ?? (Array.isArray(data?.applications) ? data.applications.length : 0);
          return [id, count] as const;
        } catch {
          return [id, 0] as const;
        }
      })
    ).then((entries) => setAppCounts(Object.fromEntries(entries)));
  }, [employerJobs]);

  useEffect(() => {
    if (!userData) return;
    const profile = (userData as Record<string, unknown>)?.['profile'] ?? {};
    const p = profile as Record<string, unknown>;
    setEditForm({
      companyName: String(p['companyName'] ?? ''),
      companyWebsite: String(p['companyWebsite'] ?? ''),
      industry: String(p['industry'] ?? ''),
      companySize: String(p['companySize'] ?? ''),
      yourRole: String(p['yourRole'] ?? p['role'] ?? ''),
      companyOverview: String(p['companyOverview'] ?? ''),
      benefitsAndOpportunities: String(p['benefitsAndOpportunities'] ?? ''),
      primaryHiringNeeds: Array.isArray(p['primaryHiringNeeds'])
        ? (p['primaryHiringNeeds'] as string[]).join(', ')
        : String(p['primaryHiringNeeds'] ?? ''),
    });
  }, [userData]);

  const handleEditOpen = (job: JobRecord) => {
    setEditJobForm({
      title: job.title ?? '',
      description: job.description ?? '',
      requirements: job.requirements ?? '',
      location: job.location ?? '',
      employmentType: job.employmentType ?? 'FULL_TIME',
      department: job.department ?? 'ENGINEERING',
      status: job.status ?? 'OPEN',
      salaryMin: job.salaryMin != null ? String(job.salaryMin) : '',
      salaryMax: job.salaryMax != null ? String(job.salaryMax) : '',
      skills: Array.isArray(job.skills) ? job.skills.join(', ') : '',
    });
    // Parse existing location string (e.g. "Lagos, Ondo, Nigeria") into parts
    const parts = (job.location ?? '').split(',').map((s) => s.trim()).filter(Boolean);
    setEditLocCountry(parts[parts.length - 1] ?? '');
    setEditLocState(parts.length >= 3 ? parts[parts.length - 2] : '');
    setEditLocCity(parts.length >= 2 ? parts[0] : '');
    setEditStatesForCountry(null);
    setEditCitiesForState(null);
    setUpdateJobError(null);
    setEditingJob(job);
  };

  // Load states for edit modal when country changes
  useEffect(() => {
    if (!editingJob || !editLocCountry) return;
    setEditStatesForCountry(null);
    setEditCitiesForState(null);
    fetch('https://countriesnow.space/api/v0.1/countries/states', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country: editLocCountry }),
    })
      .then((r) => r.json())
      .then((json) => {
        const states = json?.data?.states ?? json?.data ?? null;
        if (Array.isArray(states) && states.length > 0) {
          const names: string[] = states.map((s: unknown) => typeof s === 'string' ? s : (s as Record<string, string>).name || '');
          if (editLocCountry === 'United States' && !names.includes('District of Columbia')) {
            names.push('District of Columbia');
            names.sort();
          }
          setEditStatesForCountry(names);
          if (!names.includes(editLocState)) setEditLocState(names[0] ?? '');
        } else {
          const entry = (countriesData ?? FALLBACK_COUNTRIES).find((c) => c.country === editLocCountry);
          setEditCitiesForState(entry?.cities ?? null);
          if (!editLocCity) setEditLocCity(entry?.cities?.[0] ?? '');
        }
      })
      .catch(() => {
        const entry = (countriesData ?? FALLBACK_COUNTRIES).find((c) => c.country === editLocCountry);
        setEditCitiesForState(entry?.cities ?? null);
      });
  }, [editLocCountry, editingJob, countriesData]);

  // Load cities for edit modal when state changes
  useEffect(() => {
    if (!editingJob || !editLocCountry || !editLocState) return;
    if (editLocState === 'District of Columbia') {
      setEditCitiesForState(['District of Columbia']);
      setEditLocCity('District of Columbia');
      return;
    }
    setEditCitiesForState(null);
    fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country: editLocCountry, state: editLocState }),
    })
      .then((r) => r.json())
      .then((json) => {
        const cities = json?.data ?? null;
        if (Array.isArray(cities) && cities.length > 0) {
          setEditCitiesForState(cities);
          if (!cities.includes(editLocCity)) setEditLocCity(cities[0] ?? '');
        } else {
          const entry = (countriesData ?? FALLBACK_COUNTRIES).find((c) => c.country === editLocCountry);
          setEditCitiesForState(entry?.cities ?? null);
        }
      })
      .catch(() => {
        const entry = (countriesData ?? FALLBACK_COUNTRIES).find((c) => c.country === editLocCountry);
        setEditCitiesForState(entry?.cities ?? null);
      });
  }, [editLocState, editLocCountry, editingJob, countriesData]);

  const openDraftForEdit = (job: JobRecord) => {
    const id = String(job.id ?? job._id ?? '');
    const rawDesc = job.description ?? '';
    const rawReq = job.requirements ?? '';
    const hasKeyResp = rawDesc.includes('[KEY RESPONSIBILITIES]');
    const positionSummary = hasKeyResp ? rawDesc.slice(0, rawDesc.indexOf('[KEY RESPONSIBILITIES]')).trim() : rawDesc;
    const keyResponsibilities = parseSectionFromText(rawDesc, '[KEY RESPONSIBILITIES]');
    const minQualifications = parseSectionFromText(rawReq, '[MINIMUM QUALIFICATIONS]');
    const preferredQualifications = parseSectionFromText(rawReq, '[PREFERRED QUALIFICATIONS]');

    setCreateForm({
      title: job.title ?? '',
      positionSummary,
      keyResponsibilities,
      minQualifications,
      preferredQualifications,
      workArrangement: job.workArrangement ?? 'ONSITE',
      workSchedule: (job as Record<string, unknown>).workSchedule as string ?? '',
      employmentType: job.employmentType ?? 'FULL_TIME',
      department: job.department ?? 'ENGINEERING',
      status: job.status ?? 'OPEN',
      salaryType: job.salaryType ?? 'ANNUAL',
      salaryMin: job.salaryMin != null ? String(job.salaryMin) : '',
      salaryMax: job.salaryMax != null ? String(job.salaryMax) : '',
      hourlyMin: job.hourlyMin != null ? String(job.hourlyMin) : '',
      hourlyMax: job.hourlyMax != null ? String(job.hourlyMax) : '',
      skills: Array.isArray(job.skills) ? job.skills.join(', ') : '',
    });

    const aq = Array.isArray(job.applicationQuestions) ? job.applicationQuestions : [];
    setEnabledQuestions(Object.fromEntries(aq.map((qid) => [qid, true])));
    setSelectedBenefits(Array.isArray(job.benefits) ? job.benefits : []);
    setEditingDraftId(id);
    setCreateStep(0);
    setStepError(null);
    setCreateError(null);

    // Location: parse and pre-fill via the cascading effects
    const parts = (job.location ?? '').split(',').map((s) => s.trim()).filter(Boolean);
    const country = parts[parts.length - 1] ?? '';
    const state = parts.length >= 3 ? parts[parts.length - 2] : '';
    const city = parts.length >= 2 ? parts[0] : '';
    if (country) {
      draftLocationRef.current = { country, state, city };
      if (countriesData) {
        // Countries already cached — set directly; state/city effects will cascade
        setLocationCountry(country);
      }
      // else: country-loading effect will pick up draftLocationRef when it runs
    }
    setShowCreateModal(true);
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;
    const id = String(editingJob.id ?? editingJob._id ?? '');
    const skills = editJobForm.skills.split(',').map((s) => s.trim()).filter(Boolean);
    const locationParts = [editLocCity, editLocState, editLocCountry].filter(Boolean);
    const location = locationParts.join(', ') || editJobForm.location;
    const ok = await updateJob(id, {
      ...(editJobForm.title && { title: editJobForm.title }),
      ...(editJobForm.description && { description: editJobForm.description }),
      ...(editJobForm.requirements && { requirements: editJobForm.requirements }),
      ...(location && { location }),
      employmentType: editJobForm.employmentType,
      department: editJobForm.department,
      status: editJobForm.status,
      ...(editJobForm.salaryMin && { salaryMin: Number(editJobForm.salaryMin) }),
      ...(editJobForm.salaryMax && { salaryMax: Number(editJobForm.salaryMax) }),
      ...(skills.length > 0 && { skills }),
    });
    if (ok) {
      setEditingJob(null);
      setRefreshKey((k) => k + 1);
    }
  };

  const handleDeleteConfirm = async (id: string) => {
    const ok = await deleteJob(id);
    if (ok) {
      setConfirmDeleteId(null);
      setRefreshKey((k) => k + 1);
    }
  };

  const handleSave = async () => {
    const needs = editForm.primaryHiringNeeds
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const ok = await updateProfile({
      ...(editForm.companyName && { companyName: editForm.companyName }),
      ...(editForm.companyWebsite && { companyWebsite: editForm.companyWebsite }),
      ...(editForm.industry && { industry: editForm.industry }),
      ...(editForm.companySize && { companySize: editForm.companySize }),
      ...(editForm.yourRole && { yourRole: editForm.yourRole }),
      ...(editForm.companyOverview && { companyOverview: editForm.companyOverview }),
      ...(editForm.benefitsAndOpportunities && { benefitsAndOpportunities: editForm.benefitsAndOpportunities }),
      ...(needs.length > 0 && { primaryHiringNeeds: needs }),
    });
    if (ok) {
      setIsEditing(false);
      refetch();
    }
  };

  const handleCancel = () => {
    const profile = (userData as Record<string, unknown> | null)?.['profile'] ?? {};
    const p = profile as Record<string, unknown>;
    setEditForm({
      companyName: String(p['companyName'] ?? ''),
      companyWebsite: String(p['companyWebsite'] ?? ''),
      industry: String(p['industry'] ?? ''),
      companySize: String(p['companySize'] ?? ''),
      yourRole: String(p['yourRole'] ?? p['role'] ?? ''),
      companyOverview: String(p['companyOverview'] ?? ''),
      benefitsAndOpportunities: String(p['benefitsAndOpportunities'] ?? ''),
      primaryHiringNeeds: Array.isArray(p['primaryHiringNeeds'])
        ? (p['primaryHiringNeeds'] as string[]).join(', ')
        : String(p['primaryHiringNeeds'] ?? ''),
    });
    setIsEditing(false);
  };

  // Sync location string from country/state/city selections
  useEffect(() => {
    if (!locationCountry) return;
    const parts = [locationCity, locationState, locationCountry].filter(Boolean);
    // no-op — location is assembled at submit time from these three values
    void parts;
  }, [locationCountry, locationState, locationCity]);

  // Load countries list when modal opens
  useEffect(() => {
    if (!showCreateModal) return;
    if (countriesData || countriesLoading) return;
    setCountriesLoading(true);
    fetch('https://countriesnow.space/api/v0.1/countries')
      .then((r) => r.json())
      .then((json) => {
        const list = Array.isArray(json?.data) ? json.data as CountryInfo[] : null;
        const normalized = list ?? FALLBACK_COUNTRIES;
        setCountriesData(normalized);
        const draftCountry = draftLocationRef.current?.country;
        if (draftCountry) {
          setLocationCountry(draftCountry);
          // state & city will cascade through the next two effects
        } else {
          setLocationCountry(normalized[0]?.country ?? '');
          setLocationCity((normalized[0] as { cities?: string[] })?.cities?.[0] ?? '');
        }
      })
      .catch(() => {
        setCountriesData(FALLBACK_COUNTRIES);
        setLocationCountry(FALLBACK_COUNTRIES[0].country);
        setLocationCity(FALLBACK_COUNTRIES[0].cities?.[0] ?? '');
      })
      .finally(() => setCountriesLoading(false));
  }, [showCreateModal, countriesData, countriesLoading]);

  // Load states when country changes
  useEffect(() => {
    if (!showCreateModal || !locationCountry) return;
    setStatesForCountry(null);
    setCitiesForState(null);
    setLocationState('');
    fetch('https://countriesnow.space/api/v0.1/countries/states', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country: locationCountry }),
    })
      .then((r) => r.json())
      .then((json) => {
        const states = json?.data?.states ?? json?.data ?? null;
        if (Array.isArray(states) && states.length > 0) {
          const names: string[] = states.map((s: unknown) => typeof s === 'string' ? s : (s as Record<string, string>).name || '');
          if (locationCountry === 'United States' && !names.includes('District of Columbia')) {
            names.push('District of Columbia');
            names.sort();
          }
          setStatesForCountry(names);
          const draftState = draftLocationRef.current?.state;
          setLocationState(draftState && names.includes(draftState) ? draftState : names[0] ?? '');
        } else {
          const entry = (countriesData ?? FALLBACK_COUNTRIES).find((c) => c.country === locationCountry);
          setCitiesForState(entry?.cities ?? null);
          const draftCity = draftLocationRef.current?.city;
          setLocationCity(draftCity && entry?.cities?.includes(draftCity) ? draftCity : entry?.cities?.[0] ?? '');
          draftLocationRef.current = null;
        }
      })
      .catch(() => {
        const entry = (countriesData ?? FALLBACK_COUNTRIES).find((c) => c.country === locationCountry);
        setCitiesForState(entry?.cities ?? null);
        setLocationCity(entry?.cities?.[0] ?? '');
        draftLocationRef.current = null;
      });
  }, [locationCountry, showCreateModal, countriesData]);

  // Load cities when state changes
  useEffect(() => {
    if (!showCreateModal || !locationCountry || !locationState) return;
    if (locationState === 'District of Columbia') {
      setCitiesForState(['District of Columbia']);
      setLocationCity('District of Columbia');
      draftLocationRef.current = null;
      return;
    }
    setCitiesForState(null);
    fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country: locationCountry, state: locationState }),
    })
      .then((r) => r.json())
      .then((json) => {
        const cities = json?.data ?? null;
        if (Array.isArray(cities) && cities.length > 0) {
          setCitiesForState(cities);
          const draftCity = draftLocationRef.current?.city;
          setLocationCity(draftCity && cities.includes(draftCity) ? draftCity : cities[0] ?? '');
          draftLocationRef.current = null;
        } else {
          const entry = (countriesData ?? FALLBACK_COUNTRIES).find((c) => c.country === locationCountry);
          setCitiesForState(entry?.cities ?? null);
          setLocationCity(entry?.cities?.[0] ?? '');
          draftLocationRef.current = null;
        }
      })
      .catch(() => {
        const entry = (countriesData ?? FALLBACK_COUNTRIES).find((c) => c.country === locationCountry);
        setCitiesForState(entry?.cities ?? null);
        setLocationCity(entry?.cities?.[0] ?? '');
        draftLocationRef.current = null;
      });
  }, [locationState, locationCountry, showCreateModal, countriesData]);

  const CREATE_STEPS = [
    { label: 'Basic Info',    hint: 'Role title and type' },
    { label: 'Location',      hint: 'Where is the role?' },
    { label: 'Compensation',  hint: 'Salary range' },
    { label: 'Role Details',  hint: 'Description and skills' },
    { label: 'Application',   hint: 'Screening questions' },
    { label: 'Benefits',      hint: 'Perks and benefits' },
    { label: 'Review',        hint: 'Confirm and publish' },
  ];

  const closeCreateForm = () => {
    setShowCreateModal(false);
    setShowExitConfirm(false);
    setCreateStep(0);
    setStepError(null);
    setCreateForm({ title: '', positionSummary: '', keyResponsibilities: '', minQualifications: '', preferredQualifications: '', workArrangement: 'ONSITE', workSchedule: '', employmentType: 'FULL_TIME', department: 'ENGINEERING', status: 'OPEN', salaryType: 'ANNUAL', salaryMin: '', salaryMax: '', hourlyMin: '', hourlyMax: '', skills: '' });
    setLocationCountry(''); setLocationState(''); setLocationCity('');
    setStatesForCountry(null); setCitiesForState(null);
    setEnabledQuestions({});
    setSelectedBenefits([]);
    setEditingDraftId(null);
    draftLocationRef.current = null;
    setCreateError(null);
  };

  const handleNext = () => {
    if (createStep === 0 && !createForm.title.trim()) {
      setStepError('Job title is required to continue.');
      return;
    }
    if (createStep === 3 && !createForm.positionSummary.trim()) {
      setStepError('Position summary is required to continue.');
      return;
    }
    setStepError(null);
    setCreateStep((s) => s + 1);
  };

  const handleBack = () => {
    setStepError(null);
    setCreateStep((s) => s - 1);
  };

  const buildJobPayload = (status: string) => {
    const skills = createForm.skills.split(',').map((s) => s.trim()).filter(Boolean);
    const locationParts = [locationCity, locationState, locationCountry].filter(Boolean);
    const location = locationParts.join(', ');
    const descParts = [
      createForm.positionSummary,
      createForm.keyResponsibilities ? `[KEY RESPONSIBILITIES]\n${createForm.keyResponsibilities}` : '',
    ].filter(Boolean);
    const reqParts = [
      createForm.minQualifications ? `[MINIMUM QUALIFICATIONS]\n${createForm.minQualifications}` : '',
      createForm.preferredQualifications ? `[PREFERRED QUALIFICATIONS]\n${createForm.preferredQualifications}` : '',
    ].filter(Boolean);
    return {
      title: createForm.title.trim() || 'Untitled Draft',
      description: descParts.join('\n\n'),
      requirements: reqParts.join('\n\n'),
      workArrangement: createForm.workArrangement,
      workSchedule: createForm.workSchedule,
      location,
      employmentType: createForm.employmentType,
      department: createForm.department,
      salaryType: createForm.salaryType,
      status,
      ...(createForm.salaryType !== 'HOURLY' && createForm.salaryMin && { salaryMin: Number(createForm.salaryMin) }),
      ...(createForm.salaryType !== 'HOURLY' && createForm.salaryMax && { salaryMax: Number(createForm.salaryMax) }),
      ...(createForm.salaryType !== 'ANNUAL' && createForm.hourlyMin && { hourlyMin: Number(createForm.hourlyMin) }),
      ...(createForm.salaryType !== 'ANNUAL' && createForm.hourlyMax && { hourlyMax: Number(createForm.hourlyMax) }),
      ...(skills.length > 0 && { skills }),
      ...(Object.values(enabledQuestions).some(Boolean) && {
        applicationQuestions: Object.entries(enabledQuestions).filter(([, v]) => v).map(([k]) => k),
      }),
      ...(selectedBenefits.length > 0 && { benefits: selectedBenefits }),
    };
  };

  const handlePublish = async () => {
    if (editingDraftId) {
      const ok = await updateJob(editingDraftId, buildJobPayload('OPEN'));
      if (ok) { closeCreateForm(); setRefreshKey((k) => k + 1); }
    } else {
      const res = await createJob(buildJobPayload('OPEN'));
      if (res) { closeCreateForm(); setRefreshKey((k) => k + 1); }
    }
  };

  const handleSaveAsDraft = async () => {
    if (editingDraftId) {
      const ok = await updateJob(editingDraftId, buildJobPayload('DRAFT'));
      if (ok) { closeCreateForm(); setRefreshKey((k) => k + 1); }
    } else {
      const res = await createJob(buildJobPayload('DRAFT'));
      if (res) { closeCreateForm(); setRefreshKey((k) => k + 1); }
    }
  };

  // Save edits while preserving the current job status (e.g. OPEN stays OPEN)
  const handleSaveChanges = async () => {
    if (!editingDraftId) return;
    const ok = await updateJob(editingDraftId, buildJobPayload(createForm.status || 'OPEN'));
    if (ok) { closeCreateForm(); setRefreshKey((k) => k + 1); }
  };

  const handleDiscard = () => closeCreateForm();

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createJob(buildJobPayload('OPEN'));
    if (res) { closeCreateForm(); setRefreshKey((k) => k + 1); }
  };

  return (
    <>
      <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex' }}>

        {/* Sidebar */}
        <aside style={{ width: sidebarCollapsed ? '60px' : '224px', flexShrink: 0, borderRight: '1px solid rgba(148,163,184,0.15)', background: 'white', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto', transition: 'width 0.2s ease', overflow: 'hidden' }}>

          {/* Header row: company name + collapse toggle */}
          <div style={{ padding: sidebarCollapsed ? '1rem 0' : '1.1rem 1.1rem 0.9rem', borderBottom: '1px solid rgba(148,163,184,0.1)', display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'space-between', gap: '0.5rem', minHeight: '60px' }}>
            {!sidebarCollapsed && (
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{companyName}</div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.15rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{recruiterRole}</div>
              </div>
            )}
            <button
              type="button"
              onClick={() => setSidebarCollapsed((c) => !c)}
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              style={{ padding: '0.35rem', borderRadius: '6px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8', display: 'grid', placeItems: 'center', flexShrink: 0 }}
            >
              {sidebarCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
            </button>
          </div>

          {/* Nav */}
          <nav style={{ padding: sidebarCollapsed ? '0.65rem 0.5rem' : '0.65rem 0.6rem', flex: 1 }}>
            {tabMeta.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  title={sidebarCollapsed ? tab.label : undefined}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                    gap: '0.55rem', width: '100%',
                    padding: sidebarCollapsed ? '0.65rem' : '0.6rem 0.75rem',
                    marginBottom: '0.15rem', borderRadius: '8px', border: 'none',
                    background: isActive ? '#eff6ff' : 'transparent',
                    color: isActive ? '#1d4ed8' : '#475569',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.875rem', cursor: 'pointer', textAlign: 'left',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Icon size={15} />
                  {!sidebarCollapsed && tab.label}
                </button>
              );
            })}
          </nav>

        </aside>

        {/* Content */}
        <main style={{ flex: 1, minWidth: 0, padding: '2rem 2.5rem', overflowY: 'auto' }}>

          {/* Jobs tab */}
          {activeTab === 'jobs' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.1rem', gap: '0.75rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Your job postings</h2>
                <button
                  type="button"
                  onClick={() => { setCreateError(null); setShowCreateModal(true); }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #07172e, #1d4ed8)', color: 'white', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', flexShrink: 0 }}
                >
                  <Plus size={14} />
                  Post a Job
                </button>
              </div>

              {loadingJobs ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading jobs...</div>
              ) : employerJobs.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', background: 'white', borderRadius: '14px', border: '1px solid rgba(148,163,184,0.15)' }}>No employer jobs found yet.</div>
              ) : (
                <div style={{ display: 'grid', gap: '0.55rem' }}>
                  {employerJobs.map((job, index) => {
                    const jobId = String(job.id ?? job._id ?? `${index}`);
                    const statusColors: Record<string, { bg: string; color: string }> = {
                      OPEN: { bg: '#dcfce7', color: '#166534' },
                      DRAFT: { bg: '#fef9c3', color: '#854d0e' },
                      CLOSED: { bg: '#fee2e2', color: '#991b1b' },
                    };
                    const statusStyle = statusColors[String(job.status ?? '').toUpperCase()] ?? { bg: '#f1f5f9', color: '#475569' };
                    const isConfirming = confirmDeleteId === jobId;

                    return (
                      <div key={jobId} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', padding: '0.85rem 1rem', background: 'white', borderRadius: '12px', border: '1px solid rgba(148,163,184,0.15)' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>{job.title ?? 'Untitled job'}</span>
                            <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '999px', background: statusStyle.bg, color: statusStyle.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                              {job.status ?? 'OPEN'}
                            </span>
                          </div>
                          <div style={{ color: '#94a3b8', marginTop: '0.2rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>{job.department ?? 'General'} · {job.location ?? 'Remote'}</span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                              <span style={{ width: '3px', height: '3px', borderRadius: '999px', background: '#cbd5e1', display: 'inline-block' }} />
                              <Users size={11} />
                              {appCounts[jobId] != null ? `${appCounts[jobId]} applicant${appCounts[jobId] === 1 ? '' : 's'}` : '—'}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
                          {isConfirming ? (
                            <>
                              <span style={{ fontSize: '0.8rem', color: '#991b1b', fontWeight: 700, whiteSpace: 'nowrap' }}>Delete?</span>
                              <button type="button" onClick={() => setConfirmDeleteId(null)} style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem', borderRadius: '8px', border: '1px solid rgba(148,163,184,0.3)', background: 'transparent', cursor: 'pointer', fontWeight: 600 }}>
                                Cancel
                              </button>
                              <button type="button" onClick={() => handleDeleteConfirm(jobId)} disabled={deletingJob} style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem', borderRadius: '8px', border: 'none', background: '#991b1b', color: 'white', cursor: deletingJob ? 'not-allowed' : 'pointer', fontWeight: 600 }}>
                                {deletingJob ? '…' : 'Delete'}
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                title="View applications"
                                onClick={() => { setSelectedJobId(jobId); setActiveTab('applications'); }}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 600, padding: '0.35rem 0.65rem', borderRadius: '8px', border: '1px solid rgba(148,163,184,0.2)', background: '#f8fafc', color: '#64748b', cursor: 'pointer' }}
                              >
                                <Users size={12} />
                                Applications
                              </button>
                              <button
                                type="button"
                                title="Edit job"
                                onClick={() => openDraftForEdit(job)}
                                style={{ padding: '0.38rem', borderRadius: '8px', border: '1px solid rgba(148,163,184,0.2)', background: '#f8fafc', color: '#64748b', cursor: 'pointer', display: 'grid', placeItems: 'center' }}
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                type="button"
                                title="Delete job"
                                onClick={() => setConfirmDeleteId(jobId)}
                                style={{ padding: '0.38rem', borderRadius: '8px', border: '1px solid rgba(254,202,202,0.5)', background: '#fff5f5', color: '#dc2626', cursor: 'pointer', display: 'grid', placeItems: 'center' }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Applications tab */}
          {activeTab === 'applications' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(15rem, 18rem) 1fr', gap: '1.25rem', alignItems: 'start' }}>
              <div style={{ position: 'sticky', top: '1rem' }}>
                <p style={{ margin: '0 0 0.65rem', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Select a job</p>
                <div style={{ display: 'grid', gap: '0.45rem' }}>
                  {employerJobs.length === 0 ? (
                    <div style={{ color: '#94a3b8', fontSize: '0.88rem' }}>No jobs available yet.</div>
                  ) : employerJobs.map((job, index) => {
                    const jobId = String(job.id ?? job._id ?? `${index}`);
                    const isActive = selectedJobId ? selectedJobId === jobId : index === 0;
                    return (
                      <button
                        key={jobId}
                        type="button"
                        onClick={() => setSelectedJobId(jobId)}
                        style={{
                          textAlign: 'left',
                          padding: '0.75rem 0.9rem',
                          borderRadius: '10px',
                          border: isActive ? '1px solid rgba(29,78,216,0.3)' : '1px solid rgba(148,163,184,0.15)',
                          background: isActive ? 'rgba(29,78,216,0.06)' : 'white',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.88rem' }}>{job.title ?? 'Untitled job'}</div>
                        <div style={{ marginTop: '0.2rem', color: '#94a3b8', fontSize: '0.78rem' }}>{job.department ?? 'General'} · {job.location ?? 'Remote'}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                {selectedJob ? (
                  <CandidateOverviewClient jobId={String(selectedJob.id ?? selectedJob._id ?? '')} />
                ) : (
                  <div style={{ padding: '2rem', background: 'white', borderRadius: '14px', border: '1px solid rgba(148,163,184,0.15)', color: '#94a3b8', fontSize: '0.9rem' }}>
                    Select a job on the left to load applicants.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Company tab */}
          {activeTab === 'company' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                  {isEditing ? 'Edit company profile' : 'Company profile'}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                  {updateError && <span style={{ color: '#b91c1c', fontWeight: 700, fontSize: '0.85rem' }}>{updateError}</span>}
                  {isEditing ? (
                    <>
                      <button type="button" onClick={handleCancel} className="tp-btn-secondary" style={{ cursor: 'pointer', fontSize: '0.85rem' }}>Cancel</button>
                      <button type="button" onClick={handleSave} disabled={updateLoading} className="tp-btn-primary" style={{ cursor: updateLoading ? 'not-allowed' : 'pointer', fontSize: '0.85rem' }}>
                        {updateLoading ? 'Saving…' : 'Save changes'}
                      </button>
                    </>
                  ) : (
                    <button type="button" onClick={() => setIsEditing(true)} className="tp-btn-secondary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                      <Pencil size={13} />
                      Edit
                    </button>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(20rem, 1fr))', gap: '1.25rem', alignItems: 'start' }}>
                {/* Left: identity + details */}
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div style={{ padding: '1.25rem', background: 'white', borderRadius: '16px', border: '1px solid rgba(148,163,184,0.15)' }}>
                    <p style={{ margin: '0 0 0.75rem', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Identity</p>
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                      {[
                        { label: 'Company name', editKey: 'companyName' as const, viewVal: companyName, editable: true },
                        { label: 'Role / title', editKey: 'yourRole' as const, viewVal: recruiterRole, editable: true },
                      ].map(({ label, editKey, viewVal, editable }) => (
                        <div key={label} style={{ display: 'grid', gap: '0.25rem' }}>
                          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>{label}</label>
                          {isEditing && editable ? (
                            <input value={editForm[editKey]} onChange={(e) => setEditForm((p) => ({ ...p, [editKey]: e.target.value }))} placeholder={label} style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid rgba(148,163,184,0.25)', fontSize: '0.92rem', fontFamily: 'inherit' }} />
                          ) : (
                            <div style={{ fontSize: '0.92rem', color: '#0f172a', fontWeight: 500 }}>{viewVal}</div>
                          )}
                        </div>
                      ))}
                      <div style={{ display: 'grid', gap: '0.25rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>Full name</label>
                        <div style={{ fontSize: '0.92rem', color: '#475569' }}>{`${state.user?.profile?.firstName ?? ''} ${state.user?.profile?.lastName ?? ''}`.trim() || 'Unknown'}</div>
                      </div>
                      <div style={{ display: 'grid', gap: '0.25rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>Email</label>
                        <div style={{ fontSize: '0.92rem', color: '#475569' }}>{state.user?.email ?? 'Unknown'}</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '1.25rem', background: 'white', borderRadius: '16px', border: '1px solid rgba(148,163,184,0.15)' }}>
                    <p style={{ margin: '0 0 0.75rem', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Details</p>
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                      <div style={{ display: 'grid', gap: '0.25rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>Website</label>
                        {isEditing ? (
                          <input value={editForm.companyWebsite} onChange={(e) => setEditForm((p) => ({ ...p, companyWebsite: e.target.value }))} placeholder="https://www.company.com" style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid rgba(148,163,184,0.25)', fontSize: '0.92rem', fontFamily: 'inherit' }} />
                        ) : (
                          <div style={{ fontSize: '0.92rem', color: '#475569' }}>{companyWebsite}</div>
                        )}
                      </div>
                      <div style={{ display: 'grid', gap: '0.25rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>Industry</label>
                        {isEditing ? (
                          <Select value={editForm.industry} onValueChange={(v) => setEditForm((p) => ({ ...p, industry: v }))} ariaLabel="Industry" placeholder="Select industry" options={COMPANY_INDUSTRY_OPTIONS.map((v) => ({ value: v, label: v }))} triggerClassName="tp-card" triggerStyle={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid rgba(148,163,184,0.25)' }} />
                        ) : (
                          <div style={{ fontSize: '0.92rem', color: '#475569' }}>{industry}</div>
                        )}
                      </div>
                      <div style={{ display: 'grid', gap: '0.25rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>Company size</label>
                        {isEditing ? (
                          <Select value={editForm.companySize} onValueChange={(v) => setEditForm((p) => ({ ...p, companySize: v }))} ariaLabel="Company size" placeholder="Select company size" options={COMPANY_SIZE_OPTIONS.map((v) => ({ value: v, label: `${v} employees` }))} triggerClassName="tp-card" triggerStyle={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid rgba(148,163,184,0.25)' }} />
                        ) : (
                          <div style={{ fontSize: '0.92rem', color: '#475569' }}>{`${companySize} people`}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: narrative */}
                <div style={{ padding: '1.25rem', background: 'white', borderRadius: '16px', border: '1px solid rgba(148,163,184,0.15)' }}>
                  <p style={{ margin: '0 0 0.75rem', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>About</p>
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    <div style={{ display: 'grid', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>Company overview</label>
                      {isEditing ? (
                        <textarea value={editForm.companyOverview} onChange={(e) => setEditForm((p) => ({ ...p, companyOverview: e.target.value }))} placeholder="Describe your company..." rows={4} style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid rgba(148,163,184,0.25)', resize: 'vertical', fontFamily: 'inherit', fontSize: '0.92rem' }} />
                      ) : (
                        <p style={{ margin: 0, color: '#475569', lineHeight: 1.65, fontSize: '0.92rem' }}>{companyOverview}</p>
                      )}
                    </div>
                    <div style={{ display: 'grid', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>Primary hiring needs</label>
                      {isEditing ? (
                        <input value={editForm.primaryHiringNeeds} onChange={(e) => setEditForm((p) => ({ ...p, primaryHiringNeeds: e.target.value }))} placeholder="e.g. Engineering, Design, Sales (comma-separated)" style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid rgba(148,163,184,0.25)', fontSize: '0.92rem', fontFamily: 'inherit' }} />
                      ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                          {memoPrimaryHiringNeeds.length > 0 ? memoPrimaryHiringNeeds.map((need) => (
                            <span key={need} className="tp-chip" style={{ background: '#dbeafe', fontSize: '0.8rem' }}>{need}</span>
                          )) : (
                            <span style={{ color: '#94a3b8', fontSize: '0.88rem' }}>No hiring needs added yet.</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'grid', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>Benefits & opportunities</label>
                      {isEditing ? (
                        <textarea value={editForm.benefitsAndOpportunities} onChange={(e) => setEditForm((p) => ({ ...p, benefitsAndOpportunities: e.target.value }))} placeholder="Describe benefits, perks, and what makes your company stand out..." rows={4} style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid rgba(148,163,184,0.25)', resize: 'vertical', fontFamily: 'inherit', fontSize: '0.92rem' }} />
                      ) : (
                        <p style={{ margin: 0, color: '#475569', lineHeight: 1.65, fontSize: '0.92rem' }}>{benefits}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Edit job modal */}
      {editingJob && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.48)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2rem', zIndex: 2000, overflowY: 'auto' }}>
          <div className="tp-card-soft" style={{ width: '100%', maxWidth: '640px', borderRadius: '20px', padding: '1.75rem', background: 'white', boxShadow: '0 40px 100px rgba(2,6,23,0.26)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <div className="tp-kicker">Editing</div>
                <h2 style={{ margin: '0.25rem 0 0', fontSize: '1.6rem', letterSpacing: '-0.04em' }}>{editingJob.title ?? 'Untitled job'}</h2>
              </div>
              <button type="button" onClick={() => setEditingJob(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--tp-muted)', padding: '0.25rem', borderRadius: '8px', display: 'grid', placeItems: 'center' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSave} style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div style={{ gridColumn: '1 / span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--tp-muted)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Job title</label>
                  <input required value={editJobForm.title} onChange={(e) => setEditJobForm((p) => ({ ...p, title: e.target.value }))} placeholder="Job title" className="tp-card" style={{ width: '100%', boxSizing: 'border-box', padding: '0.85rem 0.95rem', borderRadius: '12px', border: '1px solid rgba(148,163,184,0.2)' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--tp-muted)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Department</label>
                  <select value={editJobForm.department} onChange={(e) => setEditJobForm((p) => ({ ...p, department: e.target.value }))} style={{ width: '100%', padding: '0.85rem 0.95rem', borderRadius: '12px', border: '1px solid rgba(148,163,184,0.2)', background: '#f8fafc', cursor: 'pointer', fontSize: '1rem' }}>
                    {['ENGINEERING', 'MARKETING', 'HR', 'SALES', 'DESIGN'].map((d) => (
                      <option key={d} value={d}>{d.charAt(0) + d.slice(1).toLowerCase()}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--tp-muted)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Employment type</label>
                  <select value={editJobForm.employmentType} onChange={(e) => setEditJobForm((p) => ({ ...p, employmentType: e.target.value }))} style={{ width: '100%', padding: '0.85rem 0.95rem', borderRadius: '12px', border: '1px solid rgba(148,163,184,0.2)', background: '#f8fafc', cursor: 'pointer', fontSize: '1rem' }}>
                    <option value="FULL_TIME">Full time</option>
                    <option value="PART_TIME">Part time</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="INTERNSHIP">Internship</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--tp-muted)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Status</label>
                  <select value={editJobForm.status} onChange={(e) => setEditJobForm((p) => ({ ...p, status: e.target.value }))} style={{ width: '100%', padding: '0.85rem 0.95rem', borderRadius: '12px', border: '1px solid rgba(148,163,184,0.2)', background: '#f8fafc', cursor: 'pointer', fontSize: '1rem' }}>
                    <option value="OPEN">Open</option>
                    <option value="DRAFT">Draft</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>

                {/* Location: country → state → city */}
                <div style={{ gridColumn: '1 / span 2', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div style={{ gridColumn: '1 / span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Country</label>
                    <select
                      value={editLocCountry}
                      onChange={(e) => { setEditLocCountry(e.target.value); setEditLocState(''); setEditCitiesForState(null); setEditLocCity(''); }}
                      disabled={countriesLoading}
                      style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid rgba(148,163,184,0.25)', background: 'white', fontSize: '0.95rem', cursor: 'pointer' }}
                    >
                      {countriesLoading && <option>Loading countries…</option>}
                      {(countriesData ?? FALLBACK_COUNTRIES).map((c) => (
                        <option key={c.country} value={c.country}>{c.country}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.07em' }}>State / Province</label>
                    {editStatesForCountry ? (
                      <select value={editLocState} onChange={(e) => setEditLocState(e.target.value)} style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid rgba(148,163,184,0.25)', background: 'white', fontSize: '0.95rem', cursor: 'pointer' }}>
                        {editStatesForCountry.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    ) : (
                      <select value={editLocCity} onChange={(e) => setEditLocCity(e.target.value)} style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid rgba(148,163,184,0.25)', background: 'white', fontSize: '0.95rem', cursor: 'pointer' }}>
                        {((countriesData ?? FALLBACK_COUNTRIES).find((c) => c.country === editLocCountry)?.cities ?? []).map((ct) => (
                          <option key={ct} value={ct}>{ct}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  {editStatesForCountry && (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.07em' }}>City</label>
                      <select value={editLocCity} onChange={(e) => setEditLocCity(e.target.value)} style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid rgba(148,163,184,0.25)', background: 'white', fontSize: '0.95rem', cursor: 'pointer' }}>
                        {(editCitiesForState ?? []).map((ct) => <option key={ct} value={ct}>{ct}</option>)}
                      </select>
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--tp-muted)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Salary min</label>
                  <input type="number" value={editJobForm.salaryMin} onChange={(e) => setEditJobForm((p) => ({ ...p, salaryMin: e.target.value }))} placeholder="e.g. 60000" className="tp-card" style={{ width: '100%', boxSizing: 'border-box', padding: '0.85rem 0.95rem', borderRadius: '12px', border: '1px solid rgba(148,163,184,0.2)' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--tp-muted)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Salary max</label>
                  <input type="number" value={editJobForm.salaryMax} onChange={(e) => setEditJobForm((p) => ({ ...p, salaryMax: e.target.value }))} placeholder="e.g. 90000" className="tp-card" style={{ width: '100%', boxSizing: 'border-box', padding: '0.85rem 0.95rem', borderRadius: '12px', border: '1px solid rgba(148,163,184,0.2)' }} />
                </div>

                <div style={{ gridColumn: '1 / span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--tp-muted)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Skills <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(comma-separated)</span></label>
                  <input value={editJobForm.skills} onChange={(e) => setEditJobForm((p) => ({ ...p, skills: e.target.value }))} placeholder="e.g. React, TypeScript, Node.js" className="tp-card" style={{ width: '100%', boxSizing: 'border-box', padding: '0.85rem 0.95rem', borderRadius: '12px', border: '1px solid rgba(148,163,184,0.2)' }} />
                </div>

                <div style={{ gridColumn: '1 / span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--tp-muted)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Description</label>
                  <textarea required value={editJobForm.description} onChange={(e) => setEditJobForm((p) => ({ ...p, description: e.target.value }))} placeholder="Job description..." rows={4} style={{ width: '100%', boxSizing: 'border-box', padding: '0.85rem 0.95rem', borderRadius: '12px', border: '1px solid rgba(148,163,184,0.2)', background: '#f8fafc', resize: 'vertical', fontFamily: 'inherit', fontSize: '1rem' }} />
                </div>

                <div style={{ gridColumn: '1 / span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--tp-muted)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Requirements</label>
                  <textarea value={editJobForm.requirements} onChange={(e) => setEditJobForm((p) => ({ ...p, requirements: e.target.value }))} placeholder="Requirements..." rows={3} style={{ width: '100%', boxSizing: 'border-box', padding: '0.85rem 0.95rem', borderRadius: '12px', border: '1px solid rgba(148,163,184,0.2)', background: '#f8fafc', resize: 'vertical', fontFamily: 'inherit', fontSize: '1rem' }} />
                </div>
              </div>

              {updateJobError && (
                <div style={{ color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', padding: '0.75rem 1rem', borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem' }}>{updateJobError}</div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
                <button type="button" onClick={() => setEditingJob(null)} className="tp-btn-secondary" style={{ cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={updatingJob} className="tp-btn-primary" style={{ cursor: updatingJob ? 'not-allowed' : 'pointer' }}>
                  {updatingJob ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full-screen Post a Job — multi-step wizard */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'white', zIndex: 2000, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Top bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2.5rem', borderBottom: '1px solid rgba(148,163,184,0.12)', background: 'white', flexShrink: 0 }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{companyName}</p>
              <h1 style={{ margin: '0.1rem 0 0', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>
                {editingDraftId ? (createForm.status === 'DRAFT' ? 'Edit Draft' : 'Edit Job') : 'Post a Job'}
              </h1>
            </div>
            <button type="button" onClick={() => setShowExitConfirm(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(148,163,184,0.3)', background: 'transparent', color: '#475569', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
              <X size={14} /> Exit
            </button>
          </div>

          {/* Step progress bar */}
          <div style={{ padding: '0 2.5rem', borderBottom: '1px solid rgba(148,163,184,0.1)', background: 'white', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 0, maxWidth: 860, margin: '0 auto' }}>
              {CREATE_STEPS.map((step, i) => {
                const done = i < createStep;
                const active = i === createStep;
                return (
                  <div key={i} style={{ flex: 1, padding: '0.85rem 0.5rem 0', textAlign: 'center', borderBottom: active ? '2px solid #1d4ed8' : done ? '2px solid #86efac' : '2px solid transparent', transition: 'border-color 0.2s' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: '999px', background: done ? '#dcfce7' : active ? '#1d4ed8' : '#f1f5f9', color: done ? '#166534' : active ? 'white' : '#94a3b8', fontSize: '0.65rem', fontWeight: 800, marginBottom: '0.3rem' }}>
                      {done ? '✓' : i + 1}
                    </div>
                    <div style={{ fontSize: '0.72rem', fontWeight: active ? 700 : 500, color: active ? '#0f172a' : done ? '#166534' : '#94a3b8', whiteSpace: 'nowrap' }}>{step.label}</div>
                    <div style={{ fontSize: '0.62rem', color: '#cbd5e1', marginBottom: '0.6rem' }}>{step.hint}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '2.5rem 2.5rem', background: '#f8fafc', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
            <div style={{ width: '100%', maxWidth: (createStep === 3 || createStep === 5) ? '960px' : '620px', transition: 'max-width 0.25s ease' }}>

              {/* Step 0 — Basic Info */}
              {createStep === 0 && (
                <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', border: '1px solid rgba(148,163,184,0.15)', boxShadow: '0 4px 24px -8px rgba(15,23,42,0.07)' }}>
                  <h2 style={{ margin: '0 0 0.35rem', fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>What role are you hiring for?</h2>
                  <p style={{ margin: '0 0 1.75rem', color: '#64748b', fontSize: '0.92rem' }}>Start with the job title and basic classification.</p>
                  <div style={{ display: 'grid', gap: '1.1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Job title *</label>
                      <input value={createForm.title} onChange={(e) => setCreateForm((p) => ({ ...p, title: e.target.value }))} placeholder="e.g. Senior Software Engineer" style={{ width: '100%', boxSizing: 'border-box', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid rgba(148,163,184,0.25)', fontSize: '1rem', fontFamily: 'inherit' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Department</label>
                        <select value={createForm.department} onChange={(e) => setCreateForm((p) => ({ ...p, department: e.target.value }))} style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid rgba(148,163,184,0.25)', background: 'white', fontSize: '1rem', cursor: 'pointer' }}>
                          {['ENGINEERING','MARKETING','HR','SALES','DESIGN','OPERATIONS'].map((d) => (
                            <option key={d} value={d}>{d.charAt(0) + d.slice(1).toLowerCase()}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Employment type</label>
                        <select value={createForm.employmentType} onChange={(e) => setCreateForm((p) => ({ ...p, employmentType: e.target.value }))} style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid rgba(148,163,184,0.25)', background: 'white', fontSize: '1rem', cursor: 'pointer' }}>
                          <option value="FULL_TIME">Full time</option>
                          <option value="PART_TIME">Part time</option>
                          <option value="CONTRACT">Contract</option>
                          <option value="INTERNSHIP">Internship</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: '0.55rem', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Work arrangement</label>
                      <div style={{ display: 'flex', gap: '0.6rem' }}>
                        {[
                          { value: 'ONSITE', label: 'Onsite' },
                          { value: 'HYBRID', label: 'Hybrid' },
                          { value: 'REMOTE', label: 'Remote' },
                        ].map(({ value, label }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setCreateForm((p) => ({ ...p, workArrangement: value }))}
                            style={{
                              flex: 1,
                              padding: '0.7rem 0.5rem',
                              borderRadius: '10px',
                              border: createForm.workArrangement === value ? '2px solid #1d4ed8' : '1px solid rgba(148,163,184,0.25)',
                              background: createForm.workArrangement === value ? 'rgba(29,78,216,0.06)' : 'white',
                              color: createForm.workArrangement === value ? '#1d4ed8' : '#64748b',
                              fontWeight: createForm.workArrangement === value ? 700 : 500,
                              fontSize: '0.88rem',
                              cursor: 'pointer',
                              transition: 'all 0.15s',
                            }}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Work schedule</label>
                      <select
                        value={createForm.workSchedule}
                        onChange={(e) => setCreateForm((p) => ({ ...p, workSchedule: e.target.value }))}
                        style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid rgba(148,163,184,0.25)', background: 'white', fontSize: '1rem', cursor: 'pointer', color: createForm.workSchedule ? '#0f172a' : '#94a3b8' }}
                      >
                        <option value="">Select a schedule (optional)</option>
                        <option value="Monday–Friday">Monday–Friday</option>
                        <option value="Flexible">Flexible</option>
                        <option value="As Required">As Required</option>
                        <option value="40 Hours per Week">40 Hours per Week</option>
                        <option value="20 Hours per Week">20 Hours per Week</option>
                        <option value="Rotating Shift">Rotating Shift</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1 — Location */}
              {createStep === 1 && (
                <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', border: '1px solid rgba(148,163,184,0.15)', boxShadow: '0 4px 24px -8px rgba(15,23,42,0.07)' }}>
                  <h2 style={{ margin: '0 0 0.35rem', fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>Where is the role located?</h2>
                  <p style={{ margin: '0 0 1.75rem', color: '#64748b', fontSize: '0.92rem' }}>Select the country, state, and city for this position.</p>
                  <div style={{ display: 'grid', gap: '1.1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Country</label>
                      <select value={locationCountry} onChange={(e) => { setLocationCountry(e.target.value); setLocationState(''); setCitiesForState(null); setLocationCity(''); }} disabled={countriesLoading} style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid rgba(148,163,184,0.25)', background: 'white', fontSize: '1rem', cursor: 'pointer' }}>
                        {countriesLoading && <option>Loading countries…</option>}
                        {(countriesData ?? FALLBACK_COUNTRIES).map((c) => <option key={c.country} value={c.country}>{c.country}</option>)}
                      </select>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.07em' }}>State / Province</label>
                        {statesForCountry ? (
                          <select value={locationState} onChange={(e) => setLocationState(e.target.value)} style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid rgba(148,163,184,0.25)', background: 'white', fontSize: '1rem', cursor: 'pointer' }}>
                            {statesForCountry.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        ) : (
                          <select value={locationCity} onChange={(e) => setLocationCity(e.target.value)} style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid rgba(148,163,184,0.25)', background: 'white', fontSize: '1rem', cursor: 'pointer' }}>
                            {((countriesData ?? FALLBACK_COUNTRIES).find((c) => c.country === locationCountry)?.cities ?? []).map((ct) => <option key={ct} value={ct}>{ct}</option>)}
                          </select>
                        )}
                      </div>
                      {statesForCountry && (
                        <div>
                          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.07em' }}>City</label>
                          <select value={locationCity} onChange={(e) => setLocationCity(e.target.value)} style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid rgba(148,163,184,0.25)', background: 'white', fontSize: '1rem', cursor: 'pointer' }}>
                            {(citiesForState ?? []).map((ct) => <option key={ct} value={ct}>{ct}</option>)}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2 — Compensation */}
              {createStep === 2 && (
                <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', border: '1px solid rgba(148,163,184,0.15)', boxShadow: '0 4px 24px -8px rgba(15,23,42,0.07)' }}>
                  <h2 style={{ margin: '0 0 0.35rem', fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>What&apos;s the compensation?</h2>
                  <p style={{ margin: '0 0 1.75rem', color: '#64748b', fontSize: '0.92rem' }}>Choose how you want to display compensation, then enter the range.</p>
                  <div style={{ display: 'grid', gap: '1.4rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: '0.55rem', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Salary type</label>
                      <div style={{ display: 'flex', gap: '0.6rem' }}>
                        {[
                          { value: 'ANNUAL', label: 'Annual' },
                          { value: 'HOURLY', label: 'Hourly' },
                          { value: 'BOTH', label: 'Both' },
                        ].map(({ value, label }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setCreateForm((p) => ({ ...p, salaryType: value }))}
                            style={{
                              flex: 1,
                              padding: '0.7rem 0.5rem',
                              borderRadius: '10px',
                              border: createForm.salaryType === value ? '2px solid #1d4ed8' : '1px solid rgba(148,163,184,0.25)',
                              background: createForm.salaryType === value ? 'rgba(29,78,216,0.06)' : 'white',
                              color: createForm.salaryType === value ? '#1d4ed8' : '#64748b',
                              fontWeight: createForm.salaryType === value ? 700 : 500,
                              fontSize: '0.88rem',
                              cursor: 'pointer',
                              transition: 'all 0.15s',
                            }}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {createForm.salaryType !== 'HOURLY' && (
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: '0.55rem', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Annual salary range</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.35rem' }}>Minimum</label>
                            <div style={{ position: 'relative' }}>
                              <span style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontWeight: 600, fontSize: '0.95rem' }}>$</span>
                              <input type="number" value={createForm.salaryMin} onChange={(e) => setCreateForm((p) => ({ ...p, salaryMin: e.target.value }))} placeholder="e.g. 145000" style={{ width: '100%', boxSizing: 'border-box', padding: '0.85rem 1rem 0.85rem 1.75rem', borderRadius: '10px', border: '1px solid rgba(148,163,184,0.25)', fontSize: '1rem', fontFamily: 'inherit' }} />
                            </div>
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.35rem' }}>Maximum</label>
                            <div style={{ position: 'relative' }}>
                              <span style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontWeight: 600, fontSize: '0.95rem' }}>$</span>
                              <input type="number" value={createForm.salaryMax} onChange={(e) => setCreateForm((p) => ({ ...p, salaryMax: e.target.value }))} placeholder="e.g. 175000" style={{ width: '100%', boxSizing: 'border-box', padding: '0.85rem 1rem 0.85rem 1.75rem', borderRadius: '10px', border: '1px solid rgba(148,163,184,0.25)', fontSize: '1rem', fontFamily: 'inherit' }} />
                            </div>
                          </div>
                        </div>
                        {(createForm.salaryMin || createForm.salaryMax) && (
                          <p style={{ margin: '0.6rem 0 0', fontSize: '0.82rem', color: '#475569' }}>
                            Preview: <strong>${Number(createForm.salaryMin || 0).toLocaleString()}–${Number(createForm.salaryMax || 0).toLocaleString()} annually</strong>
                          </p>
                        )}
                      </div>
                    )}

                    {createForm.salaryType !== 'ANNUAL' && (
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: '0.55rem', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Hourly rate range</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.35rem' }}>Minimum</label>
                            <div style={{ position: 'relative' }}>
                              <span style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontWeight: 600, fontSize: '0.95rem' }}>$</span>
                              <input type="number" value={createForm.hourlyMin} onChange={(e) => setCreateForm((p) => ({ ...p, hourlyMin: e.target.value }))} placeholder="e.g. 70" style={{ width: '100%', boxSizing: 'border-box', padding: '0.85rem 1rem 0.85rem 1.75rem', borderRadius: '10px', border: '1px solid rgba(148,163,184,0.25)', fontSize: '1rem', fontFamily: 'inherit' }} />
                            </div>
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.35rem' }}>Maximum</label>
                            <div style={{ position: 'relative' }}>
                              <span style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontWeight: 600, fontSize: '0.95rem' }}>$</span>
                              <input type="number" value={createForm.hourlyMax} onChange={(e) => setCreateForm((p) => ({ ...p, hourlyMax: e.target.value }))} placeholder="e.g. 85" style={{ width: '100%', boxSizing: 'border-box', padding: '0.85rem 1rem 0.85rem 1.75rem', borderRadius: '10px', border: '1px solid rgba(148,163,184,0.25)', fontSize: '1rem', fontFamily: 'inherit' }} />
                            </div>
                          </div>
                        </div>
                        {(createForm.hourlyMin || createForm.hourlyMax) && (
                          <p style={{ margin: '0.6rem 0 0', fontSize: '0.82rem', color: '#475569' }}>
                            Preview: <strong>${Number(createForm.hourlyMin || 0).toLocaleString()}–${Number(createForm.hourlyMax || 0).toLocaleString()} per hour</strong>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3 — Role Details */}
              {createStep === 3 && (
                <div style={{ background: 'white', borderRadius: '20px', padding: '2rem 2.5rem', border: '1px solid rgba(148,163,184,0.15)', boxShadow: '0 4px 24px -8px rgba(15,23,42,0.07)' }}>
                  <h2 style={{ margin: '0 0 0.35rem', fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>Describe the role</h2>
                  <p style={{ margin: '0 0 1.75rem', color: '#64748b', fontSize: '0.92rem' }}>Fill in each section to give candidates a clear picture of the opportunity. Use the toolbar to bold key points, add bullet lists, or structure with paragraphs.</p>

                  {/* Top row: Position Summary full-width */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Position Summary *</label>
                    <RichTextArea
                      value={createForm.positionSummary}
                      onChange={(html) => setCreateForm((p) => ({ ...p, positionSummary: html }))}
                      placeholder="Provide a brief overview of the role, its purpose, and how it fits within the team..."
                      minHeight={160}
                    />
                  </div>

                  {/* Middle row: Key Responsibilities full-width */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Key Responsibilities</label>
                    <RichTextArea
                      value={createForm.keyResponsibilities}
                      onChange={(html) => setCreateForm((p) => ({ ...p, keyResponsibilities: html }))}
                      placeholder="List the main duties and day-to-day responsibilities for this position..."
                      minHeight={180}
                    />
                  </div>

                  {/* Minimum Qualifications */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Minimum Qualifications</label>
                    <RichTextArea
                      value={createForm.minQualifications}
                      onChange={(html) => setCreateForm((p) => ({ ...p, minQualifications: html }))}
                      placeholder="Required education, years of experience, certifications..."
                      minHeight={160}
                    />
                  </div>

                  {/* Preferred Qualifications */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Preferred Qualifications</label>
                    <RichTextArea
                      value={createForm.preferredQualifications}
                      onChange={(html) => setCreateForm((p) => ({ ...p, preferredQualifications: html }))}
                      placeholder="Nice-to-have skills or background that would set a candidate apart..."
                      minHeight={160}
                    />
                  </div>

                  {/* Skills */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Skills <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(comma-separated)</span></label>
                    <input value={createForm.skills} onChange={(e) => setCreateForm((p) => ({ ...p, skills: e.target.value }))} placeholder="e.g. React, TypeScript, Node.js" style={{ width: '100%', boxSizing: 'border-box', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid rgba(148,163,184,0.25)', fontSize: '1rem', fontFamily: 'inherit' }} />
                  </div>
                </div>
              )}

              {/* Step 4 — Application Questions */}
              {createStep === 4 && (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', border: '1px solid rgba(148,163,184,0.15)', boxShadow: '0 4px 24px -8px rgba(15,23,42,0.07)' }}>
                    <h2 style={{ margin: '0 0 0.35rem', fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>Application Screening Questions</h2>
                    <p style={{ margin: '0', color: '#64748b', fontSize: '0.92rem' }}>Toggle the questions you want candidates to answer when applying. All are optional — only enable what's relevant to this role.</p>
                  </div>

                  {QUESTION_GROUPS.map((group) => (
                    <div key={group.title} style={{ background: 'white', borderRadius: '16px', border: '1px solid rgba(148,163,184,0.15)', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.9rem 1.5rem', borderBottom: '1px solid rgba(148,163,184,0.1)', background: '#f8fafc' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{group.title}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const allOn = group.questions.every((q) => enabledQuestions[q.id]);
                            setEnabledQuestions((prev) => {
                              const next = { ...prev };
                              group.questions.forEach((q) => { next[q.id] = !allOn; });
                              return next;
                            });
                          }}
                          style={{ fontSize: '0.72rem', fontWeight: 600, color: '#1d4ed8', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          {group.questions.every((q) => enabledQuestions[q.id]) ? 'Deselect all' : 'Select all'}
                        </button>
                      </div>
                      <div style={{ display: 'grid', gap: 0 }}>
                        {group.questions.map((q, qi) => (
                          <label
                            key={q.id}
                            style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1rem 1.5rem', cursor: 'pointer', borderTop: qi > 0 ? '1px solid rgba(148,163,184,0.08)' : undefined, background: enabledQuestions[q.id] ? 'rgba(29,78,216,0.03)' : 'white', transition: 'background 0.15s' }}
                          >
                            <div style={{ position: 'relative', flexShrink: 0, marginTop: '0.15rem' }}>
                              <input
                                type="checkbox"
                                checked={!!enabledQuestions[q.id]}
                                onChange={(e) => setEnabledQuestions((prev) => ({ ...prev, [q.id]: e.target.checked }))}
                                style={{ width: 18, height: 18, accentColor: '#1d4ed8', cursor: 'pointer' }}
                              />
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: '0.9rem', fontWeight: enabledQuestions[q.id] ? 600 : 400, color: '#0f172a', lineHeight: 1.45 }}>{q.label}</div>
                              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>{q.hint}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div style={{ background: 'white', borderRadius: '16px', border: '1px solid rgba(148,163,184,0.15)', overflow: 'hidden' }}>
                    <div style={{ padding: '0.9rem 1.5rem', borderBottom: '1px solid rgba(148,163,184,0.1)', background: 'linear-gradient(135deg, #fffbeb, #fef3c7)' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Voluntary Self-Identification</span>
                      <p style={{ margin: '0.3rem 0 0', fontSize: '0.78rem', color: '#78350f', lineHeight: 1.5 }}>
                        These questions are clearly labeled as voluntary, will not affect hiring decisions, and will not be visible to hiring managers.
                        If you later become an OFCCP-covered federal contractor, use the official VETS-4212 categories.
                      </p>
                    </div>
                    <div style={{ display: 'grid', gap: 0 }}>
                      {VOLUNTARY_QUESTIONS.map((q, qi) => (
                        <label
                          key={q.id}
                          style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1rem 1.5rem', cursor: 'pointer', borderTop: qi > 0 ? '1px solid rgba(148,163,184,0.08)' : undefined, background: enabledQuestions[q.id] ? 'rgba(217,119,6,0.04)' : 'white', transition: 'background 0.15s' }}
                        >
                          <input
                            type="checkbox"
                            checked={!!enabledQuestions[q.id]}
                            onChange={(e) => setEnabledQuestions((prev) => ({ ...prev, [q.id]: e.target.checked }))}
                            style={{ width: 18, height: 18, accentColor: '#d97706', cursor: 'pointer', marginTop: '0.15rem', flexShrink: 0 }}
                          />
                          <div>
                            <div style={{ fontSize: '0.9rem', fontWeight: enabledQuestions[q.id] ? 600 : 400, color: '#0f172a', lineHeight: 1.45 }}>{q.label} <span style={{ fontWeight: 400, color: '#d97706', fontSize: '0.78rem' }}>(Voluntary — not used in hiring decisions)</span></div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>{q.hint}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5 — Benefits */}
              {createStep === 5 && (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', border: '1px solid rgba(148,163,184,0.15)', boxShadow: '0 4px 24px -8px rgba(15,23,42,0.07)' }}>
                    <h2 style={{ margin: '0 0 0.35rem', fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>Benefits &amp; Perks</h2>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.92rem' }}>Select all benefits offered for this position. These will be shown to candidates on the job listing.</p>
                  </div>

                  {BENEFIT_GROUPS.map((group) => (
                    <div key={group.title} style={{ background: 'white', borderRadius: '16px', border: '1px solid rgba(148,163,184,0.15)', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.9rem 1.5rem', borderBottom: '1px solid rgba(148,163,184,0.1)', background: '#f8fafc' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{group.title}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const allOn = group.items.every((b) => selectedBenefits.includes(b));
                            setSelectedBenefits((prev) =>
                              allOn
                                ? prev.filter((b) => !group.items.includes(b))
                                : [...new Set([...prev, ...group.items])]
                            );
                          }}
                          style={{ fontSize: '0.72rem', fontWeight: 600, color: '#1d4ed8', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          {group.items.every((b) => selectedBenefits.includes(b)) ? 'Deselect all' : 'Select all'}
                        </button>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                        {group.items.map((benefit, bi) => (
                          <label
                            key={benefit}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.8rem 1.5rem', cursor: 'pointer', borderTop: bi >= 2 ? '1px solid rgba(148,163,184,0.08)' : undefined, borderRight: bi % 2 === 0 ? '1px solid rgba(148,163,184,0.08)' : undefined, background: selectedBenefits.includes(benefit) ? 'rgba(29,78,216,0.03)' : 'white', transition: 'background 0.15s' }}
                          >
                            <input
                              type="checkbox"
                              checked={selectedBenefits.includes(benefit)}
                              onChange={(e) => setSelectedBenefits((prev) => e.target.checked ? [...prev, benefit] : prev.filter((b) => b !== benefit))}
                              style={{ width: 16, height: 16, accentColor: '#1d4ed8', cursor: 'pointer', flexShrink: 0 }}
                            />
                            <span style={{ fontSize: '0.88rem', fontWeight: selectedBenefits.includes(benefit) ? 600 : 400, color: '#0f172a', lineHeight: 1.35 }}>{benefit}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Benefits Vary by Position */}
                  <div style={{ background: 'white', borderRadius: '16px', border: '1px solid rgba(148,163,184,0.15)', overflow: 'hidden' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem', cursor: 'pointer', background: selectedBenefits.includes(BENEFIT_VARIES) ? 'rgba(29,78,216,0.03)' : 'white' }}>
                      <input
                        type="checkbox"
                        checked={selectedBenefits.includes(BENEFIT_VARIES)}
                        onChange={(e) => setSelectedBenefits((prev) => e.target.checked ? [...prev, BENEFIT_VARIES] : prev.filter((b) => b !== BENEFIT_VARIES))}
                        style={{ width: 18, height: 18, accentColor: '#1d4ed8', cursor: 'pointer', flexShrink: 0 }}
                      />
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: selectedBenefits.includes(BENEFIT_VARIES) ? 700 : 500, color: '#0f172a' }}>{BENEFIT_VARIES}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>Useful for government contractors where benefits may differ by contract, position type, or collective bargaining agreement.</div>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Step 6 — Review */}
              {createStep === 6 && (
                <div style={{ display: 'grid', gap: '0.85rem' }}>
                  <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', border: '1px solid rgba(148,163,184,0.15)', boxShadow: '0 4px 24px -8px rgba(15,23,42,0.07)' }}>
                    <h2 style={{ margin: '0 0 0.35rem', fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>Review your listing</h2>
                    <p style={{ margin: '0 0 0', color: '#64748b', fontSize: '0.92rem' }}>Everything looks good? Hit publish to go live.</p>
                  </div>

                  {(() => {
                    const annualLine = createForm.salaryMin || createForm.salaryMax
                      ? `$${Number(createForm.salaryMin || 0).toLocaleString()}–$${Number(createForm.salaryMax || 0).toLocaleString()} annually`
                      : null;
                    const hourlyLine = createForm.hourlyMin || createForm.hourlyMax
                      ? `$${Number(createForm.hourlyMin || 0).toLocaleString()}–$${Number(createForm.hourlyMax || 0).toLocaleString()} per hour`
                      : null;
                    const compDisplay =
                      createForm.salaryType === 'ANNUAL' ? (annualLine ?? '—') :
                      createForm.salaryType === 'HOURLY' ? (hourlyLine ?? '—') :
                      [annualLine, hourlyLine].filter(Boolean).join(' / ') || '—';
                    return [
                      {
                        title: 'Basic Info',
                        rows: [
                          { label: 'Job title', value: createForm.title || '—' },
                          { label: 'Department', value: createForm.department.charAt(0) + createForm.department.slice(1).toLowerCase() },
                          { label: 'Employment type', value: { FULL_TIME: 'Full time', PART_TIME: 'Part time', CONTRACT: 'Contract', INTERNSHIP: 'Internship' }[createForm.employmentType] ?? createForm.employmentType },
                          { label: 'Work arrangement', value: { ONSITE: 'Onsite', HYBRID: 'Hybrid', REMOTE: 'Remote' }[createForm.workArrangement] ?? createForm.workArrangement },
                          { label: 'Work schedule', value: createForm.workSchedule || '—' },
                        ],
                      },
                      {
                        title: 'Location',
                        rows: [
                          { label: 'Location', value: [locationCity, locationState, locationCountry].filter(Boolean).join(', ') || '—' },
                        ],
                      },
                      {
                        title: 'Compensation',
                        rows: [
                          { label: 'Compensation', value: compDisplay },
                        ],
                      },
                      {
                        title: 'Role Details',
                        rows: [
                          { label: 'Skills', value: createForm.skills || '—' },
                          { label: 'Position summary', value: createForm.positionSummary || '—', html: !!createForm.positionSummary },
                          { label: 'Key responsibilities', value: createForm.keyResponsibilities || '—', html: !!createForm.keyResponsibilities },
                          { label: 'Min. qualifications', value: createForm.minQualifications || '—', html: !!createForm.minQualifications },
                          { label: 'Preferred qualifications', value: createForm.preferredQualifications || '—', html: !!createForm.preferredQualifications },
                        ],
                      },
                      {
                        title: 'Application Questions',
                        rows: (() => {
                          const all = [...QUESTION_GROUPS.flatMap((g) => g.questions), ...VOLUNTARY_QUESTIONS];
                          const active = all.filter((q) => enabledQuestions[q.id]);
                          return active.length > 0
                            ? active.map((q) => ({ label: q.label.length > 55 ? q.label.slice(0, 55) + '…' : q.label, value: q.hint }))
                            : [{ label: 'No questions selected', value: 'Candidates will only submit a cover letter' }];
                        })(),
                      },
                      {
                        title: 'Benefits',
                        rows: selectedBenefits.length > 0
                          ? selectedBenefits.map((b) => ({ label: b, value: '✓' }))
                          : [{ label: 'No benefits selected', value: '' }],
                      },
                    ];
                  })().map((section) => (
                    <div key={section.title} style={{ background: 'white', borderRadius: '14px', padding: '1.25rem 1.5rem', border: '1px solid rgba(148,163,184,0.15)' }}>
                      <p style={{ margin: '0 0 0.85rem', fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{section.title}</p>
                      <div style={{ display: 'grid', gap: '0.55rem' }}>
                        {section.rows.map((row) => (
                          <div key={row.label} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', minWidth: '120px', flexShrink: 0 }}>{row.label}</span>
                            {(row as { label: string; value: string; html?: boolean }).html
                              ? <div className="rte-display" dangerouslySetInnerHTML={{ __html: row.value }} style={{ fontSize: '0.88rem', color: '#0f172a', lineHeight: 1.55, maxHeight: '14rem', overflowY: 'auto', minWidth: 0, flex: 1 }} />
                              : <span style={{ fontSize: '0.88rem', color: '#0f172a', lineHeight: 1.5 }}>{row.value}</span>
                            }
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>

          {/* Bottom navigation */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '1rem 2.5rem', borderTop: '1px solid rgba(148,163,184,0.12)', background: 'white', flexShrink: 0, gap: '0.75rem' }}>
            {stepError && <span style={{ color: '#b91c1c', fontWeight: 600, fontSize: '0.85rem', flex: 1 }}>{stepError}</span>}
            {createError && <span style={{ color: '#b91c1c', fontWeight: 600, fontSize: '0.85rem', flex: 1 }}>{createError}</span>}
            {!stepError && !createError && <span style={{ flex: 1 }} />}
            {createStep > 0 && (
              <button type="button" onClick={handleBack} style={{ padding: '0.7rem 1.35rem', borderRadius: '10px', border: '1px solid rgba(148,163,184,0.3)', background: 'transparent', color: '#475569', fontWeight: 600, fontSize: '0.92rem', cursor: 'pointer' }}>
                ← Back
              </button>
            )}
            {createStep < CREATE_STEPS.length - 1 ? (
              <button type="button" onClick={handleNext} style={{ padding: '0.7rem 1.5rem', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #07172e, #1d4ed8)', color: 'white', fontWeight: 700, fontSize: '0.92rem', cursor: 'pointer' }}>
                Next →
              </button>
            ) : editingDraftId ? (
              <>
                {createForm.status === 'DRAFT' && (
                  <button type="button" onClick={handleSaveAsDraft} disabled={creating} style={{ padding: '0.7rem 1.35rem', borderRadius: '10px', border: '1px solid rgba(148,163,184,0.3)', background: 'transparent', color: '#475569', fontWeight: 600, fontSize: '0.92rem', cursor: creating ? 'not-allowed' : 'pointer' }}>
                    {creating ? 'Saving…' : 'Save Draft'}
                  </button>
                )}
                <button type="button" onClick={createForm.status === 'OPEN' ? handleSaveChanges : handlePublish} disabled={creating} style={{ padding: '0.7rem 1.5rem', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #07172e, #1d4ed8)', color: 'white', fontWeight: 700, fontSize: '0.92rem', cursor: creating ? 'not-allowed' : 'pointer' }}>
                  {creating ? 'Saving…' : createForm.status === 'OPEN' ? 'Save Changes →' : 'Publish Job →'}
                </button>
              </>
            ) : (
              <button type="button" onClick={handlePublish} disabled={creating} style={{ padding: '0.7rem 1.5rem', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #07172e, #1d4ed8)', color: 'white', fontWeight: 700, fontSize: '0.92rem', cursor: creating ? 'not-allowed' : 'pointer' }}>
                {creating ? 'Publishing…' : 'Publish Job →'}
              </button>
            )}
          </div>

          {/* Exit confirmation popup */}
          {showExitConfirm && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(2,6,23,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, padding: '1rem' }}>
              <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', maxWidth: '400px', width: '100%', boxShadow: '0 24px 64px rgba(2,6,23,0.22)' }}>
                <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                  {editingDraftId ? 'Save changes?' : 'Exit job posting?'}
                </h3>
                <p style={{ margin: '0 0 1.5rem', color: '#64748b', lineHeight: 1.6, fontSize: '0.95rem' }}>
                  {editingDraftId
                    ? 'Save your changes or discard them to exit.'
                    : 'Save your progress as a draft to continue later, or discard to exit without saving.'}
                </p>
                <div style={{ display: 'grid', gap: '0.6rem' }}>
                  <button
                    type="button"
                    onClick={editingDraftId && createForm.status === 'OPEN' ? handleSaveChanges : handleSaveAsDraft}
                    disabled={creating}
                    style={{ width: '100%', padding: '0.85rem', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #07172e, #1d4ed8)', color: 'white', fontWeight: 700, fontSize: '0.95rem', cursor: creating ? 'not-allowed' : 'pointer' }}
                  >
                    {creating
                      ? 'Saving…'
                      : editingDraftId && createForm.status === 'OPEN'
                        ? 'Save Changes'
                        : editingDraftId
                          ? 'Save Draft'
                          : 'Save as Draft'}
                  </button>
                  <button type="button" onClick={handleDiscard} style={{ width: '100%', padding: '0.85rem', borderRadius: '10px', border: '1px solid rgba(220,38,38,0.3)', background: 'transparent', color: '#dc2626', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer' }}>
                    Discard
                  </button>
                  <button type="button" onClick={() => setShowExitConfirm(false)} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(148,163,184,0.25)', background: 'transparent', color: '#64748b', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>
                    Keep editing
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </>
  );
}

export default EmployerDashboard;