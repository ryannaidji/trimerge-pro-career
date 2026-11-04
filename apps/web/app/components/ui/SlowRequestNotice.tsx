"use client";

import { useEffect, useState } from "react";

/**
 * Shows a reassuring message when a request takes longer than `delayMs` (#32).
 * Free hosting tiers (e.g. Render) put the API to sleep when idle; the first request
 * can then take 30-60 seconds, and without feedback users think the site is broken.
 */
export default function SlowRequestNotice({ active, delayMs = 4000 }: { active: boolean; delayMs?: number }) {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    if (!active) {
      setSlow(false);
      return;
    }
    const timer = setTimeout(() => setSlow(true), delayMs);
    return () => clearTimeout(timer);
  }, [active, delayMs]);

  if (!active || !slow) return null;

  return (
    <p
      role="status"
      style={{
        margin: 0,
        padding: "0.75rem 1rem",
        borderRadius: "12px",
        background: "#eff6ff",
        border: "1px solid #bfdbfe",
        color: "#1e3a8a",
        fontSize: "0.9rem",
      }}
    >
      Still working… The server may be starting up, which can take up to a minute. Please keep this page open.
    </p>
  );
}
