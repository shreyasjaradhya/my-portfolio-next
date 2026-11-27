import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// In-memory rate limiting map: visitor_id -> { count, expiresAt }
const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();
const RATE_LIMIT_MAX = 40; // Max 40 events per minute per visitor
const WINDOW_MS = 60 * 1000;

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.expiresAt) {
    rateLimitMap.set(key, { count: 1, expiresAt: now + WINDOW_MS });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return true;
  }

  entry.count++;
  return false;
}

// Clean up old rate limit entries every 10 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of rateLimitMap.entries()) {
      if (now > v.expiresAt) rateLimitMap.delete(k);
    }
  }, 10 * 60 * 1000).unref?.();
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const { visitor_id, page_path, referrer } = body;

    // Validate visitor_id (8 to 64 alphanumeric characters, underscores, hyphens)
    if (!visitor_id || typeof visitor_id !== "string" || !/^[a-zA-Z0-9_-]{8,64}$/.test(visitor_id)) {
      return NextResponse.json({ error: "Invalid visitor identifier" }, { status: 400 });
    }

    // Validate page_path (max 200 characters, must start with /)
    if (!page_path || typeof page_path !== "string" || page_path.length > 200 || !page_path.startsWith("/")) {
      return NextResponse.json({ error: "Invalid page path" }, { status: 400 });
    }

    // Apply rate limiting by visitor_id
    if (isRateLimited(visitor_id)) {
      return NextResponse.json({ error: "Too many tracking events" }, { status: 429 });
    }

    // Sanitize path (strip query strings / hash for privacy & grouping)
    const sanitizedPath = page_path.split("?")[0].split("#")[0].slice(0, 150);

    // Sanitize Referrer (LinkedIn, GitHub, Resume, Google, Direct, etc.)
    const sanitizedReferrer =
      typeof referrer === "string" && referrer.trim().length > 0
        ? referrer.trim().slice(0, 60)
        : "Direct";

    // Extract Location & Device from request headers (Vercel / Cloudflare edge headers)
    const headers = req.headers;
    const rawCountry = headers.get("x-vercel-ip-country") || headers.get("cf-ipcountry") || "Unknown";
    const sanitizedCountry = rawCountry.slice(0, 4).toUpperCase();

    const rawCity = headers.get("x-vercel-ip-city");
    const sanitizedCity = rawCity ? decodeURIComponent(rawCity).slice(0, 60) : "Unknown";

    const userAgent = headers.get("user-agent") || "";
    const isMobile = /mobile|android|iphone|ipad|tablet/i.test(userAgent);
    const deviceType = isMobile ? "Mobile" : "Desktop";

    // Determine admin status SECURELY on the server using verified auth session
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();
    const isAdmin = Boolean(authData?.user?.email);

    // Try full insert with location, referrer, and device fields
    const { error: insertError } = await supabase.from("website_analytics").insert({
      visitor_id,
      page_path: sanitizedPath,
      is_admin: isAdmin,
      referrer: sanitizedReferrer,
      country: sanitizedCountry,
      city: sanitizedCity,
      device_type: deviceType,
      visited_at: new Date().toISOString(),
    });

    if (insertError) {
      // If table doesn't have the new columns yet (code 42703), fallback to basic insert
      if (insertError.code === "42703" || insertError.message?.includes("column")) {
        const { error: basicError } = await supabase.from("website_analytics").insert({
          visitor_id,
          page_path: sanitizedPath,
          is_admin: isAdmin,
          visited_at: new Date().toISOString(),
        });

        if (!basicError) {
          return NextResponse.json({ success: true, recorded: true, fallback: true });
        }
      }

      // Graceful fallback if table does not exist yet (code 42P01 in postgres)
      if (insertError.code === "42P01" || insertError.message?.includes("does not exist")) {
        return NextResponse.json({
          success: true,
          recorded: false,
          note: "Analytics table pending migration",
        });
      }

      console.warn("Analytics insertion warning:", insertError.message);
      return NextResponse.json({ success: false, error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, recorded: true, isAdmin });
  } catch (err: any) {
    console.error("Unhandled analytics tracking error:", err);
    return NextResponse.json({ error: "Internal tracking error" }, { status: 500 });
  }
}
