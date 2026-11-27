"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const STORAGE_KEY = "portfolio_vid";
const COOKIE_NAME = "portfolio_vid";
const REFERRER_STORAGE_KEY = "portfolio_ref_source";

/**
 * Gets or creates an anonymous, privacy-friendly first-party visitor identifier.
 * Stored in localStorage and a 1-year SameSite=Lax cookie.
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

/**
 * Detects visitor acquisition source (LinkedIn, GitHub, Resume, Google, etc.).
 * Persists during the session so subsequent subpage clicks preserve the origin.
 */
function getTrafficSource(): string {
  if (typeof window === "undefined") return "Direct";

  try {
    // 1. Check if source already stored for this active session
    const existingSource = sessionStorage.getItem(REFERRER_STORAGE_KEY);
    if (existingSource) return existingSource;

    // 2. Check URL search params (e.g. ?ref=resume or ?utm_source=linkedin)
    const params = new URLSearchParams(window.location.search);
    const refParam = params.get("ref") || params.get("utm_source") || params.get("source");
    if (refParam) {
      const lower = refParam.toLowerCase();
      let detected = "Direct";
      if (lower.includes("resume") || lower.includes("cv")) detected = "Resume PDF";
      else if (lower.includes("linkedin")) detected = "LinkedIn";
      else if (lower.includes("github")) detected = "GitHub";
      else detected = refParam.slice(0, 30);

      sessionStorage.setItem(REFERRER_STORAGE_KEY, detected);
      return detected;
    }

    // 3. Check document.referrer
    if (document.referrer) {
      const refUrl = new URL(document.referrer);
      const host = refUrl.hostname.toLowerCase();

      let detected = "Direct";
      if (host.includes("linkedin.com") || host.includes("lnkd.in")) detected = "LinkedIn";
      else if (host.includes("github.com")) detected = "GitHub";
      else if (host.includes("google.com") || host.includes("bing.com")) detected = "Search Engine";
      else if (host.includes("twitter.com") || host.includes("t.co") || host.includes("x.com")) detected = "Twitter / X";
      else if (host === window.location.hostname) detected = "Direct";
      else detected = host.replace(/^www\./, "").slice(0, 30);

      sessionStorage.setItem(REFERRER_STORAGE_KEY, detected);
      return detected;
    }

    sessionStorage.setItem(REFERRER_STORAGE_KEY, "Direct");
    return "Direct";
  } catch {
    return "Direct";
  }
}

/**
 * Manually tracks a custom event or modal view (e.g. Project Full Report opened, PDF downloaded, Section viewed).
 */
export function trackAnalyticsEvent(path: string, customReferrer?: string) {
  if (typeof window === "undefined") return;
  try {
    const visitorId = getOrCreateVisitorId();
    if (!visitorId) return;

    const referrer = customReferrer || getTrafficSource();
    const timeZone = Intl.DateTimeFormat?.().resolvedOptions?.().timeZone || "";

    const payload = JSON.stringify({
      visitor_id: visitorId,
      page_path: path,
      referrer,
      client_timezone: timeZone,
    });

    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([payload], { type: "application/json" });
      if (navigator.sendBeacon("/api/analytics/track", blob)) return;
    }

    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  } catch {}
}

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const lastTrackedRef = useRef<{ path: string; time: number }>({ path: "", time: 0 });

  useEffect(() => {
    if (!pathname) return;

    const currentHash = typeof window !== "undefined" ? window.location.hash : "";
    const targetPath = currentHash && pathname === "/" ? `/#${currentHash.replace(/^#/, "")}` : pathname;

    const now = Date.now();
    // Guard against React StrictMode duplicate execution (within 1.2s on same path)
    if (lastTrackedRef.current.path === targetPath && now - lastTrackedRef.current.time < 1200) {
      return;
    }

    lastTrackedRef.current = { path: targetPath, time: now };

    const visitorId = getOrCreateVisitorId();
    if (!visitorId) return;

    const referrer = getTrafficSource();
    const timeZone = Intl.DateTimeFormat?.().resolvedOptions?.().timeZone || "";

    const payload = JSON.stringify({
      visitor_id: visitorId,
      page_path: targetPath,
      referrer,
      client_timezone: timeZone,
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
    }).catch(() => {});
  }, [pathname]);

  // Listen to in-page hash transitions (e.g. #projects, #skills, #experience, #contact)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleHash = () => {
      const hash = window.location.hash;
      if (!hash) return;
      const cleanHash = hash.replace(/^#/, "");
      if (["home", "about", "skills", "projects", "experience", "contact"].includes(cleanHash)) {
        trackAnalyticsEvent(`/#${cleanHash}`);
      }
    };

    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  return null;
}
