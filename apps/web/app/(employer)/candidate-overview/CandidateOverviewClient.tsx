"use client";

// Applicant manager for one job (#47, #48).
// Lists the applicants of a job, shows the candidate's real profile, cover letter and documents,
// and lets the employer change the application status (the candidate gets an email).
// AI match details are shown only when an AI evaluation exists (AI matching is off by default).
// Replaces an earlier AI-only view that had no status control and placeholder data.
// Author: Ryan Naidji
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { authFetch } from "@/app/util/session";
import { openProtectedFile } from "@/app/util/files";

type Status = "PENDING" | "REVIEWED" | "SHORTLISTED" | "REJECTED" | "HIRED";

type Applicant = {
  id: string;
  status: Status;
  createdAt: string;
  coverLetter?: string;
  resumeFileUrl?: string;
  coverLetterFileUrl?: string;
  candidate: {
    user?: { _id?: string; email?: string; profile?: { firstName?: string; lastName?: string } };
    profile?: {
      headline?: string;
      jobTitleOrDesiredRole?: string;
      location?: string;
      yearsOfExperience?: string;
      skills?: string[];
      professionalSummary?: string;
      bio?: string;
      phoneNumber?: string;
      linkedinUrl?: string;
      portfolioUrl?: string;
      resumeUrl?: string;
    } | null;
  };
  aiMatch?: { status?: string; overallScore?: number; recommendation?: string; recruiterSummary?: string; matchedSkills?: string[]; missingSkills?: string[] };
};

const STATUS: Record<Status, { label: string; bg: string; fg: string }> = {
  PENDING: { label: "New", bg: "#DBEAFE", fg: "#1D4ED8" },
  REVIEWED: { label: "Reviewed", bg: "#E0E7FF", fg: "#3730A3" },
  SHORTLISTED: { label: "Shortlisted", bg: "#FEF3C7", fg: "#92400E" },
  REJECTED: { label: "Not selected", bg: "#F3F4F6", fg: "#374151" },
  HIRED: { label: "Hired", bg: "#D1FAE5", fg: "#15803D" },
};
const STATUS_ORDER: Status[] = ["PENDING", "REVIEWED", "SHORTLISTED", "REJECTED", "HIRED"];

const nameOf = (a: Applicant) =>
  [a.candidate.user?.profile?.firstName, a.candidate.user?.profile?.lastName].filter(Boolean).join(" ") || a.candidate.user?.email || "Candidate";
const fmt = (iso: string) => new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

const card: React.CSSProperties = { background: "white", border: "1px solid #e2e8f0", borderRadius: 12, padding: "1rem 1.25rem" };
const control: React.CSSProperties = { padding: "0.55rem 0.75rem", borderRadius: 8, border: "1px solid #cbd5e1", background: "white", fontSize: "0.92rem" };

function Badge({ status }: { status: Status }) {
  const s = STATUS[status] ?? STATUS.PENDING;
  return <span style={{ background: s.bg, color: s.fg, padding: "0.2rem 0.6rem", borderRadius: 999, fontSize: "0.8rem", fontWeight: 700, whiteSpace: "nowrap" }}>{s.label}</span>;
}

export default function CandidateOverviewClient({ jobId: jobIdOverride }: { jobId?: string } = {}) {
  const searchParams = useSearchParams();
  const jobId = jobIdOverride ?? searchParams.get("jobId") ?? undefined;

  const [applicants, setApplicants] = useState<Applicant[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | Status>("ALL");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const load = useCallback(async () => {
    if (!jobId) return;
    setError(null);
    try {
      const res = await authFetch(`/api/v1/applications/job/${encodeURIComponent(jobId)}?limit=100`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Could not load applicants");
      const list = (data.applications ?? []) as Applicant[];
      setApplicants(list);
      setSelectedId((cur) => cur ?? list[0]?.id ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load applicants");
    }
  }, [jobId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading data on mount
    setApplicants(null);
    setSelectedId(null);
    void load();
  }, [load]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (applicants ?? []).filter((a) => {
      if (statusFilter !== "ALL" && a.status !== statusFilter) return false;
      if (!q) return true;
      const p = a.candidate.profile;
      return [nameOf(a), a.candidate.user?.email, p?.jobTitleOrDesiredRole, p?.location, ...(p?.skills ?? [])]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [applicants, query, statusFilter]);

  const selected = (applicants ?? []).find((a) => a.id === selectedId) ?? null;

  async function changeStatus(app: Applicant, status: Status) {
    if (status === app.status) return;
    if ((status === "REJECTED" || status === "HIRED") &&
      !window.confirm(`Mark ${nameOf(app)} as "${STATUS[status].label}"? The candidate will be notified by email.`)) return;
    setSaving(true);
    setNotice(null);
    try {
      const res = await authFetch(`/api/v1/applications/${app.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Could not update the status");
      setApplicants((list) => (list ?? []).map((a) => (a.id === app.id ? { ...a, status } : a)));
      setNotice({ kind: "ok", text: `${nameOf(app)} is now "${STATUS[status].label}". The candidate has been notified.` });
    } catch (err) {
      setNotice({ kind: "error", text: err instanceof Error ? err.message : "Could not update the status" });
    } finally {
      setSaving(false);
    }
  }

  async function openFile(url: string) {
    const ok = await openProtectedFile(url);
    if (!ok) setNotice({ kind: "error", text: "This document could not be opened." });
  }

  if (!jobId) return <p style={{ color: "#475569" }}>Select a job to see its applicants.</p>;
  if (error) return <p role="alert" style={{ color: "#991b1b", background: "#fef2f2", padding: "0.75rem 1rem", borderRadius: 10 }}>{error}</p>;
  if (!applicants) return <p role="status" style={{ color: "#475569" }}>Loading applicants…</p>;
  if (applicants.length === 0) return <div style={card}><p style={{ margin: 0, color: "#475569" }}>No applications for this job yet.</p></div>;

  const counts = STATUS_ORDER.map((s) => [s, applicants.filter((a) => a.status === s).length] as const);
  const p = selected?.candidate.profile;
  const resumeUrl = selected?.resumeFileUrl || p?.resumeUrl;

  return (
    <div className="am-layout" style={{ display: "grid", gridTemplateColumns: "minmax(16rem, 22rem) 1fr", gap: "1rem", alignItems: "start" }}>
      {/* Applicant list */}
      <section aria-labelledby="am-list-heading" style={{ ...card, padding: "1rem", display: "grid", gap: "0.75rem" }}>
        <h2 id="am-list-heading" style={{ margin: 0, fontSize: "1rem" }}>Applicants ({applicants.length})</h2>
        <p style={{ margin: 0, fontSize: "0.8rem", color: "#475569" }}>
          {counts.filter(([, n]) => n > 0).map(([s, n]) => `${STATUS[s].label}: ${n}`).join(" · ")}
        </p>
        <label style={{ display: "grid", gap: 4, fontSize: "0.8rem", fontWeight: 700 }}>
          Search applicants
          <input style={control} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name, skill, location" />
        </label>
        <label style={{ display: "grid", gap: 4, fontSize: "0.8rem", fontWeight: 700 }}>
          Status
          <select style={control} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as "ALL" | Status)}>
            <option value="ALL">All statuses</option>
            {STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUS[s].label}</option>)}
          </select>
        </label>
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "0.4rem" }}>
          {visible.map((a) => {
            const active = a.id === selectedId;
            return (
              <li key={a.id}>
                <button
                  type="button"
                  aria-current={active ? "true" : undefined}
                  onClick={() => { setSelectedId(a.id); setNotice(null); }}
                  style={{ width: "100%", textAlign: "left", display: "grid", gap: 4, padding: "0.65rem 0.75rem", borderRadius: 10, cursor: "pointer", border: active ? "2px solid #1d4ed8" : "1px solid #e2e8f0", background: active ? "#eff6ff" : "white" }}
                >
                  <span style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                    <strong style={{ fontSize: "0.92rem", color: "#0f172a" }}>{nameOf(a)}</strong>
                    <Badge status={a.status} />
                  </span>
                  <span style={{ fontSize: "0.8rem", color: "#475569" }}>
                    {[a.candidate.profile?.jobTitleOrDesiredRole, `applied ${fmt(a.createdAt)}`].filter(Boolean).join(" · ")}
                  </span>
                </button>
              </li>
            );
          })}
          {visible.length === 0 && <li style={{ color: "#475569", fontSize: "0.88rem" }}>No applicant matches these filters.</li>}
        </ul>
      </section>

      {/* Applicant detail */}
      {selected && (
        <section aria-labelledby="am-detail-heading" style={{ display: "grid", gap: "1rem" }}>
          <div style={{ ...card, display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", alignItems: "flex-start" }}>
            <div>
              <h2 id="am-detail-heading" style={{ margin: 0, fontSize: "1.35rem" }}>{nameOf(selected)}</h2>
              <p style={{ margin: "0.25rem 0 0", color: "#475569" }}>
                {[p?.jobTitleOrDesiredRole || p?.headline, p?.location, p?.yearsOfExperience && `${p.yearsOfExperience} years of experience`].filter(Boolean).join(" · ") || "Profile not completed"}
              </p>
              <p style={{ margin: "0.4rem 0 0", fontSize: "0.88rem", color: "#334155" }}>
                <a href={`mailto:${selected.candidate.user?.email}`}>{selected.candidate.user?.email}</a>
                {p?.phoneNumber && <> · <a href={`tel:${p.phoneNumber}`}>{p.phoneNumber}</a></>}
                {p?.linkedinUrl && <> · <a href={p.linkedinUrl} target="_blank" rel="noopener noreferrer">LinkedIn</a></>}
              </p>
            </div>
            <label style={{ display: "grid", gap: 4, fontSize: "0.8rem", fontWeight: 700, minWidth: "12rem" }}>
              Application status
              <select
                style={control}
                value={selected.status}
                disabled={saving}
                onChange={(e) => void changeStatus(selected, e.target.value as Status)}
              >
                {STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUS[s].label}</option>)}
              </select>
            </label>
          </div>

          <div aria-live="polite">
            {notice && (
              <p role={notice.kind === "error" ? "alert" : "status"} style={{ margin: 0, padding: "0.65rem 0.9rem", borderRadius: 10, background: notice.kind === "ok" ? "#ecfdf5" : "#fef2f2", color: notice.kind === "ok" ? "#065f46" : "#991b1b" }}>
                {notice.text}
              </p>
            )}
          </div>

          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {resumeUrl ? (
              <button type="button" className="tp-btn-secondary" style={{ padding: "0.55rem 1rem" }} onClick={() => void openFile(resumeUrl)}>Open resume</button>
            ) : (
              <span style={{ color: "#475569", fontSize: "0.9rem" }}>No resume uploaded</span>
            )}
            {selected.coverLetterFileUrl && (
              <button type="button" className="tp-btn-secondary" style={{ padding: "0.55rem 1rem" }} onClick={() => void openFile(selected.coverLetterFileUrl!)}>Open cover letter file</button>
            )}
          </div>

          {(p?.skills?.length ?? 0) > 0 && (
            <div style={card}>
              <h3 style={{ margin: "0 0 0.5rem", fontSize: "1rem" }}>Skills</h3>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {p!.skills!.map((s) => <li key={s} style={{ background: "#f1f5f9", color: "#334155", padding: "0.2rem 0.6rem", borderRadius: 999, fontSize: "0.82rem" }}>{s}</li>)}
              </ul>
            </div>
          )}

          {(p?.professionalSummary || p?.bio) && (
            <div style={card}>
              <h3 style={{ margin: "0 0 0.5rem", fontSize: "1rem" }}>Summary</h3>
              <p style={{ margin: 0, color: "#334155", lineHeight: 1.6 }}>{p?.professionalSummary || p?.bio}</p>
            </div>
          )}

          <div style={card}>
            <h3 style={{ margin: "0 0 0.5rem", fontSize: "1rem" }}>Cover letter</h3>
            <p style={{ margin: 0, color: "#334155", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{selected.coverLetter || "No cover letter."}</p>
          </div>

          {selected.aiMatch?.status === "COMPLETED" && (
            <div style={card}>
              <h3 style={{ margin: "0 0 0.25rem", fontSize: "1rem" }}>AI match (advisory)</h3>
              <p style={{ margin: "0 0 0.5rem", fontSize: "0.8rem", color: "#475569" }}>Scores help prioritize review; hiring decisions are made by your team.</p>
              <p style={{ margin: 0 }}>Score: <strong>{selected.aiMatch.overallScore ?? "–"}</strong> · {selected.aiMatch.recommendation}</p>
              {selected.aiMatch.recruiterSummary && <p style={{ margin: "0.5rem 0 0", color: "#334155" }}>{selected.aiMatch.recruiterSummary}</p>}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
