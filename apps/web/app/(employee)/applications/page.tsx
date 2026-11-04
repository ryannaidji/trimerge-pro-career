"use client"

// My applications: real data from GET /api/v1/applications/my-applications.
// Previously this page displayed hard-coded sample applications and never called the API.
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Briefcase, MapPin, Clock, CheckCircle2, XCircle, Star, Eye } from 'lucide-react';
import { API_URL } from '@/app/util/apiUrl';
import SlowRequestNotice from '@/app/components/ui/SlowRequestNotice';

type ApiStatus = 'PENDING' | 'REVIEWED' | 'SHORTLISTED' | 'REJECTED' | 'HIRED';

type Application = {
  id: string;
  status: ApiStatus;
  createdAt: string;
  updatedAt: string;
  job?: { title?: string; department?: string; location?: string; employmentType?: string; status?: string } | null;
};

const statusConfig: Record<ApiStatus, { label: string; icon: typeof Clock; background: string; color: string }> = {
  PENDING: { label: 'Submitted', icon: Clock, background: '#DBEAFE', color: '#1D4ED8' },
  REVIEWED: { label: 'Under review', icon: Eye, background: '#E0E7FF', color: '#3730A3' },
  SHORTLISTED: { label: 'Shortlisted', icon: Star, background: '#FEF3C7', color: '#92400E' },
  REJECTED: { label: 'Not selected', icon: XCircle, background: '#F3F4F6', color: '#374151' },
  HIRED: { label: 'Offer extended', icon: CheckCircle2, background: '#D1FAE5', color: '#15803D' },
};

const formatDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
const titleCase = (s?: string) => (s ? s.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : '');

function StatusBadge({ status }: { status: ApiStatus }) {
  const cfg = statusConfig[status] ?? statusConfig.PENDING;
  const Icon = cfg.icon;
  return (
    <div style={{ padding: '8px 16px', borderRadius: 9999, display: 'flex', alignItems: 'center', gap: 8, background: cfg.background, color: cfg.color, whiteSpace: 'nowrap' }}>
      <Icon className="w-4 h-4" aria-hidden="true" />
      <span style={{ fontSize: 14, fontWeight: 600 }}>{cfg.label}</span>
    </div>
  );
}

function ApplicationCard({ app, past = false }: { app: Application; past?: boolean }) {
  const Heading = 'h3';
  return (
    <li className="tp-card-soft" style={{ padding: 24, listStyle: 'none', opacity: past ? 0.85 : 1 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '12rem' }}>
          <Heading style={{ margin: '0 0 8px' }}>{app.job?.title || 'Job no longer available'}</Heading>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 15, color: '#475569', flexWrap: 'wrap' }}>
            {app.job?.department && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Briefcase className="w-4 h-4" aria-hidden="true" />{titleCase(app.job.department)}</span>
            )}
            {app.job?.location && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><MapPin className="w-4 h-4" aria-hidden="true" />{app.job.location}</span>
            )}
          </div>
        </div>
        <StatusBadge status={app.status} />
      </div>
      <div style={{ paddingTop: 16, marginTop: 16, borderTop: '1px solid #F1F5F9', fontSize: 15, color: '#475569' }}>
        Applied on {formatDate(app.createdAt)} · Updated {formatDate(app.updatedAt)}
        {app.job?.status && app.job.status !== 'OPEN' && <> · This posting is now {app.job.status.toLowerCase()}</>}
      </div>
    </li>
  );
}

export function MyApplications() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let token: string | null = null;
    try { token = localStorage.getItem('tm_token'); } catch { /* storage unavailable */ }
    if (!token) {
      router.replace('/login');
      return;
    }
    fetch(`${API_URL}/api/v1/applications/my-applications?limit=50`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (res) => {
        if (res.status === 401) return router.replace('/session-expired');
        if (res.status === 403) return router.replace('/unauthorized');
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || 'Could not load your applications');
        setApplications(data.applications ?? []);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load your applications'));
  }, [router]);

  const list = applications ?? [];
  const active = list.filter((a) => a.status === 'PENDING' || a.status === 'REVIEWED' || a.status === 'SHORTLISTED');
  const past = list.filter((a) => a.status === 'REJECTED' || a.status === 'HIRED');
  const count = (s: ApiStatus) => list.filter((a) => a.status === s).length;

  return (
    <div style={{ flex: 1, minHeight: '90vh', overflowY: 'auto', background: 'linear-gradient(180deg, #f8fbff 0%, #f4f7fb 42%, #eef4fb 100%)' }}>
      <div className="tp-container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div className="tp-card-soft tp-fade-up" style={{ marginBottom: '1.25rem', padding: '1.5rem', background: 'linear-gradient(135deg, #07172e 0%, #1d4ed8 100%)', color: 'white', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div>
              <div className="tp-chip" style={{ background: 'rgba(255,255,255,0.12)', color: 'white', borderColor: 'rgba(255,255,255,0.14)' }}>Application tracker</div>
              <h1 style={{ margin: '0.85rem 0 0.45rem', fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.05em' }}>My applications</h1>
              <p style={{ margin: 0, maxWidth: '42rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.75 }}>Follow the status of every application. You also receive an email when an employer updates it.</p>
            </div>
            <div style={{ display: 'grid', gap: '0.5rem', minWidth: '14rem' }}>
              <div style={{ fontSize: '0.82rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)' }}>Active applications</div>
              <div style={{ fontSize: '2rem', fontWeight: 800 }}>{applications ? active.length : '–'}</div>
            </div>
          </div>
        </div>

        {error && <p role="alert" style={{ color: '#991b1b', background: '#fef2f2', border: '1px solid #fecaca', padding: '0.85rem 1rem', borderRadius: 12 }}>{error}</p>}

        {!applications && !error && (
          <div role="status" style={{ display: 'grid', gap: 12, padding: '2rem 0', color: '#475569' }}>
            <span>Loading your applications…</span>
            <SlowRequestNotice active />
          </div>
        )}

        {applications && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              {([['Submitted', count('PENDING')], ['Under review', count('REVIEWED')], ['Shortlisted', count('SHORTLISTED')]] as const).map(([label, n]) => (
                <div key={label} className="tp-card-soft" style={{ padding: '1.25rem' }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>{n}</div>
                  <div style={{ color: '#475569', fontSize: 14 }}>{label}</div>
                </div>
              ))}
            </div>

            {list.length === 0 ? (
              <div className="tp-card-soft" style={{ padding: '2rem', textAlign: 'center', display: 'grid', gap: '1rem', justifyItems: 'center' }}>
                <p style={{ margin: 0, color: '#475569' }}>You have not applied to any job yet.</p>
                <Link href="/browse-jobs" className="tp-btn-primary">Browse jobs</Link>
              </div>
            ) : (
              <>
                <section aria-labelledby="active-heading" style={{ marginBottom: 24 }}>
                  <h2 id="active-heading" style={{ marginBottom: 16, fontSize: '1.5rem', letterSpacing: '-0.03em', color: '#0f172a' }}>Active applications</h2>
                  {active.length === 0 ? (
                    <p style={{ color: '#475569' }}>No active applications.</p>
                  ) : (
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 0, margin: 0 }}>
                      {active.map((app) => <ApplicationCard key={app.id} app={app} />)}
                    </ul>
                  )}
                </section>

                {past.length > 0 && (
                  <section aria-labelledby="past-heading">
                    <h2 id="past-heading" style={{ marginBottom: 16, fontSize: '1.25rem', letterSpacing: '-0.02em', color: '#0f172a' }}>Past applications</h2>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 0, margin: 0 }}>
                      {past.map((app) => <ApplicationCard key={app.id} app={app} past />)}
                    </ul>
                  </section>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default MyApplications;
