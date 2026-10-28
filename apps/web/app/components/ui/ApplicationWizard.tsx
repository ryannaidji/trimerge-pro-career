"use client"

import React, { useState, useRef } from 'react';
import { X, Upload, ChevronLeft, ChevronRight, FileText, CheckCircle } from 'lucide-react';
import useApplyForJob from '../../../hooks/useApplyForJob';

type QuestionType = 'yesno' | 'travel' | 'date' | 'number' | 'text' | 'select' | 'veteran';
interface QuestionConfig { label: string; type: QuestionType; options?: string[]; voluntary?: boolean }

const QUESTION_CONFIG: Record<string, QuestionConfig> = {
  workAuthUS:         { label: 'Are you legally authorized to work in the United States?',                                                                type: 'yesno' },
  sponsorship:        { label: 'Will you now or in the future require employer sponsorship for employment?',                                               type: 'yesno' },
  startDate:          { label: 'Earliest Available Start Date',                                                                                           type: 'date' },
  travel:             { label: 'Are you willing to travel?',                                                                                              type: 'travel' },
  backgroundCheck:    { label: 'Are you able to successfully complete a background investigation if required?',                                            type: 'yesno' },
  securityClearance:  { label: 'Do you currently possess an active security clearance?',                                                                  type: 'select', options: ['None', 'Public Trust', 'Secret', 'Top Secret', 'TS/SCI'] },
  yearsOfExperience:  { label: 'Years of Experience',                                                                                                     type: 'number' },
  education:          { label: 'Highest Level of Education',                                                                                              type: 'select', options: ["High School / GED", "Associate Degree", "Bachelor's Degree", "Master's Degree", "Doctoral Degree", "Professional Degree (JD, MD, etc.)"] },
  certifications:     { label: 'Certifications (comma-separated)',                                                                                         type: 'text' },
  willingOnsite:      { label: 'Are you willing to work onsite if required?',                                                                             type: 'yesno' },
  willingRelocate:    { label: 'Are you willing to relocate?',                                                                                            type: 'yesno' },
  essentialFunctions: { label: 'Are you able to perform the essential functions of this position with or without reasonable accommodation?',               type: 'yesno' },
  veteranStatus:      { label: 'Protected Veteran Status', type: 'veteran', voluntary: true,
                        options: ['I identify as one or more protected veteran classifications', 'I am not a protected veteran', 'I choose not to answer'] },
};

interface Job {
  _id?: string;
  id?: string;
  title?: string;
  department?: string;
  location?: string;
  applicationQuestions?: string[];
}

interface Props {
  job: Job;
  onClose: () => void;
}

const STEPS = [
  { id: 'resume',   label: 'Resume' },
  { id: 'cover',    label: 'Cover Letter' },
  { id: 'questions',label: 'Questions' },
  { id: 'review',   label: 'Review' },
];

export function ApplicationWizard({ job, onClose }: Props) {
  const { apply, loading: applying, error: applyError } = useApplyForJob();

  const [step, setStep] = useState(0);
  const [stepError, setStepError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Resume
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  // Cover letter
  const [coverType, setCoverType] = useState<'file' | 'text'>('file');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverText, setCoverText] = useState('');
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Application questions
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const setAns = (id: string, val: string) => setAnswers(prev => ({ ...prev, [id]: val }));

  const questions = Array.isArray(job.applicationQuestions) ? job.applicationQuestions : [];

  const handleNext = () => {
    setStepError(null);
    if (step === 0 && !resumeFile) {
      setStepError('Please upload your resume to continue.');
      return;
    }
    if (step === 1) {
      if (coverType === 'file' && !coverFile) {
        setStepError('Please upload your cover letter or switch to written.');
        return;
      }
      if (coverType === 'text' && !coverText.trim()) {
        setStepError('Please write your cover letter or upload a PDF.');
        return;
      }
    }
    setStep(s => s + 1);
  };

  const handleBack = () => { setStepError(null); setStep(s => s - 1); };

  const handleSubmit = async () => {
    setStepError(null);
    const jobId = String(job._id ?? job.id ?? '');
    try {
      await apply({
        jobId,
        resumeFile,
        ...(coverType === 'file' ? { file: coverFile } : { coverLetter: coverText.trim() }),
        answers: Object.keys(answers).length > 0 ? answers : undefined,
      });
      setSubmitted(true);
    } catch {
      // error shown via applyError
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', padding: '0.85rem 1rem',
    borderRadius: '12px', border: '1px solid rgba(148,163,184,0.3)',
    fontSize: '0.95rem', fontFamily: 'inherit', background: 'white', outline: 'none',
  };

  // ── Dropzone ──────────────────────────────────────────
  const Dropzone = ({ file, onFile, accept, hint }: { file: File | null; onFile: (f: File) => void; accept: string; hint: string }) => {
    const ref = useRef<HTMLInputElement>(null);
    return (
      <>
        <input ref={ref} type="file" accept={accept} style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
        <div
          onClick={() => ref.current?.click()}
          style={{
            border: `2px dashed ${file ? 'rgba(22,163,74,0.4)' : 'rgba(29,78,216,0.3)'}`,
            borderRadius: '16px', padding: '2.5rem 2rem', textAlign: 'center', cursor: 'pointer',
            background: file ? 'rgba(22,163,74,0.04)' : 'rgba(29,78,216,0.03)',
            transition: 'background 0.2s, border-color 0.2s',
          }}
        >
          {file ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={36} color="#16a34a" />
              <span style={{ fontWeight: 700, color: '#16a34a', fontSize: '1rem' }}>{file.name}</span>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Click to replace</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <Upload size={36} color="#1d4ed8" />
              <span style={{ fontWeight: 700, color: '#1d4ed8', fontSize: '1rem' }}>Click to upload</span>
              <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{hint}</span>
            </div>
          )}
        </div>
      </>
    );
  };

  // ── Question renderer ─────────────────────────────────
  const renderQuestion = (qId: string) => {
    const cfg = QUESTION_CONFIG[qId];
    if (!cfg) return null;
    const ans = answers[qId] ?? '';

    return (
      <div key={qId} style={{ background: cfg.voluntary ? '#fffbeb' : 'white', border: `1px solid ${cfg.voluntary ? '#fde68a' : 'rgba(148,163,184,0.22)'}`, borderRadius: '16px', padding: '1.25rem 1.5rem' }}>
        <label style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', marginBottom: '0.75rem', lineHeight: 1.5 }}>
          {cfg.label}
          {cfg.voluntary && <span style={{ marginLeft: 8, fontSize: '0.78rem', fontWeight: 400, color: '#d97706' }}>(Voluntary — not used in hiring decisions)</span>}
        </label>

        {cfg.type === 'yesno' && (
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            {['Yes', 'No'].map(opt => (
              <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', fontSize: '0.95rem', fontWeight: ans === opt ? 700 : 400, color: ans === opt ? '#1d4ed8' : '#374151' }}>
                <input type="radio" name={qId} value={opt} checked={ans === opt} onChange={() => setAns(qId, opt)} style={{ accentColor: '#1d4ed8', width: 16, height: 16 }} />
                {opt}
              </label>
            ))}
          </div>
        )}

        {cfg.type === 'veteran' && (
          <div style={{ display: 'grid', gap: '0.6rem' }}>
            {cfg.options!.map(opt => (
              <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: ans === opt ? 700 : 400, color: ans === opt ? '#d97706' : '#374151' }}>
                <input type="radio" name={qId} value={opt} checked={ans === opt} onChange={() => setAns(qId, opt)} style={{ accentColor: '#d97706', width: 16, height: 16 }} />
                {opt}
              </label>
            ))}
          </div>
        )}

        {cfg.type === 'travel' && (
          <div style={{ display: 'grid', gap: '0.85rem' }}>
            <div style={{ display: 'flex', gap: '1.25rem' }}>
              {['Yes', 'No'].map(opt => (
                <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', fontSize: '0.95rem', fontWeight: (ans === opt || ans.startsWith(opt + ' —')) ? 700 : 400, color: (ans === opt || ans.startsWith(opt + ' —')) ? '#1d4ed8' : '#374151' }}>
                  <input type="radio" name={qId} checked={ans === opt || ans.startsWith(opt + ' —')} onChange={() => setAns(qId, opt)} style={{ accentColor: '#1d4ed8', width: 16, height: 16 }} />
                  {opt}
                </label>
              ))}
            </div>
            {(ans === 'Yes' || ans.startsWith('Yes —')) && (
              <div>
                <p style={{ margin: '0 0 0.5rem', fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>Up to what percentage?</p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {['10%', '25%', '50%', '75%', '100%'].map(pct => (
                    <button key={pct} type="button" onClick={() => setAns(qId, `Yes — up to ${pct}`)}
                      style={{ padding: '0.4rem 1rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', border: ans === `Yes — up to ${pct}` ? '2px solid #1d4ed8' : '1px solid rgba(148,163,184,0.3)', background: ans === `Yes — up to ${pct}` ? 'rgba(29,78,216,0.08)' : 'white', color: ans === `Yes — up to ${pct}` ? '#1d4ed8' : '#475569' }}>
                      {pct}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {cfg.type === 'date' && <input type="date" value={ans} onChange={e => setAns(qId, e.target.value)} style={inputStyle} />}
        {cfg.type === 'number' && <input type="number" min={0} value={ans} onChange={e => setAns(qId, e.target.value)} placeholder="e.g. 5" style={{ ...inputStyle, maxWidth: '180px' }} />}
        {cfg.type === 'text' && <input type="text" value={ans} onChange={e => setAns(qId, e.target.value)} placeholder="Type your answer..." style={inputStyle} />}
        {cfg.type === 'select' && (
          <select value={ans} onChange={e => setAns(qId, e.target.value)} style={inputStyle}>
            <option value="">Select an option...</option>
            {cfg.options!.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        )}
      </div>
    );
  };

  // ── Success screen ────────────────────────────────────
  if (submitted) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 3000, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '480px' }}>
          <CheckCircle size={64} color="#16a34a" style={{ margin: '0 auto 1.25rem' }} />
          <h2 style={{ margin: '0 0 0.65rem', fontSize: '2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.04em' }}>Application Submitted!</h2>
          <p style={{ color: '#64748b', lineHeight: 1.7, marginBottom: '2rem', fontSize: '1.05rem' }}>
            Your application for <strong>{job.title}</strong> has been submitted. The employer will be in touch if your profile is a match. Good luck!
          </p>
          <button onClick={onClose} style={{ padding: '0.9rem 2.5rem', borderRadius: '14px', background: 'linear-gradient(135deg, #07172e, #1d4ed8)', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '1rem' }}>
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  // ── Full-page wizard ──────────────────────────────────
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 3000, background: '#f8fafc', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2.5rem', height: '64px', background: 'white', borderBottom: '1px solid rgba(148,163,184,0.15)', flexShrink: 0 }}>
        {/* Job info */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Applying for</span>
          <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '260px' }}>{job.title}</span>
        </div>

        {/* Step indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '999px', display: 'grid', placeItems: 'center', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0, background: i < step ? '#16a34a' : i === step ? '#1d4ed8' : 'rgba(148,163,184,0.2)', color: i <= step ? 'white' : '#94a3b8', transition: 'background 0.2s' }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: i === step ? 700 : 400, color: i === step ? '#0f172a' : '#94a3b8' }}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && <div style={{ width: '28px', height: '1px', background: i < step ? '#16a34a' : 'rgba(148,163,184,0.25)', flexShrink: 0 }} />}
            </React.Fragment>
          ))}
        </div>

        {/* Close */}
        <button onClick={onClose} title="Exit application" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(148,163,184,0.25)', background: 'transparent', color: '#64748b', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>
          <X size={15} /> Exit
        </button>
      </div>

      {/* ── Scrollable content ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '2.5rem 1.5rem' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', display: 'grid', gap: '1.5rem' }}>

          {/* Step 0: Resume */}
          {step === 0 && (
            <div style={{ background: 'white', borderRadius: '20px', padding: '2rem 2.5rem', border: '1px solid rgba(148,163,184,0.15)', boxShadow: '0 4px 24px -8px rgba(15,23,42,0.07)' }}>
              <p style={{ margin: '0 0 0.3rem', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Step 1 of 4</p>
              <h2 style={{ margin: '0 0 0.4rem', fontSize: '1.55rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>Upload your resume</h2>
              <p style={{ margin: '0 0 1.5rem', color: '#64748b', lineHeight: 1.65 }}>PDF, DOC, or DOCX format. This document will be shared with the employer.</p>
              <Dropzone file={resumeFile} onFile={setResumeFile} accept=".pdf,.doc,.docx" hint="PDF, DOC, DOCX" />
            </div>
          )}

          {/* Step 1: Cover Letter */}
          {step === 1 && (
            <div style={{ background: 'white', borderRadius: '20px', padding: '2rem 2.5rem', border: '1px solid rgba(148,163,184,0.15)', boxShadow: '0 4px 24px -8px rgba(15,23,42,0.07)' }}>
              <p style={{ margin: '0 0 0.3rem', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Step 2 of 4</p>
              <h2 style={{ margin: '0 0 0.4rem', fontSize: '1.55rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>Cover letter</h2>
              <p style={{ margin: '0 0 1.25rem', color: '#64748b', lineHeight: 1.65 }}>Upload a PDF cover letter or write one directly below.</p>

              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                {(['file', 'text'] as const).map(t => (
                  <button key={t} type="button" onClick={() => setCoverType(t)}
                    style={{ padding: '0.5rem 1.25rem', borderRadius: '10px', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', border: coverType === t ? '2px solid #1d4ed8' : '1px solid rgba(148,163,184,0.3)', background: coverType === t ? 'rgba(29,78,216,0.07)' : 'white', color: coverType === t ? '#1d4ed8' : '#475569' }}>
                    {t === 'file' ? 'Upload PDF' : 'Write cover letter'}
                  </button>
                ))}
              </div>

              {coverType === 'file'
                ? <Dropzone file={coverFile} onFile={setCoverFile} accept="application/pdf" hint="PDF only" />
                : <textarea value={coverText} onChange={e => setCoverText(e.target.value)} placeholder={"Dear Hiring Manager,\n\nI am excited to apply for this position..."} rows={12} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.7 }} />
              }
            </div>
          )}

          {/* Step 2: Application Questions */}
          {step === 2 && (
            <div style={{ background: 'white', borderRadius: '20px', padding: '2rem 2.5rem', border: '1px solid rgba(148,163,184,0.15)', boxShadow: '0 4px 24px -8px rgba(15,23,42,0.07)' }}>
              <p style={{ margin: '0 0 0.3rem', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Step 3 of 4</p>
              <h2 style={{ margin: '0 0 0.4rem', fontSize: '1.55rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>Application questions</h2>
              <p style={{ margin: '0 0 1.5rem', color: '#64748b', lineHeight: 1.65 }}>Please answer all questions as accurately as possible. Voluntary questions will not affect your application.</p>

              {questions.length > 0 ? (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {questions.map(qId => renderQuestion(qId))}
                </div>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '14px', border: '1px solid rgba(148,163,184,0.15)', color: '#64748b' }}>
                  <p style={{ margin: 0, fontWeight: 600 }}>No screening questions for this position.</p>
                  <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem' }}>You can proceed to review your application.</p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ background: 'white', borderRadius: '20px', padding: '2rem 2.5rem', border: '1px solid rgba(148,163,184,0.15)', boxShadow: '0 4px 24px -8px rgba(15,23,42,0.07)' }}>
                <p style={{ margin: '0 0 0.3rem', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Step 4 of 4</p>
                <h2 style={{ margin: '0 0 0.4rem', fontSize: '1.55rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>Review your application</h2>
                <p style={{ margin: 0, color: '#64748b', lineHeight: 1.65 }}>Review everything below before submitting. Use the Back button to make changes.</p>
              </div>

              <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem 2rem', border: '1px solid rgba(148,163,184,0.15)', display: 'grid', gap: '0.6rem' }}>
                <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Resume</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <FileText size={18} color="#1d4ed8" />
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{resumeFile?.name}</span>
                </div>
              </div>

              <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem 2rem', border: '1px solid rgba(148,163,184,0.15)', display: 'grid', gap: '0.6rem' }}>
                <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Cover Letter</p>
                {coverType === 'file'
                  ? <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><FileText size={18} color="#1d4ed8" /><span style={{ fontWeight: 700, color: '#0f172a' }}>{coverFile?.name}</span></div>
                  : <p style={{ margin: 0, color: '#374151', lineHeight: 1.65, whiteSpace: 'pre-line', fontSize: '0.92rem' }}>{coverText.slice(0, 300)}{coverText.length > 300 ? '…' : ''}</p>
                }
              </div>

              {questions.length > 0 && (
                <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem 2rem', border: '1px solid rgba(148,163,184,0.15)', display: 'grid', gap: '0.85rem' }}>
                  <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Your Answers</p>
                  {questions.map(qId => {
                    const cfg = QUESTION_CONFIG[qId];
                    const ans = answers[qId];
                    if (!cfg) return null;
                    return (
                      <div key={qId} style={{ borderTop: '1px solid rgba(148,163,184,0.12)', paddingTop: '0.75rem' }}>
                        <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '0.2rem' }}>{cfg.label}</div>
                        <div style={{ fontWeight: 700, color: ans ? '#0f172a' : '#94a3b8', fontSize: '0.92rem' }}>{ans || 'Not answered'}</div>
                      </div>
                    );
                  })}
                </div>
              )}

              {applyError && (
                <div style={{ color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', padding: '0.85rem 1rem', borderRadius: '12px', fontWeight: 600, fontSize: '0.9rem' }}>
                  {applyError}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ── Footer navigation ── */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '1rem 2.5rem', borderTop: '1px solid rgba(148,163,184,0.12)', background: 'white', flexShrink: 0, gap: '0.75rem' }}>
        {stepError && <span style={{ color: '#b91c1c', fontWeight: 600, fontSize: '0.85rem', flex: 1 }}>{stepError}</span>}
        {!stepError && <span style={{ flex: 1 }} />}
        {step > 0 && (
          <button type="button" onClick={handleBack} style={{ padding: '0.7rem 1.35rem', borderRadius: '10px', border: '1px solid rgba(148,163,184,0.3)', background: 'transparent', color: '#475569', fontWeight: 600, fontSize: '0.92rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <ChevronLeft size={16} /> Back
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button type="button" onClick={handleNext} style={{ padding: '0.7rem 1.5rem', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #07172e, #1d4ed8)', color: 'white', fontWeight: 700, fontSize: '0.92rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button type="button" onClick={handleSubmit} disabled={applying} style={{ padding: '0.7rem 1.6rem', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #07172e, #1d4ed8)', color: 'white', fontWeight: 700, fontSize: '0.92rem', cursor: applying ? 'not-allowed' : 'pointer' }}>
            {applying ? 'Submitting…' : 'Submit Application'}
          </button>
        )}
      </div>

    </div>
  );
}
