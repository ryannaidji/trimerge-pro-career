"use client";

// Candidate "My profile" (#50): view and edit the profile after onboarding, replace the resume,
// and choose whether employers can find the profile in talent search (#60).
// Author: Ryan Naidji
import { useEffect, useState } from "react";
import { authFetch } from "@/app/util/session";
import { openProtectedFile } from "@/app/util/files";
import { YEARS_OF_EXPERIENCE_OPTIONS } from "@/app/(authentication)/(candidateAuth)/personal-information/step-one/constants";

type Profile = {
  phoneNumber?: string;
  location?: string;
  jobTitleOrDesiredRole?: string;
  yearsOfExperience?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  skills?: string[];
  professionalSummary?: string;
  searchable?: boolean;
  resumeUrl?: string;
  resumeOriginalName?: string;
  resumeUploadedAt?: string;
};

const field: React.CSSProperties = { padding: "0.7rem 0.9rem", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: "1rem", width: "100%", boxSizing: "border-box" };
const labelStyle: React.CSSProperties = { display: "grid", gap: "0.35rem", fontWeight: 700, fontSize: "0.9rem", color: "#0f172a" };
const section: React.CSSProperties = { padding: "1.5rem", display: "grid", gap: "1rem" };

export default function MyProfilePage() {
  const [form, setForm] = useState<Profile | null>(null);
  const [skillsText, setSkillsText] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    authFetch("/api/v1/candidates/me")
      .then(async (res) => {
        const data = await res.json();
        if (res.status === 404) {
          setForm({ searchable: true });
          return;
        }
        if (!res.ok) throw new Error(data?.message || "Could not load your profile");
        const p = (data.profile ?? {}) as Profile;
        setForm({ ...p, searchable: p.searchable !== false });
        setSkillsText((p.skills ?? []).join(", "));
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Could not load your profile"));
  }, []);

  const set = (key: keyof Profile) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...(f ?? {}), [key]: e.target.value }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setMessage(null);
    const payload: Record<string, unknown> = {
      skills: skillsText.split(",").map((s) => s.trim()).filter(Boolean),
      searchable: form.searchable !== false,
    };
    for (const key of ["phoneNumber", "location", "jobTitleOrDesiredRole", "yearsOfExperience", "linkedinUrl", "portfolioUrl", "professionalSummary"] as const) {
      const value = (form[key] ?? "").toString().trim();
      if (value) payload[key] = value;
    }
    try {
      const res = await authFetch("/api/v1/candidates/me", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const details = data?.errors ? Object.entries(data.errors).map(([k, v]) => `${k}: ${(v as string[]).join(", ")}`).join("; ") : "";
        throw new Error(details ? `Please check: ${details}` : data?.message || "Could not save your profile");
      }
      setMessage({ kind: "ok", text: "Your profile has been saved." });
    } catch (err) {
      setMessage({ kind: "error", text: err instanceof Error ? err.message : "Could not save your profile" });
    } finally {
      setSaving(false);
    }
  }

  async function uploadResume(file: File | null) {
    if (!file) return;
    setUploading(true);
    setMessage(null);
    try {
      const fd = new FormData();
      fd.append("resume", file);
      const res = await authFetch("/api/v1/resumes/upload", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Could not upload your resume");
      setForm((f) => ({ ...(f ?? {}), resumeUrl: data.resume?.resumeUrl, resumeOriginalName: data.resume?.originalName, resumeUploadedAt: new Date().toISOString() }));
      setMessage({ kind: "ok", text: "Your new resume has been uploaded." });
    } catch (err) {
      setMessage({ kind: "error", text: err instanceof Error ? err.message : "Could not upload your resume" });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="tp-container" style={{ padding: "2.5rem 0", display: "grid", gap: "1.25rem", maxWidth: "52rem" }}>
      <header>
        <div className="tp-kicker">Candidate</div>
        <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.4rem)", margin: "0.3rem 0 0" }}>My profile</h1>
        <p style={{ color: "#475569", margin: "0.4rem 0 0" }}>Keep your profile up to date so employers see your current experience.</p>
      </header>

      {loadError && <p role="alert" style={{ color: "#991b1b", background: "#fef2f2", padding: "0.75rem 1rem", borderRadius: 10 }}>{loadError}</p>}
      {!form && !loadError && <p role="status">Loading your profile…</p>}

      <div aria-live="polite">
        {message && (
          <p role={message.kind === "error" ? "alert" : "status"} style={{ margin: 0, padding: "0.75rem 1rem", borderRadius: 10, background: message.kind === "ok" ? "#ecfdf5" : "#fef2f2", color: message.kind === "ok" ? "#065f46" : "#991b1b" }}>
            {message.text}
          </p>
        )}
      </div>

      {form && (
        <>
          <section className="tp-card" style={section} aria-labelledby="resume-heading">
            <h2 id="resume-heading" style={{ margin: 0, fontSize: "1.2rem" }}>Resume</h2>
            {form.resumeUrl ? (
              <p style={{ margin: 0, color: "#334155" }}>
                Current resume{form.resumeOriginalName ? `: ${form.resumeOriginalName}` : ""}
                {form.resumeUploadedAt ? ` (uploaded ${new Date(form.resumeUploadedAt).toLocaleDateString()})` : ""}.{" "}
                <button type="button" onClick={() => void openProtectedFile(form.resumeUrl!)} style={{ background: "none", border: "none", padding: 0, color: "#1d4ed8", textDecoration: "underline", cursor: "pointer", fontSize: "1rem" }}>
                  Download
                </button>
              </p>
            ) : (
              <p style={{ margin: 0, color: "#475569" }}>No resume uploaded yet.</p>
            )}
            <label style={labelStyle}>
              {form.resumeUrl ? "Replace resume" : "Upload resume"} (PDF or DOCX, up to 5 MB)
              <input type="file" accept=".pdf,.docx" disabled={uploading} onChange={(e) => void uploadResume(e.target.files?.[0] ?? null)} />
            </label>
            {uploading && <p role="status" style={{ margin: 0 }}>Uploading…</p>}
          </section>

          <form onSubmit={save} className="tp-card" style={section} aria-labelledby="details-heading">
            <h2 id="details-heading" style={{ margin: 0, fontSize: "1.2rem" }}>Details</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(14rem, 1fr))", gap: "1rem" }}>
              <label style={labelStyle}>Desired role<input style={field} value={form.jobTitleOrDesiredRole ?? ""} onChange={set("jobTitleOrDesiredRole")} /></label>
              <label style={labelStyle}>
                Years of experience
                <select style={field} value={form.yearsOfExperience ?? ""} onChange={set("yearsOfExperience")}>
                  <option value="">Select</option>
                  {YEARS_OF_EXPERIENCE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </label>
              <label style={labelStyle}>Location<input style={field} value={form.location ?? ""} onChange={set("location")} placeholder="City, State" /></label>
              <label style={labelStyle}>Phone<input style={field} type="tel" autoComplete="tel" value={form.phoneNumber ?? ""} onChange={set("phoneNumber")} /></label>
              <label style={labelStyle}>LinkedIn URL<input style={field} type="url" value={form.linkedinUrl ?? ""} onChange={set("linkedinUrl")} placeholder="https://www.linkedin.com/in/…" /></label>
              <label style={labelStyle}>Portfolio URL<input style={field} type="url" value={form.portfolioUrl ?? ""} onChange={set("portfolioUrl")} placeholder="https://…" /></label>
            </div>
            <label style={labelStyle}>
              Skills (comma-separated)
              <input style={field} value={skillsText} onChange={(e) => setSkillsText(e.target.value)} placeholder="e.g. AWS, Grants Management, PMP" />
            </label>
            <label style={labelStyle}>
              Professional summary
              <textarea style={{ ...field, minHeight: "8rem", resize: "vertical" }} maxLength={800} value={form.professionalSummary ?? ""} onChange={set("professionalSummary")} />
            </label>
            <label style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start", fontSize: "0.95rem" }}>
              <input
                type="checkbox"
                checked={form.searchable !== false}
                onChange={(e) => setForm((f) => ({ ...(f ?? {}), searchable: e.target.checked }))}
                style={{ width: 20, height: 20, marginTop: 2 }}
              />
              <span>
                <strong>Visible to employers in talent search</strong>
                <br />
                <span style={{ color: "#475569" }}>When off, employers only see your profile if you apply to their jobs.</span>
              </span>
            </label>
            <div>
              <button type="submit" className="tp-btn-primary" disabled={saving}>{saving ? "Saving…" : "Save profile"}</button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
