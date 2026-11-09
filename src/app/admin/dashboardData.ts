import { createClient } from "@/lib/supabase/server";
import type { Message } from "@/lib/supabase/types";

export interface DashboardStats {
  projectsCount: number;
  skillsCount: number;
  experiencesCount: number;
  educationCount: number;
  certificationsCount: number;
  achievementsCount: number;
  testimonialsCount: number;
  totalMessagesCount: number;
  unreadMessagesCount: number;
  recentMessages: Message[];
  fetchedAt: number;
}

// In-memory server cache with 30-second TTL
let cachedStats: DashboardStats | null = null;
const CACHE_TTL_MS = 30 * 1000;

export function invalidateDashboardCache() {
  cachedStats = null;
}

export async function getDashboardStats(forceFresh = false): Promise<DashboardStats> {
  const now = Date.now();
  if (!forceFresh && cachedStats && now - cachedStats.fetchedAt < CACHE_TTL_MS) {
    return cachedStats;
  }

  const supabase = await createClient();

  let projectsCount = 0;
  let skillsCount = 0;
  let experiencesCount = 0;
  let educationCount = 0;
  let certificationsCount = 0;
  let achievementsCount = 0;
  let testimonialsCount = 0;
  let totalMessagesCount = 0;
  let unreadMessagesCount = 0;
  let recentMessages: Message[] = [];

  try {
    const results = await Promise.allSettled([
      supabase.from("projects").select("*", { count: "exact", head: true }),
      supabase.from("skills").select("*", { count: "exact", head: true }),
      supabase.from("experiences").select("*", { count: "exact", head: true }),
      supabase.from("education").select("*", { count: "exact", head: true }),
      supabase.from("certifications").select("*", { count: "exact", head: true }),
      supabase.from("achievements").select("*", { count: "exact", head: true }),
      supabase.from("testimonials").select("*", { count: "exact", head: true }),
      supabase.from("messages").select("*", { count: "exact", head: true }),
      supabase.from("messages").select("*", { count: "exact", head: true }).eq("status", "unread"),
      supabase.from("messages").select("*").order("created_at", { ascending: false }).limit(5),
    ]);

    if (results[0].status === "fulfilled") projectsCount = results[0].value.count ?? 0;
    if (results[1].status === "fulfilled") skillsCount = results[1].value.count ?? 0;
    if (results[2].status === "fulfilled") experiencesCount = results[2].value.count ?? 0;
    if (results[3].status === "fulfilled") educationCount = results[3].value.count ?? 0;
    if (results[4].status === "fulfilled") certificationsCount = results[4].value.count ?? 0;
    if (results[5].status === "fulfilled") achievementsCount = results[5].value.count ?? 0;
    if (results[6].status === "fulfilled") testimonialsCount = results[6].value.count ?? 0;
    if (results[7].status === "fulfilled") totalMessagesCount = results[7].value.count ?? 0;
    if (results[8].status === "fulfilled") unreadMessagesCount = results[8].value.count ?? 0;
    if (results[9].status === "fulfilled" && results[9].value.data) {
      recentMessages = results[9].value.data as Message[];
    }
  } catch (err) {
    console.error("Failed to load dashboard counts:", err);
  }

  const freshData: DashboardStats = {
    projectsCount,
    skillsCount,
    experiencesCount,
    educationCount,
    certificationsCount,
    achievementsCount,
    testimonialsCount,
    totalMessagesCount,
    unreadMessagesCount,
    recentMessages,
    fetchedAt: now,
  };

  cachedStats = freshData;
  return freshData;
}
