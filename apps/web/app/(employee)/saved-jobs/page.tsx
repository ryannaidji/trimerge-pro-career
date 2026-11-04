"use client";

// Saved jobs for the signed-in candidate (#51).
// Author: Ryan Naidji
import { useEffect, useState } from "react";
import Link from "next/link";
import { authFetch } from "@/app/util/session";
import JobList, { type JobSummary } from "@/app/components/ui/JobList";

type Bookmark = { jobId?: { _id?: string; id?: string; title?: string; location?: string; department?: string; employmentType?: string; status?: string } | null };

export default function SavedJobsPage() {
  const [jobs, setJobs] = useState<JobSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    authFetch("/api/v1/bookmarks/my-bookmarks?limit=50")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Could not load your saved jobs");
        setJobs(
          ((data.bookmarks ?? []) as Bookmark[])
            .filter((b) => b.jobId)
            .map((b) => ({ id: String(b.jobId!._id ?? b.jobId!.id), title: b.jobId!.title, location: b.jobId!.location, department: b.jobId!.department, employmentType: b.jobId!.employmentType, status: b.jobId!.status }))
        );
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load your saved jobs"));
  }, []);

  return (
    <div className="tp-container" style={{ padding: "2.5rem 0", display: "grid", gap: "1.25rem", maxWidth: "52rem" }}>
      <header>
        <div className="tp-kicker">Candidate</div>
        <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.4rem)", margin: "0.3rem 0 0" }}>Saved jobs</h1>
      </header>
      {error && <p role="alert" style={{ color: "#991b1b", background: "#fef2f2", padding: "0.75rem 1rem", borderRadius: 10 }}>{error}</p>}
      {!jobs && !error && <p role="status">Loading…</p>}
      {jobs && jobs.length === 0 && (
        <div className="tp-card" style={{ padding: "1.5rem", display: "grid", gap: "0.75rem", justifyItems: "start" }}>
          <p style={{ margin: 0, color: "#475569" }}>You have not saved any job yet. Use &ldquo;Save job&rdquo; on a job to find it here later.</p>
          <Link href="/browse-jobs" className="tp-btn-primary">Browse jobs</Link>
        </div>
      )}
      {jobs && jobs.length > 0 && <JobList jobs={jobs} />}
    </div>
  );
}
