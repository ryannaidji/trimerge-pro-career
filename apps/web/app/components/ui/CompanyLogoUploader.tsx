"use client";

// Company logo upload for employers (#53). The API validates the real file type (PNG/JPG/WEBP)
// and size (3 MB); the logo is public because it is shown on job postings.
// Author: Ryan Naidji
import { useState } from "react";
import { authFetch } from "@/app/util/session";

export default function CompanyLogoUploader({ initialUrl, companyName }: { initialUrl?: string; companyName: string }) {
  const [url, setUrl] = useState(initialUrl || "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  async function upload(file: File | null) {
    if (!file) return;
    setBusy(true);
    setMessage(null);
    try {
      const fd = new FormData();
      fd.append("logo", file);
      const res = await authFetch("/api/v1/settings/company-logo", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Could not upload the logo");
      setUrl(data.logo?.logoUrl || "");
      setMessage({ kind: "ok", text: "Logo updated. It now appears on your job postings." });
    } catch (err) {
      setMessage({ kind: "error", text: err instanceof Error ? err.message : "Could not upload the logo" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-labelledby="logo-heading" style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap", background: "white", border: "1px solid #e2e8f0", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: "1.25rem" }}>
      <div style={{ width: 72, height: 72, borderRadius: 12, border: "1px solid #e2e8f0", display: "grid", placeItems: "center", overflow: "hidden", background: "#f8fafc", flexShrink: 0 }}>
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element -- logo is served by the API, not the Next image optimizer
          <img src={url} alt={`${companyName} logo`} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
        ) : (
          <span aria-hidden="true" style={{ fontWeight: 800, fontSize: "1.5rem", color: "#475569" }}>{companyName.charAt(0).toUpperCase()}</span>
        )}
      </div>
      <div style={{ display: "grid", gap: "0.4rem" }}>
        <h3 id="logo-heading" style={{ margin: 0, fontSize: "1rem" }}>Company logo</h3>
        <label style={{ fontSize: "0.88rem", color: "#334155", display: "grid", gap: 4 }}>
          {url ? "Replace logo" : "Upload a logo"} (PNG, JPG or WEBP, up to 3 MB)
          <input type="file" accept="image/png,image/jpeg,image/webp" disabled={busy} onChange={(e) => void upload(e.target.files?.[0] ?? null)} />
        </label>
        <div aria-live="polite">
          {busy && <span role="status">Uploading…</span>}
          {message && <span role={message.kind === "error" ? "alert" : "status"} style={{ color: message.kind === "ok" ? "#065f46" : "#991b1b", fontSize: "0.88rem" }}>{message.text}</span>}
        </div>
      </div>
    </section>
  );
}
