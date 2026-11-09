"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { invalidateDashboardCache } from "./dashboardData";

export async function revalidateHomepage() {
  const supabase = await createClient();
  
  // Verify authentication securely via the server-side Supabase client
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Unauthorized: Only authenticated admins can trigger cache invalidation.");
  }

  // Invalidate in-memory dashboard cache so counts stay fresh
  invalidateDashboardCache();

  // Revalidate the root homepage
  revalidatePath("/", "page");
  revalidatePath("/admin", "page");
}

export async function invalidateDashboard() {
  invalidateDashboardCache();
  revalidatePath("/admin", "page");
}
