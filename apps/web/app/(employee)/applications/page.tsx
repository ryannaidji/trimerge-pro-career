"use client"

import { Calendar, Briefcase, MapPin, Clock, CheckCircle2, XCircle, AlertCircle, Download, MessageSquare } from 'lucide-react';

interface Application {
  id: number;
  jobTitle: string;
  department: string;
  location: string;
  appliedDate: string;
  status: 'under_review' | 'interview_scheduled' | 'rejected' | 'accepted';
  lastUpdate: string;
  interviewer?: string;
  interviewDate?: string;
}

const mockApplications: Application[] = [
  {
    id: 1,
    jobTitle: 'Senior Frontend Engineer',
    department: 'Engineering',
    location: 'Remote',
    appliedDate: '2026-04-18',
    status: 'interview_scheduled',
    lastUpdate: '2 hours ago',
    interviewer: 'Sarah Chen',
    interviewDate: '2026-04-23 at 2:00 PM',
  },
  {
    id: 2,
    jobTitle: 'Product Marketing Manager',
    department: 'Marketing',
    location: 'Hybrid',
    appliedDate: '2026-04-15',
    status: 'under_review',
    lastUpdate: '1 day ago',
  },
  {
    id: 3,
    jobTitle: 'UX Designer',
    department: 'Design',
    location: 'On-site',
    appliedDate: '2026-04-10',
    status: 'rejected',
    lastUpdate: '3 days ago',
  },
  {
    id: 4,
    jobTitle: 'Data Analyst',
    department: 'Engineering',
    location: 'Remote',
    appliedDate: '2026-04-05',
    status: 'accepted',
    lastUpdate: '1 week ago',
  },
];

const statusConfig = {
  under_review: {
    label: 'Under Review',
    icon: Clock,
    color: 'bg-blue-100 text-blue-700',
    iconColor: 'text-blue-600',
  },
  interview_scheduled: {
    label: 'Interview Scheduled',
    icon: Calendar,
    color: 'bg-[#FF5F1F]/10 text-[#FF5F1F]',
    iconColor: 'text-[#FF5F1F]',
  },
  rejected: {
    label: 'Not Selected',
    icon: XCircle,
    color: 'bg-gray-100 text-gray-700',
    iconColor: 'text-gray-600',
  },
  accepted: {
    label: 'Offer Extended',
    icon: CheckCircle2,
    color: 'bg-green-100 text-green-700',
    iconColor: 'text-green-600',
  },
};

export function MyApplications() {
  const activeApplications = mockApplications.filter(
    (app) => app.status !== 'rejected' && app.status !== 'accepted'
  );
  const pastApplications = mockApplications.filter(
    (app) => app.status === 'rejected' || app.status === 'accepted'
  );

  return (
    <div style={{ flex: 1, minHeight: '90vh', overflowY: 'auto', background: 'linear-gradient(180deg, #f8fbff 0%, #f4f7fb 42%, #eef4fb 100%)' }}>
      <div className="tp-container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div className="tp-card-soft tp-fade-up" style={{ marginBottom: '1.25rem', padding: '1.5rem', background: 'linear-gradient(135deg, #07172e 0%, #1d4ed8 100%)', color: 'white', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 'auto -5rem -5rem auto', width: '16rem', height: '16rem', borderRadius: '999px', background: 'rgba(255,255,255,0.08)', filter: 'blur(30px)' }} />
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div>
              <div className="tp-chip" style={{ background: 'rgba(255,255,255,0.12)', color: 'white', borderColor: 'rgba(255,255,255,0.14)' }}>Application tracker</div>
              <h1 style={{ margin: '0.85rem 0 0.45rem', fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.05em' }}>My applications</h1>
              <p style={{ margin: 0, maxWidth: '42rem', color: 'rgba(255,255,255,0.84)', lineHeight: 1.75 }}>Track every application, see the next hiring milestone, and keep a clean view of what still needs attention.</p>
            </div>
            <div style={{ display: 'grid', gap: '0.5rem', minWidth: '14rem' }}>
              <div style={{ fontSize: '0.82rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)' }}>Active applications</div>
              <div style={{ fontSize: '2rem', fontWeight: 800 }}>{activeApplications.length}</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="tp-card-soft" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ padding: 12, background: 'rgba(255,95,31,0.08)', borderRadius: 16 }}>
                <Briefcase className="w-6 h-6 text-[#FF5F1F]" />
              </div>
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>{activeApplications.length}</div>
            <div style={{ color: '#64748B', fontSize: 14 }}>Active applications</div>
          </div>

          <div className="tp-card-soft" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ padding: 12, background: '#D1FAE5', borderRadius: 16 }}>
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>{mockApplications.filter((a) => a.status === 'interview_scheduled').length}</div>
            <div style={{ color: '#64748B', fontSize: 14 }}>Interviews scheduled</div>
          </div>

          <div className="tp-card-soft" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ padding: 12, background: '#DBEAFE', borderRadius: 16 }}>
                <AlertCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>{mockApplications.filter((a) => a.status === 'under_review').length}</div>
            <div style={{ color: '#64748B', fontSize: 14 }}>Pending review</div>
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <h2 style={{ marginBottom: 16, fontSize: '1.5rem', letterSpacing: '-0.03em', color: '#0f172a' }}>Active applications</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {activeApplications.map((app) => {
              const status = statusConfig[app.status];
              const StatusIcon = status.icon;

              return (
                <div
                  key={app.id}
                  style={{
                    background: '#fff',
                    borderRadius: 16,
                    padding: 24,
                    boxShadow: '0 1px 4px rgba(30,58,138,0.03)',
                    border: '1px solid #F1F5F9',
                    transition: 'box-shadow 0.2s',
                  }}
                  onMouseOver={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(30,58,138,0.08)')}
                  onMouseOut={e => (e.currentTarget.style.boxShadow = '0 1px 4px rgba(30,58,138,0.03)')}
                  className="tp-card-soft"
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ marginBottom: 8 }}>{app.jobTitle}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 15, color: '#64748B' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Briefcase className="w-4 h-4" />
                          <span>{app.department}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <MapPin className="w-4 h-4" />
                          <span>{app.location}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ padding: '8px 16px', borderRadius: 9999, display: 'flex', alignItems: 'center', gap: 8, background: status.color.includes('bg-[#FF5F1F]') ? 'rgba(255,95,31,0.10)' : status.color.includes('bg-blue-100') ? '#DBEAFE' : status.color.includes('bg-green-100') ? '#D1FAE5' : status.color.includes('bg-gray-100') ? '#F3F4F6' : '#fff', color: status.color.includes('text-[#FF5F1F]') ? '#FF5F1F' : status.color.includes('text-blue-700') ? '#1D4ED8' : status.color.includes('text-green-700') ? '#15803D' : status.color.includes('text-gray-700') ? '#374151' : '#374151' }}>
                      <StatusIcon className="w-4 h-4" />
                      <span style={{ fontSize: 14 }}>{status.label}</span>
                    </div>
                  </div>

                  {app.status === 'interview_scheduled' && (
                    <div style={{ background: 'rgba(255,95,31,0.05)', border: '1px solid rgba(255,95,31,0.20)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        <Calendar className="w-5 h-5 text-[#FF5F1F]" style={{ marginTop: 2 }} />
                        <div>
                          <div style={{ fontWeight: 500, color: '#0F172A', marginBottom: 4 }}>Interview Details</div>
                          <div style={{ fontSize: 15, color: '#374151' }}>
                            Scheduled with {app.interviewer} on {app.interviewDate}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid #F1F5F9' }}>
                    <div style={{ fontSize: 15, color: '#64748B' }}>
                      Applied on {app.appliedDate} · Updated {app.lastUpdate}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button style={{ padding: '8px 16px', color: '#374151', background: 'none', border: 'none', borderRadius: 8, transition: 'background 0.2s', display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, cursor: 'pointer' }} onMouseOver={e => (e.currentTarget.style.background = '#F4F4F9')} onMouseOut={e => (e.currentTarget.style.background = 'none')}>
                        <Download className="w-4 h-4" />
                        View Application
                      </button>
                      <button style={{ padding: '8px 16px', background: '#FF5F1F', color: '#fff', border: 'none', borderRadius: 8, transition: 'background 0.2s', display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 500, cursor: 'pointer' }} onMouseOver={e => (e.currentTarget.style.background = '#E55519')} onMouseOut={e => (e.currentTarget.style.background = '#FF5F1F')}>
                        <MessageSquare className="w-4 h-4" />
                        Contact HR
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {pastApplications.length > 0 && (
          <div>
            <h3 style={{ marginBottom: 16, fontSize: '1.25rem', letterSpacing: '-0.02em', color: '#0f172a' }}>Past applications</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {pastApplications.map((app) => {
                const status = statusConfig[app.status];
                const StatusIcon = status.icon;

                return (
                  <div
                    key={app.id}
                    className="tp-card-soft"
                    style={{ opacity: 0.75 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ marginBottom: 8 }}>{app.jobTitle}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 15, color: '#64748B' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Briefcase className="w-4 h-4" />
                            <span>{app.department}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <MapPin className="w-4 h-4" />
                            <span>{app.location}</span>
                          </div>
                          <div style={{ fontSize: 13 }}>Applied {app.appliedDate}</div>
                        </div>
                      </div>
                      <div style={{ padding: '8px 16px', borderRadius: 9999, display: 'flex', alignItems: 'center', gap: 8, background: status.color.includes('bg-[#FF5F1F]') ? 'rgba(255,95,31,0.10)' : status.color.includes('bg-blue-100') ? '#DBEAFE' : status.color.includes('bg-green-100') ? '#D1FAE5' : status.color.includes('bg-gray-100') ? '#F3F4F6' : '#fff', color: status.color.includes('text-[#FF5F1F]') ? '#FF5F1F' : status.color.includes('text-blue-700') ? '#1D4ED8' : status.color.includes('text-green-700') ? '#15803D' : status.color.includes('text-gray-700') ? '#374151' : '#374151' }}>
                        <StatusIcon className="w-4 h-4" />
                        <span style={{ fontSize: 14 }}>{status.label}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyApplications;