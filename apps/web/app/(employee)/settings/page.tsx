"use client";

// Account settings (#57, #58): change password and delete the account.
// Works for candidates and employers (linked from both account menus).
// Author: Ryan Naidji
import { useState } from "react";
import { authFetch } from "@/app/util/session";
import { API_URL } from "@/app/util/apiUrl";

const field: React.CSSProperties = { padding: "0.7rem 0.9rem", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: "1rem", width: "100%", boxSizing: "border-box" };
const labelStyle: React.CSSProperties = { display: "grid", gap: "0.35rem", fontWeight: 700, fontSize: "0.9rem" };

function Message({ m }: { m: { kind: "ok" | "error"; text: string } | null }) {
  return (
    <div aria-live="polite">
      {m && (
        <p role={m.kind === "error" ? "alert" : "status"} style={{ margin: 0, padding: "0.7rem 0.9rem", borderRadius: 10, background: m.kind === "ok" ? "#ecfdf5" : "#fef2f2", color: m.kind === "ok" ? "#065f46" : "#991b1b" }}>
          {m.text}
        </p>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pwMsg, setPwMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [pwBusy, setPwBusy] = useState(false);

  const [deletePassword, setDeletePassword] = useState("");
  const [delMsg, setDelMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [delBusy, setDelBusy] = useState(false);

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg(null);
    if (next.length < 12) return setPwMsg({ kind: "error", text: "The new password must be at least 12 characters." });
    if (next !== confirm) return setPwMsg({ kind: "error", text: "The new passwords do not match." });
    setPwBusy(true);
    try {
      const res = await authFetch("/api/v1/settings/change-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Could not change your password");
      // Changing the password signs out every device (refresh tokens revoked). Sign this
      // device back in with the new password so the current session keeps working.
      try {
        const email = (JSON.parse(localStorage.getItem("tm_user") || "{}") as { email?: string }).email;
        if (email) {
          const login = await fetch(`${API_URL}/api/v1/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password: next }),
          });
          const tokens = await login.json().catch(() => ({}));
          if (login.ok && tokens.accessToken) {
            localStorage.setItem("tm_token", tokens.accessToken);
            if (tokens.refreshToken) localStorage.setItem("tm_refresh", tokens.refreshToken);
          }
        }
      } catch { /* the user can still sign in again manually */ }
      setCurrent(""); setNext(""); setConfirm("");
      setPwMsg({ kind: "ok", text: "Your password has been changed." });
    } catch (err) {
      setPwMsg({ kind: "error", text: err instanceof Error ? err.message : "Could not change your password" });
    } finally {
      setPwBusy(false);
    }
  }

  async function deleteAccount(e: React.FormEvent) {
    e.preventDefault();
    setDelMsg(null);
    if (!window.confirm("Delete your account permanently? Your profile, documents, saved jobs and applications will be removed. This cannot be undone.")) return;
    setDelBusy(true);
    try {
      const res = await authFetch("/api/v1/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Could not delete your account");
      try { ["tm_token", "tm_refresh", "tm_user"].forEach((k) => localStorage.removeItem(k)); } catch { /* ignore */ }
      window.location.assign("/?account=deleted");
    } catch (err) {
      setDelMsg({ kind: "error", text: err instanceof Error ? err.message : "Could not delete your account" });
      setDelBusy(false);
    }
  }

  return (
    <div className="tp-container" style={{ padding: "2.5rem 0", display: "grid", gap: "1.25rem", maxWidth: "40rem" }}>
      <header>
        <div className="tp-kicker">Account</div>
        <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.4rem)", margin: "0.3rem 0 0" }}>Settings</h1>
      </header>

      <form onSubmit={changePassword} className="tp-card" style={{ padding: "1.5rem", display: "grid", gap: "1rem" }} aria-labelledby="pw-heading">
        <h2 id="pw-heading" style={{ margin: 0, fontSize: "1.2rem" }}>Change password</h2>
        <label style={labelStyle}>Current password<input style={field} type="password" autoComplete="current-password" required value={current} onChange={(e) => setCurrent(e.target.value)} /></label>
        <label style={labelStyle}>New password (at least 12 characters)<input style={field} type="password" autoComplete="new-password" required minLength={12} value={next} onChange={(e) => setNext(e.target.value)} /></label>
        <label style={labelStyle}>Confirm new password<input style={field} type="password" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} /></label>
        <Message m={pwMsg} />
        <div><button type="submit" className="tp-btn-primary" disabled={pwBusy}>{pwBusy ? "Saving…" : "Change password"}</button></div>
      </form>

      <form onSubmit={deleteAccount} className="tp-card" style={{ padding: "1.5rem", display: "grid", gap: "1rem", borderColor: "#fecaca" }} aria-labelledby="delete-heading">
        <h2 id="delete-heading" style={{ margin: 0, fontSize: "1.2rem", color: "#991b1b" }}>Delete account</h2>
        <p style={{ margin: 0, color: "#475569" }}>
          This permanently removes your account and its data: profile, uploaded documents, saved jobs and applications
          (employers: your company profile and job postings).
        </p>
        <label style={labelStyle}>Confirm with your password<input style={field} type="password" autoComplete="current-password" required value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} /></label>
        <Message m={delMsg} />
        <div>
          <button type="submit" disabled={delBusy} style={{ padding: "0.75rem 1.25rem", borderRadius: 12, border: "1px solid #b91c1c", background: "#b91c1c", color: "white", fontWeight: 700, cursor: "pointer" }}>
            {delBusy ? "Deleting…" : "Delete my account"}
          </button>
        </div>
      </form>
    </div>
  );
}
