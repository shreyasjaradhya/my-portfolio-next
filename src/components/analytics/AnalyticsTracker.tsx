"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const STORAGE_KEY = "portfolio_vid";
const COOKIE_NAME = "portfolio_vid";

/**
 * Gets or creates an anonymous, privacy-friendly first-party visitor identifier.
 * Stored in localStorage and a 1-year SameSite=Lax cookie.
 * Does not collect PII, passwords, emails, or invasive hardware fingerprints.
 */
function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "";

  try {
    // 1. Check localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && /^[a-zA-Z0-9_-]{8,64}$/.test(stored)) {
      return stored;
    }

    // 2. Check Cookie
    const match = document.cookie.match(new RegExp(`(^|;\\s*)${COOKIE_NAME}=([^;]+)`));
    if (match && match[2] && /^[a-zA-Z0-9_-]{8,64}$/.test(match[2])) {
      localStorage.setItem(STORAGE_KEY, match[2]);
      return match[2];
    }

    // 3. Generate new identifier
    const newId =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : "vid_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

    localStorage.setItem(STORAGE_KEY, newId);
    document.cookie = `${COOKIE_NAME}=${newId}; path=/; max-age=31536000; SameSite=Lax`;
    return newId;
  } catch {
    return "anon_" + Math.random().toString(36).slice(2, 12);
  }
}

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const lastTrackedRef = useRef<{ path: string; time: number }>({ path: "", time: 0 });

  useEffect(() => {
    if (!pathname) return;

    const now = Date.now();
    // Guard against React StrictMode duplicate execution (within 1.2s on same path)
    if (lastTrackedRef.current.path === pathname && now - lastTrackedRef.current.time < 1200) {
      return;
    }

    lastTrackedRef.current = { path: pathname, time: now };

    const visitorId = getOrCreateVisitorId();
    if (!visitorId) return;

    const payload = JSON.stringify({
      visitor_id: visitorId,
      page_path: pathname,
    });

    // Send tracking beacon asynchronously
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([payload], { type: "application/json" });
      const sent = navigator.sendBeacon("/api/analytics/track", blob);
      if (sent) return;
    }

    // Fallback: fetch with keepalive
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {
      // Non-blocking fail-safe: ignore network errors so user experience is never impacted
    });
  }, [pathname]);

  return null;
}
