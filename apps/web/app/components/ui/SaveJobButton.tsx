"use client";

// Save / unsave a job for the signed-in candidate (#51). Uses aria-pressed so screen readers
// announce the state. Hidden for visitors and employers.
// Author: Ryan Naidji
import { useEffect, useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useUser } from "@/contexts/userContext/userContext";
import { authFetch } from "@/app/util/session";

// One shared request per page load for the list of saved job ids
let savedIdsPromise: Promise<Set<string>> | null = null;
export function loadSavedJobIds(force = false): Promise<Set<string>> {
  if (!savedIdsPromise || force) {
    savedIdsPromise = authFetch("/api/v1/bookmarks/my-bookmarks?limit=50")
      .then((r) => (r.ok ? r.json() : { bookmarks: [] }))
      .then((d: { bookmarks?: { jobId?: { _id?: string } | string }[] }) =>
        new Set((d.bookmarks ?? []).map((b) => (typeof b.jobId === "string" ? b.jobId : b.jobId?._id ?? "")).filter(Boolean))
      )
      .catch(() => new Set<string>());
  }
  return savedIdsPromise;
}

export default function SaveJobButton({ jobId }: { jobId?: string }) {
  const { state } = useUser();
  const isCandidate = !!state.user && state.user.accountType !== "EMPLOYER" && state.user.accountType !== "ADMIN";
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isCandidate || !jobId) return;
    let alive = true;
    loadSavedJobIds().then((ids) => alive && setSaved(ids.has(jobId)));
    return () => { alive = false; };
  }, [isCandidate, jobId]);

  if (!isCandidate || !jobId) return null;

  async function toggle() {
    setBusy(true);
    const res = saved
      ? await authFetch(`/api/v1/bookmarks/${jobId}`, { method: "DELETE" })
      : await authFetch("/api/v1/bookmarks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jobId }) });
    if (res.ok || res.status === 409) {
      setSaved(!saved);
      void loadSavedJobIds(true);
    }
    setBusy(false);
  }

  const Icon = saved ? BookmarkCheck : Bookmark;
  return (
    <button
      type="button"
      onClick={() => void toggle()}
      disabled={busy}
      aria-pressed={saved}
      className="tp-btn-secondary"
      style={{ padding: "0.6rem 1rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
    >
      <Icon size={16} aria-hidden="true" />
      {saved ? "Saved" : "Save job"}
    </button>
  );
}
