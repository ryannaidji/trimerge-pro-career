"use client";

// Jobs recommended from the candidate's profile (#52) — rule-based, no AI.
// Author: Ryan Naidji
import { useEffect, useState } from "react";
import Link from "next/link";
import { authFetch } from "@/app/util/session";
import JobList, { type JobSummary } from "@/app/components/ui/JobList";

type Rec = { job: { id?: string; _id?: string; title?: string; location?: string; department?: string; employmentType?: string; status?: string }; matchedSkills: string[] };

export default function RecommendedJobsPage() {
  const [jobs, setJobs] = useState<JobSummary[] | null>(null);
  const [profileComplete, setProfileComplete] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    authFetch("/api/v1/recommendations/jobs")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Could not load recommendations");
        setProfileComplete(Boolean(data.profileComplete));
        setJobs(
          ((data.recommendations ?? []) as Rec[]).map((r) => ({
            id: String(r.job.id ?? r.job._id),
            title: r.job.title,
            location: r.job.location,
            department: r.job.department,
            employmentType: r.job.employmentType,
            status: r.job.status,
            reason: r.matchedSkills.length ? `Matches your skills: ${r.matchedSkills.join(", ")}` : "Matches your desired role",
          }))
        );
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load recommendations"));
  }, []);

  return (
    <div className="tp-container" style={{ padding: "2.5rem 0", display: "grid", gap: "1.25rem", maxWidth: "52rem" }}>
      <header>
        <div className="tp-kicker">Candidate</div>
        <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.4rem)", margin: "0.3rem 0 0" }}>Recommended jobs</h1>
        <p style={{ color: "#475569", margin: "0.4rem 0 0" }}>Open positions that match the skills and role in your profile. Jobs you already applied to are not shown.</p>
      </header>
      {error && <p role="alert" style={{ color: "#991b1b", background: "#fef2f2", padding: "0.75rem 1rem", borderRadius: 10 }}>{error}</p>}
      {!jobs && !error && <p role="status">Finding jobs for you…</p>}
      {jobs && jobs.length === 0 && (
        <div className="tp-card" style={{ padding: "1.5rem", display: "grid", gap: "0.75rem", justifyItems: "start" }}>
          <p style={{ margin: 0, color: "#475569" }}>
            {profileComplete ? "No matching open job right now. Check back soon or browse all jobs." : "Add your skills and desired role to your profile to get recommendations."}
          </p>
          <Link href={profileComplete ? "/browse-jobs" : "/profile"} className="tp-btn-primary">{profileComplete ? "Browse jobs" : "Complete my profile"}</Link>
        </div>
      )}
      {jobs && jobs.length > 0 && <JobList jobs={jobs} />}
    </div>
  );
}
