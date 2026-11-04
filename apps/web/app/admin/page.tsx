"use client";

// Minimal admin dashboard on top of the existing admin API (#9).
// Users: search, filter, suspend/reactivate, delete. Jobs: search, filter, change status.
// Access is enforced by the API (requireRole('ADMIN')); this page only hides itself
// from non-admins for a better experience.
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/app/util/apiUrl";

type AdminUser = {
  _id: string;
  email: string;
  accountType: "EMPLOYER" | "TALENT" | "ADMIN";
  status: "PENDING_VERIFICATION" | "ACTIVE" | "SUSPENDED";
  isVerified: boolean;
  profile?: { firstName?: string; lastName?: string; companyName?: string };
  createdAt: string;
};

type AdminJob = {
  _id: string;
  title: string;
  location?: string;
  status: "OPEN" | "CLOSED" | "DRAFT";
  employmentType?: string;
  createdAt: string;
};

type Pagination = { page: number; totalPages: number; total: number };

const ACCOUNT_LABEL: Record<AdminUser["accountType"], string> = {
  TALENT: "Candidate",
  EMPLOYER: "Employer",
  ADMIN: "Admin",
};

const cell: React.CSSProperties = { padding: "0.7rem 0.6rem", borderBottom: "1px solid #e5e7eb", textAlign: "left", fontSize: "0.92rem", verticalAlign: "middle" };
const input: React.CSSProperties = { padding: "0.6rem 0.8rem", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.95rem", minWidth: 0 };
const smallBtn: React.CSSProperties = { padding: "0.4rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "white", cursor: "pointer", fontSize: "0.85rem" };

function getToken() {
  try {
    return localStorage.getItem("tm_token");
  } catch {
    return null;
  }
}

async function adminFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}/api/v1/admin${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}`, ...(init.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data?.message || `Request failed (${res.status})`) as Error & { status?: number };
    error.status = res.status;
    throw error;
  }
  return data as T;
}

function Pager({ p, onPage }: { p: Pagination | null; onPage: (page: number) => void }) {
  if (!p || p.totalPages <= 1) return null;
  return (
    <nav aria-label="Pagination" style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "1rem" }}>
      <button type="button" style={smallBtn} disabled={p.page <= 1} onClick={() => onPage(p.page - 1)}>Previous</button>
      <span style={{ fontSize: "0.9rem", color: "#475569" }}>Page {p.page} of {p.totalPages}</span>
      <button type="button" style={smallBtn} disabled={p.page >= p.totalPages} onClick={() => onPage(p.page + 1)}>Next</button>
    </nav>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"users" | "jobs">("users");
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  // Users state
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersPage, setUsersPage] = useState<Pagination | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [userType, setUserType] = useState("");
  const [userStatus, setUserStatus] = useState("");

  // Jobs state
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [jobsPage, setJobsPage] = useState<Pagination | null>(null);
  const [jobSearch, setJobSearch] = useState("");
  const [jobStatus, setJobStatus] = useState("");

  const [loading, setLoading] = useState(false);

  const handleError = useCallback(
    (err: unknown) => {
      const status = (err as { status?: number })?.status;
      if (status === 401) return router.replace("/login");
      if (status === 403) return router.replace("/unauthorized");
      setMessage({ kind: "error", text: err instanceof Error ? err.message : "Something went wrong" });
    },
    [router]
  );

  const loadUsers = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const q = new URLSearchParams({ page: String(page), limit: "20" });
        if (userSearch) q.set("search", userSearch);
        if (userType) q.set("accountType", userType);
        if (userStatus) q.set("status", userStatus);
        const data = await adminFetch<{ users: AdminUser[]; pagination: Pagination }>(`/users?${q}`);
        setUsers(data.users);
        setUsersPage(data.pagination);
      } catch (err) {
        handleError(err);
      } finally {
        setLoading(false);
      }
    },
    [userSearch, userType, userStatus, handleError]
  );

  const loadJobs = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const q = new URLSearchParams({ page: String(page), limit: "20" });
        if (jobSearch) q.set("search", jobSearch);
        if (jobStatus) q.set("status", jobStatus);
        const data = await adminFetch<{ jobs: AdminJob[]; pagination: Pagination }>(`/jobs?${q}`);
        setJobs(data.jobs);
        setJobsPage(data.pagination);
      } catch (err) {
        handleError(err);
      } finally {
        setLoading(false);
      }
    },
    [jobSearch, jobStatus, handleError]
  );

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    if (tab === "users") loadUsers();
    else loadJobs();
    // Reload when the tab or a filter select changes; text search runs on submit
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, userType, userStatus, jobStatus]);

  async function setStatusForUser(user: AdminUser, status: "ACTIVE" | "SUSPENDED") {
    try {
      await adminFetch(`/users/${user._id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
      setMessage({ kind: "ok", text: `${user.email} is now ${status === "ACTIVE" ? "active" : "suspended"}.` });
      loadUsers(usersPage?.page ?? 1);
    } catch (err) {
      handleError(err);
    }
  }

  async function deleteUser(user: AdminUser) {
    if (!window.confirm(`Delete ${user.email} and all related data? This cannot be undone.`)) return;
    try {
      await adminFetch(`/users/${user._id}`, { method: "DELETE" });
      setMessage({ kind: "ok", text: `${user.email} was deleted.` });
      loadUsers(usersPage?.page ?? 1);
    } catch (err) {
      handleError(err);
    }
  }

  async function setStatusForJob(job: AdminJob, status: AdminJob["status"]) {
    try {
      await adminFetch(`/jobs/${job._id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
      setMessage({ kind: "ok", text: `"${job.title}" is now ${status.toLowerCase()}.` });
      loadJobs(jobsPage?.page ?? 1);
    } catch (err) {
      handleError(err);
    }
  }

  const tabBtn = (key: "users" | "jobs", label: string) => (
    <button
      type="button"
      role="tab"
      aria-selected={tab === key}
      onClick={() => { setMessage(null); setTab(key); }}
      style={{ ...smallBtn, padding: "0.6rem 1.1rem", fontWeight: 600, background: tab === key ? "#1d4ed8" : "white", color: tab === key ? "white" : "#0f172a", borderColor: tab === key ? "#1d4ed8" : "#cbd5e1" }}
    >
      {label}
    </button>
  );

  return (
    <div className="tp-container" style={{ padding: "3rem 0", display: "grid", gap: "1.5rem" }}>
      <header>
        <div className="tp-kicker">Administration</div>
        <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", margin: "0.3rem 0 0" }}>Admin Dashboard</h1>
        <p style={{ color: "var(--tp-muted)", marginTop: "0.4rem" }}>Manage accounts and moderate job postings.</p>
      </header>

      <div role="tablist" aria-label="Admin sections" style={{ display: "flex", gap: "0.5rem" }}>
        {tabBtn("users", "Users")}
        {tabBtn("jobs", "Jobs")}
      </div>

      <div aria-live="polite">
        {message && (
          <p role={message.kind === "error" ? "alert" : "status"} style={{ padding: "0.75rem 1rem", borderRadius: "10px", background: message.kind === "ok" ? "#ecfdf5" : "#fef2f2", color: message.kind === "ok" ? "#065f46" : "#991b1b" }}>
            {message.text}
          </p>
        )}
      </div>

      <section className="tp-card" style={{ padding: "1.25rem", overflowX: "auto" }}>
        {tab === "users" ? (
          <>
            <form onSubmit={(e) => { e.preventDefault(); loadUsers(1); }} style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", marginBottom: "1rem" }}>
              <label className="sr-only" htmlFor="user-search">Search users</label>
              <input id="user-search" style={{ ...input, flex: "1 1 14rem" }} placeholder="Search by name, email or company" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} />
              <label className="sr-only" htmlFor="user-type">Account type</label>
              <select id="user-type" style={input} value={userType} onChange={(e) => setUserType(e.target.value)}>
                <option value="">All account types</option>
                <option value="TALENT">Candidates</option>
                <option value="EMPLOYER">Employers</option>
                <option value="ADMIN">Admins</option>
              </select>
              <label className="sr-only" htmlFor="user-status">Status</label>
              <select id="user-status" style={input} value={userStatus} onChange={(e) => setUserStatus(e.target.value)}>
                <option value="">All statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="PENDING_VERIFICATION">Pending verification</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
              <button type="submit" className="tp-btn-primary">Search</button>
            </form>

            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "44rem" }}>
              <caption className="sr-only">Users</caption>
              <thead>
                <tr>
                  <th scope="col" style={cell}>Name</th>
                  <th scope="col" style={cell}>Email</th>
                  <th scope="col" style={cell}>Type</th>
                  <th scope="col" style={cell}>Status</th>
                  <th scope="col" style={cell}>Joined</th>
                  <th scope="col" style={cell}><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td style={cell}>{[u.profile?.firstName, u.profile?.lastName].filter(Boolean).join(" ") || "—"}{u.profile?.companyName ? <div style={{ color: "#64748b", fontSize: "0.8rem" }}>{u.profile.companyName}</div> : null}</td>
                    <td style={cell}>{u.email}</td>
                    <td style={cell}>{ACCOUNT_LABEL[u.accountType]}</td>
                    <td style={cell}>{u.status.replace("_", " ").toLowerCase()}</td>
                    <td style={cell}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td style={{ ...cell, whiteSpace: "nowrap" }}>
                      {u.accountType !== "ADMIN" && (
                        <div style={{ display: "flex", gap: "0.4rem" }}>
                          {u.status === "SUSPENDED" ? (
                            <button type="button" style={smallBtn} onClick={() => setStatusForUser(u, "ACTIVE")}>Reactivate</button>
                          ) : (
                            <button type="button" style={smallBtn} onClick={() => setStatusForUser(u, "SUSPENDED")}>Suspend</button>
                          )}
                          <button type="button" style={{ ...smallBtn, color: "#b91c1c", borderColor: "#fecaca" }} onClick={() => deleteUser(u)} aria-label={`Delete ${u.email}`}>Delete</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {!loading && users.length === 0 && (
                  <tr><td colSpan={6} style={{ ...cell, textAlign: "center", color: "#64748b" }}>No users found.</td></tr>
                )}
              </tbody>
            </table>
            <Pager p={usersPage} onPage={loadUsers} />
          </>
        ) : (
          <>
            <form onSubmit={(e) => { e.preventDefault(); loadJobs(1); }} style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", marginBottom: "1rem" }}>
              <label className="sr-only" htmlFor="job-search">Search jobs</label>
              <input id="job-search" style={{ ...input, flex: "1 1 14rem" }} placeholder="Search by title, description or location" value={jobSearch} onChange={(e) => setJobSearch(e.target.value)} />
              <label className="sr-only" htmlFor="job-status">Status</label>
              <select id="job-status" style={input} value={jobStatus} onChange={(e) => setJobStatus(e.target.value)}>
                <option value="">All statuses</option>
                <option value="OPEN">Open</option>
                <option value="DRAFT">Draft</option>
                <option value="CLOSED">Closed</option>
              </select>
              <button type="submit" className="tp-btn-primary">Search</button>
            </form>

            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "40rem" }}>
              <caption className="sr-only">Jobs</caption>
              <thead>
                <tr>
                  <th scope="col" style={cell}>Title</th>
                  <th scope="col" style={cell}>Location</th>
                  <th scope="col" style={cell}>Type</th>
                  <th scope="col" style={cell}>Posted</th>
                  <th scope="col" style={cell}>Status</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((j) => (
                  <tr key={j._id}>
                    <td style={cell}>{j.title}</td>
                    <td style={cell}>{j.location || "—"}</td>
                    <td style={cell}>{j.employmentType?.replace("_", " ").toLowerCase() || "—"}</td>
                    <td style={cell}>{new Date(j.createdAt).toLocaleDateString()}</td>
                    <td style={cell}>
                      <label className="sr-only" htmlFor={`status-${j._id}`}>Status of {j.title}</label>
                      <select id={`status-${j._id}`} style={{ ...input, padding: "0.35rem 0.5rem" }} value={j.status} onChange={(e) => setStatusForJob(j, e.target.value as AdminJob["status"])}>
                        <option value="OPEN">Open</option>
                        <option value="DRAFT">Draft</option>
                        <option value="CLOSED">Closed</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {!loading && jobs.length === 0 && (
                  <tr><td colSpan={5} style={{ ...cell, textAlign: "center", color: "#64748b" }}>No jobs found.</td></tr>
                )}
              </tbody>
            </table>
            <Pager p={jobsPage} onPage={loadJobs} />
          </>
        )}
        {loading && <p role="status" style={{ marginTop: "1rem", color: "#64748b" }}>Loading…</p>}
      </section>
    </div>
  );
}
