"use client";

// Candidate search for employers (#41) — keyword, skill and location search, no AI.
// Results are ranked by the API (skills > title > summary/resume text) and show only
// what is needed to shortlist; personal contact details are not exposed here.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/app/util/apiUrl";
import SlowRequestNotice from "@/app/components/ui/SlowRequestNotice";

type Result = {
  candidateId: string;
  name: string;
  title: string;
  location: string;
  yearsOfExperience: string;
  skills: string[];
  matchedSkills: string[];
  hasResume: boolean;
  score: number;
};

const input: React.CSSProperties = { padding: "0.7rem 0.9rem", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.95rem", minWidth: 0 };

export default function TalentSearchPage() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [skills, setSkills] = useState("");
  const [location, setLocation] = useState("");
  const [results, setResults] = useState<Result[] | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function search(e?: React.FormEvent) {
    e?.preventDefault();
    let token: string | null = null;
    try { token = localStorage.getItem("tm_token"); } catch { /* storage unavailable */ }
    if (!token) return router.replace("/login");
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ q, skills, location, limit: "30" });
      const res = await fetch(`${API_URL}/api/v1/candidates/search?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401) return router.replace("/login");
      if (res.status === 403) return router.replace("/unauthorized");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Search failed");
      setResults(data.candidates);
      setTotal(data.pagination.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="tp-container" style={{ padding: "3rem 0", display: "grid", gap: "1.5rem" }}>
      <header>
        <div className="tp-kicker">Employers</div>
        <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", margin: "0.3rem 0 0" }}>Find talent</h1>
        <p style={{ color: "var(--tp-muted)", marginTop: "0.4rem" }}>
          Search candidate profiles by role, keywords, skills and location. Results are ranked by relevance; you decide who to contact.
        </p>
      </header>

      <form onSubmit={search} className="tp-card" style={{ padding: "1.25rem", display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "flex-end" }}>
        <label style={{ display: "grid", gap: "0.3rem", flex: "2 1 14rem" }}>
          <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>Role or keywords</span>
          <input style={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. cloud engineer, grants, FEMA" />
        </label>
        <label style={{ display: "grid", gap: "0.3rem", flex: "2 1 14rem" }}>
          <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>Skills (comma-separated)</span>
          <input style={input} value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="e.g. AWS, NIST, PMP" />
        </label>
        <label style={{ display: "grid", gap: "0.3rem", flex: "1 1 10rem" }}>
          <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>Location</span>
          <input style={input} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Miami" />
        </label>
        <button type="submit" className="tp-btn-primary" disabled={loading}>{loading ? "Searching…" : "Search"}</button>
      </form>

      <SlowRequestNotice active={loading} />
      {error && <p role="alert" style={{ color: "#991b1b", background: "#fef2f2", padding: "0.75rem 1rem", borderRadius: "10px" }}>{error}</p>}

      {results && (
        <section aria-labelledby="results-heading" style={{ display: "grid", gap: "0.9rem" }}>
          <h2 id="results-heading" role="status" style={{ fontSize: "1.1rem", margin: 0 }}>
            {total === 0 ? "No candidates match. Try fewer or broader terms." : `${total} candidate${total === 1 ? "" : "s"} found`}
          </h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.9rem" }}>
            {results.map((r) => (
              <li key={r.candidateId} className="tp-card" style={{ padding: "1.1rem 1.25rem", display: "grid", gap: "0.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.05rem" }}>{r.name || "Candidate"}</h3>
                    <div style={{ color: "#475569", fontSize: "0.9rem" }}>
                      {[r.title, r.location, r.yearsOfExperience && `${r.yearsOfExperience} yrs experience`].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#475569" }}>{r.hasResume ? "Resume on file" : "No resume yet"}</div>
                </div>
                {r.skills.length > 0 && (
                  <ul aria-label="Skills" style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                    {r.skills.map((s) => {
                      const hit = r.matchedSkills.includes(s.toLowerCase());
                      return (
                        <li key={s} style={{ padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.8rem", background: hit ? "#dbeafe" : "#f1f5f9", color: hit ? "#1e3a8a" : "#334155", fontWeight: hit ? 700 : 500 }}>
                          {s}{hit ? <span className="sr-only"> (matches your search)</span> : null}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
