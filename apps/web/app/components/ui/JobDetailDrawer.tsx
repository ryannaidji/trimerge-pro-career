"use client"

import { X, MapPin, Briefcase, Calendar, DollarSign, Building2 } from 'lucide-react';

interface Job {
  // support both server _id and client id
  _id?: string;
  id?: string;
  employerId?: string;
  title?: string;
  department?: string;
  location?: string;
  status?: string; // OPEN/CLOSED/DRAFT
  description?: string;
  requirements?: string;
  employmentType?: string;
  workArrangement?: string;
  workSchedule?: string;
  salary?: string;
  salaryMin?: number;
  salaryMax?: number;
  hourlyMin?: number;
  hourlyMax?: number;
  salaryType?: string;
  currency?: string;
  skills?: string[];
  benefits?: string[];
  applicationQuestions?: string[];
  createdAt?: string;
  updatedAt?: string;
}

import React, { useEffect, useRef, useState } from 'react';

import { useUser } from '@/contexts/userContext/userContext';

const isHtml = (text: string) => /<[a-z][\s\S]*>/i.test(text);

function RteContent({ content, style }: { content: string; style?: React.CSSProperties }) {
  if (!content) return null;
  return isHtml(content)
    ? <div className="rte-display" dangerouslySetInnerHTML={{ __html: content }} style={style} />
    : <p style={{ ...style, whiteSpace: 'pre-line', margin: 0 }}>{content}</p>;
}

interface JobDetailDrawerProps {
  job: Job | null;
  onClose: () => void;
  onApply?: () => void;
}

export function JobDetailDrawer({ job, onClose, onApply }: JobDetailDrawerProps) {
  const { state } = useUser();
  // Note: we can't call hooks conditionally; we'll use a simple window.location fallback for now.
  const [visible, setVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(!!job);
  const drawerRef = useRef<HTMLDivElement>(null);
  // When job changes, show the drawer
  useEffect(() => {
    if (job) {
      // Defer setting shouldRender to avoid synchronous state update warnings
      setTimeout(() => setShouldRender(true), 0);
      setTimeout(() => setVisible(true), 10); // allow mount before animating in
    } else {
      // Defer visibility change to avoid synchronous setState in effect
      setTimeout(() => setVisible(false), 0);
      // Wait for animation to finish before unmounting
      setTimeout(() => setShouldRender(false), 300);
    }
    console.log(job)
  }, [job]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line
  }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 350);
  }

  if (!shouldRender || !job) return null;

  const department = job.department ?? 'General';
  const posted = job.createdAt ?? job.updatedAt;

  // Build formatted compensation display based on salaryType
  const annualComp = (job.salaryMin || job.salaryMax)
    ? `$${(job.salaryMin ?? 0).toLocaleString()}–$${(job.salaryMax ?? 0).toLocaleString()} annually`
    : null;
  const hourlyComp = (job.hourlyMin || job.hourlyMax)
    ? `$${(job.hourlyMin ?? 0).toLocaleString()}–$${(job.hourlyMax ?? 0).toLocaleString()} per hour`
    : null;
  const salaryDisplay: string | undefined =
    job.salary ??
    (job.salaryType === 'HOURLY' ? (hourlyComp ?? undefined) :
     job.salaryType === 'BOTH' ? ([annualComp, hourlyComp].filter(Boolean).join(' / ') || undefined) :
     job.salaryType === 'ANNUAL' ? (annualComp ?? undefined) :
     (annualComp ?? hourlyComp ?? undefined));

  // Parse structured description sections
  const parseSection = (text: string, marker: string): string | null => {
    const idx = text.indexOf(marker);
    if (idx === -1) return null;
    const start = idx + marker.length;
    const nextMarkerIdx = text.indexOf('[', start);
    return (nextMarkerIdx === -1 ? text.slice(start) : text.slice(start, nextMarkerIdx)).trim() || null;
  };

  const rawDesc = job.description ?? '';
  const rawReq = job.requirements ?? '';
  const hasKeyResp = rawDesc.includes('[KEY RESPONSIBILITIES]');
  const positionSummary = hasKeyResp ? rawDesc.slice(0, rawDesc.indexOf('[KEY RESPONSIBILITIES]')).trim() : rawDesc;
  const keyResponsibilities = parseSection(rawDesc, '[KEY RESPONSIBILITIES]');
  const minQualifications = parseSection(rawReq, '[MINIMUM QUALIFICATIONS]');
  const preferredQualifications = parseSection(rawReq, '[PREFERRED QUALIFICATIONS]');
  const hasStructured = hasKeyResp || rawReq.includes('[MINIMUM QUALIFICATIONS]');

  const formatArrangement = (raw?: string): string => {
    if (!raw) return '';
    const map: Record<string, string> = { ONSITE: 'Onsite', HYBRID: 'Hybrid', REMOTE: 'Remote' };
    return map[raw.toUpperCase()] ?? raw;
  };

  return (
    <div
      ref={drawerRef}
      className={`hide-scrollbar ${visible ? 'animate-slideMenu' : 'close-slideMenu'}`}
      style={{
        width: '100%',
        maxWidth: '40rem',
        background: 'linear-gradient(180deg, #ffffff 0%, #fffdfb 100%)',
        height: '83vh',
        overflowY: 'auto',
        boxShadow: '0 24px 50px rgba(15,23,42,0.10)',
        borderRadius: 24,
        marginLeft: 'auto',
        marginRight: 'auto',
        position: 'relative',
        transition: 'box-shadow 0.2s, transform 0.2s',
        display: 'block',
        animationDuration: '0.4s',
        animationFillMode: 'forwards',
        border: '1px solid rgba(229,231,235,0.9)',
      }}
    >
      <div style={{ position: 'sticky', top: 0, background: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.92) 100%)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(229,231,235,0.9)', padding: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, zIndex: 10, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
        <div style={{ display: 'grid', gap: 8 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', width: 'fit-content', background: 'rgba(37,99,235,0.10)', color: '#2563EB', padding: '6px 12px', borderRadius: 9999, fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Job details
          </span>
          <span style={{fontSize: 'clamp(1.75rem, 3vw, 2.15rem)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.05, color: '#0F172A'}}>{job.title}</span>
        </div>
        <button
          onClick={handleClose}
          style={{ padding: 10, borderRadius: 9999, transition: 'background 0.2s, transform 0.2s', background: '#F8FAFC', border: '1px solid #E2E8F0' }}
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Briefcase size={15} style={{ color: '#2563EB', flexShrink: 0 }} />
            <span style={{ fontSize: '0.78rem', color: '#6B7280', minWidth: 110 }}>Department</span>
            <span style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.92rem' }}>{department}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <MapPin size={15} style={{ color: '#2563EB', flexShrink: 0, marginTop: 2 }} />
            <span style={{ fontSize: '0.78rem', color: '#6B7280', minWidth: 110, paddingTop: 2 }}>Location</span>
            <span style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.92rem', lineHeight: 1.4 }}>{job.location}</span>
          </div>
          {salaryDisplay && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <DollarSign size={15} style={{ color: '#2563EB', flexShrink: 0 }} />
              <span style={{ fontSize: '0.78rem', color: '#6B7280', minWidth: 110 }}>Compensation</span>
              <span style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.92rem' }}>{salaryDisplay}</span>
            </div>
          )}
          {job.workArrangement && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Building2 size={15} style={{ color: '#2563EB', flexShrink: 0 }} />
              <span style={{ fontSize: '0.78rem', color: '#6B7280', minWidth: 110 }}>Work Arrangement</span>
              <span style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.92rem' }}>{formatArrangement(job.workArrangement)}</span>
            </div>
          )}
          {job.workSchedule && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Calendar size={15} style={{ color: '#2563EB', flexShrink: 0 }} />
              <span style={{ fontSize: '0.78rem', color: '#6B7280', minWidth: 110 }}>Work Schedule</span>
              <span style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.92rem' }}>{job.workSchedule}</span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Calendar size={15} style={{ color: '#2563EB', flexShrink: 0 }} />
            <span style={{ fontSize: '0.78rem', color: '#6B7280', minWidth: 110 }}>Posted</span>
            <span style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.92rem' }}>{posted ? new Date(posted).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }) : 'Unknown'}</span>
          </div>

          {state.user?.accountType !== 'EMPLOYER' && (
            <button
              // onClick={() =>
              //   state.user?.accountType === 'TALENT'
              //     ? onApply?.()
              //     : (window.location.href = '/login')
              // }
               onClick={() => onApply?.()
              }
              style={{ marginTop: 6, padding: '0.55rem 1.4rem', borderRadius: 10, background: 'linear-gradient(135deg, #1d4ed8, #2563EB)', color: 'white', fontWeight: 600, fontSize: '0.88rem', border: 'none', cursor: 'pointer', alignSelf: 'flex-start' }}
            >
              Apply Now
            </button>
          )}
        </div>

        {hasStructured ? (
          <>
            {positionSummary && (
              <div style={{ marginBottom: 24, padding: 20, background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, boxShadow: '0 8px 24px rgba(15,23,42,0.04)' }}>
                <h3 style={{ marginBottom: 14, fontSize: 18, fontWeight: 700, color: '#0F172A' }}>Position Summary</h3>
                <RteContent content={positionSummary} style={{ color: '#374151', lineHeight: 1.75 }} />
              </div>
            )}
            {keyResponsibilities && (
              <div style={{ marginBottom: 24, padding: 20, background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20 }}>
                <h3 style={{ marginBottom: 14, fontSize: 18, fontWeight: 700, color: '#0F172A' }}>Key Responsibilities</h3>
                <RteContent content={keyResponsibilities} style={{ color: '#374151', lineHeight: 1.75 }} />
              </div>
            )}
            {minQualifications && (
              <div style={{ marginBottom: 24, padding: 20, background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20 }}>
                <h3 style={{ marginBottom: 14, fontSize: 18, fontWeight: 700, color: '#0F172A' }}>Minimum Qualifications</h3>
                <RteContent content={minQualifications} style={{ color: '#374151', lineHeight: 1.75 }} />
              </div>
            )}
            {preferredQualifications && (
              <div style={{ marginBottom: 24, padding: 20, background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20 }}>
                <h3 style={{ marginBottom: 14, fontSize: 18, fontWeight: 700, color: '#0F172A' }}>Preferred Qualifications</h3>
                <RteContent content={preferredQualifications} style={{ color: '#374151', lineHeight: 1.75 }} />
              </div>
            )}
          </>
        ) : (
          <>
            {rawDesc && (
              <div style={{ marginBottom: 24, padding: 20, background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, boxShadow: '0 8px 24px rgba(15,23,42,0.04)' }}>
                <h3 style={{ marginBottom: 14, fontSize: 18, fontWeight: 700, color: '#0F172A' }}>Job Description</h3>
                <RteContent content={rawDesc} style={{ color: '#374151', lineHeight: 1.75 }} />
              </div>
            )}
            {rawReq && (
              <div style={{ marginBottom: 24, padding: 20, background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20 }}>
                <h3 style={{ marginBottom: 14, fontSize: 18, fontWeight: 700, color: '#0F172A' }}>Requirements</h3>
                <RteContent content={rawReq} style={{ color: '#374151', lineHeight: 1.7 }} />
              </div>
            )}
          </>
        )}

        {Array.isArray(job.skills) && job.skills.length > 0 && (
          <div style={{ marginBottom: 24, padding: 20, background: 'linear-gradient(180deg, #ffffff 0%, #f0f9ff 100%)', border: '1px solid #E2E8F0', borderRadius: 20 }}>
            <h3 style={{ marginBottom: 12, fontSize: 18, fontWeight: 700, color: '#0F172A' }}>Skills</h3>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {job.skills.map((s, idx) => (
                <span key={idx} style={{ background: '#EEF6FF', padding: '8px 12px', borderRadius: 9999, color: '#1D4ED8', fontSize: 12, fontWeight: 600, border: '1px solid #DBEAFE' }}>{s}</span>
              ))}
            </div>
          </div>
        )}

        {Array.isArray(job.benefits) && job.benefits.length > 0 && (() => {
          const BENEFIT_VARIES = 'Benefits Vary by Position';
          const varies = job.benefits.includes(BENEFIT_VARIES);
          const grouped: Record<string, string[]> = {};
          for (const b of job.benefits) {
            if (b === BENEFIT_VARIES) continue;
            const group =
              ['Medical Insurance','Dental Insurance','Vision Insurance','Prescription Drug Coverage','Health Savings Account (HSA)','Flexible Spending Account (FSA)','Employee Assistance Program (EAP)','Wellness Program'].includes(b) ? 'Health & Wellness' :
              ['401(k) Retirement Plan','Employer 401(k) Match','Life Insurance','Short-Term Disability Insurance','Long-Term Disability Insurance','Performance Bonus','Referral Bonus'].includes(b) ? 'Financial Benefits' :
              ['Paid Time Off (PTO)','Paid Holidays','Sick Leave','Bereavement Leave','Jury Duty Leave','Military Leave','Parental Leave'].includes(b) ? 'Paid Time Off' :
              ['Tuition Reimbursement','Professional Development Assistance','Certification Reimbursement','Continuing Education Support','Conference Attendance'].includes(b) ? 'Professional Development' :
              ['Flexible Work Schedule','Hybrid Work Environment','Remote Work Opportunities','Flexible Hours'].includes(b) ? 'Work-Life Balance' : 'Additional Benefits';
            if (!grouped[group]) grouped[group] = [];
            grouped[group].push(b);
          }
          return (
            <div style={{ marginBottom: 24, padding: 20, background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: 20 }}>
              <h3 style={{ marginBottom: 16, fontSize: 18, fontWeight: 700, color: '#0F172A' }}>Benefits &amp; Perks</h3>
              <div style={{ display: 'grid', gap: 16 }}>
                {Object.entries(grouped).map(([group, items]) => (
                  <div key={group}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{group}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {items.map((item) => (
                        <span key={item} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 999, padding: '5px 12px', fontSize: 12, fontWeight: 600, color: '#15803d' }}>
                          ✓ {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {varies && (
                  <div style={{ marginTop: 4, padding: '10px 14px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, fontSize: '0.82rem', color: '#92400e', fontWeight: 600 }}>
                    ⚠ Benefits Vary by Position — specific benefits depend on contract, position type, or collective bargaining agreement.
                  </div>
                )}
              </div>
            </div>
          );
        })()}



      </div>
    </div>
  );
}
