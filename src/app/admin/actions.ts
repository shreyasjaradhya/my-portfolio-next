"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/supabase/adminAuth";
import { invalidateDashboardCache } from "./dashboardData";

async function assertAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user || !user.email || !isAdminEmail(user.email)) {
    throw new Error("Unauthorized: Only authenticated admins can perform this action.");
  }

  return user;
}

export async function revalidateHomepage() {
  await assertAdminUser();

  // Invalidate in-memory dashboard cache so counts stay fresh
  invalidateDashboardCache();

  // Revalidate the root homepage and admin page
  revalidatePath("/", "page");
  revalidatePath("/admin", "page");
}

export async function invalidateDashboard() {
  await assertAdminUser();

  invalidateDashboardCache();
  revalidatePath("/admin", "page");
}
