"use client";

// Keeps signed-in users signed in (#55). Access tokens last 15 minutes and many older
// components call the API (directly or through the Netlify Functions) with the stored token.
// This component refreshes the token shortly before it expires, when the tab becomes visible
// again, and checks every minute, so every caller always finds a valid token.
// Author: Ryan Naidji
import { useEffect } from "react";
import { endSession, msUntilExpiry, refreshSession } from "@/app/util/session";

const REFRESH_MARGIN_MS = 2 * 60 * 1000;

export default function SessionKeeper() {
  useEffect(() => {
    let stopped = false;

    const check = async () => {
      const remaining = msUntilExpiry();
      if (remaining === null || stopped) return; // not signed in
      if (remaining < REFRESH_MARGIN_MS) {
        const token = await refreshSession();
        if (!token && remaining <= 0) endSession();
      }
    };

    void check();
    const interval = window.setInterval(check, 60 * 1000);
    const onVisible = () => {
      if (document.visibilityState === "visible") void check();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      stopped = true;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return null;
}
