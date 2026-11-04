"use client";

// Simple accessible list of job cards used by Saved jobs (#51) and Recommended jobs (#52).
// Author: Ryan Naidji
import Link from "next/link";
import { departmentLabel } from "@/app/util/departments";
import SaveJobButton from "./SaveJobButton";

export type JobSummary = {
  id: string;
  title?: string;
  location?: string;
  department?: string;
  employmentType?: string;
  status?: string;
  reason?: string;
};

const pretty = (s?: string) => (s ? s.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : "");

export default function JobList({ jobs }: { jobs: JobSummary[] }) {
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "0.9rem" }}>
      {jobs.map((j) => (
        <li key={j.id} className="tp-card" style={{ padding: "1.1rem 1.25rem", display: "grid", gap: "0.6rem" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "1.1rem" }}>{j.title || "Untitled job"}</h2>
            <p style={{ margin: "0.25rem 0 0", color: "#475569", fontSize: "0.92rem" }}>
              {[departmentLabel(j.department), j.location, pretty(j.employmentType)].filter(Boolean).join(" · ")}
              {j.status && j.status !== "OPEN" && <strong style={{ color: "#92400E" }}> · No longer accepting applications</strong>}
            </p>
            {j.reason && <p style={{ margin: "0.35rem 0 0", fontSize: "0.88rem", color: "#1e3a8a" }}>{j.reason}</p>}
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {(!j.status || j.status === "OPEN") && (
              <Link href={`/browse-jobs?details=${encodeURIComponent(j.id)}`} className="tp-btn-primary" style={{ padding: "0.6rem 1rem" }}>
                View and apply<span className="sr-only">: {j.title}</span>
              </Link>
            )}
            <SaveJobButton jobId={j.id} />
          </div>
        </li>
      ))}
    </ul>
  );
}
