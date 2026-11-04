"use client";

// Employer dashboard overview (#54): key numbers from GET /dashboard/employer/summary.
// Numbers are written as text with labels (not colour only) for accessibility.
// Author: Ryan Naidji
import { useEffect, useState } from "react";
import { authFetch } from "@/app/util/session";

type Summary = {
  openJobs: number; draftJobs: number; closedJobs: number;
  totalApplications: number; pendingApplications: number; reviewedApplications: number;
  shortlistedApplications: number; rejectedApplications: number; hiredApplications: number;
};

export default function EmployerOverview() {
  const [s, setS] = useState<Summary | null>(null);

  useEffect(() => {
    authFetch("/api/v1/dashboard/employer/summary")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.summary && setS(d.summary))
      .catch(() => {});
  }, []);

  if (!s) return null;
  const tiles: [string, number][] = [
    ["Open jobs", s.openJobs],
    ["Drafts", s.draftJobs],
    ["Applications", s.totalApplications],
    ["New", s.pendingApplications],
    ["Shortlisted", s.shortlistedApplications],
    ["Hired", s.hiredApplications],
  ];

  return (
    <section aria-labelledby="overview-heading" style={{ marginBottom: "1.25rem" }}>
      <h2 id="overview-heading" className="sr-only">Overview</h2>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(8.5rem, 1fr))", gap: "0.75rem" }}>
        {tiles.map(([label, value]) => (
          <li key={label} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, padding: "0.85rem 1rem" }}>
            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0f172a" }}>{value}</div>
            <div style={{ fontSize: "0.85rem", color: "#475569" }}>{label}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}
